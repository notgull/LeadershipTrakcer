// BSD LICENSE - c John Nunley and Larson Rivera

export type PostParams = { [key: string]: string };

// create a form element to send a post request with
export function createPostForm(url: string, params: PostParams) {
  let form = document.createElement("form");
  form.method = "post";
  form.action = url;

  // loop through params
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      let hiddenField = document.createElement("input");
      hiddenField.type = "hidden";
      hiddenField.name = key;
      hiddenField.value = params[key];
      
      form.appendChild(hiddenField);
    }
  }

  form.classList.add("vanished");
  document.body.appendChild(form);
  return form;
};

// taken from https://stackoverflow.com/a/133997/11187995
export function sendPostData(url: string, params: PostParams) {
  const form = createPostForm(url, params);
  form.submit();
}
