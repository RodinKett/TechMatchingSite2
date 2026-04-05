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
const bestandInput = document.getElementById('profielUpload');
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

document.querySelector(".formulier-box-login").addEventListener("submit", async function(e) {
  e.preventDefault(); // prevent normal form submission

  // Clear previous errors
  document.querySelector(".error-inlog-gebruikersnaam").style.display = "none";
  document.querySelector(".error-inlog-wachtwoord").style.display = "none";

  const username = document.getElementById("inlog-gebruikersnaam").value;
  const password = document.getElementById("inlog-wachtwoord").value;

  try {
    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      // Show error in the right <p>
      if (data.field === "username") {
        const el = document.querySelector(".error-inlog-gebruikersnaam");
        el.textContent = data.message;
        el.style.display = "block";
      } else if (data.field === "password") {
        const el = document.querySelector(".error-inlog-wachtwoord");
        el.textContent = data.message;
        el.style.display = "block";
      } else if (data.field === "general") {
        alert(data.message); // fallback for general errors
      }
    } else if (data.success) {
      window.location.href = data.redirect; // redirect on success
    }

  } catch (err) {
    console.error(err);
    alert("Er is iets misgegaan bij het inloggen.");
  }
});

document.getElementById("formulier-registratie").addEventListener("submit", async function(e) {
  e.preventDefault(); // prevent normal form submission

  // Clear previous errors
  const errorEls = this.querySelectorAll("p");
  errorEls.forEach(el => { el.style.display = "none"; el.textContent = ""; });

  // Gather all form data, including files
  const formData = new FormData(this);

  try {
    const res = await fetch("/register", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (!res.ok) {
      // Map server-side errors to the correct <p> elements
      for (const key in data.errors) {
        let selector;
        switch (key) {
          case "username": selector = ".error-reg-gebruikersnaam"; break;
          case "email": selector = ".error-reg-email"; break;
          case "password": selector = ".error-reg-password"; break;
          case "dob": selector = ".error-reg-geboortedatum"; break;
          case "profielFoto": selector = ".error-upload-foto"; break; // match your HTML
          default: selector = null;
        }
        if (selector) {
          const el = document.querySelector(selector);
          if (el) {
            el.textContent = data.errors[key];
            el.style.display = "block";
          }
        } else {
          alert(data.errors[key]);
        }
      }
    } else if (data.success) {
      window.location.href = data.redirect || "/";
    }

  } catch (err) {
    console.error(err);
    alert("Er is iets misgegaan bij het registreren.");
  }
});
