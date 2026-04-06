const overlay = document.getElementById("profiel-overlay");
const openBtn = document.getElementById("button-edit-profiel");

openBtn.addEventListener("click", () => {
  overlay.classList.toggle("verborgen");
  document.getElementById("overlay-blur").classList.toggle("verborgen");
});

