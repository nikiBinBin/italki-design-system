## Which overlay

Three tiers, quietest first. Reach for the quietest one that does the job.

| Tier | Component | For |
|---|---|---|
| Context hint | `Tooltip` | Optional clarification. Never actions, links, forms, or anything needed to finish the task. |
| Local action | `Popup` | Concise supporting information, anchored to its trigger. |
| Local action | `Popover` | The same surface, named for when the content is editable or actionable — a compact task or short form. |
| Local action | `Popconfirm` | One short destructive or irreversible decision. |
| Local action | `DropdownMenu` | A short list of commands. Not a form, a filter group, or a value comparison. |
| Focused task | `Modal` | A centred task that blocks the page. |
| Focused task | `Drawer` | The same, anchored to an edge, when the task needs more vertical room and the page behind it should stay visible. |

**Only one focused-task surface may be open at a time.** A lower tier never opens
above an active higher one from the page behind it: a menu or popover opened
inside a Modal belongs to that Modal.

## Do not hand-write this

`Modal`'s `body`, `footer` and `trigger` are **slots: pass JSX straight in**. An element is portalled
into place, so it keeps its own state, its handlers and its children.

```jsx
<Modal
  title="Reschedule this lesson"
  open={open}
  body={<RescheduleForm lessonId={id} />}
  footer={<DialogActions onCancel={close} onSubmit={submit} />}
/>
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

<Modal
  title="Reschedule this lesson"
  body={ui.formField({ label: 'New time', control: ui.timePicker({ slots: ['17:30', '18:00'], selected: '18:00' }) })}
  footer={ui.button({ label: 'Keep current time', variant: 'secondary' }) + ui.button({ label: 'Reschedule', variant: 'red' })}
/>
```

Concatenate for siblings, nest calls for depth. `ui.button` asserts the same
contract `<Button>` does, so a wrong prop still throws either way.

**Either way, do not build the surface yourself.** A hand-written one has none of
the layering, focus handling or dismiss behaviour this component carries.

## Two sizes, and no third

`size="default"` is 520px and `size="wide"` is 744px. **Do not supply a width** —
there is no prop for one, and a dialog sized by hand stops matching every other
dialog in the product. The parent may narrow either size to a small viewport
without changing anything else.

## `open` belongs to the page

Modal is controlled: it renders what `open` says and never decides for itself. It
traps focus while open, closes on Escape only when `keyboardClosable` permits,
returns focus to the control that opened it, and blocks the page behind it. What
it does not do is choose the task, supply the buttons, or decide whether the work
was destructive — that is the page's, through `body` and `footer`.

Use `stage="inline"` on a real page: only the trigger stays in normal layout, and
the dialog opens above the viewport with background scrolling locked.
`stage="demo"` is the bounded preview surface for documentation.
