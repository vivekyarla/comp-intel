/* "Get it daily": a one-tap setup message that has Instinct or Muse read today's brief
   (data/today.json, overwritten each morning) on a schedule and send a short summary. */
(function () {
  "use strict";

  var base = location.origin + location.pathname.replace(/[^/]*$/, "");
  var DATA_URL = base + "data/today.json";
  var KEY = "mi_daily";

  function load() { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } }
  function save(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} }
  function tz() { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Los_Angeles"; } catch (e) { return "America/Los_Angeles"; } }
  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k]; if (v == null || v === false) return;
      if (k === "class") e.className = v; else if (k === "text") e.textContent = v;
      else if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), v);
      else if (k === "value" || k === "checked") e[k] = v; else e.setAttribute(k, v === true ? "" : v);
    });
    (kids || []).forEach(function (c) { if (c != null) e.append(c); });
    return e;
  }
  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    var t = el("textarea", { value: text, style: "position:fixed;opacity:0" }); document.body.appendChild(t); t.select();
    try { document.execCommand("copy"); } finally { t.remove(); } return Promise.resolve();
  }

  function message(name, time, weekdays, zone) {
    var p = time.split(":"), hr = +p[0];
    var when = (hr % 12 || 12) + ":" + p[1] + (hr < 12 ? " AM" : " PM");
    return "Hi " + name + ". Please set up a recurring task: every " + (weekdays ? "weekday" : "day") + " at " + when + " (" + zone + ")" +
      ", read " + DATA_URL + " (today's competitive intel brief for Rox) and send me a short brief: the market_briefing lede in a sentence, " +
      "then the 2–3 most important items from market_briefing, competitive_moves and what_changed, each with its source link, " +
      "and this link to the full page: " + base + "\nKeep it under 120 words. If as_of isn't today's date, just say there's no new brief yet and send the link.";
  }

  function card(kind, zone, openNow) {
    var A = kind === "instinct"
      ? { name: "Instinct", logo: "In", sub: "Texts it to you from your Instinct thread" }
      : { name: "Muse", logo: "Mu", sub: "Sends it through Meta's Muse, in WhatsApp or at muse.ai" };
    var saved = load()[kind] || {};
    var time = el("input", { class: "md-inp", type: "time", value: saved.time || "09:30", "aria-label": "Time" });
    var weekdays = el("input", { type: "checkbox", checked: saved.weekdays !== false });
    var num = kind === "instinct" ? el("input", { class: "md-inp", type: "tel", placeholder: "Instinct's number (optional)", value: saved.number || "", autocomplete: "off" }) : null;
    var preview = el("div", { class: "md-preview" });
    var note = el("p", { class: "md-note", hidden: true });
    var pill = el("span", { class: "md-pill" });
    var primary = el("a", { class: "md-btn primary", target: kind === "muse" ? "_blank" : null, rel: "noopener" });
    var alt = kind === "muse" ? el("a", { class: "md-btn", target: "_blank", rel: "noopener", text: "Send in WhatsApp" }) : null;
    function msg() { return message(A.name, time.value || "09:30", weekdays.checked, zone); }
    function render() {
      var m = msg(); preview.textContent = m;
      if (num) { primary.textContent = "Text it to Instinct"; primary.href = "sms:" + num.value.replace(/[^\d+]/g, "") + "?&body=" + encodeURIComponent(m); }
      else { primary.textContent = "Open Muse ↗"; primary.href = "https://muse.ai/"; alt.href = "https://wa.me/?text=" + encodeURIComponent(m); }
      var x = load()[kind];
      pill.textContent = x && x.at ? "Set up · " + new Date(x.at).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "Not set up";
      pill.className = "md-pill" + (x && x.at ? " ok" : "");
    }
    function remember(done) {
      var all = load();
      all[kind] = Object.assign({}, all[kind], { time: time.value, weekdays: weekdays.checked, number: num ? num.value : undefined }, done ? { at: new Date().toISOString() } : {});
      save(all); render();
    }
    function done(text) { remember(true); note.hidden = false; note.textContent = text; }
    [time, weekdays, num].forEach(function (x) { if (x) { x.addEventListener("input", function () { remember(false); }); x.addEventListener("change", render); } });
    primary.addEventListener("click", function () {
      copy(msg()).catch(function () {});
      done(num ? "Opening your messages app with the text filled in. On a computer? It's copied, so paste it into your Instinct thread."
               : "Message copied. Paste it into Muse and send it.");
    });
    if (alt) alt.addEventListener("click", function () { done("Pick your Muse chat in WhatsApp and send."); });
    var copyBtn = el("button", { class: "md-btn", type: "button", text: "Copy message",
      onclick: function () { copy(msg()).then(function () { done("Copied. Paste it into " + A.name + " and send it."); }); } });
    var d = el("details", { class: "md-card", open: openNow }, [
      el("summary", null, [el("span", { class: "md-logo", text: A.logo }),
        el("span", { class: "md-title" }, [el("b", { text: A.name }), el("small", { text: A.sub })]), pill]),
      el("div", { class: "md-body" }, [
        el("ol", null, [el("li", { text: "Pick when you want it. The brief lands around 9:00 AM PT on weekdays." }),
          el("li", { text: "Send this message to " + A.name + ". It sets up a daily task that reads today's brief and sends you the highlights." })]),
        el("div", { class: "md-row" }, [time, el("label", { class: "md-check" }, [weekdays, " Weekdays only"]), num]),
        preview, el("div", { class: "md-btns" }, [primary, alt, copyBtn]), note,
        el("p", { class: "md-hint" }, [A.name + " reads ", el("a", { href: DATA_URL, target: "_blank", rel: "noopener", text: "today's brief data" }),
          ". To stop, tell " + A.name + " to cancel the market intel brief."])])]);
    render();
    return d;
  }

  function open() {
    var dlg = document.getElementById("daily-dlg");
    if (!dlg) {
      var zone = tz();
      dlg = el("dialog", { id: "daily-dlg", class: "md-dlg", "aria-labelledby": "daily-title" }, [
        el("div", { class: "md-head" }, [el("h2", { id: "daily-title", text: "Get the brief daily" }),
          el("button", { class: "md-x", type: "button", "aria-label": "Close", text: "×", onclick: function () { dlg.close(); } })]),
        el("p", { class: "md-lede", text: "Have Instinct or Muse send you the highlights each morning, with links. No account needed." }),
        card("instinct", zone, true), card("muse", zone, false)]);
      dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
      document.body.appendChild(dlg);
    }
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
  }

  document.querySelectorAll("[data-get-daily]").forEach(function (b) { b.addEventListener("click", open); });
})();
