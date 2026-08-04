---
title: "SegNeXt"
paperTitle: "SegNeXt: Rethinking Convolutional Attention Design for Semantic Segmentation"
paperAuthors: "Meng-Hao Guo, Cheng-Ze Lu, Qibin Hou, Zhengning Liu, Ming-Ming Cheng, Shi-min Hu"
paperYear: 2022
topic: semantic-segmentation
subtopic: general
date: 2025-05-22
---

Check out the [VIDEO](https://www.youtube.com/watch?v=rzmGGjqnmss)!

![mscan_arch](/images/notes/mscan_arch.webp)

## High-Level Overview

In contemporary semantic segmentation neural network research, the transformer has been become the main choice of architecture. Transformer-based architectures have shown strong performance across many segmentation benchmarks in many domains. However, the $O(n^{2})$ computational cost of the transformer's self-attention mechanism is a significant drawback.

In this work, the authors propose a convolutional attention mechanism to replace the transformer self-attention operation which is of $O(n)$ complexity while preserving the ability to capture global context. This results in a family of models called SegNeXt, which are able to achieve segmentation performance similar or better than previous convolution-based and transformer-based methods.

## Getting Into The Details

### Intro

By analyzing successful semantic segmentation architectures, the authors identify four characteristics which yield a strong architecture: a strong backbone, multi-scale object interaction, spatial attention, and low computational complexity.

A strong backbone means that useful features will be encoded for the segmentation task, and this one area where the transformer architecture has provided value.

Multi-scale object interaction is important due to the fact that in many domains, the size of objects can vary significantly and in a dense prediction task, encoding details at multiple scales is more important compared to a task like classification.

Spatial attention is another area where transformers have improved over convolutional neural networks with its global self-attention operation. For dense prediction, spatial attention allows features to be learned about priority areas within segmentation regions.

Lastly, low computational cost allows for efficient segmentation of large amounts of images and high resolution images which are common to domains such as remote sensing.

Taking these into account, the authors propose a new family of encoder-decoder models called SegNeXt which aim to achieve each of the four characteristics. Instead of the costly self-attention which drives transformers, the authors propose a convolutional attention mechanism which is able to capture global context through the use of lightweight convolution operations in the encoder. The decoder uses the Hamburger module to fuse multi-scale features produced by the encoder and performs even more global context capturing.

### MSCAN Convolutional Encoder

The proposed encoder is named the multi-scale convolutional attention network (MSCAN), and each encoder block its overall structure follows that of the ViT encoder block. I.e., a normalization layer, an attention module, a residual connection, a normalization layer, a feed forward network module, and finally another residual connection.

The innovation of MSCAN lies in the attention module, called the multi-scale convolutional attention (MSCA) module. Features arrive to the module as input and a depth-wise convolutional layer is applied to capture local information. These features are then sent through three independent branches of two depth-wise strip convolutions at sizes $7$, $11$, and $21$. A strip convolution is a convolution with kernel size $K\times 1$ or $1\times K$. To mimic, for example, a $21\times 21$ convolution, the authors stack two strip convolutions with kernel size $21\times 1$ and $1\times 21$. The benefit being that these depth-wise strip convolutions are cheaper to compute than a full convolution and also aid in detecting thin, strip-like features such as a telephone pole. The features produced by the initial depth-wise convolution and the three strip convolution branches are summed and a $1\times 1$ convolution is used to fuse information from across the channels, as there has been no channel interaction thus far due to the use of depth-wise convolutions. This final set of features is considered the attention map and is element-wise multiplied with the input to the attention module. In this way, features at multiple scales are used to inform how much to scale certain parts of the incoming features.

MSCAN encoder blocks are stacked for several layers and are grouped into four stages. Each stage is separated by a downsampling block made up of a $3\times 3$ convolutional layer with a stride of $2$ followed by a batch normalization layer. This produces feature maps at $\frac{1}{4}$, $\frac{1}{8}$, $\frac{1}{16}$ and $\frac{1}{32}$ the spatial resolution of the input image. The last features produced by each stage are considered that stage's output features.

### Decoder

The decoder receives as input the output features from stages two, three, and four, as they found that including the stage one output only made a marginal difference while requiring a large increase in computational cost. Stages three and four are bilinearly upsampled to match the spatial resolution of stage two and all feature maps are concatenated along the channel dimension. A $1\times 1$ convolution is then applied to facilitate interaction between the channels of the various stages.

This becomes the input to a [Hamburger](https://arxiv.org/abs/2109.04553) module which uses lightweight matrix decomposition rather than an expensive self-attention operation to extract global context from the input features. The output of the Hamburger module has a $1\times 1$ convolution applied to it and another $1\times 1$ convolution to produce the per-pixel logits for pixel classification.

### Overall Architecture Information

The authors design four sizes of the SegNeXt architecture corresponding to the use of more layers and feature maps within the MSCAN encoder as well as the embedding dimension of the decoder. These are called, in increasing order, SegNeXt-T, SegNeXt-S, SegNeXt-B, SegNeXt-L.

## Experimental Results

When training and evaluating SegNeXt models on benchmark semantic segmentation datasets, the authors found that SegNeXt could match our outperform various state of the art CNN and transformer-based models while being less computational expensive. This includes achieving an mIoU of $70.3$ on the iSAID benchmark dataset, which is relevant to my research.
