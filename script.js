// Popup logic
const cake = document.getElementById('cakeBtn');
const popup = document.getElementById('popupCard');
const closeBtn = document.querySelector('.close-btn');

console.log('Elements found:', { cake, popup, closeBtn });

// Show popup when cake is clicked
cake.addEventListener('click', () => {
  console.log('Cake clicked, showing popup');
  popup.classList.remove('hidden');
});

// Close popup when close button is clicked
closeBtn.addEventListener('click', (e) => {
  console.log('Close button clicked');
  e.preventDefault();
  e.stopPropagation(); // Prevent the click from bubbling up to the popup
  popup.classList.add('hidden');
});

// Close popup when clicking outside the popup content
popup.addEventListener('click', (e) => {
  console.log('Popup clicked, target:', e.target);
  if (e.target === popup) {
    console.log('Clicked outside content, closing popup');
    popup.classList.add('hidden');
  }
});

// Prevent popup content clicks from closing the popup
document.querySelector('.popup-content').addEventListener('click', (e) => {
  e.stopPropagation(); // Prevent clicks inside the popup content from bubbling up
});

// Close popup with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !popup.classList.contains('hidden')) {
    console.log('Escape pressed, closing popup');
    popup.classList.add('hidden');
  }
});

// Music toggle
const musicBtn = document.getElementById('musicBtn');
const bgMusic = document.getElementById('bgMusic');
let isPlaying = false;
let musicStarted = false;
let loadingComplete = false;

// Function to update music button icon
function updateMusicButtonIcon(playing) {
  const icon = musicBtn.querySelector('i');
  if (playing) {
    icon.className = 'fas fa-pause';
  } else {
    icon.className = 'fas fa-play';
  }
}

// Function to start music automatically
function startMusic() {
  // Try unmuting and playing
  bgMusic.muted = false;
  
  bgMusic.play().then(() => {
    console.log('Music started automatically');
    isPlaying = true;
    musicStarted = true;
    updateMusicButtonIcon(true);
  }).catch((error) => {
    console.log('Music auto-play failed (browser policy):', error);
    // If auto-play fails, keep the button ready for manual play
    isPlaying = false;
    updateMusicButtonIcon(false);
  });
}

// Function to start music on user interaction (fallback)
function startMusicOnInteraction() {
  if (loadingComplete && !musicStarted) {
    console.log('Starting music on user interaction');
    startMusic();
    // Remove event listeners after music starts
    document.removeEventListener('click', startMusicOnInteraction);
    document.removeEventListener('keydown', startMusicOnInteraction);
    document.removeEventListener('scroll', startMusicOnInteraction);
    document.removeEventListener('touchstart', startMusicOnInteraction);
  }
}

// Manual music toggle
musicBtn.addEventListener('click', (e) => {
  e.stopPropagation(); // Prevent triggering the interaction handler
  
  if (isPlaying) {
    bgMusic.pause();
    updateMusicButtonIcon(false);
    isPlaying = false;
    console.log('Music paused manually');
  } else {
    bgMusic.muted = false; // Ensure it's unmuted
    bgMusic.play().then(() => {
      updateMusicButtonIcon(true);
      isPlaying = true;
      musicStarted = true;
      console.log('Music resumed manually');
    }).catch((error) => {
      console.log('Manual play failed:', error);
    });
  }
});

// Scroll to top functionality
const scrollTopBtn = document.getElementById('scrollTopBtn');

// Show/hide scroll to top button based on scroll position
window.addEventListener('scroll', () => {
  if (window.pageYOffset > 300) {
    scrollTopBtn.classList.add('visible');
  } else {
    scrollTopBtn.classList.remove('visible');
  }
});

// Smooth scroll to top when button is clicked
scrollTopBtn.addEventListener('click', (e) => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// Loading Screen
const loadingScreen = document.getElementById('loadingScreen');

// Slideshow images that need to be preloaded
const slideshowImages = [
  'assets/images/year1.jpg',
  'assets/images/year5.jpg',
  'assets/images/year10.jpg',
  'assets/images/year15.jpg'
];

// Function to preload an image and return a promise
function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      console.log(`Image loaded: ${src}`);
      resolve(src);
    };
    img.onerror = () => {
      console.warn(`Failed to load image: ${src}`);
      reject(src);
    };
    img.src = src;
  });
}

