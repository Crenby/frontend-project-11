const input = document.querySelector("#url-input");
const feedback = document.querySelector(".feedback");
const posts = document.querySelector(".posts");
const feeds = document.querySelector(".feeds");

function renderFeeds(data) {
  feeds.innerHTML = '';

  const div = document.createElement('div');
  div.classList.add('card', 'border-0');

  const insDiv = document.createElement('div');
  insDiv.classList.add('card-body');

  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.textContent = 'Фиды';
  insDiv.append(h2);

  div.append(insDiv);

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');

  data.forEach((item) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    li.innerHTML = `
      <h3 class="h6 m-0">${item.title}</h3>
      <p class="m-0 small text-black-50">${item.description}</p>
    `;
    ul.append(li);
  })

  div.append(ul);
  feeds.append(div);
}

function renderPosts(data) {
  posts.innerHTML = '';
  const div = document.createElement('div');
  div.classList.add('card', 'border-0');

  const insDiv = document.createElement('div');
  insDiv.classList.add('card-body');

  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.textContent = 'Посты';
  insDiv.append(h2);

  div.append(insDiv);

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');

  data.forEach((item) => {
    item.items.forEach((post) => {
      const li = document.createElement('li');
      li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

      li.innerHTML = `
        <a href="${post.link}" class="fw-bold" data-id="137" target="_blank" rel="noopener noreferrer">${post.title}</a>
        <button type="button" class="btn btn-outline-primary btn-sm" data-id="137" data-bs-toggle="modal" data-bs-target="#modal">Просмотр</button>
      `;
      ul.append(li);
    })
  })

  div.append(ul);
  posts.append(div);
}

export default function view(state, path, value) {
  switch (path) {
    case 'form.validUrl':
      if (value) {
        input.classList.add('is-invalid');
      } else {
        input.classList.remove('is-invalid');
      }
      break;
    case 'form.errors':
      feedback.textContent = value;
      feedback.classList.add('text-danger');
      feedback.classList.remove('text-success');
      break;
    case 'form.status':
      feedback.textContent = value;
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      break;
    case 'data':
      console.log(state.data);
      renderFeeds(state.data);
      renderPosts(state.data);
      break;
  }
}