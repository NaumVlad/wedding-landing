const menu = document.querySelector(".menu");
const links = document.querySelector(".nav-links");

menu?.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  menu.setAttribute("aria-expanded", String(open));
});

links?.addEventListener("click", () => {
  links.classList.remove("open");
  menu?.setAttribute("aria-expanded", "false");
});

const browserHint = document.querySelector("#browser-hint");
const browserHintClose = browserHint?.querySelector(".browser-hint-close");
const browserHintText = browserHint?.querySelector("#browser-hint-text");
const mobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const androidDevice = /Android/i.test(navigator.userAgent);
const telegramReferrer = /(^|\.)((t|telegram)\.me|telegram\.org)$/i.test((() => {
  try {
    return new URL(document.referrer).hostname;
  } catch {
    return "";
  }
})());
const telegramBrowser = /Telegram/i.test(navigator.userAgent)
  || telegramReferrer
  || Boolean(window.TelegramWebviewProxy)
  || Boolean(window.Telegram?.WebApp?.initData)
  || /(?:^|[?#&])tgWebAppPlatform=/i.test(`${location.search}${location.hash}`);

const closeBrowserHint = () => {
  browserHint?.classList.remove("is-open");
  window.setTimeout(() => {
    if (browserHint) {
      browserHint.hidden = true;
      browserHint.classList.remove("is-visible");
    }
  }, 240);
};

if (browserHint && mobileDevice && telegramBrowser) {
  if (androidDevice) {
    browserHint.classList.add("is-android");
    browserHintText.innerHTML = "Натисніть меню вгорі праворуч<br>і оберіть відкриття у браузері";
  }

  window.setTimeout(() => {
    browserHint.hidden = false;
    browserHint.classList.add("is-visible");
    window.requestAnimationFrame(() => browserHint.classList.add("is-open"));
  }, 700);
}

browserHintClose?.addEventListener("click", closeBrowserHint);
browserHint?.addEventListener("click", event => {
  if (event.target === browserHint) closeBrowserHint();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && browserHint?.classList.contains("is-open")) {
    closeBrowserHint();
  }
});

const form = document.querySelector("#rsvp-form");
const drinkInputs = [...document.querySelectorAll('input[name="drinks"]')];

drinkInputs.forEach(input => input.addEventListener("change", () => {
  drinkInputs[0]?.setCustomValidity("");
}));

form?.addEventListener("submit", event => {
  event.preventDefault();

  if (!drinkInputs.some(input => input.checked)) {
    drinkInputs[0]?.setCustomValidity("Оберіть хоча б один варіант напою");
    drinkInputs[0]?.reportValidity();
    return;
  }

  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  data.drinks = formData.getAll("drinks");
  localStorage.setItem("wedding-rsvp", JSON.stringify(data));

  document.querySelector(".form-status").textContent = "Дякуємо! Вашу відповідь збережено на цьому пристрої.";
  form.reset();
});
