---
title: "Mask2Former"
paperTitle: "Masked-attention Mask Transformer for Universal Image Segmentation"
paperYear: 2022
topic: semantic-segmentation
subtopic: general
date: 2025-03-24
---

![mask2former_arch](/images/notes/mask2former_arch.webp)

## High-Level Overview

This is a follow-up paper from the MaskFormer authors where they address some of the limitations that they saw with MaskFormer. I.e:

- It performs worse than on instance segmentation compared to specialized models
- It performs poorly on small objects
- It typically takes much longer to train compared to specialized architectures (300 epochs vs 72, for example)

They address these issues by making some changes to the MaskFormer architecture and training procedure:

- The use of masked attention to only focus on regions around centers of segments instead of the whole image, leading to faster convergence and better metric performance
- They incorporate the use of multi-scale, high resolution features to help with smaller object regions
- Various optimization improvements such as removing the use of dropout and switching the order of self-attention and cross-attention (cross-attention, first), which makes the queries learnable
- Finally, the loss on the proposed masks is calculated for a handful of randomly sampled points instead of the whole mask which leads to $3\times$ lower memory cost while maintaining good performance

They evaluate on COCO, Cityscapes, AD20K, and Mapillary Vistas, achieving higher scores than specialized architectures, all while using the exact same architecture for each segmentation task (semantic, instance, and panoptic).

## Architecture Design

The same meta-architecture is still used from MaskFormer. I.e., we have:

- A backbone which generates image features
- A decoder which gradually upsamples the image features to the per-pixel level, creating per-pixel embeddings
- A transformer decoder which processes $N$ segment queries and the image features to create the $N$ segment embeddings which are a $C$-dimensional embedding vectors
- A method of using the segment embeddings to predict the class for each segment
- A method of combining pixel-level embeddings and the segment embeddings to create the binary mask for each segment

Now we'll get into the specific details and how Mask2Former differs from MaskFormer.

### Transformer Decoder with Masked Attention

Compared to MaskFormer, the main changes in the transformer decoder are the use of masked attention, the use of multi-scale, high resolution features, and a handful of optimization tricks.

#### Masked Attention

The main idea is to only compute attention within the foreground region of the binary mask for each segment.

So, in the case of the original cross-attention with a residual connection, we have:

$X_{l} = softmax(Q_{l}K_{l}^{\intercal})V_{l} + X_{l - 1}$

- $X_{l}$ is the $N$ query vectors for layer $l$ with shape $(N\times C)$
- $Q_{l}$ is the query matrix derived from passing $X_{l - 1}$ through the query projection $f_{Q}(X_{l - 1})$
- $K_{l}$ is the key matrix of shape $(H_{l}*W_{l}\times C)$ derived from passing image features through the key projection $f_{K}(\cdot)$
- $V_{l}$ is the value matrix of shape $(H_{l}*W_{l}\times C)$ derived from passing image features through the value projection $f_{V}(\cdot)$

Now with masked attention, we have:

$X_{l} = softmax(\mathcal{M}_{l - 1} + Q_{l}K_{l}^{\intercal})V_{l} + X_{l - 1}$

Where the attention mask, $\mathcal{M}_{l - 1}$, is modifying the attention map such that some locations may be ignored.

How? Well $\mathcal{M}_{l - 1}$ at the position $(x,y)$ is:

$`\mathcal{M}_{l - 1}(x,y) = \begin{cases}
0 & {M_{l - 1}(x,y) = 1} \\
{- \infty} & {otherwise}
\end{cases}`$

Where $M_{l - 1} \in {0,1}^{N\times H_{l}*W_{l}}$ is the predicted binary mask computed from the $N$ internal segment query features at decoder layer $l - 1$, thresholded at $0.5$.

More specifically, we're taking the $N$ query embedding vectors at decoder layer $l - 1$ and passing them through the binary mask generating layers that were only used at the end of the transformer decoder module of MaskFormer.

