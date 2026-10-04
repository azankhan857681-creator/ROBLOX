import { CatalogGame } from '../types';
import rawCatalog from './catalogData.json';

export const ROBLOX_MAIN_CATALOG: CatalogGame[] = rawCatalog as CatalogGame[];

export const GENRE_FILTERS = [
  'All',
  'Popular',
  'Anime / Action RPG',
  'Horror',
  'Roleplay / Pets',
  'PvP / Strategy',
  'Tycoon / Collect',
  'Fashion / Social',
  'Simulation',
  'Parkour / Obby',
];
