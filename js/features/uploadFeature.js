import { addMyPost } from "../db.js";
import { appState, setSelectedFile, clearSelectedFile } from "../state.js";
import { createId } from "../utils.js";
import { initMyFeed } from "./myFeedFeature.js";
import { updateSignalBalance } from "../components/profileComponent.js";

export function initUploadFeature() {
  const composer = document.querySelector("#composer");

  composer.addEventListener("change", (event) => {
    if (event.target && event.target.id === "mediaInput") {
      handleFileChange(event.target);
    }
  });

  composer.addEventListener("click", async (event) => {
    if (event.target && event.target.id === "publishBtn") {
      await publishPost();
    }
  });
}

function getNodes() {
  return {
    postText: document.querySelector("#postText"),
    mediaInput: document.querySelector("#mediaInput"),
    mediaPreview: document.querySelector("#mediaPreview"),
    composerHint: document.querySelector("#composerHint")
  };
}

function setHint(text) {
  const { composerHint } = getNodes();

  if (composerHint) {
    composerHint.textContent = text;
  }
}

function getPostCost(text, file) {
  if (file && file.type.startsWith("video/")) {
    return 50;
  }

  if (file && file.type.startsWith("image/")) {
    return 25;
  }

  if (text.trim()) {
    return 10;
  }

  return 0;
}

function handleFileChange(input) {
  const file = input.files && input.files[0];

  if (!file) {
    clearPreview();
    return;
  }

  const maxSizeMb = 80;
  const sizeMb = file.size / 1024 / 1024;

  if (sizeMb > maxSizeMb) {
    window.alert(`Файл слишком большой. Для демо лимит ${maxSizeMb} MB.`);
    input.value = "";
    clearPreview();
    return;
  }

  setSelectedFile(file);
  renderPreview(file);
}

function renderPreview(file) {
  const { mediaPreview } = getNodes();
  mediaPreview.innerHTML = "";

  const url = URL.createObjectURL(file);

  if (file.type.startsWith("image/")) {
    const img = document.createElement("img");
    img.src = url;
    img.alt = "Предпросмотр фото";
    img.onload = () => URL.revokeObjectURL(url);
    mediaPreview.appendChild(img);
  }

  if (file.type.startsWith("video/")) {
    const video = document.createElement("video");
    video.src = url;
    video.controls = true;
    video.playsInline = true;
    mediaPreview.appendChild(video);
  }

  mediaPreview.hidden = false;
}

function clearPreview() {
  const { mediaInput, mediaPreview } = getNodes();
  clearSelectedFile();

  if (mediaInput) {
    mediaInput.value = "";
  }

  if (mediaPreview) {
    mediaPreview.hidden = true;
    mediaPreview.innerHTML = "";
  }
}

async function publishPost() {
  const { postText } = getNodes();
  const text = postText.value.trim();
  const file = appState.selectedFile;
  const cost = getPostCost(text, file);

  if (!text && !file) {
    setHint("Добавь текст, фото или видео.");
    return;
  }

  if (appState.economy.signal < cost) {
    setHint(`Не хватает Signal. Нужно ${cost}, сейчас ${appState.economy.signal}. Нажми + сверху, чтобы заработать.`);
    return;
  }

  appState.economy.signal -= cost;
  updateSignalBalance();

  await addMyPost({
    id: createId(),
    author: appState.user.name,
    username: appState.user.username,
    avatar: appState.user.avatar,
    text,
    createdAt: Date.now(),
    likes: 0,
    comments: 0,
    cost,
    mediaType: file ? file.type : null,
    mediaName: file ? file.name : null,
    mediaBlob: file || null
  });

  postText.value = "";
  clearPreview();
  setHint(`Пост запущен. Списано ${cost} Signal.`);
  await initMyFeed();
}
