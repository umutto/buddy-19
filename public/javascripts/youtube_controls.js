window.addEventListener("DOMContentLoaded", function (evt) {
  var tag = document.createElement("script");

  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName("script")[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  var player;
  function onYouTubeIframeAPIReady() {
    player = new YT.Player("youtube-player", {
      origin: location.origin,
      videoId: "M7lc1UVf-VE",
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    });
  }
  function onPlayerReady(event) {
    event.target.playVideo();
  }
  function onPlayerStateChange(event) {
    console.log(event.data == YT.PlayerState.PLAYING);
  }
  function stopVideo() {
    player.stopVideo();
  }
});
