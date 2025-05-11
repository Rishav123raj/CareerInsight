document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  const logoutModal = document.getElementById("logoutModal");
  const confirmLogout = document.getElementById("confirmLogout");
  const cancelLogout = document.getElementById("cancelLogout");

  logoutBtn.addEventListener("click", () => {
    logoutModal.style.display = "flex";
  });

  cancelLogout.addEventListener("click", () => {
    logoutModal.style.display = "none";
  });

  confirmLogout.addEventListener("click", () => {
    window.location.href = "index.html";
  });

  window.addEventListener("click", (event) => {
    if (event.target === logoutModal) {
      logoutModal.style.display = "none";
    }
  });
});
