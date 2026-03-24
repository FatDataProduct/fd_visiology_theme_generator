import type { VisiologyTheme } from '../types/visiology';
import referenceThemeRaw from './referenceTheme.json';

export const referenceTheme = referenceThemeRaw as unknown as VisiologyTheme;

export const DEFAULT_PALETTE_COLORS = [
  { id: 'cb374a832342428cb43a0453a9b72566', role: 'Accent 1', value: 'rgba(40, 238, 150, 1)' },
  { id: '2abdb6d33c6d488ea6fd2c4cf523ca3c', role: 'Accent 2', value: 'rgba(255, 217, 0, 1)' },
  { id: 'd2ae42eb1a4f4d1eac27459dc0eb3117', role: 'Warning', value: 'rgba(255, 70, 69, 1)' },
  { id: '26c5d132a4384d46a23c2768257ecbaf', role: 'Neutral', value: 'rgba(181, 181, 181, 1)' },
  { id: 'b2f7bff68a584b308410f6102e232b31', role: 'Accent 3', value: 'rgba(60, 146, 255, 1)' },
  { id: '4fa8c45c46a04d0c965c0a3804fe691b', role: 'Accent 4', value: 'rgba(100, 229, 114, 1)' },
  { id: '0ff19cc5f29448fb82c78d5fd2ca535b', role: 'Accent 5', value: 'rgba(255, 150, 85, 1)' },
  { id: '0d1cfcf63ce64a37867fd95aeb74d7f2', role: 'Accent 6', value: 'rgba(255, 242, 99, 1)' },
  { id: '04369ae8d3714e1ab6f9e842b3b5bfb6', role: 'Accent 7', value: 'rgba(106, 249, 196, 1)' },
  { id: '93cc8a9f2f0f430a816dfc863692b8a8', role: 'Accent 8', value: 'rgba(145, 232, 225, 1)' },
];

export function getDefaultTheme(): VisiologyTheme {
  return JSON.parse(JSON.stringify(referenceTheme));
}
