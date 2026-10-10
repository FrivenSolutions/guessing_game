# Tilt Guess

Party games for your phone, made for waiting in line. It runs in the web browser. You do not install anything.

## Games

- **🔤 Word Guess** and **🖼️ Picture Guess:** tilt-to-guess games (rules below). Picture Guess shows a big emoji with the word under it, so young kids who cannot read yet can give clues.
- **🎬 Emoji Riddles:** the phone shows emoji clues for a movie. Name the movie, then tap "Show answer".
- **🤔 Would You Rather:** the phone shows two choices. Everyone picks one and says why. Turn on "Easy questions only" for little kids.
- **🙋 Simon Says:** the phone calls out actions and can read them aloud. Do the action only after "Simon says".
- **⚡ Reaction Race:** two players, one half of the screen each. Tap first when the screen turns green. Tap too early and the other player gets the point. First to 5 wins.
- **🌳 Offline Games:** rules for games with no phone: I Spy, 20 Questions, Rhyme Time, Story Chain and Count the Mickeys.

## How to play Word Guess and Picture Guess

1. Open the game on your phone and pick a category.
2. Hold the phone sideways on your forehead. The screen faces your friends.
3. Your friends give you clues. The **Round type** setting decides how:
   - **Describe it:** with words, but not the word itself.
   - **Act it out:** with actions only. No talking.
   - **Make the sound:** with noises only. No words.
4. **Correct:** nod forward. The screen tips toward the floor.
5. **Skip:** lean back. The screen tips toward the ceiling.
6. Bring the phone back upright before the next word.
7. When the timer ends, the app shows your score and the list of words.

## Files

| File | What it does |
|------|--------------|
| `index.html` | The screens of the game |
| `style.css` | Colors and layout |
| `app.js` | Game logic and tilt detection |
| `words.js` | Word Guess lists. Edit this file to add or change words and categories. |
| `pictures.js` | Picture Guess lists, as emoji and word pairs |
| `wyr.js` | Would You Rather questions. `true` at the end marks an easy question. |
| `offline.js` | Offline game rules |
| `riddles.js` | Emoji Riddles, as emoji clue and answer pairs |
| `simon.js` | Simon Says actions |
| `manifest.webmanifest`, `icon.svg` | Let you add the game to your home screen as an app icon |

## Tilt sensor

The game reads the phone's motion sensor through the browser. The sensor works only when the page loads over **HTTPS** (a secure web address). GitHub Pages gives you HTTPS.

To change how far you must tilt, edit `TILT_TRIGGER` at the top of `app.js`.

## Test on a computer

Open `index.html` in a browser. Press Enter to start. Then use the keyboard:

- Down arrow = correct
- Up arrow = skip
