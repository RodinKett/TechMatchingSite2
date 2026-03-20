let currentStep = 0;

function goTo(step) {
  const container = document.getElementById('container');

  // Alleen animatie van login -> register
  if (currentStep === 0 && step === 1) {
    container.style.transition = 'transform 0.6s ease';
  } else {
    container.style.transition = 'none';
  }

  container.style.transform = `translateY(-${step * 100}vh)`;
  currentStep = step;
}