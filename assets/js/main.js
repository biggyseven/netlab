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
    ["profil", "competences", "projets", "laboratoire", "journal", "methode", "ipv4", "pme", "zabbix"].forEach(id => {
      const section = document.getElementById(id);
      if (section) sectionObserver.observe(section);
    });
  } else {
    document.querySelectorAll("[data-reveal]").forEach(el => el.classList.add("is-visible"));
  }

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();


  // Project filters and text search
  const projectFilters = [...document.querySelectorAll("[data-project-filter]")];
  const projectCards = [...document.querySelectorAll("[data-project-card]")];
  const projectCount = document.querySelector("[data-project-count]");
  const projectTotal = document.querySelector("[data-project-total]");
  const projectSearch = document.querySelector("[data-project-search]");
  const projectEmpty = document.querySelector("[data-project-empty]");
  const projectReset = document.querySelector("[data-project-reset]");
  let activeProjectFilter = "all";

  const normalizeSearchText = value => (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr")
    .trim();

  const filterProjects = () => {
    const query = normalizeSearchText(projectSearch?.value || "");
    let visible = 0;

    projectCards.forEach(card => {
      const categories = (card.dataset.category || "").split(/\s+/);
      const matchesCategory = activeProjectFilter === "all" || categories.includes(activeProjectFilter);
      const searchableContent = normalizeSearchText(card.textContent + " " + (card.dataset.category || ""));
      const matchesQuery = !query || searchableContent.includes(query);
      const show = matchesCategory && matchesQuery;
      card.hidden = !show;
      if (show) visible += 1;
    });

    if (projectCount) projectCount.textContent = String(visible).padStart(2, "0");
    if (projectTotal) projectTotal.textContent = "/ " + String(projectCards.length).padStart(2, "0") + " PROJETS";
    if (projectEmpty) projectEmpty.hidden = visible !== 0;
  };

  projectFilters.forEach(button => button.addEventListener("click", () => {
    activeProjectFilter = button.dataset.projectFilter || "all";
    projectFilters.forEach(item => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    filterProjects();
  }));
  projectSearch?.addEventListener("input", filterProjects);
  projectReset?.addEventListener("click", () => {
    if (projectSearch) projectSearch.value = "";
    activeProjectFilter = "all";
    projectFilters.forEach(item => {
      const active = item.dataset.projectFilter === "all";
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    filterProjects();
    projectSearch?.focus();
  });
  filterProjects();

  // Project detail dossiers
  const projectDialog = document.querySelector("[data-project-dialog]");
  const dialogTitle = document.querySelector("[data-dialog-title]");
  const dialogIndex = document.querySelector("[data-dialog-index]");
  const dialogVisual = document.querySelector("[data-dialog-visual]");
  const dialogArtPanels = [...document.querySelectorAll("[data-dialog-art]")];
  const dialogStatus = document.querySelector("[data-dialog-status]");
  const dialogSummary = document.querySelector("[data-dialog-summary]");
  const dialogDomain = document.querySelector("[data-dialog-domain]");
  const dialogEnvironment = document.querySelector("[data-dialog-environment]");
  const dialogContext = document.querySelector("[data-dialog-context]");
  const dialogGoal = document.querySelector("[data-dialog-goal]");
  const dialogEvidence = document.querySelector("[data-dialog-evidence]");
  const dialogNext = document.querySelector("[data-dialog-next]");
  const dialogTools = document.querySelector("[data-dialog-tools]");
  const dialogObjectives = document.querySelector("[data-dialog-objectives]");
  const dialogDocLink = document.querySelector("[data-dialog-doc-link]");
  const proofCount = document.querySelector("[data-proof-count]");
  const proofGallery = document.querySelector("[data-proof-gallery]");
  const proofPendingWrap = document.querySelector("[data-proof-pending-wrap]");
  const proofPending = document.querySelector("[data-proof-pending]");
  const evidenceLightbox = document.querySelector("[data-evidence-lightbox]");
  const evidenceLightboxTitle = document.querySelector("[data-evidence-lightbox-title]");
  const evidenceLightboxImage = document.querySelector("[data-evidence-lightbox-image]");
  const evidenceLightboxCaption = document.querySelector("[data-evidence-lightbox-caption]");
  let lastEvidenceTrigger = null;
  const openEvidenceLightbox = (item, trigger) => {
    lastEvidenceTrigger = trigger || null;
    if (!evidenceLightbox || !evidenceLightboxImage || !item?.src) return;
    evidenceLightboxTitle.textContent = item.title || "Capture technique";
    evidenceLightboxImage.src = item.src;
    evidenceLightboxImage.alt = item.alt || item.title || "Preuve technique NETLAB";
    evidenceLightboxCaption.textContent = item.caption || "";
    if (!evidenceLightbox.open) evidenceLightbox.showModal();
    trigger?.setAttribute("aria-haspopup", "dialog");
  };
  let evidenceCatalog = {};
  try {
    const catalogNode = document.querySelector("#netlab-evidence-catalog");
    evidenceCatalog = JSON.parse(catalogNode?.textContent || "{}");
  } catch (_) {
    evidenceCatalog = {};
  }
  const renderDossierList = (container, values, tagName = "li") => {
    if (!container) return;
    container.replaceChildren();
    values.split("|").map(value => value.trim()).filter(Boolean).forEach(value => {
      const item = document.createElement(tagName);
      item.textContent = value;
      container.append(item);
    });
  };

  const renderEvidenceGallery = projectId => {
    if (!proofGallery) return;
    const entry = evidenceCatalog[projectId] || {};
    const media = Array.isArray(entry.media) ? entry.media : [];
    const pending = Array.isArray(entry.pending) ? entry.pending : [];
    if (proofCount) {
      const mediaLabel = media.length > 1 ? "médias publiés" : "média publié";
      const pendingLabel = pending.length > 1 ? "preuves à collecter" : "preuve à collecter";
      proofCount.textContent = media.length + " " + mediaLabel + " · " + pending.length + " " + pendingLabel;
    }

    proofGallery.replaceChildren();
    if (!media.length) {
      const empty = document.createElement("div");
      empty.className = "proof-gallery-empty";
      const marker = document.createElement("span");
      marker.className = "proof-gallery-empty-mark";
      marker.setAttribute("aria-hidden", "true");
      marker.textContent = "0";
      const copy = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = "Aucune capture publiée pour ce projet";
      const detail = document.createElement("p");
      detail.textContent = "La galerie accueillera uniquement des éléments issus d'une configuration ou d'un test réellement exécuté.";
      copy.append(title, detail);
      empty.append(marker, copy);
      proofGallery.append(empty);
    } else {
      media.forEach(item => {
        const figure = document.createElement("figure");
        figure.className = "proof-gallery-card";
        const imageTrigger = document.createElement("button");
        imageTrigger.type = "button";
        imageTrigger.className = "proof-image-trigger";
        imageTrigger.setAttribute("aria-label", "Agrandir la preuve : " + (item.title || "Capture technique"));
        imageTrigger.setAttribute("aria-haspopup", "dialog");
        const image = document.createElement("img");
        image.src = item.src;
        image.alt = item.alt || item.title || "Preuve technique NETLAB";
        image.loading = "lazy";
        image.decoding = "async";
        image.addEventListener("error", () => {
          imageTrigger.disabled = true;
          imageTrigger.classList.add("is-unavailable");
          const fallback = document.createElement("span");
          fallback.className = "proof-image-fallback";
          fallback.textContent = "Fichier de preuve indisponible";
          image.replaceWith(fallback);
        }, { once: true });
        imageTrigger.addEventListener("click", () => openEvidenceLightbox(item, imageTrigger));
        imageTrigger.append(image);
        const zoomLabel = document.createElement("span");
        zoomLabel.className = "proof-image-zoom-label";
        zoomLabel.setAttribute("aria-hidden", "true");
        zoomLabel.textContent = "Agrandir ↗";
        imageTrigger.append(zoomLabel);
        const caption = document.createElement("figcaption");
        const meta = document.createElement("div");
        meta.className = "proof-gallery-meta";
        const category = document.createElement("span");
        category.textContent = item.category || "Preuve";
        meta.append(category);
        if (item.date) {
          const date = document.createElement("time");
          date.dateTime = item.date;
          date.textContent = item.date;
          meta.append(date);
        }
        const heading = document.createElement("strong");
        heading.textContent = item.title || "Capture technique";
        const description = document.createElement("p");
        description.textContent = item.caption || "";
        caption.append(meta, heading, description);
        figure.append(imageTrigger, caption);
        proofGallery.append(figure);
      });
    }

    if (proofPendingWrap) proofPendingWrap.hidden = pending.length === 0;
    if (proofPending) {
      proofPending.replaceChildren();
      pending.forEach(item => {
        const row = document.createElement("li");
        row.className = "proof-pending-item";
        const category = document.createElement("span");
        category.className = "proof-pending-category";
        category.textContent = item.category || "À documenter";
        const copy = document.createElement("div");
        const heading = document.createElement("strong");
        heading.textContent = item.title || "Preuve à collecter";
        const detail = document.createElement("p");
        detail.textContent = item.detail || "";
        copy.append(heading, detail);
        row.append(category, copy);
        proofPending.append(row);
      });
    }
  };

  const projectButtons = [...document.querySelectorAll("[data-project-open]")];
  const projectHash = button => "#project-" + button.dataset.projectId;
  let activeProjectButton = null;
  let projectReturnUrl = null;

  const renderProject = button => {
    if (!projectDialog || !button) return;
    activeProjectButton = button;
    if (dialogTitle) dialogTitle.textContent = button.dataset.title || "Dossier projet";
    const visualKey = ["network", "ipv4", "zabbix"].includes(button.dataset.visual) ? button.dataset.visual : "network";
    const visualLabels = {
      network: "Aperçu conceptuel de l'infrastructure PME",
      ipv4: "Exemple pédagogique d'adressage IPv4",
      zabbix: "Périmètre de supervision envisagé, sans métriques collectées"
    };
    if (dialogIndex) dialogIndex.textContent = "PROJET / " + String(projectButtons.indexOf(button) + 1).padStart(2, "0");
    if (dialogVisual) {
      dialogVisual.dataset.visual = visualKey;
      dialogVisual.setAttribute("aria-label", visualLabels[visualKey]);
    }
    dialogArtPanels.forEach(panel => { panel.hidden = panel.dataset.dialogArt !== visualKey; });
    if (dialogStatus) {
      const allowedStatusClasses = ["status-progress", "status-planned", "status-ready"];
      const statusClass = allowedStatusClasses.includes(button.dataset.statusClass) ? button.dataset.statusClass : "status-planned";
      dialogStatus.className = "project-status " + statusClass;
      dialogStatus.replaceChildren();
      const dot = document.createElement("i");
      dot.setAttribute("aria-hidden", "true");
      const label = document.createTextNode(button.dataset.status || "État non précisé");
      dialogStatus.append(dot, label);
    }
    if (dialogSummary) dialogSummary.textContent = button.dataset.summary || "";
    if (dialogDomain) dialogDomain.textContent = button.dataset.domain || "Domaine à préciser";
    if (dialogEnvironment) dialogEnvironment.textContent = button.dataset.environment || "Environnement à préciser";
    if (dialogContext) dialogContext.textContent = button.dataset.context || "";
    if (dialogGoal) dialogGoal.textContent = button.dataset.goal || "";
    if (dialogEvidence) dialogEvidence.textContent = button.dataset.evidence || "Éléments de preuve à ajouter après réalisation.";
    renderEvidenceGallery(button.dataset.projectId || "");
    if (dialogNext) dialogNext.textContent = button.dataset.next || "Étape suivante à définir.";
    if (dialogTools) renderDossierList(dialogTools, button.dataset.tools || "", "span");
    if (dialogObjectives) renderDossierList(dialogObjectives, button.dataset.objectives || "");
    if (dialogDocLink) {
      const link = button.dataset.docLink || "";
      dialogDocLink.hidden = !link;
      if (link) dialogDocLink.setAttribute("href", link);
    }
    if (!projectDialog.open) projectDialog.showModal();
  };

  projectButtons.forEach(button => button.addEventListener("click", () => {
    if (!button.dataset.projectId) return;
    const hash = projectHash(button);
    if (window.location.hash !== hash) {
      projectReturnUrl = window.location.pathname + window.location.search + window.location.hash;
      window.history.pushState({ netlabProject: true }, "", hash);
    }
    renderProject(button);
  }));

  const syncProjectDialog = () => {
    const matchingProject = projectButtons.find(button => button.dataset.projectId && window.location.hash === projectHash(button));
    if (matchingProject) renderProject(matchingProject);
    else if (projectDialog?.open) projectDialog.close();
  };

  window.addEventListener("popstate", syncProjectDialog);
  window.addEventListener("hashchange", syncProjectDialog);

  projectDialog?.addEventListener("close", () => {
    const isProjectRoute = projectButtons.some(button => button.dataset.projectId && window.location.hash === projectHash(button));
    if (isProjectRoute) {
      const returnUrl = projectReturnUrl || (window.location.pathname + window.location.search);
      window.history.replaceState(window.history.state, "", returnUrl);
      projectReturnUrl = null;
    }
  });

  document.querySelector("[data-dialog-close]")?.addEventListener("click", () => projectDialog?.close());
  document.querySelector("[data-evidence-lightbox-close]")?.addEventListener("click", () => evidenceLightbox?.close());
  evidenceLightbox?.addEventListener("click", event => {
    if (event.target === evidenceLightbox) evidenceLightbox.close();
  });
  evidenceLightbox?.addEventListener("close", () => {
    if (projectDialog?.open && lastEvidenceTrigger?.isConnected && !lastEvidenceTrigger.disabled) {
      lastEvidenceTrigger.focus({ preventScroll: true });
    }
    lastEvidenceTrigger = null;
  });
  projectDialog?.addEventListener("click", event => { if (event.target === projectDialog) projectDialog.close(); });

  const copyProjectLinkButton = document.querySelector("[data-copy-project-link]");
  copyProjectLinkButton?.addEventListener("click", async () => {
    if (!activeProjectButton?.dataset.projectId) return;
    const label = copyProjectLinkButton.querySelector("[data-copy-project-link-label]");
    const originalLabel = label?.textContent || "Partager le dossier";
    const shareUrl = new URL(window.location.href);
    shareUrl.hash = projectHash(activeProjectButton);
    const fallbackCopy = text => {
      const field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.append(field);
      field.select();
      const copied = document.execCommand("copy");
      field.remove();
      if (!copied) throw new Error("Copie indisponible");
    };
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(shareUrl.href);
      else fallbackCopy(shareUrl.href);
      if (label) label.textContent = "Lien copié";
      copyProjectLinkButton.setAttribute("aria-label", "Lien du dossier copié");
    } catch (_) {
      if (label) label.textContent = "Copie indisponible";
      copyProjectLinkButton.setAttribute("aria-label", "Copie indisponible");
    }
    window.setTimeout(() => {
      if (label) label.textContent = originalLabel;
      copyProjectLinkButton.setAttribute("aria-label", "Copier le lien de ce dossier");
    }, 1800);
  });

  syncProjectDialog();

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


  // Interactive VLAN inspector for the conceptual PME topology
  const vlanNodes = [...document.querySelectorAll("[data-vlan-node]")];
  const vlanTitle = document.querySelector("[data-vlan-title]");
  const vlanRole = document.querySelector("[data-vlan-role]");
  const vlanSubnet = document.querySelector("[data-vlan-subnet]");

  const selectVlan = node => {
    vlanNodes.forEach(item => item.setAttribute("aria-pressed", String(item === node)));
    if (vlanTitle) vlanTitle.textContent = node.dataset.title || "Segment VLAN";
    if (vlanRole) vlanRole.textContent = node.dataset.role || "";
    if (vlanSubnet) vlanSubnet.textContent = "SOUS-RÉSEAU PRÉVU · " + (node.dataset.subnet || "À définir");
  };

  vlanNodes.forEach(node => node.addEventListener("click", () => selectVlan(node)));
  if (vlanNodes[0]) selectVlan(vlanNodes[0]);



  // Local educational simulator for example inter-VLAN firewall rules.
  const flowSimulator = document.querySelector("[data-flow-simulator]");
  if (flowSimulator) {
    const flowForm = flowSimulator.querySelector("[data-flow-form]");
    const flowSource = flowSimulator.querySelector("[data-flow-source]");
    const flowDestination = flowSimulator.querySelector("[data-flow-destination]");
    const flowService = flowSimulator.querySelector("[data-flow-service]");
    const flowResult = flowSimulator.querySelector("[data-flow-result]");
    const flowKicker = flowSimulator.querySelector("[data-flow-kicker]");
    const flowVerdict = flowSimulator.querySelector("[data-flow-verdict]");
    const flowExplanation = flowSimulator.querySelector("[data-flow-explanation]");
    const flowDetail = flowSimulator.querySelector("[data-flow-detail]");
    const flowPath = flowSimulator.querySelector("[data-flow-path]");
    const flowPathCaption = flowSimulator.querySelector("[data-flow-path-caption]");
    const flowPathSteps = [...flowSimulator.querySelectorAll("[data-flow-step]")];
    const flowSourceLabel = flowSimulator.querySelector("[data-flow-source-label]");
    const flowSourceSubnet = flowSimulator.querySelector("[data-flow-source-subnet]");
    const flowDestinationLabel = flowSimulator.querySelector("[data-flow-destination-label]");
    const flowDestinationSubnet = flowSimulator.querySelector("[data-flow-destination-subnet]");

    const serviceLabels = {
      dns: "DNS · TCP/UDP 53",
      https: "HTTPS · TCP 443",
      ssh: "SSH · TCP 22",
      rdp: "RDP · TCP 3389",
      icmp: "ICMP · Echo"
    };
    const exampleRules = {
      "10>20": ["ssh", "rdp", "icmp"],
      "10>30": ["dns", "https", "ssh", "icmp"],
      "20>30": ["dns", "https"]
    };
    const networkDetails = {
      "10": { label: "VLAN 10 · ADMIN", subnet: "192.168.10.0/24" },
      "20": { label: "VLAN 20 · USERS", subnet: "192.168.20.0/24" },
      "30": { label: "VLAN 30 · SERVERS", subnet: "192.168.30.0/24" }
    };
    const networkLabel = value => ({
      "10": "VLAN 10 · Administration",
      "20": "VLAN 20 · Utilisateurs",
      "30": "VLAN 30 · Serveurs"
    }[value] || "VLAN inconnu");

    flowForm?.addEventListener("submit", event => {
      event.preventDefault();
      if (!flowSource || !flowDestination || !flowService || !flowResult) return;

      const source = flowSource.value;
      const destination = flowDestination.value;
      const service = flowService.value;
      const key = source + ">" + destination;
      const sameNetwork = source === destination;
      const allowed = Boolean(exampleRules[key]?.includes(service));
      const sourceLabel = networkLabel(source);
      const destinationLabel = networkLabel(destination);
      const serviceLabel = serviceLabels[service] || service.toUpperCase();

      let state = "blocked";
      let kicker = "POLITIQUE PAR DÉFAUT";
      let verdict = "Flux bloqué";
      let explanation = "Aucune règle d'autorisation n'est définie pour ce nouveau flux. Dans cette politique pédagogique, le refus par défaut s'applique.";

      if (sameNetwork) {
        state = "local";
        kicker = "TRAJET LOCAL";
        verdict = "Pas de routage inter-VLAN";
        explanation = "La source et la destination appartiennent au même VLAN. Le trafic reste dans le réseau local et ne passe pas par la passerelle inter-VLAN, sous réserve de la segmentation L2.";
      } else if (allowed) {
        state = "allowed";
        kicker = "RÈGLE D'AUTORISATION TROUVÉE";
        verdict = "Flux autorisé par l'exemple";
        explanation = "La politique de démonstration autorise " + serviceLabel + " de " + sourceLabel + " vers " + destinationLabel + ". Cette décision est une simulation locale, pas un test de paquets.";
      } else {
        explanation = "Aucune règle d'autorisation ne couvre " + serviceLabel + " de " + sourceLabel + " vers " + destinationLabel + ". Le nouveau flux est donc refusé par défaut dans cet exemple.";
      }

      flowResult.dataset.state = state;
      if (flowKicker) flowKicker.textContent = kicker;
      if (flowVerdict) flowVerdict.textContent = verdict;
      if (flowExplanation) flowExplanation.textContent = explanation;
      if (flowDetail) flowDetail.textContent = sourceLabel + " → " + destinationLabel + " · " + serviceLabel;

      const sourceInfo = networkDetails[source] || { label: "VLAN inconnu", subnet: "À définir" };
      const destinationInfo = networkDetails[destination] || { label: "VLAN inconnu", subnet: "À définir" };
      if (flowSourceLabel) flowSourceLabel.textContent = sourceInfo.label;
      if (flowSourceSubnet) flowSourceSubnet.textContent = sourceInfo.subnet;
      if (flowDestinationLabel) flowDestinationLabel.textContent = destinationInfo.label;
      if (flowDestinationSubnet) flowDestinationSubnet.textContent = destinationInfo.subnet;

      if (flowPath) {
        flowPath.dataset.state = state;
        flowPathSteps.forEach(step => {
          const name = step.dataset.flowStep;
          let stepState = "inactive";
          if (state === "allowed") stepState = "active";
          else if (state === "blocked") {
            if (name === "source" || name === "switch-entry") stepState = "active";
            if (name === "gateway") stepState = "blocked";
          } else if (state === "local") {
            if (name === "source" || name === "switch-entry" || name === "switch-exit" || name === "destination") stepState = "active";
            if (name === "gateway") stepState = "bypassed";
          }
          step.dataset.status = stepState;
        });
        flowPath.querySelectorAll("[data-flow-link]").forEach((link, index) => {
          let linkState = "inactive";
          if (state === "allowed") linkState = "active";
          else if (state === "blocked" && index < 2) linkState = "active";
          else if (state === "local" && (index === 0 || index === 3)) linkState = "active";
          else if (state === "local" && (index === 1 || index === 2)) linkState = "bypassed";
          link.dataset.status = linkState;
        });
      }
      if (flowPathCaption) {
        const captions = {
          allowed: "Chemin conceptuel autorisé : VLAN source → switch L2 → trunk 802.1Q / pfSense → switch L2 → VLAN destination.",
          blocked: "Le nouveau flux atteint le filtrage pfSense via le switch L2, puis s'arrête : la destination n'est pas atteinte.",
          local: "Même VLAN : le trafic est commuté localement vers le destinataire sans passer par pfSense."
        };
        flowPathCaption.textContent = captions[state] || "Le chemin s'actualisera après l'analyse du flux.";
      }
    });
  }

  // Documentation: copy command snippets with a fallback for older contexts.
  document.querySelectorAll("[data-copy-code]").forEach(button => button.addEventListener("click", async () => {
    const code = button.closest(".docs-code")?.querySelector("pre code");
    if (!code) return;
    const label = button.querySelector("[data-copy-label]");
    const originalLabel = label?.textContent || "Copier";
    const value = code.textContent || "";

    const fallbackCopy = text => {
      const field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.append(field);
      field.select();
      const copied = document.execCommand("copy");
      field.remove();
      if (!copied) throw new Error("Copie indisponible");
    };

    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(value);
      else fallbackCopy(value);
      if (label) label.textContent = "Copié";
      button.setAttribute("aria-label", "Commande copiée");
    } catch (_) {
      if (label) label.textContent = "Copie indisponible";
      button.setAttribute("aria-label", "Copie indisponible");
    }

    window.setTimeout(() => {
      if (label) label.textContent = originalLabel;
      button.setAttribute("aria-label", "Copier les commandes");
    }, 1800);
  }));

  const docsLinks = [...document.querySelectorAll(".docs-sidebar a[href^='#']")];
  if (docsLinks.length && "IntersectionObserver" in window) {
    const docsObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        docsLinks.forEach(link => {
          const active = link.getAttribute("href") === "#" + entry.target.id;
          link.classList.toggle("is-active", active);
          if (active) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-20% 0px -65% 0px", threshold: 0 });
    ["ipv4", "pme", "zabbix"].forEach(id => {
      const section = document.getElementById(id);
      if (section) docsObserver.observe(section);
    });
  }

})();