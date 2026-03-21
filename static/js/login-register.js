// Huidige stap bijhouden
let huidigeStap = 0;

// Functie om naar een bepaalde stap te navigeren
function gaNaar(stap) {
  // Haal de container, body en formulier element op
  const container = document.getElementById('container');
  const body = document.body;
  const formulier = document.querySelector('.formulier-box');

  // Variabele voor verticale verschuiving
  let translateY = 0;

  // Als we naar de eerste stap (0) gaan
  if (stap === 0) {
    translateY = 0;                     // Geen verticale verschuiving
    toonStap(1);                         // Toon stap 1 van registratie
    formulier.classList.remove('slide-up'); // Verwijder slide-up animatie
  } 
  // Voor stappen 1 t/m 3
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

// Functie om terug te gaan naar de eerste stap
function gaTerugNaar(stap) {
  gaNaar(0); // Altijd terug naar stap 0
}

// Functie om een specifieke stap zichtbaar te maken
function toonStap(stap) {
  // Verberg alle stappen
  document.querySelectorAll('.stap').forEach(s => s.style.display = 'none');
  
  // Toon de gevraagde stap
  const el = document.getElementById('stap' + stap);
  if (el) el.style.display = 'block';
}

// JavaScript om de geselecteerde bestandsnaam weer te geven
const bestandInput = document.getElementById('profileUpload');
const bestandNaamSpan = document.querySelector('.upload-label .file-name');

bestandInput.addEventListener('change', () => {
  if (bestandInput.files.length > 0) {
    // Toon de naam van het geselecteerde bestand
    bestandNaamSpan.textContent = bestandInput.files[0].name;
  } else {
    // Toon standaardtekst als er geen bestand is geselecteerd
    bestandNaamSpan.textContent = 'Upload profielfoto';
  }
});