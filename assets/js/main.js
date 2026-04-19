document.addEventListener("DOMContentLoaded", function () {
  const body = document.body;

  const DATA_URL = "https://script.google.com/macros/s/AKfycbzjwwI0-ltt-BZv1FbymmLtikDR9UevoQjRYIUrKthpDCBlVEPZFCbccPTvQUG5zvuGMg/exec";
  const CONTACT_EMAIL = "ing.arthur03@gmail.com";

  /* -----------------------------------------
     PAÍSES
  ----------------------------------------- */
  const countries = [
    "Afganistán","Albania","Alemania","Andorra","Angola","Antigua y Barbuda",
    "Arabia Saudita","Argelia","Argentina","Armenia","Australia","Austria",
    "Azerbaiyán","Bahamas","Bangladés","Barbados","Baréin","Bélgica","Belice",
    "Benín","Bielorrusia","Bolivia","Bosnia y Herzegovina","Botsuana","Brasil",
    "Brunéi","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Camboya","Camerún",
    "Canadá","Catar","Chad","Chile","China","Chipre","Colombia","Comoras","Congo",
    "Corea del Norte","Corea del Sur","Costa de Marfil","Costa Rica","Croacia",
    "Cuba","Dinamarca","Dominica","Ecuador","Egipto","El Salvador",
    "Emiratos Árabes Unidos","Eritrea","Eslovaquia","Eslovenia","España",
    "Estados Unidos","Estonia","Esuatini","Etiopía","Filipinas","Finlandia","Fiyi",
    "Francia","Gabón","Gambia","Georgia","Ghana","Granada","Grecia","Guatemala",
    "Guinea","Guinea-Bisáu","Guinea Ecuatorial","Guyana","Haití","Honduras",
    "Hungría","India","Indonesia","Irak","Irán","Irlanda","Islandia",
    "Islas Marshall","Islas Salomón","Israel","Italia","Jamaica","Japón","Jordania",
    "Kazajistán","Kenia","Kirguistán","Kiribati","Kuwait","Laos","Lesoto","Letonia",
    "Líbano","Liberia","Libia","Liechtenstein","Lituania","Luxemburgo",
    "Macedonia del Norte","Madagascar","Malasia","Malaui","Maldivas","Malí","Malta",
    "Marruecos","Mauricio","Mauritania","México","Micronesia","Moldavia","Mónaco",
    "Mongolia","Montenegro","Mozambique","Namibia","Nauru","Nepal","Nicaragua",
    "Níger","Nigeria","Noruega","Nueva Zelanda","Omán","Países Bajos","Pakistán",
    "Palaos","Panamá","Papúa Nueva Guinea","Paraguay","Perú","Polonia","Portugal",
    "Reino Unido","República Centroafricana","República Checa","República del Congo",
    "República Dominicana","Ruanda","Rumania","Rusia","Samoa",
    "San Cristóbal y Nieves","San Marino","San Vicente y las Granadinas",
    "Santa Lucía","Santo Tomé y Príncipe","Senegal","Serbia","Seychelles",
    "Sierra Leona","Singapur","Siria","Somalia","Sri Lanka","Sudáfrica","Sudán",
    "Sudán del Sur","Suecia","Suiza","Surinam","Tailandia","Tanzania","Tayikistán",
    "Timor Oriental","Togo","Tonga","Trinidad y Tobago","Túnez","Turkmenistán",
    "Turquía","Tuvalu","Ucrania","Uganda","Uruguay","Uzbekistán","Vanuatu",
    "Vaticano","Venezuela","Vietnam","Yemen","Zambia","Zimbabue","Otro"
  ];

  function fillCountrySelect(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;

    const currentOptions = Array.from(select.querySelectorAll("option")).map(opt => opt.value);
    countries.forEach(country => {
      if (!currentOptions.includes(country)) {
        const option = document.createElement("option");
        option.value = country;
        option.textContent = country;
        select.appendChild(option);
      }
    });
  }

  fillCountrySelect("pais_nacimiento");
  fillCountrySelect("pais_residencia");

  /* -----------------------------------------
     HELPERS
  ----------------------------------------- */
  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  function getField(obj, keys = [], fallback = "") {
  for (const key of keys) {
    const value = obj?.[key];
    if (value != null && String(value).trim() !== "") {
      return value;
    }
  }
  return fallback;
}
   /* -----------------------------------------
     EVENTOS DINÁMICOS + CARRUSEL
  ----------------------------------------- */
  const eventsTrack = document.getElementById("eventsGrid");
  const eventsLeft = document.getElementById("eventsLeft");
  const eventsRight = document.getElementById("eventsRight");
  let eventsIndex = 0;

  let eventsStartX = 0;
  let eventsCurrentX = 0;
  let eventsIsDragging = false;
  let eventsAutoplay = null;

  function getEventsVisibleCount() {
    return window.innerWidth <= 850 ? 1 : 3;
  }

    function getEventsGap() {
    if (!eventsTrack) return 0;
    const styles = window.getComputedStyle(eventsTrack);
    return parseFloat(styles.gap || styles.columnGap || "0") || 0;
  }

    function getEventsCardWidth() {
    const cards = eventsTrack ? Array.from(eventsTrack.querySelectorAll(".card")) : [];
    if (!cards.length) return 0;
    return cards[0].offsetWidth || cards[0].getBoundingClientRect().width || 0;
  }

  function getEventsMaxIndex() {
    if (!eventsTrack) return 0;
    const cards = Array.from(eventsTrack.querySelectorAll(".card"));
    return Math.max(0, cards.length - getEventsVisibleCount());
  }

  function stopEventsAutoplay() {
    if (eventsAutoplay) {
      clearInterval(eventsAutoplay);
      eventsAutoplay = null;
    }
  }

  function startEventsAutoplay() {
    if (!eventsTrack) return;
    stopEventsAutoplay();

    const cards = Array.from(eventsTrack.querySelectorAll(".card"));
    const visibleCount = getEventsVisibleCount();

    if (cards.length <= visibleCount) return;

    eventsAutoplay = setInterval(() => {
      const maxIndex = getEventsMaxIndex();

      if (eventsIndex >= maxIndex) {
        eventsIndex = 0;
      } else {
        eventsIndex += 1;
      }

      updateEventsCarousel(true);
    }, 4500);
  }

  function refreshEventsCarousel() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        updateEventsCarousel(false);
      });
    });
  }

  function getEventsOffsetByIndex(index) {
    if (!eventsTrack) return 0;
    const cards = Array.from(eventsTrack.querySelectorAll(".card"));
    if (!cards.length || !cards[index]) return 0;
    return cards[index].offsetLeft;
  }

  function updateEventsCarousel(withAnimation = true) {
    if (!eventsTrack || !eventsLeft || !eventsRight) return;

    const cards = Array.from(eventsTrack.querySelectorAll(".card"));
    const visibleCount = getEventsVisibleCount();

    if (!cards.length) {
      eventsTrack.style.transition = withAnimation
        ? "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)"
        : "none";
      eventsTrack.style.transform = "translateX(0)";
      eventsLeft.classList.add("hidden");
      eventsRight.classList.add("hidden");
      return;
    }

    const maxIndex = Math.max(0, cards.length - visibleCount);

    if (eventsIndex < 0) eventsIndex = 0;
    if (eventsIndex > maxIndex) eventsIndex = maxIndex;

    const offset = getEventsOffsetByIndex(eventsIndex);
    eventsTrack.style.transition = withAnimation
      ? "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)"
      : "none";
    eventsTrack.style.transform = `translateX(-${offset}px)`;

    eventsLeft.classList.toggle("hidden", eventsIndex === 0 || cards.length <= visibleCount);
    eventsRight.classList.toggle("hidden", eventsIndex >= maxIndex || cards.length <= visibleCount);
  }

  function bindEventsSwipe() {
    if (!eventsTrack || eventsTrack.dataset.swipeBound === "events") return;

    eventsTrack.addEventListener("touchstart", (e) => {
      if (!e.touches.length) return;
      stopEventsAutoplay();
      eventsIsDragging = true;
      eventsStartX = e.touches[0].clientX;
      eventsCurrentX = eventsStartX;
      eventsTrack.style.transition = "none";
    }, { passive: true });

    eventsTrack.addEventListener("touchmove", (e) => {
      if (!eventsIsDragging || !e.touches.length) return;

      eventsCurrentX = e.touches[0].clientX;
      const diff = eventsCurrentX - eventsStartX;

      const baseOffset = getEventsOffsetByIndex(eventsIndex);
      const dragOffset = baseOffset - diff;

      eventsTrack.style.transform = `translateX(-${Math.max(0, dragOffset)}px)`;
    }, { passive: true });

    eventsTrack.addEventListener("touchend", () => {
      if (!eventsIsDragging) return;
      eventsIsDragging = false;

      const diff = eventsCurrentX - eventsStartX;
      const threshold = 50;
      const maxIndex = getEventsMaxIndex();

      if (diff < -threshold && eventsIndex < maxIndex) {
        eventsIndex += 1;
      } else if (diff > threshold && eventsIndex > 0) {
        eventsIndex -= 1;
      }

      updateEventsCarousel(true);
      startEventsAutoplay();
    });

    eventsTrack.addEventListener("touchcancel", () => {
      eventsIsDragging = false;
      updateEventsCarousel(true);
      startEventsAutoplay();
    });

    eventsTrack.dataset.swipeBound = "events";
  }

  function bindEventsCarousel() {
    if (!eventsTrack || !eventsLeft || !eventsRight) return;

    if (eventsLeft.dataset.bound !== "true") {
      eventsLeft.onclick = () => {
        stopEventsAutoplay();
        eventsIndex -= 1;
        updateEventsCarousel(true);
        startEventsAutoplay();
      };
      eventsLeft.dataset.bound = "true";
    }

    if (eventsRight.dataset.bound !== "true") {
      eventsRight.onclick = () => {
        stopEventsAutoplay();
        eventsIndex += 1;
        updateEventsCarousel(true);
        startEventsAutoplay();
      };
      eventsRight.dataset.bound = "true";
    }

    eventsTrack.onmouseenter = stopEventsAutoplay;
    eventsTrack.onmouseleave = startEventsAutoplay;

    eventsLeft.onmouseenter = stopEventsAutoplay;
    eventsRight.onmouseenter = stopEventsAutoplay;
    eventsLeft.onmouseleave = startEventsAutoplay;
    eventsRight.onmouseleave = startEventsAutoplay;

    bindEventsSwipe();
    refreshEventsCarousel();
    startEventsAutoplay();
  }

  function renderEvents(events) {
    const eventsGrid = document.getElementById("eventsGrid") || document.querySelector("#events .card-grid");
    if (!eventsGrid) {
      console.warn("No se encontró el contenedor de eventos (#eventsGrid o #events .card-grid)");
      return;
    }

    const fallbackEvents = [
      {
        icon: "🍞",
        title: "Reunión Dominical",
        schedule: "Domingos · 16:00",
        link: "https://meet.google.com/hoi-rdok-sym"
      },
      {
        icon: "🌅",
        title: "Oración Matutina",
        schedule: "Lunes a Viernes · 5:00 AM",
        link: "https://meet.google.com/hoi-rdok-sym"
      },
      {
        icon: "🌍",
        title: "Reunión de la Comunidad Europea",
        schedule: "Viernes · 20:00",
        link: "https://meet.google.com/hoi-rdok-sym"
      },
      {
        icon: "🧒",
        title: "Propósito Kids",
        schedule: "Sábados · 20:00",
        link: "https://meet.google.com/hoi-rdok-sym"
      }
    ];

    const rawItems = Array.isArray(events) && events.length ? events : fallbackEvents;

    const items = rawItems.map(item => ({
      icon: getField(item, ["icon", "Icon"], "✨"),
      title: getField(item, ["title", "titulo", "Titulo", "nombre", "Nombre"], "Actividad"),
      schedule: getField(item, ["schedule", "horario", "Horario", "fecha", "Fecha"], "Próximamente"),
      link: getField(item, ["link", "Link", "url", "URL"], "#")
    }));

    eventsGrid.innerHTML = items.map(item => `
      <div class="card">
        <div class="card-icon">${escapeHtml(item.icon || "✨")}</div>
        <h3>${escapeHtml(item.title || "Actividad")}</h3>
        <p><strong>${escapeHtml(item.schedule || "Próximamente")}</strong></p>
        <a class="btn" href="${escapeHtml(item.link || "#")}" target="_blank" rel="noopener noreferrer">Unirme</a>
      </div>
    `).join("");

    eventsIndex = 0;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        updateEventsCarousel(false);
      });
    });
    bindEventsCarousel();
  }
  /* -----------------------------------------
     CARRUSEL INVITADAS
  ----------------------------------------- */
  const inviteesTrack = document.getElementById("inviteesTrack");
  const inviteesLeft = document.getElementById("invLeft");
  const inviteesRight = document.getElementById("invRight");
  let inviteesIndex = 0;

  let inviteesStartX = 0;
  let inviteesCurrentX = 0;
  let inviteesIsDragging = false;
  let inviteesMoved = false;

