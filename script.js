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

const renderPartyNames = section => {
  const sizeInput = section.querySelector(".party-size");
  const namesContainer = section.querySelector(".party-names");
  if (!sizeInput || !namesContainer) return;

  const partySize = Math.min(10, Math.max(2, Number(sizeInput.value) || 2));
  sizeInput.value = String(partySize);
  const previousValues = [...namesContainer.querySelectorAll("input")].map(input => input.value);
  namesContainer.replaceChildren();

  for (let guestNumber = 2; guestNumber <= partySize; guestNumber += 1) {
    const label = document.createElement("label");
    label.className = "party-name-field";

    const labelText = document.createElement("span");
    labelText.innerHTML = `Ім’я гостя ${guestNumber} <b class="required-mark">*</b>`;

    const input = document.createElement("input");
    input.type = "text";
    input.name = "party_names";
    input.placeholder = "Ім’я та прізвище";
    input.required = true;
    input.value = previousValues[guestNumber - 2] || "";

    label.append(labelText, input);
    namesContainer.append(label);
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
    if (active) renderPartyNames(section);
  });
};

attendanceInputs.forEach(input => input.addEventListener("change", () => {
  syncCustomAttendance();
  syncPartyDetails();
}));
partyDetails.forEach(section => {
  section.querySelector(".party-size")?.addEventListener("change", () => renderPartyNames(section));
});
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
  data.party_names = formData.getAll("party_names");
  localStorage.setItem("wedding-rsvp", JSON.stringify(data));

  document.querySelector(".form-status").textContent = "Дякуємо! Вашу відповідь збережено на цьому пристрої.";
  form.reset();
  syncCustomAttendance();
  syncPartyDetails();
});
