import './style.css';

const imageContainer = document.getElementById('image-container');
const loader = document.getElementById('loader');
const scrollToTopBtn = document.getElementById('scroll-to-top');

let imagesLoaded = 0;
let ready = false;
let totalImages = 0;

// Unsplash proxy server API
const count = 30;
const apiUrl = `/api/get-photos?count=${count}`;

// Track if we already displayed fallback
let hasDisplayedFallback = false;

// Check if all images were loaded
function imageLoaded() {
  imagesLoaded++;

  if (imagesLoaded === totalImages) {
    ready = true;
    loader.hidden = true;
  }
}

// Helper Function to Set Attributes on DOM Elements
function setAttributes(element, attributes) {
  for (const key in attributes) {
    element.setAttribute(key, attributes[key]);
  }
}

// Create Elements For Links & Photos, Add to DOM
function displayPhotos(photoList, append = false) {
  imagesLoaded = 0;
  totalImages = photoList.length;

  if (!append) imageContainer.innerHTML = ''; // Clear old content

  photoList.forEach((photo) => {
    const wrapper = document.createElement('div');
    wrapper.classList.add('image-wrapper');
    const item = document.createElement('a');

    setAttributes(item, {
      href: photo.links.html,
      target: '_blank',
    });

    const img = document.createElement('img');

    setAttributes(img, {
      src: photo.urls.regular,
      alt: photo.alt_description,
      title: photo.alt_description,
      loading: 'lazy',
    });

    img.addEventListener('load', imageLoaded);
    item.appendChild(img);
    wrapper.appendChild(item);
    imageContainer.appendChild(wrapper);
  });

  observeLastImage();
}

// Load fallback first
async function loadLocalPhotos() {
  try {
    const localResponse = await fetch('photos.json');
    const localPhotos = await localResponse.json();

    if (Array.isArray(localPhotos) && localPhotos.length > 0) {
      displayPhotos(localPhotos);
      hasDisplayedFallback = true;
    }
  } catch (error) {
    console.error('Failed to load local fallback photos:', error);
  }
}

// Then try to fetch live API data
async function getPhotos() {
  try {
    const response = await fetch(apiUrl);
    const fetchedPhotos = await response.json();

    if (!Array.isArray(fetchedPhotos) || fetchedPhotos.length === 0)
      throw new Error('API returned no photos');

    photosArray = fetchedPhotos;

    // If fallback was shown, replace with fresh; otherwise just show
    displayPhotos(fetchedPhotos, hasDisplayedFallback);
  } catch (error) {
    console.error('Error fetching from Unsplash API:', error);
  }
}

// Intersection Observer logic
function observeLastImage() {
  const images = document.querySelectorAll('.image-wrapper img');
  const lastImage = images[images.length - 1];

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && ready) {
        observer.unobserve(lastImage);
        getPhotos();
      }
    },
    {
      rootMargin: '1000px',
    }
  );

  if (lastImage) observer.observe(lastImage);
}

// Scroll to top button
window.addEventListener('scroll', () => {
  scrollToTopBtn.style.display = window.scrollY > 300 ? 'flex' : 'none';
});

scrollToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Initial Load: Show fallback immediately, load API next
loadLocalPhotos();
getPhotos();
