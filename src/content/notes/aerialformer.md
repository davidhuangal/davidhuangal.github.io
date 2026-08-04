---
title: "AerialFormer"
paperTitle: "AerialFormer: Multi-resolution Transformer for Aerial Image Segmentation"
paperYear: 2024
topic: semantic-segmentation
subtopic: remote-sensing
date: 2025-03-24
---

## High-Level Overview

Problem being tackled for RS segmentation:

1.  Strong imbalance between foreground and background pixels in RS imagery
2.  Presence of tiny objects
3.  High object density
4.  Intra-class heterogeneity
5.  Inter-class homogeneity

Solution: AerialFormer architecture

- Combines strengths of CNNs and transformers
- Uses a CNN stem module to preserve low-level / high-resolution features
- Transformer encoder (Swin) which generates multi-scale outputs
- Multi-dilated CNN decoder which takes in the multi-scale outputs

![aerialformer_arch](/images/notes/aerialformer_arch-1.webp)

## Getting Into the Details

### CNN Stem

The CNN stem is responsible for addressing the issues of small and densely packed objects (2. and 3.). It only reduces the spatial resolution by 1/2, which means it will extract finer-grained and larger features. In addition, the use of convolutional layers will help to capture local fine-grained information, as opposed to the more global, coarse information of the transformer.

Consists of 4 conv layers, followed by BatchNorm and GELU. First 3x3 conv layer has a stride of 2 to reduce the resolution to half, and then the next two 3x3 conv layers use a stride of 1 to maintain the resolution. Finally there is a pointwise convolution at the end.

The first 3x3 conv changes the channels from `in_channels` to `inplanes` which is hard coded to `64` in the repository. This is maintained until the 1x1 conv which goes from `inplanes` to the 1/2 the embedding dimension, C.

The 1/2 is because the outputs of the transformer encoder are 1/4, 1/8, 1/16, and 1/32 the spatial resolution of the input image and they have embedding dimensions C, C x 2, C x 4, and C x 8. Therefore, the CNN stem is like one level before those, being at 1/2 spatial resolution and C x 1/2 embedding dimensions.

The overall claim seems to be that maintaining a larger spatial resolution will result in less fine-grained features being lost which will be helpful for finding small objects as well as distinguishing boundaries between objects that are close together (challenges 2 and 3).

### Transformer Encoder

An image comes in and is then passed through a patch embedding layer with embedding dimension $C$. The output of the patch embedding layer is then passed through 4 transformer encoder blocks, producing outputs at the 1/4, 1/8, 1/16, and 1/32 with embedding dimensions $C$, $2C$, $4C$, and $8C$. And a patch merging layer is applied after each encoder block which reduces the spatial dimensionality of the features by 1/2.

The encoder blocks are based on the SWIN transformer, which uses Shifted WINdow attention.

#### Patch Embedding

Following the SWIN transformer, it uses a patch size of $4\times 4$ with no overlap, implemented as a 2D convolution with a kernel size of $4\times 4$ and a stride of $4$. The thought is that the smaller size of 4 instead of 7 that the ViT model used is better suited for dense prediction since it will capture smaller features.

#### Transformer Encoder Block

This seems to just be a SWIN encoder block, need to probably go back and read that paper to understand better.

So first, we hold aside a copy of the input to the block for a residual connection, $x^{l}$. Then a layer norm operation is applied to the input and then windowed self attention (WSA) is applied. The output of the MSA is then added to the held aside copy of the original input to the encoder block.

${\hat{x}}^{l} = x^{l} + WSA(LayerNorm(x^{l}))$

Next up, we hold a copy of the ${\hat{x}}^{l}$ for a residual connection. Then we pass apply a layer norm operation to ${\hat{x}}^{l}$ and pass it through the feed-forward-network sublayer (FFN). Then add the residual connection.

$x^{l + 1} = {\hat{x}}^{l} + FFN(LayerNorm({\hat{x}}^{l}))$

#### Patch Merging

The purpose of the patch merging layer is to reduce the spatial resolution of the feature maps coming out of each encoder block while also increasing the channel dimensions, similarly to what is done in CNNs.

In this case, they take the outputs of an encoder block and sections the features in a checkerboard pattern sort of like this:

<div class="highlight">

black, white, black, white white, black, white, black black, white, black, white white, black, white, black ...

</div>

So, what they do is they create four groups: $x_{1}$: Features that are black and in even rows $x_{2}$: Features that are white and in even rows $x_{3}$: Features that are black and in odd rows $x_{4}$: Features that are white and in odd rows