function getInviteesVisibleCount() {
    if (window.innerWidth <= 768) return 1;   // móvil
    if (window.innerWidth <= 1024) return 2;  // tablet
    return 3;                                 // desktop
}

function getInviteesGap() {
  if (!inviteesTrack) return 0;
  const styles = window.getComputedStyle(inviteesTrack);
  return parseFloat(styles.gap || styles.columnGap || "0") || 0;
}

  function getInviteesCardWidth() {
    const cards = inviteesTrack ? Array.from(inviteesTrack.querySelectorAll(".card")) : [];
    if (!cards.length) return 0;
    return cards[0].offsetWidth || cards[0].getBoundingClientRect().width || 0;
  }

  function getInviteesMaxIndex() {
    if (!inviteesTrack) return 0;
    const cards = Array.from(inviteesTrack.querySelectorAll(".card"));
    return Math.max(0, cards.length - getInviteesVisibleCount());
  }

  function setInviteesTranslate(offset, withAnimation = true) {
    if (!inviteesTrack) return;
    inviteesTrack.style.transition = withAnimation
      ? "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)"
      : "none";
    inviteesTrack.style.transform = `translateX(-${offset}px)`;
  }

  function getInviteesOffsetByIndex(index) {
    if (!inviteesTrack) return 0;
    const cards = Array.from(inviteesTrack.querySelectorAll(".card"));
    if (!cards.length || !cards[index]) return 0;
    return cards[index].offsetLeft;
  }

  function updateInviteesCarousel(withAnimation = true) {
    if (!inviteesTrack || !inviteesLeft || !inviteesRight) return;

    const cards = Array.from(inviteesTrack.querySelectorAll(".card"));
    const visibleCount = getInviteesVisibleCount();

    if (!cards.length) {
      setInviteesTranslate(0, withAnimation);
      inviteesLeft.classList.add("hidden");
      inviteesRight.classList.add("hidden");
      return;
    }

    const maxIndex = Math.max(0, cards.length - visibleCount);

    if (inviteesIndex < 0) inviteesIndex = 0;
    if (inviteesIndex > maxIndex) inviteesIndex = maxIndex;

    const offset = getInviteesOffsetByIndex(inviteesIndex);
    setInviteesTranslate(offset, withAnimation);

    inviteesLeft.classList.toggle("hidden", inviteesIndex === 0 || cards.length <= visibleCount);
    inviteesRight.classList.toggle("hidden", inviteesIndex >= maxIndex || cards.length <= visibleCount);
  }

  function goToInviteesIndex(newIndex) {
    inviteesIndex = newIndex;
    updateInviteesCarousel(true);
  }

  function bindInviteesSwipe() {
    if (!inviteesTrack || inviteesTrack.dataset.swipeBound === "invitees") return;

    inviteesTrack.addEventListener("touchstart", (e) => {
      if (!e.touches.length) return;
      inviteesIsDragging = true;
      inviteesMoved = false;
      inviteesStartX = e.touches[0].clientX;
      inviteesCurrentX = inviteesStartX;
      inviteesTrack.style.transition = "none";
    }, { passive: true });

    inviteesTrack.addEventListener("touchmove", (e) => {
      if (!inviteesIsDragging || !e.touches.length) return;

      inviteesCurrentX = e.touches[0].clientX;
      const diff = inviteesCurrentX - inviteesStartX;

      if (Math.abs(diff) > 8) {
        inviteesMoved = true;
      }

      const baseOffset = getInviteesOffsetByIndex(inviteesIndex);
      const dragOffset = baseOffset - diff;

      inviteesTrack.style.transform = `translateX(-${Math.max(0, dragOffset)}px)`;
    }, { passive: true });

     inviteesTrack.addEventListener("touchend", () => {
      if (!inviteesIsDragging) return;
      inviteesIsDragging = false;

      const diff = inviteesCurrentX - inviteesStartX;
      const threshold = 50;
      const maxIndex = getInviteesMaxIndex();

      if (diff < -threshold && inviteesIndex < maxIndex) {
        inviteesIndex += 1;
      } else if (diff > threshold && inviteesIndex > 0) {
        inviteesIndex -= 1;
      }

      updateInviteesCarousel(true);

      setTimeout(() => {
        inviteesMoved = false;
      }, 0);
    });

      inviteesTrack.addEventListener("touchcancel", () => {
      inviteesIsDragging = false;
      updateInviteesCarousel(true);
      inviteesMoved = false;
    });

    inviteesTrack.dataset.swipeBound = "invitees";
  }

  function refreshInviteesCarousel() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        updateInviteesCarousel(false);
      });
    });
  }

  function bindInviteesCarousel() {
    if (!inviteesTrack || !inviteesLeft || !inviteesRight) return;

    if (inviteesLeft.dataset.bound !== "true") {
      inviteesLeft.onclick = () => {
        goToInviteesIndex(inviteesIndex - 1);
      };
      inviteesLeft.dataset.bound = "true";
    }

    if (inviteesRight.dataset.bound !== "true") {
      inviteesRight.onclick = () => {
        goToInviteesIndex(inviteesIndex + 1);
      };
      inviteesRight.dataset.bound = "true";
    }

    bindInviteesSwipe();
    refreshInviteesCarousel();
  }

  /* -----------------------------------------
     MENÚ HAMBURGUESA
  ----------------------------------------- */
    const menu = document.getElementById("nav-menu");
  const menuOverlay = document.getElementById("menu-overlay");
  const hamburger = document.querySelector(".hamburger");

  if (hamburger) {
    hamburger.setAttribute("aria-expanded", "false");
  }

  function syncHamburgerState() {
    const isOpen = !!(menu && (menu.classList.contains("open") || menu.classList.contains("show")));

    if (hamburger) {
      hamburger.classList.toggle("active", isOpen);
      hamburger.setAttribute("aria-expanded", isOpen ? "true" : "false");
    }

    if (menuOverlay) {
      menuOverlay.classList.toggle("visible", isOpen);
    }
  }

  function closeMenu() {
    menu?.classList.remove("open");
    menu?.classList.remove("show");
    syncHamburgerState();
  }

  window.toggleMenu = function () {
    if (!menu) return;
    menu.classList.toggle("open");
    syncHamburgerState();
  };

  menuOverlay?.addEventListener("click", function () {
    closeMenu();
  });
    menu?.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 850) {
        closeMenu();
      }
    });
  });

  /* -----------------------------------------
     LIGHTBOX GALERÍA
  ----------------------------------------- */
  let galleryImages = [];
  let galleryIndex = 0;
  let lightboxTouchStartX = 0;
  let lightboxTouchCurrentX = 0;
  let lightboxTouchActive = false;

  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCounter = document.getElementById("lightbox-counter");
  const nextBtn = document.getElementById("next");
  const prevBtn = document.getElementById("prev");

  function updateLightboxCounter() {
  if (lightboxCounter) {
    lightboxCounter.textContent = `${galleryIndex + 1} / ${galleryImages.length}`;
  }
}
function isLightboxOpen() {
  return !!lightbox?.classList.contains("open");
}

