async function laadProfiel() {
  const res = await fetch("/api/profiel");
  const p = await res.json();

  

  document.getElementById("naam-gebruiker").textContent = p.username || "-";

  document.getElementById("profiel-foto").src =
    p.profielFoto ? `/uploads/${p.profielFoto}` : "/img/default.png";

  document.getElementById("voertuig").textContent =
    p.voertuig ? `${p.voertuig.merk} ${p.voertuig.model}` : "-";

  document.getElementById("pk").textContent = p.voertuig?.pk || "-";
  document.getElementById("jaar").textContent = p.voertuig?.jaartal || "-";

  document.getElementById("specialisatie").textContent = p.specialisatie || "-";
  document.getElementById("ervaring").textContent =
    p.jarenErvaring ? `${p.jarenErvaring} jaar` : "-";

  document.getElementById("win").textContent = p.win || "-";
  document.getElementById("mods").textContent = p.mods || "-";

  document.getElementById("opmerkingen").textContent =
    p.opmerkingen || "-";
}




///////code zodat de buttons de kaart naar links of naar rechts kunnen laten gaan////
document.getElementById("button-volgende").addEventListener("click", laadProfiel);
document.getElementById("button-challenge").addEventListener("click", laadProfiel);
laadProfiel();

document.getElementById("button-volgende").addEventListener("click", async () => {
  const card = document.getElementById("kaart");
  card.classList.add("kaart-swipe-left");
});


document.getElementById("button-challenge").addEventListener("click", async () => {
  const card = document.getElementById("kaart");
  card.classList.add("kaart-swipe-right");
});
// laad eerste profiel
laadProfiel();
