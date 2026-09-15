// Antipa Dentistry / Зубна Фея — prototype interactivity (frontend-only demo).
(function () {
  "use strict";

  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  // ---------------------------------------------------------------- mobile nav
  function initMobileNav() {
    var btn = qs("#mobile-menu-btn");
    var nav = qs("#mobile-nav");
    if (!btn || !nav) return;
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.classList.toggle("open", open);
      document.body.style.overflow = open ? "hidden" : "";
    });
    qsa("a", nav).forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        btn.classList.remove("open");
        document.body.style.overflow = "";
      });
    });
  }

  // ---------------------------------------------------------------- custom select
  function initSelects(ctx) {
    qsa(".select", ctx).forEach(function (sel) {
      if (sel.dataset.bound) return;
      sel.dataset.bound = "1";
      var trigger = qs(".select-trigger", sel);
      var valueEl = qs(".select-value", sel);
      var hidden = qs('input[type="hidden"]', sel);
      var options = qsa(".select-option", sel);

      trigger.addEventListener("click", function (e) {
        e.stopPropagation();
        qsa(".select.open").forEach(function (o) { if (o !== sel) o.classList.remove("open"); });
        sel.classList.toggle("open");
      });

      options.forEach(function (opt) {
        opt.addEventListener("click", function () {
          options.forEach(function (o) { o.classList.remove("selected"); });
          opt.classList.add("selected");
          valueEl.textContent = opt.textContent;
          valueEl.classList.remove("placeholder");
          hidden.value = opt.dataset.value;
          sel.classList.remove("open");
          sel.dispatchEvent(new CustomEvent("select-change", { bubbles: true }));
          var field = sel.closest(".field");
          if (field) field.classList.remove("error");
        });
      });
    });

    document.addEventListener("click", function () {
      qsa(".select.open").forEach(function (o) { o.classList.remove("open"); });
    });
  }

  function setSelectValue(selectEl, value) {
    if (!selectEl) return;
    var opt = qsa(".select-option", selectEl).filter(function (o) { return o.dataset.value === value; })[0];
    if (!opt) return;
    opt.click();
  }

  // ---------------------------------------------------------------- accordion
  function initAccordion() {
    qsa(".accordion-item").forEach(function (item) {
      var trigger = qs(".accordion-trigger", item);
      var panel = qs(".accordion-panel", item);
      if (!trigger || !panel) return;
      trigger.addEventListener("click", function () {
        var isOpen = item.classList.contains("open");
        item.classList.toggle("open", !isOpen);
        panel.style.maxHeight = isOpen ? "0px" : panel.scrollHeight + "px";
      });
    });
  }

  // ---------------------------------------------------------------- filter chips (doctors / services)
  function initFilters() {
    qsa(".doctor-filter").forEach(function (bar) {
      var grid = bar.nextElementSibling;
      if (!grid) return;
      var chips = qsa(".chip", bar);
      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          chips.forEach(function (c) { c.classList.remove("active"); });
          chip.classList.add("active");
          var f = chip.dataset.filter;
          qsa(".filter-item", grid).forEach(function (item) {
            var tags = (item.dataset.tags || "").split(" ");
            item.style.display = (f === "all" || tags.indexOf(f) !== -1) ? "" : "none";
          });
        });
      });
    });
  }

  // ---------------------------------------------------------------- price tabs
  function initTabs() {
    qsa(".tabs").forEach(function (tabs) {
      var buttons = qsa(".tab-btn", tabs);
      var panels = qsa(".price-panel", tabs.parentElement);
      buttons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          buttons.forEach(function (b) { b.classList.remove("active"); });
          panels.forEach(function (p) { p.classList.remove("active"); });
          btn.classList.add("active");
          var target = panels.filter(function (p) { return p.dataset.panel === btn.dataset.tab; })[0];
          if (target) target.classList.add("active");
        });
      });
    });
  }

  // ---------------------------------------------------------------- generic modal
  function initModals() {
    qsa("[data-open-modal]").forEach(function (trigger) {
      trigger.addEventListener("click", function (e) {
        var id = trigger.getAttribute("data-open-modal");
        var modal = document.getElementById(id);
        if (!modal) return;
        e.preventDefault();
        modal.classList.add("open");
      });
    });
    qsa(".modal-overlay").forEach(function (overlay) {
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) overlay.classList.remove("open");
      });
      qsa("[data-close-modal]", overlay).forEach(function (btn) {
        btn.addEventListener("click", function () { overlay.classList.remove("open"); });
      });
    });
  }

  // ---------------------------------------------------------------- like / heart widget (replaces star rating)
  function initLikeWidgets() {
    qsa(".like-widget").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var liked = btn.classList.toggle("liked");
        if (btn.dataset.mode === "counter") {
          var base = parseInt(btn.dataset.count, 10) || 0;
          var countEl = qs(".like-count", btn);
          if (countEl) countEl.textContent = liked ? base + 1 : base;
        } else {
          var labelEl = qs(".like-label", btn);
          var defaultLabel = btn.dataset.defaultLabel || "";
          var likedLabel = btn.dataset.likedLabel || defaultLabel;
          if (labelEl) labelEl.textContent = liked ? likedLabel : defaultLabel;
          btn.setAttribute("aria-label", liked ? likedLabel : defaultLabel);
        }
      });
    });
  }

  // ---------------------------------------------------------------- form validation helpers
  function validateField(field) {
    var input = qs("input:not([type=hidden]):not([type=checkbox]), textarea", field);
    var hidden = qs('input[type="hidden"]', field);
    var required = (input && input.hasAttribute("required")) || (hidden && hidden.hasAttribute("required"));
    var value = input ? input.value.trim() : (hidden ? hidden.value : "");
    var ok = !required || value.length > 0;
    field.classList.toggle("error", !ok);
    return ok;
  }

  function validatePanel(panel) {
    var ok = true;
    qsa(".field", panel).forEach(function (f) { if (!validateField(f)) ok = false; });
    var radios = qsa('input[type="radio"]', panel);
    if (radios.length) {
      var group = radios[0].name;
      var checked = radios.some(function (r) { return r.checked; });
      if (!checked) ok = false;
    }
    var consent = qs('input[type="checkbox"][required]', panel);
    if (consent && !consent.checked) ok = false;
    return ok;
  }

  // ---------------------------------------------------------------- radio-row visuals
  function initRadioRows() {
    qsa(".radio-row").forEach(function (row) {
      var input = qs('input[type="radio"]', row);
      if (!input) return;
      input.addEventListener("change", function () {
        var name = input.name;
        qsa('.radio-row [data-radio-name], .radio-row').forEach(function () {});
        qsa('input[name="' + name + '"]').forEach(function (r) {
          var rrow = r.closest(".radio-row");
          if (rrow) rrow.classList.toggle("checked", r.checked);
        });
      });
    });
  }

  // ---------------------------------------------------------------- booking multi-step
  function initBooking() {
    var form = qs("#booking-form");
    if (!form) return;
    var panels = qsa(".booking-panel", form);
    var order = panels.map(function (p) { return p.dataset.panel; });
    var pills = qsa("[data-step-pill]");
    var success = qs("#booking-success");
    var summaryEl = qs("#booking-summary");
    var current = 0;

    // preselect from query string
    var params = new URLSearchParams(window.location.search);
    ["service", "doctor"].forEach(function (key) {
      var val = params.get(key);
      if (!val) return;
      var selectEl = qs('.select[data-name="' + key + '"]');
      if (selectEl) setSelectValue(selectEl, val);
    });

    function updatePills() {
      pills.forEach(function (pill, i) {
        pill.classList.toggle("active", i === current);
        pill.classList.toggle("done", i < current);
      });
    }

    function showPanel(i) {
      panels.forEach(function (p, idx) { p.classList.toggle("active", idx === i); });
      current = i;
      updatePills();
      updateSummary();
    }

    function updateSummary() {
      if (!summaryEl) return;
      var bits = [];
      panels.forEach(function (p) {
        if (!p.classList.contains("active") && p.dataset.panel !== order[current]) {}
        var sel = qs(".select .select-value", p);
        if (sel && !sel.classList.contains("placeholder")) {
          bits.push("<span><b>" + (qs("h3", p) ? qs("h3", p).textContent : "") + ":</b> " + sel.textContent + "</span>");
        }
        var radio = qs('input[type="radio"]:checked', p);
        if (radio) {
          var lbl = radio.closest(".radio-row");
          bits.push("<span><b>" + (qs("h3", p) ? qs("h3", p).textContent : "") + ":</b> " + (lbl ? lbl.textContent.trim() : radio.value) + "</span>");
        }
      });
      summaryEl.innerHTML = bits.join("");
    }

    qsa(".js-next", form).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var panel = panels[current];
        if (!validatePanel(panel)) return;
        if (current < panels.length - 1) showPanel(current + 1);
      });
    });
    qsa(".js-back", form).forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (current > 0) showPanel(current - 1);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var panel = panels[current];
      if (!validatePanel(panel)) return;
      form.style.display = "none";
      if (success) success.classList.add("show");
    });

    showPanel(0);
  }

  // ---------------------------------------------------------------- simple contact form
  function initContactForm() {
    var wrap = qs("#page-contact-form");
    if (!wrap) return;
    var form = qs("form.contact-form", wrap);
    var success = qs("#contact-success", wrap);
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      qsa(".field", form).forEach(function (f) { if (!validateField(f)) ok = false; });
      var consent = qs('input[type="checkbox"][required]', form);
      if (consent && !consent.checked) ok = false;
      if (!ok) return;
      form.style.display = "none";
      if (success) success.classList.add("show");
    });
  }

  // ---------------------------------------------------------------- children location selector
  var LOC_KEY = "antipaLocation";

  function initLocationSelector() {
    qsa(".js-select-location").forEach(function (card) {
      card.addEventListener("click", function () {
        var data = { slug: card.dataset.slug, name: card.dataset.name };
        try { localStorage.setItem(LOC_KEY, JSON.stringify(data)); } catch (err) {}
        window.location.href = "home.html";
      });
    });
  }

  function initLocationPill() {
    var pill = qs("#location-pill");
    var mnLabel = qs("#mn-location-label");
    var label = pill ? qs("#location-pill-label", pill) : null;
    try {
      var raw = localStorage.getItem(LOC_KEY);
      if (raw) {
        var data = JSON.parse(raw);
        if (data && data.name) {
          if (label) label.textContent = data.name;
          if (mnLabel) mnLabel.textContent = data.name;
        }
      }
    } catch (err) {}
    if (pill) {
      pill.addEventListener("click", function () {
        var href = pill.getAttribute("data-change-href");
        if (href) window.location.href = href;
      });
    }
  }

  // ---------------------------------------------------------------- RU disclaimer (Law on Language, Art. 30)
  function initRuDisclaimer() {
    var overlay = qs("#ru-disclaimer");
    if (!overlay) return;
    var uaHref = overlay.getAttribute("data-ua-href");
    var seconds = parseInt(overlay.getAttribute("data-seconds"), 10) || 30;
    var countEl = qs("#ru-disclaimer-count", overlay);
    var stayBtn = qs("#ru-disclaimer-stay", overlay);
    overlay.classList.add("show");
    var remaining = seconds;
    var timer = setInterval(function () {
      remaining -= 1;
      if (countEl) countEl.textContent = remaining;
      if (remaining <= 0) {
        clearInterval(timer);
        if (uaHref) window.location.href = uaHref;
      }
    }, 1000);
    if (stayBtn) {
      stayBtn.addEventListener("click", function () {
        clearInterval(timer);
        overlay.classList.remove("show");
      });
    }
  }

  function initHeroSlider() {
    qsa(".hero-slider").forEach(function (slider) {
      var slides = qsa(".hero-slide", slider);
      var dots = qsa(".hero-slider-dot", slider);
      if (slides.length < 2) return;
      var index = 0;
      var interval = parseInt(slider.dataset.autoplay, 10) || 5000;
      var timer = null;

      function show(i) {
        index = (i + slides.length) % slides.length;
        slides.forEach(function (s, j) { s.classList.toggle("is-active", j === index); });
        dots.forEach(function (d, j) { d.classList.toggle("is-active", j === index); });
      }
      function restart() {
        if (timer) clearInterval(timer);
        timer = setInterval(function () { show(index + 1); }, interval);
      }

      var prev = qs(".hero-slider-arrow.prev", slider);
      var next = qs(".hero-slider-arrow.next", slider);
      if (prev) prev.addEventListener("click", function () { show(index - 1); restart(); });
      if (next) next.addEventListener("click", function () { show(index + 1); restart(); });
      dots.forEach(function (d, j) {
        d.addEventListener("click", function () { show(j); restart(); });
      });

      restart();
    });
  }

  function initEquipmentCarousels() {
    qsa(".equip-carousel").forEach(function (car) {
      var count = parseInt(car.dataset.count, 10) || 0;
      if (!count) return;
      var slides = qsa(".equip-slide", car);
      var index = 0;
      function show(i) {
        index = (i + count) % count;
        slides.forEach(function (s, j) {
          s.classList.toggle("active", j === index);
        });
      }
      var prev = qs(".equip-nav.prev", car);
      var next = qs(".equip-nav.next", car);
      if (prev) prev.addEventListener("click", function () { show(index - 1); });
      if (next) next.addEventListener("click", function () { show(index + 1); });
      show(0);
    });
  }

  function initGoogleReviewsWidgets() {
    qsa(".grw-widget").forEach(function (widget) {
      var track = qs(".grw-track", widget);
      var slides = qsa(".grw-slide", track);
      if (!track || !slides.length) return;
      var section = widget.closest("section");
      var dots = section ? qsa(".grw-dot", section) : [];
      var prev = qs(".grw-arrow.prev", widget);
      var next = qs(".grw-arrow.next", widget);

      // offsetLeft isn't reliably relative to `track` (its offsetParent may be
      // an ancestor further up), so measure with getBoundingClientRect instead
      // and convert to a scrollLeft-space position explicitly.
      function slidePos(el) {
        return el.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
      }
      function scrollToIndex(i) {
        i = Math.max(0, Math.min(slides.length - 1, i));
        track.scrollTo({ left: slidePos(slides[i]), behavior: "smooth" });
      }
      function nearestIndex() {
        var pos = track.scrollLeft;
        var best = 0, bestDist = Infinity;
        slides.forEach(function (s, i) {
          var d = Math.abs(slidePos(s) - pos);
          if (d < bestDist) { bestDist = d; best = i; }
        });
        return best;
      }
      function syncDots() {
        var idx = nearestIndex();
        dots.forEach(function (d, i) { d.classList.toggle("active", i === idx); });
      }
      if (prev) prev.addEventListener("click", function () { scrollToIndex(nearestIndex() - 1); });
      if (next) next.addEventListener("click", function () { scrollToIndex(nearestIndex() + 1); });
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () { scrollToIndex(i); });
      });
      var scrollTimer;
      track.addEventListener("scroll", function () {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(syncDots, 100);
      });
    });
  }

  // ---------------------------------------------------------------- init
  document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    initSelects();
    initAccordion();
    initFilters();
    initTabs();
    initModals();
    initLikeWidgets();
    initRadioRows();
    initBooking();
    initContactForm();
    initLocationSelector();
    initLocationPill();
    initRuDisclaimer();
    initHeroSlider();
    initEquipmentCarousels();
    initGoogleReviewsWidgets();
  });
})();
