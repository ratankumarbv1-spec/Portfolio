// ==========================================
// Theme Toggle Functionality
// ==========================================
const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;

// Check for saved theme preference or default to 'dark'
const currentTheme = localStorage.getItem('theme') || 'dark';
htmlElement.setAttribute('data-theme', currentTheme);

// Theme toggle event listener
themeToggle.addEventListener('click', () => {
  const theme = htmlElement.getAttribute('data-theme');
  const newTheme = theme === 'dark' ? 'light' : 'dark';
  
  htmlElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
});

// ==========================================
// Mobile Menu Toggle
// ==========================================
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');

menuBtn.addEventListener('click', () => {
  const isOpen = menuBtn.getAttribute('aria-expanded') === 'true';
  menuBtn.setAttribute('aria-expanded', !isOpen);
  navLinks.classList.toggle('open');
});

// Close menu when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    menuBtn.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('open');
  });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  const isMenuBtn = e.target.closest('.menu-btn');
  const isNavLinks = e.target.closest('.nav-links');
  
  if (!isMenuBtn && !isNavLinks && navLinks.classList.contains('open')) {
    menuBtn.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('open');
  }
});

// Close menu on escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navLinks.classList.contains('open')) {
    menuBtn.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('open');
  }
});

// ==========================================
// Reveal Animation on Scroll
// ==========================================
const revealElements = document.querySelectorAll('.reveal');

const revealOptions = {
  threshold: 0.15,
  rootMargin: '0px 0px -100px 0px'
};

const revealOnScroll = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealOnScroll.unobserve(entry.target);
    }
  });
}, revealOptions);

revealElements.forEach(element => revealOnScroll.observe(element));

// ==========================================
// Smooth Scroll for Navigation Links
// ==========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#' && document.querySelector(href)) {
      e.preventDefault();
      const target = document.querySelector(href);
      const headerHeight = document.querySelector('.site-header').offsetHeight;
      const targetPosition = target.offsetTop - headerHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// ==========================================
// Form Submission Handler
// ==========================================
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(contactForm);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message')
    };
    
    // Here you would typically send the data to a server
    console.log('Form submitted:', data);
    
    // Show success message (you can customize this)
    alert(`Thank you, ${data.name}! Your message has been received. I'll get back to you soon.`);
    
    // Reset form
    contactForm.reset();
  });
}

// ==========================================
// Responsive Navigation Bar on Scroll
// ==========================================
let lastScrollTop = 0;
const header = document.querySelector('.site-header');

window.addEventListener('scroll', () => {
  let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  // Add background opacity as user scrolls
  if (scrollTop > 50) {
    header.style.backdropFilter = 'blur(12px)';
  } else {
    header.style.backdropFilter = 'blur(10px)';
  }
  
  lastScrollTop = scrollTop;
});

// ==========================================
// Interest Tags Interaction (Optional)
// ==========================================
const interestTags = document.querySelectorAll('.interest-tags span');

interestTags.forEach(tag => {
  tag.addEventListener('click', () => {
    tag.style.transform = 'scale(0.95)';
    setTimeout(() => {
      tag.style.transform = '';
    }, 200);
  });
});

// ==========================================
// Prevent Mobile Zoom on Input Focus
// ==========================================
const inputs = document.querySelectorAll('input, textarea');

inputs.forEach(input => {
  input.addEventListener('focus', () => {
    // This helps prevent the mobile browser from zooming in
    if (window.innerWidth < 768) {
      input.style.fontSize = '16px';
    }
  });
});

// ==========================================
// Keyboard Navigation Support
// ==========================================
document.addEventListener('keydown', (e) => {
  // Tab through form inputs
  if (e.key === 'Tab') {
    const focusableElements = document.querySelectorAll(
      'a, button, input, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }
});

// ==========================================
// Performance: Lazy load images
// ==========================================
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        observer.unobserve(img);
      }
    });
  });
  
  document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
}

// ==========================================
// Utility: Check if touch device
// ==========================================
const isTouchDevice = () => {
  return (
    (typeof window !== 'undefined' &&
      ('ontouchstart' in window ||
        (navigator.maxTouchPoints && navigator.maxTouchPoints > 0)))
  );
};

// Add touch class if touch device
if (isTouchDevice()) {
  document.documentElement.classList.add('touch-device');
}

// ==========================================
// Viewport Height Fix for Mobile
// ==========================================
const setVH = () => {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

setVH();
window.addEventListener('resize', setVH);
window.addEventListener('orientationchange', setVH);

// ==========================================
// Page Load Animation
// ==========================================
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});

console.log('Portfolio script loaded successfully!');