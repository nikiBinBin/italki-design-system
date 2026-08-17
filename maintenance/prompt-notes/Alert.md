## Which one of the four

They share `tone`, `title`, `description` and an action, so the props will not
tell you. What separates them is how long the message lives and what it is
attached to.

| Component | Lives | Attached to |
|---|---|---|
| `Alert` | Until dismissed or resolved | The thing on the page it is about. |
| `Toast` | A few seconds, then gone | Nothing — a background outcome that can be missed. |
| `Notification` | Until dismissed or resolved | The product, not a place on the page. |
| `Result` | The page | A finished task, as its whole outcome region. |

Field validation is none of these — it belongs to `FormField`, which owns the
message, its `aria-describedby` and its `role="alert"`.

`tone` is `info | success | warning | error` and it fixes the icon. There is no
icon prop.

<!-- 待补：Alert 自己那一节（什么时候不该用它）。云端
     components/**/Alert/Alert.prompt.md 里有，见 ../PROMPT-NOTES-LOST.md。 -->

## `action` is a label, not markup

Alert's `action` is **a label, not a slot** — the renderer builds the button and
throws on markup. One action, and it is the recovery: give it a short verb the
way a Button label works. An Alert that carries a paragraph or a pair of choices
is a decision, and a decision belongs on the page.

## It is as wide as what holds it

Alert has no width of its own — it fills its container. That is deliberate: it is
page content, and page content lines up with the page content around it. An Alert
that stopped short of the card above it would read as a mistake, and for a while
it did, because the component capped itself at 680px.

**So do not set a width on the Alert. Set one on what holds it.** A narrow Alert
belongs in a narrow column, beside the thing it is about.

The one exception is `banner`, which spans the full page region and holds its
text to the content measure instead — that is a page-level message, not a message
about something on the page.

Its description text is **not** capped to a reading measure either. In a wide
content column a long description will run long, and that is the accepted
trade for lining up with the page: the box follows the container, and the text
follows the box. (Niki, 2026-08-17 — decided for now, not settled forever. If it
turns out to read badly, the fix is a measure on the description, never a width
back on the Alert.)
