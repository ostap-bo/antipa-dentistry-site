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

  // ---------------------------------------------------------------- star rating
  function initStarRating() {
    qsa(".star-rate").forEach(function (rate) {
      var stars = qsa(".star-btn", rate);
      var thanks = qs(".star-thanks", rate);
      var lang = document.documentElement.lang === "en" ? "en" : "uk";
      stars.forEach(function (star) {
        star.addEventListener("click", function () {
          var val = parseInt(star.dataset.val, 10);
          rate.dataset.rated = val;
          stars.forEach(function (s) {
            s.classList.toggle("filled", parseInt(s.dataset.val, 10) <= val);
          });
          if (thanks) thanks.textContent = lang === "en" ? "Thank you for your rating!" : "Дякуємо за оцінку!";
        });
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

  // ---------------------------------------------------------------- init
  document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    initSelects();
    initAccordion();
    initFilters();
    initTabs();
    initModals();
    initStarRating();
    initRadioRows();
    initBooking();
    initContactForm();
    initLocationSelector();
    initLocationPill();
  });
})();
