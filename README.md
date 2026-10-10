# Tilt Guess

A party word game for your phone. It runs in the web browser. You do not install anything.

## How to play

1. Open the game on your phone and pick a category.
2. Hold the phone sideways on your forehead. The screen faces your friends.
3. Your friends describe the word on the screen. You guess it.
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
| `words.js` | The word lists. Edit this file to add or change words and categories. |
| `manifest.webmanifest`, `icon.svg` | Let you add the game to your home screen as an app icon |

## Tilt sensor

The game reads the phone's motion sensor through the browser. The sensor works only when the page loads over **HTTPS** (a secure web address). GitHub Pages gives you HTTPS.

To change how far you must tilt, edit `TILT_TRIGGER` at the top of `app.js`.

## Test on a computer

Open `index.html` in a browser. Press Enter to start. Then use the keyboard:

- Down arrow = correct
- Up arrow = skip
