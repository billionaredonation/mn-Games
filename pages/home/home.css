/* ------------------------------------------------------------------
   ГЛАВНОЕ МЕНЮ
   ------------------------------------------------------------------ */
.home {
  min-height: 100vh;
  padding: 16px 12px 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  color: #fff;
  background:
    radial-gradient(circle at 22% 12%, rgba(255,255,255,0.08), transparent 26%),
    radial-gradient(circle at 80% 82%, rgba(74,163,255,0.08), transparent 28%),
    linear-gradient(180deg, #050608 0%, #101114 52%, #050608 100%);
  overflow-y: auto;
}

.home-top {
  width: min(94vw, 760px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 22px;
  background: rgba(16,18,22,0.86);
  border: 1px solid rgba(255,255,255,0.12);
  box-shadow: 0 18px 48px rgba(0,0,0,0.36);
  backdrop-filter: blur(14px);
}

.home-top h2 {
  margin: 0;
  font-size: 24px;
  line-height: 1.05;
  font-weight: 950;
}

.home-top p {
  margin: 7px 0 0;
  color: rgba(255,255,255,0.66);
  font-size: 13px;
  line-height: 1.3;
}

.home-reset-btn {
  flex: 0 0 auto;
  height: 38px;
  padding: 0 13px;
  border-radius: 13px;
  background: rgba(255,255,255,0.08);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.14);
  font-size: 13px;
  font-weight: 800;
  transition:
    transform 0.15s ease,
    background 0.15s ease,
    border-color 0.15s ease;
}

.home-reset-btn:active {
  transform: scale(0.97);
}

.home-reset-btn:hover,
.home-reset-btn:focus-visible {
  background: rgba(255,255,255,0.14);
  border-color: rgba(255,255,255,0.26);
  outline: none;
}

/* ------------------------------------------------------------------
   КАРТА
   ------------------------------------------------------------------ */
.city-map-shell{
  position:relative;
  width:min(94vw,760px);
  margin:0 auto;
  border:1px solid rgba(255,255,255,0.16);
  border-radius:22px;
  overflow:hidden;
  background:#07080a;
  box-shadow:0 24px 70px rgba(0,0,0,.46);
  animation: cityMapEnter 0.38s ease-out both;
}

/* PNG-фон — главный источник высоты  */
.city-map-image{
  /* «ломаем» абсолютные стили, которые прописаны inline из home.js */
  position:static   !important;   /* вместо absolute */
  inset:auto        !important;
  display:block     !important;
  width:100%        !important;
  height:auto       !important;   /* вытягивает оболочку */
  object-fit:contain!important;   /* ничего не режет */
  user-select:none;
  pointer-events:none;
  z-index:2;
}

/* SVG-контур — под PNG, невидим, ловит события */
.hit-layer{
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  opacity:0;
  pointer-events:auto;
  z-index:1;
}

/* ------------------------------------------------------------------
   Лёгкая подсветка регионов
   ------------------------------------------------------------------ */
.region{
  fill:transparent;
  stroke:transparent;
  stroke-width:1.4;
  transition:fill .25s, stroke .25s, filter .25s;
}
.region:hover{
  fill:rgba(255,255,255,.07);
  stroke:rgba(255,255,255,.45);
  filter:drop-shadow(0 0 4px rgba(255,255,255,.4));
}
.region.active{
  fill:rgba(255,255,255,.14);
  stroke:rgba(255,255,255,.6);
  filter:drop-shadow(0 0 6px rgba(255,255,255,.55));
}

/* ------------------------------------------------------------------
   ИКОНКИ (дом, профиль …) — оставлены без изменений
   ------------------------------------------------------------------ */
.map-icon{
  position:absolute;
  transform:translate(-50%,-50%);
  width:66px;
  min-height:62px;
  padding:8px 6px;
  border:1px solid rgba(255,255,255,.78);
  border-radius:18px;
  background:rgba(15,18,24,.76);
  color:#fff;
  cursor:pointer;
  backdrop-filter: blur(10px);
  box-shadow:
    0 12px 28px rgba(0,0,0,.36),
    inset 0 1px 0 rgba(255,255,255,.12);
  transition:
    transform .16s ease,
    background .16s ease,
    box-shadow .16s ease,
    border-color .16s ease;
  z-index:4;
}
.map-icon-emoji{font-size:22px;line-height:1;}
.map-icon-label{margin-top:6px;font-size:10px;font-weight:900;line-height:1;}
.map-icon:hover,
.map-icon:focus-visible{
  transform:translate(-50%,-50%) scale(1.08);
  background:rgba(38,114,255,.82);
  border-color:rgba(255,255,255,.98);
  box-shadow:
    0 0 0 6px rgba(74,163,255,.18),
    0 16px 34px rgba(0,0,0,.38);
  outline:none;
}

/* позиции иконок */
.profile-icon {left:16%; top:18%;}
.jobs-icon    {left:50%; top:47%;}
.house-icon   {left:66%; top:72%;}
.settings-icon{left:84%; top:18%;}

.home-info {
  width: min(94vw, 760px);
  min-height: 50px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-radius: 18px;
  color: rgba(255,255,255,0.76);
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  font-size: 14px;
  font-weight: 750;
}

@keyframes cityMapEnter {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.985);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ------------------------------------------------------------------
   Адаптив
   ------------------------------------------------------------------ */
@media(max-width:640px){
  .city-map-shell{width:94vw;}            /* высоту даст PNG */
  .map-icon{width:58px;min-height:54px;border-radius:15px;}
  .map-icon-emoji{font-size:18px;}
  .map-icon-label{font-size:9px;}

  .home-top {
    border-radius: 20px;
  }

  .home-top h2 {
    font-size: 22px;
  }
}
