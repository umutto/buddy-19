const messageType = Object.freeze({
  userConnected: 0,
  userDisconnected: 1,
  userChatMessage: 2,
  userChatReaction: 3,
  userDetails: 4,
  roomControl: 5,
});

var socket = null;

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

  socket = io({
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

      response.context.Members.forEach((u) => update_participant_list_add(u));
      room = response.message;
    } else {
      create_toast(response.status, response.message, "red", 2000).toast("show");
    }
  });

  socket.on("message_echo", function (message_type, context, ack = function () {}) {
    if (context.ChatMessage) append_to_chat(message_type, context);
    if (context.ToastMessage)
      create_toast(
        context.ToastMessage.Title || context.User.Name,
        context.ToastMessage.Message,
        "#539fe2",
        2000
      ).toast("show");

    if (message_type === messageType.userDetails) {
      update_user_details(context.User.Id, context.User.Name, context.User.Avatar);
    } else if (message_type === messageType.userConnected) {
      update_participant_list_add(context.User);
    } else if (message_type === messageType.userDisconnected) {
      update_participant_list_remove(context.User, context.Reason);
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

  document.getElementById("participant-table").addEventListener("click", function (e) {
    if (e.target && e.target.classList.contains("btn-user-mute")) {
      create_toast(
        "Sorry :'(",
        "This functionality is not implemented yet",
        "black",
        1500
      ).toast("show");
    }
    if (e.target && e.target.classList.contains("btn-user-unmute")) {
      create_toast(
        "Sorry :'(",
        "This functionality is not implemented yet",
        "black",
        1500
      ).toast("show");
    }
    if (e.target && e.target.classList.contains("btn-user-remove")) {
      create_toast(
        "Sorry :'(",
        "This functionality is not implemented yet",
        "black",
        1500
      ).toast("show");
    }
  });
});

function send_chat_message(socket, text, cb) {
  if (text !== "") {
    socket.emit(
      "message",
      messageType.userChatMessage,
      { ChatMessage: { Message: text } },
      function (response) {
        if (response.status === 200) {
          append_to_chat(messageType.userChatMessage, response.message);
          cb();
        } else {
          create_toast(
            response.status,
            `${response.message}</br>${response.details}`
          ).toast("show");
        }
      }
    );
  }
}

function append_to_chat(message_type, context, scroll_to_bottom = "false") {
  let chat_display = document.getElementById("chat-display");
  let message_time = new Date(context.TimeReceived).toTimeString().substr(0, 5);

  let chat_msg = htmlToElement(
    chatMessageTemplate({
      UserAlias: c_user_alias,
      MessageUser: context.User,
      MessageTime: message_time,
      MessageText: context.ChatMessage.Message,
      MessageType: message_type,
      TextHint: context.Reason,
    }),
    "text/html"
  );

  if (message_type === messageType.userChatMessage)
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
    message_type === messageType.userChatMessage &&
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

  if (scroll_to_bottom)
    document.getElementById("chat-display").scrollTo({
      top: document.getElementById("chat-display").scrollHeight,
      behavior: "smooth",
    });
}

function update_user_details(uuid, name, avatar) {
  if (uuid === c_user_alias) {
    document.getElementById("userName").value = name;
    document.querySelector(`[name="userAvatar"]:checked`).checked = false;
    document.querySelector(`[name="userAvatar"][value="${avatar}"]`).checked = true;
    c_user_name = name;
    c_user_avatar = avatar;
  }
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

function update_chat_title() {
  let usr_list = [];
  document.querySelectorAll("#participant-table .participant-row").forEach((r) => {
    if (r.getElementsByClassName("badge-success").length > 0)
      usr_list.push(r.getElementsByClassName("user-name")[0].textContent);
  });
  document.getElementById("chat-participant-header").textContent = `(You and ${
    usr_list.length
  } other${usr_list.length > 1 ? "s" : ""})`;
  document.getElementById("chat-participant-header").title = usr_list.join(", ");
}

function update_participant_list_add(user) {
  if (user.Id === c_user_alias) return;

  let EnterDate = new Date(user.EnterDate).toTimeString().substr(0, 5);

  let user_row = htmlToElement(
    listUserTemplate({
      UserAlias: c_user_alias,
      Participant: {
        Id: user.Id,
        Name: user.Name,
        Avatar: user.Avatar,
        EnterDate,
        Status: 0,
        IsMuted: false,
      },
    }),
    "text/html"
  );

  let participant_holder = document.getElementById("no-participant-holder");
  if (participant_holder) participant_holder.remove();

  let old_user = document.querySelector(`.participant-row[data-userid="${user.Id}"`);
  if (old_user) {
    let user_participant_badge = old_user.getElementsByClassName("status-badge")[0];
    if (user_participant_badge.classList.contains("badge-success")) {
      // A second connection from same user
      let user_row_badge = user_row.getElementsByClassName("status-badge")[0];
      user_row_badge.dataset.sessions =
        parseInt(user_participant_badge.dataset.sessions) + 1;
    }
    old_user.remove();
  }

  let participant_table_wrapper = document.getElementById("participant-table");
  let participant_table = participant_table_wrapper.getElementsByTagName("tbody")[0];
  participant_table.insertBefore(user_row, participant_table.firstChild);

  if (participant_table_wrapper.classList.contains("d-none"))
    participant_table_wrapper.classList.remove("d-none");

  update_chat_title();
}

function update_participant_list_remove(user, reason = "transport close") {
  let old_user = document.querySelector(`.participant-row[data-userid="${user.Id}"]`);
  if (old_user) {
    let status_badge = old_user.getElementsByClassName("status-badge")[0];
    status_badge.dataset.sessions = parseInt(status_badge.dataset.sessions) - 1;
    if (status_badge.dataset.sessions <= 0) {
      if (reason === "transport close") {
        status_badge.className = "status-badge badge badge-dark";
        status_badge.textContent = "Inactive";
      } else {
        status_badge.className = "status-badge badge badge-danger";
        status_badge.textContent = "Banned";
      }
      status_badge.title = reason;
      sortTable(
        document.getElementById("participant-table").getElementsByTagName("table")[0]
      );
    }
  }

  update_chat_title();
}

// modified from https://www.w3schools.com/howto/howto_js_sort_table.asp
function sortTable(table) {
  var rows, switching, i, x, y, shouldSwitch;
  switching = true;
  while (switching) {
    switching = false;
    rows = table.rows;
    for (i = 1; i < rows.length - 1; i++) {
      shouldSwitch = false;
      x = rows[i].getElementsByTagName("td")[2];
      y = rows[i + 1].getElementsByTagName("td")[2];
      if (
        (x.textContent === "Inactive" && y.textContent === "Active") ||
        (x.textContent === "Banned" && y.textContent === "Inactive")
      ) {
        shouldSwitch = true;
        break;
      }
    }
    if (shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
    }
  }
}
