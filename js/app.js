"use strict";

/**
 * =========================================================
 * BIBLIOKASA
 * Application JavaScript commune
 * =========================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    initializeApp();
});


/**
 * =========================================================
 * CONFIGURATION
 * =========================================================
 */

const APP_CONFIG = {
    storageKeys: {
        theme: "bibliokasa-theme"
    },

    themes: {
        system: "system",
        light: "light",
        dark: "dark"
    }
};


/**
 * =========================================================
 * INITIALISATION
 * =========================================================
 */

function initializeApp() {
    initializeMobileMenu();
    initializeTheme();
    initializeNotifications();
    initializeBackToTop();
    initializeSystemStatus();
    initializeActiveNavigation();
}


/**
 * =========================================================
 * MENU MOBILE
 * =========================================================
 */

function initializeMobileMenu() {
    const menuButton = document.getElementById("mobileMenuBtn");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");

    if (!menuButton || !sidebar || !overlay) {
        return;
    }

    menuButton.addEventListener("click", () => {
        const isOpen = sidebar.classList.toggle("open");

        overlay.classList.toggle("active", isOpen);

        menuButton.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

        menuButton.setAttribute(
            "aria-label",
            isOpen
                ? "Fermer le menu"
                : "Ouvrir le menu"
        );

        document.body.classList.toggle(
            "menu-open",
            isOpen
        );
    });


    overlay.addEventListener("click", () => {
        closeMobileMenu();
    });


    const navigationLinks = sidebar.querySelectorAll(
        ".nav-link"
    );

    navigationLinks.forEach((link) => {
        link.addEventListener("click", () => {
            closeMobileMenu();
        });
    });


    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMobileMenu();
        }
    });


    window.addEventListener("resize", () => {
        if (window.innerWidth > 900) {
            closeMobileMenu();
        }
    });


    function closeMobileMenu() {
        sidebar.classList.remove("open");
        overlay.classList.remove("active");

        menuButton.setAttribute(
            "aria-expanded",
            "false"
        );

        menuButton.setAttribute(
            "aria-label",
            "Ouvrir le menu"
        );

        document.body.classList.remove("menu-open");
    }
}


/**
 * =========================================================
 * THÈME
 * =========================================================
 *
 * Valeurs possibles :
 *
 * system → utilise le thème du système
 * light  → mode clair
 * dark   → mode sombre
 *
 * Le choix est sauvegardé dans localStorage.
 */

function initializeTheme() {
    const themeButton = document.getElementById("themeToggle");

    if (!themeButton) {
        return;
    }

    const savedTheme = getSavedTheme();

    applyTheme(savedTheme);

    themeButton.addEventListener("click", () => {
        const currentTheme = getSavedTheme();

        const nextTheme = getNextTheme(currentTheme);

        saveTheme(nextTheme);
        applyTheme(nextTheme);
    });


    const systemTheme = window.matchMedia(
        "(prefers-color-scheme: dark)"
    );


    systemTheme.addEventListener("change", () => {
        if (getSavedTheme() === APP_CONFIG.themes.system) {
            applyTheme(APP_CONFIG.themes.system);
        }
    });
}


/**
 * Récupère le thème sauvegardé.
 */

function getSavedTheme() {
    const savedTheme = localStorage.getItem(
        APP_CONFIG.storageKeys.theme
    );

    if (
        savedTheme === APP_CONFIG.themes.light ||
        savedTheme === APP_CONFIG.themes.dark ||
        savedTheme === APP_CONFIG.themes.system
    ) {
        return savedTheme;
    }

    return APP_CONFIG.themes.system;
}


/**
 * Sauvegarde le thème.
 */

function saveTheme(theme) {
    localStorage.setItem(
        APP_CONFIG.storageKeys.theme,
        theme
    );
}


/**
 * Détermine le prochain thème.
 *
 * system → light
 * light  → dark
 * dark   → system
 */

function getNextTheme(theme) {
    switch (theme) {
        case APP_CONFIG.themes.system:
            return APP_CONFIG.themes.light;

        case APP_CONFIG.themes.light:
            return APP_CONFIG.themes.dark;

        case APP_CONFIG.themes.dark:
            return APP_CONFIG.themes.system;

        default:
            return APP_CONFIG.themes.system;
    }
}


/**
 * Applique le thème.
 */

function applyTheme(theme) {
    const root = document.documentElement;

    root.removeAttribute("data-theme");

    if (theme === APP_CONFIG.themes.light) {
        root.setAttribute("data-theme", "light");
    }

    if (theme === APP_CONFIG.themes.dark) {
        root.setAttribute("data-theme", "dark");
    }

    updateThemeButton(theme);
}


/**
 * Met à jour l'accessibilité du bouton de thème.
 */

function updateThemeButton(theme) {
    const themeButton = document.getElementById(
        "themeToggle"
    );

    if (!themeButton) {
        return;
    }

    const labels = {
        system: "Thème système",
        light: "Thème clair",
        dark: "Thème sombre"
    };

    const currentLabel =
        labels[theme] || labels.system;

    themeButton.setAttribute(
        "aria-label",
        `${currentLabel}. Cliquer pour changer le thème.`
    );

    themeButton.setAttribute(
        "title",
        currentLabel
    );
}


/**
 * =========================================================
 * NAVIGATION ACTIVE
 * =========================================================
 */

