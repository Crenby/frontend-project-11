import * as yup from 'yup';
import onChange from 'on-change';
import view from './view';

export default function app() {

  const state = {
    form: {
      validUrl: false,
      emptyUrl: false,
    },
    fids: [],
  }

  function validate(fields, fids) {
    const schema = yup.object({
      url: yup.string().url().notOneOf(fids),
    });
    return schema.validate(fields);
  };

  const form = document.querySelector('.rss-form');
  const input = document.querySelector("#url-input");

  const watchedState = onChange(state, (path, value) => {
    view(path, value);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const out = formData.get('url');

    validate({url: out}, state.fids)
      .then(() => {
        console.log("good");
        watchedState.fids.push(out);
        watchedState.form.validUrl = false;
        input.focus();
        form.reset();

      })
      .catch(() => {
        console.log("nogood");
        watchedState.form.validUrl = true;
      })

  });
}