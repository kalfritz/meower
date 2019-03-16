const form = document.querySelector('.mew-form');
const loadingElement = document.querySelector('.loading');
const API_URL = 'http://localhost:5500';

loadingElement.style.display = 'none';

form.addEventListener('submit', event => {
  event.preventDefault();
  console.log('a');
  const formData = new FormData(form);
  const name = formData.get('name');
  const content = formData.get('content');

  let mew = {
    name,
    content,
  };

  form.style.display = 'none';
  loadingElement.style.display = '';

  fetch(`${API_URL}/mews`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(mew),
  })
    /*fetch(API_URL)*/
    .catch(err => console.log(err))
    .then(res => res.json())
    .then(createdMew => {
      console.log(createdMew);
      loadingElement.style.display = 'none';
    });
});
