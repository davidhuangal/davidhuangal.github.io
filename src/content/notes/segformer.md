---
title: "SegFormer"
description: "Notes on SegFormer, which pairs a hierarchical transformer encoder without positional encodings with an all-MLP decoder, reaching strong segmentation accuracy with fewer parameters and FLOPs."
paperTitle: "SegFormer: Simple and Efficient Design for Semantic Segmentation with Transformers"
paperYear: 2021
topic: semantic-segmentation
subtopic: general
date: 2025-03-24
---

![segformer_arch](/images/notes/segformer_arch.webp)

## High-Level Overview

SegFormer is a new transformer-based semantic segmentation model which proposes two significant architecture components.

1.  A hierarchical transformer encoder which reduces in spatial resolution over the course of the network and which produces multi-scale features AND doesn't use positional encoding.
2.  A decoder that is simply made up of MLP layers as opposed to any complex decoder designs.

The authors find that this design produces SOTA results while reducing parameter count and required FLOPs.

They offer 6 models of increasing sizes / performance, SegFormer-B0, SegFormer-B1, ..., SegFormer-B5.

## Architecture Design

### Input

First, the input image is partitioned into patches of $4\times 4$ pixels. ViT uses $16\times 16$ and the SegFormer authors say they use a smaller size because that should be beneficial for a dense prediction task.

### Encoder: Mix-Transformer (MiT)

Unlike how ViT downsamples once and then maintains the same spatial resolution throughout the whole network, MiT reduces the spatial resolution over the course of the network, producing multi-scale features, similar to the design of a CNN.

#### Overlapped Patch Merging

In order to reduce the spatial resolution, SegFormer uses what the authors call "overlapped patch merging".

It should be noted that there are two issues related to this in the architecture image above. First of all, there is no initial "Overlapped Patch Embedding" at the beginning of the network. Second, the overlapped patch merging layers happen at the beginning of each encoder block, not after like in the image. An author on Medium pointed this out and photoshopped what it should really look like:

![segformer_correction](/images/notes/segformer_correction.webp)

The idea is to perform patch merging over a set of patches with some overlap, and this is implemented as a 2D convolution with a certain kernel size ($K$), stride ($S$), and padding ($P$).

The first overlap patch merging layer uses $K = 7,S = 4,P = 3$ and then the next three use $K = 3,S = 2,P = 1$. As you can see, the stride is smaller than the kernel size and so we get some overlap between patches.

So the first overlapped patch merging reduces the spatial resolution by a factor of $4$ to $\frac{H}{4}\times\frac{W}{4}\times C_{1}$ and then subsequent ones reduce the spatial resolution by $2$ each time so that we get the output features of $\frac{H}{4}\times\frac{W}{4}\times C_{1},\frac{H}{8}\times\frac{W}{8}\times C_{2},\frac{H}{16}\times\frac{W}{16}\times C_{3},\frac{H}{32}\times\frac{W}{32}\times C_{4}$ where $C_{1},C_{2},C_{3},C_{4}$ and the embedding dimension for the four stages of SegFormer.

Each overlap patch merging is followed by a LayerNorm.

#### Efficient Self-Attention

In order to reduce some computation cost for self-attention, the authors propose reducing the spatial resolution of the input, $K$, to the module by some reduction ratio, $R$.

They first reshape $K$ to go from $(N\times C)$ to $(\frac{N}{R}\times C\cdot R)$ which is just rearranging the elements. Then, this is passed through a linear layer to bring the dimension $C\cdot R$ back to just $C$. And in the four stages of SegFormer, the $R$'s used were $\lbrack 64,16,4,1\rbrack$.

Now, in practice, this is implemented like so:

- Hold aside a copy of the input as the Query matrix, $Q$.
- Take the input and reshape to interpret it as a 2D feature map, $\frac{H}{P}\times\frac{W}{P}\times C_{i}$ at whatever resolution / embedding dimension we are at in this stage.
- Use a 2D conv with kernel size and stride equal to $\sqrt{R}$ to reduce the spatial resolution of the inputs.
- Reshape the reduced tensor back to $(num\_ patches\times C_{i})$ and apply LayerNorm
- Then use the copy of the original input to calculate the query matrix $Q$, and use the reduced resolution input to calculate the key matrix $K$ and the value matrix $V$. This is done by multiplying the input or the reduced input by a query, key, and value weight matrix.
- Use these to perform self-attention.

