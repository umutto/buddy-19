window.addEventListener("DOMContentLoaded", function (evt) {
  document.getElementById("form-room").addEventListener("submit", function (e) {
    window.location.href =
      "/room/" + document.querySelector("#form-room input").value.trim();
  });

  $(".modal").on("shown.bs.modal", function (e) {
    $("[autofocus]", e.target).focus();
  });
});
