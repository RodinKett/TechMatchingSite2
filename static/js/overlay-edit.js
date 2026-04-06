const overlay = document.getElementById("profiel-overlay");
const openKnop = document.getElementById("button-edit-profiel");

openKnop.addEventListener("click", () => {
  overlay.classList.toggle("verborgen");
  document.getElementById("overlay-blur").classList.toggle("verborgen");
});

