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

  const fileInput = document.getElementById("profielUpload");

  const errorDob = document.querySelector(".error-reg-dob");
  const errorUpload = document.querySelector(".error-upload-foto");

  const geboortedatumInput = document.getElementById("reg-geboortedatum");
  const uploadInput = document.getElementById("profielUpload");

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

  // =====================
  // ACCOUNT
  // =====================

  const email = document.getElementById("update-email")?.value.trim();
  const currentPassword = document.getElementById("huidig-wachtwoord")?.value;
  const newPassword = document.getElementById("nieuw-wachtwoord")?.value;
  const confirmPassword = document.getElementById("bevestig-wachtwoord")?.value;
  const fileInput = document.getElementById("upload-profiel");

  const errorEmail = document.querySelector(".error-email");
  const errorCurrentPassword = document.querySelector(".error-huidig-wachtwoord");
  const errorNewPassword = document.querySelector(".error-nieuw-wachtwoord");
  const errorConfirmPassword = document.querySelector(".error-bevestig-wachtwoord");
  const errorProfielFoto = document.querySelector(".error-profielFoto");

  if (errorEmail) errorEmail.style.display = "none";
  if (errorCurrentPassword) errorCurrentPassword.style.display = "none";
  if (errorNewPassword) errorNewPassword.style.display = "none";
  if (errorConfirmPassword) errorConfirmPassword.style.display = "none";
  if (errorProfielFoto) errorProfielFoto.style.display = "none";

  const updateEmailInput = document.getElementById("update-email");
  const huidigWachtwoordInput = document.getElementById("huidig-wachtwoord");
  const nieuwWachtwoordInput = document.getElementById("nieuw-wachtwoord");
  const bevestigWachtwoordInput = document.getElementById("bevestig-wachtwoord");
  const uploadProfielInput = document.getElementById("upload-profiel");

  updateEmailInput?.classList.remove("input-error");
  huidigWachtwoordInput?.classList.remove("input-error");
  nieuwWachtwoordInput?.classList.remove("input-error");
  bevestigWachtwoordInput?.classList.remove("input-error");
  uploadProfielInput?.classList.remove("input-error");



  if (!emailRegex.test(email)) {
    errorEmail.textContent = "Ongeldig email formaat.";
    errorEmail.style.display = "block";

    updateEmailInput.classList.add("input-error");
    valid = false;
  }

  // wachtwoord wijzigen
  if (currentPassword && !passwordRegex.test(currentPassword)) {
    errorCurrentPassword.textContent = "Huidig wachtwoord minimaal 8 tekens met hoofdletter, kleine letter en cijfer.";
    errorCurrentPassword.style.display = "block";

    huidigWachtwoordInput.classList.add("input-error");
    valid = false;
  }

  if (newPassword !== "") {

    if (!currentPassword) {
      errorCurrentPassword.textContent = "Voer je huidige wachtwoord in.";
      errorCurrentPassword.style.display = "block";

      huidigWachtwoordInput.classList.add("input-error");
      valid = false;
    }

    if (!passwordRegex.test(newPassword)) {
      errorNewPassword.textContent = "Wachtwoord minimaal 8 tekens met hoofdletter, kleine letter en cijfer.";
      errorNewPassword.style.display = "block";

      nieuwWachtwoordInput.classList.add("input-error");
      valid = false;
    }

    if (!passwordRegex.test(confirmPassword)) {
      errorConfirmPassword.textContent = "Wachtwoord minimaal 8 tekens met hoofdletter, kleine letter en cijfer.";
      errorConfirmPassword.style.display = "block";

      bevestigWachtwoordInput.classList.add("input-error");
      valid = false;
    }

    if (newPassword !== confirmPassword) {
      errorConfirmPassword.textContent = "Wachtwoorden komen niet overeen.";
      errorConfirmPassword.style.display = "block";

      bevestigWachtwoordInput.classList.add("input-error");
      valid = false;
    }
  }

  // image type check
  if (fileInput && fileInput.files.length > 0) {

    const file = fileInput.files[0];
    const allowed = ["image/jpeg", "image/png", "image/webp"];

    if (!allowed.includes(file.type)) {
      errorProfielFoto.textContent = "Alleen JPG, PNG of WEBP toegestaan.";
      errorProfielFoto.style.display = "block";

      uploadProfielInput.classList.add("input-error");
      valid = false;
    }
  }


  // =====================
  // PERSOON GEGEVENS
  // =====================

  const ervaring = Number(document.getElementById("jarenErvaring")?.value);
  const opmerkingen = document.getElementById("aanvullendeOpmerkingen")?.value.trim();
  const specialisaties = document.querySelectorAll('input[name="specialisatie"]:checked');

  const errorErvaring = document.querySelector(".error-jarenErvaring");
  const errorSpecialisatie = document.querySelector(".error-specialisatie");
  const errorOpmerkingen = document.querySelector(".error-aanvullendeOpmerkingen");

  if (errorErvaring) errorErvaring.style.display = "none";
  if (errorSpecialisatie) errorSpecialisatie.style.display = "none";
  if (errorOpmerkingen) errorOpmerkingen.style.display = "none";

  const jarenErvaringInput = document.getElementById("jarenErvaring");
  const aanvullendeOpmerkingenInput = document.getElementById("aanvullendeOpmerkingen");
  const specialisatieInputs = document.querySelectorAll('input[name="specialisatie"]');

  specialisatieInputs?.forEach(cb => cb.classList.remove("input-error"));
  aanvullendeOpmerkingenInput?.classList.remove("input-error");
  jarenErvaringInput?.classList.remove("input-error");




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

  if (!opmerkingenRegex.test(opmerkingen)) {
    errorOpmerkingen.textContent = "Max 500 tekens, letters, cijfers en basis leestekens.";
    errorOpmerkingen.style.display = "block";

    aanvullendeOpmerkingenInput.classList.add("input-error");
    valid = false;
  }


  // =====================
  // VOERTUIG
  // =====================

  const voertuigJaar = Number(document.getElementById("jaartalVoertuig")?.value);
  const merkInput = document.getElementById("merkVoertuig-api");
  const voertuigInput = document.getElementById("voertuig-api");
  const mods = document.querySelectorAll('input[name="mods"]:checked');

  const errorJaartal = document.querySelector(".error-jaartalVoertuig");
  const errorMerk = document.querySelector(".error-merkVoertuig-api");
  const errorModel = document.querySelector(".error-voertuig-api");
  const errorMods = document.querySelector(".error-mods");

  if (errorJaartal) errorJaartal.style.display = "none";
  if (errorMerk) errorMerk.style.display = "none";
  if (errorModel) errorModel.style.display = "none";
  if (errorMods) errorMods.style.display = "none";

  const jaartalVoertuigInput = document.getElementById("jaartalVoertuig");
  const merkVoertuigApiInput = document.getElementById("merkVoertuig-api");
  const voertuigApiInput = document.getElementById("voertuig-api");
  const modsInputs = document.querySelectorAll('input[name="mods"]');
  
  modsInputs?.forEach(cb => cb.classList.remove("input-error"));
  jaartalVoertuigInput?.classList.remove("input-error");
  merkVoertuigApiInput?.classList.remove("input-error");
  voertuigApiInput?.classList.remove("input-error");




  if (voertuigJaar < 1950 || voertuigJaar > 2025) {
    errorJaartal.textContent = "Voer een geldig jaartal in.";
    errorJaartal.style.display = "block";

    jaartalVoertuigInput.classList.add("input-error");
    valid = false;
  }

  if (!merkInput.value || merkInput.value === "") {
    errorMerk.textContent = "Selecteer een merk.";
    errorMerk.style.display = "block";

    merkVoertuigApiInput.classList.add("input-error");
    valid = false;
  }

  if (!voertuigInput.value || voertuigInput.value === "") {
    errorModel.textContent = "Selecteer een model.";
    errorModel.style.display = "block";

    voertuigApiInput.classList.add("input-error");
    valid = false;
  }

  if (mods.length === 0) {
    errorMods.textContent = "Selecteer minimaal één mod.";
    errorMods.style.display = "block";

    modsInputs.forEach(cb => cb.classList.add("input-error"));
    valid = false;
  }


  if (!valid) {
    event.preventDefault();
  }
}


////////////////////////////////////////////////////////////////////////////////////////////


(function() {

  const jaartalInput = document.getElementById("jaartalVoertuig");
  const merkInput = document.getElementById("merkVoertuig-api");
  const voertuigInput = document.getElementById("voertuig-api");

  const pkInput = document.getElementById("pk");
  const gewichtInput = document.getElementById("gewicht");
  const aandrijvingInput = document.getElementById("aandrijving");

  if (!jaartalInput || !merkInput || !voertuigInput) return;

  jaartalInput.addEventListener("change", () => {
    merkInput.value = "-";
    voertuigInput.value = "-";

    pkInput.value = "";
    gewichtInput.value = "";
    aandrijvingInput.value = "";
  });

  merkInput.addEventListener("change", () => {
    voertuigInput.value = "-";

    pkInput.value = "";
    gewichtInput.value = "";
    aandrijvingInput.value = "";
  });

})();



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








