// Intersection Observer for animations
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (entry.target.classList.contains("stagger")) {
          const children = entry.target.children;
          Array.from(children).forEach((child, i) => {
            setTimeout(() => child.classList.add("visible"), i * 120);
          });
        } else {
          entry.target.classList.add("visible");
        }
      }
    });
  },
  { threshold: 0.1 },
);

document
  .querySelectorAll(".fade-up, .stagger")
  .forEach((el) => observer.observe(el));

// Hero stats counter animation
function animateCounter(el, target, duration = 1500) {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) {
      start = target;
      clearInterval(timer);
    }
    el.textContent = Math.floor(start);
  }, 16);
}

const statsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        document.querySelectorAll(".stat-num span").forEach((el) => {
          animateCounter(el, parseInt(el.textContent));
        });
        statsObserver.disconnect();
      }
    });
  },
  { threshold: 0.5 },
);

const heroStats = document.querySelector(".hero-stats");
if (heroStats) statsObserver.observe(heroStats);

// Nav active state
window.addEventListener("scroll", () => {
  const nav = document.querySelector("nav");
  if (window.scrollY > 50) {
    nav.style.borderBottomColor = "rgba(255,255,255,0.1)";
  } else {
    nav.style.borderBottomColor = "rgba(255,255,255,0.07)";
  }
});

// Smooth active link highlight
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll("nav ul a:not(.nav-cta)");

window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach((s) => {
    if (window.scrollY >= s.offsetTop - 200) current = s.getAttribute("id");
  });
  navLinks.forEach((a) => {
    a.style.color =
      a.getAttribute("href") === "#" + current ? "var(--text)" : "";
  });
});
