import { city as cherkasy } from './cherkasy/index.js';
import { city as chernihiv } from './chernihiv/index.js';
import { city as chernivtsi } from './chernivtsi/index.js';
import { city as crimea } from './crimea/index.js';
import { city as dnipro } from './dnipro/index.js';
import { city as donetsk } from './donetsk/index.js';
import { city as ivanoFrankivsk } from './ivano-frankivsk/index.js';
import { city as kharkiv } from './kharkiv/index.js';
import { city as kherson } from './kherson/index.js';
import { city as khmelnytskyi } from './khmelnytskyi/index.js';
import { city as kropyvnytskyi } from './kropyvnytskyi/index.js';
import { city as kyiv } from './kyiv/index.js';
import { city as luhansk } from './luhansk/index.js';
import { city as lutsk } from './lutsk/index.js';
import { city as lviv } from './lviv/index.js';
import { city as mykolaiv } from './mykolaiv/index.js';
import { city as odesa } from './odesa/index.js';
import { city as poltava } from './poltava/index.js';
import { city as rivne } from './rivne/index.js';
import { city as sumy } from './sumy/index.js';
import { city as ternopil } from './ternopil/index.js';
import { city as uzhhorod } from './uzhhorod/index.js';
import { city as vinnytsia } from './vinnytsia/index.js';
import { city as zaporizhzhia } from './zaporizhzhia/index.js';
import { city as zhytomyr } from './zhytomyr/index.js';

export const CITY_ID_ALIASES = {
  odessa: 'odesa',
  kiev: 'kyiv',
  kiyv: 'kyiv',
  zaporizhia: 'zaporizhzhia',
  zaporizhzhya: 'zaporizhzhia',
  zaporozhye: 'zaporizhzhia',
  ivanoFrankivsk: 'ivano-frankivsk',
  'ivano-frankovsk': 'ivano-frankivsk',
  krym: 'crimea',
  crimeaMap: 'crimea',
  rovno: 'rivne',
  nikolaev: 'mykolaiv',
  chernigov: 'chernihiv',
  khmelnitskiy: 'khmelnytskyi',
  zutomyr: 'zhytomyr'
};

export const cities = {
  cherkasy,
  chernihiv,
  chernivtsi,
  crimea,
  dnipro,
  donetsk,
  'ivano-frankivsk': ivanoFrankivsk,
  kharkiv,
  kherson,
  khmelnytskyi,
  kropyvnytskyi,
  kyiv,
  luhansk,
  lutsk,
  lviv,
  mykolaiv,
  odesa,
  poltava,
  rivne,
  sumy,
  ternopil,
  uzhhorod,
  vinnytsia,
  zaporizhzhia,
  zhytomyr
};

export function normalizeCityId(cityId) {
  return CITY_ID_ALIASES[cityId] || cityId || 'zaporizhzhia';
}

export function getCityConfig(cityId) {
  return cities[normalizeCityId(cityId)] || cities.zaporizhzhia;
}
