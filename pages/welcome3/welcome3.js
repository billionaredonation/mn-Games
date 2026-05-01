import { register, show } from '../../src/router.js?v=37';
import { state, save, getState } from '../../src/state.js?v=37';
import { citiesBase } from '../../src/data/citiesBase.js?v=37';
import { getInflation, getDevaluation, getStateAssetsShare } from '../../src/lib/economy.js?v=37';

const MAP_IMG = './UkraineMap.png?v=9';
const REGIONS_SVG = './ua.svg?v=5';
const CITY_MAP_VERSION = '33';
const FALLBACK_MAP_SRC = './UkraineMap.png';

const REGION_DATA = {
  UA05: { cityId: 'vinnytsia', cityName: 'Винница' },
  UA07: { cityId: 'lutsk', cityName: 'Луцк' },
  UA09: { cityId: 'luhansk', cityName: 'Луганск' },
  UA12: { cityId: 'dnipro', cityName: 'Днепр' },
  UA14: { cityId: 'donetsk', cityName: 'Донецк' },
  UA18: { cityId: 'zhytomyr', cityName: 'Житомир' },
  UA21: { cityId: 'uzhhorod', cityName: 'Ужгород' },
  UA23: { cityId: 'zaporizhzhia', cityName: 'Запорожье' },
  UA26: { cityId: 'ivano-frankivsk', cityName: 'Ивано-Франковск' },
  UA30: { cityId: 'kyiv', cityName: 'Киев' },
  UA32: { cityId: 'kyiv', cityName: 'Киев' },
  UA35: { cityId: 'kropyvnytskyi', cityName: 'Кропивницкий' },
  UA43: { cityId: 'crimea', cityName: 'Крым' },
  UA46: { cityId: 'lviv', cityName: 'Львов' },
  UA48: { cityId: 'mykolaiv', cityName: 'Николаев' },
  UA51: { cityId: 'odesa', cityName: 'Одесса' },
  UA53: { cityId: 'poltava', cityName: 'Полтава' },
  UA56: { cityId: 'rivne', cityName: 'Ровно' },
  UA59: { cityId: 'sumy', cityName: 'Сумы' },
  UA61: { cityId: 'ternopil', cityName: 'Тернополь' },
  UA63: { cityId: 'kharkiv', cityName: 'Харьков' },
  UA65: { cityId: 'kherson', cityName: 'Херсон' },
  UA68: { cityId: 'khmelnytskyi', cityName: 'Хмельницкий' },
  UA71: { cityId: 'cherkasy', cityName: 'Черкассы' },
  UA74: { cityId: 'chernihiv', cityName: 'Чернигов' },
  UA77: { cityId: 'chernivtsi', cityName: 'Черновцы' }
};

