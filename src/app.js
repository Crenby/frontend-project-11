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
    fids: [],
    data: {
      title: [],
      description: [],
      items: [],
    },
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

  function validate(fields, fids) {
    const schema = yup.object({
      url: yup.string().required().url().notOneOf(fids),
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

  function upDatePosts(stateData) {
    const promise = stateData.fids.map((fid) => axios.get(getFullUrl(fid))
      .then((response) => {
        const parse = new DOMParser();
        const data = parse.parseFromString(response.data.contents, 'text/xml');

        const newData = parser(data);
        const filtData = [stateData.data.items].flat(Infinity).map((item) => item.title);

        newData.items.forEach((item) => {
          if (!filtData.includes(item.title)) {
            watchedState.data.items.unshift(item);
          }
        });
      })
      .catch((error) => {
        console.error(error);
      }));

    Promise.all([promise])
      .then(() => setTimeout(upDatePosts, 5000, stateData));
  }

  upDatePosts(state);

  selectors.form.addEventListener('submit', (e) => {
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
            const parse = new DOMParser();
            const data = parse.parseFromString(response.data.contents, 'text/xml');
            const parseData = parser(data);
            watchedState.data.title.unshift(parseData.title);
            state.data.items.unshift(parseData.items);
            watchedState.data.description.unshift(parseData.description);
            watchedState.form.status = i18n.t('errors.validUrl');
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

        selectors.input.focus();
        selectors.form.reset();
      })
      .catch((errorValidation) => {
        watchedState.form.status = null;
        watchedState.form.validUrl = true;
        watchedState.form.errors = errorValidation.message;
      });
  });

  selectors.btnClose.addEventListener('click', () => {
    selectors.modal.style.cssText = 'display: none';
    selectors.body.style.cssText = '';
  });

  selectors.btnSecondary.addEventListener('click', () => {
    selectors.modal.style.cssText = 'display: none';
    selectors.body.style.cssText = '';
  });
}
