/* Market Intel — Today renderer (data-driven from data/today.json) */
(function () {
  "use strict";

  var MARKER = { up: "↑", flat: "→", down: "↓", emerging: "◆" };
  var LOGO_EXT = {
    gong: "png",
    salesforce: "svg",
    clay: "png",
    nooks: "jpg",
    outreach: "png",
    salesloft: "png",
    monaco: "png"
  };

  function esc(s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function citesHtml(cites) {
    if (!cites || !cites.length) return "";
    var parts = cites.map(function (c) {
      return (
        '<a class="cite" href="' +
        esc(c.url) +
        '" target="_blank" rel="noopener">' +
        esc(c.label || "source") +
        "</a>"
      );
    });
    return '<div class="cites">' + parts.join("") + "</div>";
  }

  function logoPath(item) {
    if (item.logo) return item.logo;
    if (item.slug && LOGO_EXT[item.slug]) {
      return "assets/logos/" + item.slug + "." + LOGO_EXT[item.slug];
    }
    return null;
  }

  function slugFromCompany(name) {
    if (!name) return null;
    var map = {
      Gong: "gong",
      Salesforce: "salesforce",
      Clay: "clay",
      Nooks: "nooks",
      Outreach: "outreach",
      Salesloft: "salesloft",
      Monaco: "monaco"
    };
    return map[name] || null;
  }

  function renderChanges(items) {
    if (!items || !items.length) {
      return '<p class="empty">No changes in window.</p>';
    }
    var html = '<div class="change-list">';
    items.forEach(function (it) {
      var logo = logoPath(it);
      if (!logo && it.company) {
        var s = slugFromCompany(it.company);
        if (s && LOGO_EXT[s]) logo = "assets/logos/" + s + "." + LOGO_EXT[s];
      }
      html += '<article class="change-card">';
      if (logo) {
        html +=
          '<img class="thumb" src="' +
          esc(logo) +
          '" alt="" width="32" height="32" loading="lazy" />';
      } else {
        html += "<div></div>";
      }
      html += '<div class="body">';
      html += '<p class="title">';
      if (it.new) html += '<span class="badge-new">New</span>';
      html += esc(it.title) + "</p>";
      if (it.body) html += '<p class="text">' + esc(it.body) + "</p>";
      html += citesHtml(it.cites);
      html += "</div></article>";
    });
    html += "</div>";
    return html;
  }

  function renderDirection(items) {
    if (!items || !items.length) return "";
    var html = '<div class="direction-list">';
    items.forEach(function (it) {
      var kind = it.kind || "flat";
      var mark = MARKER[kind] || "→";
      html +=
        '<div class="direction-row ' +
        esc(kind) +
        '">' +
        '<span class="marker" aria-hidden="true">' +
        mark +
        "</span>" +
        "<div>" +
        (it.label
          ? '<p class="label">' + esc(it.label) + "</p>"
          : "") +
        '<p class="text">' +
        esc(it.text || "") +
        "</p>" +
        "</div></div>";
    });
    html += "</div>";
    return html;
  }

  function renderPulse(items) {
    if (!items || !items.length) return "";
    var html = '<div class="glossary">';
    items.forEach(function (it) {
      html +=
        '<div class="glossary-row">' +
        '<div class="term">' +
        esc(it.term) +
        "</div>" +
        '<p class="gloss">' +
        esc(it.gloss || "") +
        "</p>" +
        "</div>";
    });
    html += "</div>";
    return html;
  }

  function renderMoves(items) {
    if (!items || !items.length) return '';
    var html = '<div class="moves-list">';
    items.forEach(function (it) {
      var slug = it.slug || slugFromCompany(it.company);
      var logo =
        it.logo ||
        (slug && LOGO_EXT[slug]
          ? "assets/logos/" + slug + "." + LOGO_EXT[slug]
          : null);
      var href = slug ? "competitors/" + slug + ".html" : null;
      html += '<div class="move-row">';
      if (logo) {
        html +=
          '<img class="logo" src="' +
          esc(logo) +
          '" alt="" width="22" height="22" loading="lazy" />';
      } else {
        html += "<div></div>";
      }
      html += "<div>";
      html += '<p class="company">';
      if (href) {
        html +=
          '<a href="' + esc(href) + '">' + esc(it.company) + "</a>";
      } else {
        html += esc(it.company || "");
      }
      html += "</p>";
      if (it.text) html += '<p class="text">' + esc(it.text) + "</p>";
      html += citesHtml(it.cites);
      html += "</div></div>";
    });
    html += "</div>";
    return html;
  }

  function renderWatch(items) {
    if (!items || !items.length) return "";
    return items
      .map(function (it) {
        var hasMedia = !!it.image;
        var logo = it.logo;
        if (!logo && it.company) {
          var s = slugFromCompany(it.company);
          if (s && LOGO_EXT[s]) logo = "assets/logos/" + s + "." + LOGO_EXT[s];
        }
        var html =
          '<article class="watch-card' +
          (hasMedia ? " has-media" : "") +
          '"><div>';
        html += '<p class="title">';
        if (logo) {
          html +=
            '<img class="company-logo sm" src="' +
            esc(logo) +
            '" alt="" width="20" height="20" loading="lazy" />';
        }
        html += esc(it.title) + "</p>";
        if (it.body) html += '<p class="text">' + esc(it.body) + "</p>";
        html += citesHtml(it.cites);
        html += "</div>";
        if (hasMedia) {
          html +=
            '<img class="media" src="' +
            esc(it.image) +
            '" alt="" loading="lazy" />';
        }
        html += "</article>";
        return html;
      })
      .join("");
  }

  function renderInterp(interp) {
    if (!interp) return "";
    var html = '<div class="interp-block">';
    if (interp.fact) {
      html +=
        "<p><strong>Fact:</strong> " + esc(interp.fact) + "</p>";
    }
    if (interp.note) {
      html +=
        '<p class="muted"><strong>Interpretation (light):</strong> ' +
        esc(interp.note) +
        "</p>";
    }
    html += "</div>";
    return html;
  }

  function section(title, inner) {
    if (!inner) return "";
    return (
      "<section><h2>" + esc(title) + "</h2>" + inner + "</section>"
    );
  }

  function render(data) {
    var meta = document.getElementById("meta");
    var content = document.getElementById("content");
    var asOf = data.as_of || "";
    var filter = data.filter_note ? " · " + data.filter_note : "";
    meta.textContent = asOf + filter;
    document.title = "Market Intel — Today · " + (asOf || "brief");

    var parts = [];
    parts.push(
      section(
        "What changed",
        renderChanges(data.what_changed) +
          (data.quiet_note
            ? '<p class="empty" style="margin-top:0.75rem">' +
              esc(data.quiet_note) +
              "</p>"
            : "")
      )
    );
    parts.push(section("Market direction", renderDirection(data.market_direction)));
    parts.push(section("Category language pulse", renderPulse(data.language_pulse)));
    var movesHtml = renderMoves(data.competitive_moves);
    if (movesHtml) {
      parts.push(section("Competitive moves", movesHtml));
    }
    parts.push(section("One thing to watch", renderWatch(data.watch)));
    if (data.interpretation) {
      parts.push(section("Interpretation vs fact", renderInterp(data.interpretation)));
    }
    content.innerHTML = parts.join("");
  }

  function showError(msg) {
    var meta = document.getElementById("meta");
    var content = document.getElementById("content");
    meta.textContent = "Unavailable";
    content.innerHTML =
      '<div class="error-banner">' +
      esc(msg || "Could not load today’s brief (data/today.json).") +
      "</div>";
  }

  fetch("data/today.json", { cache: "no-store" })
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(render)
    .catch(function (err) {
      console.error(err);
      showError(
        "Could not load today’s brief. Check data/today.json is present and the server is running."
      );
    });
})();