const CITY_MAPS = {
  vinnytsia: './VinitsaMap.png',
  lutsk: './LutskMap.png',
  luhansk: './LuganskMap.png',
  dnipro: './DneprMap.png',
  donetsk: './DonetskMap.png',
  zhytomyr: './ZutomyrMap.png',
  uzhhorod: './UzgorodMap.png',
  zaporizhzhia: './Zaporozya.png',
  'ivano-frankivsk': './IvanoFrankovsk.png',
  kyiv: './KiyvMap.png',
  kropyvnytskyi: './Kropivnitskyi.png',
  crimea: './KrymMap.png',
  lviv: './Lviv.png',
  mykolaiv: './Nikolaev.png',
  odesa: './Odessa.png',
  poltava: './Poltava.png',
  rivne: './Rovno.png',
  sumy: './Sumy.png',
  ternopil: './Ternopil.png',
  kharkiv: './Kharkiv.png',
  kherson: './Kherson.png',
  khmelnytskyi: './Khmelnitskiy.png',
  cherkasy: './CherkasyMap.png',
  chernihiv: './ChernigovMap.png',
  chernivtsi: './ChernivtsiMap.png'
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

const CITY_META = {
  vinnytsia: { title: 'Вінниця', subtitle: 'Затишне місто з легкою промисловістю та агро-стартапами.', jobs: ['Агробізнес', 'Пекарня', 'Сервіс'] },
  lutsk: { title: 'Луцьк', subtitle: 'Тихий обласний центр з деревообробкою та ІТ-аутсорсом.', jobs: ['Лісопилка', 'Склад', 'ІТ-аутсорс'] },
  luhansk: { title: 'Луганськ', subtitle: 'Колишній вуглепром — нові можливості для виробництва.', jobs: ['Шахта', 'Ремонт техніки', 'Логістика'] },
  dnipro: { title: 'Дніпро', subtitle: 'Логістика, виробництво, склади та міський бізнес.', jobs: ['Логістика', 'Склад', 'СТО'] },
  donetsk: { title: 'Донецьк', subtitle: 'Металургія й машинобудування у стадії відновлення.', jobs: ['Шахта', 'Метзавод', 'СТО'] },
  zhytomyr: { title: 'Житомир', subtitle: 'Видобуток каменю, переробка деревини та логістика.', jobs: ['Карʼєр', 'Пилорама', 'Склад'] },
  uzhhorod: { title: 'Ужгород', subtitle: 'Прикордоння, виноробство та туристичні сервіси.', jobs: ['Виноробня', 'Готель', 'Кавʼярня'] },
  zaporizhzhia: { title: 'Запоріжжя', subtitle: 'Індустріальний регіон із металургією та машинобудуванням.', jobs: ['Завод', 'Металургія', 'СТО'] },
  'ivano-frankivsk': { title: 'Івано-Франківськ', subtitle: 'Туризм, лісова промисловість та креативні індустрії.', jobs: ['Туризм', 'Кавʼярня', 'Коворкінг'] },
  kyiv: { title: 'Київ', subtitle: 'Столиця: офіси, сервіс, таксі, доставка та високий темп.', jobs: ['Офіс', 'Курʼєр', 'Таксі'] },
  kropyvnytskyi: { title: 'Кропивницький', subtitle: 'Аграрний хаб, ремонти техніки та зернові склади.', jobs: ['Елеватор', 'СТО', 'Сільгосптехніка'] },
  crimea: { title: 'Крим', subtitle: 'Курорти, виноробство, порти й логістика.', jobs: ['Готель', 'Порт', 'Виноробня'] },
  lviv: { title: 'Львів', subtitle: 'Туризм, сервіс, кавʼярні, готелі та стабільний розвиток.', jobs: ['Кавʼярня', 'Готель', 'Курʼєр'] },
  mykolaiv: { title: 'Миколаїв', subtitle: 'Верфі, порти та агро-логістика.', jobs: ['Верф', 'Порт', 'Склад'] },
  odesa: { title: 'Одеса', subtitle: 'Порт, торгівля, туризм, таксі та швидкий обіг грошей.', jobs: ['Порт', 'Таксі', 'Торгівля'] },
  poltava: { title: 'Полтава', subtitle: 'Нафта, агро-переробка, затишний сервіс.', jobs: ['Нафтобаза', 'Млин', 'Кафе'] },
  rivne: { title: 'Рівне', subtitle: 'Бурштин, текстиль та лісопереробка.', jobs: ['Текстиль', 'Лісопилка', 'Сервіс'] },
  sumy: { title: 'Суми', subtitle: 'Хімпром, машинобудування та агро.', jobs: ['Завод', 'СТО', 'Агробізнес'] },
  ternopil: { title: 'Тернопіль', subtitle: 'Студентське місто з ІТ-курсом та агро-ринком.', jobs: ['ІТ-аутсорс', 'Агро', 'Сервіс'] },
  kharkiv: { title: 'Харків', subtitle: 'ІТ, машини, освіта та наукові кластери.', jobs: ['Завод', 'Університет', 'IT-аутсорс'] },
  kherson: { title: 'Херсон', subtitle: 'Суднобудування, агро-експорт, морські ворота.', jobs: ['Верф', 'Порт', 'Агро'] },
  khmelnytskyi: { title: 'Хмельницький', subtitle: 'Оптові ринки, агро та енергетика малих ГЕС.', jobs: ['Ринок', 'Агро', 'Сервіс'] },
  cherkasy: { title: 'Черкаси', subtitle: 'Цукор, деревообробка та логістика по Дніпру.', jobs: ['Цукроварня', 'Логістика', 'СТО'] },
  chernihiv: { title: 'Чернігів', subtitle: 'Пиво, сільське господарство та ІТ-ініціативи.', jobs: ['Пивзавод', 'Агро', 'ІТ-аутсорс'] },
  chernivtsi: { title: 'Чернівці', subtitle: 'Туризм, крафтові кавʼярні та креативні індустрії.', jobs: ['Кавʼярня', 'Готель', 'Сувеніри'] },
  default: { title: 'Регіон України', subtitle: 'Стартова зона для розвитку персонажа.', jobs: ['Підробіток', 'Доставка', 'Склад'] }
};

function normalizeCityId(cityId) {
  return CITY_ID_ALIASES[cityId] || cityId;
}

function cityMapSrc(cityId) {
  const normalizedCityId = normalizeCityId(cityId);
  return (CITY_MAPS[normalizedCityId] || FALLBACK_MAP_SRC) + '?v=' + CITY_MAP_VERSION;
}

function setFallbackImage(img) {
  img.onerror = null;
  img.src = FALLBACK_MAP_SRC + '?v=' + CITY_MAP_VERSION;
}

function fitPreviewThumb(img) {
  const box = img.closest('.city-preview-image');

  if (!box || !img.naturalWidth || !img.naturalHeight) {
    return;
  }

  const ratio = img.naturalWidth / img.naturalHeight;

  box.style.setProperty('--city-preview-ratio', ratio.toFixed(3));
  box.classList.toggle('is-square-map', ratio < 1.18);
}

function getCityMeta(regionInfo) {
  if (!regionInfo) {
    return CITY_META.default;
  }

  const cityId = normalizeCityId(regionInfo.cityId);
  const staticMeta = CITY_META[cityId] || CITY_META.default;
  const base = citiesBase[cityId] || {};
  const runtime = (getState().citiesRuntime || {})[cityId] || {};
  const raw = Object.assign({}, base, runtime);

  return Object.assign({}, staticMeta, {
    title: base.name || staticMeta.title || regionInfo.cityName,
    image: cityMapSrc(cityId),
    property: 0,
    cars: 0,
    houses: 0,
    inflation: getInflation(raw) + ' %',
    devaluation: getDevaluation(raw) + ' %',
    stateAssets: getStateAssetsShare(raw) + ' %',
    jobs: staticMeta.jobs || CITY_META.default.jobs,
    economy: 'Розраховується у грі.'
  });
}

register('welcome3', (root) => {
  root.className = 'page welcome-page welcome3';

  root.innerHTML = `
    <div class="welcome-bg"></div>

    <div class="welcome3-loader" id="welcome3Loader">
      <div class="loader-logo">MN</div>
      <div class="loader-title">Загрузка карты</div>
      <div class="loader-text">Подготавливаем области Украины...</div>
      <div class="loader-bar"><span></span></div>
    </div>

    <section class="welcome-card welcome3-card">
      <div class="welcome-logo">MN</div>

      <div class="welcome-header">
        <p class="welcome-step">Шаг 3 / 3</p>
        <h2 class="welcome-title">Выбери город</h2>
        <p class="welcome-subtitle">
          Открой карту, найди область и изучи экономику региона.
        </p>
      </div>

      <div class="compact-map-card">
        <div class="compact-map">
          <img class="compact-map-image" src="${MAP_IMG}" alt="Карта Украины" />
          <div class="compact-regions-layer" id="compactRegionsLayer">
            <div class="map-loading">Загрузка...</div>
          </div>
        </div>
      </div>

      <div class="city-selection-box">
        <span id="citySelectionText">Город пока не выбран</span>
      </div>

      <div class="welcome-actions">
        <button class="welcome-btn secondary open-map-btn" id="openMapBtn" type="button">
          Открыть карту
        </button>

        <button class="welcome-btn primary next-btn" id="nextBtn" type="button" disabled>
          Далее
        </button>
      </div>
    </section>

    <div class="map-modal hidden" id="mapModal">
      <div class="map-modal-panel">
        <div class="map-modal-header">
          <div>
            <h3>Выбор стартового города</h3>
            <p>Двигай карту одним пальцем, приближай двумя. Тап по области открывает экономику города.</p>
          </div>

          <button class="close-map-btn" id="closeMapBtn" type="button" aria-label="Закрыть карту">
            ×
          </button>
        </div>

        <div class="full-map-viewport" id="fullMapViewport">
          <div class="full-map-content" id="fullMapContent">
            <img class="full-map-image" src="${MAP_IMG}" alt="Карта Украины" />
            <div class="full-regions-layer" id="fullRegionsLayer">
              <div class="map-loading">Загрузка областей...</div>
            </div>
          </div>
        </div>

        <div class="city-preview-card" id="cityPreviewCard">
          <div class="city-preview-empty">
            Выбери область на карте, чтобы увидеть экономику города
          </div>
        </div>

        <button class="welcome-btn primary confirm-city-btn" id="confirmCityBtn" type="button" disabled>
          Подтвердить выбор
        </button>
      </div>
    </div>
  `;

  const loader = root.querySelector('#welcome3Loader');
  const compactRegionsLayer = root.querySelector('#compactRegionsLayer');
  const fullRegionsLayer = root.querySelector('#fullRegionsLayer');
  const citySelectionText = root.querySelector('#citySelectionText');
  const cityPreviewCard = root.querySelector('#cityPreviewCard');
  const nextBtn = root.querySelector('#nextBtn');
  const openMapBtn = root.querySelector('#openMapBtn');
  const mapModal = root.querySelector('#mapModal');
  const closeMapBtn = root.querySelector('#closeMapBtn');
  const confirmCityBtn = root.querySelector('#confirmCityBtn');
  const fullMapViewport = root.querySelector('#fullMapViewport');
  const fullMapContent = root.querySelector('#fullMapContent');

  let svgTextCache = '';
  let selectedRegion = null;
  let pendingRegion = null;
  let compactRegionElements = [];
  let fullRegionElements = [];
  let visualFrame = null;
  let transformFrame = null;

  const isTouchDevice =
    window.matchMedia('(pointer: coarse)').matches ||
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const view = {
    x: 0,
    y: 0,
    scale: 1.55
  };

  const pointers = new Map();

  const gesture = {
    mode: 'none',
    moved: false,
    isTouch: false,
    startX: 0,
    startY: 0,
    baseX: 0,
    baseY: 0,
    startDistance: 0,
    baseScale: 1
  };

  function makeRegionInfo(regionId) {
    const regionData = REGION_DATA[regionId];

    if (!regionData) {
      return null;
    }

    return {
      regionId,
      cityId: regionData.cityId,
      cityName: regionData.cityName
    };
  }

  function renderCityPreview(regionInfo) {
    cityPreviewCard.classList.remove('is-refreshed');

    if (!regionInfo) {
      cityPreviewCard.innerHTML = `
        <div class="city-preview-empty">
          Выбери область на карте, чтобы увидеть экономику города
        </div>
      `;
      return;
    }

    const meta = getCityMeta(regionInfo);
    const imageSrc = meta.image || CITY_META.default.image;

    cityPreviewCard.innerHTML = `
      <div class="city-preview-top">
        <div class="city-preview-image">
          <img class="city-preview-thumb-img" src="${imageSrc}" alt="${meta.title}" />
        </div>

        <div class="city-preview-main">
          <h4>${meta.title}</h4>
          <p>${meta.subtitle}</p>
        </div>
      </div>

      <div class="city-preview-map">
        <img class="city-preview-map-img" src="${imageSrc}" alt="Карта города ${meta.title}" />
      </div>

      <div class="city-preview-grid">
        <div class="city-preview-stat">
          <span>Имущество</span>
          <strong>${meta.property}</strong>
        </div>

        <div class="city-preview-stat">
          <span>Машины</span>
          <strong>${meta.cars}</strong>
        </div>

        <div class="city-preview-stat">
          <span>Дома</span>
          <strong>${meta.houses}</strong>
        </div>

        <div class="city-preview-stat">
          <span>Инфляция</span>
          <strong>${meta.inflation}</strong>
        </div>
      </div>

      <div class="city-preview-jobs">
        <span>Работы региона</span>
        <div>
          ${meta.jobs.map((job) => `<b>${job}</b>`).join('')}
        </div>
      </div>

      <div class="city-preview-economy">
        <span>Экономика</span>
        <p>${meta.economy}</p>
      </div>

      <div class="city-preview-warning">
        Девальвация: ${meta.devaluation}
      </div>
    `;

    const thumbImg = cityPreviewCard.querySelector('.city-preview-thumb-img');
    const mapImg = cityPreviewCard.querySelector('.city-preview-map-img');

    if (thumbImg) {
      thumbImg.addEventListener('load', () => fitPreviewThumb(thumbImg), { once: true });
      thumbImg.addEventListener('error', () => setFallbackImage(thumbImg), { once: true });

      if (thumbImg.complete && thumbImg.naturalWidth) {
        fitPreviewThumb(thumbImg);
      }
    }

    if (mapImg) {
      mapImg.addEventListener('error', () => setFallbackImage(mapImg), { once: true });
    }

    requestAnimationFrame(() => {
      cityPreviewCard.classList.add('is-refreshed');
    });
  }

  function preloadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = resolve;
      img.onerror = reject;
      img.src = src;
    });
  }

  async function preloadAssets() {
    const svgResponse = await fetch(REGIONS_SVG);

    await preloadImage(MAP_IMG);

    if (!svgResponse.ok) {
      throw new Error('SVG load error: ' + svgResponse.status);
    }

    svgTextCache = await svgResponse.text();
  }

  function setMainText(text) {
    citySelectionText.textContent = text;
  }

  function getAllRegions() {
    return compactRegionElements.concat(fullRegionElements);
  }

  function animateRegionChoice(regionInfo) {
    if (!regionInfo) {
      return;
    }

    getAllRegions().forEach((regionEl) => {
      if (regionEl.id !== regionInfo.regionId) {
        return;
      }

      regionEl.classList.remove('is-click-burst');
      regionEl.getBoundingClientRect();
      regionEl.classList.add('is-click-burst');

      setTimeout(() => {
        regionEl.classList.remove('is-click-burst');
      }, 560);
    });
  }

  function updateVisualState() {
    if (visualFrame) {
      cancelAnimationFrame(visualFrame);
    }

    visualFrame = requestAnimationFrame(() => {
      const allRegions = getAllRegions();

      allRegions.forEach((regionEl) => {
        regionEl.classList.remove('is-selected', 'is-pending');
      });

      const activeRegion = pendingRegion || selectedRegion;

      allRegions.forEach((regionEl) => {
        if (!activeRegion || regionEl.id !== activeRegion.regionId) {
          return;
        }

        if (pendingRegion) {
          regionEl.classList.add('is-pending');
        } else {
          regionEl.classList.add('is-selected');
        }
      });

      if (selectedRegion) {
        nextBtn.disabled = false;
        nextBtn.classList.add('active');
        setMainText('Выбран город: ' + selectedRegion.cityName);
      } else {
        nextBtn.disabled = true;
        nextBtn.classList.remove('active');
        setMainText('Город пока не выбран');
      }

      if (pendingRegion) {
        confirmCityBtn.disabled = false;
        confirmCityBtn.classList.add('active');
      } else {
        confirmCityBtn.disabled = true;
        confirmCityBtn.classList.remove('active');
      }

      visualFrame = null;
    });
  }

  function previewRegion(regionInfo) {
    if (!regionInfo || isTouchDevice) {
      return;
    }

    renderCityPreview(regionInfo);
  }

  function resetPreview() {
    if (pendingRegion) {
      renderCityPreview(pendingRegion);
      return;
    }

    renderCityPreview(null);
  }

  function choosePendingRegion(regionInfo) {
    if (!regionInfo) {
      return;
    }

    pendingRegion = regionInfo;

    animateRegionChoice(regionInfo);
    renderCityPreview(regionInfo);
    updateVisualState();
  }

  function confirmRegion() {
    if (!pendingRegion) {
      return;
    }

    selectedRegion = pendingRegion;
    pendingRegion = null;

    state.city = normalizeCityId(selectedRegion.cityId);
    state.cityName = selectedRegion.cityName;
    state.regionId = selectedRegion.regionId;

    save();

    mapModal.classList.add('hidden');
    renderCityPreview(null);
    updateVisualState();
  }

  function openMap(regionInfo) {
    mapModal.classList.remove('hidden');

    pendingRegion = null;
    pointers.clear();

    gesture.mode = 'none';
    gesture.moved = false;
    gesture.isTouch = false;

    renderCityPreview(null);
    resetTransform();

    if (regionInfo) {
      choosePendingRegion(regionInfo);
    } else {
      updateVisualState();
    }
  }

  function applyTransform() {
    if (transformFrame) {
      return;
    }

    transformFrame = requestAnimationFrame(() => {
      fullMapContent.style.transform =
        'translate(calc(-50% + ' + view.x + 'px), calc(-50% + ' + view.y + 'px)) scale(' + view.scale + ')';

      transformFrame = null;
    });
  }

  function resetTransform() {
    view.x = 0;
    view.y = 0;
    view.scale = isTouchDevice ? 1.42 : 1.55;

    applyTransform();
  }

  function clampView() {
    view.scale = Math.max(1, Math.min(3.4, view.scale));

    const maxOffset = 460 * view.scale;

    view.x = Math.max(-maxOffset, Math.min(maxOffset, view.x));
    view.y = Math.max(-maxOffset, Math.min(maxOffset, view.y));
  }

  function distance(a, b) {
    return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
  }

  function startPan(pointer) {
    gesture.mode = 'pan';
    gesture.moved = false;
    gesture.isTouch = pointer.pointerType === 'touch' || pointer.pointerType === 'pen';
    gesture.startX = pointer.clientX;
    gesture.startY = pointer.clientY;
    gesture.baseX = view.x;
    gesture.baseY = view.y;
  }

  function startPinch() {
    const pts = Array.from(pointers.values());

    if (pts.length < 2) {
      return;
    }

    gesture.mode = 'pinch';
    gesture.moved = false;
    gesture.isTouch = pts.some((point) => point.pointerType === 'touch' || point.pointerType === 'pen');
    gesture.startDistance = distance(pts[0], pts[1]);
    gesture.baseScale = view.scale;
    gesture.baseX = view.x;
    gesture.baseY = view.y;
    gesture.startX = (pts[0].clientX + pts[1].clientX) / 2;
    gesture.startY = (pts[0].clientY + pts[1].clientY) / 2;
  }

  function onPointerDown(event) {
    const isMouse = event.pointerType === 'mouse';
    const isTouch = event.pointerType === 'touch' || event.pointerType === 'pen';

    if (isMouse && event.button !== 2) {
      return;
    }

    if (isMouse) {
      event.preventDefault();
    }

    pointers.set(event.pointerId, {
      clientX: event.clientX,
      clientY: event.clientY,
      pointerType: event.pointerType
    });

    if (fullMapViewport.setPointerCapture) {
      fullMapViewport.setPointerCapture(event.pointerId);
    }

    if (isTouch && pointers.size === 1) {
      startPan(event);
      return;
    }

    if (isTouch && pointers.size === 2) {
      startPinch();
      return;
    }

    if (isMouse) {
      startPan(event);
    }
  }

  function onPointerMove(event) {
    if (!pointers.has(event.pointerId)) {
      return;
    }

    pointers.set(event.pointerId, {
      clientX: event.clientX,
      clientY: event.clientY,
      pointerType: event.pointerType
    });

    if (gesture.mode === 'pan' && pointers.size === 1) {
      const dx = event.clientX - gesture.startX;
      const dy = event.clientY - gesture.startY;

      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
        gesture.moved = true;
      }

      view.x = gesture.baseX + dx;
      view.y = gesture.baseY + dy;

      clampView();
      applyTransform();
      return;
    }

    if (gesture.mode === 'pinch' && pointers.size >= 2) {
      const pts = Array.from(pointers.values());
      const currentDistance = distance(pts[0], pts[1]);
      const scaleRatio = currentDistance / gesture.startDistance;
      const midX = (pts[0].clientX + pts[1].clientX) / 2;
      const midY = (pts[0].clientY + pts[1].clientY) / 2;

      view.scale = gesture.baseScale * scaleRatio;
      view.x = gesture.baseX + (midX - gesture.startX);
      view.y = gesture.baseY + (midY - gesture.startY);

      clampView();

      gesture.moved = true;

      applyTransform();
    }
  }

  function onPointerUp(event) {
    pointers.delete(event.pointerId);

    if (pointers.size === 1) {
      const remainingPointer = Array.from(pointers.values())[0];

      startPan({
        clientX: remainingPointer.clientX,
        clientY: remainingPointer.clientY,
        pointerType: remainingPointer.pointerType
      });

      return;
    }

    if (pointers.size === 0) {
      gesture.mode = 'none';
      gesture.isTouch = false;
    }

    if (fullMapViewport.releasePointerCapture) {
      fullMapViewport.releasePointerCapture(event.pointerId);
    }
  }

  function onWheel(event) {
    event.preventDefault();

    if (event.deltaY > 0) {
      view.scale -= 0.12;
    } else {
      view.scale += 0.12;
    }

    clampView();
    applyTransform();
  }

  function prepareSvg(svg, mode) {
    svg.classList.add('ukraine-regions-svg');
    svg.classList.add(mode);

    svg.removeAttribute('width');
    svg.removeAttribute('height');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    svg.querySelectorAll('*').forEach((el) => {
      el.style.pointerEvents = 'none';
    });

    svg.querySelectorAll('#points, #label_points, text, circle, rect, line, polyline, ellipse').forEach((el) => {
      el.style.display = 'none';
    });

    const regions = Array.from(svg.querySelectorAll('path[id], polygon[id]'));

    regions.forEach((region) => {
      const hasRegionData = Boolean(REGION_DATA[region.id]);

      if (!hasRegionData) {
        region.style.display = 'none';
        return;
      }

      region.style.display = '';
      region.style.pointerEvents = 'all';
    });

    return regions.filter((region) => REGION_DATA[region.id]);
  }

  function setupRegion(path, storage, mode) {
    const regionInfo = makeRegionInfo(path.id);

    path.classList.add('ukraine-region');

    if (!regionInfo) {
      path.classList.add('is-disabled');
      return;
    }

    path.classList.add('is-selectable');

    path.dataset.cityId = regionInfo.cityId;
    path.dataset.cityName = regionInfo.cityName;
    path.style.pointerEvents = 'all';

    if (state.regionId === regionInfo.regionId || state.city === regionInfo.cityId) {
      selectedRegion = regionInfo;
    }

    path.setAttribute('tabindex', '0');
    path.setAttribute('role', 'button');
    path.setAttribute('aria-label', regionInfo.cityName);

    if (mode === 'compact') {
      path.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        openMap(regionInfo);
      });
    }

    if (mode === 'full') {
      if (!isTouchDevice) {
        path.addEventListener('mouseenter', () => previewRegion(regionInfo));
        path.addEventListener('mouseleave', resetPreview);
        path.addEventListener('focus', () => previewRegion(regionInfo));
        path.addEventListener('blur', resetPreview);
      }

      path.addEventListener('pointerdown', (event) => {
        const isMouseLeft = event.pointerType === 'mouse' && event.button === 0;

        if (isMouseLeft) {
          event.preventDefault();
          event.stopPropagation();
        }
      });

      path.addEventListener('pointerup', (event) => {
        const isMouseLeft = event.pointerType === 'mouse' && event.button === 0;
        const isTouchTap = event.pointerType !== 'mouse' && !gesture.moved;

        if (!isMouseLeft && !isTouchTap) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        choosePendingRegion(regionInfo);
      });

      path.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (gesture.moved) {
          return;
        }

        choosePendingRegion(regionInfo);
      });

      path.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          choosePendingRegion(regionInfo);
        }
      });
    }

    storage.push(path);
  }

  function loadSvgInto(layer, storage, mode) {
    layer.innerHTML = svgTextCache;

    const svg = layer.querySelector('svg');

    if (!svg) {
      throw new Error('SVG tag not found');
    }

    const regions = prepareSvg(svg, mode);

    regions.forEach((path) => {
      setupRegion(path, storage, mode);
    });
  }

  async function initRegions() {
    try {
      await preloadAssets();

      loadSvgInto(compactRegionsLayer, compactRegionElements, 'compact');
      loadSvgInto(fullRegionsLayer, fullRegionElements, 'full');

      updateVisualState();

      loader.classList.add('is-hidden');

      setTimeout(() => {
        loader.remove();
      }, 280);
    } catch (error) {
      console.error(error);

      loader.classList.add('is-hidden');

      compactRegionsLayer.innerHTML = `
        <div class="map-error">Ошибка загрузки SVG</div>
      `;

      fullRegionsLayer.innerHTML = `
        <div class="map-error">Ошибка загрузки SVG</div>
      `;

      setMainText('Ошибка загрузки карты областей');
    }
  }

  openMapBtn.addEventListener('click', () => openMap());

  closeMapBtn.addEventListener('click', () => {
    mapModal.classList.add('hidden');

    pendingRegion = null;
    pointers.clear();

    gesture.mode = 'none';
    gesture.moved = false;
    gesture.isTouch = false;

    renderCityPreview(null);
    updateVisualState();
  });

  confirmCityBtn.addEventListener('click', confirmRegion);

  nextBtn.addEventListener('click', () => {
    if (!selectedRegion) {
      alert('Сначала выбери город на карте');
      return;
    }

    show('home');
  });

  fullMapViewport.addEventListener('contextmenu', (event) => {
    event.preventDefault();
  });

  fullMapViewport.addEventListener('pointerdown', onPointerDown);
  fullMapViewport.addEventListener('pointermove', onPointerMove);
  fullMapViewport.addEventListener('pointerup', onPointerUp);
  fullMapViewport.addEventListener('pointercancel', onPointerUp);
  fullMapViewport.addEventListener('wheel', onWheel, { passive: false });

  initRegions();
});
