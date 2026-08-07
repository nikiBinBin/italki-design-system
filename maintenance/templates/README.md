# Template working copies

The Design project is the source of truth for these files. This directory is a
working copy so the templates can be rendered, clicked and measured locally
instead of by uploading and refreshing — which is how a day went: every change
had to round-trip through the app before anyone could see whether it worked,
and an upload that overwrote someone's edit could not be caught beforehand.

Before editing one, fetch the project's current copy over the top of it. Before
uploading, run the audit.

    npm --prefix maintenance run audit:templates

`TeacherProfile.dc.html` here may lag the project — it is edited in the app more
often than the other. Fetch it first.
