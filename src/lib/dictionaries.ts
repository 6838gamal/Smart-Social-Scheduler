import { en } from './dictionaries/en';
import { ar } from './dictionaries/ar';

export const dictionaries = {
  en,
  ar,
};

export type Locale = keyof typeof dictionaries;
