const animatie = document.querySelector(".animatie")

document.addEventListener("DOMContentLoaded", (e) => {
    setTimeout(() => {
        animatie.classList.add("display-none");
    }, 2000);
})