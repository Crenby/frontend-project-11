import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import view from './view';
import resources from './locales/index';
import parser from './parser';

export default function app() {
  const state = {
    form: {
      status: null,
      validUrl: false,
      errors: null,
    },
    feeds: [],
    posts: [],
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

  function validate(fields, feeds) {
    const schema = yup.object({
      url: yup.string().required().url().notOneOf(feeds),
    });
    return schema.validate(fields);
  }

  const watchedState = onChange(state, (path, value) => {
    view(state, path, value, selectors);
  });

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
            watchedState.posts.unshift(item);
          }
        });
      })
      .catch((error) => {
        console.error(error);
      }));

    Promise.all([promise])
      .then(() => setTimeout(upDatingPosts, 5000, stateData));
  }

  upDatingPosts(state);

  selectors.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const out = formData.get('url');

    validate({ url: out }, state.feeds.map((item) => item.url))
      .then(() => {
        axios.get(getFullUrl(out))
          .then((response) => {
            watchedState.form.validUrl = false;
            watchedState.form.errors = null;
            const parseData = parser(response.data.contents);
            state.posts.unshift(parseData.items);
            watchedState.feeds.unshift({ title: parseData.title, description: parseData.description, url: out });
            watchedState.form.status = i18n.t('errors.validUrl');
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
        watchedState.form.validUrl = true;
        watchedState.form.errors = errorValidation.message;
      });
  });
}
