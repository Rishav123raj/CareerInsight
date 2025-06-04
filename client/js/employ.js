document.getElementById('employabilityWidget').addEventListener('click', () => {
    document.getElementById('employabilityFormCard').classList.remove('hidden');
  });

  document.getElementById('employabilityForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
      technicalExpertise: document.getElementById('technicalExpertise').value,
      githubLink: document.getElementById('githubLink').value,
      leetcodeLink: document.getElementById('leetcodeLink').value,
      linkedinLink: document.getElementById('linkedinLink').value
    };

    const response = await fetch('http://localhost:5000/api/features/emp-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    document.getElementById('employabilityScore').innerText = result.score + '%';
    document.getElementById('employabilityFormCard').classList.add('hidden');
  });