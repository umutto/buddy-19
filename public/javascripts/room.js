const messageType = Object.freeze({
  userConnected: 0,
  userDisconnected: 1,
  userChatMessage: 2,
  userChatReaction: 3,
  userDetails: 4,
});

window.addEventListener("DOMContentLoaded", function (evt) {
  $("#chat-wrapper").on("hidden.bs.collapse", function () {
    this.querySelectorAll(".chat-text").forEach((c) => c.classList.add("no-animation"));
  });
  $("#chat-wrapper").on("shown.bs.collapse", function () {
    document.getElementById("chat-display").scrollTo({
      top: document.getElementById("chat-display").scrollHeight,
      behavior: "smooth",
    });
    document.getElementById("chat-text-append").textContent = "";
  });

  const socket = io({
    query: serialize_params({
      UserId: c_user_alias,
      UserName: c_user_name,
      UserAvatar: c_user_avatar,
      LoginDate: new Date().toJSON(),
      SourceUrl: window.location.pathname,
    }),
  });

  let room = document.getElementById("main-wrapper").dataset.room;
  socket.emit("join", room, function (response) {
    if (response.status === 200) {
      append_to_chat(messageType.userConnected, response.context);
      room = response.message;
    } else {
      create_toast(response.status, response.message, "red", 2000).toast("show");
    }
  });

  socket.on("message_echo", function (message_type, context, ack = function () {}) {
    if (context.ChatMessage) append_to_chat(message_type, context);
    if (message_type === messageType.userDetails) {
      update_user_details(context.User.Id, context.User.Name, context.User.Avatar);
    }
    ack({ Code: 200, Message: context });
  });

  let profile_form = document.getElementById("profile-form");

  profile_form.addEventListener("submit", function (e) {
    e.preventDefault();
    loading_overlay(true, "Updating user profile...");

    var formData = new FormData(this);
    formData.append("roomId", c_room_id);

    fetch(this.action, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 200) {
          c_user_name = data.message.User.Name;
          c_user_avatar = data.message.User.Avatar;
          socket.emit("user-details", {
            Name: c_user_name,
            Avatar: c_user_avatar,
          });
          update_user_details(c_user_alias, c_user_name, c_user_avatar);
        } else create_toast(data.status, data.message, "red", 2000).toast("show");
        $("#profile-modal").modal("hide");
      })
      .catch((error) => {
        create_toast("An error has occured", error, "red", 2000).toast("show");
      })
      .finally(function () {
        loading_overlay(false);
      });
  });

  let chat_input = document.getElementById("chat-input");
  let chat_input_btn = document.getElementById("btn-chat-send");

  chat_input_btn.addEventListener("click", function () {
    send_chat_message(socket, chat_input.value, function () {
      chat_input.value = "";
    });
  });
  chat_input.addEventListener("keyup", function () {
    if (event.keyCode === 13) {
      send_chat_message(socket, chat_input.value, function () {
        chat_input.value = "";
      });
    }
  });

  let btn_copy_url = document.getElementById("btn_copy_url");
  let input_copy_url = document.getElementById("qr_room_url");

  input_copy_url.addEventListener("focus", function () {
    this.select();
    this.setSelectionRange(0, 99999);
  });
  btn_copy_url.addEventListener("click", function () {
    copy_to_clipboard(input_copy_url);

    create_toast(
      "Copied!",
      "Your room url has been copied to clipboard, send this url to your friends to join!",
      "#4287f5",
      2000
    ).toast("show");
  });
});

function send_chat_message(socket, text, cb) {
  if (text !== "") {
    socket.emit("message", messageType.userChatMessage, { ChatMessage: text }, function (
      response
    ) {
      if (response.status === 200) {
        append_to_chat(messageType.userChatMessage, response.message);
        cb();
      } else {
        create_toast(
          response.status,
          `${response.message}</br>${response.details}`
        ).toast("show");
      }
    });
  }
}

function append_to_chat(message_type, context, scroll_to_bottom = "false") {
  let chat_display = document.getElementById("chat-display");
  let message_time = new Date(context.TimeReceived).toTimeString().substr(0, 5);

  if (
    message_type === messageType.userConnected ||
    message_type === messageType.userDisconnected
  ) {
    let chat_msg = chatMessageTemplate({
      UserAlias: c_user_alias,
      MessageUser: context.User,
      MessageTime: message_time,
      MessageText: context.ChatMessage,
      MessageType: message_type,
      TextHint: context.Reason,
    });

    chat_display.insertAdjacentHTML("beforeend", chat_msg);
  } else if (message_type === messageType.userChatMessage) {
    let chat_msg = htmlToElement(
      chatMessageTemplate({
        UserAlias: c_user_alias,
        MessageUser: context.User,
        MessageTime: message_time,
        MessageText: context.ChatMessage,
        MessageType: message_type,
      }),
      "text/html"
    );

    linkifyElement(chat_msg.querySelector(".chat-text .p-wrap"), {
      className: "chat-text-link",
      attributes: {
        rel: "noopener",
      },
      format: function (value, type) {
        if (type === "url" && value.length > 20) {
          value = value.slice(0, 17) + "…";
        }
        return value;
      },
      chat_msg,
    });

    if (
      chat_display.lastChild &&
      chat_display.lastChild.dataset.type == messageType.userChatMessage &&
      chat_display.lastChild.dataset.userid === context.User.Id &&
      chat_display.lastChild.getElementsByClassName("chat-text").length < 10 &&
      chat_display.lastChild.getElementsByClassName("chat-time")[0].lastChild
        .textContent === message_time
    ) {
      let msg_text = chat_msg.getElementsByClassName("chat-text")[0];
      chat_display.lastChild.getElementsByClassName("chat-text")[0].appendChild(msg_text);
    } else {
      chat_display.appendChild(chat_msg);
    }

    if (document.hidden && c_user_alias !== context.User.Id)
      title_blink(`New message from ${context.User.Name}`);

    if (!document.getElementById("chat-wrapper").classList.contains("show")) {
      let chat_indicator = document.getElementById("chat-text-append");
      chat_indicator.textContent = chat_indicator.textContent
        ? `(${parseInt(chat_indicator.textContent.match(/\d+/)[0]) + 1})`
        : "(1)";
    }
  }

  if (scroll_to_bottom)
    document.getElementById("chat-display").scrollTo({
      top: document.getElementById("chat-display").scrollHeight,
      behavior: "smooth",
    });
}

function update_user_details(uuid, name, avatar) {
  document.querySelectorAll(`[data-userid="${uuid}"]`).forEach((u) => {
    u.querySelectorAll(".user-name").forEach((n) => (n.textContent = name));
    u.querySelectorAll(".user-avatar").forEach(
      (a) => (a.src = `/images/user_icons/${avatar}`)
    );
  });
}

function htmlToElement(html) {
  var template = document.createElement("template");
  html = html.trim();
  template.innerHTML = html;
  return template.content.firstChild;
}

function title_blink(message) {
  var old_title = document.title;

  var blinker = setInterval(function () {
    document.title = document.title == message ? old_title : message;
  }, 1000);

  var listener = null;
  listener = function () {
    clearInterval(blinker);
    document.title = old_title;
    window.removeEventListener("mousemove", listener, false);
  };

  window.addEventListener("mousemove", listener, false);
}
