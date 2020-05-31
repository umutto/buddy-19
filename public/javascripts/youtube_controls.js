var command_queue = [];
var player_loaded = false;
var initial_seek = 0;

window.addEventListener("DOMContentLoaded", function (evt) {
  loading_overlay(true, "Loading youtube embedded api...");
  var tag = document.createElement("script");

  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName("script")[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  document.addEventListener("roomJoin", function (response) {
    let player_load = null;
    player_load = setInterval(() => {
      if (player_loaded) {
        emit_message(socket, messageType.syncRequest, {}, function (data) {
          if (data.status === 200) {
            initPlaylistDetails(data.message);
            syncWithServer(data.message);
          }
        });
        clearInterval(player_load);
      }
    }, 500);
  });

  socket.on("message_echo", function (message_type, context, ack = function () {}) {
    if (
      message_type === messageType.roomControl &&
      document.getElementById("yt-control-sync").checked
    ) {
      // console.log("===========================");
      // console.log("Command Received: ", context.Command);
      if (["playVideo", "pauseVideo"].includes(context.Command))
        command_queue.push(context.Command);
      controlWrapper(context);
      ack();
    }
  });

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

  document
    .getElementById("yt-control-skip-next")
    .addEventListener("click", function (evt) {
      let next_video_id = prepNextVideo();
      if (next_video_id) {
        loadAndPlayNext(player, next_video_id);

        emit_message(socket, messageType.roomControl, {
          Command: "skipNext",
          VideoId: next_video_id,
        });
      }
    });

  document
    .getElementById("yt-control-autoplay")
    .addEventListener("change", function (evt) {
      updateCurrentVideoDetails(player);
    });

  document.getElementById("playlist-videos").addEventListener("click", function (evt) {
    if (evt.target) {
      if (evt.target.classList.contains("btn-playlist-up")) {
        let from = Array.from(
          document.getElementById("playlist-videos").children
        ).indexOf(evt.target.closest(".playlist-item"));
        if (from > 0) {
          emit_message(socket, messageType.roomControl, {
            Command: "movePlaylistItem",
            FromIndex: from,
            ToIndex: from - 1,
            VideoId: evt.target.closest(".playlist-item").dataset.videoid,
          });

          movePlaylistItem(from, from - 1);
        }
      } else if (evt.target.classList.contains("btn-playlist-down")) {
        let from = Array.from(
          document.getElementById("playlist-videos").children
        ).indexOf(evt.target.closest(".playlist-item"));
        if (
          from !== -1 &&
          from + 1 < document.getElementById("playlist-videos").children.length
        ) {
          emit_message(socket, messageType.roomControl, {
            Command: "movePlaylistItem",
            FromIndex: from + 1,
            ToIndex: from,
            VideoId: evt.target.closest(".playlist-item").dataset.videoid,
          });

          movePlaylistItem(from + 1, from);
        }
      } else if (evt.target.classList.contains("btn-playlist-remove")) {
        let remove_idx = Array.from(
          document.getElementById("playlist-videos").children
        ).indexOf(evt.target.closest(".playlist-item"));

        emit_message(socket, messageType.roomControl, {
          Command: "removePlaylistItem",
          Index: remove_idx,
          VideoId: evt.target.closest(".playlist-item").dataset.videoid,
        });

        removePlaylistItem(remove_idx);
      }
    }
  });
});

function emit_message(socket, message_type, context, ack = () => {}) {
  if (document.getElementById("yt-control-sync").checked)
    socket.emit("message", message_type, { TimeSent: new Date(), ...context }, ack);
}

var player, loader, loaderStateFunc;
function onYouTubeIframeAPIReady() {
  player = new YT.Player("youtube-player", {
    host: `${window.location.protocol}//www.youtube.com`,
    origin: location.origin,
    events: {
      onReady: function (event) {
        loading_overlay(false);
        player_loaded = true;
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
  const tracked_events = [
    YT.PlayerState.CUED,
    YT.PlayerState.PLAYING,
    YT.PlayerState.PAUSED,
    YT.PlayerState.ENDED,
  ];
  if (!tracked_events.includes(event.data)) return;

  let recv_command = [YT.PlayerState.PLAYING, YT.PlayerState.PAUSED].includes(event.data)
    ? command_queue.shift()
    : null;

  let current_id = event.target.getVideoData().video_id;
  let current_time = event.target.getCurrentTime();
  let current_pl_idx = Array.from(
    document.getElementById("playlist-videos").children
  ).indexOf(document.querySelector("#playlist-videos li.active-child"));

  if (event.data === YT.PlayerState.CUED) {
    hidePlaceholderMessage();
  } else if (event.data === YT.PlayerState.PLAYING) {
    updateCurrentVideoDetails(event.target);

    if (initial_seek) {
      if (
        player.getCurrentTime() - 1 < initial_seek &&
        initial_seek < player.getCurrentTime() + 1
      )
        initial_seek = 0;
      else player.seekTo(initial_seek);
    } else if (!recv_command || recv_command !== "playVideo")
      emit_message(socket, messageType.roomControl, {
        Command: "playVideo",
        Seconds: current_time,
        VideoId: current_id,
        Index: current_pl_idx,
        Event: event.data,
      });
  } else if (event.data === YT.PlayerState.PAUSED) {
    if (!recv_command || recv_command !== "pauseVideo")
      emit_message(socket, messageType.roomControl, {
        Command: "pauseVideo",
        Seconds: current_time,
        VideoId: current_id,
        Index: current_pl_idx,
        Event: event.data,
      });
  } else if (
    event.data === YT.PlayerState.ENDED &&
    document.getElementById("yt-control-autoplay").checked
  ) {
    let next_video_id = prepNextVideo();
    if (next_video_id) loadAndPlayNext(player, next_video_id);
  }

  // console.log("---------------------------");
  // console.log(
  //   Object.keys(YT.PlayerState).find((key) => YT.PlayerState[key] === event.data)
  // );
  // console.log("Command queue: ", command_queue);
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
  } else if (context.Command === "removePlaylistItem") {
    removePlaylistItem(context.Index);
  } else if (context.Command === "skipNext") {
    let next_video_id = prepNextVideo();
    if (next_video_id) loadAndPlayNext(player, next_video_id);
  }
}

function hidePlaceholderMessage() {
  if (document.getElementById("youtube-player").classList.contains("d-none")) {
    document.getElementById("youtube-player").classList.remove("d-none");
    document.getElementById("player-placeholder").classList.add("d-none");
  }
}

function initPlaylistDetails(context) {
  let playlist = context.Playlist;
  if (!playlist || playlist.length === 0) return clearPlaylist();

  playlist.forEach((v) => {
    addToPlaylistByData(v);
  });
}

function syncWithServer(context) {
  if (
    context.CurrentIndex === -1 ||
    document.getElementById("playlist-videos").children.length === 0
  )
    return;

  let next_video_id = prepNextVideo(context.CurrentIndex);
  if (next_video_id) {
    loadAndPlayNext(player, next_video_id, false);

    if (context.CurrentState === 1) {
      command_queue.push("playVideo");
      initial_seek = (new Date() - new Date(context.CurrentSeconds)) / 1000;
      player.playVideo();
    }
  }
}

function loadAndPlayNext(player, video_id, play = null) {
  play = play !== null ? play : document.getElementById("yt-control-autoplay").checked;
  player.cueVideoById({ videoId: video_id });
  if (play) player.playVideo();
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

    if (pl_length === 0) {
      let next_video_id = prepNextVideo();
      if (next_video_id) loadAndPlayNext(player, next_video_id, false);
      updateCurrentVideoDetails(loader);
    } else {
      updateCurrentVideoDetails(player);
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

function prepNextVideo(idx = null) {
  let pl_childs = document.getElementById("playlist-videos").children;
  if (pl_childs.length === 0)
    return create_toast(
      "Playback Error",
      "There are no videos on the playlist",
      "red",
      2500
    ).toast("show");

  let current_video = document.querySelector("#playlist-videos li.active-child");

  let next_video = null;
  if (idx !== null && idx < pl_childs.length) {
    next_video = pl_childs[idx];
  } else if (
    pl_childs.length > 1 &&
    document.getElementById("yt-control-shuffle").checked
  ) {
    let c_idx = Array.from(pl_childs).indexOf(current_video),
      r_idx = 0;
    do {
      r_idx = Math.floor(Math.random() * pl_childs.length);
    } while (r_idx === c_idx);
    next_video = pl_childs[r_idx];
  } else if (current_video.nextElementSibling) {
    next_video = current_video.nextElementSibling;
  } else {
    next_video = current_video.parentElement.firstElementChild;
  }

  if (current_video) current_video.classList.remove("active-child");
  next_video.classList.add("active-child");

  return next_video ? next_video.dataset.videoid : null;
}

function movePlaylistItem(from, to) {
  let parent_elem = document.getElementById("playlist-videos");
  let pl_childs = parent_elem.children;

  if (from > pl_childs.length || to > pl_childs.length) return;

  let from_child = pl_childs[from],
    to_child = pl_childs[to];

  if (to_child === pl_childs.length - 1) parent_elem.appendChild(from_child);
  else parent_elem.insertBefore(from_child, to_child);

  updateCurrentVideoDetails(player);
}

function clearPlaylist() {
  let n_childs = document.getElementById("playlist-videos").children.length;
  for (--n_childs; n_childs >= 0; n_childs--) removePlaylistItem(n_childs);
}

function removePlaylistItem(idx) {
  let _clean = false;
  let pl_childs = document.getElementById("playlist-videos").children;

  if (pl_childs.length === 0) {
    return;
  } else if (pl_childs.length === 1) {
    player.loadVideoById("");
    player.getIframe().classList.add("d-none");
    document.getElementById("player-placeholder").classList.remove("d-none");
    _clean = true;
  } else if (pl_childs[idx].classList.contains("active-child")) {
    let next_video_id = prepNextVideo();
    if (next_video_id) loadAndPlayNext(player, next_video_id);
  }

  document.getElementById("playlist-header-num").textContent = Math.max(
    0,
    parseInt(document.getElementById("playlist-header-num").textContent) - 1
  );
  pl_childs[idx].remove();

  updateCurrentVideoDetails(player, _clean);
}

async function updateCurrentVideoDetails(target_player, clean = false) {
  // TODO: simplify this, just copy and paste from playlist item, and add more details to playlist items (like url and author)
  // remove target_player argument and get everything from the child-active and dom
  let video_data = !clean
    ? target_player.getVideoData()
    : { title: "", video_id: "", author: "" };

  if (!video_data || target_player.getPlayerState() === YT.PlayerState.CUED) return;

  document.getElementById("yt-playing-title").textContent = video_data.title;

  let video_url = target_player.getVideoUrl();
  document
    .querySelectorAll("a.yt-playing-video-link")
    .forEach((a) => (a.href = video_url ? target_player.getVideoUrl() : "#"));

  let author_elem = document.getElementById("yt-playing-author");
  let author_link = document.getElementById("yt-playing-author-link");
  if (video_data.author) {
    author_link.classList.remove("d-none");
    author_elem.textContent = `by ${video_data.author}`;
    author_link.href = `https://www.youtube.com/${video_data.author}`;
  } else {
    author_link.classList.add("d-none");
  }

  if (clean) document.getElementById("yt-control-skip-next").classList.add("d-none");
  else document.getElementById("yt-control-skip-next").classList.remove("d-none");

  let duration = target_player.getDuration();
  if (duration)
    document.getElementById("yt-playing-time").textContent = get_duration_string(
      duration
    );

  document.getElementById("yt-playing-thumbnail").src = video_data.video_id
    ? `https://img.youtube.com/vi/${video_data.video_id}/sddefault.jpg`
    : "/images/logo.png";
  document.getElementById("yt-playing-thumbnail").alt = video_data.title;

  if (!clean) {
    let pl_childs = document.getElementById("playlist-videos");
    let current_video = pl_childs.querySelector("li.active-child");

    let next_video =
      current_video.nextElementSibling ||
      (current_video === pl_childs.lastElementChild &&
      pl_childs.length != 1 &&
      document.getElementById("yt-control-autoplay").checked
        ? pl_childs.firstElementChild
        : null);

    if (next_video) {
      document.getElementById("next-wrapper").classList.remove("d-none");
      document.getElementById(
        "yt-next-title"
      ).textContent = next_video.getElementsByClassName("video-title")[0].textContent;
      document.getElementById(
        "yt-next-time"
      ).textContent = next_video.getElementsByClassName("video-duration")[0].textContent;
    }
  } else {
    document.getElementById("next-wrapper").classList.add("d-none");
    document.getElementById("yt-next-title").textContent = "";
    document.getElementById("yt-next-time").textContent = "";
  }
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
