import { register } from '../../src/router.js';
import { state, save } from '../../src/state.js';
import { normalizeCityId } from '../../src/cities/index.js';
import { hardReloadGame } from '../../src/lib/hardReload.js';

const V = '114';

const cityLoaders = {
  kyiv: () => import('../../src/cities/kyiv/index.js?v=114'),
  dnipro: () => import('../../src/cities/dnipro/index.js?v=114'),
  donetsk: () => import('../../src/cities/donetsk/index.js?v=114'),
  kharkiv: () => import('../../src/cities/kharkiv/index.js?v=114'),
  luhansk: () => import('../../src/cities/luhansk/index.js?v=114'),
  lutsk: () => import('../../src/cities/lutsk/index.js?v=114'),
  lviv: () => import('../../src/cities/lviv/index.js?v=114'),
  odesa: () => import('../../src/cities/odesa/index.js?v=114'),
  vinnytsia: () => import('../../src/cities/vinnytsia/index.js?v=114'),
  zaporizhzhia: () => import('../../src/cities/zaporizhzhia/index.js?v=114'),
  zhytomyr: () => import('../../src/cities/zhytomyr/index.js?v=114'),
};

function money(value) {
  return Number(value || 0).toLocaleString('ru-RU') + ' грн';
}

function renderJobs(city) {
  if (!city.jobs || !Array.isArray(city.jobs)) return '';

  return city.jobs.map((job) => `
    <button class="home-menu-btn home-job" data-job-id="${job.id}">
      <span class="home-menu-icon">₴</span>
      <span>${job.title}</span>
    </button>
  `).join('');
}

async function loadSelectedCity() {
  const normalizedCityId = normalizeCityId(state.city || 'zaporizhzhia');
  const loader = cityLoaders[normalizedCityId] || cityLoaders.zaporizhzhia;

  const module = await loader();
  const city = module.city || module.default;

  state.city = city.id;
  save();

  return city;
}

register('home', async (root) => {
  root.className = 'page home';

  root.innerHTML = `
    <section class="home-gameplay">
      <div class="home-ocean"></div>

      <div class="home-map-stage">
        <div class="home-hud home-hud-top">
          <div class="home-city-title">
            <span>Загрузка</span>
            <strong>Подключаем город...</strong>
          </div>

          <button class="home-reset-btn" type="button">Обновить</button>
        </div>
      </div>
    </section>
  `;

  const city = await loadSelectedCity();

  root.dataset.city = city.id;

  root.innerHTML = `
    <section class="home-gameplay">
      <div class="home-ocean"></div>

      <div class="home-map-stage">
        <img class="city-map-image" src="${city.map}?v=${V}" alt="${city.name}">

        <div class="home-hud home-hud-top">
          <div class="home-city-title">
            <span>${city.region || 'Регион'}</span>
            <strong>${city.name || 'Город'}</strong>
          </div>

          <button id="reloadGameBtn" class="home-reset-btn" type="button">
            Обновить
          </button>
        </div>

        <nav class="home-main-menu">
          <button id="profileBtn" class="home-menu-btn" type="button">
            <span class="home-menu-icon">👤</span>
            <span>Профиль</span>
          </button>

          <button id="jobsBtn" class="home-menu-btn" type="button">
            <span class="home-menu-icon">⚒</span>
            <span>Работы</span>
          </button>

          <button id="houseBtn" class="home-menu-btn" type="button">
            <span class="home-menu-icon">⌂</span>
            <span>Дома</span>
          </button>

          <button id="businessBtn" class="home-menu-btn" type="button">
            <span class="home-menu-icon">₴</span>
            <span>Бизнес</span>
          </button>

          <button id="tasksBtn" class="home-menu-btn" type="button">
            <span class="home-menu-icon">✓</span>
            <span>Задания</span>
          </button>

          <button id="settingsBtn" class="home-menu-btn" type="button">
            <span class="home-menu-icon">⚙</span>
            <span>Настройки</span>
          </button>
        </nav>
      </div>

      <main id="homeInfo" class="home-city-panel">
        <div class="home-city-heading">
          <span>Главное меню</span>
          <h3>${city.tagline || 'Городское меню'}</h3>
        </div>

        <div class="home-detail-card">
          <b>Добро пожаловать, ${state.nickname || 'игрок'}.</b>
          <p>${city.specialty?.label || 'Особенность'}: ${city.specialty?.value || 'Базовый старт'}</p>
          <small>${city.specialty?.description || 'Выбери действие в меню.'}</small>
        </div>
      </main>
    </section>
  `;

  const img = root.querySelector('.city-map-image');

  img.addEventListener('error', () => {
    img.onerror = null;
    img.src = './UkraineMap.png?v=' + V;
  });

  root.querySelector('#reloadGameBtn').onclick = hardReloadGame;
  root.querySelector('#profileBtn').onclick = () => showProfile(root, city);
  root.querySelector('#jobsBtn').onclick = () => showJobs(root, city);
  root.querySelector('#houseBtn').onclick = () => showHousing(root, city);
  root.querySelector('#businessBtn').onclick = () => showBusiness(root, city);
  root.querySelector('#tasksBtn').onclick = () => showTasks(root, city);
  root.querySelector('#settingsBtn').onclick = () => showSettings(root, city);

  root.querySelector('#homeInfo').addEventListener('click', (event) => {
    const button = event.target.closest('.home-job');
    if (!button) return;

    const job = city.jobs?.find((item) => item.id === button.dataset.jobId);
    if (job) showJob(root, city, job);
  });
});

