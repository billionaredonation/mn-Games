const TELEGRAM_LINK = "https://t.me/your_channel_or_bot";

const enterBtn = document.querySelector("#enterBtn");
const leaveBtn = document.querySelector("#leaveBtn");
const year = document.querySelector("#year");

if (year) {
  year.textContent = new Date().getFullYear();
}

if (enterBtn) {
  enterBtn.addEventListener("click", () => {
    window.location.href = TELEGRAM_LINK;
  });
}

if (leaveBtn) {
  leaveBtn.addEventListener("click", () => {
    window.location.href = "https://www.google.com";
  });
}
