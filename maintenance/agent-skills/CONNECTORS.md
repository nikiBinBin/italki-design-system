# Connectors

These skills work standalone — describe the design, paste a screenshot, or point at a
file in the kit. Connectors only widen what they can read.

| Category | What it buys these skills | Status |
|---|---|---|
| Design tool (Figma) | `/design-critique` and `/design-handoff` read a node straight from a Figma URL instead of a description | Configure the Figma MCP server in your own project |
| Project tracker (Linear, Asana, Jira) | File findings as tickets instead of pasting them | Not configured |
| User feedback (Intercom, Dovetail) | `/research-synthesis` reads real tickets and transcripts | Not configured |
| Knowledge base (Notion, Confluence) | Publish an audit or a component doc where the team reads it | Not configured |

Upstream, Anthropic's `design` plugin shipped a `.mcp.json` pre-configuring these. This fork
ships none: the kit is vendor-neutral by charter (`{KIT}/AGENTS.md`), so connecting
tools is the consuming project's decision, not the kit's. Every skill degrades to
"ask the requester for the design" when nothing is connected — the normal case.
