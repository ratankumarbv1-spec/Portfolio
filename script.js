// script.js - Premium Futuristic Portfolio
const htmlElement = document.documentElement;
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");
const header = document.querySelector(".site-header");
const form = document.getElementById("contactForm");
const toast = document.getElementById("toast");
const submitBtn = document.getElementById("submitBtn");
const backToTop = document.getElementById("backToTop");

// ===== MOBILE NAVIGATION =====
menuBtn?.addEventListener("click", () => {
  const isOpen = menuBtn.getAttribute("aria-expanded") === "true";
  menuBtn.setAttribute("aria-expanded", String(!isOpen));
  navLinks.classList.toggle("open");
});

navLinks?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuBtn?.setAttribute("aria-expanded", "false");
    navLinks.classList.remove("open");
  });
});

document.addEventListener("click", (e) => {
  const inBtn = e.target.closest(".menu-btn");
  const inNav = e.target.closest(".nav-links");
  if (!inBtn && !inNav && navLinks?.classList.contains("open")) {
    menuBtn?.setAttribute("aria-expanded", "false");
    navLinks.classList.remove("open");
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && navLinks?.classList.contains("open")) {
    menuBtn?.setAttribute("aria-expanded", "false");
    navLinks.classList.remove("open");
  }
});

// ===== INTERSECTION OBSERVER FOR REVEAL ANIMATIONS =====
const revealElements = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        obs.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -100px 0px" }
);
revealElements.forEach((el) => revealObserver.observe(el));

// ===== SMOOTH SCROLL TO SECTIONS =====
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    const href = anchor.getAttribute("href");
    if (href && href !== "#" && document.querySelector(href)) {
      e.preventDefault();
      const target = document.querySelector(href);
      const headerHeight = header ? header.offsetHeight : 0;
      const top = target.offsetTop - headerHeight;
      window.scrollTo({ top, behavior: "smooth" });
    }
  });
});

// ===== HEADER BACKDROP & BACK TO TOP ON SCROLL =====
window.addEventListener("scroll", () => {
  const y = window.scrollY || document.documentElement.scrollTop;

  if (header) {
    header.style.backdropFilter = y > 50 ? "blur(18px)" : "blur(16px)";
  }

  if (backToTop) {
    backToTop.classList.toggle("show", y > 350);
  }
});

backToTop?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ===== INTEREST TAG CLICK ANIMATION =====
document.querySelectorAll(".interest-tags span").forEach((tag) => {
  tag.addEventListener("click", () => {
    tag.style.transform = "scale(0.94)";
    setTimeout(() => {
      tag.style.transform = "";
    }, 150);
  });

  tag.addEventListener("mouseenter", () => {
    tag.style.transition = "all 0.35s cubic-bezier(0.23, 1, 0.32, 1)";
  });
});

// ===== TOUCH DEVICE DETECTION =====
const isTouchDevice = () =>
  typeof window !== "undefined" &&
  ("ontouchstart" in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0));
if (isTouchDevice()) htmlElement.classList.add("touch-device");

// ===== VIEWPORT HEIGHT FIX =====
const setVH = () => {
  const vh = window.innerHeight * 0.01;
  htmlElement.style.setProperty("--vh", `${vh}px`);
};
setVH();
window.addEventListener("resize", setVH);
window.addEventListener("orientationchange", setVH);

// ===== CONTACT FORM SUBMISSION =====
form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  submitBtn?.classList.add("loading");
  if (submitBtn) submitBtn.textContent = "Sending...";

  const formData = new FormData(form);

  try {
    const response = await fetch(form.action, {
      method: form.method,
      body: formData,
      headers: { Accept: "application/json" }
    });

    if (response.ok) {
      form.reset();
      toast?.classList.add("show");
      if (submitBtn) submitBtn.textContent = "✓ Sent";

      setTimeout(() => {
        toast?.classList.remove("show");
        submitBtn?.classList.remove("loading");
        if (submitBtn) submitBtn.textContent = "Send Message";
      }, 2600);
    } else {
      if (submitBtn) submitBtn.textContent = "Try Again";
      submitBtn?.classList.remove("loading");
    }
  } catch {
    if (submitBtn) submitBtn.textContent = "Error";
    submitBtn?.classList.remove("loading");
  }
});

// ===== ENHANCED SKILL BARS ANIMATION =====
const skillBars = document.querySelectorAll(".bar span");
const skillObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const level = entry.target.style.getPropertyValue("--level");
        entry.target.style.width = "0%";
        setTimeout(() => {
          entry.target.style.transition = "width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)";
          entry.target.style.width = level;
        }, 100);
        skillObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);
skillBars.forEach((bar) => skillObserver.observe(bar));

// ===== BUTTON RIPPLE EFFECT =====
document.querySelectorAll(".btn").forEach((btn) => {
  btn.addEventListener("mousedown", function (e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement("div");
    ripple.style.position = "absolute";
    ripple.style.left = x + "px";
    ripple.style.top = y + "px";
    ripple.style.width = "10px";
    ripple.style.height = "10px";
    ripple.style.background = "rgba(226, 232, 240, 0.3)";
    ripple.style.borderRadius = "50%";
    ripple.style.pointerEvents = "none";
    ripple.style.transform = "scale(1)";
    ripple.style.animation = "rippleEffect 0.6s ease-out";

    this.style.position = "relative";
    this.style.overflow = "hidden";
    this.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  });
});

if (!document.querySelector("style[data-ripple]")) {
  const style = document.createElement("style");
  style.setAttribute("data-ripple", "true");
  style.textContent = `
    @keyframes rippleEffect {
      to {
        transform: scale(20);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

// ===== PROFILE IMAGE PARALLAX EFFECT =====
const profileGlow = document.querySelector(".profile-glow");
if (profileGlow) {
  document.addEventListener("mousemove", (e) => {
    const rect = profileGlow.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const distX = (e.clientX - centerX) * 0.05;
    const distY = (e.clientY - centerY) * 0.05;
    
    profileGlow.style.setProperty("--parallax-x", distX + "px");
    profileGlow.style.setProperty("--parallax-y", distY + "px");
  });
}

// ===== KEYBOARD ACCESSIBILITY ENHANCEMENTS =====
document.querySelectorAll(".socials a, .btn, .interest-tags span").forEach((el) => {
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      el.click();
    }
  });
});

// ===== LAZY LOADING IMAGES =====
if ("IntersectionObserver" in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        img.classList.remove("lazy");
        observer.unobserve(img);
      }
    });
  });

  document.querySelectorAll("img[loading='lazy']").forEach((img) => {
    imageObserver.observe(img);
  });
}

console.log("🚀 Premium Portfolio initialized successfully");
