


// Deze functie haalt een profiel op van de server
async function laadProfiel() {

  // Vraag data op van je API
  const res = await fetch("/api/profiel");

  // Zet response om naar JSON
  const p = await res.json();

  // Zet username in de HTML
  document.getElementById("naam-gebruiker").textContent = p.username;

  // Zet profielfoto
  document.querySelector("#foto-section img").src = p.profilePhoto;

  // Zet voertuig naam (als die bestaat)
  document.querySelectorAll("dd")[0].textContent =
    p.voertuig?.naam || "-";

  // Zet pk
  document.querySelectorAll("dd")[1].textContent =
    p.voertuig?.pk || "-";

  // Zet jaar (optioneel)
  document.querySelectorAll("dd")[2].textContent =
    p.voertuig?.jaar || "-";

  // Zet specialisatie
  document.querySelectorAll("dd")[3].textContent =
    p.specialisatie || "-";

  // Zet ervaring
  document.querySelectorAll("dd")[4].textContent =
    p.jarenErvaring + " jaar" || "-";


// Laad meteen een profiel als pagina opent
laadProfiel();
}

const card = document.getElementById("card");

// nieuw profiel laden
function resetCard() {

  // Zet animatie tijdelijk uit (anders glitch)
  card.style.transition = "none";

  // Zet kaart terug naar midden
  card.style.transform = "translateX(0)";

  // Haal nieuw profiel op
  laadProfiel();

  // Zet animatie weer aan
  setTimeout(() => {
    card.style.transition = "0.3s";
  }, 50);
}
