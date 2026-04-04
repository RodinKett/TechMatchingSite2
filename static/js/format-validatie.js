// ===============================
// REGEX RULES (shared)
// ===============================

const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;// Gebruikersnaam: 3–30 tekens, alleen letters, cijfers, _ en -
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@#$%^&+=]{8,}$/;// Wachtwoord: min. 8 tekens met minstens 1 kleine letter, 1 hoofdletter en 1 cijfer
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;// Email: controleert of het een geldig emailformaat heeft (tekst@domein.ext)
const dobRegex = /^\d{4}-\d{2}-\d{2}$/;// Geboortedatum: formaat yyyy-mm-dd
const opmerkingenRegex = /^[a-zA-Z0-9\s.,!?()\-@#]{0,500}$/;// Opmerkingen: max. 500 tekens, letters, cijfers, spaties en enkele leestekens toegestaan


// ===============================
// LOGIN VALIDATION
// ===============================

function validateLogin(event) {

  let valid = true;

  const username = document.getElementById("inlog-gebruikersnaam")?.value.trim();
  const password = document.getElementById("inlog-wachtwoord")?.value.trim();

  const errorUsername = document.querySelector(".error-inlog-gebruikersnaam");
  const errorPassword = document.querySelector(".error-inlog-wachtwoord");

  if (errorUsername) errorUsername.style.display = "none";
  if (errorPassword) errorPassword.style.display = "none";

  const usernameInput = document.getElementById("inlog-gebruikersnaam");
  const passwordInput = document.getElementById("inlog-wachtwoord");

  usernameInput?.classList.remove("input-error");
  passwordInput?.classList.remove("input-error");

  if (!usernameRegex.test(username)) {
    errorUsername.textContent = "Ongeldige gebruikersnaam.";
    errorUsername.style.display = "block";

    usernameInput.classList.add("input-error");
    valid = false;
  }

  if (!passwordRegex.test(password)) {
    errorPassword.textContent = "Wachtwoord minimaal 8 tekens met hoofdletter, kleine letter en cijfer.";
    errorPassword.style.display = "block";

    passwordInput.classList.add("input-error");
    valid = false;
  }

  if (!valid) event.preventDefault();
}


// ===============================
// REGISTER STEP 1
// ===============================

function validateRegisterStep1() {

  let valid = true;

  const username = document.getElementById("reg-gebruikersnaam")?.value.trim();
  const email = document.getElementById("reg-email")?.value.trim();

  const errorUsername = document.querySelector(".error-reg-gebruikersnaam");
  const errorEmail = document.querySelector(".error-reg-email");

  const usernameInput = document.getElementById("reg-gebruikersnaam");
  const emailInput = document.getElementById("reg-email");

  usernameInput?.classList.remove("input-error");
  emailInput?.classList.remove("input-error");

  if (errorUsername) errorUsername.style.display = "none";
  if (errorEmail) errorEmail.style.display = "none";

  if (!usernameRegex.test(username)) {
    errorUsername.textContent = "Ongeldige gebruikersnaam.";
    errorUsername.style.display = "block";

    usernameInput.classList.add("input-error");
    valid = false;
  }

  if (!emailRegex.test(email)) {
    errorEmail.textContent = "Ongeldig email formaat.";
    errorEmail.style.display = "block";

    emailInput.classList.add("input-error");
    valid = false;
  }

  return valid;
}


// ===============================
// REGISTER STEP 2
// ===============================

function validateRegisterStep2() {

  let valid = true;

  const dobInput = document.getElementById("reg-geboortedatum");
  const dob = dobInput?.value;

  const fileInput = document.getElementById("profileUpload");

  const errorDob = document.querySelector(".error-reg-dob");
  const errorUpload = document.querySelector(".error-upload-foto");

  const geboortedatumInput = document.getElementById("reg-geboortedatum");
  const uploadInput = document.getElementById("profileUpload");

  geboortedatumInput?.classList.remove("input-error");
  uploadInput?.classList.remove("input-error");

  // hide errors
  if (errorDob) errorDob.style.display = "none";
  if (errorUpload) errorUpload.style.display = "none";

  if (!dob) {
    errorDob.textContent = "Geboortedatum is verplicht.";
    errorDob.style.display = "block";

    geboortedatumInput.classList.add("input-error");
    valid = false;
  }

  if (!isAdult(dob)) {
    errorDob.textContent = "Je moet minimaal 18 jaar oud zijn.";
    errorDob.style.display = "block";

    geboortedatumInput.classList.add("input-error");
    valid = false;
  }

  // IMAGE REQUIRED
  if (!fileInput || fileInput.files.length === 0) {
    errorUpload.textContent = "Profielfoto is verplicht.";
    errorUpload.style.display = "block";

    uploadInput.classList.add("input-error");
    valid = false;
  }

  return valid;
}


// ===============================
// REGISTER STEP 3
// ===============================

function validateRegisterStep3(event) {

  let valid = true;

  const password = document.getElementById("reg-wachtwoord")?.value;
  const confirmPassword = document.getElementById("reg-wachtwoord-bevestigen")?.value;

  const errorPassword = document.querySelector(".error-reg-password");
  const errorConfirm = document.querySelector(".error-reg-password-bevestigen");

  const wachtwoordInput = document.getElementById("reg-wachtwoord");
  const wachtwoordBevestigenInput = document.getElementById("reg-wachtwoord-bevestigen");

  wachtwoordInput?.classList.remove("input-error");
  wachtwoordBevestigenInput?.classList.remove("input-error");

  if (errorPassword) errorPassword.style.display = "none";
  if (errorConfirm) errorConfirm.style.display = "none";

  if (!passwordRegex.test(password)) {
    errorPassword.textContent = "Wachtwoord minimaal 8 tekens met hoofdletter, kleine letter en cijfer.";
    errorPassword.style.display = "block";

    wachtwoordInput.classList.add("input-error");
    valid = false;
  }

  if (password !== confirmPassword) {
    errorConfirm.textContent = "Wachtwoorden komen niet overeen.";
    errorConfirm.style.display = "block";

    wachtwoordBevestigenInput.classList.add("input-error");
    valid = false;
  }

  if (!valid) event.preventDefault();
}


// ===============================
// AANVULLENDE GEGEVENS
// ===============================

function validateAanvullendeGegevens(event) {

  let valid = true;

  const ervaring = Number(document.getElementById("jarenErvaring")?.value);
  const opmerkingen = document.getElementById("aanvullendeOpmerkingen")?.value.trim();
  const voertuigJaar = Number(document.getElementById("jaartalVoertuig")?.value);
  const specialisaties = document.querySelectorAll('input[name="specialisatie"]:checked');
  const mods = document.querySelectorAll('input[name="mods"]:checked');

  const errorErvaring = document.querySelector(".error-jarenErvaring");
  const errorSpecialisatie = document.querySelector(".error-specialisatie");
  const errorMods = document.querySelector(".error-mods");
  const errorJaartalVoertuig = document.querySelector(".error-jaartalVoertuig");
  const errorOpmerkingen = document.querySelector(".error-aanvullendeOpmerkingen");
  const errorMerk = document.querySelector(".error-merkVoertuig-api");
  const errorVoertuig = document.querySelector(".error-voertuig-api");

  if (errorErvaring) errorErvaring.style.display = "none";
  if (errorSpecialisatie) errorSpecialisatie.style.display = "none";
  if (errorMods) errorMods.style.display = "none";
  if (errorJaartalVoertuig) errorJaartalVoertuig.style.display = "none";
  if (errorOpmerkingen) errorOpmerkingen.style.display = "none";
  if (errorMerk) errorMerk.style.display = "none";
  if (errorVoertuig) errorVoertuig.style.display = "none";

  const specialisatieInputs = document.querySelectorAll('input[name="specialisatie"]');
  const modsInputs = document.querySelectorAll('input[name="mods"]');
  const jarenErvaringInput = document.getElementById("jarenErvaring");
  const opmerkingenInput = document.getElementById("aanvullendeOpmerkingen");
  const jaartalVoertuigInput = document.getElementById("jaartalVoertuig");
  const merkInput = document.getElementById("merkVoertuig-api");
  const voertuigInput = document.getElementById("voertuig-api");

  specialisatieInputs?.forEach(cb => cb.classList.remove("input-error"));
  modsInputs?.forEach(cb => cb.classList.remove("input-error"));
  jarenErvaringInput?.classList.remove("input-error");
  opmerkingenInput?.classList.remove("input-error");
  jaartalVoertuigInput?.classList.remove("input-error");
  merkInput?.classList.remove("input-error");
  voertuigInput?.classList.remove("input-error");

  

  if (!ervaring || ervaring < 0 || ervaring > 99) {
    errorErvaring.textContent = "Voer een geldig aantal jaren ervaring in.";
    errorErvaring.style.display = "block";

    jarenErvaringInput.classList.add("input-error");
    valid = false;
  }

  if (specialisaties.length === 0) {
    errorSpecialisatie.textContent = "Selecteer minimaal één specialisatie.";
    errorSpecialisatie.style.display = "block";

    specialisatieInputs.forEach(cb => cb.classList.add("input-error"));
    valid = false;
  }

  if (mods.length === 0) {
    errorMods.textContent = "Selecteer minimaal één mod.";
    errorMods.style.display = "block";

    modsInputs.forEach(cb => cb.classList.add("input-error"));
    valid = false;
  }

  if (voertuigJaar < 1950 || voertuigJaar > 2025) {
    errorJaartalVoertuig.textContent = "Voer een geldig jaartal in.";
    errorJaartalVoertuig.style.display = "block";

    jaartalVoertuigInput.classList.add("input-error");
    valid = false;
  }

  if (merkInput.value === "-") {
    errorMerk.textContent = "Selecteer een merk.";
    errorMerk.style.display = "block";

    merkInput.classList.add("input-error");
    valid = false;
  }

  if (voertuigInput.value === "-") {
    errorVoertuig.textContent = "Selecteer een model.";
    errorVoertuig.style.display = "block";

    voertuigInput.classList.add("input-error");
    valid = false;
  }

  if (!opmerkingen || !opmerkingenRegex.test(opmerkingen)) {
    errorOpmerkingen.textContent ="Schrijf een bericht over jezelf: max. 500 tekens, letters, cijfers, spaties en enkele leestekens toegestaan";
    errorOpmerkingen.style.display = "block";

    opmerkingenInput.classList.add("input-error");
    valid = false;
  }

  if (!valid) event.preventDefault();
}


// ===============================
// UPDATE ACCOUNT
// ===============================

function validateUpdateAccount(event) {

  let valid = true;

  const newPassword = document.getElementById("nieuw-wachtwoord")?.value;
  const confirmPassword = document.getElementById("bevestig-wachtwoord")?.value;

  const errorConfirm = document.querySelector(".error-bevestig-wachtwoord");

  if (errorConfirm) errorConfirm.style.display = "none";

  if (newPassword !== "" && newPassword !== confirmPassword) {

    errorConfirm.textContent = "Wachtwoorden komen niet overeen.";
    errorConfirm.style.display = "block";

    valid = false;
  }

  if (!valid) event.preventDefault();
}

function isAdult(dob) {

  const birthDate = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age >= 18;
}