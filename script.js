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

const scrollCue = document.querySelector(".scroll-cue");
if (scrollCue) {
  const hideScrollCue = () => document.documentElement.classList.add("has-scrolled");
  if (window.scrollY > 10) hideScrollCue();
  window.addEventListener("scroll", hideScrollCue, { once: true, passive: true });
}

const revealItems = document.querySelectorAll([
  ".invitation-copy",
  ".program-section .section-kicker",
  ".program-section h2",
  ".day-card",
  ".location-inner > .section-kicker",
  ".location-card",
  ".details-photo",
  ".rsvp-inner > .section-kicker",
  ".rsvp-inner > h2",
  ".gift-note-card",
  ".guest-form-title",
  ".rsvp-deadline",
  ".rsvp-section form",
  ".finale-copy",
  ".finale-signature"
].join(","));

if (revealItems.length) {
  document.documentElement.classList.add("reveal-ready");
  revealItems.forEach(item => item.classList.add("scroll-reveal"));

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach(item => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -7%"
    });

    revealItems.forEach(item => revealObserver.observe(item));
  }
}

const form = document.querySelector("#rsvp-form");
const drinkInputs = [...document.querySelectorAll('input[name="drinks"]')];
const attendanceInputs = [...document.querySelectorAll('input[name="attendance"]')];
const customAttendance = document.querySelector("#attendance-custom");
const customAttendanceField = document.querySelector(".custom-attendance-field");
const customAttendanceText = document.querySelector("#attendance-custom-text");
const partyOptions = [...document.querySelectorAll("[data-party]")];
const partyDetails = [...document.querySelectorAll("[data-party-details]")];

const syncCustomAttendance = () => {
  const active = Boolean(customAttendance?.checked);

  if (customAttendanceField) customAttendanceField.hidden = !active;
  if (customAttendanceText) {
    customAttendanceText.disabled = !active;
    customAttendanceText.required = active;
  }
};

const syncPartyDetails = () => {
  const selectedParty = partyOptions.find(input => input.checked)?.dataset.party;

  partyDetails.forEach(section => {
    const active = section.dataset.partyDetails === selectedParty;
    section.hidden = !active;
    section.querySelectorAll("input").forEach(input => {
      input.disabled = !active;
    });
  });
};

attendanceInputs.forEach(input => input.addEventListener("change", () => {
  syncCustomAttendance();
  syncPartyDetails();
}));
syncCustomAttendance();
syncPartyDetails();

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
  syncCustomAttendance();
  syncPartyDetails();
});
