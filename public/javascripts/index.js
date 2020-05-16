window.addEventListener("DOMContentLoaded", function (evt) {
  document.getElementById("form-room").addEventListener("submit", function (e) {
    e.preventDefault();
    window.location.href =
      "/room/" + document.querySelector("#form-room input").value.trim();
  });
});
