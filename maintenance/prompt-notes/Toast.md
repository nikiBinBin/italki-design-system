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

## Do not hand-write this

`Toast`'s `action` is a **slot: pass JSX straight in**. An element is portalled
into place, so it keeps its own state, its handlers and its children.

```jsx
<Toast tone="success" title="Lesson booked" action={<ViewLesson lessonId={id} />} />
```

A slot remounts when this component's other props change, so state the slot must
not lose belongs in the parent, not inside the slot.

**Handlers go on your own elements.** A kit component takes no React handlers —
`onClick` on `<Button>` is dropped, because the runtime binds behaviour through
its own delegated listeners rather than through React. Inside a slot that is not
a limitation: your elements are real React, so put the handler there.

A slot also still takes a **string**, which is what you want when the content is
itself kit components — `window.ItalkiUI.raw` is the identical set returning
strings, so the markup is the component's own:

```jsx
const ui = window.ItalkiUI.raw;

<Toast tone="success" title="Lesson booked" action={ui.button({ label: 'View lesson', variant: 'white', size: 32 })} />
```

Concatenate for siblings, nest calls for depth. `ui.button` asserts the same
contract `<Button>` does, so a wrong prop still throws either way.

**Either way, do not build the surface yourself.** A hand-written one has none of
the layering, focus handling or dismiss behaviour this component carries.

## Transient, and only for what can be missed

A Toast appears, says one outcome, and goes. That makes it right for a completed
or recoverable **background** outcome, and wrong for anything the learner has to
act on: a field's validation, an explanation of why something is blocked, or a
failed payment all stay on the page. If missing the message would leave someone
stuck, it is not a Toast.

At most one recovery action. `duration` controls how long it stays; when
`closable`, the dismissal is the approved 24px control.
