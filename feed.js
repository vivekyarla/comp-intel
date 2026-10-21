/* Market Intel — posts feed from company channels & founders.
   Today page: window.MIFeed.render(items, {base: ""}) is called from today.js with data/today.json "feed".
   Competitor pages: <section id="recent-posts" data-slug="gong" hidden> is filled from ../data/feed_recent.json. */
(function () {
  "use strict";

  var LOGO_EXT = { gong: "png", salesforce: "svg", clay: "png", nooks: "jpg", outreach: "png", salesloft: "png", monaco: "png" };

  function esc(s) {
    if (s == null) return "";
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function when(ts) {
    var d = new Date(ts);
    if (isNaN(d)) return "";
    try {
      return d.toLocaleString("en-US", {
        timeZone: "America/Los_Angeles", month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
      }) + " PT";
    } catch (e) {
      return ts;
    }
  }

  function num(n) {
    if (n == null) return null;
    if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, "") + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(n >= 1e4 ? 0 : 1).replace(/\.0$/, "") + "K";
    return String(n);
  }

  function engagement(e) {
    if (!e) return "";
    var parts = [];
    [["likes", "likes"], ["reposts", "reposts"], ["reactions", "reactions"], ["comments", "comments"], ["replies", "replies"], ["views", "views"]]
      .forEach(function (k) {
        if (e[k[0]] != null && e[k[0]] > 0) parts.push(num(e[k[0]]) + " " + k[1]);
      });
    return parts.slice(0, 3).join(" · ");
  }

  function render(items, opts) {
    if (!items || !items.length) return "";
    opts = opts || {};
    var base = opts.base || "";
    var list = items.slice().sort(function (a, b) { return a.ts < b.ts ? 1 : -1; });
    if (opts.limit) list = list.slice(0, opts.limit);
    var html = '<div class="feed-list">';
    list.forEach(function (it) {
      if (!it.url) return; // every item must link to the real post
      var slug = it.slug;
      var logo = slug && LOGO_EXT[slug] ? base + "assets/logos/" + slug + "." + LOGO_EXT[slug] : null;
      var a = it.author || {};
      var who = it.kind === "founder"
        ? esc(a.name) + (a.handle && a.handle.charAt(0) === "@" ? ' <span class="handle">' + esc(a.handle) + "</span>" : "")
        : (a.handle && a.handle.charAt(0) === "@" ? '<span class="handle">' + esc(a.handle) + "</span>" : "");
      html += '<article class="feed-row">';
      html += logo ? '<img class="logo" src="' + esc(logo) + '" alt="" width="22" height="22" loading="lazy" />' : "<div></div>";
      html += '<div class="feed-body"><p class="feed-meta">';
      if (!opts.hideCompany) html += '<span class="co">' + esc(it.company) + "</span>";
      if (who) html += '<span class="who">' + who + "</span>";
      html += '<span class="src">' + esc(it.source) + "</span>";
      html += '<time datetime="' + esc(it.ts) + '">' + esc(when(it.ts)) + "</time></p>";
      html += '<p class="feed-text">' + esc(it.summary) + "</p>";
      html += '<p class="feed-links"><a href="' + esc(it.url) + '" target="_blank" rel="noopener">View on ' + esc(it.source) + "</a>";
      if (it.also) {
        Object.keys(it.also).forEach(function (k) {
          html += '<a href="' + esc(it.also[k]) + '" target="_blank" rel="noopener">' + esc(k) + "</a>";
        });
      }
      var eng = engagement(it.engagement);
      if (eng) html += '<span class="eng">' + esc(eng) + "</span>";
      html += "</p></div></article>";
    });
    html += "</div>";
    return html;
  }

  window.MIFeed = { render: render };

  var mount = document.getElementById("recent-posts");
  if (mount && mount.getAttribute("data-slug")) {
    var slug = mount.getAttribute("data-slug");
    fetch("../data/feed_recent.json", { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (d) {
        var items = (d.items || []).filter(function (it) { return it.slug === slug; });
        var inner = render(items, { base: "../", hideCompany: true, limit: 8 });
        if (!inner) return; // nothing recent: leave section hidden
        mount.innerHTML = "<h2>Recent posts</h2>" + inner;
        mount.hidden = false;
      })
      .catch(function () { /* optional section; stay hidden */ });
  }
})();
