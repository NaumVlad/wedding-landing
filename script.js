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

const syncCustomAttendance = () => {
  const active = Boolean(customAttendance?.checked);

  if (customAttendanceField) customAttendanceField.hidden = !active;
  if (customAttendanceText) {
    customAttendanceText.disabled = !active;
    customAttendanceText.required = active;
  }
};

attendanceInputs.forEach(input => input.addEventListener("change", syncCustomAttendance));
syncCustomAttendance();

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
});
