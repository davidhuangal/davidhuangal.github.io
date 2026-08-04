export interface Project {
  name: string;
  description: string;
  url: string;
  meta: string;
}

export const projects: Project[] = [
  {
    name: 'geo-vlms',
    description:
      'A remote-sensing-focused harness for evaluating vision-language models, built for fast feedback on where they succeed and fail. Work in progress.',
    url: 'https://github.com/davidhuangal/geo-vlms',
    meta: 'Python',
  },
  {
    name: 'efficientvit_mmseg',
    description:
      'Adapting the EfficientViT segmentation models for use with MMSegmentation, so they can be trained and benchmarked inside the OpenMMLab ecosystem.',
    url: 'https://github.com/davidhuangal/efficientvit_mmseg',
    meta: 'Python',
  },
  {
    name: 'more_mmseg_models',
    description: 'Ports of additional segmentation architectures to MMSegmentation.',
    url: 'https://github.com/davidhuangal/more_mmseg_models',
    meta: 'Python',
  },
  {
    name: 'SegNeXt architecture explainer',
    description:
      'A video walkthrough of the SegNeXt architecture and its convolutional attention design, companion to the written note.',
    url: 'https://www.youtube.com/watch?v=rzmGGjqnmss',
    meta: 'Video',
  },
];
