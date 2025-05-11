document.getElementById("image").addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = document.getElementById("preview");
        img.src = e.target.result;
        img.style.display = "block";
      };
      reader.readAsDataURL(file);
}
});

document.getElementById("profile-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = document.getElementById("profile-form");
  const formData = new FormData(form);

  // Append image manually if needed
  const imageInput = document.getElementById("image");
  if (imageInput.files.length > 0) {
    formData.append("image", imageInput.files[0]);
  }

  try {
    const response = await fetch("http://localhost:5000/api/profile", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    alert(data.message || "Profile saved!");
  } catch (err) {
    console.error("Error submitting form:", err);
    alert("Something went wrong!");
  }
});

// Preview uploaded image
document.getElementById("image").addEventListener("change", function () {
  const preview = document.getElementById("preview");
  const file = this.files[0];
  if (file) {
    preview.src = URL.createObjectURL(file);
  }
});
