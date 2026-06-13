import { formatDate } from "../utils.js";

export function createPostComponent(post, options = {}) {
  const { isMine = false, onDelete = null } = options;

  const article = document.createElement("article");
  article.className = "post";

  article.appendChild(createPostHeader(post, isMine, onDelete));

  if (post.text) {
    article.appendChild(createPostText(post.text));
  }

  if (post.mediaBlob || post.mediaType === "mock") {
    article.appendChild(createPostMedia(post));
  }

  article.appendChild(createPostActions(post));

  return article;
}

function createPostHeader(post, isMine, onDelete) {
  const header = document.createElement("header");
  header.className = "post__head";

  header.innerHTML = `
    <div class="avatar">${post.avatar || "D"}</div>
    <div class="post__meta">
      <strong>${post.author || "Donation"}</strong>
      <span>${post.username || "@owner"} · ${post.createdAt ? formatDate(post.createdAt) : "рекомендация"}</span>
    </div>
  `;

  if (isMine) {
    const button = document.createElement("button");
    button.className = "post__delete";
    button.type = "button";
    button.textContent = "×";

    button.addEventListener("click", () => {
      if (typeof onDelete === "function") {
        onDelete(post.id);
      }
    });

    header.appendChild(button);
  }

  return header;
}

function createPostText(text) {
  const node = document.createElement("div");
  node.className = "post__text";
  node.textContent = text;
  return node;
}

function createPostMedia(post) {
  const wrapper = document.createElement("div");
  wrapper.className = "post__media";

  if (post.mediaType === "mock") {
    const mock = document.createElement("div");
    mock.className = `mock-media mock-media--${post.theme || "purple"}`;
    wrapper.appendChild(mock);
    return wrapper;
  }

  const url = URL.createObjectURL(post.mediaBlob);

  if (post.mediaType.startsWith("image/")) {
    const img = document.createElement("img");
    img.src = url;
    img.alt = "Фото поста";
    img.onload = () => URL.revokeObjectURL(url);
    wrapper.appendChild(img);
  }

  if (post.mediaType.startsWith("video/")) {
    const video = document.createElement("video");
    video.src = url;
    video.controls = true;
    video.playsInline = true;
    wrapper.appendChild(video);
  }

  return wrapper;
}

function createPostActions(post) {
  const actions = document.createElement("div");
  actions.className = "post__actions";

  const likeButton = document.createElement("button");
  likeButton.className = "action";
  likeButton.type = "button";
  likeButton.textContent = `♡ ${post.likes || 0}`;

  likeButton.addEventListener("click", () => {
    likeButton.classList.toggle("is-active");
    likeButton.textContent = likeButton.classList.contains("is-active")
      ? `♥ ${(post.likes || 0) + 1}`
      : `♡ ${post.likes || 0}`;
  });

  const commentsButton = document.createElement("button");
  commentsButton.className = "action";
  commentsButton.type = "button";
  commentsButton.textContent = `💬 ${post.comments || 0}`;

  const saveButton = document.createElement("button");
  saveButton.className = "action";
  saveButton.type = "button";
  saveButton.textContent = "◇ сохранить";

  saveButton.addEventListener("click", () => {
    saveButton.classList.toggle("is-active");
    saveButton.textContent = saveButton.classList.contains("is-active")
      ? "◆ сохранено"
      : "◇ сохранить";
  });

  actions.append(likeButton, commentsButton, saveButton);

  return actions;
}
