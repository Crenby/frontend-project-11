import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import view from './view.js';
import resources from './locales/index.js';
import parser from './parser.js';

function validate(fields, feeds) {
  const schema = yup.object({
    url: yup.string().required().url().notOneOf(feeds),
  });
  return schema.validate(fields);
}

const getFullUrl = (rssUrl) => {
  const url = new URL('/get', 'https://allorigins.hexlet.app');
  const { searchParams } = url;
  searchParams.set('url', rssUrl);
  searchParams.set('disableCache', 'true');
  return url.toString();
};

function upDatingPosts(stateData) {
  const promise = stateData.feeds.map((fid) => axios.get(getFullUrl(fid.url))
    .then((response) => {
      const newData = parser(response.data.contents);
      const filtData = stateData.posts.flat(Infinity).map((item) => item.title);

      newData.items.forEach((item) => {
        if (!filtData.includes(item.title)) {
          stateData.posts.unshift(item);
        }
      });
    })
    .catch((error) => {
      console.error(error);
    }));

  Promise.all([promise])
    .then(() => setTimeout(upDatingPosts, 5000, stateData));
}

export default function app() {
  const state = {
    form: {
      status: null,
      errors: null,
    },
    feeds: [],
    posts: [],
    event: {
      closeModal: null,
      openModal: null,
    },
    readPosts: [],
  };

  const selectors = {
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
  };

  const defaultLang = 'ru';

  const i18n = i18next.createInstance();
  i18n.init({
    debug: false,
    lng: defaultLang,
    resources,
  })
    .then(() => {
      yup.setLocale({
        mixed: {
          required: i18n.t('errors.required'),
          notOneOf: i18n.t('errors.exists'),
        },
        string: {
          url: i18n.t('errors.invalidUrl'),
        },
      });

      const watchedState = onChange(state, (path, value) => {
        view(state, path, value, selectors, i18n);
      });

      upDatingPosts(watchedState);

      selectors.form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const out = formData.get('url');

        validate({ url: out }, state.feeds.map((item) => item.url))
          .then(() => {
            axios.get(getFullUrl(out))
              .then((response) => {
                watchedState.form.errors = null;
                const parseData = parser(response.data.contents);
                state.posts.unshift(parseData.items);
                watchedState.feeds.unshift({
                  title: parseData.title,
                  description: parseData.description,
                  url: out,
                });
                watchedState.form.status = i18n.t('errors.validUrl');

                const title = document.querySelector('.list-group');

                title.addEventListener('click', (event) => {
                  const { target } = event;
                  if (target.tagName === 'BUTTON') {
                    const allPost = [state.posts].flat(Infinity);
                    const titleSelector = target.parentNode.querySelector('a');
                    const titleText = titleSelector.textContent;
                    const post = allPost.find((searchPost) => searchPost.title === titleText);

                    watchedState.event.openModal = [titleSelector, post];
                    watchedState.readPosts.push(post);
                  }
                });
              })
              .catch((error) => {
                if (error.isParsingError) {
                  watchedState.form.errors = i18n.t('errors.invalidRss');
                } else if (error.message === 'Network Error') {
                  watchedState.form.errors = i18n.t('errors.network');
                } else {
                  watchedState.form.errors = i18n.t('errors.unknown');
                }
              });

            selectors.input.focus();
            selectors.form.reset();
          })
          .catch((errorValidation) => {
            watchedState.form.status = null;
            watchedState.form.errors = errorValidation.message;
          });
      });

      selectors.btnClose.addEventListener('click', () => {
        watchedState.event.closeModal = 'closeModal';
        watchedState.event.closeModal = null;
      });

      selectors.btnSecondary.addEventListener('click', () => {
        watchedState.event.closeModal = 'closeModal';
        watchedState.event.closeModal = null;
      });
    });
}