function showPrevLightboxImage() {
  if (!galleryImages.length) return;
  galleryIndex = (galleryIndex - 1 + galleryImages.length) % galleryImages.length;
  if (lightboxImg) lightboxImg.src = galleryImages[galleryIndex];
  updateLightboxCounter();
}

function showNextLightboxImage() {
  if (!galleryImages.length) return;
  galleryIndex = (galleryIndex + 1) % galleryImages.length;
  if (lightboxImg) lightboxImg.src = galleryImages[galleryIndex];
  updateLightboxCounter();
}

function handleLightboxKeyboard(e) {
  if (!isLightboxOpen()) return;

  if (e.key === "ArrowLeft") {
    e.preventDefault();
    showPrevLightboxImage();
    return;
  }

  if (e.key === "ArrowRight") {
    e.preventDefault();
    showNextLightboxImage();
    return;
  }

  if (e.key === "Escape") {
    e.preventDefault();
    lightbox?.classList.remove("open");
  }
}
function setLightboxImage(src) {
  if (lightboxImg) lightboxImg.src = src;
}

function openLightboxFromImages(images = [], startIndex = 0) {
  if (!Array.isArray(images) || !images.length) return;

  galleryImages = images.filter(Boolean);
  if (!galleryImages.length) return;

  galleryIndex = Math.max(0, Math.min(startIndex, galleryImages.length - 1));
  setLightboxImage(galleryImages[galleryIndex]);
  lightbox?.classList.add("open");
  updateLightboxCounter();
}

function getVisibleActiveGalleryImages() {
  return Array.from(document.querySelectorAll(".gallery-row.active img"));
}

function openLightbox(src, index) {
  const visibleImgs = getVisibleActiveGalleryImages();
  const visibleSources = visibleImgs.map(img => img.src).filter(Boolean);

  if (visibleSources.length) {
    openLightboxFromImages(visibleSources, index);
    return;
  }

  if (!src) return;
  openLightboxFromImages([src], 0);
}

  function bindGalleryClicks() {
  document.querySelectorAll(".gallery-stack-card").forEach(card => {
    card.removeEventListener("click", handleGalleryStackClick);
    card.addEventListener("click", handleGalleryStackClick);

    card.removeEventListener("keydown", handleGalleryStackKeydown);
    card.addEventListener("keydown", handleGalleryStackKeydown);
  });
}

function handleGalleryStackClick(e) {
  const card = e.currentTarget;
  const images = JSON.parse(card.dataset.images || "[]").filter(Boolean);
  if (!images.length) return;

  openLightboxFromImages(images, 0);
}

function handleGalleryStackKeydown(e) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    handleGalleryStackClick({ currentTarget: e.currentTarget });
  }
}

  nextBtn?.addEventListener("click", function (e) {
  e.stopPropagation();
  showNextLightboxImage();
});

prevBtn?.addEventListener("click", function (e) {
  e.stopPropagation();
  showPrevLightboxImage();
});

  lightbox?.addEventListener("click", function (e) {
    if (e.target.id === "lightbox") {
      lightbox.classList.remove("open");
    }
  });
  document.addEventListener("keydown", handleLightboxKeyboard);

  lightbox?.addEventListener("touchstart", function (e) {
  if (!isLightboxOpen() || !e.touches.length) return;
  lightboxTouchActive = true;
  lightboxTouchStartX = e.touches[0].clientX;
  lightboxTouchCurrentX = lightboxTouchStartX;
}, { passive: true });

