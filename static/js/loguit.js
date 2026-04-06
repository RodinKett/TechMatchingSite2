const blur = document.getElementById("overlay-blur");
const loguitScherm = document.getElementById("loguit-scherm");
const loguitKnop = document.getElementById("loguit");

loguitKnop.addEventListener("click", () => {
  // Sluit profiel overlay, maar laat blur staan
  document.getElementById("profiel-overlay").classList.add("verborgen");
  
  // Open loguit scherm (blur blijft actief)
  loguitScherm.classList.remove("verborgen");
});

document.getElementById("knop-annuleer").addEventListener("click", () => {
  loguitScherm.classList.add("verborgen");
  document.getElementById("profiel-overlay").classList.remove("verborgen");
});