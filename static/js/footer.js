const iconen = document.querySelectorAll(".footer-icon");

iconen.forEach(icon => {
  if (icon.getAttribute("href") === window.location.pathname) {
    icon.classList.add("actief");
  }
});