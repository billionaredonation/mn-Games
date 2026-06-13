import { appState } from "../state.js";
import { clearMyPosts } from "../db.js";
import { initMyFeed } from "../features/myFeedFeature.js";

export function renderTopbar() {
  const topbar = document.querySelector("#topbar");

  if (!topbar) {
    return;
  }

  topbar.innerHTML = `
    <div class="profile-chip">
      <div class="avatar">${appState.user.avatar}</div>
      <div>
        <strong>${appState.user.name}</strong>
        <span>${appState.user.username}</span>
      </div>
    </div>

    <div class="topbar__actions">
      <div class="balance-pill" title="Внутренняя демо-валюта">
        <span>Signal</span>
        <strong id="signalBalance">${appState.economy.signal}</strong>
      </div>

      <button class="icon-btn" id="earnBtn" type="button" title="Заработать валюту">
        +
      </button>

      <button class="icon-btn" id="clearBtn" type="button" title="Очистить мои посты">
        ↺
      </button>
    </div>
  `;

  const earnBtn = topbar.querySelector("#earnBtn");
  const clearBtn = topbar.querySelector("#clearBtn");

  earnBtn.addEventListener("click", () => {
    appState.economy.signal += 25;
    updateSignalBalance();
    window.dispatchEvent(new CustomEvent("signal:changed"));
  });

  clearBtn.addEventListener("click", async () => {
    const ok = window.confirm("Очистить все мои локальные посты?");

    if (!ok) {
      return;
    }

    await clearMyPosts();
    await initMyFeed();
  });
}

export function updateSignalBalance() {
  const node = document.querySelector("#signalBalance");

  if (node) {
    node.textContent = appState.economy.signal;
  }
}
