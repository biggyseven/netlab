(() => {
  "use strict";

  const root = document.documentElement;
  const themePicker = document.querySelector("[data-theme-picker]");
  const themeTrigger = document.querySelector("[data-theme-trigger]");
  const themeMenu = document.querySelector("[data-theme-menu]");
  const themeLabel = document.querySelector("[data-theme-label]");
  const themeOptions = [...document.querySelectorAll("[data-theme-option]")];
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-nav]");
  const navLinks = [...document.querySelectorAll("[data-nav] a")];

  const themeDefinitions = {
    noc: { label: "NOC Signal", color: "#0B1420" },
    blueprint: { label: "Blueprint Engineering", color: "#F2F6FC" },
    observability: { label: "Observability Graphite", color: "#171A24" },
    "classic-dark": { label: "Classique sombre", color: "#07101D" },
    "classic-light": { label: "Classique clair", color: "#F4F8FC" }
  };

  const closeThemeMenu = () => {
    if (!themeMenu || !themeTrigger) return;
    themeMenu.hidden = true;
    themeTrigger.setAttribute("aria-expanded", "false");
  };

  const applyTheme = (theme, persist = false) => {
    const selected = themeDefinitions[theme] ? theme : "noc";
    root.dataset.theme = selected;
    const definition = themeDefinitions[selected];

    if (themeLabel) themeLabel.textContent = definition.label;
    if (themeTrigger) {
      themeTrigger.setAttribute("aria-label", "Choisir un thème. Thème actuel : " + definition.label);
      themeTrigger.setAttribute("aria-expanded", "false");
    }
    themeOptions.forEach(option => {
      option.setAttribute("aria-pressed", String(option.dataset.themeOption === selected));
    });

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute("content", definition.color);

    if (persist) {
      try { localStorage.setItem("netlab-theme", selected); } catch (_) { /* stockage indisponible */ }
    }
  };

  applyTheme(root.dataset.theme || "noc");

  themeTrigger?.addEventListener("click", () => {
    const willOpen = themeTrigger.getAttribute("aria-expanded") !== "true";
    if (themeMenu) themeMenu.hidden = !willOpen;
    themeTrigger.setAttribute("aria-expanded", String(willOpen));
  });

  themeOptions.forEach(option => option.addEventListener("click", () => {
    applyTheme(option.dataset.themeOption, true);
    closeThemeMenu();
    themeTrigger?.focus();
  }));

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
    if (event.key === "Escape") {
      closeMenu();
      closeThemeMenu();
    }
  });
  document.addEventListener("click", event => {
    if (nav?.classList.contains("is-open") && !nav.contains(event.target) && !menuToggle?.contains(event.target)) {
      closeMenu();
    }
    if (themeMenu && !themeMenu.hidden && themePicker && !themePicker.contains(event.target)) {
      closeThemeMenu();
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
    ["profil", "competences", "projets", "laboratoire", "journal", "methode"].forEach(id => {
      const section = document.getElementById(id);
      if (section) sectionObserver.observe(section);
    });
  } else {
    document.querySelectorAll("[data-reveal]").forEach(el => el.classList.add("is-visible"));
  }

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();


  // Project filters
  const projectFilters = [...document.querySelectorAll("[data-project-filter]")];
  const projectCards = [...document.querySelectorAll("[data-project-card]")];
  const projectCount = document.querySelector("[data-project-count]");
  const filterProjects = filter => {
    let visible = 0;
    projectCards.forEach(card => {
      const categories = (card.dataset.category || "").split(/\s+/);
      const show = filter === "all" || categories.includes(filter);
      card.hidden = !show;
      if (show) visible += 1;
    });
    if (projectCount) projectCount.textContent = String(visible).padStart(2, "0");
  };
  projectFilters.forEach(button => button.addEventListener("click", () => {
    const filter = button.dataset.projectFilter || "all";
    projectFilters.forEach(item => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    filterProjects(filter);
  }));
  filterProjects("all");

  // Project detail dialog
  const projectDialog = document.querySelector("[data-project-dialog]");
  const dialogTitle = document.querySelector("[data-dialog-title]");
  const dialogStatus = document.querySelector("[data-dialog-status]");
  const dialogSummary = document.querySelector("[data-dialog-summary]");
  const dialogTools = document.querySelector("[data-dialog-tools]");
  const dialogObjectives = document.querySelector("[data-dialog-objectives]");
  document.querySelectorAll("[data-project-open]").forEach(button => button.addEventListener("click", () => {
    if (!projectDialog) return;
    if (dialogTitle) dialogTitle.textContent = button.dataset.title || "Fiche projet";
    if (dialogStatus) {
      dialogStatus.textContent = button.dataset.status || "État non précisé";
      const planned = button.closest(".project-card")?.querySelector(".project-status")?.classList.contains("status-planned");
      dialogStatus.className = "project-status " + (planned ? "status-planned" : "status-progress");
    }
    if (dialogSummary) dialogSummary.textContent = button.dataset.summary || "";
    if (dialogTools) {
      dialogTools.replaceChildren();
      (button.dataset.tools || "").split("|").filter(Boolean).forEach(value => {
        const tag = document.createElement("span"); tag.textContent = value; dialogTools.append(tag);
      });
    }
    if (dialogObjectives) {
      dialogObjectives.replaceChildren();
      (button.dataset.objectives || "").split("|").filter(Boolean).forEach(value => {
        const item = document.createElement("li"); item.textContent = value; dialogObjectives.append(item);
      });
    }
    projectDialog.showModal();
  }));
  document.querySelector("[data-dialog-close]")?.addEventListener("click", () => projectDialog?.close());
  projectDialog?.addEventListener("click", event => { if (event.target === projectDialog) projectDialog.close(); });

  // Interactive role descriptions for the conceptual topology
  const topologyInfo = {
    "node-router": ["Routeur", "Relie des réseaux IP différents et choisit la prochaine destination des paquets."],
    "node-switch": ["Commutateur (switch)", "Connecte les équipements d'un même réseau local. Les VLAN permettent de séparer les domaines logiques."],
    "node-firewall": ["Pare-feu pfSense", "Applique des règles de filtrage entre les zones réseau et peut assurer le NAT."],
    "node-server": ["Serveur", "Héberge les services internes. Le laboratoire prévu utilisera Ubuntu Server pour la supervision."],
    "node-client-a": ["Poste administration", "Poste du VLAN Administration. Son accès aux outils dépend des règles de sécurité."],
    "node-client-b": ["Poste utilisateur", "Poste du VLAN Utilisateurs. Son accès aux serveurs est limité aux services nécessaires."]
  };
  const topologyNodes = [...document.querySelectorAll(".network-node")];
  const topologyTitle = document.querySelector("[data-topology-title]");
  const topologyRole = document.querySelector("[data-topology-role]");
  const topologyIndex = document.querySelector(".inspector-index");
  const selectTopologyNode = (node, index) => {
    topologyNodes.forEach(item => {
      const selected = item === node;
      item.setAttribute("aria-pressed", String(selected));
      item.setAttribute("role", "button");
      item.setAttribute("tabindex", "0");
    });
    const key = [...node.classList].find(className => topologyInfo[className]);
    const info = topologyInfo[key] || ["Équipement réseau", ""];
    if (topologyTitle) topologyTitle.textContent = info[0];
    if (topologyRole) topologyRole.textContent = info[1];
    if (topologyIndex) topologyIndex.textContent = "NODE / " + String(index + 1).padStart(2, "0");
  };
  topologyNodes.forEach((node, index) => {
    node.addEventListener("click", () => selectTopologyNode(node, index));
    node.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectTopologyNode(node, index); }
    });
  });
  if (topologyNodes[0]) selectTopologyNode(topologyNodes[0], 0);

})();