#### Mix-FFN

This is where the "Mix" in "Mix-Transformer" comes from.

The authors note that positional encoding is used in the ViT architecture, but it has the drawback that if you want to test on images of different resolution than what was trained on, you have to interpolate the positional embeddings to match the resolution of the input image, and this usually leads to poorer performance.

The authors argue that we can get around the use of positional embeddings by "mixing" in a $3\times 3$ convolution into the FFN section of the transformer. The secret sauce is that the $3\times 3$ convolution will use zero-padding and that will help to sort of "leak" positional information to the model. There is a whole paper dedicated to showing how this works which may be interesting to dig into later: [HERE](https://arxiv.org/abs/2001.08248)

So, the Mix-FFN looks like this:

- Hold aside input for residual connection
- LayerNorm is applied
- The input is passed through the first linear layer where the channels are expanded by a factor of some expansion ratio, $E_{i}$.
- The input is sent through a depth-wise $3\times 3$ convolution layer (stride=1, padding=1 to maintain spatial resolution)
- A GELU activation is applied
- The input is sent through another linear layer, reducing the number of channels back to what it was before the first linear layer
- Finally, the original input to the module is added via a residual connection

In practice, the input is reshaped to be reinterpreted as a set of 2D feature maps and then the linear layers are implemented as pointwise convolutions and then the features are reshaped back to a list of patch embeddings before being sent on.

### Decoder

SegFormer's decoder is lightweight, made up of only MLP layers (implemented as point-wise convolutions in practice).

The inputs to the decoder are the outputs from each of the four stages, which remember are at $\frac{1}{4},\frac{1}{8},\frac{1}{16},\frac{1}{32}$ the resolutions of the input image.

- First, each input is passed through its own linear layer to all be set to the same decoder embedding dimension, $C$.
- Then stages 2, 3, and 4 are bilinearly upsampled to be of the same spatial resolution as stage 1. I.e., $\frac{H}{4}\times\frac{W}{4}$.
- Then each stage tensor is concatenated, changing the embedding dimension to $4\cdot C$.
- Then they are passed through a linear layer to have some interactions and to bring the channel dimension from $4\cdot C$ back to $C$.
- One more linear layer is applied to go from $C$ channels to $N_{cls}$ channels, which is the number of classes being predicted.
- Finally, this tensor is bilinearly upsampled to the resolution of the input image to produce our per-pixel logits.

## Experiments

### Datasets

SegFormer is evaluated on Cityscapes, ADE20K, and COCO-Stuff.

### Hyper-Parameters

Trained with MMSegmentation.

#### Pre-Training

- Encoder pre-trained on ImageNet-1k
- Decoder initialized randomly

#### Augmentations

- Random resize in range 0.5 to 2.0
- Random horizontal flips
- Random cropping
  - $512\times 512$ for ADE20K and COCO-Stuff
  - $1024\times 1024$ for Cityscapes

#### Training

- AdamW optimizer
- Initial learning rate of 0.00006
- Poly learning rate scheduler using factor of $1.0$
- 160k iterations for ADE20K and Cityscapes, 80k for COCO-stuff
- Batch size of 16 for ADE20K and COCO-stuff and 8 for Cityscapes

### Results

- Increasing the size of the model results in better performance, as expected.
- In the largest model, B5, the decoder makes up only 4% of the total parameter count.
- The largest model, B5, achieves SOTA results on all 3 datasets.
- For the decoder channel dimension, the authors find that $256$ provides a good balance of performance and computation cost and that $768$ seems to be the top end before diminishing returns so B0 and B1 use $256$ and B3, B4, and B5 use $768$.
- They find that their model only loses a small bit of performance when changing input resolutions compared to the more pronounced drop when using positional encoding.
- The increased receptive field achieved by using a transformer encoder is essential to performance, as even when the authors used powerful CNN encoders and the same MLP decoder, performance is much worse.
- They find that if they apply corruptions to images at increasing levels of intensity, SegFormer is able to maintain a relatively high mIoU whereas DeepLabV3+ drops like a rock.
