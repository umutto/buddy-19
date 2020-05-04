const messageType = Object.freeze({
  userConnected: 0,
  userDisconnected: 1,
  userChatMessage: 2,
  userChatReaction: 3,
});

window.addEventListener("DOMContentLoaded", function (evt) {
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
      // TODO: append this to chat (You have joined the room (smth))
      console.log(`You have successfully joined to ${response.message}!`);
      room = response.message;
    } else {
      console.log(response.message);
    }
  });

  socket.on("message_echo", function (message_type, context, ack = function () {}) {
    if (context.ChatMessage) append_to_chat(message_type, context);
    ack({ Code: 200, Message: context });
  });

  let chat_input = document.getElementById("chat-input");
  let chat_input_btn = document.getElementById("btn-chat-send");

  chat_input_btn.addEventListener("click", function () {
    send_chat_message(socket, chat_input.value);
    chat_input.value = "";
  });
  chat_input.addEventListener("keyup", function () {
    if (event.keyCode === 13) {
      send_chat_message(socket, chat_input.value);
      chat_input.value = "";
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

function send_chat_message(socket, text) {
  if (text !== "") {
    socket.emit("message", messageType.userChatMessage, { ChatMessage: text }, function (
      response
    ) {
      if (response.status === 200) {
        append_to_chat(messageType.userChatMessage, response.message);
      } else {
        create_toast(response.status, `${response.message}</br>${response.details}`);
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
    let chat_msg = chatMessageTemplate({
      UserAlias: c_user_alias,
      MessageUser: context.User,
      MessageTime: message_time,
      MessageText: context.ChatMessage,
      MessageType: message_type,
    });

    if (
      chat_display.lastChild &&
      chat_display.lastChild.dataset.type == messageType.userChatMessage &&
      chat_display.lastChild.dataset.userid === context.User.Id &&
      chat_display.lastChild.getElementsByClassName("chat-text").length < 10 &&
      chat_display.lastChild.getElementsByClassName("chat-time")[0].lastChild
        .textContent === message_time
    ) {
      let msg_text = new DOMParser()
        .parseFromString(chat_msg, "text/html")
        .getElementsByClassName("chat-text")[0];
      document
        .getElementById("chat-display")
        .lastChild.getElementsByClassName("chat-text")[0]
        .appendChild(msg_text);
    } else {
      chat_display.insertAdjacentHTML("beforeend", chat_msg);
    }
  }
  if (scroll_to_bottom)
    document.getElementById("chat-input").scrollIntoView({ behavior: "smooth" });
}
