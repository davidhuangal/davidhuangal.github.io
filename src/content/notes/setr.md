---
title: "SETR"
paperTitle: "Rethinking Semantic Segmentation from a Sequence-to-Sequence Perspective with Transformers"
paperYear: 2021
topic: semantic-segmentation
subtopic: general
date: 2025-03-24
---

![SETR_arch](/images/notes/setr_arch.webp)

## High Level Overview

Semantic segmentation models have largely followed the FCN design of an encoder-decoder architecture with a CNN-based encoder which downsamples the spatial resolution of the features over time.

The resolution reduction plays two roles: 1) To reduce computational cost and 2) increase the receptive field of the convolutional kernels being applied to the feature maps. Other methods to have been utilized to increase the reception field such as large kernel sizes and dilated convolutions.

The authors introduce a new architecture, SEgmentation Transformer (SETR), which aims to reformulate semantic segmentation as a sequence-to-sequence problem, replacing the CNN encoder with a pure transformer.

The input image is initially broken up into patches and then passed through a linear embedding layer, producing the "tokens", which are consumed by the transformer.

Of note, the SETR architecture does not downsample the spatial resolution of the features over time like the CNN-based encoders as it has a global receptive field through the use of self attention.

The authors find that SETR outperforms many FCN-based models on benchmark datasets, even achieving the 1st place rank on the ADE20K test dataset.

## Architecture Design

### Image -\> Sequence

So, how do we transform an image into a sequence? We could simply flatten the image and use all pixels as the sequence. However, for example, a $512\times 512$ image would result in 262,144 inputs. Given that the self attention operation is $O(n^{2})$, this will be prohibitively expensive.

As an alternative, we can split the image up into patches and perform the self attention operation on a patch level. But what patch size should we use?

The SETR authors propose patch sizes of $\frac{H}{16}\times\frac{W}{16}$ because that's typically what CNN-based encoders typically downsample feature maps to. So, SETR divides the image up into patches of that size.

Each pixel patch is then projected into embedding space of dimensionality $C$ via a linear projection. Then, a positional embedding vector is added to each patch embedding vector to encode some spatial information, as transformers by default work on sets and do not consider the order of the input sequence. This final set of vectors is the input sequence into SETR.

### Transformer Encoder

The SETR transformer encoder is simply a pure transformer. The only difference from the original transformer is that it uses the pre-layer norm layout instead of the post-layer norm of the original transformer.

So each transformer block follows this sequence:

- Input held aside for residual connection
- LayerNorm is applied
- Features sent into the multi-head self attention block
- Then the residual connection is added
- This output is then held aside for the next residual connection
- LayerNorm is applied
- Features are sent through the MLP block
- Then the residual connection is added and this tensor is the output of the transformer block

There will be some number of transformer blocks one after the other and that makes up the transformer encoder for SETR.

### Decoder Design

The output of the transformer encoder is of shape $\frac{HW}{256}\times C$ and before sending the features to the decoder, we reshape them back to $\frac{H}{16}\times\frac{W}{16}\times C$.

SETR explores three different designs for its decoder:

#### Naive Upsampling

In the naive approach, the output of the encoder has its embedding dimension projected to the number of classes that are being segmented. For example, 19 in the case of Cityscapes.

To do this, the features are passed through a $1\times 1$ conv, then batch normalization, then a ReLU activation function, then another $1\times 1$ conv.

From here, the features are simply bilinearly upsampled to the input image resolution and these are the output logits.

The architecture with this decoder is called SETR-Naive.

#### Progressive Upsampling (PUP)

![SETER_PUP](/images/notes/seter_pup.webp)

Because a direct upsampling from $\frac{H}{16}\times\frac{W}{16}$ to $H\times W$ may introduce noisy predictions, the PUP scheme proposes performing more iterative upsampling over time.

Each upsampling step is made up of a convolutional layer and then an upsampling, which is restricted to only being a $2\times$ upsampling, resulting in 4 conv+upsampling operations:

The architecture with this decoder is called SETR-PUP.

#### Multi-Level Feature Aggregation (MLA)

![SETR_MLA](/images/notes/setr_mla.webp)

In this scheme, we don't just consider the output from the final transformer block, but instead we use the output of multiple blocks. These blocks are chosen using a parameter $M$ such that we use blocks $\frac{L_{e}}{M},2\frac{L_{e}}{M},...,M\frac{L_{e}}{M}$ where $L_{e}$ is the total number of transformer blocks. So we are then dealing with $M$ outputs.

Then there are $M$ "streams" which each process an output:

- The tensor is reshaped to $\frac{H}{16}\times\frac{W}{16}\times C$
- Then a $1\times 1$ convolution is applied with the embedding dimension being reduced by half
- Then the top-down aggregation is applied. I.e., the features in the second stream down are element-wise added with the features in the top stream, the features of the third stream down are added with the sum of the features of the top and second down streams, and so on. This to facilitate multi-scale interactions. (See image above).
- Then, two $3\times 3$ convolutional layers are applied, with the second one halving the embedding dimension again
- Then all streams are concatenated along the channel dimension
- Finally, a bilinear upsampling is applied to return to the original input resolution

Hmm, I think a few steps are missing or are unclear in the paper. In the image, there is an upsampling before the concatenation and then there's another conv and upsampling after the concatenation.

So, I think they are missing the pre-concatenation upsampling and the post-concatenation conv and upsampling in their model description. That last conv likely projects the dimensions into the number of classes being predicted.

### Architecture Variants

Besides the variation of decoders, the authors explore a few variations for the encoder as well.

First, the encoder is either standard ViT blocks or DeiT blocks.

Second, there are the T-Base and T-Large versions of the encoder. T-Base uses 12 encoder blocks, whereas T-Large uses 24.

## Experiments

### General Hyper-Parameters

The authors evaluate SETR on Cityscapes, ADE20K, and PASCAL Context.

The authors use MMSegmentation for their codebase.

Augmentations (Default augmentations from MMSeg at the time):

- Random resize between 0.5 and 2
- Random cropping
  - 768 for Cityscapes
  - 512 for ADE20K
  - 480 for PASCAL Context
- Random horizontal flips

Hyperparams:

- Batch size:
  - 16 for ADE20K and PASCAL Context
  - 8 for Cityscapes
- Training iterations:
  - 160k for ADE20K
  - 80k for PASCAL Context
  - 40k and 80k for Cityscapes
- LR Scheduler:
  - Polynomial
  - Initial rate at 0.001 for ADE20K and PASCAL
  - Initial rate at 0.01 for Cityscapes
- Optimizer:
  - SGD
  - Momentum = 0.9
  - Weight decay = 0

Encoder layers are initialized from pre-trained ViT or DeiT blocks on ImageNet-1k or ImageNet-21k. Any other new layers are randomly initialized.

### Hybrid Model

The authors also evaluate a hybrid model. This model consists of a ResNet-50 FCN encoder whose features are then sent into SETR.

### Results

The authors find that SETR-PUP performs the best on Cityscapes, whereas SETR-MLA seems to work better on ADE20K and PASCAL Context.

They also find that T-Large variants work better than T-Base variants which is to be expected.

Another interesting find is that for a shorter set of iterations, the hybrid model outperformed the pure transformer SETR, but when extending the number of iterations, then the pure transformer SETR outperforms the hybrid model.

As is usually the case, the authors also found that pre-training the encoder is essential to good performance, as the model trained completely from scratch fell very far behind.

For ADE20K and PASCAL Context, SETR achieved SOTA, even getting 1st place for the ADE20K challenge test set. While not SOTA for Cityscapes, it did still achieve competetive
