window.addEventListener("DOMContentLoaded", function (evt) {
  document.getElementById("roomType").addEventListener("change", function () {
    document.getElementById("main-wrapper").dataset.type = this.value;
  });
  document.querySelectorAll('input[name="roomTheme"]').forEach(function (l) {
    l.addEventListener("click", function (evt) {
      let old_bg = document.body.className
        .split(" ")
        .filter((c) => c.startsWith("bg-"))[0];

      document.body.classList.remove(old_bg);
      if (old_bg === this.value) {
        this.checked = false;
        document.body.classList.add("bg-webb");
      } else {
        document.body.classList.add(this.value);
      }
    });
  });
});
