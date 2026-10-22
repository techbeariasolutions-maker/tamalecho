// Lee el catálogo real para que las E2E no escriban números a mano.
import { readFileSync } from 'node:fs';

export const catalog = JSON.parse(readFileSync(new URL('../../src/data/tips.json', import.meta.url), 'utf8'));

export const tipsOf = (framework, category) =>
  catalog.tips.filter((tip) => tip.framework === framework && (!category || tip.category === category));

export const categoriesOf = (framework) => [...new Set(tipsOf(framework).map((tip) => tip.category))];