// Function to hide loading screen
function hideLoadingScreen() {
  loadingScreen.classList.add('hidden');
  
  // Mark loading as complete
  loadingComplete = true;
  
  // Try to start music immediately
  setTimeout(() => {
    startMusic();
    
    // If music didn't start, set up interaction listeners as fallback
    setTimeout(() => {
      if (!musicStarted) {
        console.log('Setting up interaction listeners for music auto-play');
        document.addEventListener('click', startMusicOnInteraction);
        document.addEventListener('keydown', startMusicOnInteraction);
        document.addEventListener('scroll', startMusicOnInteraction);
        document.addEventListener('touchstart', startMusicOnInteraction);
      }
    }, 500);
  }, 200);
  
  // Remove the loading screen from DOM after transition
  setTimeout(() => {
    if (loadingScreen && loadingScreen.parentNode) {
      loadingScreen.remove();
    }
  }, 500);
}

// Preload all slideshow images
async function loadAllImages() {
  try {
    console.log('Starting to preload slideshow images...');
    
    // Create promises for all images (including ones that might fail)
    const imagePromises = slideshowImages.map(src => 
      preloadImage(src).catch(error => {
        console.warn(`Image failed to load: ${error}`);
        return null; // Return null for failed images but don't break the chain
      })
    );
    
    // Wait for all images to either load or fail
    const results = await Promise.all(imagePromises);
    
    const loadedCount = results.filter(result => result !== null).length;
    console.log(`Loaded ${loadedCount} out of ${slideshowImages.length} slideshow images`);
    
    return results;
  } catch (error) {
    console.error('Error during image preloading:', error);
    return [];
  }
}

// Main loading logic
window.addEventListener('load', async () => {
  console.log('Page loaded, starting image preload...');
  
  // Start preloading images immediately after page load
  const startTime = Date.now();
  
  try {
    await loadAllImages();
    
    // Ensure loading screen shows for at least 1.5 seconds for UX
    const elapsedTime = Date.now() - startTime;
    const minDisplayTime = 1500;
    const remainingTime = Math.max(0, minDisplayTime - elapsedTime);
    
    setTimeout(() => {
      console.log('All images loaded, hiding loading screen');
      hideLoadingScreen();
    }, remainingTime);
    
  } catch (error) {
    console.error('Error during loading process:', error);
    // Hide loading screen even if there's an error
    setTimeout(() => {
      hideLoadingScreen();
    }, 1500);
  }
});

// Fallback: Hide loading screen if it takes too long (safety net)
setTimeout(() => {
  if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
    console.warn('Loading timeout reached, hiding loading screen');
    hideLoadingScreen();
  }
}, 10000); // Max 10 seconds loading time

// Mobile-Optimized Photo Carousel Logic
class MobileCarousel {
  constructor() {
    this.currentSlide = 0;
    this.slides = document.querySelectorAll('.carousel-slide');
    this.dots = document.querySelectorAll('.dot');
    this.prevBtn = document.getElementById('prevBtn');
    this.nextBtn = document.getElementById('nextBtn');
    this.carouselContainer = document.querySelector('.carousel-container');
    this.track = document.getElementById('carouselTrack');
    this.totalSlides = this.slides.length;
    this.autoPlayInterval = null;
    this.isAutoPlaying = true;
    
    // Touch/swipe variables
    this.startX = 0;
    this.startY = 0;
    this.distX = 0;
    this.distY = 0;
    this.threshold = 50; // minimum distance for swipe
    this.allowSwipe = true;
    
    this.init();
  }
  
