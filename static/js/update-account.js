document.querySelectorAll(".accordion-header").forEach(header => {

  header.addEventListener("click", () => {

    const accordion = header.parentElement;
    const content = accordion.querySelector(".accordion-content");

    accordion.classList.toggle("open");

    if (accordion.classList.contains("open")) {
      content.style.maxHeight = content.scrollHeight + "px";
    } else {
      content.style.maxHeight = null;
    }

  });

});

document.querySelectorAll(".accordion.open .accordion-content").forEach(content => {
  content.style.maxHeight = content.scrollHeight + "px";
});