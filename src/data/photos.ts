import type { ImageMetadata } from 'astro';
import salemNeonAntiques from '../assets/photos/salem-neon-antiques.jpg';
import ibisPineMoss from '../assets/photos/ibis-pine-moss.jpg';
import fogSunriseRidge from '../assets/photos/fog-sunrise-ridge.jpg';
import powerPlantNight from '../assets/photos/power-plant-night.jpg';
import lakeDockEgret from '../assets/photos/lake-dock-egret.jpg';
import birthdayDog from '../assets/photos/birthday-dog.jpg';
import snowFieldPhotographer from '../assets/photos/snow-field-photographer.jpg';
import grainSilosDusk from '../assets/photos/grain-silos-dusk.jpg';
import frameLamplight from '../assets/photos/frame-lamplight.jpg';
import fireworksSilhouette from '../assets/photos/fireworks-silhouette.jpg';
import dappledFacade from '../assets/photos/dappled-facade.jpg';
import smokestacksPinkPlume from '../assets/photos/smokestacks-pink-plume.jpg';
import whiteDogGrass from '../assets/photos/white-dog-grass.jpg';
import blurredPortraitBw from '../assets/photos/blurred-portrait-bw.jpg';
import greenhousesNight from '../assets/photos/greenhouses-night.jpg';
import houseplantLeafLight from '../assets/photos/houseplant-leaf-light.jpg';
import beachWadingFilm from '../assets/photos/beach-wading-film.jpg';
import snowFarmSheds from '../assets/photos/snow-farm-sheds.jpg';
import terrierWindowLight from '../assets/photos/terrier-window-light.jpg';
import rideTowerNight from '../assets/photos/ride-tower-night.jpg';
import tomatoVines from '../assets/photos/tomato-vines.jpg';
import knitOttomanBw from '../assets/photos/knit-ottoman-bw.jpg';
import workersMotionBlur from '../assets/photos/workers-motion-blur.jpg';
import dogWalkSnow from '../assets/photos/dog-walk-snow.jpg';
import beachMotelDiptych from '../assets/photos/beach-motel-diptych.jpg';
import fenceVinesSun from '../assets/photos/fence-vines-sun.jpg';
import lawnBlueHour from '../assets/photos/lawn-blue-hour.jpg';
import domeSnow from '../assets/photos/dome-snow.jpg';
import beachWadingPair from '../assets/photos/beach-wading-pair.jpg';
import gothicTowerNight from '../assets/photos/gothic-tower-night.jpg';
import paisleyHeadscarf from '../assets/photos/paisley-headscarf.jpg';
import paisleyEarmuff from '../assets/photos/paisley-earmuff.jpg';
import treeForkStreet from '../assets/photos/tree-fork-street.jpg';
import waterChopBw from '../assets/photos/water-chop-bw.jpg';
import goldBalloons from '../assets/photos/gold-balloons.jpg';
import bambooWindow from '../assets/photos/bamboo-window.jpg';
import umbrellaRain from '../assets/photos/umbrella-rain.jpg';

export interface Photo {
  src: ImageMetadata;
  alt: string;
  /* Capture time (YYYY-MM-DDTHH:mm) from the export's metadata; empty sorts last. */
  taken: string;
  /* Caption in the homepage portrait's voice (stock · place · year); empty hides the line. */
  caption: string;
}

