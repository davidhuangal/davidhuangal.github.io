---
title: "EfficientViT"
paperTitle: "EfficientViT: Multi-Scale Linear Attention for High-Resolution Dense Prediction"
paperYear: 2023
topic: semantic-segmentation
subtopic: general
date: 2025-08-26
---

![efficientvit_arch1](/images/notes/efficientvit_arch1.webp)
![efficientvit_arch2](/images/notes/efficientvit_arch2.webp)

Sidenote: <a href="https://github.com/davidhuangal/efficientvit_mmseg" target="_blank">I've ported these to be available in MMSegmentation</a>, for my fellow MM-heads out there.

## High-Level Overview

For dense prediction problems such as semantic segmentation and super-resolution, prior model designs took approaches which were computationally expensive, especially when trying to model long-range relationships. For example, the quadratic complexity of softmax self-attention and the increased computation of using large kernel sizes.

The authors propose an attention module that works on multi-scale features and achieves a global receptive field without being of quadratic complexity. They integrate this attention module into a novel semantic segmentation model and find that they get incredible speedups without loss in performance compared to more computationally expensive methods. Just to give an example, EfficientViT can achieve up to $13.9\times$ lower latency compared to SegFormer and up to $6.2\times$ lower latency than SegNeXt.

## Architecture Design

### Multi-Scale Linear Attention

