const URL = "https://api.thecatapi.com/v1/images/search";

const image = $("api-image");
const spinner = $("spinner");
const button = $("discover");

let loading = true;

function $(id) {
  return document.getElementById(id);
}

function toggleLoading() {
  if (!loading) {
    spinner.style.display = "block";
    image.style.display = "none";
    button.disabled = true;
    loading = !loading;
    return;
  }
  spinner.style.display = "none";
  image.style.display = "block";
  loading = !loading;
  button.disabled = false;
  return;
}

async function getNewImage(url) {
  const response = await fetch(url);
  const data = await response.json();
  image.src = data[0].url;
  setTimeout(() => {
    toggleLoading();
  }, 1500);
}

button.addEventListener("click", () => {
  toggleLoading();
  getNewImage(URL);
});
getNewImage(URL);
