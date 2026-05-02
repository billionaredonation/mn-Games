import { register, show } from '../../src/router.js';
import { state, save } from '../../src/state.js';
import { getCityConfig, normalizeCityId } from '../../src/cities/index.js';

const V = '112';

function money(value) {
  return Number(value || 0).toLocaleString('ru-RU') + ' грн';
}

function renderJobs(city) {
  return city.jobs.map((job) => `
    <button class="home-job" data-job-id="${job.id}">
      <strong>${job.title}</strong>
      <span>${job.description}</span>
      <b>${money(job.pay)} / смена</b>
    </button>
  `).join('');
}

register('home', (root) => {
  const cityId = normalizeCityId(state.city);
  const city = getCityConfig(cityId);

  if (state.city !== cityId) {
    state.city = cityId;
    save();
  }

  root.className = 'page home';

  root.innerHTML = `
    <section class="home-shell">
      <header class="home-top">
        <div>
          <div class="home-region">${city.region}</div>
          <h1>${city.name}</h1>
        </div>

        <button id="resetBtn" class="home-reset">Сброс</button>
      </header>

      <div class="home-map-card">
        <img class="city-map-image" src="${city.map}?v=${V}" alt="${city.name}">
      </div>

      <nav class="home-menu">
        <button id="profileBtn">Профиль</button>
        <button id="jobsBtn">Работы</button>
        <button id="houseBtn">Дома</button>
        <button id="settingsBtn">Настройки</button>
      </nav>

      <main id="homeInfo" class="home-info">
        <h2>Главное меню</h2>
        <h3>${city.tagline}</h3>
        <p>Добро пожаловать, ${state.nickname || 'игрок'}.</p>

        <div class="home-feature">
          <strong>${city.specialty.label}: ${city.specialty.value}</strong>
          <p>${city.specialty.description}</p>
        </div>

        <h3>Работы города</h3>
        <div class="home-jobs">
          ${renderJobs(city)}
        </div>
      </main>
    </section>
  `;

  const img = root.querySelector('.city-map-image');
  img.addEventListener('error', () => {
    img.onerror = null;
    img.src = './UkraineMap.png?v=' + V;
  });

  root.querySelector('#resetBtn').onclick = resetProgress;
  root.querySelector('#profileBtn').onclick = () => showProfile(root, city);
  root.querySelector('#jobsBtn').onclick = () => showJobs(root, city);
  root.querySelector('#houseBtn').onclick = () => showHousing(root, city);
  root.querySelector('#settingsBtn').onclick = () => showSettings(root, city);

  root.querySelector('#homeInfo').addEventListener('click', (event) => {
    const button = event.target.closest('.home-job');
    if (!button) return;

    const job = city.jobs.find((item) => item.id === button.dataset.jobId);
    if (job) showJob(root, city, job);
  });
});

function setPanel(root, html) {
  root.querySelector('#homeInfo').innerHTML = html;
}

function showProfile(root, city) {
  setPanel(root, `
    <h2>Профиль</h2>
    <h3>${state.nickname || 'Игрок'} в городе ${city.name}</h3>
    <p>${city.profileTitle}</p>
    <p>${city.profileText}</p>
    <p><strong>Стартовый капитал:</strong> ${money(city.startMoney)}</p>
  `);
}

function showJobs(root, city) {
  setPanel(root, `
    <h2>Работы города</h2>
    <h3>${city.name}: ${city.jobs.length} варианта заработка</h3>
    <div class="home-jobs">
      ${renderJobs(city)}
    </div>
  `);
}

function showJob(root, city, job) {
  setPanel(root, `
    <h2>Работа</h2>
    <h3>${job.title}</h3>
    <p><strong>${money(job.pay)} за смену</strong></p>
    <p>${job.description}</p>
    <p>Бонус города: ${city.specialty.value}</p>
  `);
}

function showHousing(root, city) {
  setPanel(root, `
    <h2>Недвижимость</h2>
    <h3>${city.housing.title}</h3>
    <p><strong>От ${money(city.housing.minPrice)}</strong></p>
    <p>${city.housing.description}</p>
    <p>${city.housing.bonus}</p>
  `);
}

function showSettings(root, city) {
  setPanel(root, `
    <h2>Настройки</h2>
    <h3>${city.name}</h3>
    <p>Папка города: src/cities/${city.id}</p>
    <p>Тип экономики: ${city.economyType}</p>
  `);
}

function resetProgress() {
  localStorage.removeItem('mn-game-state');
  state.nickname = null;
  state.city = null;
  state.cityName = null;
  state.regionId = null;
  show('welcome1');
}