The authors suggest replacing the expensive softmax attention operation with [ReLU linear attention](https://arxiv.org/abs/2006.16236). The goal is to still achieve the global receptive field, but in a much more computationally efficient way.

Let's start with the generalized form of softmax attention. We start with an input $x \in {\mathbb{R}}^{N\times f}$. Then the equation is:

$O_{i} = \sum_{j = 1}^{N}\frac{Sim(Q_{i},K_{j})}{\sum_{j = 1}^{N}Sim(Q_{i},K_{j})}V_{j}$

Where $Q,K,V$ are the query, key, and value matrices determined from their respective learnable linear projections $W_{Q}/W_{K}/W_{V} \in {\mathbb{R}}^{f\times d}$ . $O$ is the output matrix and $O_{i}$ represents the $i^{th}$ row of $O$.

$Sim(\cdot)$ is a similarity function, and setting it to $exp(\frac{QK^{\intercal}}{\sqrt{d}})$ would represent performing softmax attention like usual.

Now, what the authors propose is that we change $Sim(\cdot)$ to be something else. In the case of ReLU linear attention: $Sim(Q,K) = ReLU(Q)ReLU(K)^{\intercal}$ The paper linked above and the Yannic video for it does a better job explaining why ReLU is a suitable function to be used. I just know it has to do with the fact that it's a kernel, apparently.

We plug that into our equation for $O_{i}$ and through some linear algebra magic (associative property, etc. see paper for the walkthrough) we get $O_{i} = \frac{ReLU(Q_{i})(\sum_{j = 1}^{N}ReLU(K_{j})^{\intercal})V_{j}}{ReLU(Q_{i})(\sum_{j = 1}^{N}ReLU(K_{j})^{\intercal})}$

This is nice because now we simply have to calculate

- $(\sum_{j = 1}^{N}ReLU(K_{j})^{\intercal}V_{j}) \in {\mathbb{R}}^{d\times d}$
- $(\sum_{j = 1}^{N}ReLU(K_{j})^{\intercal}) \in {\mathbb{R}}^{d\times 1}$

only once, and then re-use the calculated values for each query $Q_{i}$, thereby only requiring $\mathcal{O}(N)$ computation and $\mathcal{O}(N)$ memory!

### Addressing Limitations of ReLU Linear Attention

![relu_linear_attention_limitations](/images/notes/relu_linear_attention_limitations.webp)

As Song Han says in the EfficientML lecture about this architecture, "there is no free lunch". They find that ReLU linear attention performs worse than softmax attention, and in the image above you can see that the attention maps above do not produce as sharp of distributions.

The authors attribute this to the fact that ReLU linear attention does not use a non-linear similarity function. I had some confusion about this because I thought "ReLU" is a non-linear function? But recall that the similarity function is $Sim(Q,K) = ReLU(Q)ReLU(K)^{\intercal}$ which itself is linear because you're just performing linear combinations of the rows and columns of $Q$ and $K$, even if a non-linear function was applied to each matrix individually. Whereas the equation for softmax does introduce non-linearity into the similarity function itself.

In particular, they find that ReLU linear attention struggles with local features and multi-scale features, and so they approach remedying this via the use of convolutional operations at multiple scales:

![efficientvit_msrla_design](/images/notes/efficientvit_msrla_design.webp)

So, we get the $Q,K,V$ matrices from a linear projection, then those features are passed through multiple branches, as seen above. So, in one branch, $Q,K,V$ go directly into ReLU linear attention. Then in other branches, $Q,K,V$ first have a set of convolutional operations applied to them before being passed to ReLU linear attention.

The first set of convolutions are a set of depth-wise convolutions with a smaller kernel size like $K = 3$ or $K = 5$ to capture local features. Then they are passed through a point-wise convolution and then to ReLU linear attention.

Then the outputs of each branch are concatenated along the head dimension and a final projection layer is applied to facilitate interactions between the features from each branch.

In practice, the authors found that a two-branch design worked best. I.e., one branch where the matrices go directly to ReLU linear attention, and one branch with the convolutional sequence, using a $5\times 5$ kernel for the depth-wise convolutions. The only exception being a few variants built for the segment anything task, but those are only two models.

And so this is the multi-scale ReLU linear attention!

It is used in the EfficientViT Module in the standard transformer setup:

![efficientvit_module](/images/notes/efficientvit_module.webp)

### Macro-Architecture

![efficientvit_arch2](/images/notes/efficientvit_arch2-1.webp)

The backbone of the model consists of an input stem and then four stages where the outputs of stages 2, 3, and 4 are sent to the decoder head.

In the backbone, the spatial resolution of the feature maps are decreased over the course of the network while the number of feature maps is increased, following standard practice.

Of note is that the EfficientViT Module is only used in stages 3 and 4, which is interesting. They don't ever explain why, so I'd have to imagine that they just arrived at this setup empirically.

At the end of the backbone, the outputs from stages 2, 3, and 4 are considered. A point-wise convolution is used to align the number of channels (AKA feature maps) and then an upsampling operation aligns their spatial resolutions. Looking at the code it seems like they usually use bicubic interpolation, but sometimes bilinear as well. Then the aligned stages are simply element-wise summed to achieve feature fusion.

The authors argue that the backbone will have captured strong global context information via the use of ReLU linear attention, and therefore the head can be relatively simple. It is a sequence of MBConv blocks and then the "output" module which is made up of an optional point-wise convolution to expand the number of channels and then one more point-wise convolution to change the number of channels to the number of predicted classes and then upsampling to the input spatial resolution. These are the prediction logits!

## Experiments

### Datasets

For semantic segmentation: Cityscapes and ADE20K. They also have a few super resolution datasets, but not going to investigate for now.

### Training Settings

They don't report many in the paper, I'll have to look in the repo. We know at least that they trained the models using AdamW with cosine learning rate decay and that they use the two-branch multi-scale ReLU linear attention design that I spoke of above.

Okay, update from a future David: They list quite a few hyper-parameters in the repo for classification and diffusion and super resolution, but not semantic segmentation for some reason...? Same with training scripts, all there except for segmentation. I've opened an issue: [HERE](https://github.com/mit-han-lab/efficientvit/issues/171).

### Results

- Achieves some SOTA performance on the benchmark datasets while providing big speedups compared to models of similar performance like SegFormer, SegNeXt, and Mask2Former
- They show that removing the ReLU linear attention or the multi-scale component results in lower performance
- They also find that when adapting EfficientViT for super resolution, it beats or achieves similar performance to other models while being much faster
- They adapt EfficientViT to be used with Segment Anything and find that it achieves similar or better zero-shot instance segmentation performance than the original SAM that used a ViT-H for the image encoder
