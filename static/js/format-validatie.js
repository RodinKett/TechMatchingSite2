function formatValidatie(event) {
  let valid = true;

  // --- INPUTS ---
  const inputs = {
    // Login
    loginUsername: document.getElementById("inlog-gebruikersnaam")?.value.trim(),
    loginPassword: document.getElementById("inlog-wachtwoord")?.value.trim(),

    // Registratie Stap 1
    regUsername: document.getElementById("reg-gebruikersnaam")?.value.trim(),
    regEmail: document.getElementById("reg-email")?.value.trim(),

    // Registratie Stap 2
    regDob: document.getElementById("reg-geboortedatum")?.value.trim(),

    // Registratie Stap 3
    regPassword: document.getElementById("reg-wachtwoord")?.value.trim(),
    regPasswordConfirm: document.getElementById("reg-wachtwoord-bevestigen")?.value.trim(),

    // Aanvullende gegevens / Update account
    jarenErvaring: document.getElementById("jarenErvaring")?.value.trim(),
    opmerkingen: document.getElementById("aanvullendeOpmerkingen")?.value.trim(),
    jaartalVoertuig: document.getElementById("jaartalVoertuig")?.value.trim(),
    specialisaties: document.querySelectorAll('input[name="specialisatie"]:checked'),
    mods: document.querySelectorAll('input[name="mods"]:checked'),
  };

  // --- ERROR ELEMENTS ---
  const errors = {
    loginUsername: document.querySelector(".error-inlog-gebruikersnaam"),
    loginPassword: document.querySelector(".error-inlog-wachtwoord"),
    regUsername: document.querySelector(".error-reg-gebruikersnaam"),
    regEmail: document.querySelector(".error-reg-email"),
    regDob: document.querySelector(".error-reg-dob"),
    regPassword: document.querySelector(".error-reg-password"),
    regPasswordConfirm: document.querySelector(".error-reg-password-bevestigen"),
    specialisaties: document.querySelector(".error-reg-specialisatie"),
    mods: document.querySelector(".error-mods"),
    jarenErvaring: document.querySelector(".error-jarenErvaring"),
    opmerkingen: document.querySelector(".error-opmerkingen"),
    jaartalVoertuig: document.querySelector(".error-jaartalVoertuig"),

  };

  // --- REGEX ---
  
  const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;// Gebruikersnaam: 3-30 tekens, alleen letters (hoofdletter/klein), cijfers, underscore of streepje
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@#$%^&+=]{8,}$/;// Wachtwoord: minimaal 8 tekens, minstens 1 kleine letter, 1 hoofdletter en 1 cijfer, toegestaan: letters, cijfers, @#$%^&+=
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;  // Email: eenvoudige check, tekst vóór en na '@', gevolgd door een punt en domein (min. 2 letters)
  const dobRegex = /^\d{4}-\d{2}-\d{2}$/;  // Geboortedatum: exact formaat yyyy-mm-dd
  const opmerkingenRegex = /^[a-zA-Z0-9\s.,!?()\-@#]{0,500}$/;  // Opmerkingen: max 500 tekens, toegestaan: letters, cijfers, spaties, .,!?()-@#

  // --- VERBERG ALLE ERRORS ---
  Object.values(errors).forEach(err => {
    if (err) err.style.display = "none";
  });

  // --- LOGIN VALIDATIE ---
  if (inputs.loginUsername !== undefined) {
    if (!inputs.loginUsername) {
      errors.loginUsername.textContent = "Gebruikersnaam is verplicht.";
      errors.loginUsername.style.display = "block";
      valid = false;
    } else if (!usernameRegex.test(inputs.loginUsername)) {
      errors.loginUsername.textContent = "Ongeldige gebruikersnaam (3-30 tekens, letters/cijfers/_/-).";
      errors.loginUsername.style.display = "block";
      valid = false;
    }
  }

  if (inputs.loginPassword !== undefined) {
    if (!inputs.loginPassword) {
      errors.loginPassword.textContent = "Wachtwoord is verplicht.";
      errors.loginPassword.style.display = "block";
      valid = false;
    } else if (!passwordRegex.test(inputs.loginPassword)) {
      errors.loginPassword.textContent = "Wachtwoord minimaal 8 tekens met hoofdletter, kleine letter en cijfer.";
      errors.loginPassword.style.display = "block";
      valid = false;
    }
  }

  // --- REGISTRATIE VALIDATIE ---
  if (inputs.regUsername !== undefined) {
    if (!inputs.regUsername) {
      errors.regUsername.textContent = "Gebruikersnaam is verplicht.";
      errors.regUsername.style.display = "block";
      valid = false;
    } else if (!usernameRegex.test(inputs.regUsername)) {
      errors.regUsername.textContent = "Ongeldige gebruikersnaam (3-30 tekens, letters/cijfers/_/-).";
      errors.regUsername.style.display = "block";
      valid = false;
    }
  }

  if (inputs.regEmail !== undefined) {
    if (!inputs.regEmail) {
      errors.regEmail.textContent = "Email is verplicht.";
      errors.regEmail.style.display = "block";
      valid = false;
    } else if (!emailRegex.test(inputs.regEmail)) {
      errors.regEmail.textContent = "Ongeldig emailformaat.";
      errors.regEmail.style.display = "block";
      valid = false;
    }
  }

  if (inputs.regDob !== undefined) {
    if (!inputs.regDob) {
      errors.regDob.textContent = "Geboortedatum is verplicht.";
      errors.regDob.style.display = "block";
      valid = false;
    } else if (!dobRegex.test(inputs.regDob)) {
      errors.regDob.textContent = "Ongeldig datumformaat (yyyy-mm-dd).";
      errors.regDob.style.display = "block";
      valid = false;
    }
  }

  if (inputs.regPassword !== undefined) {
    if (!inputs.regPassword) {
      errors.regPassword.textContent = "Wachtwoord is verplicht.";
      errors.regPassword.style.display = "block";
      valid = false;
    } else if (!passwordRegex.test(inputs.regPassword)) {
      errors.regPassword.textContent = "Wachtwoord minimaal 8 tekens met hoofdletter, kleine letter en cijfer.";
      errors.regPassword.style.display = "block";
      valid = false;
    }
  }

  if (inputs.regPasswordConfirm !== undefined) {
    if (inputs.regPasswordConfirm !== inputs.regPassword) {
      errors.regPasswordConfirm.textContent = "Wachtwoorden komen niet overeen.";
      errors.regPasswordConfirm.style.display = "block";
      valid = false;
    }
  }

  // --- CHECKBOX SPECIALISATIES ---
  if (inputs.specialisaties !== undefined && inputs.specialisaties.length === 0) {
    errors.specialisaties.textContent = "Selecteer minimaal één specialisatie.";
    errors.specialisaties.style.display = "block";
    valid = false;
  }

  // --- CHECKBOX MODS ---
if (inputs.mods !== undefined && inputs.mods.length === 0) {
  errors.mods.textContent = "Selecteer minimaal één mod.";
  errors.mods.style.display = "block";
  valid = false;
}

  // --- AANVULLENDE GEGEVENS VALIDATIE ---
  if (inputs.jarenErvaring !== undefined && (isNaN(inputs.jarenErvaring) || inputs.jarenErvaring < 0 || inputs.jarenErvaring > 99)) {
    errors.jarenErvaring.textContent = "Voer een geldig aantal jaren ervaring in (0-99).";
    errors.jarenErvaring.style.display = "block";
    valid = false;
  }

  if (inputs.opmerkingen !== undefined && inputs.opmerkingen.trim() !== "") {
    if (!opmerkingenRegex.test(inputs.opmerkingen)) {
      errors.opmerkingen.textContent = "Maximaal 500 tekens, alleen letters, cijfers en veilige symbolen toegestaan.";
      errors.opmerkingen.style.display = "block";
      valid = false;
    }
  }

  if (inputs.jaartalVoertuig !== undefined && (isNaN(inputs.jaartalVoertuig) || inputs.jaartalVoertuig < 1950 || inputs.jaartalVoertuig > 2025)) {
    errors.jaartalVoertuig.textContent = "Voer een geldig jaartal in (1950-2025).";
    errors.jaartalVoertuig.style.display = "block";
    valid = false;
  }

  // --- STOP FORM SUBMIT BIJ FOUT ---
  if (!valid) event.preventDefault();
}