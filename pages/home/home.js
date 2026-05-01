import { register, show } from '../../src/router.js?v=37';
import { state, save } from '../../src/state.js?v=37';

const V = '33';

const CITY_MAPS = {
  vinnytsia: { name: 'Винница', map: './VinitsaMap.png?v=' + V },
  lutsk: { name: 'Луцк', map: './LutskMap.png?v=' + V },
  luhansk: { name: 'Луганск', map: './LuganskMap.png?v=' + V },
  dnipro: { name: 'Днепр', map: './DneprMap.png?v=' + V },
  donetsk: { name: 'Донецк', map: './DonetskMap.png?v=' + V },
  zhytomyr: { name: 'Житомир', map: './ZutomyrMap.png?v=' + V },
  uzhhorod: { name: 'Ужгород', map: './UzgorodMap.png?v=' + V },
  zaporizhzhia: { name: 'Запорожье', map: './Zaporozya.png?v=' + V },
  'ivano-frankivsk': { name: 'Ивано-Франковск', map: './IvanoFrankovsk.png?v=' + V },
  kyiv: { name: 'Киев', map: './KiyvMap.png?v=' + V },
  kropyvnytskyi: { name: 'Кропивницкий', map: './Kropivnitskyi.png?v=' + V },
  crimea: { name: 'Крым', map: './KrymMap.png?v=' + V },
  lviv: { name: 'Львов', map: './Lviv.png?v=' + V },
  mykolaiv: { name: 'Николаев', map: './Nikolaev.png?v=' + V },
  odesa: { name: 'Одесса', map: './Odessa.png?v=' + V },
  poltava: { name: 'Полтава', map: './Poltava.png?v=' + V },
  rivne: { name: 'Ровно', map: './Rovno.png?v=' + V },
  sumy: { name: 'Сумы', map: './Sumy.png?v=' + V },
  ternopil: { name: 'Тернополь', map: './Ternopil.png?v=' + V },
  kharkiv: { name: 'Харьков', map: './Kharkiv.png?v=' + V },
  kherson: { name: 'Херсон', map: './Kherson.png?v=' + V },
  khmelnytskyi: { name: 'Хмельницкий', map: './Khmelnitskiy.png?v=' + V },
  cherkasy: { name: 'Черкассы', map: './CherkasyMap.png?v=' + V },
  chernihiv: { name: 'Чернигов', map: './ChernigovMap.png?v=' + V },
  chernivtsi: { name: 'Черновцы', map: './ChernivtsiMap.png?v=' + V }
};

const CITY_ID_ALIASES = {
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

function normalizeCityId(cityId) {
  return CITY_ID_ALIASES[cityId] || cityId;
}

register('home', (root) => {
  root.className = 'page home';

  const normalizedCityId = normalizeCityId(state.city);
  const city = CITY_MAPS[normalizedCityId] || CITY_MAPS.zaporizhzhia;

  if (state.city !== normalizedCityId) {
    state.city = normalizedCityId;
    save();
  }

  root.innerHTML = `
    <div class="home-top">
      <div>
        <h2>${city.name}</h2>
        <p>Добро пожаловать, ${state.nickname || 'игрок'}.</p>
      </div>

      <button class="home-reset-btn" id="resetBtn" type="button">Сбросить</button>
    </div>

    <div class="city-map-shell">
      <img class="city-map-image" src="${city.map}" alt="${city.name}" />

      <button class="map-icon profile-icon" id="profileBtn" type="button">
        <span class="map-icon-emoji">П</span>
        <span class="map-icon-label">Профиль</span>
      </button>

      <button class="map-icon jobs-icon" id="jobsBtn" type="button">
        <span class="map-icon-emoji">Р</span>
        <span class="map-icon-label">Работы</span>
      </button>

      <button class="map-icon house-icon" id="houseBtn" type="button">
        <span class="map-icon-emoji">Д</span>
        <span class="map-icon-label">Дома</span>
      </button>

      <button class="map-icon settings-icon" id="settingsBtn" type="button">
        <span class="map-icon-emoji">Н</span>
        <span class="map-icon-label">Настройки</span>
      </button>
    </div>

    <div class="home-info" id="homeInfo">
      Нажми на иконку на карте
    </div>
  `;

  const cityMapImage = root.querySelector('.city-map-image');

  cityMapImage.addEventListener('error', () => {
    cityMapImage.onerror = null;
    cityMapImage.src = './UkraineMap.png?v=' + V;
  });

  root.querySelector('#resetBtn').onclick = resetProgress;
  root.querySelector('#profileBtn').onclick = () =>
    info(root, `Профиль игрока: ${state.nickname || 'без ника'}`);

  root.querySelector('#jobsBtn').onclick = () =>
    info(root, 'Работы скоро появятся.');

  root.querySelector('#houseBtn').onclick = () =>
    info(root, 'Дома появятся позже.');

  root.querySelector('#settingsBtn').onclick = () =>
    info(root, 'Настройки скоро будут доступны.');
});

function info(root, text) {
  root.querySelector('#homeInfo').textContent = text;
}

function resetProgress() {
  localStorage.removeItem('mn-game-state');

  state.nickname = null;
  state.city = null;
  state.cityName = null;
  state.regionId = null;

  show('welcome1');
}
