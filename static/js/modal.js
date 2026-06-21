const infoRankKnop = document.querySelector(".info-rank-knop");
const dropdown = document.querySelector(".info-rank-dropdown");

const filter = document.getElementById("filter-rank");
const spelers = document.querySelectorAll(".leaderbord-speler");

const challenge = document.getElementById("start-challenge");

infoRankKnop.addEventListener("click", () => {
  dropdown.classList.toggle("hidden");
});

// kan je extra info bekijken van elke speler BR: chagpt & co-pilot (closest gebruiken)
document.querySelectorAll(".info-speler-knop").forEach((button) => {
  button.addEventListener("click", () => {
    const speler = button.closest(".leaderbord-speler, .jij");

    speler.classList.toggle("zichtbaar");
  });
});

// Filteren op de pagina (beginner, etc) BR: Chatgpt (filter hulp om werkend te rkijgen)
filter.addEventListener("change", () => {
  const gekozenRank = filter.value;

  spelers.forEach((speler) => {
    const rank = speler.dataset.rang;

    if (gekozenRank === "" || rank === gekozenRank) {
      speler.style.display = "block";
    } else {
      speler.style.display = "none";
    }
  });

  updateRanking();
});

// Ik heb updateRanking toegevoegd hier boven en een functie gemaakt
// Want hij wordt hierboven aangeroepen natuurlijk
function updateRanking() {
  let positie = 1;

  spelers.forEach((speler) => {
    if (speler.style.display !== "none") {
      const plaats = speler.querySelector(".plaats");

      plaats.textContent = positie;

      speler.classList.remove("eerste", "tweede", "derde");

      if (positie === 1) {
        speler.classList.add("eerste");
      } else if (positie === 2) {
        speler.classList.add("tweede");
      } else if (positie === 3) {
        speler.classList.add("derde");
      }

      positie++;
    }
  });
}

if (challenge) {
  challenge.addEventListener("click", async () => {
    try {
      const res = await fetch("/leadermatch", {
        method: "POST",
      });

      const data = await res.json();

      alert("Resultaat: " + data.result);

      location.reload();
    } catch (err) {
      console.error(err);
      alert(
        "Er is iets mis gegaan met de challenge, probeer het later opnieuw",
      );
    }
  });
}