lightbox?.addEventListener("touchmove", function (e) {
  if (!lightboxTouchActive || !e.touches.length) return;
  lightboxTouchCurrentX = e.touches[0].clientX;
}, { passive: true });

lightbox?.addEventListener("touchend", function () {
  if (!lightboxTouchActive) return;

  const diff = lightboxTouchCurrentX - lightboxTouchStartX;
  const threshold = 50;

  lightboxTouchActive = false;

  if (diff <= -threshold) {
    showNextLightboxImage();
    return;
  }

  if (diff >= threshold) {
    showPrevLightboxImage();
  }
});

lightbox?.addEventListener("touchcancel", function () {
  lightboxTouchActive = false;
});
  /* -----------------------------------------
     LIGHTBOX INVITADAS
  ----------------------------------------- */
  const inviteeLightbox = document.getElementById("invitee-lightbox");
  const inviteeImg = document.getElementById("invitee-lightbox-img");
  const inviteeName = document.getElementById("invitee-lightbox-name");
  const inviteeTitle = document.getElementById("invitee-lightbox-title");
  const inviteeClose = document.getElementById("invitee-lightbox-close");

  window.openInviteeLightbox = function (img, name, title) {
    if (inviteeImg) inviteeImg.src = img;
    if (inviteeName) inviteeName.textContent = name;
    if (inviteeTitle) inviteeTitle.textContent = title;
    inviteeLightbox?.classList.add("open");
  };

  inviteeClose?.addEventListener("click", function () {
    inviteeLightbox?.classList.remove("open");
  });

  inviteeLightbox?.addEventListener("click", function (e) {
    if (e.target.id === "invitee-lightbox") {
      inviteeLightbox.classList.remove("open");
    }
  });

  /* -----------------------------------------
     YOUTUBE AUTO SLIDE
  ----------------------------------------- */
  const ytCarousel = document.querySelector(".youtube-carousel");
  let ytOffset = 0;

  function autoSlideYouTube() {
    if (!ytCarousel) return;
    ytOffset += 320;
    if (ytOffset >= ytCarousel.scrollWidth) ytOffset = 0;

    ytCarousel.scrollTo({
      left: ytOffset,
      behavior: "smooth"
    });
  }

  if (ytCarousel) {
    setInterval(autoSlideYouTube, 3000);
  }

  /* -----------------------------------------
     MODAL DONACIÓN
  ----------------------------------------- */
  const donateModal = document.getElementById("donateModal");
  const openDonateModalBtn = document.getElementById("openDonateModal");
  const openDonateFromMenuBtn = document.getElementById("openDonateFromMenu");
  const closeDonateModalBtn = document.getElementById("closeDonateModal");
  const donateModalContent = document.querySelector("#donateModal .modal-content");

  function openDonateModal(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    closeMenu();
    donateModal?.classList.add("open");
    body.style.overflow = "hidden";
  }

  function closeDonateModal(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    donateModal?.classList.remove("open");
    body.style.overflow = "";
  }

  openDonateModalBtn?.addEventListener("click", openDonateModal);
  openDonateFromMenuBtn?.addEventListener("click", openDonateModal);
  closeDonateModalBtn?.addEventListener("click", closeDonateModal);

  donateModal?.addEventListener("click", function (e) {
    if (e.target === donateModal) {
      closeDonateModal();
    }
  });

  donateModalContent?.addEventListener("click", function (e) {
    e.stopPropagation();
  });

  /* -----------------------------------------
     MODAL UNIRSE
  ----------------------------------------- */
  const joinModal = document.getElementById("joinModal");
  const joinForm = document.getElementById("joinForm");
  const loadingOverlay = document.getElementById("loadingOverlay");
  const joinModalContent = document.querySelector("#joinModal .join-modal-content");

  const openJoinModalMenuBtn = document.getElementById("openJoinModalMenu");
  const openJoinModalHeroBtn = document.getElementById("openJoinModalHero");
  const openJoinModalSectionBtn = document.getElementById("openJoinModalSection");
  const closeJoinModalBtn = document.getElementById("closeJoinModal");

  function openJoinModal(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    closeMenu();
    joinModal?.classList.add("open");
    body.style.overflow = "hidden";
  }

  function closeJoinModal(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    joinModal?.classList.remove("open");
    body.style.overflow = "";
  }

  openJoinModalMenuBtn?.addEventListener("click", openJoinModal);
  openJoinModalHeroBtn?.addEventListener("click", openJoinModal);
  openJoinModalSectionBtn?.addEventListener("click", openJoinModal);
  closeJoinModalBtn?.addEventListener("click", closeJoinModal);

  joinModal?.addEventListener("click", function (e) {
    if (e.target === joinModal) {
      closeJoinModal();
    }
  });

  joinModalContent?.addEventListener("click", function (e) {
    e.stopPropagation();
  });

  /* -----------------------------------------
     FORMULARIO UNIRSE
  ----------------------------------------- */
  const joinMessage = document.getElementById("joinMessage");

  function showJoinMessage(message, type) {
    if (!joinMessage) {
      alert(message);
      return;
    }

    joinMessage.textContent = message;
    joinMessage.className = type === "ok" ? "form-message ok" : "form-message err";
    joinMessage.style.display = "block";
  }

  function clearJoinMessage() {
    if (!joinMessage) return;
    joinMessage.textContent = "";
    joinMessage.className = "form-message";
    joinMessage.style.display = "none";
  }

  function normalizeJoinPhone(phone) {
    return String(phone || "").replace(/[^\d+]/g, "").trim();
  }

  function isAdultBirthDate(dateString) {
    if (!dateString) return false;

    const birthDate = new Date(dateString + "T00:00:00");
    if (Number.isNaN(birthDate.getTime())) return false;

    const today = new Date();
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (birthDate >= todayOnly) {
      return false;
    }

    let age = todayOnly.getFullYear() - birthDate.getFullYear();
    const monthDiff = todayOnly.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && todayOnly.getDate() < birthDate.getDate())) {
      age -= 1;
    }

    return age >= 18;
  }

  function validateJoinFormFrontend(payload) {
    // Validar campos uno por uno para detectar exactamente cuál falla
    if (!payload.nombre) return "Falta el nombre.";
    if (!payload.apellido) return "Falta el apellido.";
    if (!payload.email) return "Falta el correo.";
    if (!payload.telefono) return "Falta el teléfono.";
    if (!payload.fecha_nacimiento) return "Falta la fecha de nacimiento.";

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email);
    if (!emailOk) {
      return "El correo no es válido.";
    }

    const phoneClean = normalizeJoinPhone(payload.telefono);
    if (phoneClean.length < 7) {
      return "El teléfono no es válido.";
    }

    // Validar fecha futura primero
    const birthDate = new Date(payload.fecha_nacimiento);
    const today = new Date();
    if (birthDate >= today) {
      return "La fecha de nacimiento no puede ser hoy o futura.";
    }

    // Validar mayoría de edad
    if (!isAdultBirthDate(payload.fecha_nacimiento)) {
      return "Debes ser mayor de 18 años para registrarte.";
    }

    return "";
  }

  joinForm?.addEventListener("submit", async function (e) {
    e.preventDefault();
    clearJoinMessage();

    const submitBtn = joinForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.textContent : "Enviar";

    const payload = {
      action: "register",
      nombre: document.getElementById("nombre")?.value.trim() || "",
      apellido: document.getElementById("apellido")?.value.trim() || "",
      email: document.getElementById("email")?.value.trim() || "",
      telefono: document.getElementById("telefono")?.value.trim() || "",
      fecha_nacimiento: document.getElementById("fecha_nacimiento")?.value.trim() || "",
      estatus_matrimonial: document.getElementById("estatus_matrimonial")?.value.trim() || "",
      pais_nacimiento: document.getElementById("pais_nacimiento")?.value.trim() || "",
      pais_residencia: document.getElementById("pais_residencia")?.value.trim() || "",
      cristiana: document.getElementById("cristiana")?.value.trim() || "",
      comunidad: document.getElementById("comunidad")?.value.trim() || ""
    };

    const frontendError = validateJoinFormFrontend(payload);
    if (frontendError) {
      showJoinMessage(frontendError, "err");
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Enviando...";
    }

    if (loadingOverlay) loadingOverlay.style.display = "flex";

    try {
      const response = await fetch(DATA_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!result.ok) {
        if (loadingOverlay) loadingOverlay.style.display = "none";

        if (result.field === "email") {
          showJoinMessage("Este correo ya está registrado.", "err");
        } else if (result.field === "telefono") {
          showJoinMessage("Este teléfono ya está registrado.", "err");
        } else {
          showJoinMessage(result.message || result.error || "No se pudo completar el registro.", "err");
        }

        return;
      }

      // --- Begin new success flow for gracias-unirse.html ---
      const nombreBienvenida = encodeURIComponent(payload.nombre || "");
      const emailBienvenida = encodeURIComponent(payload.email || "");

      closeJoinModal();
      if (loadingOverlay) loadingOverlay.style.display = "none";
      if (joinForm) joinForm.reset();

      setTimeout(function () {
        window.location.href = `gracias-unirse.html?nombre=${nombreBienvenida}&email=${emailBienvenida}`;
      }, 500);
      // --- End new success flow ---
    } catch (error) {
      if (loadingOverlay) loadingOverlay.style.display = "none";
      showJoinMessage("Ocurrió un error al enviar el formulario. Intenta de nuevo.", "err");
      console.error("Error en registro:", error);
      // Do NOT close the join modal on error
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
      // Ensure loadingOverlay is hidden unless on gracias-unirse.html
      if (loadingOverlay && !window.location.href.includes("gracias-unirse.html")) {
        loadingOverlay.style.display = "none";
      }
    }
  });

  /* -----------------------------------------
   GALERÍA DINÁMICA APILADA POR REGIÓN + BLOQUES
   Estados Unidos / RD / Europa
----------------------------------------- */
function normalizeGalleryText(text) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
function getGalleryField(item, keys = []) {
  for (const key of keys) {
    const value = item?.[key];
    if (value != null && String(value).trim() !== "") {
      return value;
    }
  }
  return "";
}

