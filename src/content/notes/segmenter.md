---
title: "Segmenter"
paperTitle: "Segmenter: Transformer for Semantic Segmentation"
paperYear: 2021
topic: semantic-segmentation
subtopic: general
date: 2025-03-24
---

![segmenter_arch](/images/notes/segmenter_arch.webp)

## High Level Overview

The Segmenter architecture is another approach to designing a pure transformer-based model for semantic segmentation.

Like SETR, Segmenter uses ViT as its encoder, but distinct from SETR is that it introduces a mask transformer decoder which is inspired by DETR.

## Architecture Design

### Encoder

Like usual, the input image is partitioned into patches and each patch is flattened to a 1-D vector and passed through a linear embedding layer to project the patch into embedding space before learnable positional embedding vectors are element-wise added to the patch vectors.

Then this input is passed through a set of ViT encoder blocks, and this produces the output tensor.

### Decoder

In Segmenter, logits are produced at the patch-level and then upsampled, as opposed to produced after upsampling.

Segmenter proposes two decoder schemes:

#### Linear

In the linear decoder scheme, each output patch embedding vector is passed through a linear layer to change the embedding dimension from its value at the encoder output, $D$, to the number of classes being predicted, $K$.

Then the patch vectors are reshaped to be 3D (or a 2D set of feature maps, however you want to look at it). I.e., $\frac{H}{P}\times\frac{W}{P}\times K$ where $H$ and $W$ are the height and width of the input image, $P$ is the patch size.

After this reshaping, the tensor is bilinearly upsampled to the dimensionality of the input image, producing the pixel-level logits.

#### Mask Transformer

The mask transformer scheme introduces another set of vectors called the class embeddings:

$c = \lbrack cls_{1},cls_{2},...,cls_{K}\rbrack \in {\mathbb{R}}^{K\times D}$

Remember, $K$ is the number of classes and $D$ is the embedding dimension.

The input patch vectors are passed through one linear projection layer, and then the class embedding vectors are concatenated with them and then this big tensor is sent through the encoder.

The decoder itself is a set of $M$ transformer blocks, pretty straightforward.

Once those outputs are produced, LayerNorm is applied and the patch vectors and class embedding vectors are separated once again.

The patch vectors and embedding vectors are each sent through a linear projection layer and then they are normalized using the L2 norm.

So we now have the normalized patch vectors as matrix $z_{M}^{\prime} \in {\mathbb{R}}^{N\times D}$ and the normalized class embedding vectors $c \in {\mathbb{R}}^{K\times D}$.

Now, the goal is to produce a $N\times K$ matrix which will be the logits to be upsampled. In this case, we produce this by computing the matrix multiplication $z_{M}^{\prime}c$ . This will produce a $N\times K$ matrix.

And intuitively this makes sense, we're taking each patch vector and performing a similarity measure (dot product in this case) between it and each class embedding vector.

Finally we apply LayerNorm and reshape the tensor back into a 3D form and bilinearly upsample to the size of the input image.

## Experiments

### Datasets

The authors test Segmenter on ADE20K, PASCAL Context, and Cityscapes.

### Hyper-Parameters

#### Encoder

- ViT is used and the tiny, small, base, and large variants are considered. DeiT is also used.
- Patch sizes of 8, 16, and 32 are explored.
- Head size for multi-head self attention is set to 64.
- ViT encoders are trained on ImageNet-21k and the DeiT encoder is trained on ImageNet-1k.

#### Augmentation

(Default augmentations from MMSeg at the time):

- Random resize between 0.5 and 2
- Random cropping
  - 768 for Cityscapes
  - 512 for ADE20K
  - 480 for PASCAL Context
- Random horizontal flips

#### Optimization

- SGD (no specification on momentum)
- Polynomial learning rate scheduler
- Initial LR of 0.001 for ADE20K and PASCAL and 0.01 for Cityscapes
- Batch size of 16 for PASCAL, and 8 for ADE20K and Cityscapes
- 160k iterations for ADE20K and 80k iterations for PASCAL and Cityscapes

### Results

- The authors find that Segmenter achieves SOTA for ADE20K and PASCAL, and is competitive on Cityscapes, but SETR is still best for that dataset.
- Stochastic depth set to 0.1 seems to consistently improve results for transformers for segmentation, but dropout seems to hurt performance.
- They find that scaling up the embedding dimension via using the larger ViT variants does increase performance, as expected.
- Model performance improves as the patch size decreases, however the computational cost increases quite a bit. It seems like they found $16\times 16$ to be the sweet spot.
- Mask transformer decoder produces superior results to the linear decoder, as expected.
- While a model like DeepLabV3+ produces sharper boundaries, Segmenter is more consistent on larger objects and is better when dealing with partial occlusions.
- Dataset size is important, the performance of Segmenter drops off when the training set is below 8k images.
