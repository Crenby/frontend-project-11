function renderFeeds(state, selectors) {
  selectors.feeds.innerHTML = '';

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
  selectors.feeds.append(div);
}

function openModal(state, selectors) {
  const title = document.querySelectorAll('.list-group-item');
  const allPost = [state.data.items].flat(Infinity);

  title.forEach((item) => {
    item.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-outline-primary')) {
        const titleSelector = item.querySelector('a');
        const titleText = titleSelector.textContent;

        titleSelector.classList.add('fw-normal', 'link-secondary');
        titleSelector.classList.remove('fw-bold');

        const post = allPost.find((searchPost) => searchPost.title === titleText);

        selectors.modalTitle.textContent = post.title;
        selectors.modalBody.textContent = post.description;
        titleSelector.href = post.link;

        selectors.modal.classList.add('show');
        selectors.modal.style.cssText = `
          display: block;
          background-color: rgba(0,0,0,.5);
        `;

        selectors.body.style.cssText = `
          overflow: hidden; 
          padding-right: 17px;
        `;
      }
    });
  });
}

function renderPosts(state, selectors) {
  selectors.posts.innerHTML = '';
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
  selectors.posts.append(div);
  openModal(state, selectors);
}

function upDataRender(state, selectors) {
  const ul = selectors.posts.querySelector('ul');
  const li = document.createElement('li');

  li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
  li.innerHTML = `
              <a href="${state.data.items[0].link}" class="fw-bold" data-id="137" target="_blank" rel="noopener noreferrer">${state.data.items[0].title}</a>
              <button type="button" class="btn btn-outline-primary btn-sm" data-id="137" data-bs-toggle="modal" data-bs-target="#modal">Просмотр</button>
            `;

  ul.prepend(li);
  openModal(state, selectors);
}

function view(state, path, value, selectors) {
  switch (path) {
    case 'form.validUrl':
      if (value) {
        selectors.input.classList.add('is-invalid');
      } else {
        selectors.input.classList.remove('is-invalid');
      }
      break;
    case 'form.errors':
      selectors.feedback.textContent = value;
      selectors.feedback.classList.add('text-danger');
      selectors.feedback.classList.remove('text-success');
      break;
    case 'form.status':
      selectors.feedback.textContent = value;
      selectors.feedback.classList.remove('text-danger');
      selectors.feedback.classList.add('text-success');
      break;
    case 'data.description':
      renderFeeds(state, selectors);
      renderPosts(state, selectors);
      break;
    case 'data.items':
      upDataRender(state, selectors);
      break;
    default:
      break;
  }
}

export default view;
