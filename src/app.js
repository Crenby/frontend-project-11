import * as yup from 'yup';
import onChange from 'on-change';
import view from './view';
import i18next from 'i18next';
import resources from './locales/index.js';
import axios from 'axios';
import parser from './parser.js';

export default function app() {

  const state = {
    form: {
      status: null,
      validUrl: false,
      errors: null,
    },
    fids: [],
    data: [],
  };

  const defaultLang = 'ru';

  const i18n = i18next.createInstance();
  i18n.init({
    debug: false,
    lng: defaultLang,
    resources,
  })

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
  }

  yup.setLocale({
    mixed: {
      required: i18n.t('errors.required'),
      notOneOf: i18n.t('errors.exists'),
    },
    string: {
      url: i18n.t('errors.invalidUrl'),
    },
  })

  function validate(fields, fids) {
    const schema = yup.object({
      url: yup.string().required().url().notOneOf(fids),
    });
    return schema.validate(fields);
  };

  const watchedState = onChange(state, (path, value) => {
    view(state, path, value);
  });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const out = formData.get('url');

    validate({ url: out }, state.fids)
      .then(() => {
        console.log("good");
        watchedState.fids.push(out);
        watchedState.form.validUrl = false;
        watchedState.form.errors = null;

        axios.get(`https://allorigins.hexlet.app/get?url=${out}`)
          .then((response) => {
            watchedState.data.unshift(parser(response)); 
            watchedState.form.status = i18n.t('errors.validUrl');   
          })
          .catch((e) => {
            if(e.isParsingError) {
              watchedState.form.errors = i18n.t('errors.invalidRss');
            } else if(e.message === 'Network Error') {
              watchedState.form.errors = i18n.t('errors.network');
            } else {
              watchedState.form.errors = i18n.t('errors.unknown');
            }
          })

        elements.input.focus();
        elements.form.reset();
      })
      .catch((e) => {
        console.log("nogood");
        watchedState.form.status = null;
        watchedState.form.validUrl = true;
        watchedState.form.errors = e.message;
      })
  });
}