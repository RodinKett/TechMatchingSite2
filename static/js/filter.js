
// filter open en dicht + pijltje draaien
const buttons = document.querySelectorAll(".filter-opties .button");

buttons.forEach(button => {
  button.addEventListener("click", () => {
    const parent = button.parentElement;
    parent.classList.toggle("open");

    const pijltje = button.querySelector(".pijltje");
    pijltje.classList.toggle("gedraaid");
  });
});

//   telling hoeveel filters er aan staan 
// const inputs = document.querySelectorAll(".filter-opties input, .filter-opties select");
// const teller = document.getElementById("telling-filter");

// function filterTelling() {
//   let count = 0;

//   inputs.forEach(input => {
//     if (input.type === "checkbox" && input.checked) {
//       count++;
//     } else if (input.tagName === "SELECT" && input.value !== "") {
//       count++;
//     } else if (input.type === "number" && input.value !== "") {
//       count++;
//     }
//   });

//   teller.textContent = `(${count})`;
// }

// event listener op alle inputs
// inputs.forEach(input => {
//   input.addEventListener("change", filterTelling);
// });