const form = document.getElementById('contactForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const fd = new FormData(form);
  const payload = {
    name: fd.get('name'),
    email: fd.get('email'),
    message: fd.get('message')
  };

  const res = await fetch('/.netlify/functions/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const json = await res.json();
  if (res.ok) {
    alert('Enviado con éxito!');
    form.reset();
  } else {
    alert('Error: ' + (json.error || 'unknown'));
  }
});