function setPanel(root, html) {
  root.querySelector('#homeInfo').innerHTML = html;
}

function showProfile(root, city) {
  setPanel(root, `
    <div class="home-city-heading">
      <span>Профиль</span>
      <h3>${state.nickname || 'Игрок'} — ${city.name}</h3>
    </div>

    <div class="home-detail-card">
      <b>${city.profileTitle || 'Профиль игрока'}</b>
      <p>${city.profileText || 'Информация о персонаже появится позже.'}</p>
      <small>Стартовый капитал: ${money(city.startMoney)}</small>
    </div>
  `);
}

function showJobs(root, city) {
  setPanel(root, `
    <div class="home-city-heading">
      <span>Работы</span>
      <h3>${city.name}: доступные варианты заработка</h3>
    </div>

    <div class="home-main-menu home-inline-menu">
      ${renderJobs(city)}
    </div>
  `);
}

function showJob(root, city, job) {
  setPanel(root, `
    <div class="home-city-heading">
      <span>Работа</span>
      <h3>${job.title}</h3>
    </div>

    <div class="home-detail-card">
      <b>${money(job.pay)} за смену</b>
      <p>${job.description}</p>
      <small>Бонус города: ${city.specialty?.value || 'нет'}</small>
    </div>
  `);
}

function showHousing(root, city) {
  setPanel(root, `
    <div class="home-city-heading">
      <span>Недвижимость</span>
      <h3>${city.housing?.title || 'Недвижимость'}</h3>
    </div>

    <div class="home-detail-card">
      <b>От ${money(city.housing?.minPrice)}</b>
      <p>${city.housing?.description || 'Раздел недвижимости будет добавлен позже.'}</p>
      <small>${city.housing?.bonus || 'Пока без бонусов.'}</small>
    </div>
  `);
}

function showBusiness(root, city) {
  setPanel(root, `
    <div class="home-city-heading">
      <span>Бизнес</span>
      <h3>Скоро будет доступно</h3>
    </div>

    <div class="home-detail-card">
      <b>${city.name}: бизнес-направления</b>
      <p>Позже сюда добавим локальные бизнесы города: точки, склады, услуги, торговлю и прокачку дохода.</p>
      <small>Сейчас сначала собираем стабильное главное меню.</small>
    </div>
  `);
}

function showTasks(root, city) {
  setPanel(root, `
    <div class="home-city-heading">
      <span>Задания</span>
      <h3>Городские задания</h3>
    </div>

    <div class="home-detail-card">
      <b>${city.name}: первые квесты появятся позже</b>
      <p>Тут будут ежедневные задания, городские поручения и мини-цели для прокачки игрока.</p>
      <small>База готовится под RPG-экономику.</small>
    </div>
  `);
}

function showSettings(root, city) {
  setPanel(root, `
    <div class="home-city-heading">
      <span>Настройки</span>
      <h3>${city.name}</h3>
    </div>

    <div class="home-detail-card">
      <b>Техническая информация</b>
      <p>Папка города: src/cities/${city.id}/index.js</p>
      <small>Тип экономики: ${city.economyType || 'basic'}</small>
    </div>
  `);
}
