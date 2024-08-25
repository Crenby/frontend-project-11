function renderFeeds(state) {
  state.selector.feeds.innerHTML = '';

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

  state.data.title.forEach((item, i) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    li.innerHTML = `
      <h3 class="h6 m-0">${item}</h3>
      <p class="m-0 small text-black-50">${state.data.description[i]}</p>
    `;
    ul.append(li);
  });

  div.append(ul);
  state.selector.feeds.append(div);
}

function renderPosts(state) {
  state.selector.posts.innerHTML = '';
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

  state.data.items.flat(Infinity).forEach((item) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

    li.innerHTML = `
        <a href="${item.link}" class="fw-bold" data-id="137" target="_blank" rel="noopener noreferrer">${item.title}</a>
        <button type="button" class="btn btn-outline-primary btn-sm" data-id="137" data-bs-toggle="modal" data-bs-target="#modal">Просмотр</button>
      `;
    ul.append(li);
  });

  div.append(ul);
  state.selector.posts.append(div);
}

function upDataRender(state) {
  const ul = state.selector.posts.querySelector('ul');
  const li = document.createElement('li');

  li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
  li.innerHTML = `
              <a href="${state.data.items[0].link}" class="fw-bold" data-id="137" target="_blank" rel="noopener noreferrer">${state.data.items[0].title}</a>
              <button type="button" class="btn btn-outline-primary btn-sm" data-id="137" data-bs-toggle="modal" data-bs-target="#modal">Просмотр</button>
            `;

  ul.prepend(li);
}

function view(state, path, value) {
  switch (path) {
    case 'form.validUrl':
      if (value) {
        state.selector.input.classList.add('is-invalid');
      } else {
        state.selector.input.classList.remove('is-invalid');
      }
      break;
    case 'form.errors':
      state.selector.feedback.textContent = value;
      state.selector.feedback.classList.add('text-danger');
      state.selector.feedback.classList.remove('text-success');
      break;
    case 'form.status':
      state.selector.feedback.textContent = value;
      state.selector.feedback.classList.remove('text-danger');
      state.selector.feedback.classList.add('text-success');
      break;
    case 'data.description':
      renderFeeds(state);
      renderPosts(state);
      break;
    case 'data.items':
      upDataRender(state);
      break;
    default:
      break;
  }
}

export default view;
