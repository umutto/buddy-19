window.addEventListener("DOMContentLoaded", function (evt) {
  socketController.connect(document.getElementById("main-wrapper").dataset.room);
});
