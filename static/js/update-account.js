document.querySelectorAll(".accordion-header").forEach(header => {
  header.addEventListener("click", () => {
    const accordion = header.parentElement;
    const content = accordion.querySelector(".accordion-content");

    // Close other accordions
    document.querySelectorAll(".accordion").forEach(other => {
      if (other !== accordion) {
        other.classList.remove("open");
        other.querySelector(".accordion-content").style.maxHeight = null;
      }
    });

    // Toggle current accordion
    accordion.classList.toggle("open");

    if (accordion.classList.contains("open")) {
      content.style.maxHeight = content.scrollHeight + "px";
    } else {
      content.style.maxHeight = null;
    }
  });
});

// Initialize open accordions
document.querySelectorAll(".accordion.open .accordion-content").forEach(content => {
  content.style.maxHeight = content.scrollHeight + "px";
});

const fileInput = document.getElementById("upload-profiel");
const preview = document.getElementById("previewImage");

fileInput.addEventListener("change", function () {

  const file = this.files[0];

  if (file) {

    const reader = new FileReader();

    reader.addEventListener("load", function () {
      preview.src = reader.result;
    });

    reader.readAsDataURL(file);

  }

});