// const extraInfoButtons = document.querySelectorAll(".info-speler-knop")

const infoRankKnop = document.querySelector(".info-rank-knop");
const dropdown = document.querySelector(".info-rank-dropdown");

const filter = document.getElementById("filter-rank");
const spelers = document.querySelectorAll(".leaderbord-speler");


infoRankKnop.addEventListener("click", () => {
    dropdown.classList.toggle("hidden");
});


// Filteren simpel
document.querySelectorAll(".info-speler-knop").forEach(button => {
  button.addEventListener("click", () => {
    const speler = button.closest(".leaderbord-speler");

    speler.classList.toggle("zichtbaar");
  });
});

// Anders =
// function toggleExtraInfo(button) {
//   const speler = button.closest(".leaderbord-speler");
//   speler.classList.toggle("zichtbaar");
// }

// document.querySelectorAll(".info-speler-knop").forEach(button => {
//   button.addEventListener("click", () => toggleExtraInfo(button));
// });


filter.addEventListener("change", () => {
    const gekozenRank = filter.value;

    spelers.forEach(speler => {
        const rank = speler.dataset.rang;

        if (gekozenRank === "" || rank === gekozenRank) {
            speler.style.display = "block";
        } else {
            speler.style.display = "none";
        }
    });
});