For example if we had a setup like this:

<div class="highlight">

Positions (row, col): (0,0) (0,1) (0,2) (0,3) (1,0) (1,1) (1,2) (1,3) (2,0) (2,1) (2,2) (2,3) (3,0) (3,1) (3,2) (3,3)

</div>

$x_{1}$: (0,0), (0,2), (2,0), (2,2) $x_{2}$: (0,1), (0,3), (2,1), (2,3) $x_{3}$: (1,1), (1,3), (3,1), (3,3) $x_{4}$: (1,0), (1,2), (3,0), (3,2)

So now we have four feature maps are $\frac{1}{2}$ the spatial resolution of the input each with the original patch embedding length $d$. They are then all concatenated along the channel dimension, resulting in a tensor of dimension: $\frac{H}{2}\times\frac{W}{2}\times 4d$

Finally, a linear projection (likely via point-wise convolution) is used to reduce the number of channels from $4d$ to $2d$.

### Multi-Dilated CNN (MDC) Decoder

The authors claim this part in particular is designed to tackle challenges 1 (complex background, except wasn't it foreground to background ratio...?), 4 (intra-class heterogeneity), and 5 (inter-class homogeneity).

An MDC block is made up of 3 parts, the pre-channel mixer, the dilated convolutional layer (DCL), and the post-channel mixer.

![MDC_block](/images/notes/mdc_block-1.webp)

#### Pre-Channel Mixer

So the output from a previous MDC block is concatenated with its symmetric skip connection features from the encoder and then passed through the pre-channel mixer which is simply a point-wise convolution, to enable communication between the features.

One thing that isn't explicitly stated is what happens in the very first MDC block. The input is the output from the last encoder block, no skip connection or anything like that. So is the pre-channel mixer skipped or what?

#### Dilated Convolutional Layer (DCL)

So three kernels each with its own dilation rate are used to process the input features to capture multi-scale features without significant increase in computation.

Interestingly, the input features are first separated into three blocks along the channel dimension, each with the same number of channels, C/3, and then the three dilated convolutions are applied to one of the feature blocks. As in, dilated conv 1 is applied to block 1, dilated conv 2 is applied to conv 2, and dilated conv 3 is applied to block 3.

Interesting setup, I'm not really sure of any reason behind the splitting up of the features other than reduced computation of applying each dilated conv to a smaller set of channels instead of applying each one to all of the channels.

#### Post-Channel Mixer

Because there is the separation of the dilated convolutional features into the three blocks, we then would like to have some interaction between the features from the three dilation levels, which is the purpose of the post-channel mixer.

It's pretty straightforward, just a point-wise conv, then BatchNorm and ReLU, then a 3x3 conv (stride 1, padding 1), and then another BatchNorm and ReLU.

#### Deconv Block

The output of each MDC block is passed into a deconv block, in order to increase the spatial scale of the features.

It is made up of a transpose convolution which increases the spatial dimension of the features by a factor of 2 and also reduces the number of channels by a factor of 2.

Then the upscaled features are passed through a BatchNorm and ReLU activation.

From here, the mirrored features from the encoder are concatenated and the tensor is sent to the next MDC block.

### Experimental Results

#### Ablation Studies

I'm mostly interested in the ablation studies because of course your model gets a new high number of some benchmark dataset, but let's see if the claims in your paper are actually addressed.

They only perform the ablation study on the smallest model Aerialformer-T.

They start with a baseline which is the Swin-based encoder and then U-Net-based decoder with no CNN stem and replacing the dilated convolutions in the decoder with standard convolutions.

Then they add in just the CNN stem which shows a slight improvement. Then they try only adding in the MDC-based decoder structure and it shows a more pronounced improvement. Then adding both together results in the best performance.

#### Qualitative Results

In this section, the authors provide a handful of visualized inference results from AerialFormer and discuss how these examples help to support their claims.

Now I have some issues with this section. First of all, they visually compare the AerialFormer results against PSPNet and DeepLabV3+, models from 2016 and 2018. These are models who are not falling within the top three competitors to AerialFormer in the comparison tables earlier in the paper, so why use those as a point of comparison? Some of the better models like SegFormer have open-source implementations which you could use to train and visualize results for.

The second issue I have is that this is the section of the paper where they finally directly address how their model is able to improve upon the five big problems in remote sensing segmentation. This could have been **one** of the sections where you discussed this, but it really shouldn't be the only section. It is so easy to cherry pick inference results which happen to support your claims, even if there are many others which indicate the opposite.