function initializeActiveNavigation() {
    const navigationLinks = document.querySelectorAll(
        ".nav-link"
    );

    if (!navigationLinks.length) {
        return;
    }

    const currentPage = getCurrentPage();

    navigationLinks.forEach((link) => {
        const linkPage = getPageFromUrl(
            link.getAttribute("href")
        );

        const isCurrentPage =
            linkPage === currentPage;

        link.classList.toggle(
            "active",
            isCurrentPage
        );

        if (isCurrentPage) {
            link.setAttribute(
                "aria-current",
                "page"
            );
        } else {
            link.removeAttribute(
                "aria-current"
            );
        }
    });
}


/**
 * Retourne le nom de la page actuelle.
 */

function getCurrentPage() {
    const pathname = window.location.pathname;

    const page = pathname
        .split("/")
        .pop();

    return page || "index.html";
}


/**
 * Extrait le nom de page d'une URL.
 */

function getPageFromUrl(url) {
    if (!url) {
        return "";
    }

    return url
        .split("/")
        .pop()
        .split("?")[0]
        .split("#")[0];
}


/**
 * =========================================================
 * NOTIFICATIONS
 * =========================================================
 */

function initializeNotifications() {
    const notificationButton =
        document.getElementById("notificationBtn");

    const notificationBadge =
        document.getElementById("notificationBadge");

    if (!notificationButton || !notificationBadge) {
        return;
    }

    const notificationCount =
        getNotificationCount();

    updateNotificationBadge(
        notificationCount
    );


    notificationButton.addEventListener(
        "click",
        () => {
            handleNotifications();
        }
    );
}


/**
 * Nombre de notifications initial.
 *
 * Plus tard, cette valeur viendra de l'API.
 */

function getNotificationCount() {
    return 0;
}


/**
 * Met à jour le badge.
 */

function updateNotificationBadge(count) {
    const badge =
        document.getElementById("notificationBadge");

    if (!badge) {
        return;
    }

    const safeCount = Math.max(
        0,
        Number(count) || 0
    );

    badge.textContent =
        safeCount > 99
            ? "99+"
            : String(safeCount);

    badge.hidden = safeCount === 0;
}


/**
 * Gestion provisoire des notifications.
 *
 * Cette fonction sera reliée à l'API
 * lorsque le backend sera disponible.
 */

function handleNotifications() {
    const notificationButton =
        document.getElementById("notificationBtn");

    if (!notificationButton) {
        return;
    }

    notificationButton.setAttribute(
        "aria-expanded",
        "true"
    );

    /*
     * Aucun panneau de notification n'est
     * encore créé dans l'interface.
     *
     * Nous l'ajouterons lorsque les données
     * réelles du backend seront disponibles.
     */
}


/**
 * =========================================================
 * RETOUR EN HAUT
 * =========================================================
 */

function initializeBackToTop() {
    const backToTop =
        document.querySelector(".back-to-top");

    if (!backToTop) {
        return;
    }

    updateBackToTopVisibility();


    window.addEventListener(
        "scroll",
        updateBackToTopVisibility,
        { passive: true }
    );
}


/**
 * Affiche ou masque le bouton retour en haut.
 */

function updateBackToTopVisibility() {
    const backToTop =
        document.querySelector(".back-to-top");

    if (!backToTop) {
        return;
    }

    const shouldShow =
        window.scrollY > 350;

    backToTop.classList.toggle(
        "visible",
        shouldShow
    );
}


/**
 * =========================================================
 * ÉTAT DU SYSTÈME
 * =========================================================
 */

function initializeSystemStatus() {
    const systemStatus =
        document.getElementById("systemStatus");

    if (!systemStatus) {
        return;
    }

    systemStatus.textContent =
        "Interface opérationnelle";
}


/**
 * =========================================================
 * OUTILS POUR LES FUTURES PAGES
 * =========================================================
 *
 * Ces fonctions seront réutilisées par :
 *
 * livres.js
 * membres.js
 * emprunts.js
 * admin.js
 *
 * Elles évitent de répéter du code.
 */


/**
 * Formate une date au format français.
 */

function formatDate(dateValue) {
    if (!dateValue) {
        return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat(
        "fr-FR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    ).format(date);
}


/**
 * Formate une date avec l'heure.
 */

function formatDateTime(dateValue) {
    if (!dateValue) {
        return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat(
        "fr-FR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    ).format(date);
}


/**
 * Échappe le HTML provenant de données externes.
 *
 * Important lorsque les données viendront
 * de l'API PostgreSQL.
 */

function escapeHtml(value) {
    if (value === null || value === undefined) {
        return "";
    }

    const element =
        document.createElement("div");

    element.textContent = String(value);

    return element.innerHTML;
}


/**
 * Affiche un état vide dans un conteneur.
 */

function renderEmptyState(
    container,
    message = "Aucune donnée disponible."
) {
    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="empty-state">
            <span class="empty-icon">
                <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
            </span>

            <strong>
                ${escapeHtml(message)}
            </strong>

            <span>
                Les informations apparaîtront ici.
            </span>
        </div>
    `;
}


/**
 * Affiche un message d'erreur générique.
 */

function renderErrorState(
    container,
    message = "Une erreur est survenue."
) {
    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="empty-state">
            <span class="empty-icon">
                <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
            </span>

            <strong>
                Impossible de charger les données
            </strong>

            <span>
                ${escapeHtml(message)}
            </span>
        </div>
    `;
}


/**
 * =========================================================
 * API PUBLIQUE
 * =========================================================
 *
 * Les futurs fichiers JS peuvent utiliser
 * ces fonctions sans les redéfinir.
 */

window.BiblioKasa = {
    formatDate,
    formatDateTime,
    escapeHtml,
    renderEmptyState,
    renderErrorState,

    getSavedTheme,
    saveTheme,
    applyTheme,

    updateNotificationBadge
};