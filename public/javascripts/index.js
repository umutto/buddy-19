window.addEventListener("DOMContentLoaded", function (evt) {
  document.querySelectorAll('input[name="roomTemplate"').forEach(function (l) {
    l.addEventListener("change", function (evt) {
      document.body.className = "";
      document.body.classList.add(this.value);
    });
  });
});
