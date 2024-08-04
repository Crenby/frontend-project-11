const input = document.querySelector("#url-input");

export default function view(path, value) {
  switch(path) {
    case 'form.validUrl':
      if(value) {
        input.classList.add('is-invalid');
      } else {
        input.classList.remove('is-invalid');
      }
      break;
  }
}