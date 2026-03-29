/**
 * Multi-step Form & Styling Script
 * -----------------------
 * Dit script beheert de multi-step registratie/formulier navigatie en styling.
 * Functionaliteit:
 * 1. Houdt bij welke stap van het formulier momenteel zichtbaar is.
 * 2. Functies om naar een stap te navigeren of terug te gaan.
 * 3. Verbergt/Toont specifieke stappen van het formulier.
 * 4. Animeert de container en achtergrondpositie bij navigatie.
 * 5. Toont de geselecteerde bestandsnaam bij het uploaden van een profielfoto.
 */

// ------------------- Variabelen -------------------
let huidigeStap = 0; // Huidige stap in het multi-step formulier

// ------------------- Functies voor stap-navigatie -------------------

// Navigeren naar een specifieke stap
function gaNaar(stap) {
  const container = document.getElementById('container'); // Hoofdcontainer van formulier
  const body = document.body;                              // Body voor achtergrond animatie
  const formulier = document.querySelector('.formulier-box'); // Formulier container

  let translateY = 0; // Variabele voor verticale verschuiving

  // Specifieke logica voor eerste stap
  if (stap === 0) {
    translateY = 0;                     // Geen verschuiving
    toonStap(1);                         // Toon stap 1
    formulier.classList.remove('slide-up'); // Verwijder slide-up animatie
  } 
  // Logica voor stappen 1 t/m 3
  else if (stap >= 1 && stap <= 3) {
    translateY = -100;                   // Verplaats container omhoog
    formulier.classList.add('slide-up'); // Voeg slide-up animatie toe
  }

  // Animatie voor container
  container.style.transition = 'transform 0.6s ease';
  container.style.transform = `translateY(${translateY}vh)`;

  // Animatie voor achtergrondpositie van body
  body.style.transition = 'background-position 0.6s ease';
  body.style.backgroundPosition = stap === 0 ? 'center bottom' : 'center calc(100% - 60vh)';

  // Toon stap als deze groter is dan 0
  if (stap > 0) toonStap(stap);

  // Update huidige stap
  huidigeStap = stap;
}

// Teruggaan naar de eerste stap
function gaTerugNaar(stap) {
  gaNaar(0); // Altijd terug naar stap 0
}

// Toon een specifieke stap van het formulier
function toonStap(stap) {
  // Verberg alle stappen
  document.querySelectorAll('.stap').forEach(s => s.style.display = 'none');
  
  // Toon de gevraagde stap
  const el = document.getElementById('stap' + stap);
  if (el) el.style.display = 'block';
}

// ------------------- Bestandsupload -------------------

// Elementen voor bestand-upload ophalen
const bestandInput = document.getElementById('profileUpload');
const bestandNaamSpan = document.querySelector('.upload-label .file-name');

// Event listener om bestandsnaam weer te geven
bestandInput.addEventListener('change', () => {
  if (bestandInput.files.length > 0) {
    // Toon de naam van het geselecteerde bestand
    bestandNaamSpan.textContent = bestandInput.files[0].name;
  } else {
    // Toon standaardtekst als er geen bestand is geselecteerd
    bestandNaamSpan.textContent = 'Upload profielfoto';
  }
});