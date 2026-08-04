---
title: "MaskFormer"
paperTitle: "Per-Pixel Classification is Not All You Need for Semantic Segmentation"
paperYear: 2021
topic: semantic-segmentation
subtopic: general
date: 2025-03-24
---

![maskformer_arch](/images/notes/maskformer_arch.webp)

## High Level Overview

In modern segmentation research there is the pixel-level classification task of semantic segmentation and the per-mask classification approach of instance / panoptic segmentation.

In this work, the authors make the claim that mask classification can be used for both semantic segmentation and instance segmentation, and propose a new architecture to achieve this, MaskFormer.

They find that their MaskFormer model achieves SOTA results on semantic- and panoptic- segmentation, especially when the number of classes is large.

## Per-Pixel Classification v.s. Mask Classification

### Per-Pixel Classification

For per-pixel classification, the goal is to predict the probability distribution over $K$ classes for each pixel. You train models to perform this prediction and use a per-pixel cross entropy loss.

### Mask Classification

On the other hand, mask classification consists of predicting binary masks as well as the probability distribution over $K$ classes for the whole mask. One distinction, however, is the inclusion of the "no label" class, $\varnothing$, which is for mask predictions which do not belong to any of the $K$ classes.

The desired output, and therefore ground truth format, for mask classification is a set of pairs. The pairs are made up of a binary mask and a class label.

When a mask classification model makes a prediction, typically there are more prediction masks than there are ground truth masks. When this happens, the ground truth is padded with $\varnothing$ tokens; it is padded with however many more prediction masks there are than ground truth masks. This is to preserve a one-to-one ratio between the sets of prediction and ground truth mask/label pairs.

## Architecture Design

So, the MaskFormer architecture is designed to predict $N$ pairs of binary masks and class labels for those masks.

It is made up of three components:

- A pixel-level module which produces per-pixel embeddings which are then used to generate a binary mask
- A transformer module which computes embeddings for each of the $N$ segments
- A segmentation module which generates the prediction pairs of masks / class labels from the embeddings from the transformer module

### Pixel-Level Module

The pixel-level module takes in the input image and passes it through a backbone which will produce image features at a lower resolution. Then those features are passed through a decoder to produce pixel-level embeddings of dimension $C_{\mathcal{E}}\times H\times W$.

You can use any existing pixel-level module components such as a ResNet or Swin for the backbone or ASPP or PSP for the decoder.

### Transformer Module

The transformer module is made up of a transformer decoder. The inputs at the bottom of the decoder are $N$ queries where each query corresponds to a possible segment being predicted. Then for the cross attention, the image features out of the pixel level module backbone are brought in.

This produces $N$ per-segment embeddings with embedding dimension $C_{Q}$. The output is referred as $Q \in \mathbb{R}^{\mathbb{C}_{\mathbb{Q}}\mathbb{\times}\mathbb{N}}$.

My question still is how do we come up with the number $N$? Is it fixed like in DETR where they restrict it to 100? This may be made more clear later. Oh actually found the answer in the ablation section, which I'll touch more on later, but they find that 100 is a good number.

I guess this point of this module is to use image features to divide up the image into segments with an embedding dimension.

### Segmentation Module

The segmentation module is made up of several parts.

In one section, the outputs from the transformer decoder, $Q$, are passed through a linear classifier (MLP, likely implemented as pointwise conv if I had to guess) to predict classes for each of the $N$ segments, producing a tensor of $N\times(K + 1)$ where $K$ is the number of classes. The second dimension is $K + 1$ because we are also including the $\varnothing$ "no object" class.

Another branch applies a separate MLP with 2 hidden layers to produce $N$ "mask embeddings" such that the embedding dimension matches that of the output of the pixel-level module decoder, $C_{\mathcal{E}}$. I.e., the mask embeddings are $\mathcal{E} \in {\mathbb{R}}^{C_{\mathcal{E}}\times N}$.

Then the goal is to produce $N$ binary masks. To obtain each binary mask $m_{i} \in \lbrack 0,1\rbrack^{H\times W}$, you calculate the dot product between the $i^{th}$ mask embedding and the features from the decoder of the pixel-level module. Each dot product is followed by a sigmoid activation.

Written out this operation looks like: $m_{i}\lbrack h,w\rbrack = sigmoid(\mathcal{E}_{mask}\lbrack:,i\rbrack^{T}\cdot\mathcal{E}_{pixel}\lbrack:,h,w\rbrack)$ where $\mathcal{E}_{mask}$ is the mask embeddings and $\mathcal{E}_{pixel}$ is the pixel-level embeddings from the decoder.

