
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