  init() {
    console.log('Initializing carousel...');
    console.log('Prev button:', this.prevBtn);
    console.log('Next button:', this.nextBtn);
    console.log('Total slides:', this.totalSlides);
    
    // Check if buttons exist before adding listeners
    if (this.prevBtn && this.nextBtn) {
      // Button navigation
      this.prevBtn.addEventListener('click', (e) => {
        console.log('Previous button clicked');
        e.preventDefault();
        this.prevSlide();
      });
      this.nextBtn.addEventListener('click', (e) => {
        console.log('Next button clicked');
        e.preventDefault();
        this.nextSlide();
      });
      console.log('Button event listeners added');
    } else {
      console.error('Carousel buttons not found!');
    }
    
    // Dot navigation (only if dots exist)
    if (this.dots.length > 0) {
      this.dots.forEach((dot, index) => {
        dot.addEventListener('click', () => this.goToSlide(index));
      });
    }
    
    // Touch/swipe events for mobile
    this.setupTouchEvents();
    
    // Auto-play functionality
    this.startAutoPlay();
    
    // Pause auto-play on interaction
    if (this.carouselContainer) {
      this.carouselContainer.addEventListener('mouseenter', () => this.pauseAutoPlay());
      this.carouselContainer.addEventListener('mouseleave', () => this.resumeAutoPlay());
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.prevSlide();
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.nextSlide();
      }
    });
    
    // Intersection Observer for auto-play when visible
    this.setupIntersectionObserver();
  }
  
  setupTouchEvents() {
    // Touch start
    this.carouselContainer.addEventListener('touchstart', (e) => {
      if (!this.allowSwipe) return;
      
      this.startX = e.touches[0].clientX;
      this.startY = e.touches[0].clientY;
      this.pauseAutoPlay();
    }, { passive: true });
    
    // Touch move
    this.carouselContainer.addEventListener('touchmove', (e) => {
      if (!this.allowSwipe) return;
      
      // Prevent default only if horizontal swipe
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = Math.abs(currentX - this.startX);
      const diffY = Math.abs(currentY - this.startY);
      
      if (diffX > diffY) {
        e.preventDefault(); // Prevent vertical scroll
      }
    }, { passive: false });
    
    // Touch end
    this.carouselContainer.addEventListener('touchend', (e) => {
      if (!this.allowSwipe) return;
      
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      
      this.distX = endX - this.startX;
      this.distY = endY - this.startY;
      
      // Check if it's a horizontal swipe
      if (Math.abs(this.distX) > Math.abs(this.distY) && Math.abs(this.distX) > this.threshold) {
        if (this.distX > 0) {
          this.prevSlide(); // Swipe right -> previous slide
        } else {
          this.nextSlide(); // Swipe left -> next slide
        }
      }
      
      // Resume auto-play after a delay
      setTimeout(() => this.resumeAutoPlay(), 3000);
    }, { passive: true });
  }
  
  setupIntersectionObserver() {
    // Only auto-play when carousel is visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.resumeAutoPlay();
        } else {
          this.pauseAutoPlay();
        }
      });
    }, { threshold: 0.5 });
    
    observer.observe(this.carouselContainer);
  }
  
  goToSlide(index) {
    // Remove active class from current slide and dot (if dots exist)
    this.slides[this.currentSlide].classList.remove('active');
    if (this.dots.length > 0) {
      this.dots[this.currentSlide].classList.remove('active');
    }
    
    // Update current slide
    this.currentSlide = index;
    
    // Add active class to new slide and dot (if dots exist)
    this.slides[this.currentSlide].classList.add('active');
    if (this.dots.length > 0) {
      this.dots[this.currentSlide].classList.add('active');
    }
    
    // Transform the carousel track
    this.track.style.transform = `translateX(-${this.currentSlide * 100}%)`;
    
    // Haptic feedback on mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }
  
  nextSlide() {
    const nextIndex = (this.currentSlide + 1) % this.totalSlides;
    this.goToSlide(nextIndex);
  }
  
  prevSlide() {
    const prevIndex = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
    this.goToSlide(prevIndex);
  }
  
  startAutoPlay() {
    if (!this.isAutoPlaying) return;
    
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, 4000); // 4 seconds for mobile (slightly faster)
  }
  
  pauseAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }
  
  resumeAutoPlay() {
    if (this.isAutoPlaying && !this.autoPlayInterval) {
      this.startAutoPlay();
    }
  }
  
  // Method to disable auto-play permanently
  disableAutoPlay() {
    this.isAutoPlaying = false;
    this.pauseAutoPlay();
  }
  
  // Method to enable auto-play
  enableAutoPlay() {
    this.isAutoPlaying = true;
    this.startAutoPlay();
  }
}

// Image loading optimization for mobile
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the carousel first
  if (document.querySelector('.photo-carousel')) {
    console.log('Initializing carousel...');
    const carousel = new MobileCarousel();
    
    // Global reference for debugging
    window.carousel = carousel;
    
    console.log('Mobile-optimized carousel initialized');
  } else {
    console.error('Carousel container not found!');
  }
  
  const carouselImages = document.querySelectorAll('.carousel-image');
  
  // Optimize image loading
  carouselImages.forEach((img, index) => {
    // Add loading class initially
    img.classList.add('loading');
    
    // Lazy load images that aren't the first one
    if (index > 0) {
      img.setAttribute('loading', 'lazy');
    }
    
    // Handle image load events
    img.addEventListener('load', () => {
      img.classList.remove('loading');
      img.classList.add('loaded');
    });
    
    // Handle image error events
    img.addEventListener('error', () => {
      img.classList.remove('loading');
      img.style.background = 'linear-gradient(45deg, #333, #555)';
      img.alt = 'Image could not be loaded';
    });
  });
});

// Performance optimization: throttle resize events
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    // Recalculate carousel dimensions if needed
    if (window.carousel) {
      window.carousel.goToSlide(window.carousel.currentSlide);
    }
  }, 250);
});
