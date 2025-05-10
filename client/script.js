// hide and seek
function showSection(sectionId, button){
  // Hide all sections
  const sections = document.querySelectorAll('.form-section');
  sections.forEach(section => section.classList.remove('active'));
  
  console.log("Showing section:", sectionId);
  // show selected seciton
  const activeSection = document.getElementById(sectionId);
  if(activeSection){
    activeSection.classList.add('active');
  }
}
// for showing by default
showSection('profile');

// toggle button

const toggle = document.getElementById('toggleSwitch');
toggle.addEventListener('change', function() {
  if(this.checked) {
    console.log('Toggle is ON');
  }
  else {
    console.log('Toggle is OFF');
  }
})