export function renderComposer() {
  const composer = document.querySelector("#composer");

  if (!composer) {
    return;
  }

  composer.innerHTML = `
    <div class="composer__head">
      <div class="avatar">D</div>
      <div>
        <strong>Создать пост</strong>
        <span>Текст — 10 Signal, фото — 25, видео — 50</span>
      </div>
    </div>

    <textarea id="postText" maxlength="420" placeholder="Что выкладываем?"></textarea>

    <div class="composer__preview" id="mediaPreview" hidden></div>

    <div class="composer__actions">
      <label class="file-btn">
        <input id="mediaInput" type="file" accept="image/*,video/*" />
        Фото/видео
      </label>

      <button class="publish-btn" id="publishBtn" type="button">
        Запустить пост
      </button>
    </div>

    <p class="hint" id="composerHint">
      Всё хранится локально в браузере через IndexedDB. Это демо без backend.
    </p>
  `;
}
