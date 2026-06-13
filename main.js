const posts = [
  {
    author: "Donation",
    handle: "@owner_mode",
    avatar: "D",
    avatarClass: "avatar--me",
    time: "2 минуты назад",
    title: "Когда лень строить продукт, но хочется сделать вид, что ты уже владелец платформы.",
    text: "Демо соцсети без backend, без базы, без лишнего мусора. Просто витрина, лента и ощущение, что тут сейчас что-то произойдёт.",
    mediaClass: "",
    likes: 248,
    comments: 31,
    shares: 12
  },
  {
    author: "NOVA Feed",
    handle: "@system",
    avatar: "N",
    avatarClass: "avatar--blue",
    time: "18 минут назад",
    title: "Главная страница в стиле social app.",
    text: "Слева навигация, по центру посты, справа профиль, новости и тренды. На мобилке всё превращается в нормальную ленту.",
    mediaClass: "post__media--dark",
    likes: 812,
    comments: 74,
    shares: 39
  },
  {
    author: "Kent",
    handle: "@mobile_check",
    avatar: "K",
    avatarClass: "avatar--green",
    time: "41 минуту назад",
    title: "Мобилка не выглядит как пьяная верстка.",
    text: "Нижняя навигация, sticky header, карточки, сторис и посты. Можно заливать на GitHub Pages и показывать как демо.",
    mediaClass: "post__media--blue",
    likes: 536,
    comments: 48,
    shares: 21
  }
];

const postsRoot = document.querySelector("#posts");
const navItems = document.querySelectorAll(".nav__item");
const bottomItems = document.querySelectorAll(".bottom-nav__item");
const liveUsers = document.querySelector("#liveUsers");
const mobileMenuBtn = document.querySelector("#mobileMenuBtn");
const closeDrawerBtn = document.querySelector("#closeDrawerBtn");
const mobileDrawer = document.querySelector("#mobileDrawer");

function formatNumber(value) {
  return Number(value).toLocaleString("ru-RU");
}

function createPost(post) {
  const article = document.createElement("article");
  article.className = "post";

  article.innerHTML = `
    <div class="post__head">
      <div class="avatar ${post.avatarClass}">${post.avatar}</div>

      <div class="post__meta">
        <strong>${post.author}</strong>
        <span>${post.handle} · ${post.time}</span>
      </div>

      <button class="post__more" type="button">•••</button>
    </div>

    <div class="post__body">
      <h2>${post.title}</h2>
      <p>${post.text}</p>
    </div>

    <div class="post__media ${post.mediaClass}"></div>

    <div class="post__actions">
      <button class="action" type="button" data-action="like">♡ ${formatNumber(post.likes)}</button>
      <button class="action" type="button">💬 ${formatNumber(post.comments)}</button>
      <button class="action" type="button">↗ ${formatNumber(post.shares)}</button>
    </div>
  `;

  const likeBtn = article.querySelector('[data-action="like"]');

  likeBtn.addEventListener("click", () => {
    const isActive = likeBtn.classList.toggle("is-active");

    if (isActive) {
      post.likes += 1;
      likeBtn.textContent = `♥ ${formatNumber(post.likes)}`;
    } else {
      post.likes -= 1;
      likeBtn.textContent = `♡ ${formatNumber(post.likes)}`;
    }
  });

  return article;
}

function renderPosts() {
  postsRoot.innerHTML = "";
  posts.forEach((post) => {
    postsRoot.appendChild(createPost(post));
  });
}

function setActiveNav(clickedItem, list, activeClass) {
  list.forEach((item) => item.classList.remove(activeClass));
  clickedItem.classList.add(activeClass);
}

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    setActiveNav(item, navItems, "nav__item--active");
  });
});

bottomItems.forEach((item) => {
  item.addEventListener("click", () => {
    setActiveNav(item, bottomItems, "bottom-nav__item--active");
  });
});

function updateLiveUsers() {
  if (!liveUsers) {
    return;
  }

  const base = 248;
  const randomShift = Math.floor(Math.random() * 42);
  liveUsers.textContent = base + randomShift;
}

if (mobileMenuBtn && mobileDrawer) {
  mobileMenuBtn.addEventListener("click", () => {
    mobileDrawer.classList.add("is-open");
  });
}

if (closeDrawerBtn && mobileDrawer) {
  closeDrawerBtn.addEventListener("click", () => {
    mobileDrawer.classList.remove("is-open");
  });
}

if (mobileDrawer) {
  mobileDrawer.addEventListener("click", (event) => {
    if (event.target === mobileDrawer) {
      mobileDrawer.classList.remove("is-open");
    }
  });
}

renderPosts();
updateLiveUsers();
window.setInterval(updateLiveUsers, 3500);