According to the MMDetection implementation, the binary mask generation is done by passing the $N$ query embedding vectors through three linear layers with ReLU activations after the first two. The features come in with some embedding dimension which is maintained until the last linear layer which can optionally project it to a different length of embedding dimension. Although looking at some configs, it looks like they might be set to the same value of $256$.

The predicted mask is then bilinearly upsampled to match the spatial resolution of the key matrix, $K_{l}$. Finally, a sigmoid activation is applied and the $0.5$ thresholding happens, setting the values to either $0$ or $1$. And then those values inform the values in $\mathcal{M}_{l - 1}(x,y)$.

So then, $\mathcal{M}_{l - 1}$ is added to the attention weights produced by the product of the query and key matrices. In practice, what happens is that $\mathcal{M}_{l - 1}$ is a matrix of bools where True represents the $0$ and False represents the $- \infty$ and the attention mask is just passed as a parameter to `nn.MultiheadAttention.forward` which will only consider attention calculations within the True region.

The authors note that for the first layer $X_{1}$, the binary mask being considered, $M_{0}$ is produced by passing the initial, unprocessed query vectors through the mask prediction linear layers where those query vectors effectively act as $X_{0}$.

Wow, that was a lot, but it feels clear now!

#### Multi-Scale, High-Resolution Features

The authors note that high-resolution feature maps are often critical to detecting smaller objects, but simply using a high-resolution feature map throughout the whole network can be computationally demanding. Therefore, the authors use a set of increasing feature map sizes. I will elaborate in more detail next.

First, one distinction from MaskFormer is that the image features being used in the transformer decoder cross-attention are the features from the pixel-level decoder as opposed to the direct output of the pixel-level backbone.

Second, they also use multiple features from the pixel-level decoder, of increasing resolution. They use the features that are at $\frac{1}{32},\frac{1}{16},\frac{1}{8}$. So the first transformer decoder block would use the $\frac{1}{32}$ scale features for the masked cross-attention, the second block would use the $\frac{1}{16}$ features, and the third block would use the $\frac{1}{8}$ features. Then, for the next block, you wrap back around and use the $\frac{1}{32}$ features and so on.

So, repeating this 3-layer sequence some number of times, $L$, results in $3L$ number of decoder blocks.

One interesting detail is that before a pixel-level decoder feature is used, a sinusoidal positional embedding is added, and then a learnable scale-level embedding is added as well. The scale-level embedding is a trick picked up from the Deformable DETR paper. The purpose is to help the transformer decoder also learn to identify which feature scale/resolution the incoming pixel-level decoder features belong to.

#### Optimization Improvements

First, the order of self-attention and cross-attention are inverted. In the original transformer, self-attention is first applied to the input queries and then the cross-attention happens. The authors argue that because there is not interaction with the image features in the first self-attention, it may not produce as good of features compared to the first layer being the cross-attention which does facilitate interactions between the queries and the image features.

Second, in the original transformer, the initial input query vectors ($X_{0}$) are initialized to all zeroes and then a learnable positional embedding is added before being passed into the decoder. The authors change this so that the query vectors themselves are also learnable. They still use the learnable positional embedding as well.

Finally, the authors find that dropout in the decoder seems to produce worse performance, and so they remove its use.

### Training Efficiency Tricks

One issue that the authors try to remedy is the fact that these universal architectures tend to have large GPU memory requirements in part because of the set of higher resolution binary masks being predicted. They mention that with MaskFormer, only one image can fit on a 32GB GPU (takes up 18GB).

