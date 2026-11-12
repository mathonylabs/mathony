const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#main-nav");
const desktop = window.matchMedia("(min-width: 58rem)");

function setMenuOpen(open) {
  menuButton.setAttribute("aria-expanded", String(open));
  navigation.hidden = !desktop.matches && !open;
}

function syncMenu() {
  const focusInNav = navigation.contains(document.activeElement);
  const focusOnToggle = document.activeElement === menuButton;

  menuButton.hidden = desktop.matches;
  setMenuOpen(false);

  if (desktop.matches && focusOnToggle) navigation.querySelector("a").focus();
  if (!desktop.matches && focusInNav) menuButton.focus();
}

header.classList.add("menu-ready");
syncMenu();
desktop.addEventListener("change", syncMenu);

menuButton.addEventListener("click", () => {
  setMenuOpen(navigation.hidden);
});

navigation.addEventListener("click", (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (
    !link ||
    desktop.matches ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }

  const target = document.getElementById(link.hash.slice(1));
  if (!target) return;

  target.tabIndex = -1;
  target.focus({ preventScroll: true });
  setMenuOpen(false);
});

document.addEventListener("keydown", (event) => {
  if (
    event.key !== "Escape" ||
    menuButton.getAttribute("aria-expanded") !== "true"
  ) {
    return;
  }

  setMenuOpen(false);
  menuButton.focus();
});

document.addEventListener("pointerdown", (event) => {
  if (
    header.contains(event.target) ||
    menuButton.getAttribute("aria-expanded") !== "true"
  ) {
    return;
  }

  if (navigation.contains(document.activeElement)) menuButton.focus();
  setMenuOpen(false);
});

header.addEventListener("focusout", (event) => {
  if (event.relatedTarget && !header.contains(event.relatedTarget))
    setMenuOpen(false);
});

const sectionLinks = new Map(
  Array.from(navigation.querySelectorAll('a[href^="#"]'), (link) => [
    link.hash.slice(1),
    link,
  ]),
);
const sections = Array.from(document.querySelectorAll("main section[id]"));
let currentLink;
let framePending = false;

function updateCurrentSection() {
  framePending = false;
  const readingLine =
    header.offsetHeight + Math.min(window.innerHeight * 0.22, 140);
  const section = sections.findLast(
    (item) => item.getBoundingClientRect().top <= readingLine,
  );
  const nextLink = sectionLinks.get(section?.id);

  if (nextLink === currentLink) return;

  currentLink?.removeAttribute("aria-current");
  nextLink?.setAttribute("aria-current", "location");
  currentLink = nextLink;
}

function scheduleSectionUpdate() {
  if (framePending) return;

  framePending = true;
  requestAnimationFrame(updateCurrentSection);
}

window.addEventListener("scroll", scheduleSectionUpdate, { passive: true });
window.addEventListener("resize", scheduleSectionUpdate);
window.addEventListener("pageshow", scheduleSectionUpdate);
updateCurrentSection();

const servicesTrack = document.querySelector(".services-track");
const servicesPrevious = document.querySelector("[data-services-previous]");
const servicesNext = document.querySelector("[data-services-next]");

if (servicesTrack && servicesPrevious && servicesNext) {
  document.body.classList.add("services-carousel-ready");

  function getServicesScrollStep() {
    const firstService = servicesTrack.querySelector(".service");
    const trackStyles = getComputedStyle(servicesTrack);
    const gap = Number.parseFloat(trackStyles.columnGap || trackStyles.gap) || 0;

    return (firstService?.getBoundingClientRect().width || 0) + gap;
  }

  function updateServicesControls() {
    const maximumScroll = servicesTrack.scrollWidth - servicesTrack.clientWidth;
    const scrollTolerance = 2;

    servicesPrevious.disabled = servicesTrack.scrollLeft <= scrollTolerance;
    servicesNext.disabled =
      servicesTrack.scrollLeft >= maximumScroll - scrollTolerance;
  }

  function scrollServices(direction) {
    servicesTrack.scrollBy({
      left: getServicesScrollStep() * direction,
      behavior: reducedMotion.matches ? "auto" : "smooth",
    });
  }

  servicesPrevious.addEventListener("click", () => scrollServices(-1));
  servicesNext.addEventListener("click", () => scrollServices(1));
  servicesTrack.addEventListener("scroll", updateServicesControls, {
    passive: true,
  });
  window.addEventListener("resize", updateServicesControls);
  window.addEventListener("pageshow", updateServicesControls);
  updateServicesControls();
}

const revealItems = document.querySelectorAll(
  [
    ".hero-copy",
    ".page-heading .container",
    ".section-heading",
    ".service",
    ".process-intro",
    ".process-list > li",
    ".projects-list > .case",
    ".case-summary",
    ".leader-grid > li",
    ".contact-layout > *",
  ].join(", "),
);

revealItems.forEach((item) => item.classList.add("reveal-item"));

document
  .querySelectorAll(
    ".services-track, .process-list, .leader-grid, .contact-layout",
  )
  .forEach((group) => {
    Array.from(group.children).forEach((item, index) => {
      item.style.setProperty("--reveal-delay", `${Math.min(index, 3) * 70}ms`);
    });
  });

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (reducedMotion.matches || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  document.body.classList.add("reveal-ready");

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.08,
      rootMargin: "0px 0px -10% 0px",
    },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}
