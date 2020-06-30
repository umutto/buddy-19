var BaseRoom = require("./BaseRoom");

class YoutubeRoom extends BaseRoom {
  static InteractivityRules = {
    Free: 1,
    Moderated: 2,
    None: 3,
  };
  static SynchronizationModes = {
    Relaxed: 1,
    Normal: 2,
    Strict: 3,
  };
  Playlist = null;
  CurrentIndex = null;
  CurrentState = -1;
  CurrentSeconds = 0;
  constructor(nsp, args) {
    super(nsp, args);
    this.Playlist = args.Playlist || [];
    this.CurrentIndex = args.CurrentIndex || -1;

    // setInterval(() => {
    //   console.log(this.CurrentIndex);
    //   console.log(this.Playlist.sort((a, b) => (a.video_index > b.video_index ? 1 : -1)));
    // }, 2500);
  }

  onConnect(user) {
    let user_context = super.onConnect(user);

    return {
      ...user_context,
      Playlist: this.Playlist,
      CurrentIndex: this.CurrentIndex,
      CurrentState: this.CurrentState,
      CurrentSeconds: this.CurrentSeconds,
    };
  }

  onMessage(user, type, context) {
    let user_context = super.onMessage(user, type, context);

    if (type === this.MessageTypes.syncRequest) {
      user_context = {
        ...user_context,
        Playlist: this.Playlist,
        CurrentIndex: this.CurrentIndex,
        CurrentState: this.CurrentState,
        CurrentSeconds: this.CurrentSeconds,
      };
    } else if (type === this.MessageTypes.roomControl) {
      if (
        this.Settings.interactiveControls === YoutubeRoom.InteractivityRules.Moderated &&
        user.Id !== this.Host
      ) {
        // Room interactivity is set to Moderated
        // TODO: send a recommendation to host instead
        // Maybe I should move socket.emit to here... for this and future functionality
      } else if (
        this.Settings.interactiveControls === YoutubeRoom.InteractivityRules.None &&
        user.Id !== this.Host
      ) {
        // Room interactivity is set to Strict
        return null;
      } else {
        // Room interactivity is set to Relaxed
        if (context.Command === "playVideo" || context.Command === "pauseVideo") {
          let current_video = this.getVideoByIndex(context.Index, context.VideoId);
          this.CurrentIndex = current_video ? current_video.video_index : -1;
          this.CurrentState = context.Command === "playVideo" ? 1 : 2;
          this.CurrentSeconds = new Date(new Date().getTime() - context.Seconds * 1000);
        } else if (context.Command === "addToPlaylist") {
          this.Playlist.push({
            video_index: this.Playlist.length,
            add_date: new Date().toJSON(),
            ...context.VideoData,
          });
          if (this.CurrentIndex === -1) this.CurrentIndex = 0;
        } else if (
          context.Command === "movePlaylistItem" &&
          context.FromIndex <= this.Playlist.length &&
          context.ToIndex <= this.Playlist.length
        ) {
          let from_vid = this.getVideoByIndex(context.FromIndex, context.FromId);
          let to_vid = this.getVideoByIndex(context.ToIndex, context.ToId);

          if (from_vid && to_vid) {
            from_vid.video_index = context.ToIndex;
            to_vid.video_index = context.FromIndex;

            if (this.CurrentIndex === context.FromIndex)
              this.CurrentIndex = context.ToIndex;
            else if (this.CurrentIndex === context.ToIndex)
              this.CurrentIndex = context.FromIndex;
          }
        } else if (context.Command === "removePlaylistItem") {
          let remove_idx = this.Playlist.findIndex(
            (v) => v.video_id === context.VideoId && v.video_index === context.Index
          );
          if (remove_idx != -1) {
            this.Playlist.filter(
              (v) => v.video_index > this.Playlist[remove_idx].video_index
            ).forEach((v) => v.video_index--);
            this.Playlist.splice(remove_idx, 1);
          }

          if (context.Index < this.CurrentIndex) this.CurrentIndex--;
          else if (this.Playlist.length === 0) this.CurrentIndex = -1;
          else if (
            context.Index === this.CurrentIndex &&
            this.CurrentIndex === this.Playlist.length
          )
            this.CurrentIndex = 0;
        }
      }
    }

    return user_context;
  }

  getVideoByIndex(idx, id = null) {
    return this.Playlist.find(
      (v) => v.video_index === idx && (id ? v.video_id === id : true)
    );
  }
}

module.exports = YoutubeRoom;
