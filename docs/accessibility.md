# ♿ Accessibility

The goal is **WCAG 2.2 AA**: the forecast works with a keyboard, reads well with a screen reader, keeps its contrast on every sky in both themes and fits a phone held at 400 % zoom.

## 🧭 Structure

| Element      | Implementation                                                                                                 |
| ------------ | -------------------------------------------------------------------------------------------------------------- |
| 🏠 Landmarks | `header`, a `search` landmark around the city field, a labelled `nav` for saved places, `main` and `footer`    |
| ⏭️ Skip link | **Skip to the forecast** appears on the first <kbd>Tab</kbd> and moves focus to `main`                         |
| 🏷️ Headings  | One `h1` per page (the city, or the title of an error), an `h2` for every card, an `h2` for the settings panel |
| 🗂️ Regions   | Every card is a `section` labelled by its heading                                                              |
| 🌍 Language  | `<html lang>` matches the address; every language link in the settings carries its own `lang` and `hreflang`   |
| 📋 Lists     | Hours, days and saved places are real `ol` and `ul` lists, so screen readers announce how many items they have |

## ⌨️ Keyboard

Every control is a native element or follows an ARIA pattern exactly:

| Control                  | Element                                                                                         | Keys                                                                              |
| ------------------------ | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 🔎 City search           | ARIA 1.2 combobox with a listbox and `aria-activedescendant`                                    | Arrows to move, <kbd>Enter</kbd> to open, <kbd>Esc</kbd> to close, again to clear |
| 📍 Use my location       | `button`                                                                                        | <kbd>Enter</kbd> or <kbd>Space</kbd>                                              |
| ⚙️ Settings              | `button` that opens a native `<dialog popover>`                                                 | <kbd>Enter</kbd> to open, <kbd>Esc</kbd> or the close button to close             |
| 🌗 Theme, units, effects | Radio groups inside a `fieldset` with a `legend`; Effects explains Auto with `aria-describedby` | <kbd>Tab</kbd> to the group, arrows to choose                                     |
| 🌍 Language              | A list of links to the same place in every language                                             | <kbd>Tab</kbd>, <kbd>Enter</kbd>                                                  |
| ⭐ Save a place          | Toggle `button` with `aria-pressed` and a name that never changes                               | <kbd>Enter</kbd> or <kbd>Space</kbd>                                              |
| 🏷️ Saved places          | A link per place and a remove `button` per chip                                                 | <kbd>Tab</kbd>, <kbd>Enter</kbd>                                                  |
| 🕒 Hourly forecast       | A focusable, labelled list that scrolls sideways on phones                                      | <kbd>Tab</kbd> to the list, arrows to scroll                                      |

Focus is always visible: a 2 px ring in `--color-focus` with an offset, drawn inside the hourly list so the card never clips it.

> [!NOTE]
> The star used to change its name from **Save Lviv** to **Remove Lviv from saved places** while also reporting `aria-pressed`. Screen readers then announced _Remove Lviv, toggle button, pressed_, which contradicts itself. A toggle button keeps one name, and the pressed state says whether the place is saved.

## 🗣️ Screen readers

- 🔢 Charts are decorative (`aria-hidden`) and their numbers are in the text as well: every day says _from 6° to 18°_, the hourly chance of rain reads _40 % chance of precipitation_, the current temperature is introduced as _Current weather: 13°_.
- 🔎 The combobox announces _Suggestions: 3_ through an `output` element; loading, empty results and failures are written into the list as text.
- 📍 Location errors (_Location access is blocked in your browser_) appear in an `output` next to the button and disappear after six seconds.
- 📴 The offline notice is an `output`, so it is announced politely when the connection drops. The `output` stays on the page while the app is online and only its text changes, because a live region that appears together with its message is often never read.
- 🏳️ Flags are decorative: the country is written out next to the city in the current weather and in every suggestion.
- 🖼️ Weather icons in the hourly row carry the condition as their `alt` text; the large icon of the current weather is decorative because the description is right next to it.
- ⏳ The forecast skeleton is a `status` with `aria-busy` and the label _Loading the forecast…_.
- 🚨 Forecast errors are an `alert` with an `h1`, so the reason is read at once and the page still has a heading.

## 🎨 Colour and contrast

- 📏 Text reaches **4.5:1** and large values and graphical marks **3:1** against the glass in both themes, over the brightest and the darkest sky. Secondary text is 74-78 % and tertiary text 62-64 % of the text colour, tuned with axe on every sky.
- 🌡️ Colour never carries meaning alone: temperature bars print their low and high, the air quality scale prints the level in words, every detail tile prints its value and a word such as _Low_, _Normal_ or _High_, and its bar only repeats them.
- 🧪 The accessibility tests run axe on pages with clear, rainy, snowy and stormy skies in light and dark mode.

## 🌊 Motion and preferences

| Preference                        | Response                                                                                                 |
| --------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 🐢 `prefers-reduced-motion`       | Rain, snow, drifting clouds, the sky glow and the weather icons stand still; every transition lasts 1 ms |
| 🌫️ `prefers-reduced-transparency` | Glass becomes solid without blur                                                                         |
| 🔆 `prefers-contrast: more`       | Glass becomes solid with a visible outline, secondary text gets almost the full text colour              |
| 🌗 `prefers-color-scheme`         | The **Auto** theme follows it live                                                                       |
| 🖥️ `forced-colors: active`        | Every glass card gets a real border, the chosen option and the current language get a `Highlight` ring   |

> [!TIP]
> Chrome DevTools can emulate all of these: open **Rendering** and choose `prefers-reduced-motion`, `prefers-contrast`, `prefers-reduced-transparency` or `forced-colors`, or a vision deficiency such as deuteranopia.

## 📱 Zoom and small screens

The layout reflows down to **320 px**, the width of a 1280 px window zoomed to 400 %, without horizontal page scrolling (WCAG 1.4.10):

- 📅 The daily rows use a container query and switch to narrower columns when their card is under 18 rem wide.
- 🧭 The compass grows and shrinks with its card, and the wind rows wrap their value under the label when a language needs more room (`Напрямок 235° ПдЗх`).
- 🕒 The hourly list scrolls inside its card, and it is `position: relative`, so the visually hidden texts inside it cannot widen the page.

> [!WARNING]
> `visually-hidden` elements are `position: absolute`. Inside a scroll container that is not positioned itself, they are laid out relative to an ancestor outside the scroller, escape its clipping and widen the whole page. Give every scroll container `position: relative`.

## ✅ How it is checked

- 🤖 **axe-core** runs in the end-to-end tests on six pages in five languages (four skies, an unknown city and the 404 page), in the dark theme, with the settings panel open and with the suggestions open, on desktop and phone screens, with no violations. Two rules that axe leaves off by default are switched on: `label-content-name-mismatch` and `target-size`, which asks for 24 × 24 px targets or enough room around smaller ones (WCAG 2.2, 2.5.8).
- ⌨️ A keyboard test checks that the first <kbd>Tab</kbd> reaches the skip link and that it moves focus to `main`.
- 🖥️ A forced colours test checks that the chosen option and the card borders stay visible with system colours.
- 📱 Five pages in five languages are checked for sideways scrolling at 320 px.
- 🚦 **Lighthouse** must score 1 for accessibility on every page of the budget, and every accessibility audit must pass, including the ones without weight.
- 🧪 Component tests find elements by role and accessible name, so a missing label fails a test.

See [Testing](./testing.md#-end-to-end-tests) for how to run them.
