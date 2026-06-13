import { getMyPosts, deleteMyPost } from "../db.js";
import { createPostComponent } from "../components/postComponent.js";
import { createEmptyState } from "../components/emptyStateComponent.js";

const feedRoot = document.querySelector("#feed");

export async function initMyFeed() {
  const posts = await getMyPosts();

  feedRoot.innerHTML = "";

  if (!posts.length) {
    feedRoot.appendChild(
      createEmptyState(
        "Моя лента пока пустая",
        "Загрузи фото, видео или напиши первый пост. Всё сохранится локально в браузере."
      )
    );

    return;
  }

  posts.forEach((post) => {
    feedRoot.appendChild(
      createPostComponent(post, {
        isMine: true,
        onDelete: handleDeletePost
      })
    );
  });
}

async function handleDeletePost(postId) {
  const ok = window.confirm("Удалить пост?");

  if (!ok) {
    return;
  }

  await deleteMyPost(postId);
  await initMyFeed();
}
