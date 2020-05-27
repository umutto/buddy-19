<p align="center">
  <img style="max-width:700px; height:auto;" src="public/images/logo_cover.png">
</p>

# buddy-19

Your COVID-19 meeting buddy!

## About

Buddy-19 is aimed to be a web app that goes along with your online meetings. With Buddy-19 visitors can create public/private rooms to enjoy playing games with their friends.

### How to use

You can create a room from the index url. Once you've create the room, people can join using the url with the room number or reading the QR code with the room url. There are multiple types of rooms that can be selected when creating a room;

- **Quiz room**: People in the room take turns asking questions.

  - These questions can be an image, video, text, freely set by the quiz master for that turn.
  - Question answers can be multiple selections, free text (levenshtein distance is used to ignore typos) input, numeric input (closest guesses get more points), or you can set a buzzer button to make it more like a game show.
  - Answers can be submitted once the quiz master for that round clicks submit, there is a countdown before the question is revealed and a delay compensation when a user submits their answer so it's pretty much fair. But bear in mind, that this is an app to have fun together with friends.
  - Users can have limited time to answer, set by the original room host.
  - Points for the people answer correctly goes as 100 \* # of people in the room for the fastest answer and decreases by 100 for rest of the people.
  - Room host can also set the room to go multiple rounds, and last round gives double points to make it more spicy.

- **Sketch room**: This is playing pictionary online, where a user draws something and others try to guess. People guess correctly in the faster time gets more points. (Similar to skribbl.io). Same quiz room turn and round settings can set.

- **Youtube room**: You can watch youtube videos in sync with your friends, this could be a new trailer where you all want to react together, a funny cat video or the background music in your online meetings. Depending on your settings, this could be a playlist you're DJ'ing to your friends or a complete free list where everyone can play their most funny videos.

- **Custom rooms**: This is currently in idea phase, eventually aimed to be something where people can create their own custom games using a simple JSON rule sheet.

In all rooms, hosts can set a background theme, users can chat and interact with reactions and more. Moreover you can create and join as many rooms as you want (you want a background music while playing in a quiz room? sure!). And there is no time or participant limit on rooms! (Limit is the sky! or more like the processing power of my cheap server in the cloud. As well as the ui elements, it would most probably break with more that 10 people.)

### Background

This just a fun project that I've started doing to practice my node backend and play with socket.io during the self-quarantine. It is hastily made, and just a side project that I don't intend to make money or anything. So do what you want with it, but bear in mind I'm currently the sole developer and hosting it with my own funds, so I opted out for the cheap and quick ways, anything and everything can broke. If you want to help feel free to send a pull request or open up an issue.

### TODO

- Check and create if db file does not exists (using buddy19.db.sql)
  - Encrypt/decrypt room passwords (bcrypt)
- Create a header on layout (for logo and return to main page) and a footer (for terms, contact and attributions).
- Youtube room.
  - Use [https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API](clipboard API) to check for youtube video urls.
- Sketch room.
- User & room histories.
- Participant list interactions (muting, removing, reporting etc..)
- Public servers and room listings.
- Migrate to vanilla javascript solution, (get rid of jQuery) once bootstrap 5.0 supports vanilla.
- Consistent user socket.io connection (identify a reconnecting or already online user, and act accordingly. Probably required to decently let users join multiple rooms. Could be simply attaching c_user_alias to socket and db)
- Add user reactions on chat (something like these [https://youtu.be/ffnqLIrM3n8](https://youtu.be/ffnqLIrM3n8) but obviously royalty free)
- Add an emoji picker on chat.
- Get a good Chrome Lighthouse score.
  - Seems like bootstrap.min.css is the worst culprit. It's MIT license, so prune the unused, and add font-swap etc...
- Make a twitch bot.
- Add localization (very low priority).

#### Future updates

- Add a voting option, for selecting the best answers (this functionality can open up for games like that are in JackBox)
- Games like Dixit, werewolf game, Cards against humanity etc... (as long as there are no copyright issues, and a simple implementation is possible)
- Guess the song game (playing youtube music in the background and trying to guess the song title or the artist)

## About usage data

- This app uses google analytics with anonymized user ID's to measure usage data. Nothing you enter (be it usernames, quizzes, messages, answers etc.. ) is sent and used by us or a third party.

## Attributions

- Uses Express.js, Bootstrap and Material design icons.
- Some background patterns for the themes are downloaded from [https://www.toptal.com/designers/subtlepatterns/](Toptal Subtle Patterns)
- Animal user icons are downloaded from [https://pngtree.com/so/animal](animal png from pngtree.com)
- Logo and favicon are created using [Hatchful](https://hatchful.shopify.com/) and [favicon.ico](favicon.ico)