function getGalleryPhotoUrl(item) {
  return getGalleryField(item, ["fotoUrl", "fotoURL", "FotoURL", "url", "image", "imagen"]);
}

function isGalleryItemActive(item) {
  const rawValue = normalizeGalleryText(
    getGalleryField(item, ["activa", "Activa", "active", "estado"])
  );

  if (!rawValue) return true;

  return ["si", "sí", "true", "1", "activo", "activa"].includes(rawValue);
}

function getActiveGalleryRowId() {
  return document.querySelector(".gallery-row.active")?.id || "usa";
}

function getGalleryRegionKey(categoria) {
  const value = normalizeGalleryText(categoria);

  if (value === "estados unidos" || value === "usa" || value === "eeuu") {
    return "usa";
  }

  if (value === "republica dominicana" || value === "república dominicana" || value === "rd") {
    return "rd";
  }

  if (value === "europa" || value === "eu") {
    return "eu";
  }

  return "";
}

function getGalleryBlockTitle(item) {
  return String(
    getGalleryField(item, ["texto", "Texto", "actividad", "Actividad", "titulo", "Titulo"]) || "Actividad"
  ).trim() || "Actividad";
}

function getGalleryOrder(item, fallbackIndex) {
  const raw = Number(getGalleryField(item, ["orden", "Orden"]));
  return Number.isFinite(raw) ? raw : fallbackIndex + 1;
}

function createGalleryBlock(title, items) {
  const block = document.createElement("div");
  block.className = "gallery-activity-block";

  const heading = document.createElement("h3");
  heading.className = "gallery-activity-title";
  heading.textContent = title;
  block.appendChild(heading);

  const stack = document.createElement("div");
  stack.className = "gallery-stack-card";
  stack.setAttribute("role", "button");
  stack.setAttribute("tabindex", "0");
  stack.setAttribute("aria-label", `Abrir galería de ${title}`);

  const imageList = items.map(item => getGalleryPhotoUrl(item)).filter(Boolean);
  stack.dataset.images = JSON.stringify(imageList);
  stack.dataset.title = title;

  const previewImages = imageList.length >= 3
    ? imageList.slice(0, 3)
    : [...imageList, ...imageList].slice(0, Math.max(1, imageList.length));

  previewImages.forEach((src, index) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = title;
    img.loading = "lazy";
    img.className = `gallery-stack-photo stack-${Math.min(index + 1, 3)}`;
    stack.appendChild(img);
  });

  const overlay = document.createElement("div");
  overlay.className = "gallery-stack-overlay";
  overlay.innerHTML = `
    <span class="gallery-stack-label">Ver fotos</span>
    <span class="gallery-stack-count">${imageList.length} fotos</span>
  `;
  stack.appendChild(overlay);

  block.appendChild(stack);
  return block;
}

