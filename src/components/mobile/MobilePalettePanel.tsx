import React from 'react';
import { PaletteEditor } from '../panels/PaletteEditor';
import { MobilePanel } from './MobilePanel';

export const MobilePalettePanel: React.FC = () => (
  <MobilePanel title="Палитра">
    <PaletteEditor layout="grid" />
  </MobilePanel>
);
