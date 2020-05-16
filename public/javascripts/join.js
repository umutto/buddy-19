window.addEventListener("DOMContentLoaded", function (evt) {
  let join_form = document.getElementById("join-form");

  join_form.addEventListener("submit", function (e) {
    e.preventDefault();
    loading_overlay(true, "Attempting to join room....");

    var formData = new FormData(this);
    let success_redirect = `/room/${this.dataset.room}`;

    fetch(this.action, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 200) {
          window.location.replace(success_redirect);
        } else create_toast(data.status, data.message, "red", 2000).toast("show");
      })
      .catch((error) => {
        create_toast("An error has occured", error, "red", 2000).toast("show");
      })
      .finally(function () {
        loading_overlay(false);
      });
  });
});
