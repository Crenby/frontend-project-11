import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import view from './view';
import resources from './locales/index';
import parser from './parser';

function openModal(state) {
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

        state.selector.modalTitle.textContent = post.title;
        state.selector.modalBody.textContent = post.description;
        titleSelector.href = post.link;

        state.selector.modal.classList.add('show');
        state.selector.modal.style.cssText = `
          display: block;
          background-color: rgba(0,0,0,.5);
        `;

        state.selector.body.style.cssText = `
          overflow: hidden; 
          padding-right: 17px;
        `;

        state.selector.btnClose.addEventListener('click', () => {
          state.selector.modal.style.cssText = 'display: none';
          state.selector.body.style.cssText = '';
        });

        state.selector.btnSecondary.addEventListener('click', () => {
          state.selector.modal.style.cssText = 'display: none';
          state.selector.body.style.cssText = '';
        });
      }
    });
  });
}

export default function app() {
  const state = {
    form: {
      status: null,
      validUrl: false,
      errors: null,
    },
    selector: {
      form: document.querySelector('.rss-form'),
      input: document.querySelector('#url-input'),
      feedback: document.querySelector('.feedback'),
      posts: document.querySelector('.posts'),
      feeds: document.querySelector('.feeds'),
      modalTitle: document.querySelector('.modal-title'),
      modalBody: document.querySelector('.modal-body'),
      btnClose: document.querySelector('.btn-close'),
      btnSecondary: document.querySelector('.btn-secondary'),
      modal: document.querySelector('.modal'),
      body: document.querySelector('body'),
    },
    fids: [],
    data: {
      title: [],
      description: [],
      items: [],
    },
  };

  const defaultLang = 'ru';

  const i18n = i18next.createInstance();
  i18n.init({
    debug: false,
    lng: defaultLang,
    resources,
  });

  yup.setLocale({
    mixed: {
      required: i18n.t('errors.required'),
      notOneOf: i18n.t('errors.exists'),
    },
    string: {
      url: i18n.t('errors.invalidUrl'),
    },
  });

  function validate(fields, fids) {
    const schema = yup.object({
      url: yup.string().required().url().notOneOf(fids),
    });
    return schema.validate(fields);
  }

  const watchedState = onChange(state, (path, value) => {
    view(state, path, value);
  });

  const getFullUrl = (rssUrl) => {
    const url = new URL('/get', 'https://allorigins.hexlet.app');
    const { searchParams } = url;
    searchParams.set('url', rssUrl);
    searchParams.set('disableCache', 'true');
    return url.toString();
  };

  function upData(stateData) {
    const promise = stateData.fids.forEach((fid) => {
      axios.get(getFullUrl(fid))
        .then((response) => {
          const newData = parser(response);
          const filtData = [stateData.data.items].flat(Infinity).map((item) => item.title);

          newData.items.forEach((item) => {
            if (!filtData.includes(item.title)) {
              watchedState.data.items.unshift(item);
            }
          });
          openModal(state);
        })
        .catch((error) => {
          console.error(error);
        });
    });
    
    Promise.all([promise])
      .then(() => setTimeout(upData, 5000, stateData));
  }

  state.selector.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const out = formData.get('url');

    validate({ url: out }, state.fids)
      .then(() => {
        axios.get(getFullUrl(out))
          .then((response) => {
            watchedState.fids.unshift(out);
            watchedState.form.validUrl = false;
            watchedState.form.errors = null;
            const parseData = parser(response);
            watchedState.data.title.unshift(parseData.title);
            state.data.items.unshift(parseData.items);
            watchedState.data.description.unshift(parseData.description);
            watchedState.form.status = i18n.t('errors.validUrl');
            openModal(state);
            upData(state);
          })
          .catch((error) => {
            if (error.isParsingError) {
              state.fids.shift();
              watchedState.form.errors = i18n.t('errors.invalidRss');
            } else if (error.message === 'Network Error') {
              watchedState.form.errors = i18n.t('errors.network');
            } else {
              watchedState.form.errors = i18n.t('errors.unknown');
            }
          });

        state.selector.input.focus();
        state.selector.form.reset();
      })
      .catch((errorValidation) => {
        watchedState.form.status = null;
        watchedState.form.validUrl = true;
        watchedState.form.errors = errorValidation.message;
      });
  });
}
