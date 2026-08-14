// OSF Lookbook — comment widget
// Renders a comment form + comment list into any element with id="comments-root".
// Reads/writes via the Apps Script Web App URL set in comments-config.js (window.COMMENTS_ENDPOINT).
// Comments are scoped per page using data-page on the #comments-root element.

(function () {
  function el(tag, props, children) {
    var e = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) {
      if (k === "class") e.className = props[k];
      else if (k === "text") e.textContent = props[k];
      else e.setAttribute(k, props[k]);
    });
    (children || []).forEach(function (c) { e.appendChild(c); });
    return e;
  }

  function formatTime(iso) {
    try {
      var d = new Date(iso);
      return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
        " " + d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    } catch (e) {
      return iso;
    }
  }

  function renderComments(listEl, comments) {
    listEl.innerHTML = "";
    if (!comments || comments.length === 0) {
      listEl.appendChild(el("div", { class: "comment-empty", text: "No comments yet — be the first to leave feedback." }));
      return;
    }
    comments.slice().reverse().forEach(function (c) {
      var item = el("div", { class: "comment-item" });
      var meta = el("div", { class: "meta" });
      meta.appendChild(el("span", { class: "name", text: c.name || "Anonymous" }));
      meta.appendChild(el("span", { text: formatTime(c.timestamp) }));
      item.appendChild(meta);
      item.appendChild(el("div", { class: "text", text: c.text || "" }));
      listEl.appendChild(item);
    });
  }

  function initComments(root) {
    var page = root.getAttribute("data-page") || document.title;
    var endpoint = window.COMMENTS_ENDPOINT;

    var wrap = el("div", { class: "comments-block" });
    wrap.appendChild(el("h3", { text: "Feedback" }));
    wrap.appendChild(el("p", { class: "sub", text: "Leave a comment for the Hike team — no account needed." }));

    var form = el("div", { class: "comment-form" });
    var nameInput = el("input", { type: "text", placeholder: "Your name" });
    var textInput = el("textarea", { placeholder: "Your feedback on this piece..." });
    var submitBtn = el("button", { text: "Post Comment" });
    var status = el("div", { class: "comment-status" });
    form.appendChild(nameInput);
    form.appendChild(textInput);
    form.appendChild(submitBtn);
    form.appendChild(status);
    wrap.appendChild(form);

    var list = el("div", { class: "comment-list" });
    wrap.appendChild(list);
    root.appendChild(wrap);

    function loadComments() {
      if (!endpoint || endpoint.indexOf("PASTE_YOUR") === 0) {
        list.innerHTML = "";
        list.appendChild(el("div", {
          class: "comment-empty",
          text: "Comments aren't wired up yet — set COMMENTS_ENDPOINT in js/comments-config.js."
        }));
        return;
      }
      fetch(endpoint + "?page=" + encodeURIComponent(page))
        .then(function (r) { return r.json(); })
        .then(function (data) { renderComments(list, data.comments || []); })
        .catch(function () {
          list.innerHTML = "";
          list.appendChild(el("div", { class: "comment-empty", text: "Couldn't load comments right now." }));
        });
    }

    submitBtn.addEventListener("click", function () {
      var name = nameInput.value.trim();
      var text = textInput.value.trim();
      if (!text) {
        status.textContent = "Write a comment before posting.";
        return;
      }
      if (!endpoint || endpoint.indexOf("PASTE_YOUR") === 0) {
        status.textContent = "Comments aren't wired up yet — see README.md.";
        return;
      }
      submitBtn.disabled = true;
      status.textContent = "Posting...";
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ page: page, name: name, text: text })
      })
        .then(function (r) { return r.json(); })
        .then(function () {
          status.textContent = "Posted. Thanks!";
          nameInput.value = "";
          textInput.value = "";
          submitBtn.disabled = false;
          loadComments();
        })
        .catch(function () {
          status.textContent = "Something went wrong — try again.";
          submitBtn.disabled = false;
        });
    });

    loadComments();
  }

  document.addEventListener("DOMContentLoaded", function () {
    var roots = document.querySelectorAll("#comments-root");
    roots.forEach(initComments);
  });
})();
