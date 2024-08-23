import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import { view, upDataRender } from './view';

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
    data: [],
    upData: [],
  };

  const defaultLang = 'ru';

  const i18n = i18next.createInstance();
  i18n.init({
    debug: false,
    lng: defaultLang,
    resources,
  });

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
  };

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

  function upData(state) {
    state.fids.forEach((fid) => {
      axios.get(getFullUrl(fid))
        .then((response) => {
          const newData = parser(response);
          const filtData = [[state.upData.map((item) => item.title)]].flat(Infinity);

          state.data.forEach((oldItem) => {
            oldItem.items.forEach((item) => {
              filtData.push(item.title);
            });
          });

          newData.items.forEach((item) => {
            if (!filtData.includes(item.title)) {
              state.upData.push(item);
              upDataRender(item, state);
            }
          });

          setTimeout(upData, 5000, state);
        })
        .catch(() => {
          
        });
    });
  }

  elements.form.addEventListener('submit', (e) => {
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
            watchedState.data.unshift(parser(response));
            watchedState.form.status = i18n.t('errors.validUrl');
            upData(state);
          })
          .catch((e) => {
            if (e.isParsingError) {
              watchedState.form.errors = i18n.t('errors.invalidRss');
            } else if (e.message === 'Network Error') {
              watchedState.form.errors = i18n.t('errors.network');
            } else {
              watchedState.form.errors = i18n.t('errors.unknown');
            }
          });

        elements.input.focus();
        elements.form.reset();
      })
      .catch((e) => {
        watchedState.form.status = null;
        watchedState.form.validUrl = true;
        watchedState.form.errors = e.message;
      });
  });
}
