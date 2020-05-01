window.addEventListener("DOMContentLoaded", function (evt) {
  document.querySelectorAll('input[name="roomTheme"').forEach(function (l) {
    l.addEventListener("change", function (evt) {
      let old_bg = document.body.className
        .split(" ")
        .filter((c) => c.startsWith("bg-"))[0];
      document.body.classList.remove(old_bg);
      document.body.classList.add(this.value);
    });
  });
});