function renderGaleria(galeria) {
  const usa = document.getElementById("usa");
  const rd = document.getElementById("rd");
  const eu = document.getElementById("eu");

  if (!usa || !rd || !eu) {
    console.error("No se encontraron los contenedores de galería: #usa, #rd, #eu");
    return;
  }

  usa.innerHTML = "";
  rd.innerHTML = "";
  eu.innerHTML = "";

  const galeriasValidas = Array.isArray(galeria)
  ? galeria.filter(item => item && getGalleryPhotoUrl(item) && isGalleryItemActive(item))
  : [];

  console.log("Galería recibida:", galeriasValidas);

  const grouped = {
    usa: new Map(),
    rd: new Map(),
    eu: new Map()
  };

  galeriasValidas.forEach((item, index) => {
    const regionKey = getGalleryRegionKey(
  getGalleryField(item, ["categoria", "Categoria", "category"])
);
    if (!regionKey) {
      console.warn(
  "Categoría no reconocida:",
  getGalleryField(item, ["categoria", "Categoria", "category"])
);
      return;
    }

    const blockTitle = getGalleryBlockTitle(item);
    const blockKey = normalizeGalleryText(blockTitle) || `actividad-${index}`;

    if (!grouped[regionKey].has(blockKey)) {
      grouped[regionKey].set(blockKey, {
        title: blockTitle,
        order: getGalleryOrder(item, index),
        items: []
      });
    }

    grouped[regionKey].get(blockKey).items.push(item);
  });

  [
    { id: "usa", element: usa },
    { id: "rd", element: rd },
    { id: "eu", element: eu }
  ].forEach(region => {
    const blocks = Array.from(grouped[region.id].values())
      .sort((a, b) => a.order - b.order);

    blocks.forEach(blockData => {
      const block = createGalleryBlock(blockData.title, blockData.items);
      region.element.appendChild(block);
    });
  });

  document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
  document.querySelectorAll(".gallery-row").forEach(row => row.classList.remove("active"));

  const usaTab = document.querySelector('.tab[data-target="usa"]');
  const rdTab = document.querySelector('.tab[data-target="rd"]');
  const euTab = document.querySelector('.tab[data-target="eu"]');

  if (usa.children.length > 0) {
    usa.classList.add("active");
    usaTab?.classList.add("active");
  } else if (rd.children.length > 0) {
    rd.classList.add("active");
    rdTab?.classList.add("active");
  } else if (eu.children.length > 0) {
    eu.classList.add("active");
    euTab?.classList.add("active");
  } else {
    usa.classList.add("active");
    usaTab?.classList.add("active");
  }

  const prevBtn = document.getElementById("galleryPrev");
  const nextBtn = document.getElementById("galleryNext");
  if (prevBtn) prevBtn.style.display = "none";
  if (nextBtn) nextBtn.style.display = "none";

  requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    bindGalleryClicks();
  });
});
}

  /* -----------------------------------------
     INVITADAS DINÁMICAS
  ----------------------------------------- */
    function renderInvitees(invitees) {
    const grid = document.getElementById("inviteesTrack");
    if (!grid) return;

    const normalizedInvitees = Array.isArray(invitees)
      ? invitees.map(item => ({
          fotoUrl: getField(item, ["fotoUrl", "fotoURL", "FotoURL", "imagen", "image"]),
          nombre: getField(item, ["nombre", "Nombre", "name", "Name"], "Invitada"),
          titulo: getField(item, ["titulo", "Titulo", "title", "Title"], "")
        })).filter(item => item.fotoUrl)
      : [];

    if (!normalizedInvitees.length) {
      grid.innerHTML = "";
      updateInviteesCarousel();
      return;
    }

    grid.innerHTML = normalizedInvitees.map(item => `
  <div class="card"
       data-foto="${escapeHtml(item.fotoUrl)}"
       data-nombre="${escapeHtml(item.nombre)}"
       data-titulo="${escapeHtml(item.titulo)}">
    <img src="${escapeHtml(item.fotoUrl)}" alt="${escapeHtml(item.nombre)}">
    <h3>${escapeHtml(item.nombre)}</h3>
    <p class="invitee-title">${escapeHtml(item.titulo)}</p>
  </div>
`).join("");

    inviteesIndex = 0;

    const refresh = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          updateInviteesCarousel(false);
        });
      });
    };

      const images = grid.querySelectorAll("img");
    const inviteeCards = grid.querySelectorAll(".card");

    inviteeCards.forEach(card => {
      card.addEventListener("click", () => {
        if (inviteesMoved) {
          inviteesMoved = false;
          return;
        }

        openInviteeLightbox(
          card.dataset.foto || "",
          card.dataset.nombre || "",
          card.dataset.titulo || ""
        );
      });
    });

    images.forEach(img => {
      if (!img.complete) {
        img.addEventListener("load", refresh, { once: true });
      }
    });

    refresh();
    bindInviteesCarousel();
  }

  /* -----------------------------------------
     CARGAR DATOS DINÁMICOS
  ----------------------------------------- */
    async function loadDynamicContent() {
    try {
      const response = await fetch(DATA_URL, { cache: "no-store" });
      if (!response.ok) throw new Error("No se pudieron cargar los datos");

      const data = await response.json();
      console.log("Datos recibidos del Web App:", data);

            const invitadas = Array.isArray(data.invitadas)
        ? data.invitadas
        : Array.isArray(data.Invitadas)
          ? data.Invitadas
          : [];

      const galeria = Array.isArray(data.galeria)
        ? data.galeria
        : Array.isArray(data.Galeria)
          ? data.Galeria
          : [];

      const eventos = Array.isArray(data.eventos)
        ? data.eventos
        : Array.isArray(data.Eventos)
          ? data.Eventos
          : [];

      renderInvitees(invitadas);
      renderGaleria(galeria);
      renderEvents(eventos);
      renderContactCalendar(data);
    } catch (error) {
      console.error("Error cargando contenido dinámico:", error);
      renderEvents([]);
      renderInvitees([]);
      renderGaleria([]);
    }
  }

  /* -----------------------------------------
     TABS GALERÍA
  ----------------------------------------- */
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", function () {
      document.querySelector(".tab.active")?.classList.remove("active");
      tab.classList.add("active");

      document.querySelector(".gallery-row.active")?.classList.remove("active");
      const targetRow = document.getElementById(tab.dataset.target);
      targetRow?.classList.add("active");

      if (targetRow) {
        bindGalleryClicks();
      }
    });
  });

  /* -----------------------------------------
     REVEAL
  ----------------------------------------- */
  const revealElements = document.querySelectorAll(".reveal");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  revealElements.forEach(el => observer.observe(el));

  /* -----------------------------------------
     CERRAR CON ESC
  ----------------------------------------- */
    document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeMenu();
      if (joinModal?.classList.contains("open")) closeJoinModal();
      if (donateModal?.classList.contains("open")) closeDonateModal();
      if (lightbox?.classList.contains("open")) lightbox.classList.remove("open");
      if (inviteeLightbox?.classList.contains("open")) inviteeLightbox.classList.remove("open");
    }
  });

  /* -----------------------------------------
     CALENDARIO CONTACTO
  ----------------------------------------- */
