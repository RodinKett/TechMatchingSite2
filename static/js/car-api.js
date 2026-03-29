const merkSelect = document.getElementById("merkVoertuig-api");
const modelSelect = document.getElementById("voertuig-api");
const jaartalInput = document.getElementById("jaartalVoertuig");

const pkInput = document.getElementById("pk");
const gewichtInput = document.getElementById("gewicht");
const aandrijvingInput = document.getElementById("aandrijving");

// Haal opgeslagen waarden van de gebruiker uit de HTML (data attributes of hidden inputs)
const huidigMerk = merkSelect.dataset.huidigMerk || "";
const huidigModel = modelSelect.dataset.huidigModel || "";
const huidigJaartal = jaartalInput.value || "";

// Laad merken
async function laadMerken() {
  const response = await fetch("/api/car-brands");
  const merken = await response.json();

  merkSelect.innerHTML = `<option value="">Selecteer merk</option>`; // Default optie

  merken.forEach(merk => {
    const optie = document.createElement("option");
    optie.value = merk.make_id;
    optie.textContent = merk.make_display;

    // Automatisch selecteren als het overeenkomt met opgeslagen merk
    if (merk.make_display === huidigMerk || merk.make_id === huidigMerk) {
      optie.selected = true;
    }

    merkSelect.appendChild(optie);
  });

  // Als er een huidig merk is, laad meteen de modellen
  if (merkSelect.value && huidigJaartal) {
    await laadModellen(merkSelect.value, huidigJaartal);
  }
}

// Laad modellen functie
async function laadModellen(merk, jaartal) {
  const response = await fetch(`/api/car-models/${merk}/${jaartal}`);
  const modellen = await response.json();

  modelSelect.innerHTML = `<option value="">Selecteer model</option>`; // Default optie

  if (modellen.length === 0) {
    modelSelect.innerHTML += `<option>Geen modellen gevonden voor dit jaar</option>`;
    modelSelect.disabled = true;
    return;
  }

  modellen.forEach(model => {
    const optie = document.createElement("option");
    optie.value = model.model_name;
    optie.textContent = model.model_name;

    // Automatisch selecteren als het overeenkomt met opgeslagen model
    if (model.model_name === huidigModel) {
      optie.selected = true;
    }

    modelSelect.appendChild(optie);
  });

  modelSelect.disabled = false;

  // Laad specs als er een model geselecteerd is
  if (huidigModel) {
    await laadSpecificaties(merk, huidigModel, jaartal);
  }
}

// Laad specificaties functie
async function laadSpecificaties(merk, model, jaartal) {
  const response = await fetch(`/api/car-specs/${merk}/${model}/${jaartal}`);
  const trims = await response.json();

  if (trims.length > 0) {
    const auto = trims[0];
    pkInput.value = auto.model_engine_power_ps;
    gewichtInput.value = auto.model_weight_kg;
    aandrijvingInput.value = auto.model_drive;
  }
}

// Event listeners
merkSelect.addEventListener("change", async () => {
  const merk = merkSelect.value;
  const jaartal = jaartalInput.value;

  if (!jaartal) {
    alert("Selecteer eerst een jaartal");
    merkSelect.value = "";
    modelSelect.innerHTML = `<option value="">Selecteer model</option>`;
    modelSelect.disabled = true;
    return;
  }

  await laadModellen(merk, jaartal);
});

jaartalInput.addEventListener("change", () => {
  modelSelect.innerHTML = `<option value="">Selecteer model</option>`;
  modelSelect.disabled = true;
});

jaartalInput.addEventListener("change", async () => {
  const merk = merkSelect.value;
  const jaartal = jaartalInput.value;
  if (merk && jaartal) {
    await laadModellen(merk, jaartal);
  }
});

modelSelect.addEventListener("change", async () => {
  const merk = merkSelect.value;
  const model = modelSelect.value;
  const jaartal = jaartalInput.value;

  await laadSpecificaties(merk, model, jaartal);
});

// Start
laadMerken();