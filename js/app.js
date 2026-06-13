import { initDB } from "./db.js";
import { renderTopbar } from "./components/profileComponent.js";
import { renderTabs } from "./components/tabsComponent.js";
import { renderComposer } from "./components/composerComponent.js";
import { initMyFeed } from "./features/myFeedFeature.js";
import { initRecommendations } from "./features/recommendationsFeature.js";
import { initUploadFeature } from "./features/uploadFeature.js";
import { appState } from "./state.js";

async function initApp() {
  await initDB();

  renderTopbar();
  renderTabs();
  renderComposer();

  initUploadFeature();

  if (appState.currentFeed === "mine") {
    await initMyFeed();
  } else {
    initRecommendations();
  }
}

initApp();
