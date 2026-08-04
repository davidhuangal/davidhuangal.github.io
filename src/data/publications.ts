export interface Publication {
  title: string;
  authors: string[];
  venue: string;
  year: number;
  url: string;
  firstAuthor: boolean;
  /** Featured on the homepage: first-author work plus the most cited / most interesting. */
  selected?: boolean;
}

// Bolding of "David Huangal" is handled at render time by matching the name.
export const publications: Publication[] = [
  {
    title: 'Differential Morphological Profile Neural Networks for Semantic Segmentation',
    authors: ['David Huangal', 'J. Alex Hurt'],
    venue: 'MDPI Remote Sensing',
    year: 2026,
    url: 'https://www.mdpi.com/2072-4292/18/8/1188',
    firstAuthor: true,
    selected: true,
  },
  {
    title: 'Evaluation of Road Segmentation Techniques on Visible and Infrared Low-Altitude UAS Imagery',
    authors: ['David Huangal', 'Grant J. Scott', 'Stanton R. Price'],
    venue: 'IEEE International Geoscience and Remote Sensing Symposium (IGARSS)',
    year: 2022,
    url: 'https://ieeexplore.ieee.org/abstract/document/9884542',
    firstAuthor: true,
    selected: true,
  },
  {
    title: 'Evaluating Deep Road Segmentation Techniques for Low-Altitude UAS Imagery',
    authors: ['David Huangal', 'Jeffrey Dale', 'J. Alex Hurt', 'Trevor M. Bajkowski', 'James M. Keller', 'Grant J. Scott', 'Stanton R. Price'],
    venue: 'SPIE Defense + Commercial Sensing',
    year: 2020,
    url: 'https://www.spiedigitallibrary.org/conference-proceedings-of-spie/11413/2557610/Evaluating-deep-road-segmentation-techniques-for-low-altitude-UAS-imagery/10.1117/12.2557610.full',
    firstAuthor: true,
    selected: true,
  },
  {
    title: 'Semantic Segmentation of Burned Areas in Sentinel-2 Satellite Imagery Using Deep Learning Transformer and Convolutional Attention Networks',
    authors: ['Anes Ouadou', 'David Huangal', 'Mariam Alshehri', 'Grant J. Scott', 'J. Alex Hurt'],
    venue: 'IEEE Journal on Selected Topics in Applied Remote Sensing (JSTARS)',
    year: 2025,
    url: 'https://ieeexplore.ieee.org/document/11071946',
    firstAuthor: false,
    selected: true,
  },
  {
    title: 'Semantic Segmentation of Burned Areas in Sentinel-2 Satellite Images Using Deep Learning Models',
    authors: ['Anes Ouadou', 'David Huangal', 'J. Alex Hurt', 'Grant J. Scott'],
    venue: 'IEEE International Geoscience and Remote Sensing Symposium (IGARSS)',
    year: 2023,
    url: 'https://ieeexplore.ieee.org/abstract/document/10282323',
    firstAuthor: false,
    selected: true,
  },
  {
    title: 'Evaluating Visuospatial Features for Tracking Hazards in Overhead UAS Imagery',
    authors: ['Trevor M. Bajkowski', 'J. Alex Hurt', 'David Huangal', 'Jeffery Dale', 'James Keller', 'Grant J. Scott', 'Stanton R. Price'],
    venue: 'IEEE Applied Imagery Pattern Recognition Workshop (AIPR)',
    year: 2021,
    url: 'https://ieeexplore.ieee.org/abstract/document/9762206',
    firstAuthor: false,
  },
  {
    title: 'Towards an Explainable AI Adjunct to Deep Network Obstacle Detection for Multisensor Vehicle Maneuverability Assessment',
    authors: ['Jeffery Dale', 'Trevor M. Bajkowski', 'J. Alex Hurt', 'David Huangal', 'Nelson Earle', 'James Keller', 'Grant J. Scott', 'Stanton R. Price'],
    venue: 'SPIE Defense + Commercial Sensing',
    year: 2021,
    url: 'https://www.spiedigitallibrary.org/conference-proceedings-of-spie/11746/117462H/Towards-an-explainable-AI-adjunct-to-deep-network-obstacle-detection/10.1117/12.2585906.full',
    firstAuthor: false,
  },
  {
    title: 'Differential Morphological Profile Neural Network for Maneuverability Hazard Detection in Unmanned Aerial System Imagery',
    authors: ['J. Alex Hurt', 'Grant J. Scott', 'David Huangal', 'Jeffery Dale', 'Trevor M. Bajkowski', 'James Keller', 'Stanton R. Price'],
    venue: 'SPIE Defense + Commercial Sensing',
    year: 2021,
    url: 'https://www.spiedigitallibrary.org/conference-proceedings-of-spie/11746/1174629/Differential-morphological-profile-neural-network-for-maneuverability-hazard-detection-in/10.1117/12.2585843.full',
    firstAuthor: false,
  },
  {
    title: 'Accumulating Confidence for Deep Neural Network Object Detections and Semantic Segmentations in Sequential UAS Imagery Through Spatiotemporal Feature Correspondences Generated From SFM Techniques',
    authors: ['Trevor M. Bajkowski', 'J. Alex Hurt', 'David Huangal', 'Jeffery Dale', 'James Keller', 'Grant J. Scott', 'Stanton R. Price'],
    venue: 'SPIE Defense + Commercial Sensing',
    year: 2021,
    url: 'https://www.spiedigitallibrary.org/conference-proceedings-of-spie/11746/117462V/Accumulating-confidence-for-deep-neural-network-object-detections-and-semantic/10.1117/12.2585905.full',
    firstAuthor: false,
  },
  {
    title: 'Enabling Machine-Assisted Visual Analytics for High-Resolution Remote Sensing Imagery With Enhanced Benchmark Meta-Dataset Training of NAS Neural Networks',
    authors: ['J. Alex Hurt', 'David Huangal', 'Curt H. Davis', 'Grant J. Scott'],
    venue: 'IEEE International Conference on Big Data',
    year: 2020,
    url: 'https://ieeexplore.ieee.org/abstract/document/9378199',
    firstAuthor: false,
  },
  {
    title: 'Spatiotemporal Maneuverability Hazard Analytics From Low-Altitude UAS Sensors',
    authors: ['Trevor M. Bajkowski', 'David Huangal', 'J. Alex Hurt', 'Jeffrey Dale', 'James Keller', 'Grant J. Scott', 'Stanton R. Price'],
    venue: 'IEEE Applied Imagery Pattern Recognition Workshop (AIPR)',
    year: 2020,
    url: 'https://ieeexplore.ieee.org/abstract/document/9425160',
    firstAuthor: false,
  },
  {
    title: 'Detection of Unknown Maneuverability Hazards in Low-Altitude UAS Color Imagery Using Linear Features',
    authors: ['Jeffery Dale', 'David Huangal', 'J. Alex Hurt', 'Trevor M. Bajkowski', 'James Keller', 'Grant J. Scott'],
    venue: 'IEEE Applied Imagery Pattern Recognition Workshop (AIPR)',
    year: 2020,
    url: 'https://ieeexplore.ieee.org/abstract/document/9425255',
    firstAuthor: false,
  },
  {
    title: 'Maneuverability Hazard Detection and Localization in Low-Altitude UAS Imagery',
    authors: ['J. Alex Hurt', 'David Huangal', 'Jeffery Dale', 'Trevor M. Bajkowski', 'James Keller', 'Grant J. Scott', 'Stanton R. Price'],
    venue: 'SPIE Defense + Commercial Sensing',
    year: 2020,
    url: 'https://www.spiedigitallibrary.org/conference-proceedings-of-spie/11413/114131K/Maneuverability-hazard-detection-and-localization-in-low-altitude-UAS-imagery/10.1117/12.2557609.full',
    firstAuthor: false,
  },
  {
    title: 'A Comparison of Deep Learning Vehicle Group Detection in Satellite Imagery',
    authors: ['J. Alex Hurt', 'David Huangal', 'Curt H. Davis', 'Grant J. Scott'],
    venue: 'IEEE International Conference on Big Data',
    year: 2019,
    url: 'https://ieeexplore.ieee.org/abstract/document/9006415',
    firstAuthor: false,
  },
];
