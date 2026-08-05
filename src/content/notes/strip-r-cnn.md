---
title: "Strip R-CNN"
description: "Notes on Strip R-CNN, which uses large strip convolutions in its backbone and detection head to detect high-aspect-ratio objects in remote sensing imagery, setting a new state of the art on DOTA-v1.0."
paperTitle: "Strip R-CNN: Large Strip Convolution for Remote Sensing Object Detection"
paperAuthors: "Xinbin Yuan, Zhaohui Zheng, Yuxuan Li, Xialei Liu, Li Liu, Xiang Li, Qibin Hou, Ming-Ming Cheng"
paperYear: 2025
topic: object-detection
subtopic: remote-sensing
date: 2026-02-18
---

[Project Page](https://github.com/HVision-NKU/Strip-R-CNN)

## Abstract / General Overview

The authors point out that it is objects with high aspect ratios which are difficult for current deep learning architectures to successfully perform object detection on in remote sensing imagery.

The authors propose the use of large strip convolutions in order to create better feature representations of these types of objects and propose a backbone called StripNet. They also create a object detection head which they call the strip head.

They conduct experiments on a handful of benchmark remote sensing object detection datasets and find that they can achieve strong performance, even setting a new state of the art for the DOTA-v1.0 dataset.

## Getting Into the Details

### Introduction

The authors detail progress made in remote sensing object detection (they focus on rotated bounding boxes), but note that despite this progress, detecting objects with a large aspect ratio continues to be a challenge. They demonstrate this for the DOTA dataset, showing that high aspect ratio objects make up a large portion of the dataset, and show how current methods trend towards very low performance (near 0% mAP) as the aspect ratio of objects increases.

![dota_aspect_ratio_performance](/images/notes/dota_aspect_ratio_performance.webp)

The authors argue that the two primary reasons for this difficulty are:

1.  Objects with high aspect ratios are rich with details in one direction, but are relatively sparse in the other direction. This means traditional square convolutions may produce many redundant features on the sparser side of the object.
2.  The geometric nature of high aspect ratio objects makes rotated bounding box detection more difficult. Because they are so long in one direction, a small error in the predicted angle of rotation produces a larger error compared to a small rotational error for a square bounding box. See below:

![background](/images/notes/background.webp)

Previous work simply used large kernels in their convolutional layers to capture enough of an object to learn useful features, however this comes at the cost of increased computation. As an alternative, the authors propose their Strip R-CNN architecture.

In Strip R-CNN, the convolutional layers use orthogonal large strip convolutions in its backbone, StripNet. Additionally, they inject some strip convolutions into the detection head.

### Strip R-CNN

#### Strip Module

The strip module is the building block of the StripNet backbone, it attempts to combine the benefits of standard square convolution and large kernel strip convolution.

An tensor is received as input: $X \in {\mathbb{R}}^{C\times H\times W}$ where $C$ is the number of channels, and $H$ and $W$ are the height and width of the input tensor.

The first step is to apply a depth-wise convolution with square kernels, which the authors note is a $5\times 5$ square kernel in practice. This extracts local features.

Then, two sequential depth-wise large kernel strip convolutions are applied. First horizontally ($1\times K$) and then vertically ($K\times 1$). This extracts features for long or thin structures in each direction. Note, however, that the authors found no significant difference in the order of horizontal and vertical. The choice of $K$ will be discussed later.

Next, a point-wise convolution is applied, allowing for interaction along the channel dimension which had not occurred up to this point because of the use of depth-wise convolutions in the previous layers.

Finally, this last tensor is considered to be spatial attention weights, and is element-wise multiplied with the input to the module, similar to the MSCA module in SegNeXt.

![striprcnn_strip_module](/images/notes/striprcnn_strip_module.webp)

#### Detection Head w/ Strip Convolutions

The authors contrast their construction of the detection head with that of [Oriented R-CNN](https://arxiv.org/abs/2108.05699). In that network, the regions of interest are processed by two linear layers to extract features which are then used for both the classification linear layer and the localization + angle linear layer. However, the authors argue that linear layers don't extract spatial information very well.

For their proposed alternative, called the Strip Head, the authors seek to further decouple the classification output and localization output by having them process the regions of interest in parallel branches rather than sharing the two linear layers. Additionally, the prediction of the rotation angle is lumped in with the classification branch rather than the localization branch.

So, let's start by describing the classification branch. The regions of interest tensors are the input and they are processed by two linear layers with hidden / output dimensions of $1024$. Finally, another linear layer is used to produce the class probabilities.

For the prediction of the rotation angle, we still use the same output of the two linear layers prior to the classification linear layer, but now we use a different linear layer to regress the rotation angle. In other words, the first two linear layers are shared between the classification and rotation prediction heads, but then they each have their own linear layer for their respective task.

Then, for the localization head, the authors propose the use of large strip convolutions to model longer range relationships and more successfully extract features for high aspect ratio objects. So first, a $3\times 3$ convolution is applied to capture local features, then a Strip Module is applied (square conv, strip conv in one direction, strip conv in another direction), and finally a linear layer to predict the $(x,y,w,h)$ of the object.

See below for the comparison between the Oriented R-CNN Head and the Strip Head:

![striprcnn_strip_head](/images/notes/striprcnn_strip_head.webp)

### Experiments

### Datasets

The authors benchmark this model on the DOTA-v1.0, DOTA-v1.5, FAIR1M-v1.0, HRSC2016, and DIOR-R datasets.

#### Training Settings

First, the StripNet backbones are trained on ImageNet for 300 epochs. I've searched through the authors' GitHub, but have not found any other information about hyper-params for this stage.

Then, the models are used as backbones for rotated object detection in the aforementioned datasets. For these training runs:

- 300 epochs (100 for ablation studies)
- Epochs:
  - 36 epochs for HRSC2016
  - 12 epochs for the other datasets
- Learning rates:
  - 0.0004 for HRSC2016
  - 0.0001 for the other datasets
- Image resolution:
  - $800\times 800$ for HRSC2016 and DIOR-R
  - $1024\times 1024$ for the other datasets
- Optimizer:
  - AdamW
  - Beta1=0.9, Beta2=0.999
  - Weight decay = 0.05
- Batch size = 8
- Num GPUs = 8 NVIDIA 3090s for train, 1 3090 for test

#### Results

Across each benchmark dataset, Strip R-CNN is able to outperform many other task-specific networks, while often requiring fewer FLOPs.

The most extensive comparisons are provided for the DOTA-v1.0 dataset, where per-class AP scores are provided along with mAP, number of parameters, and FLOPs. Scores are provided for both single-scale prediction and multi-scale prediction.

Strip R-CNN-T does not achieve SOTA compared to other models, but it is highly competitive and has many fewer parameters: 20.5M vs the 31M for LSKNet-S which beats it on mAP by only $+ 0.24$. Strip R-CNN-S, however, is able to surpass all other models that it was compared to in mAP, beating LSKNet-S by $+ 0.64$ while having 30.5M parameters.

#### Ablation Studies

##### Strip Conv Kernel Size

For their ablation studies, the authors began with a kernel size of 11, and increased in increments of 4, evaluating $k = 11,$ $k = 15$, $k = 19$. The authors found that the sweet spot is $k = 19$, which yielded the best performance in the ablation study.

They also evaluated using increasing / decreasing kernel sizes through the four stages of the network, $(15,17,19,21)$ and $(21,19,17,15)$ and found that former produced a much lower result. The authors hypothesize that earlier layers benefit from a larger receptive field. In either case, the $(19,19,19,19)$ configuration performed the best out of all configurations.

##### Strip Module Design

The authors perform ablation experiments tweaking the individual components of the strip module. They find that:

- Removing the $5\times 5$ depth-wise conv results in a drop in performance
- Performing the strip convolutions one after the other is better than in parallel
- Using a $19\times 19$ square convolution or a $7\times 7$ convolution with a dilation of 3 both result in lower performance than using the $k = 19$ strip convolutions

##### StripNet Backbone Effectiveness

The authors also evaluate StripNet as a drop-in replacement for other object detection models, adopting their head. They find that simply swapping out these models' original backbone with StripNet results in improved performance in object detection.

##### Strip Head Design

The authors observe what happens when tweaking parts of the Strip head. Their approach is to experiment with what component of the prediction is handled by what learnable module. The prediction components are $(x,y,w,h,cls,\theta)$. So, for example, they try things like having the strip module handle $(x,y)$, a conv module handle $(w,h)$, and fully connected layers handle $(cls,\theta)$.

Ultimately, they find that the best configuration is: $(x,y,w,h)_{strip},(cls,\theta)_{fc}$ as outlined in the architecture description above.

##### Strip Head Effectiveness

Similar to the backbone effectiveness ablation experiments, the authors try using the Strip Head as a drop-in replacement in other remote sensing object detection architectures, and find that it improves performance.

### Eigen-CAM Analysis

Using the [Eigen-CAM](https://arxiv.org/abs/2008.00299) method, the authors observe visualizations for multiple models, including Strip R-CNN and find that the activation maps show better localization on high aspect ratio objects in an image:

![strip_rcnn_eigen_cam](/images/notes/strip_rcnn_eigen_cam.webp)

Update from 2026: I was wondering which layer the Eigen-CAM visualizations targeted. In a [GitHub issue](https://github.com/HVision-NKU/Strip-R-CNN/issues/23), it was revealed to be "the FPN layer".
