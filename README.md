# buddy-19

Your COVID-19 meeting buddy!

---

## About

Buddy-19 is aimed to be a web app that goes along with your online meetings. With Buddy-19 visitors can create public/private rooms to enjoy playing games with their friends.

### How to use

You can create a room from the index url. Once you've create the room, people can join using the url with the room number or reading the QR code with the room url. There are multiple types of rooms that can be selected when creating a room;

- **Quiz room**: People in the room take turns asking questions.

  - These questions can be an image, video, text, freely set by the quiz master for that turn. Question answers can be multiple selections, free text (levenshtein distance is used to ignore typos) input, or you can set a buzzer button to make it more like a game show.
  - Answers can be submitted once the quiz master for that round clicks submit, there is a countdown before the question is revealed and a delay compensation when a user submits their answer so it's pretty much fair. But bear in mind, that this is an app to have fun together with friends.
  - Users can have limited time to answer, set by the original room host.
  - Points for the people answer correctly goes as 100 \* # of people in the room for the fastest answer and decreases by 100 for rest of the people.
  - Room host can also set the room to go multiple rounds, and last round gives double points to make it more spicy.

- **Sketch room**: This is playing pictionary online, where a user draws something and others try to guess. People guess correctly in the faster time gets more points. (Similar to skribbl.io). Same quiz room turn and round settings can set.

- **Youtube room**: You can watch youtube videos in sync with your friends, this could be a new trailer where you all want to react together, a funny cat video or the background music in your online meetings. Depending on your settings, this could be a playlist you're DJ'ing to your friends or a complete free list where everyone can play their most funny videos.

In all rooms, hosts can set a background theme, users can chat and interact with reactions and more. Moreover you can create and join as many rooms as you want (you want a background music while playing in a quiz room? sure!). And there is no time or participant limit on rooms! (Limit is the sky! or more like the processing power of my cheap server in the cloud.)

### Background

This just a fun project that I've started doing to practice my node backend and play with socket.io during the self-quarantine. It is hastily made, and just a side project that I don't intend to make money or anything. So do what you want with it, but bear in mind I'm currently the sole developer and hosting it with my own funds, so I opted out for the cheap and quick ways, anything and everything can broke. If you want to help feel free to send a pull request or open up an issue.

### TODO

- Create a header on layout (for logo and return to main page) and a footer (for terms, contact and attributions).
- Sketch room.
- Youtube room.
- User & room histories.
- Public servers and room listings.
- Migrate to vanilla javascript solution, (get rid of jQuery) once bootstrap 5.0 supports vanilla.

#### Future updates

- Add a voting option, for selecting the best answers (this functionality can open up for games like that are in JackBox)
- Games like Dixit, Cards against humanity etc... (as long as there are no copyright issues, and a simple implementation is possible)
- Guess the song game (playing youtube music in the background and trying to guess the song title or the artist)

---

## About usage data

- This app uses google analytics with anonymized user ID's to measure usage data. Nothing you enter (be it usernames, quizzes, messages, answers etc.. ) is sent and used by us or a third party.

## Attributions

- Some background patterns for the themes are downloaded from [https://www.toptal.com/designers/subtlepatterns/](Toptal Subtle Patterns)
- Animal user icons are downloaded from [https://pngtree.com/so/animal](animal png from pngtree.com)