function renderContactCalendar(apiData = {}) {
  const todayText = document.getElementById("calendarTodayText");
  const activitiesList = document.getElementById("todayActivitiesList");
  let nextActivityList = document.getElementById("nextActivityList");
  const birthdaysList = document.getElementById("todayBirthdaysList");

  if (!todayText || !activitiesList || !birthdaysList) return;

  if (!nextActivityList) {
    const activitiesBlock = activitiesList.closest(".calendar-block");

    if (activitiesBlock && activitiesBlock.parentElement) {
      const nextBlock = document.createElement("div");
      nextBlock.className = "calendar-block";
      nextBlock.innerHTML = `
        <h4>Próxima actividad</h4>
        <div id="nextActivityList" class="calendar-list"></div>
      `;

      activitiesBlock.insertAdjacentElement("afterend", nextBlock);
      nextActivityList = nextBlock.querySelector("#nextActivityList");
    }
  }

  const now = new Date();
  const dayOfWeek = now.getDay();

  todayText.textContent = now.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const rawEventos = Array.isArray(apiData.eventos)
    ? apiData.eventos
    : Array.isArray(apiData.Eventos)
      ? apiData.Eventos
      : [];

  const fallbackActivities = [
    {
      title: "Oración Matutina",
      schedule: "Lunes a Viernes · 5:00 AM",
      description: "Encuentro de oración por Google Meet."
    },
    {
      title: "Reunión Dominical",
      schedule: "Domingos · 16:00",
      description: "Reunión principal de la comunidad."
    },
    {
      title: "Reunión de la Comunidad Europea",
      schedule: "Viernes · 20:00",
      description: "Encuentro especial de la comunidad europea."
    },
    {
      title: "Propósito Kids",
      schedule: "Sábados · 20:00",
      description: "Actividad especial para niñas y familias."
    }
  ];

  const sourceActivities = rawEventos.length
    ? rawEventos.map(item => ({
        title: getField(item, ["title", "titulo", "Titulo", "nombre", "Nombre"], "Actividad"),
        schedule: getField(item, ["schedule", "horario", "Horario", "fecha", "Fecha"], "Próximamente"),
        description: getField(item, ["description", "descripcion", "Descripcion", "detalle", "Detalle"], "Actividad de Mujeres con Propósito.")
      }))
    : fallbackActivities;

  const dayMap = {
    domingo: 0,
    domingos: 0,
    lunes: 1,
    martes: 2,
    miercoles: 3,
    miércoles: 3,
    jueves: 4,
    viernes: 5,
    sabado: 6,
    sábado: 6,
    sabados: 6,
    sábados: 6
  };

  function normalizeScheduleText(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function parseEventDays(scheduleText) {
    const normalized = normalizeScheduleText(scheduleText);

    if (!normalized) return [];

    if (normalized.includes("lunes a viernes")) {
      return [1, 2, 3, 4, 5];
    }

    const matches = Object.entries(dayMap)
      .filter(([label]) => normalized.includes(label))
      .map(([, value]) => value);

    return [...new Set(matches)];
  }

  function extractEventTime(scheduleText) {
    const match = String(scheduleText || "").match(/(\d{1,2}:\d{2}\s?(?:AM|PM|am|pm)?)/);
    return match ? match[1].replace(/\s+/g, " ").trim() : "Próximamente";
  }

  function getNextActivity(itemDays = []) {
    if (!itemDays.length) return null;

    const sortedDays = [...itemDays].sort((a, b) => a - b);
    const sameOrNextDay = sortedDays.find(day => day >= dayOfWeek);
    const nextDay = sameOrNextDay != null ? sameOrNextDay : sortedDays[0];
    const distance = nextDay >= dayOfWeek
      ? nextDay - dayOfWeek
      : 7 - dayOfWeek + nextDay;

    return { nextDay, distance };
  }

  function getDayLabel(dayNumber) {
    const labels = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado"
    ];

    return labels[dayNumber] || "Próximamente";
  }

  const normalizedActivities = sourceActivities.map(item => {
    const schedule = item.schedule || "";
    const days = parseEventDays(schedule);
    const nextInfo = getNextActivity(days);

    return {
      title: item.title,
      schedule,
      time: extractEventTime(schedule),
      description: schedule
        ? `${schedule}${item.description ? ` · ${item.description}` : ""}`
        : (item.description || "Actividad de Mujeres con Propósito."),
      days,
      nextInfo
    };
  });

  const todayActivities = normalizedActivities.filter(item => item.days.includes(dayOfWeek));

  const upcomingActivities = normalizedActivities
    .filter(item => item.nextInfo)
    .filter(item => !item.days.includes(dayOfWeek))
    .sort((a, b) => {
      if (a.nextInfo.distance !== b.nextInfo.distance) {
        return a.nextInfo.distance - b.nextInfo.distance;
      }
      return a.time.localeCompare(b.time, undefined, { numeric: true, sensitivity: "base" });
    });

  const nextActivity = upcomingActivities[0] || null;

  activitiesList.innerHTML = todayActivities.length
    ? todayActivities.map(item => `
        <div class="calendar-item">
          <span class="calendar-item-time">${escapeHtml(item.time)}</span>
          <div class="calendar-item-title">${escapeHtml(item.title)}</div>
          <div class="calendar-item-desc">${escapeHtml(item.description)}</div>
        </div>
      `).join("")
    : '<div class="calendar-empty">No hay actividades programadas para hoy.</div>';

  if (nextActivityList) {
    nextActivityList.innerHTML = nextActivity
      ? `
          <div class="calendar-item">
            <span class="calendar-item-time">${escapeHtml(getDayLabel(nextActivity.nextInfo.nextDay))} · ${escapeHtml(nextActivity.time)}</span>
            <div class="calendar-item-title">${escapeHtml(nextActivity.title)}</div>
            <div class="calendar-item-desc">${escapeHtml(nextActivity.description)}</div>
          </div>
        `
      : '<div class="calendar-empty">No hay próximas actividades programadas.</div>';
  }

  const todayBirthdays = Array.isArray(apiData.cumpleanerasHoy)
    ? apiData.cumpleanerasHoy
    : [];

  birthdaysList.innerHTML = todayBirthdays.length
    ? todayBirthdays.map(person => `
        <div class="calendar-item">
          <div class="calendar-item-title">${escapeHtml(person.nombreCompleto || "Cumpleañera")}</div>
          <div class="calendar-item-desc">¡Hoy está de cumpleaños!</div>
        </div>
      `).join("")
    : '<div class="calendar-empty">No hay cumpleaños registrados para hoy.</div>';
}

  /* -----------------------------------------
     INIT
  ----------------------------------------- */

    window.addEventListener("resize", () => {
    if (window.innerWidth > 850) {
      closeMenu();
    }

    requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    bindGalleryClicks();
  });
});
    inviteesIndex = 0;
    eventsIndex = 0;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        updateInviteesCarousel(false);
        updateEventsCarousel(false);
      });
    });
  });
    /* -----------------------------------------
     SOUNDCLOUD MINI PLAYER
  ----------------------------------------- */
  function initSoundCloudPlayer() {
    const iframe = document.getElementById("soundcloudWidget");
    const trackList = document.getElementById("scTrackList");
    // Limitar altura del listado (estilo Spotify compacto)
    const title = document.getElementById("scCurrentTitle");
    const playBtn = document.getElementById("scPlayBtn");
    const prevBtn = document.getElementById("scPrevBtn");
    const nextBtn = document.getElementById("scNextBtn");

    if (!iframe || !trackList || !title || !playBtn || !prevBtn || !nextBtn || !window.SC) return;

    const widget = window.SC.Widget(iframe);
    let sounds = [];
    let current = 0;
    let playing = false;

    function updateTrackListViewport() {
      const isMobile = window.innerWidth <= 768;
      const maxVisibleTracks = isMobile ? 2 : 3;
      const estimatedRowHeight = isMobile ? 64 : 68;
      const hasScrollableList = sounds.length > maxVisibleTracks;

      trackList.style.paddingRight = hasScrollableList ? "6px" : "0";
      trackList.style.overflowY = hasScrollableList ? "auto" : "hidden";
      trackList.style.maxHeight = hasScrollableList
        ? `${maxVisibleTracks * estimatedRowHeight}px`
        : "none";

      trackList.classList.toggle("sc-list-scrollable", hasScrollableList);
      trackList.classList.toggle("sc-list-compact", !hasScrollableList);
    }

    function render() {
      updateTrackListViewport();
      trackList.innerHTML = sounds.length
        ? sounds.map((s, i) => `
            <div class="sc-track ${i === current ? "active" : ""}" data-i="${i}">
              <span>${i === current ? "▶" : "•"}</span>
              <span>${s.title}</span>
            </div>
          `).join("")
        : `<div class="sc-track-placeholder">No se encontraron audios.</div>`;

      trackList.querySelectorAll(".sc-track").forEach(el => {
        el.onclick = () => {
          current = Number(el.dataset.i);
          widget.skip(current);
          widget.play();
        };
      });
    }

    widget.bind(window.SC.Widget.Events.READY, () => {
      widget.getSounds(data => {
        sounds = Array.isArray(data) ? data : [];
        if (sounds.length) {
          title.textContent = sounds[0].title;
        }
        render();
      });
    });

    widget.bind(window.SC.Widget.Events.PLAY, () => {
      playing = true;
      playBtn.textContent = "❚❚";

      widget.getCurrentSound(s => {
        if (!s) return;
        title.textContent = s.title;
        const found = sounds.findIndex(x => x.id === s.id);
        if (found !== -1) current = found;
        render();
      });
    });

    widget.bind(window.SC.Widget.Events.PAUSE, () => {
      playing = false;
      playBtn.textContent = "▶";
    });

    playBtn.onclick = () => {
      playing ? widget.pause() : widget.play();
    };

    prevBtn.onclick = () => {
      if (!sounds.length) return;
      current = current > 0 ? current - 1 : sounds.length - 1;
      widget.skip(current);
      widget.play();
    };

    nextBtn.onclick = () => {
      if (!sounds.length) return;
      current = current < sounds.length - 1 ? current + 1 : 0;
      widget.skip(current);
      widget.play();
    };

    window.addEventListener("resize", () => {
      updateTrackListViewport();
    });
  }
