import * as yup from 'yup';
import onChange from 'on-change';


export default function app() {
  const formSchema = yup.object({
    url: yup.string().url(),
  });

  const form = document.querySelector('.rss-form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const out = formData.get('url');

    formSchema.validate({out})
      .then(() => {
        console.log("good");
      })
      .catch(() => {
        console.log("nogood");
      })

  });
}