So, at the end you now have $N$ per-segment class probabilities from the linear classifier branch and then you have $N$ binary masks probabilities. And these pairs are the mask-classification pairs that we described earlier, in the sort of "logits" form. We will see how to produce actual predictions next.

### Inference

For inference, they have a general inference mode and a specific semantic segmentation inference mode.

#### General Inference

In general inference, the goal is to assign each pixel $\lbrack h,w\rbrack$ to one of the $N$ class-mask pairings.

For each pixel, you assign it to the class-mask pair which maximizes the the product of two values:

- The probability value of the highest probability class in the class distribution for segment $N$, excluding $\varnothing$.
- The mask probability value in the binary mask probabilities at location $\lbrack h,w\rbrack$.

So basically, you assign the pixel it to the segment which is most confident about its class and mask at the pixel's location, excluding any pairs where the highest probability class is $\varnothing$.

#### Semantic Segmentation Inference

In contrast to general inference, in this case we assign the class, $c$, which maximizes this formula:

${\backslash arg}\max_{c \in \{ 1,\ldots,K\}}\sum_{i = 1}^{N}p_{i}(c)\cdot m_{i}\lbrack h,w\rbrack$

So at each pixel, we're determining the $K$-length logit vector by going through each of the $K$ classes and at each class summing the product of the class probability and mask probability over all the $N$ pairs. Whichever class has the highest sum is then picked as the assigned class. And we ignore the $\varnothing$ class, so it does not contribute to the sum.

### Model Settings

#### Backbone

The authors evaluate with these backbones for the pixel-level module:

- ResNet-50
- ResNet-101
- ResNet-101c
- Swin series

#### Pixel Decoder

For the pixel-level module, the authors opt for a more lightweight feature pyramid network (FPN)-like decoder. They argue that they can do this because the transformer module uses self-attention which captures global context about the image features, and thus there is no need for a more complex decoder.

The process is:

- The output features from the backbone are passed through a point-wise convolution and GroupNorm, changing the number of channels to $256$
- The output features are then upsampled by $2\times$ using nearest-neighbors interpolation
- The features earlier in the backbone at the corresponding $2\times$ resolution are also passed through a point-wise convolution and GroupNorm, changing the channels to $256$
- Then, the output features and earlier features are summed together
- Then a $3\times 3$ convolution is applied to fuse the features, followed by a GroupNorm, and a ReLU activation.
- This process is repeated from the first resolution of $\frac{H}{32}\times\frac{W}{32}$ up until the resolution is $\frac{H}{4}\times\frac{W}{4}$.
- Finally, one more $1\times 1$ convolution is applied to get the pixel-level embeddings with dimension $256$.

#### Transformer Decoder

The transformer decoder is the same as DETR, where the $N$ query embeddings are initialized as zero vectors and learnable positional encoding vectors are added.

Also like DETR, the number of queries is fixed to $100$ by default and $6$ decoder layers are used.

#### Segmentation Module

The MLP used to create the mask embeddings is a 2-layer MLP which project and then maintain an embedding dimension of $256$.

## Experiments

### Datasets

For semantic segmentation:

- ADE20K (150 class version)
- COCO-Stuff 10K (171 classes)
- Cityscapes (19 classes)
- Mapillary Vistas (64 classes)
- ADE20K-Full (874 classes)

For panoptic segmentation:

- COCO (80 thing classes and 53 stuff classes)
- ADE20K-Panoptic (100 thing classes, 50 stuff classes)

### Training Settings

Trained using Detectron2.

Pretty much same standard settings with AdamW, poly learning rate, standard augmentations, 160k iterations bs=16 for ADE20K, 200k bs=16 for ADE20k-Full, 60k bs=32 for COCO-Stuff-10k

### Results

- MaskFormer outperforms per-pixel classification models on ADE20K
- They find that the model performs better when there are a larger number of categories
- $100$ queries was found to be the optimal number for $N$
- MaskFormer outperforms DETR, the model that MaskFormer is largely based on, on panoptic segmentation, implying that mask-based matching is better than box-based matching
- MaskFormer is also less computationally expensive compared to DETR
- However, MaskFormer does lag behind on instance segmentation compared to specialized instance segmentation architectures (to be addressed in Mask2Former)
- MaskFormer is also quite slow to converge
- MaskFormer also struggles on smaller objects, likely due to it utilizing a low-resolution feature map from the pixel-level module backbone
