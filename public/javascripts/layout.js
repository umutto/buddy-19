window.addEventListener("DOMContentLoaded", function (evt) {
  loading_overlay(false);
  $('[data-toggle="popover"]').popover();
});

function loading_overlay(display, text = "Loading...") {
  let overlay = document.getElementById("loading-overlay");
  let overlay_text = document.getElementById("loading-text");

  overlay_text.innerHTML = text;

  if (overlay.style.display === "none" && display) overlay.style.display = "block";
  else if (overlay.style.display === "block" && !display) overlay.style.display = "none";
}

function pad(str, max) {
  str = str.toString();
  return str.length < max ? pad("0" + str, max) : str;
}

function serialize_params(obj) {
  return Object.keys(obj)
    .map(function (k) {
      return encodeURIComponent(k) + "=" + encodeURIComponent(obj[k]);
    })
    .join("&");
}

function create_toast(head, body, color = "orange", delay = 1000) {
  let toast = document.getElementById("toast-template").cloneNode(true);
  toast.id = `toast-${new Date().getTime()}`;
  toast.querySelector(".toast-header").textContent = head;
  toast.querySelector(".toast-body").innerHtml = body;
  toast.querySelector(".toast-header").style.backgroundColor = color;
  toast.classList.remove("d-none");
  document.getElementById("toast-wrapper").appendChild(toast);
  toast.toast({ delay: delay });
  return toast;
}
