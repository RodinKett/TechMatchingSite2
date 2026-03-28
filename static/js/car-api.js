const brandSelect = document.getElementById("merkVoertuig-api");
const modelSelect = document.getElementById("voertuig-api");
const yearInput = document.getElementById("jaartalVoertuig");

const pkInput = document.getElementById("pk");
const weightInput = document.getElementById("gewicht");
const driveInput = document.getElementById("aandrijving");

// load brands
async function loadBrands() {
  const res = await fetch("/api/car-brands");
  const brands = await res.json();

  brands.forEach(make => {
    const option = document.createElement("option");
    option.value = make.make_id;
    option.textContent = make.make_display;
    brandSelect.appendChild(option);
  });
}

// load models
brandSelect.addEventListener("change", async () => {
  const make = brandSelect.value;
  const year = yearInput.value;

  if (!year) {
    alert("Selecteer eerst een jaartal");
    brandSelect.value = "";
    return;
  }

  const res = await fetch(`/api/car-models/${make}/${year}`);
  const models = await res.json();

  modelSelect.innerHTML = "";

  if (models.length === 0) {
    modelSelect.innerHTML = `<option>No models found for this year</option>`;
    return;
  }

  modelSelect.innerHTML = `<option value="">Select model</option>`;

  models.forEach(model => {
    const option = document.createElement("option");
    option.value = model.model_name;
    option.textContent = model.model_name;
    modelSelect.appendChild(option);
  });
});

// reset model when year changes
yearInput.addEventListener("change", () => {
  modelSelect.innerHTML = `<option>Select model</option>`;
});

// disable dropdown
modelSelect.disabled = true;

brandSelect.addEventListener("change", async () => {
  modelSelect.disabled = false;
});

// load specs
modelSelect.addEventListener("change", async () => {
  const make = brandSelect.value;
  const model = modelSelect.value;
  const year = yearInput.value;

  const res = await fetch(`/api/car-specs/${make}/${model}/${year}`);
  const trims = await res.json();

  if (trims.length > 0) {
    const car = trims[0];

    pkInput.value = car.model_engine_power_ps;
    weightInput.value = car.model_weight_kg;
    driveInput.value = car.model_drive;
  }
});

loadBrands();