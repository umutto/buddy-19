window.addEventListener("DOMContentLoaded", function (evt) {
  document.getElementById("roomType").addEventListener("change", function () {
    document.getElementById("main-wrapper").dataset.type = this.value;
  });
});
