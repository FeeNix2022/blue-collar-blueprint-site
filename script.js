// Where the audit form posts. Swap this for your endpoint (Formspree, Basin,
// Google Apps Script web app, your own API, etc.).
// Empty string = form is not wired up yet; submissions are NOT sent anywhere.
const FORM_ENDPOINT = "";

(function () {
  "use strict";

  var WEEKS_PER_YEAR = 52;
  var MONTHS_PER_YEAR = 12;

  var $ = function (id) { return document.getElementById(id); };
  var usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  var num = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

  // ---- Calculator ----------------------------------------------------------
  var callsEl = $("calls"), closeEl = $("close"), jobEl = $("job");
  var calc = { calls: 0, close: 0, job: 0, month: 0, year: 0 };

  function read(el, max) {
    var v = parseFloat(el.value);
    if (!isFinite(v) || v < 0) v = 0;
    if (max !== undefined && v > max) v = max;
    return v;
  }

  function compute() {
    var calls = read(callsEl);
    var closePct = read(closeEl, 100);
    var job = read(jobEl);

    var month = calls * (WEEKS_PER_YEAR / MONTHS_PER_YEAR) * (closePct / 100) * job;
    var year = month * MONTHS_PER_YEAR;

    calc = { calls: calls, close: closePct, job: job, month: month, year: year };

    $("out-month").textContent = usd.format(month);
    $("out-year").textContent = usd.format(year);

    $("formula-live").textContent =
      "monthly = " + num.format(calls) + " × (52 ÷ 12) × " + num.format(closePct / 100) + " × " + usd.format(job) + "\n" +
      "        = " + usd.format(month) + "\n" +
      "yearly  = " + usd.format(month) + " × 12\n" +
      "        = " + usd.format(year);

    $("h-calls").value = calls;
    $("h-close").value = closePct;
    $("h-job").value = job;
    $("h-month").value = Math.round(month);
    $("h-year").value = Math.round(year);
  }

  [callsEl, closeEl, jobEl].forEach(function (el) { el.addEventListener("input", compute); });
  $("calc-form").addEventListener("submit", function (e) { e.preventDefault(); });
  compute();

  // ---- Audit form ----------------------------------------------------------
  var form = $("audit-form");
  var statusEl = $("form-status");
  var btn = $("submit-btn");

  function setStatus(msg, kind) {
    statusEl.textContent = msg;
    statusEl.className = "form-status" + (kind ? " " + kind : "");
  }

  function validate() {
    var ok = true, first = null;
    ["name", "business", "phone", "email"].forEach(function (id) {
      var el = $(id);
      var val = el.value.trim();
      var valid = val.length > 0;
      if (id === "email") valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      if (id === "phone") valid = val.replace(/\D/g, "").length >= 10;
      el.setAttribute("aria-invalid", valid ? "false" : "true");
      if (!valid) { ok = false; if (!first) first = el; }
    });
    if (first) first.focus();
    return ok;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    setStatus("", "");

    if (!validate()) {
      setStatus("Check the highlighted fields. All four are required, with a valid email and a 10-digit phone number.", "err");
      return;
    }

    // Honeypot tripped: pretend success, send nothing.
    if ($("website").value) {
      setStatus("Request received.", "ok");
      return;
    }

    if (!FORM_ENDPOINT) {
      setStatus("This form is not connected yet, so nothing was sent. Set FORM_ENDPOINT in script.js.", "err");
      return;
    }

    compute(); // make sure hidden calculator fields are current
    var payload = {};
    new FormData(form).forEach(function (v, k) { if (k !== "website") payload[k] = v; });

    btn.disabled = true;
    setStatus("Sending…", "");

    fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        form.reset();
        compute();
        setStatus("Request received. We’ll contact you to schedule your audit.", "ok");
      })
      .catch(function () {
        setStatus("Could not send. Check your connection and try again.", "err");
      })
      .then(function () { btn.disabled = false; });
  });

  $("year").textContent = new Date().getFullYear();
})();
