import './styles.css';

const imageContainer = document.getElementById('image-container');
const loader = document.getElementById('loader');
const scrollToTopBtn = document.getElementById('scroll-to-top');

let imagesLoaded = 0;
let photosArray = [];
let ready = false;
let totalImages = 0;

// Unsplash proxy server API
const count = 30;
const apiUrl = `/api/get-photos?&count=${count}`;

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
function displayPhotos() {
  imagesLoaded = 0;
  totalImages = photosArray.length;

  photosArray.forEach((photo) => {
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

  // Observe the last image
  observeLastImage();
}

// Get photos from Unsplash Proxy API
async function getPhotos() {
  try {
    const response = await fetch(apiUrl);
    photosArray = await response.json();

    if (!Array.isArray(photosArray) || photosArray.length === 0)
      throw new Error('API returned no photos');

    displayPhotos();
  } catch (error) {
    console.error('Failed to load photos from API:', error);
  }
}

async function getLocalPhotos() {
  try {
    const response = await fetch('photos.json');
    photosArray = await response.json();
    displayPhotos();
  } catch (error) {
    console.error('Failed to load local photos.json:', error);
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
      rootMargin: '1000px', // pre-load when 1000px near
    }
  );

  if (lastImage) observer.observe(lastImage);
}

// Scroll to top button
window.addEventListener('scroll', () => {
  if (window.scrollY > 300) scrollToTopBtn.style.display = 'flex';
  else scrollToTopBtn.style.display = 'none';
});

// Scroll to top functionality
scrollToTopBtn.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
});

// Initial load
getLocalPhotos();
getPhotos();
