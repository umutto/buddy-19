window.addEventListener("DOMContentLoaded", function (evt) {
  loading_overlay(false);
  $('[data-toggle="popover"]').popover();

  $(".modal").on("shown.bs.modal", function (e) {
    $("[autofocus]", e.target).focus();
  });

  Array.from(document.getElementsByClassName("toggle-password")).forEach(function (elem) {
    elem.addEventListener("click", function (e) {
      if (e.target.firstElementChild.textContent === "visibility") {
        e.target.parentElement.querySelector("input[type='password']").type = "text";
        e.target.firstElementChild.textContent = "visibility_off";
      } else {
        e.target.parentElement.querySelector("input[type='text']").type = "password";
        e.target.firstElementChild.textContent = "visibility";
      }
    });
  });
});

function copy_to_clipboard(elem) {
  if (typeof elem === "string") elem = document.getElementById(elem);
  elem.select();
  elem.setSelectionRange(0, 99999);
  document.execCommand("copy");
}

function loading_overlay(display, text = "Loading...") {
  let overlay = document.getElementById("loading-overlay");
  let overlay_text = document.getElementById("loading-text");

  overlay_text.innerHTML = text;

  if (overlay.classList.contains("d-none") && display) overlay.classList.remove("d-none");
  else if (!overlay.classList.contains("d-none") && !display)
    overlay.classList.add("d-none");
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
  let toast = $("#toast-template").clone().attr("id", `toast-${new Date().getTime()}`);
  toast.find(".toast-title").text(head);
  toast.find(".toast-body").html(body);
  toast.find(".toast-header").css("background-color", color);
  toast.removeClass("d-none");
  toast.appendTo("#toast-wrapper");
  toast.toast({ delay: delay });
  return toast;
}
