import type { ImageMetadata } from 'astro';
import salemNeonAntiques from '../assets/photos/salem-neon-antiques.jpg';
import grainSilosDusk from '../assets/photos/grain-silos-dusk.jpg';
import dappledFacade from '../assets/photos/dappled-facade.jpg';
import terrierWindowLight from '../assets/photos/terrier-window-light.jpg';
import greenhousesNight from '../assets/photos/greenhouses-night.jpg';
import beachMotelDiptych from '../assets/photos/beach-motel-diptych.jpg';
import domeSnow from '../assets/photos/dome-snow.jpg';
import fogSunriseOutcrop from '../assets/photos/fog-sunrise-outcrop.jpg';

export interface Photo {
  src: ImageMetadata;
  alt: string;
  /* Caption in the homepage portrait's voice (stock · place · year); empty hides the line. */
  caption: string;
}

export const photos: Photo[] = [
  {
    src: salemNeonAntiques,
    alt: 'Antique shop interior at night, a shaft of light on felt pennants beside a neon Salem sign',
    caption: '',
  },
  {
    src: grainSilosDusk,
    alt: 'Three steel grain silos under a broken sunset sky',
    caption: '',
  },
  {
    src: dappledFacade,
    alt: 'Black-and-white brick facade with dappled light falling across rows of windows',
    caption: '',
  },
  {
    src: terrierWindowLight,
    alt: 'Black terrier with a red bow lying on a leather ottoman in window light',
    caption: '',
  },
  {
    src: greenhousesNight,
    alt: 'Row of greenhouses glowing blue and orange against a black night sky',
    caption: '',
  },
  {
    src: beachMotelDiptych,
    alt: 'Half-frame diptych: a family and dog on an overcast beach; a teal motel with a lone palm',
    caption: '',
  },
  {
    src: domeSnow,
    alt: 'Grainy black-and-white photo of a domed brick building behind a snow-covered lawn',
    caption: '',
  },
  {
    src: fogSunriseOutcrop,
    alt: 'Golden fog over bare trees at sunrise, seen from a rock outcrop',
    caption: '',
  },
];
