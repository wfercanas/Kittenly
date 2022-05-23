const API_KEY = process.env.API_KEY;

const API = "https://api.thecatapi.com/v1";
const RANDOM_ENDPOINT = "/images/search";
const FAVORITES_ENDPOINT = "/favourites";

// -------------------------------DOM Selectors
function $(id) {
  return document.getElementById(id);
}

const image = $("api-image");
const spinner = $("spinner");
const discoverButton = $("discover");
const favoritesSection = $("photos-favorites");
const favoritesButton = $("addToFavorites");
const error = $("error");

// ----------------------------------------------------------------Loading Handling
let loading = false;
function setLoading(status) {
  if (status) {
    spinner.style.display = "block";
    image.style.display = "none";
    favoritesButton.style.display = "none";
    favoritesButton.disabled = true;
    discoverButton.disabled = true;
    loading = !loading;
    return;
  }
  spinner.style.display = "none";
  image.style.display = "block";
  favoritesButton.style.display = "block";
  favoritesButton.disabled = false;
  discoverButton.disabled = false;
  loading = !loading;
  return;
}

// ----------------------------------------------------------------Error Handling
function clearError() {
  error.textContent = "";
}

// ----------------------------------------------------------------Random Images
async function getNewImage(url, endpoint) {
  setLoading(true);
  const response = await fetch(`${url}${endpoint}`, {
    method: "GET",
    headers: {
      "X-API-KEY": API_KEY,
    },
  });
  const data = await response.json();

  if (response.status === 200) {
    image.src = data[0].url;
    image.setAttribute("image_id", data[0].id);
    return;
  }

  setLoading(false);
  error.textContent = `Random Image Error: ${data.status} - ${data.message}`;
}

function newImageLoaded() {
  if (loading) {
    setLoading(false);
  }
  clearError();
}

// ----------------------------------------------------------------Create Favorite Image
function createFavoriteImage(url, id) {
  const figure = document.createElement("figure");
  const img = document.createElement("img");
  const cross = document.createElement("img");
  const button = document.createElement("button");

  img.src = url;
  img.classList.add("cat");
  cross.src = "./assets/cross.svg";
  button.classList.add("cross__button");

  button.appendChild(cross);
  figure.append(img, button);
  favoritesSection.appendChild(figure);

  button.onclick = async () => {
    await deleteFavoriteImage(API, FAVORITES_ENDPOINT, id);
    favoritesSection.removeChild(figure);
  };

  img.onload = () => {
    button.style.display = "block";
    figure.style.backgroundColor = "transparent";
    img.style.visibility = "visible";
  };
}

// ----------------------------------------------------------------Favorite Images
async function getFavoriteImages(url, endpoint) {
  const response = await fetch(`${url}${endpoint}`, {
    method: "GET",
    headers: {
      "X-API-KEY": API_KEY,
    },
  });
  const data = await response.json();

  if (response.status === 200) {
    data.forEach((favorite) => {
      createFavoriteImage(favorite.image.url, favorite.id);
    });
    return;
  }

  error.textContent = `Favorites Error: ${data.status} - ${data.message}`;
}

async function saveFavoriteImage(url, endpoint, id) {
  const response = await fetch(`${url}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": API_KEY,
    },
    body: JSON.stringify({
      image_id: id,
    }),
  });

  const data = await response.json();
  if (data.message !== "SUCCESS") {
    error.textContent = "Error adding to favorites: " + data.message;
    return;
  }

  return data.id;
}

async function deleteFavoriteImage(url, endpoint, id) {
  const response = await fetch(`${url}${endpoint}/${id}`, {
    method: "DELETE",
    headers: {
      "X-API-KEY": API_KEY,
    },
  });

  const data = await response.json();
  if (data.message !== "SUCCESS") {
    error.textContent = "Error adding to favorites: " + data.message;
    return;
  }
}

// -----------------------------------------------------------------EventListeners
discoverButton.addEventListener("click", () => {
  getNewImage(API, RANDOM_ENDPOINT);
});

favoritesButton.addEventListener("click", async () => {
  const id = await saveFavoriteImage(
    API,
    FAVORITES_ENDPOINT,
    image.getAttribute("image_id")
  );
  createFavoriteImage(image.src, id);
});

image.addEventListener("load", newImageLoaded);

// -----------------------------------------------------------------Initial Execution
getNewImage(API, RANDOM_ENDPOINT);
getFavoriteImages(API, FAVORITES_ENDPOINT);
