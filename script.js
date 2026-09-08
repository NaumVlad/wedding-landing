const siteImageSources = [
  "assets/hero-portrait.jpg",
  "assets/invitation-champagne-hydrangea.png",
  "assets/location-osokory-clean-no-logo.png",
  "assets/details-studio.jpg",
  "assets/finale-couple.jpg"
];

const showSite = () => document.documentElement.classList.remove("site-loading");
const preloadImage = source => new Promise(resolve => {
  const image = new Image();
  image.onload = () => {
    if (typeof image.decode !== "function") {
      resolve();
      return;
    }
    image.decode().catch(() => {}).finally(resolve);
  };
  image.onerror = resolve;
  image.src = source;
});

const preloadFallback = window.setTimeout(showSite, 20000);
Promise.all(siteImageSources.map(preloadImage)).then(() => {
  window.clearTimeout(preloadFallback);
  showSite();
});

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

const mobileViewport = window.matchMedia("(max-width: 759px)");
let lockedViewportWidth = window.innerWidth;

const lockMobileHeroHeight = () => {
  if (!mobileViewport.matches) {
    document.documentElement.style.removeProperty("--mobile-hero-height");
    return;
  }

  const viewportHeight = Math.round(window.visualViewport?.height || window.innerHeight);
  document.documentElement.style.setProperty("--mobile-hero-height", `${viewportHeight}px`);
};

lockMobileHeroHeight();

window.addEventListener("resize", () => {
  if (Math.abs(window.innerWidth - lockedViewportWidth) < 24) return;
  lockedViewportWidth = window.innerWidth;
  lockMobileHeroHeight();
}, { passive: true });

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
const attendanceInputs = [...document.querySelectorAll('input[name="attendance"]')];
const customAttendance = document.querySelector("#attendance-custom");
const customAttendanceField = document.querySelector(".custom-attendance-field");
const customAttendanceText = document.querySelector("#attendance-custom-text");
const partyOptions = [...document.querySelectorAll("[data-party]")];
const partyDetails = [...document.querySelectorAll("[data-party-details]")];

const getValidationGroup = control => control?.closest(
  ".text-field, .custom-attendance-field, .party-size-field, .party-name-field, .choice-list"
);

const clearValidationGroup = group => {
  if (!group) return;
  group.classList.remove("field-invalid");
  group.querySelectorAll("[aria-invalid='true']").forEach(control => {
    control.removeAttribute("aria-invalid");
  });
};

const clearValidationState = () => {
  form?.querySelectorAll(".field-invalid").forEach(clearValidationGroup);
};

const markValidationGroup = group => {
  if (!group) return;
  group.classList.add("field-invalid");
  group.querySelectorAll("input:not(:disabled), textarea:not(:disabled), select:not(:disabled)").forEach(control => {
    control.setAttribute("aria-invalid", "true");
  });
};

const syncCustomAttendance = () => {
  const active = Boolean(customAttendance?.checked);

  if (customAttendanceField) customAttendanceField.hidden = !active;
  if (!active) clearValidationGroup(customAttendanceField);
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
    if (!active) clearValidationGroup(section.querySelector(".field-invalid"));
    section.querySelectorAll("input").forEach(input => {
      input.disabled = !active;
    });
  });
};

attendanceInputs.forEach(input => input.addEventListener("change", () => {
  syncCustomAttendance();
  syncPartyDetails();
  clearValidationGroup(input.closest(".choice-list"));
}));
syncCustomAttendance();
syncPartyDetails();

form?.addEventListener("input", event => {
  const control = event.target;
  if (!(control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement || control instanceof HTMLSelectElement)) return;
  if (control.checkValidity()) clearValidationGroup(getValidationGroup(control));
});

form?.addEventListener("submit", event => {
  event.preventDefault();

  document.querySelector(".form-status").textContent = "";
  clearValidationState();

  const invalidControls = [...form.querySelectorAll("input, textarea, select")].filter(control => (
    !control.disabled && control.willValidate && !control.checkValidity()
  ));
  invalidControls.forEach(control => markValidationGroup(getValidationGroup(control)));

  if (invalidControls.length) {
    const firstInvalidControl = invalidControls[0];
    const firstInvalidGroup = getValidationGroup(firstInvalidControl);
    firstInvalidGroup?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => firstInvalidControl?.focus({ preventScroll: true }), 350);
    return;
  }

  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  localStorage.setItem("wedding-rsvp", JSON.stringify(data));

  document.querySelector(".form-status").textContent = "Дякуємо! Вашу відповідь збережено на цьому пристрої.";
  form.reset();
  clearValidationState();
  syncCustomAttendance();
  syncPartyDetails();
});
