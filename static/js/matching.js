console.log(document.getElementById("knop-filter"));
////haalt de buttons up en bij click dat het een kant opgaat////
document.getElementById("knop-volgende")
  .addEventListener("click", () => swipe("left"));

document.getElementById("knop-challenge")
  .addEventListener("click", () => swipe("right"));


  ///reset button filter///
  // document.getElementById("knop-reset").addEventListener("click", () => {
  // window.location.href = "/matching";
// });



// const params = new URLSearchParams(window.location.search);
// document.getElementById("telling-filter").textContent = params.size || "";


////filter overlay open en dicht kunnen doen////
document.getElementById("knop-filter")
  .addEventListener("click", () => {
    document.getElementById("filter-overlay").classList.add("zichtbaar");
  });

document.getElementById("knop-filter-sluiten")
  .addEventListener("click", () => {
    document.getElementById("filter-overlay").classList.remove("zichtbaar");
  });

document.getElementById("knop-resultaten")
  .addEventListener("click", () => {
    document.getElementById("filter-overlay").classList.remove("zichtbaar");
  });

  if (document.getElementById("geen-kaart")) {
  document.getElementById("knop-matching").style.display = "none";
}





  ////pakt de bovenste kaart
  function pakEersteKaart() {
  const cards = [...document.querySelectorAll(".veeg-kaart")]; // ← update selector
  return cards.reduce((top, card) => {
    const z = parseInt(getComputedStyle(card).zIndex) || 0;
    const topZ = parseInt(getComputedStyle(top).zIndex) || 0;
    return z > topZ ? card : top;
  });
}

function swipe(direction) {
  const card = pakEersteKaart(); // ← use this instead
  if (!card) return;

  const offset = direction === "right" ? "120%" : "-120%";
  const angle = direction === "right" ? 20 : -20;

  card.style.transform = `translateX(${offset}) rotate(${angle}deg)`;
  card.style.opacity = "0";

 setTimeout(() => {
    // reset kaart
    card.style.transition = "none";
    card.style.transform = "none";
    card.style.opacity = "1";

    // kaart naar onderen verplaatsen
    document.querySelector(".alle-kaarten").appendChild(card);

    // reflow zodat transition opnieuw werkt
    void card.offsetWidth;

    // transition terugzetten
    card.style.transition = "transform 0.35s ease, opacity 0.35s ease";
  }, 350);
}

console.log(window.location.search);