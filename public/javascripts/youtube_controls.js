window.addEventListener("DOMContentLoaded", function (evt) {
  var tag = document.createElement("script");

  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName("script")[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
});

var player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player("youtube-player", {
    origin: location.origin,
    videoId: "2XITBuWNROk",
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
}

function onPlayerReady(event) {
  //   event.target.playVideo();
  document.getElementById("youtube-player").classList.remove("d-none");
  updateCurrentVideoDetails(event.target);
}
function onPlayerStateChange(event) {
  //   console.log(event.data == YT.PlayerState.PLAYING);
  console.log(event.data);
  console.log(event.target.getCurrentTime());

  if (event.data === YT.PlayerState.PLAYING) updateCurrentVideoDetails(event.target);
}
function stopVideo() {
  player.stopVideo();
}

async function updateCurrentVideoDetails(target_player) {
  let video_data = target_player.getVideoData();

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
  document.getElementById("yt-playing-time").textContent =
    duration >= 60 * 60
      ? "Over an hour"
      : `${Math.floor(duration / 60)
          .toString()
          .padStart("2", "0")}:${Math.floor(duration % 60)
          .toString()
          .padStart("2", "0")}`;

  document.getElementById(
    "yt-playing-thumbnail"
  ).src = `https://img.youtube.com/vi/${video_data.video_id}/sddefault.jpg`;
  document.getElementById("yt-playing-thumbnail").alt = video_data.title;
}
