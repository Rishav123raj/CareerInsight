document.getElementById("image").addEventListener("change", function () {
  const preview = document.getElementById("preview");
  const file = this.files[0];
  if (file) {
    preview.src = URL.createObjectURL(file);
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
      withCredentials: true, // send cookies
      headers: {
        'Content-Type': 'multipart/form-data'
        }
    });

    const data = await response.json();
    alert(data.message || "Profile saved!");

    // ✅ Populate the form fields with returned profile data
    if (data.profile) {
      const p = data.profile;
      document.getElementById("fullName").value = p.fullName || '';
      document.getElementById("dob").value = p.dob ? p.dob.split('T')[0] : '';
      document.getElementById("email").value = p.email || '';
      document.getElementById("contactNumber").value = p.contactNumber || '';
      document.getElementById("degreeProgram").value = p.degreeProgram || '';
      document.getElementById("fieldOfStudy").value = p.fieldOfStudy || '';
      document.getElementById("university").value = p.university || '';
      document.getElementById("cgpa").value = p.cgpa || '';
      document.getElementById("graduationYear").value = p.graduationYear || '';
      document.getElementById("skills").value = p.skills || '';
      document.getElementById("careerGoals").value = p.careerGoals || '';
      document.getElementById("linkedin").value = p.linkedin || '';
      document.getElementById("github").value = p.github || '';

      if (p.image) {
        document.getElementById("preview").src = `http://localhost:5000/uploads/${p.image}`;
      }
    }

  } catch (err) {
    console.error("Error submitting form:", err);
    alert("Something went wrong!");
  }
});
