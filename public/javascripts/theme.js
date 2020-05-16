window.addEventListener("DOMContentLoaded", function (evt) {
  document.querySelectorAll('input[name="roomTheme"]').forEach(function (l) {
    l.addEventListener("click", function (evt) {
      let old_bg = document.body.className
        .split(" ")
        .filter((c) => c.startsWith("bg-"))[0];

      document.body.classList.remove(old_bg);
      if (old_bg === this.value && this.checked) {
        this.checked = false;
        document.body.classList.add(document.body.dataset.themedef);
      } else {
        document.body.classList.add(this.value);
      }
    });
  });
});
