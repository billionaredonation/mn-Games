import { appState, setCurrentFeed } from "../state.js";
import { initMyFeed } from "../features/myFeedFeature.js";
import { initRecommendations } from "../features/recommendationsFeature.js";

export function renderTabs() {
  const tabsRoot = document.querySelector("#tabs");

  if (!tabsRoot) {
    return;
  }

  tabsRoot.innerHTML = `
    <button class="tab ${appState.currentFeed === "mine" ? "tab--active" : ""}" type="button" data-feed="mine">
      Моя лента
    </button>

    <button class="tab ${appState.currentFeed === "common" ? "tab--active" : ""}" type="button" data-feed="common">
      Общие рекомендации
    </button>
  `;

  tabsRoot.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", async () => {
      const feedName = tab.dataset.feed;

      setCurrentFeed(feedName);
      renderTabs();
      toggleComposer(feedName === "mine");

      if (feedName === "mine") {
        await initMyFeed();
        return;
      }

      initRecommendations();
    });
  });
}

function toggleComposer(visible) {
  const composer = document.querySelector("#composer");

  if (composer) {
    composer.hidden = !visible;
  }
}
