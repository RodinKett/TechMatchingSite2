/**
 * Accordion & Profielfoto Preview Script
 * -----------------------
 * 1. Openen en sluiten van accordion-secties
 * 2. Slechts één accordion tegelijk open
 * 3. Preview van geselecteerd profielbestand
 * 4. Accordion hoogte automatisch aanpassen bij image load
 */

// ------------------- Accordion Functionaliteit -------------------

// Selecteer alle headers van accordions
document.querySelectorAll(".accordion-header").forEach(header => {
  header.addEventListener("click", () => {
    const accordion = header.parentElement; 
    const content = accordion.querySelector(".accordion-content");

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
      content.style.maxHeight = content.scrollHeight + "px";
    } else {
      content.style.maxHeight = null;
    }
  });
});

// Initialiseer alle vooraf openstaande accordions
document.querySelectorAll(".accordion.open .accordion-content").forEach(content => {
  content.style.maxHeight = content.scrollHeight + "px";
});

// ------------------- Profielfoto Preview -------------------

const fileInput = document.getElementById("upload-profiel");
const preview = document.getElementById("previewImage");

fileInput.addEventListener("change", function () {
  const file = this.files[0];

  if (file) {
    const reader = new FileReader();

    reader.addEventListener("load", function () {
      preview.src = reader.result;
    });

    reader.readAsDataURL(file);
  }
}); 

// ------------------- Update Accordion Height When Image Loads -------------------

preview.addEventListener("load", () => {
  const accordionContent = preview.closest(".accordion-content");
  const accordion = preview.closest(".accordion");
  if (accordion.classList.contains("open")) {
    accordionContent.style.maxHeight = accordionContent.scrollHeight + "px";
  }
});