const entries: Photo[] = [
  {
    src: salemNeonAntiques,
    taken: '',
    alt: 'Antique shop interior at night, a shaft of light on felt pennants beside a neon Salem sign',
    caption: '',
  },
  {
    src: ibisPineMoss,
    taken: '2025-12-25T10:31',
    alt: 'White ibis perched high in a pine draped with Spanish moss against a blue sky',
    caption: '',
  },
  {
    src: fogSunriseRidge,
    taken: '2026-01-06T07:56',
    alt: 'Sun rising through fog over bare trees, seen from a rocky outcrop',
    caption: '',
  },
  {
    src: powerPlantNight,
    taken: '2026-01-11T18:07',
    alt: 'Black-and-white night view of a smoking power plant, a person in a Chappell Roan hoodie in the foreground',
    caption: '',
  },
  {
    src: lakeDockEgret,
    taken: '2025-12-25T06:12',
    alt: 'Still lake reflecting clouds, an egret flying low past a wooden dock',
    caption: '',
  },
  {
    src: birthdayDog,
    taken: '2026-06-12T16:32',
    alt: "Fluffy tan dog in a blue 18 party hat and birthday bandana, held in someone's arms",
    caption: '',
  },
  {
    src: snowFieldPhotographer,
    taken: '2026-01-31T10:04',
    alt: 'Black-and-white snowy field, a person in dark clothes raising a camera',
    caption: '',
  },
  {
    src: grainSilosDusk,
    taken: '2026-06-21T19:11',
    alt: 'Three steel grain silos under a broken sunset sky',
    caption: '',
  },
  {
    src: frameLamplight,
    taken: '2025-12-31T09:53',
    alt: 'Picture frame on a dim wall reflecting a lit curtained window, beaded hangings beside it',
    caption: '',
  },
  {
    src: fireworksSilhouette,
    taken: '2026-07-02T20:01',
    alt: 'Silhouetted head in front of firework sparks and smoke between trees',
    caption: '',
  },
  {
    src: dappledFacade,
    taken: '',
    alt: 'Black-and-white brick facade with dappled light falling across rows of windows',
    caption: '',
  },
  {
    src: smokestacksPinkPlume,
    taken: '2025-12-19T07:28',
    alt: 'Two smokestacks against a blue sky, one trailing pink-lit steam',
    caption: '',
  },
  {
    src: whiteDogGrass,
    taken: '2026-07-28T18:02',
    alt: 'Shaggy white dog on a leash nosing through grass in low sun',
    caption: '',
  },
  {
    src: blurredPortraitBw,
    taken: '2025-12-07T18:05',
    alt: 'Black-and-white long exposure of a laughing face smeared into overlapping ghosts',
    caption: '',
  },
  {
    src: greenhousesNight,
    taken: '2026-01-11T18:34',
    alt: 'Row of greenhouses glowing blue and orange against a black night sky',
    caption: '',
  },
  {
    src: houseplantLeafLight,
    taken: '2026-01-30T13:16',
    alt: 'Sunlit houseplant leaves, one browning at the edge, beside a pale wall',
    caption: '',
  },
  {
    src: beachWadingFilm,
    taken: '2026-01-02T19:55',
    alt: "Two people wading at the ocean's edge on a clear day",
    caption: '',
  },
  {
    src: snowFarmSheds,
    taken: '2026-01-31T10:12',
    alt: 'Black-and-white farmstead of sheds and a grain leg in snow under bright haze',
    caption: '',
  },
  {
    src: terrierWindowLight,
    taken: '2026-06-06T10:56',
    alt: 'Black terrier with a red bow lying on a leather ottoman in window light',
    caption: '',
  },
  {
    src: rideTowerNight,
    taken: '2026-10-03T19:12',
    alt: 'Amusement ride tower lit red and white against a night sky',
    caption: '',
  },
  {
    src: tomatoVines,
    taken: '2026-10-03T12:16',
    alt: 'Tomato vines with small ripening fruit, a garden blurred behind',
    caption: '',
  },
  {
    src: knitOttomanBw,
    taken: '2026-01-30T13:19',
    alt: 'Black-and-white close-up of a knit ottoman curving out of the light',
    caption: '',
  },
  {
    src: workersMotionBlur,
    taken: '2026-09-10T08:18',
    alt: 'Motion-blurred figures in orange vests around a white bundle near a truck',
    caption: '',
  },
  {
    src: dogWalkSnow,
    taken: '2026-01-24T19:01',
    alt: 'Small dog in a green coat on a leash, walking across snow in warm light',
    caption: '',
  },
  {
    src: beachMotelDiptych,
    taken: '',
    alt: 'Half-frame diptych: a family and dog on an overcast beach; a teal motel with a lone palm',
    caption: '',
  },
  {
    src: fenceVinesSun,
    taken: '2026-10-25T07:37',
    alt: 'Sun through vines grown over a chain-link fence',
    caption: '',
  },
  {
    src: lawnBlueHour,
    taken: '2026-07-02T19:52',
    alt: 'Shallow-focus view across a dark green lawn under a blue sky',
    caption: '',
  },
  {
    src: domeSnow,
    taken: '',
    alt: 'Grainy black-and-white photo of a domed brick building behind a snow-covered lawn',
    caption: '',
  },
  {
    src: beachWadingPair,
    taken: '2025-12-26T08:26',
    alt: 'Two people standing in the surf, one in a yellow top and floral skirt',
    caption: '',
  },
  {
    src: gothicTowerNight,
    taken: '2026-01-11T18:40',
    alt: 'Black-and-white low angle of a floodlit gothic tower against a black sky',
    caption: '',
  },
  {
    src: paisleyHeadscarf,
    taken: '2026-01-16T17:15',
    alt: 'Person seen from behind in a green and red paisley headscarf, a frosted lawn beyond',
    caption: '',
  },
  {
    src: paisleyEarmuff,
    taken: '2026-01-17T18:03',
    alt: 'Back of a head in a paisley headscarf with a fuzzy white bunny earmuff',
    caption: '',
  },
  {
    src: treeForkStreet,
    taken: '2026-03-14T07:21',
    alt: 'Forked tree trunk on a sunny sidewalk, a crosswalk signal and traffic light behind',
    caption: '',
  },
  {
    src: waterChopBw,
    taken: '2026-03-22T16:10',
    alt: 'Black-and-white choppy water stretching to the horizon past a stone ledge',
    caption: '',
  },
  {
    src: goldBalloons,
    taken: '2026-05-17T15:16',
    alt: 'Gold foil number balloons slumped on the floor by a door and a tinsel curtain',
    caption: '',
  },
  {
    src: bambooWindow,
    taken: '2026-06-06T10:58',
    alt: 'Bamboo leaves silhouetted against a hazy window',
    caption: '',
  },
  {
    src: umbrellaRain,
    taken: '2026-06-07T12:00',
    alt: 'Rain dripping off the edge of a patio umbrella against blurred trees',
    caption: '',
  },
];

/* Newest first; undated photos keep their listed order at the end. */
export const photos = [...entries].sort((a, b) => {
  if (!a.taken || !b.taken) return Number(!a.taken) - Number(!b.taken);

  return b.taken.localeCompare(a.taken);
});
