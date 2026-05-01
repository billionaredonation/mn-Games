import { getState, setState } from '../../state.js';
import '../../styles/home.css';                // ⬅ подключаем стили
import baseMap from '../../assets/maps/ukraine.png'; // общая карта

export default async function HomeScreen() {
  /* ---------- каркас ---------- */
  const wrap = document.createElement('div');
  wrap.className = 'map-wrapper';

  /* базовая PNG */
  const imgBase = document.createElement('img');
  imgBase.className = 'base-map';
  imgBase.src = baseMap;
  imgBase.alt = 'Ukraine';
  wrap.appendChild(imgBase);

  /* ---------- подсветки ---------- */
  // список регионов; добавьте свои по мере рисования PNG
  const REGIONS = [
    'kyiv',
    'zaporizhzhia',
    'lviv',
    'odesa',
    // …
  ];

  // создаём img.highlight для каждого региона
  const hl = {}; // { region: HTMLImageElement }
  REGIONS.forEach(r => {
    const img = document.createElement('img');
    img.className = 'highlight';
    img.dataset.region = r;
    img.alt = '';
    img.src = `assets/hl/${r}.png`; // ⚠️ файл должен существовать
    wrap.appendChild(img);
    hl[r] = img;
  });

  /* ---------- SVG-контур (невидимка) ---------- */
  const svg = await loadHitLayer();   // <svg> с path-ами
  wrap.appendChild(svg);

  /* ---------- логика ховера/клика ---------- */
  const hideAll = () =>
    Object.values(hl).forEach(i => i.classList.remove('show'));

  svg.querySelectorAll('path[data-region]').forEach(path => {
    const r = path.dataset.region;

    path.addEventListener('mouseenter', () => {
      hideAll();
      hl[r]?.classList.add('show');
    });

    path.addEventListener('mouseleave', hideAll);

    path.addEventListener('click', () => {
      chooseRegion(r);
    });
  });

  return wrap;
}

/* ---------- util. загружаем SVG ---------- */
async function loadHitLayer() {
  const res = await fetch('assets/hit-layer.svg');
  const text = await res.text();
  const tpl = document.createElement('template');
  tpl.innerHTML = text.trim();
  const svg = tpl.content.firstElementChild;
  svg.classList.add('hit-layer');
  return svg;
}

/* ---------- обработка выбора ---------- */
function chooseRegion(region) {
  const st = getState();
  st.city = { region };         // тут можно ещё название города/координаты
  setState(st);
  alert(`Вы выбрали область: ${region}`); // заменить на переход
}


    path.addEventListener('click', () => {
     chooseRegion(r);
     svg.querySelectorAll('.region.active')
       .forEach(el => el.classList.remove('active'));
    path.classList.add('active');          // «огни» остаются гореть
     chooseRegion(r);
    });
