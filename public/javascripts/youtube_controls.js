var command_queue = [];

window.addEventListener("DOMContentLoaded", function (evt) {
  loading_overlay(true, "Loading youtube embedded api...");
  var tag = document.createElement("script");

  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName("script")[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  socket.on("room_echo", function (context, ack = function () {}) {
    context.Playlist.forEach((v) => {
      addToPlaylistByData(v);
    });
    let play_diff = (new Date() - new Date(context.TimeSent)) / 100;
    player.seekTo(context.CurrentTime + play_diff);
    player.playVideo();
    ack();
  });

  socket.on("message_echo", function (message_type, context, ack = function () {}) {
    if (
      message_type === messageType.roomControl &&
      document.getElementById("yt-control-sync").checked
    ) {
      command_queue.push(context.Command);
      controlWrapper(context);
      ack();
    }
  });
  // TODO
  // on initial load, get current youtube song and timing, and playlist (by some kind of direct handshake from host)
  // do the same when yt-control-sync is checked
  // do the same on socket.on("reconnect", function(attemptNumber){}) // this also fires on socket.on("connect")

  let yt_playlist_add = document.getElementById("yt-playlist-add");
  let yt_input = document.getElementById("yt-playlist-input");
  function playlist_evt_add() {
    loading_overlay(true, "Gathering information about the video...");
    addToPlaylistByData({ video_url: yt_input.value }, function (VideoData) {
      yt_input.value = "";

      emit_message(socket, messageType.roomControl, {
        Command: "addToPlaylist",
        VideoData,
      });
      loading_overlay(false);
    });
  }
  yt_playlist_add.addEventListener("click", playlist_evt_add);
  yt_input.addEventListener("keyup", function () {
    if (event.keyCode === 13) {
      playlist_evt_add();
    }
  });
});

function emit_message(socket, message_type, context) {
  if (document.getElementById("yt-control-sync").checked)
    socket.emit("message", message_type, { TimeSent: new Date(), ...context });
}

var player, loader, loaderStateFunc;
function onYouTubeIframeAPIReady() {
  player = new YT.Player("youtube-player", {
    host: `${window.location.protocol}//www.youtube.com`,
    origin: location.origin,
    events: {
      onReady: function (event) {
        loading_overlay(false);
      },
      onStateChange: onPlayerStateChange,
    },
  });
  loader = new YT.Player("youtube-player-loader", {
    origin: location.origin,
    events: {
      onReady: function (event) {
        event.target.mute();
      },
      onStateChange: onLoaderStateChange,
    },
  });
}
function onPlayerStateChange(event) {
  // TODO: call the host function if exists which echoes same events to others
  // (in case it's not set as free, do all this work in serverside, pass the appropriate functions on initial handshake)
  const tracked_events = [
    YT.PlayerState.CUED,
    YT.PlayerState.PLAYING,
    YT.PlayerState.PAUSED,
    YT.PlayerState.ENDED,
  ];
  if (!tracked_events.includes(event.data)) return;

  let recv_command = command_queue.shift();

  console.log(
    Object.entries(YT.PlayerState).filter((e) => e[1] === event.data)[0][0] +
      " - " +
      recv_command +
      " - " +
      event.target.getCurrentTime()
  );

  if (event.data === YT.PlayerState.CUED) {
    hidePlaceholderMessage();
  } else if (event.data === YT.PlayerState.PLAYING) {
    updateCurrentVideoDetails(event.target);

    if (!recv_command || recv_command !== "playVideo")
      emit_message(socket, messageType.roomControl, {
        Command: "playVideo",
        Seconds: event.target.getCurrentTime(),
        Event: event,
      });
  } else if (event.data === YT.PlayerState.PAUSED) {
    updateCurrentVideoDetails(event.target);

    if (!recv_command || recv_command !== "pauseVideo")
      emit_message(socket, messageType.roomControl, {
        Command: "pauseVideo",
        Event: event,
      });
  } else if (
    event.data === YT.PlayerState.ENDED &&
    document.getElementById("yt-control-autoplay").checked
  ) {
    playNextVideo();
  }
}
function onLoaderStateChange(event) {
  if (loaderStateFunc) loaderStateFunc(event);
}

function controlWrapper(context) {
  if (context.Command === "playVideo") {
    let play_diff = (new Date() - new Date(context.TimeSent)) / 100;
    player.seekTo(context.Seconds + play_diff);
    player.playVideo();
  } else if (context.Command === "pauseVideo") {
    player.pauseVideo();
  } else if (context.Command === "addToPlaylist") {
    addToPlaylistByData(context.VideoData);
  }
}

function hidePlaceholderMessage() {
  if (document.getElementById("youtube-player").classList.contains("d-none")) {
    document.getElementById("youtube-player").classList.remove("d-none");
    document.getElementById("player-placeholder").classList.add("d-none");
  }
}

function loadAndPlay(player, video_id, play = false) {
  player.cueVideoById({ videoId: video_id });
  if (play) player.playVideo();
  updateCurrentVideoDetails(player);
}

function addToPlaylistByData(video_data, cb = function () {}) {
  let video_id =
    video_data.video_id ||
    (check_url(video_data.video_url) ? extract_id(video_data.video_url) : null);

  if (!video_id) {
    loading_overlay(false);
    return create_toast(
      "Playback Error",
      `${video_data.video_url} is not a valid url, make sure you copy and paste the url of the video.`,
      "red",
      2500
    ).toast("show");
  }

  if (video_data.title) {
    let pl_length = document.getElementById("playlist-videos").children.length;
    let pl_video = playlistVideoTemplate({ is_active: pl_length === 0, video_data });
    document.getElementById("playlist-videos").insertAdjacentHTML("beforeend", pl_video);

    if (pl_length === 0) playNextVideo();
    else if (pl_length === 1) {
      document.getElementById("next-wrapper").classList.remove("d-none");
      document.getElementById("yt-next-title").textContent = document
        .getElementById("playlist-videos")
        .lastChild.getElementsByClassName("video-title")[0].textContent;
      document.getElementById("yt-next-time").textContent = document
        .getElementById("playlist-videos")
        .lastChild.getElementsByClassName("video-duration")[0].textContent;
    }
    document.getElementById("playlist-header-num").textContent =
      parseInt(document.getElementById("playlist-header-num").textContent) + 1;

    cb(video_data);
  } else {
    loaderStateFunc = function (event) {
      if (event.data === YT.PlayerState.PLAYING) {
        event.target.stopVideo();

        let _video_data = event.target.getVideoData();
        _video_data.duration = get_duration_string(event.target.getDuration());
        _video_data.video_url = event.target.getVideoUrl();
        addToPlaylistByData(_video_data, cb);
      }
    };
    loader.loadVideoById({ videoId: video_id });
  }
}

function playNextVideo() {
  if (document.getElementById("playlist-videos").getElementsByTagName("li").length === 0)
    return create_toast(
      "Playback Error",
      "There are no videos on the playlist",
      "red",
      2500
    );

  let current_video = document.querySelector("#playlist-videos li.active-child");

  let next_video = current_video.nextElementSibling
    ? current_video.nextElementSibling
    : current_video.parentElement.firstElementChild;

  loadAndPlay(player, next_video.dataset.video, true);

  current_video.classList.remove("active-child");
  next_video.classList.add("active-child");

  if (current_video.nextElementSibling) {
    let playlist_next = current_video.nextElementSibling.nextElementSibling
      ? current_video.nextElementSibling.nextElementSibling
      : current_video.parentElement.firstElementChild;

    document.getElementById(
      "yt-next-title"
    ).textContent = playlist_next.getElementsByClassName("video-title")[0].textContent;
    document.getElementById(
      "yt-next-time"
    ).textContent = playlist_next.getElementsByClassName("video-duration")[0].textContent;
  }

  document.getElementById("yt-control-skip-next").classList.remove("d-none");
}

async function updateCurrentVideoDetails(target_player, clean = false) {
  let video_data = !clean ? target_player.getVideoData() : { title: "", video_id: "" };

  if (!video_data) return;

  document.getElementById("yt-playing-title").textContent = video_data.title;

  document
    .querySelectorAll("a.yt-playing-video-link")
    .forEach((a) => (a.href = target_player.getVideoUrl()));

  let author_elem = document.getElementById("yt-playing-author");
  let author_link = document.getElementById("yt-playing-author-link");
  if (video_data.author) {
    author_link.classList.remove("d-none");
    author_elem.textContent = `by ${video_data.author}`;
    author_link.href = `https://www.youtube.com/${video_data.author}`;
  } else {
    author_link.classList.add("d-none");
  }

  let duration = target_player.getDuration();
  document.getElementById("yt-playing-time").textContent = get_duration_string(duration);

  document.getElementById("yt-playing-thumbnail").src = video_data.video_id
    ? `https://img.youtube.com/vi/${video_data.video_id}/sddefault.jpg`
    : "/images/logo.png";
  document.getElementById("yt-playing-thumbnail").alt = video_data.title;
}

function get_duration_string(duration) {
  return duration >= 60 * 60
    ? "Over an hour"
    : `${Math.floor(duration / 60)
        .toString()
        .padStart("2", "0")}:${Math.floor(duration % 60)
        .toString()
        .padStart("2", "0")}`;
}

function check_url(text) {
  if (!text) return null;
  let regex = new RegExp(
    /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi
  );
  return text.match(regex);
}

function extract_id(url) {
  let rx = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
  return (r = url.match(rx)[1]);
}
