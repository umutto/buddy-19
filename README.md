# buddy-19

Your COVID-19 meeting buddy!

---

## How to use

Buddy-19 is aimed to be a web app that goes along with your online meetings. With Buddy-19 visitors can create public/private rooms to enjoy playing games with their friends.

You can create a room from the index url. Once you've create the room, people can join using the url with the room number or reading the QR code with the room url. There are multiple types of rooms that can be selected when creating a room;

- _Quiz room_: People in the room take turns asking questions.

  - These questions can be an image, video, text, freely set by the quiz master for that turn. Question answers can be multiple selections, free text (levenshtein distance is used to ignore typos) input, or you can set a buzzer button to make it more like a game show.
  - Answers can be submitted once the quiz master for that round clicks submit, there is a countdown before the question is revealed and a delay compensation when a user submits their answer so it's pretty much fair. But bear in mind, that this is an app to have fun together with friends.
  - Users can have limited time to answer, set by the original room host.
  - Points for the people answer correctly goes as 100 \* # of people in the room for the fastest answer and decreases by 100 for rest of the people.
  - Room host can also set the room to go multiple rounds, and last round gives double points to make it more spicy.

- _Sketch room_: This is playing pictionary online, where a user draws something and others try to guess. People guess correctly in the faster time gets more points. (Similar to skribbl.io)

- _Youtube room_: You can watch youtube videos in sync with your friends, this could be a new trailer where you all want to react together, a funny cat video or the background music in your online meetings. Depending on your settings, this could be a playlist you're DJ'ing to your friends or a complete free list where everyone can play their most funny videos.

## TODO

- Sketch room.
- Youtube room.
- User & room histories.
- Public servers and room listings.

### Future updates

- Add a voting option, for selecting the best answers (this functionality can open up for games like that are in JackBox)
- Games like Dixit, Cards against humanity etc... (as long as there are no copyright issues, and a simple implementation is possible)
- Guess the song game (playing youtube music in the background and trying to guess the song title or the artist)

---

## Attributions

- Some background patterns for the themes are downloaded from [https://www.toptal.com/designers/subtlepatterns/](Toptal Subtle Patterns)
- Animal user icons are downloaded from [https://pngtree.com/so/animal](animal png from pngtree.com)
