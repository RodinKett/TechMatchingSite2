
////haalt de buttons up en bij click dat het een kant opgaat////
document.getElementById("button-volgende")
  .addEventListener("click", () => swipe("left"));

document.getElementById("button-challenge")
  .addEventListener("click", () => swipe("right"));

  ////pakt de bovenste kaart
  function haalBovensteKaart() {
  const cards = [...document.querySelectorAll(".veeg-kaart")];
  return cards.reduce((top, card) => {
    const z = parseInt(getComputedStyle(card).zIndex) || 0;
    const topZ = parseInt(getComputedStyle(top).zIndex) || 0;
    return z > topZ ? card : top;
  });
}

function swipe(direction) {
  const card = haalBovensteKaart(); 
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



