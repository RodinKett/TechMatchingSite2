const laadpagina = document.querySelector(".laadpagina");

function laadanimatieAan () {
    laadpagina.style.display = "block";
}

function laadanimatieUit () {
    laadpagina.style.display = "none";
}
const params = new URLSearchParams(window.location.search);
const next = params.get("next") || "/";

setTimeout(() => {
  window.location.href = next;
}, 5000);