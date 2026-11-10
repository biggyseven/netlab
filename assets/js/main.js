(() => {
  "use strict";

  const root = document.documentElement;
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const themeLabel = document.querySelector("[data-theme-label]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-nav]");
  const navLinks = [...document.querySelectorAll("[data-nav] a")];

  const applyTheme = (theme, persist = false) => {
    root.dataset.theme = theme;
    if (themeLabel) themeLabel.textContent = theme === "dark" ? "Mode sombre" : "Mode clair";
    if (themeToggle) {
      themeToggle.setAttribute("aria-label", theme === "dark" ? "Activer le thème clair" : "Activer le thème sombre");
      themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
    }
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute("content", theme === "dark" ? "#08111f" : "#f4f8fc");
    if (persist) {
      try { localStorage.setItem("netlab-theme", theme); } catch (_) { /* stockage indisponible */ }
    }
  };

  applyTheme(root.dataset.theme || "dark");

  themeToggle?.addEventListener("click", () => {
    applyTheme(root.dataset.theme === "dark" ? "light" : "dark", true);
  });

  const closeMenu = () => {
    nav?.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Ouvrir le menu");
  };

  menuToggle?.addEventListener("click", () => {
    const willOpen = menuToggle.getAttribute("aria-expanded") !== "true";
    menuToggle.setAttribute("aria-expanded", String(willOpen));
    menuToggle.setAttribute("aria-label", willOpen ? "Fermer le menu" : "Ouvrir le menu");
    nav?.classList.toggle("is-open", willOpen);
  });

  navLinks.forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMenu();
  });
  document.addEventListener("click", event => {
    if (nav?.classList.contains("is-open") && !nav.contains(event.target) && !menuToggle?.contains(event.target)) {
      closeMenu();
    }
  });

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll("[data-reveal]").forEach(el => revealObserver.observe(el));

    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const current = "#" + entry.target.id;
        navLinks.forEach(link => {
          const active = link.getAttribute("href") === current;
          link.classList.toggle("is-active", active);
          if (active) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-35% 0px -55% 0px", threshold: 0 });
    ["profil", "competences", "laboratoire", "methode"].forEach(id => {
      const section = document.getElementById(id);
      if (section) sectionObserver.observe(section);
    });
  } else {
    document.querySelectorAll("[data-reveal]").forEach(el => el.classList.add("is-visible"));
  }

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();