/* -----------------------------------------
   ACCESO OCULTO: ADMIN + DASHBOARD
----------------------------------------- */
(function initHiddenPrivateAccess() {
  const ADMIN_URL = "https://script.google.com/macros/s/AKfycbzjwwI0-ltt-BZv1FbymmLtikDR9UevoQjRYIUrKthpDCBlVEPZFCbccPTvQUG5zvuGMg/exec?admin=1";
  const DASHBOARD_URL = "dashboard.html";
  const ACCESS_PASSWORD = "MCP2025Segura";
  const footer = document.querySelector("footer");

  let footerTapCount = 0;
  let footerTapTimer = null;
  let holdTimer = null;
  let holdTriggered = false;
  let typedSequence = "";
  let sequenceTimer = null;
  const secretSequence = "mcpadmin";

  function openPrivateAccess() {
    const modal = document.createElement("div");
    modal.style.position = "fixed";
    modal.style.inset = "0";
    modal.style.background = "rgba(45, 28, 28, 0.42)";
    modal.style.backdropFilter = "blur(10px)";
    modal.style.webkitBackdropFilter = "blur(10px)";
    modal.style.display = "flex";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
    modal.style.padding = "20px";
    modal.style.zIndex = "10000";

    modal.innerHTML = `
      <div style="
        width:100%;
        max-width:460px;
        border-radius:28px;
        padding:28px 24px 22px;
        background:linear-gradient(135deg, rgba(255,255,255,0.96), rgba(255,247,246,0.92));
        border:1px solid rgba(255,255,255,0.72);
        box-shadow:0 20px 45px rgba(0,0,0,0.18);
        text-align:center;
        position:relative;
        overflow:hidden;
      ">
        <div style="
          position:absolute;
          inset:0;
          background:
            radial-gradient(circle at top left, rgba(231,168,160,0.16), transparent 38%),
            radial-gradient(circle at bottom right, rgba(243,213,209,0.22), transparent 34%);
          pointer-events:none;
        "></div>

        <div style="position:relative; z-index:1;">
          <div style="
            width:72px;
            height:72px;
            margin:0 auto 16px;
            border-radius:24px;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:32px;
            background:linear-gradient(135deg, #e7a8a0, #f3d5d1);
            color:#fff;
            box-shadow:0 12px 28px rgba(176,95,95,0.20);
          ">🔐</div>

          <h3 style="
            margin:0 0 8px;
            font-size:28px;
            line-height:1.15;
            color:#b05f5f;
            font-weight:800;
          ">Acceso privado</h3>

          <p style="
            margin:0 0 18px;
            color:#7a5b5b;
            font-size:14px;
            line-height:1.5;
          ">Introduce tu contraseña para entrar al área privada.</p>

          <input
            id="privateAccessInput"
            type="password"
            placeholder="Contraseña"
            style="
              width:100%;
              height:52px;
              padding:0 16px;
              border-radius:16px;
              border:1px solid rgba(231,168,160,0.34);
              background:rgba(255,255,255,0.86);
              color:#4f3d3d;
              font-size:15px;
              outline:none;
              box-shadow:inset 0 1px 0 rgba(255,255,255,0.7);
              margin-bottom:10px;
              box-sizing:border-box;
            "
          >

          <div id="privateAccessError" style="
            min-height:20px;
            margin-bottom:14px;
            font-size:13px;
            font-weight:700;
            color:#c95c5c;
          "></div>

          <div style="
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:10px;
            margin-bottom:10px;
          ">
            <button
              id="openAdminBtn"
              type="button"
              style="
                height:50px;
                border:none;
                border-radius:16px;
                background:linear-gradient(135deg, #e7a8a0, #d98f87);
                color:#fff;
                font-size:15px;
                font-weight:800;
                cursor:pointer;
                box-shadow:0 10px 22px rgba(176,95,95,0.20);
              "
            >Admin</button>

            <button
              id="openDashboardBtn"
              type="button"
              style="
                height:50px;
                border:none;
                border-radius:16px;
                background:linear-gradient(135deg, #d9a6a0, #c98b84);
                color:#fff;
                font-size:15px;
                font-weight:800;
                cursor:pointer;
                box-shadow:0 10px 22px rgba(176,95,95,0.20);
              "
            >Dashboard</button>
          </div>

          <button
            id="privateCancelBtn"
            type="button"
            style="
              width:100%;
              height:46px;
              border:none;
              border-radius:16px;
              background:rgba(255,255,255,0.88);
              color:#8d6666;
              font-size:15px;
              font-weight:700;
              cursor:pointer;
              box-shadow:inset 0 0 0 1px rgba(231,168,160,0.18);
            "
          >Cancelar</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = "hidden";

    const input = modal.querySelector("#privateAccessInput");
    const errorText = modal.querySelector("#privateAccessError");
    const adminBtn = modal.querySelector("#openAdminBtn");
    const dashboardBtn = modal.querySelector("#openDashboardBtn");
    const cancelBtn = modal.querySelector("#privateCancelBtn");

    input.focus();

    function closeModal() {
      document.body.style.overflow = "";
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    }

    function validateAndOpen(targetUrl) {
      const password = input.value;

      if (password !== ACCESS_PASSWORD) {
        input.value = "";
        errorText.textContent = "Contraseña incorrecta. Inténtalo de nuevo.";
        input.focus();
        return;
      }

      closeModal();
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    cancelBtn.onclick = closeModal;
    adminBtn.onclick = () => validateAndOpen(ADMIN_URL);
    dashboardBtn.onclick = () => validateAndOpen(DASHBOARD_URL);

    input.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeModal();
      }
    });
  }

  function resetFooterTaps() {
    footerTapCount = 0;
    if (footerTapTimer) {
      clearTimeout(footerTapTimer);
      footerTapTimer = null;
    }
  }

  function startFooterHold() {
    holdTriggered = false;
    clearTimeout(holdTimer);
    holdTimer = setTimeout(() => {
      holdTriggered = true;
      resetFooterTaps();
      openPrivateAccess();
    }, 1400);
  }

  function stopFooterHold() {
    clearTimeout(holdTimer);
  }

  if (footer) {
    footer.addEventListener("click", () => {
      if (holdTriggered) {
        holdTriggered = false;
        return;
      }

      footerTapCount += 1;

      if (footerTapTimer) {
        clearTimeout(footerTapTimer);
      }

      footerTapTimer = setTimeout(() => {
        footerTapCount = 0;
      }, 1800);

      if (footerTapCount >= 3) {
        resetFooterTaps();
        openPrivateAccess();
      }
    });

    footer.addEventListener("mousedown", startFooterHold);
    footer.addEventListener("touchstart", startFooterHold, { passive: true });

    footer.addEventListener("mouseup", stopFooterHold);
    footer.addEventListener("mouseleave", stopFooterHold);
    footer.addEventListener("touchend", stopFooterHold);
    footer.addEventListener("touchcancel", stopFooterHold);

    footer.addEventListener("dblclick", (e) => {
      e.preventDefault();
      resetFooterTaps();
      openPrivateAccess();
    });

    footer.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      resetFooterTaps();
      openPrivateAccess();
    });
  }

  document.addEventListener("keydown", (e) => {
    const activeTag = document.activeElement?.tagName || "";
    const isTypingField = ["INPUT", "TEXTAREA", "SELECT"].includes(activeTag);
    if (isTypingField) return;

    if (e.key.length !== 1) return;

    typedSequence += e.key.toLowerCase();

    if (!secretSequence.startsWith(typedSequence)) {
      typedSequence = e.key.toLowerCase() === secretSequence[0] ? secretSequence[0] : "";
    }

    if (typedSequence === secretSequence) {
      typedSequence = "";
      openPrivateAccess();
      return;
    }

    clearTimeout(sequenceTimer);
    sequenceTimer = setTimeout(() => {
      typedSequence = "";
    }, 1800);
  });
})();

/* -----------------------------------------
   FORMULARIO CONTACTO
----------------------------------------- */
const contactForm = document.getElementById("contactForm");

if (contactForm) {
  contactForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const btn = document.getElementById("cSubmitBtn");
    const msg = document.getElementById("contactMsg");

    if (!btn || !msg) return;

    btn.disabled = true;
    btn.textContent = "Enviando...";
    msg.textContent = "";
    msg.style.color = "";

    const payload = {
      action: "contact",
      destino: CONTACT_EMAIL,
      nombre: document.getElementById("cNombre")?.value.trim() || "",
      email: document.getElementById("cEmail")?.value.trim() || "",
      mensaje: document.getElementById("cMensaje")?.value.trim() || ""
    };

    try {
      const response = await fetch(DATA_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Error enviando mensaje.");
      }

      msg.textContent = "Mensaje enviado correctamente. Gracias 💛";
      msg.style.color = "green";
      contactForm.reset();
    } catch (error) {
      msg.textContent = error.message || "Error enviando mensaje.";
      msg.style.color = "red";
    } finally {
      btn.disabled = false;
      btn.textContent = "Enviar";
    }
  });
}

initSoundCloudPlayer();
loadDynamicContent();
});
