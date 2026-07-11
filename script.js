// РЕДАКТИРОВАНИЕ: замените дату свадьбы ниже (год, месяц-1, день, час).
const weddingDate = new Date(2026, 9, 10, 15, 0, 0);

const pad = n => String(Math.max(0, n)).padStart(2, "0");
function updateCountdown(){
  const distance = Math.max(0, weddingDate - new Date());
  document.querySelector("#days").textContent = String(Math.floor(distance / 86400000)).padStart(3,"0");
  document.querySelector("#hours").textContent = pad(Math.floor(distance / 3600000) % 24);
  document.querySelector("#minutes").textContent = pad(Math.floor(distance / 60000) % 60);
  document.querySelector("#seconds").textContent = pad(Math.floor(distance / 1000) % 60);
}
updateCountdown(); setInterval(updateCountdown,1000);

const menu = document.querySelector(".menu"), links = document.querySelector(".nav-links");
menu.addEventListener("click",()=>{const open=links.classList.toggle("open");menu.setAttribute("aria-expanded",open)});
links.addEventListener("click",()=>links.classList.remove("open"));

document.querySelector("#rsvp-form").addEventListener("submit",e=>{
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
  const data = Object.fromEntries(formData);
  data.drinks = formData.getAll("drinks");
  localStorage.setItem("wedding-rsvp",JSON.stringify(data));
  document.querySelector(".form-status").textContent = "Спасибо! Ваш ответ сохранён на этом устройстве.";
  e.currentTarget.reset();
});
