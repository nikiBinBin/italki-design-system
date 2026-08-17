## Which variant, when you are not sure

**Default to `emphasis`** — the main action of a section, and what the component
falls back to when no variant is passed. From there pick by the job: `red` for
the one action the page exists for (book, pay), one per page or step;
`secondary` for the action beside the main one; `ghost` then `text` for quieter
ones; `white` only on a colour; `danger` for deleting something the learner
owns; `plus` only for an italki Plus entry point; `link` for navigation that
should read as text.

Two `red` buttons on one page, or two `emphasis` in one section, means the page
has not decided what it wants the learner to do.

## Do not pass `shape`

`shape: "default"` already resolves per size — 32 is a pill, 40 and 48 are
rounded. Writing `shape: "pill"` on a 32 button changes nothing, and it teaches
passing it on a 40 as well, where the system's answer is rounded. Every button
coming out as a pill is what that looks like.

**An override is an instruction, never an initiative.** Pass `shape` only where a
design decision has explicitly asked for it on that button. Do not infer one from
a button's importance, from a neighbouring screen, or from a pattern copied out of
another implementation. Absent an instruction a 40 stays rounded, and turning it
into a pill is a change to the design made silently by whoever was typing.

The product does override — the shell's action button is a pill at 40 — but
**TopNav and Sidebar do that inside their own renderers**. A page passes
`actionLabel`, not a shape. If an override looks warranted, that is the shape of
it: the component decides, once, for every page.

**Shape belongs to the action row, not to the button.** `default` resolves by
size, so an override on one button leaves the one beside it on the system's
answer — a pill CTA next to a rounded secondary, both individually legal, in the
same action bar. If a row overrides, every button in it takes the same override.
Mixing a 32 and a 40 in one row splits the shape just as surely.

## The label is a label, not a sentence

A button says what it does in **one to three words, at most 24 characters** —
verb first, no trailing punctuation, no explanation. The row it sits in was laid
out for a name: a sentence wraps to a second line, breaks the alignment of
everything beside it, and stops reading as something you press.

Write `Book trial`, `Continue`, `Add introduction`. Not `Book a trial lesson with
this teacher now`, not `Click here to continue to the next step of booking`.

When the label wants to be long, the words belong somewhere else — the copy above
the button, a field's helper text, or a Tooltip on the button. The action keeps
the short name.

## The White button needs a coloured background

`variant: "white"` is a white button **for use on a colour** — a photo, a brand
band, a red hero. On a white or near-white surface the fill matches the surface,
only the border survives, and it reads as a disabled control. On
`--ui-color-card` or `--ui-color-page` use `secondary`, or `ghost` for the
quietest option. Pick the variant from what is behind it.

## Icon-only buttons

`iconOnly` hides the label but still needs one: pass `ariaLabel` so the button
is announced.
