/**
 * Accordion & Profielfoto Preview Script
 * -----------------------
 * Dit script beheert:
 * 1. Het openen en sluiten van accordion-secties.
 * 2. Zodat slechts één accordion tegelijk open is.
 * 3. Preview van een geselecteerd profielbestand (image upload) voordat het wordt geüpload.
 */

// ------------------- Accordion Functionaliteit -------------------

// Selecteer alle headers van accordions
document.querySelectorAll(".accordion-header").forEach(header => {
  header.addEventListener("click", () => {
    const accordion = header.parentElement; // Het accordion element zelf
    const content = accordion.querySelector(".accordion-content"); // De content sectie

    // Sluit andere open accordions
    document.querySelectorAll(".accordion").forEach(other => {
      if (other !== accordion) {
        other.classList.remove("open");
        other.querySelector(".accordion-content").style.maxHeight = null;
      }
    });

    // Toggle huidige accordion
    accordion.classList.toggle("open");

    if (accordion.classList.contains("open")) {
      // Openen: stel maxHeight in op scrollHeight voor animatie
      content.style.maxHeight = content.scrollHeight + "px";
    } else {
      // Sluiten: reset maxHeight
      content.style.maxHeight = null;
    }
  });
});

// Initialiseer alle vooraf openstaande accordions
document.querySelectorAll(".accordion.open .accordion-content").forEach(content => {
  content.style.maxHeight = content.scrollHeight + "px";
});

// ------------------- Profielfoto Preview -------------------

// Selecteer file input en preview image element
const fileInput = document.getElementById("upload-profiel");
const preview = document.getElementById("previewImage");

fileInput.addEventListener("change", function () {
  const file = this.files[0];

  if (file) {
    const reader = new FileReader();

    // Zodra het bestand is ingelezen, stel het in als bron van de preview afbeelding
    reader.addEventListener("load", function () {
      preview.src = reader.result;
    });

    reader.readAsDataURL(file); // Lees bestand als data URL
  }
});