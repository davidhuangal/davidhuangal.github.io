import path from 'node:path';
import type { ImageMetadata } from 'astro';
import sharp from 'sharp';
import type { Photo } from './photos';

/* Build-time color grouping: each photo's mean CIELAB color, chained so neighbors look alike. */

type Lab = [number, number, number];

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/photos/*.jpg', {
  eager: true,
});

/* lightness counts half, so hue and saturation drive the order */
const L_WEIGHT = 0.5;

const toLinear = (c: number) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};

const toLab = (r: number, g: number, b: number): Lab => {
  const [lr, lg, lb] = [r, g, b].map(toLinear);
  const x = (0.4124 * lr + 0.3576 * lg + 0.1805 * lb) / 0.95047;
  const y = 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
  const z = (0.0193 * lr + 0.1192 * lg + 0.9505 * lb) / 1.08883;
  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : ((24389 / 27) * t + 16) / 116);

  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
};

const meanLab = async (photo: Photo): Promise<Lab> => {
  const key = Object.keys(files).find((k) => files[k].default === photo.src);
  if (!key) throw new Error(`colorSort: no file for "${photo.alt}"`);

  const file = path.resolve('src/data', key);
  const data = await sharp(file).resize(32, 32, { fit: 'fill' }).removeAlpha().raw().toBuffer();

  const sum: Lab = [0, 0, 0];
  for (let i = 0; i < data.length; i += 3) {
    toLab(data[i], data[i + 1], data[i + 2]).forEach((v, j) => (sum[j] += v));
  }

  const n = data.length / 3;
  return sum.map((v) => v / n) as Lab;
};

const dist = (p: Lab, q: Lab) =>
  Math.hypot(L_WEIGHT * (p[0] - q[0]), p[1] - q[1], p[2] - q[2]);

const pathLen = (order: number[], d: number[][]) =>
  order.slice(1).reduce((sum, v, i) => sum + d[order[i]][v], 0);

/* nearest-neighbor chain from every start, keep the shortest, then 2-opt until stable */
const shortPath = (d: number[][]) => {
  const n = d.length;
  let best: number[] = [];

  for (let start = 0; start < n; start++) {
    const order = [start];
    const left = new Set([...Array(n).keys()].filter((i) => i !== start));

    while (left.size) {
      const last = order[order.length - 1];
      const next = [...left].reduce((a, b) => (d[last][b] < d[last][a] ? b : a));
      order.push(next);
      left.delete(next);
    }

    if (!best.length || pathLen(order, d) < pathLen(best, d)) best = order;
  }

  for (let improved = true; improved; ) {
    improved = false;

    for (let i = 0; i < n - 1; i++) {
      for (let j = i + 1; j < n; j++) {
        const next = [...best.slice(0, i), ...best.slice(i, j + 1).reverse(), ...best.slice(j + 1)];

        if (pathLen(next, d) < pathLen(best, d) - 1e-9) {
          best = next;
          improved = true;
        }
      }
    }
  }

  return best;
};

/* Months stay in the given (date) order; within a month, photos chain by color.
   Each month's chain is flipped to start near where the previous month ended.
   Undated photos keep their order at the end. */
export const byMonth = async (photos: Photo[]) => {
  const labs = await Promise.all(photos.map(meanLab));
  const d = labs.map((p) => labs.map((q) => dist(p, q)));

  const months = new Map<string, number[]>();
  photos.forEach((photo, i) => {
    const key = photo.taken.slice(0, 7);
    months.set(key, [...(months.get(key) ?? []), i]);
  });

  const out: number[] = [];

  for (const [key, ids] of months) {
    if (!key) {
      out.push(...ids);
      continue;
    }

    const sub = ids.map((i) => ids.map((j) => d[i][j]));
    const chain = shortPath(sub).map((k) => ids[k]);
    const prev = out[out.length - 1];

    if (prev !== undefined && d[prev][chain[chain.length - 1]] < d[prev][chain[0]]) chain.reverse();
    out.push(...chain);
  }

  return out.map((i) => photos[i]);
};
