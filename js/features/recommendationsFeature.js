import { recommendationPosts } from "../data/recommendationsData.js";
import { createPostComponent } from "../components/postComponent.js";
import { createEmptyState } from "../components/emptyStateComponent.js";

const feedRoot = document.querySelector("#feed");

export function initRecommendations() {
  feedRoot.innerHTML = "";

  if (!recommendationPosts.length) {
    feedRoot.appendChild(
      createEmptyState(
        "Рекомендаций пока нет",
        "Позже здесь будут общие посты из базы данных."
      )
    );

    return;
  }

  recommendationPosts.forEach((post) => {
    feedRoot.appendChild(createPostComponent(post));
  });
}
