## Lesson status tags

Nine statuses, and each has one surface. What they mean, first, because the tone
names below do not say it:

- **`Action required`** — the learner or teacher has to do something. It is a call
  to act, **not an error**: nothing has failed.
- **`Waiting`** — the other party has to do something. Nothing is required of the
  person reading it yet.
- **`On this Friday, 14:00`** — any confirmed upcoming time.
- **`Lesson completed!`**, **`Active package`** — a good outcome, in hand.
- **`Resolved`**, **`Canceled`**, **`Decline`**, **`Temporarily frozen`** — closed,
  or paused; no longer live.

`Action required` and `Waiting` are the pair that gets confused, and they are
opposites: **whose turn it is.** Give them different surfaces or the distinction
the tag exists to draw is gone.

| Status | `tone` the Catalog passes | `leadingIcon` |
|---|---|---|
| `Action required` | `error` | `Assets/Icons/16px/lesson-action-required-sm.svg` |
| `Waiting` | `warning` | `Assets/Icons/16px/lesson-waiting-sm.svg` |
| `On this Friday, 14:00` — any upcoming time | `info` | `Assets/Icons/16px/lesson-upcoming-sm.svg` |
| `Lesson completed!` | `success` | `Assets/Icons/16px/lesson-completed-sm.svg` |
| `Active package` | `success` | `Assets/Icons/16px/lesson-package-active-sm.svg` |
| `Resolved` | `neutral` | `Assets/Icons/16px/timer-lightning-solid-sm.svg` |
| `Canceled` | `neutral` | `Assets/Icons/16px/lesson-canceled-sm.svg` |
| `Decline` | `neutral` | `Assets/Icons/16px/lesson-canceled-sm.svg` |
| `Temporarily frozen` | `neutral` | `Assets/Icons/16px/frozen-sm.svg` |
| `Terminated` | `neutral` | `Assets/Icons/16px/slash-circle-sm.svg` |

**The tone column is a colour role, not a description of the status.** Tag's five
tones carry no "someone must act" role, so the status tags borrow the two that
land on the right surfaces. The LessonCard pattern reaches the same two colours by
their neutral names — `--ui-color-accessory-3` for action required,
`--ui-color-accessory-1` for waiting — which is the more honest way to say it, and
they are the same hex (`#FFF1F1`, `#FFF9E6`). Read `tone: "error"` here as "the
pink surface", and do not carry it into anything else: an `error` tone on a tag
that is not about failure will read as one.

Status tags are `variant: "status"` at `size: 32`:

```jsx
<Tag
  label="Action required"
  tone="error"
  variant="status"
  size={32}
  leadingIcon="Assets/Icons/16px/lesson-action-required-sm.svg"
/>
```

**Omitting `tone` is not a safe default** — it resolves to `neutral`, so a lesson
that needs attention renders as grey as a cancelled one. Every status tag passes
its tone explicitly.

## `tone` is five values, and `action-required` is not one of them

`neutral | info | success | warning | error`. Passing anything else throws
`tag.tone does not accept <value>`.

Worth naming because of the second vocabulary above: the LessonCard pattern's
status modifiers include `action-required`, and those are its own CSS class names,
not Tag tones. If you have seen `tone: "action-required"`, it came from there and
does not cross over.

## The other two variants

`default` is descriptive metadata that is not a state — a language, a level, a
duration (`Native speaker`, `Beginner`, `30 min`). It takes no tone.
`promo` is for a promotional marker. Neither should be used to show a lesson's
state; that is what `status` is for.
