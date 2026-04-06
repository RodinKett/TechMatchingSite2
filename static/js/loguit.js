const blur = document.getElementById("overlay-blur");
const loguitScherm = document.getElementById("loguit-scherm");
const loguitBtn = document.getElementById("loguit");

function toggleLoguit() {
  loguitScherm.classList.toggle("verborgen");
  blur.classList.toggle("verborgen");
}

loguitBtn.addEventListener("click", toggleLoguit);

