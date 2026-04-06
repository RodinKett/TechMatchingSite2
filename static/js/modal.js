const infoRankKnop = document.querySelector(".info-rank-knop");
const dropdown = document.querySelector(".info-rank-dropdown");

const filter = document.getElementById("filter-rank");
const spelers = document.querySelectorAll(".leaderbord-speler");


infoRankKnop.addEventListener("click", () => {
    dropdown.classList.toggle("hidden");
});


// kan je extra info bekijken van elke speler BR: chagpt & co-pilot (closest gebruiken)
document.querySelectorAll(".info-speler-knop").forEach(button => {
  button.addEventListener("click", () => {
    const speler = button.closest(".leaderbord-speler, .jij");

    speler.classList.toggle("zichtbaar");
  });
});


// Filteren op de pagina (beginner, etc) BR: Chatgpt (filter hulp om werkend te rkijgen)
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