So, what the authors do to fix this is to calculate the loss on the binary mask over a set of randomly sampled points, $K$, on the mask, rather than the whole thing (see [PointRend](https://arxiv.org/abs/1912.08193) / [Implicit PointRend](https://arxiv.org/abs/2104.06404)). More specifically, they calculate the bipartite matching loss and the final loss.

Even more specifically, when calculating the bipartite matching loss, they use the same set of uniformly distributed points for all predictions and ground truth masks. However, once matches have been made between pairs, the final loss between matched predictions and ground truth have a different set of points used for each pair of prediction and ground truth masks, derived from importance sampling (see [PointRend](https://arxiv.org/abs/1912.08193)).

For $K$, they pick the number $12,544$. I.e., $112\times 112$ points. And they find that when they do this, the memory footprint is lowered by $3\times$, going from 18GB per image down to 6GB.

Note that the inspiration from PointRend / Implicit PointRend is not a coincidence, as some of the people from this paper worked on those papers. In fact the first author for this paper is the first author on the Implicit PointRend paper, so it may be worth checking those out.

### Model Settings

#### Pixel Decoder

In MaskFormer, an FPN-like pixel decoder was used. In Mask2Former, they use a more advanced model called the "multi-scale deformable attention transformer" (MSDeformAttn). This is from the [Deformable DETR paper.](https://arxiv.org/abs/2010.04159)

#### Transformer Decoder

For the number of decoder layers, they use 9, so that the sequence of the 3 multi-scale features out of the pixel decoder are used 3 times ($3\times 3 = 9$).

By default, the number of segment queries is set to $100$ except when training panoptic / instance models with the Swin-L backbone, where $200$ queries are used.

An auxiliary loss is added to each layer of the decoder as well as the initial learnable input queries. But what is this loss? Is it the mask loss or what? It isn't specified clearly in the paper. I'm pretty sure it's the mask loss, and a later line in the paper seems to confirm this:

With learnable queries being supervised by the mask loss, predictions from learnable queries can serve as mask proposals.

#### Loss Functions

In the case of MaskFormer, a linear combination of focal loss and dice loss were used when calculating the mask loss, $\mathcal{L}_{mask}$. For Mask2Former, focal loss is replaced with cross entropy and the dice loss is still used:

$\mathcal{L}_{mask} = \lambda_{ce}\mathcal{L}_{ce} + \lambda_{dice}\mathcal{L}_{dice}$ where the $\lambda$ values are the specified weights for each loss. The authors use $5.0$ as the weight for both.

Then, the final loss is a combination of the mask loss and the classification loss: $\mathcal{L} = \mathcal{L}_{mask} + \lambda_{cls}\mathcal{L}_{cls}$ where $\lambda_{cls}$ is set to $2.0$ for predictions which are matched with a ground truth and $0.1$ for predictions which were not matched with any ground truth.

## Experiments

### Datasets

COCO, ADE20K, Cityscapes, Mapillary Vistas

### Training Settings

See paper for in-depth details.

For the instance / panoptic tasks, follows latest (at the time) best hyper-parameter practices for training Mask-RCNN on COCO.

For semantic segmentation, same training settings as MaskFormer except the $0.1$ learning rate multiplier is applied to backbones of both CNN and transformer varieties, whereas in MaskFormer only did that when using a CNN backbone. Similarly, ResNet and Swin backbones use an initial learning rate of $0.0001$ and a weight decay of $0.05$ instead of having separate sets of values.

### Results

- Many SOTA results achieved on instance, panoptic, semantic segmentation tasks
- While Mask2Former performs better on small objects than MaskFormer, it still lags behind other SOTA models, so there's room for improvement
- They show that removing the masked attention or multi-scale feature interactions from the transformer decoder lead to lower scores, with the most pronounced difference coming from removing the masked attention
- For multi-scale features in the decoder, they find that if you only use the $\frac{1}{8}$ resolution features, you get slightly better results, but the reduction in computation via the proposed strategy outweighs the small bump in score
- They try a few different pixel decoders but the MSDeformAttn decoder does best across all tasks
- Calculating matching loss / mask loss with points results in better performance and a $3\times$ reduction in GPU memory required
- They find that the masks produced from the various levels of queries in the transformer decoder act as region proposals, showing that even the masks generated from the initial learnable queries before being passed into the decoder achieve a 50.3% score for class-agnostic recall on COCO which increases at later layers
- They find that a Mask2Former trained specifically for panoptic segmentation performs slightly worse on instance and semantic segmentation compared to Mask2Formers being specifically trained for those tasks, suggesting that even though it can perform any of these tasks post-training, the best strategy is still to train for your target task.
