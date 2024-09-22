function renderFeeds(state, selectors, i18n) {
  const renderDiv = selectors.feeds;
  renderDiv.innerHTML = '';

  const div = document.createElement('div');
  div.classList.add('card', 'border-0');

  const insDiv = document.createElement('div');
  insDiv.classList.add('card-body');

  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.textContent = i18n.t('text.feeds');
  insDiv.append(h2);

  div.append(insDiv);

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');

  state.feeds.forEach((item) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');

    const h3 = document.createElement('h3');
    h3.classList.add('h6', 'm-0');
    h3.textContent = item.title;

    const p = document.createElement('p');
    p.classList.add('m-0', 'small', 'text-black-50');
    p.textContent = item.description;

    li.append(h3);
    li.append(p);
    ul.append(li);
  });

  div.append(ul);
  selectors.feeds.append(div);
}

function renderPosts(state, selectors, i18n) {
  const { posts } = selectors;
  posts.innerHTML = '';
  const div = document.createElement('div');
  div.classList.add('card', 'border-0');

  const insDiv = document.createElement('div');
  insDiv.classList.add('card-body');

  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.textContent = i18n.t('text.posts');
  insDiv.append(h2);

  div.append(insDiv);

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');

  state.posts.flat(Infinity).forEach((item) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

    const a = document.createElement('a');
    a.href = item.link;
    a.classList.add('fw-bold');
    a.textContent = item.title;

    const button = document.createElement('button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.textContent = i18n.t('text.button');

    li.append(a);
    li.append(button);
    ul.append(li);
  });

  div.append(ul);
  selectors.posts.append(div);
}

function upDataRender(state, selectors, i18n) {
  const ul = selectors.posts.querySelector('ul');
  const li = document.createElement('li');

  li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

  const a = document.createElement('a');
  a.href = state.posts[0].link;
  a.classList.add('fw-bold');
  a.textContent = state.posts[0].title;

  const button = document.createElement('button');
  button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  button.textContent = i18n.t('text.button');

  li.append(a);
  li.append(button);
  ul.prepend(li);
}

function view(state, path, value, selectors, i18n) {
  const { feedback } = selectors;
  switch (path) {
    case 'form.validUrl':
      if (value) {
        selectors.input.classList.add('is-invalid');
      } else {
        selectors.input.classList.remove('is-invalid');
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
    case 'feeds':
      renderFeeds(state, selectors, i18n);
      renderPosts(state, selectors, i18n);
      break;
    case 'posts':
      upDataRender(state, selectors, i18n);
      break;
    default:
      break;
  }
}

export default view;
