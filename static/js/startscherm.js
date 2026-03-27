
document.addEventListener("DOMContentLoaded", () => {
    const animatie = document.querySelector(".animatie");

    setTimeout(() => {
        animatie.classList.add("display-none");

        setTimeout(() => {
            window.location.href = "/login";
        }, 250);

    }, 5000);
})