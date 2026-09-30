/* bits-ghost-poetry v1 — rewrite Ghost language-poem code cards on the published page. */
(function () {
  "use strict";

  if (/^\/ghost(?:\/|$)/.test(location.pathname)) {
    return;
  }

  var ROOT_SELECTOR = ".gh-content, .post-content, article";
  var SOURCE_SELECTOR = "pre code.language-poem, pre.language-poem, code.language-poem";
  var STEP = /^(?:\t| {4})+/;

  function roots() {
    return document.querySelectorAll(ROOT_SELECTOR);
  }

  function escapeText(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function indentSteps(line) {
    var match = line.match(STEP);
    if (!match) {
      return { steps: 0, text: line };
    }
    var raw = match[0];
    var steps = 0;
    var i = 0;
    while (i < raw.length) {
      if (raw.charAt(i) === "\t") {
        steps += 1;
        i += 1;
      } else {
        steps += 1;
        i += 4;
      }
    }
    if (steps > 8) {
      steps = 8;
    }
    return { steps: steps, text: line.slice(raw.length) };
  }

  function isAttrib(line) {
    return /^\s*(?:—|--|---)\s+\S/.test(line);
  }

  function parsePoem(source) {
    var text = String(source).replace(/\r\n/g, "\n").replace(/^\n/, "").replace(/\n$/, "");
    var rawLines = text.split("\n");
    var stanzas = [];
    var current = [];
    var i;
    var line;

    function flush() {
      if (current.length) {
        stanzas.push(current);
        current = [];
      }
    }

    for (i = 0; i < rawLines.length; i += 1) {
      line = rawLines[i];
      if (line.trim() === "") {
        flush();
      } else {
        current.push(line);
      }
    }
    flush();
    return stanzas;
  }

  function render(stanzas) {
    var html = [];
    var attrib = "";
    var lastStanza;
    var lastLine;

    if (stanzas.length) {
      lastStanza = stanzas[stanzas.length - 1];
      lastLine = lastStanza[lastStanza.length - 1];
      if (lastStanza.length && isAttrib(lastLine) && (stanzas.length > 1 || lastStanza.length > 1)) {
        attrib = lastLine.replace(/^\s+/, "");
        lastStanza.pop();
        if (!lastStanza.length) {
          stanzas.pop();
        }
      }
    }

    html.push('<div class="poem" data-bits-poem="1">');
    stanzas.forEach(function (stanza) {
      html.push('<p class="stanza">');
      stanza.forEach(function (line) {
        var parsed = indentSteps(line);
        var cls = parsed.steps ? "line i" + parsed.steps : "line";
        html.push('<span class="' + cls + '">' + escapeText(parsed.text) + "</span>");
      });
      html.push("</p>");
    });
    if (attrib) {
      html.push('<span class="attrib">' + escapeText(attrib) + "</span>");
    }
    html.push("</div>");
    return html.join("");
  }

  function sourceNode(el) {
    if (el.matches("code") && el.parentElement && el.parentElement.tagName === "PRE") {
      return el;
    }
    if (el.matches("pre")) {
      return el.querySelector("code") || el;
    }
    return el;
  }

  function replaceable(el) {
    var pre = el.closest("pre") || (el.tagName === "PRE" ? el : null);
    if (!pre) {
      return el;
    }
    var figure = pre.parentElement;
    if (
      figure &&
      figure.tagName === "FIGURE" &&
      figure.classList.contains("kg-code-card") &&
      !figure.querySelector("figcaption")
    ) {
      return figure;
    }
    return pre;
  }

  function convert(el) {
    var src = sourceNode(el);
    var target = replaceable(src);
    if (!target || target.getAttribute("data-bits-poem") === "1") {
      return;
    }
    if (target.querySelector && target.querySelector("[data-bits-poem]")) {
      return;
    }
    var markup = render(parsePoem(src.textContent || ""));
    if (!markup) {
      return;
    }
    target.insertAdjacentHTML("afterend", markup);
    target.parentNode.removeChild(target);
  }

  function run() {
    roots().forEach(function (root) {
      root.querySelectorAll(SOURCE_SELECTOR).forEach(function (el) {
        try {
          convert(el);
        } catch (err) {
          /* leave the original code card in place */
        }
      });
    });
  }

  function observe() {
    roots().forEach(function (root) {
      if (root.getAttribute("data-bits-poem-observed") === "1") {
        return;
      }
      root.setAttribute("data-bits-poem-observed", "1");
      var observer = new MutationObserver(function () {
        run();
      });
      observer.observe(root, { childList: true, subtree: true });
    });
  }

  function start() {
    run();
    observe();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
