let currentStep = 0; // 0 = login, 1-3 = register steps

function goTo(step) {
  const container = document.getElementById('container');

  // Step 0: go back to login
  if (step === 0) {
    if (currentStep !== 0) {
      container.style.transition = 'transform 0.6s ease';
      container.style.transform = 'translateY(0)';
      // Reset register form to step 1
      showStep(1);
    }
    currentStep = 0;
    return;
  }

  // step is 1, 2 or 3 (register steps)
  if (currentStep === 0) {
    // Transition from login to register (slide down)
    container.style.transition = 'transform 0.6s ease';
    container.style.transform = 'translateY(-100vh)';
    showStep(step);
  } else {
    // Already inside register – just change the visible step
    showStep(step);
  }

  currentStep = step;
}

// Kept for backward compatibility (buttons call goBackTo(0))
function goBackTo(step) {
  goTo(0);
}

function showStep(step) {
  document.querySelectorAll('.step').forEach(s => {
    s.style.display = 'none';
  });
  document.getElementById('step' + step).style.display = 'block';
}

function showStep(step) {
  document.querySelectorAll('.step').forEach(s => {
    s.style.display = 'none';
  });

  document.getElementById('step' + step).style.display = 'block';
}



