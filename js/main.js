/* ============================================================
   Braxton-style Portfolio — interactions
   Theme, mobile menu, smooth scroll, scrollspy,
   GSAP reveals, stat counters, contact form
   ============================================================ */
(function () {
  "use strict";

  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- Theme (persisted) ---------- */
  const THEME_KEY = "portfolio-theme";
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) root.setAttribute("data-theme", savedTheme);

  // Soporta varios botones de tema (escritorio + barra móvil)
  $$(".theme-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      localStorage.setItem(THEME_KEY, next);
    });
  });

  /* ---------- Mobile menu ---------- */
  const sidebar = $("#sidebar");
  const backdrop = $("#backdrop");
  const openMenu = () => { sidebar.classList.add("open"); backdrop.classList.add("show"); $("#menuToggle")?.setAttribute("aria-expanded", "true"); };
  const closeMenu = () => { sidebar.classList.remove("open"); backdrop.classList.remove("show"); $("#menuToggle")?.setAttribute("aria-expanded", "false"); };

  $("#menuToggle")?.addEventListener("click", openMenu);
  $("#menuClose")?.addEventListener("click", closeMenu);
  backdrop?.addEventListener("click", closeMenu);

  /* ---------- Smooth scroll + close menu on nav ---------- */
  $$("[data-scroll]").forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (!id || !id.startsWith("#")) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      closeMenu();
    });
  });

  /* ---------- Scrollspy (active nav link) ---------- */
  const navLinks = $$(".nav-link");
  const sections = navLinks
    .map((l) => $(l.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            navLinks.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + entry.target.id));
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Footer year ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Contact form ---------- */
  const form = $("#contactForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      // Abre el cliente de correo del visitante con el mensaje dirigido a tu email
      const name = $("#name").value.trim();
      const email = $("#email").value.trim();
      const message = $("#message").value.trim();
      const subject = encodeURIComponent("Nuevo mensaje de " + name + " (portfolio)");
      const body = encodeURIComponent(
        "Nombre: " + name + "\nEmail: " + email + "\n\n" + message
      );
      window.location.href =
        "mailto:carlotaroga00@gmail.com?subject=" + subject + "&body=" + body;

      const success = $("#formSuccess");
      success.hidden = false;
      form.reset();
      if (window.gsap) gsap.fromTo(success, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.5 });
      setTimeout(() => { success.hidden = true; }, 6000);
    });
  }

  /* ---------- GSAP animations ---------- */
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (window.gsap && !reduceMotion) {
    document.body.classList.add("js-ready");
    gsap.registerPlugin(ScrollTrigger);

    // Hero: reveal on load (no ScrollTrigger, avoids it staying hidden)
    gsap.to(".hero .reveal", {
      opacity: 1,
      y: 0,
      duration: 0.9,
      stagger: 0.12,
      ease: "power3.out",
      delay: 0.15,
    });

    // Everything else: reveal on scroll
    $$(".reveal").forEach((el) => {
      if (el.closest(".hero")) return; // hero handled above
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
      });
    });

    // Animated stat counters
    $$(".stat-num").forEach((el) => {
      const target = parseInt(el.dataset.count, 10) || 0;
      const obj = { val: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            val: target,
            duration: 1.6,
            ease: "power2.out",
            onUpdate: () => { el.textContent = Math.round(obj.val); },
          });
        },
      });
    });

    // Subtle parallax on background glows
    gsap.to(".glow--1", { yPercent: 18, ease: "none", scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: 1 } });
    gsap.to(".glow--3", { yPercent: -22, ease: "none", scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: 1 } });
  }

  /* ---------- Hero: gradiente que sigue al cursor + ondas de color ---------- */
  const hero = $("#home");
  if (hero) {
    const fx = document.createElement("div");
    fx.className = "hero-fx";
    hero.prepend(fx);

    let lastRipple = 0;
    hero.addEventListener("pointermove", (e) => {
      const rect = hero.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Gradiente suave que sigue al cursor
      fx.style.setProperty("--mx", x + "px");
      fx.style.setProperty("--my", y + "px");
      fx.classList.add("active");
      // Ondas: una nueva cada ~90ms (desactivadas con reduce-motion)
      if (!reduceMotion && e.timeStamp - lastRipple > 90) {
        lastRipple = e.timeStamp;
        const r = document.createElement("span");
        r.className = "ripple";
        r.style.left = x + "px";
        r.style.top = y + "px";
        fx.appendChild(r);
        r.addEventListener("animationend", () => r.remove());
      }
    });
    hero.addEventListener("pointerleave", () => fx.classList.remove("active"));
  }
})();
