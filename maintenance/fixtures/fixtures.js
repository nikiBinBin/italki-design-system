(function installItalkiUIFixtures(global) {
  "use strict";

  const fixture = (component, state, markup) => ({ component, state, markup: `<div data-contract-component="${component}" data-contract-state="${state}">${markup}</div>` });

  function build(ui) {
    const dateMonths = [{
      label: "July 2026",
      days: ["", "", "", { label: 1, value: "2026-07-01" }, { label: 2, value: "2026-07-02" }, { label: 3, value: "2026-07-03" }, { label: 4, value: "2026-07-04" }, ...Array.from({ length: 27 }, (_, index) => ({ label: index + 5, value: `2026-07-${String(index + 5).padStart(2, "0")}` }))]
    }];
    const calendarDates = [
      { id: "mon", label: "Mon", date: "15" },
      { id: "tue", label: "Tue", date: "16" },
      { id: "wed", label: "Wed", date: "17", current: true },
      { id: "thu", label: "Thu", date: "18" },
      { id: "fri", label: "Fri", date: "19" },
      { id: "sat", label: "Sat", date: "20" },
      { id: "sun", label: "Sun", date: "21" }
    ];
    const calendarRows = [
      { id: "09-00", label: "09:00", slots: ["available", "available", "available", "available", "available", "unavailable", "unavailable"] },
      { id: "10-30", label: "10:30", slots: ["available", "selected", "available", "booked-by-others", "available", "unavailable", "unavailable"] },
      { id: "13-00", label: "13:00", slots: ["booked-by-you", "available", "available", "available", "available", "unavailable", "unavailable"] }
    ];
    const compactCalendarDates = [
      { id: "fri", label: "Fr", date: "24" }, { id: "sat", label: "Sa", date: "25" }, { id: "sun", label: "Su", date: "26" }, { id: "mon", label: "Mo", date: "27" }, { id: "tue", label: "Tu", date: "28" }, { id: "wed", label: "We", date: "29" }, { id: "thu", label: "Th", date: "30" }
    ];
    const compactCalendarRows = [
      { id: "00-04", label: "00 – 04", slots: ["unavailable", { state: "available", hours: 2.5 }, "available", "available", "available", "available", "available"] },
      { id: "04-08", label: "04 – 08", slots: ["unavailable", "available", "available", "available", "available", "available", "available"] },
      { id: "08-12", label: "08 – 12", slots: ["unavailable", "unavailable", "unavailable", "available", "available", "available", "available"] },
      { id: "12-16", label: "12 – 16", slots: ["unavailable", "available", "available", "available", "available", "available", "available"] },
      { id: "16-20", label: "16 – 20", slots: ["unavailable", "available", "available", "available", "available", "available", "available"] },
      { id: "20-24", label: "20 – 24", slots: ["available", "available", "available", "available", "available", "available", "available"] }
    ];
    const teacherAvailabilityDays = [
      { id: "mon", label: "Mon", date: "27", current: true, slots: ["00:30", "01:30", "03:00", "04:00", "05:00"] },
      { id: "tue", label: "Tue", date: "28", slots: ["00:30", { state: "unavailable" }, "03:00", { state: "unavailable" }, "05:00"] },
      { id: "wed", label: "Wed", date: "29", slots: ["00:30", "01:30", { state: "unavailable" }, "04:00", "05:00"] },
      { id: "thu", label: "Thu", date: "30", slots: ["00:30", "01:30", "03:00", "04:00", "05:00"] },
      { id: "fri", label: "Fri", date: "01", slots: [{ state: "unavailable" }, "01:30", "03:00", { state: "unavailable" }, "05:00"] },
      { id: "sat", label: "Sat", date: "02", slots: Array.from({ length: 5 }, () => ({ state: "unavailable" })) },
      { id: "sun", label: "Sun", date: "03", slots: ["00:30", "01:30", { state: "unavailable" }, "04:00", "05:00"] }
    ];
    const lessonRecordMonth = (id, label, states = {}, current = false) => {
      const cells = new Map();
      Object.entries(states).forEach(([state, positions]) => positions.forEach((position) => cells.set(position, state)));
      return { id, label, current, weeks: Array.from({ length: 4 }, (_, week) => Array.from({ length: 7 }, (_, day) => cells.get(week * 7 + day) || "empty")) };
    };
    const lessonRecordMonths = [
      lessonRecordMonth("apr", "Apr", { info: [2], success: [11], mixed: [16] }),
      lessonRecordMonth("may", "May", { success: [4], info: [10, 21] }),
      lessonRecordMonth("jun", "Jun", { info: [3], success: [8], mixed: [14], selected: [17] }, true)
    ];
    const sidebarItems = [
      { id: "home", label: "Home", icon: "Assets/Icons/dashboard.svg", active: true, fixed: true },
      { id: "search", label: "Search Teachers", icon: "Assets/Icons/search-list.svg", fixed: true },
      { id: "lessons", label: "My Lessons", icon: "Assets/Icons/lesson.svg" },
      { id: "more", label: "More", icon: "Assets/Icons/more.svg", more: true }
    ];
    const sidebarSections = [
      { id: "chats", label: "Chats", open: false, items: [{ id: "chat-sarah", label: "Sarah: lesson follow-up", leading: ui.avatar({ name: "Sarah", initials: "SL", size: 24, variant: "empty" }) }] },
      { id: "teacher-lessons", label: "Lessons", open: false, items: [{ id: "teacher-scarlet", prefix: "108", divider: true, label: "Scarlet Lorraine", secondary: "English" }] }
    ];
    const sidebarMoreItems = [{ id: "teachers", label: "My Teachers", icon: "Assets/Icons/teacher.svg" }, { id: "community", label: "Community", icon: "Assets/Icons/community.svg", dividerBefore: true }];
    const sidebarFooter = `${ui.button({ label: "$3355.50 USD", variant: "secondary", size: 40, shape: "pill", leadingIcon: "Assets/Icons/wallet.svg" })}${ui.avatar({ name: "Open account", initials: "NK", size: 40, variant: "empty" })}`;
    const tableColumns = [{ id: "teacher", label: "Teacher" }, { id: "language", label: "Language" }, { id: "lesson", label: "Next lesson" }, { id: "action", label: "", align: "right" }];
    const tableRows = [
      { id: "maya", cells: [{ content: "Maya Chen", rowHeader: true }, { content: "English" }, { content: "Tue, 14:30" }, { content: ui.button({ label: "View", variant: "text", size: 32, shape: "pill" }), align: "right" }] },
      { id: "elena", cells: [{ content: "Elena Ruiz", rowHeader: true }, { content: "Spanish" }, { content: "Thu, 09:00" }, { content: ui.button({ label: "View", variant: "text", size: 32, shape: "pill" }), align: "right" }] }
    ];
    const timelineEvents = [
      { id: "booked", tone: "success", title: "Lesson booked", description: "15 July · 14:30" },
      { id: "confirmed", tone: "info", title: "Teacher confirmed", description: "15 July · 14:35" },
      { id: "reminder", tone: "warning", title: "Reminder scheduled", description: "21 July · 14:20" }
    ];
    const topNavOptions = [
      { id: "english", label: "English Teachers", flag: "Assets/Flags/us.svg" },
      { id: "french", label: "French Teachers", flag: "Assets/Flags/fr.svg" },
      { id: "spanish", label: "Spanish Teachers", flag: "Assets/Flags/es.svg" }
    ];
    const topNavFixture = ({ id, compact = false, contextOpen = false, value = "", filtered = false, filter = true }) => ui.topNav({
      id,
      leading: ui.topNavContext({ id: `${id}-context`, mode: compact ? "compact" : "labelled", selected: topNavOptions[0], options: topNavOptions, open: contextOpen, ariaLabel: "Teacher language" }),
      center: ui.topNavSearch({ id: `${id}-search`, value, placeholder: "Search goals", ariaLabel: "Search teachers", filter, filterCount: 4, filtered }),
      trailing: ui.button({ label: "Book lessons", variant: "emphasis", size: 40, shape: "pill", leadingIcon: "Assets/Icons/plus.svg" }),
      ariaLabel: "Top navigation"
    });
    const entries = {
      button: [
        fixture("button", "default", ui.button({ label: "Default" })),
        fixture("button", "hover", ui.button({ label: "Hover", state: "hover" })),
        fixture("button", "focus", ui.button({ label: "Focus", state: "focus" })),
        fixture("button", "disabled", ui.button({ label: "Unavailable", disabled: true })),
        fixture("button", "loading", ui.button({ label: "Loading", variant: "secondary", disabled: true, loading: true })),
        fixture("button", "red", ui.button({ label: "Book lesson", variant: "red" })),
        fixture("button", "plus", ui.button({ label: "Plus", variant: "plus" }))
      ],
      chip: [
        fixture("chip", "default", ui.chip({ label: "Default" })),
        fixture("chip", "white", ui.chip({ label: "White", surface: "white" })),
        fixture("chip", "transparent", ui.chip({ label: "Transparent", surface: "transparent" })),
        fixture("chip", "compact", ui.chip({ label: "Compact", size: 24 })),
        fixture("chip", "small", ui.chip({ label: "Small", size: 32 })),
        fixture("chip", "hover", ui.chip({ label: "Hover", state: "hover" })),
        fixture("chip", "checked", ui.chip({ label: "Checked", checked: true })),
        fixture("chip", "disabled", ui.chip({ label: "Disabled", disabled: true }))
      ],
      tag: [
        fixture("tag", "default", ui.tag({ label: "Tag" })),
        fixture("tag", "removable", ui.tag({ label: "Removable", removable: true })),
        fixture("tag", "tone", ui.tag({ label: "Error", tone: "error" }))
      ],
      checkbox: [
        fixture("checkbox", "off", ui.checkbox({ label: "Unchecked", checked: "off" })),
        fixture("checkbox", "on", ui.checkbox({ label: "Checked", checked: "on" })),
        fixture("checkbox", "mixed", ui.checkbox({ label: "Mixed", checked: "mixed" })),
        fixture("checkbox", "disabled", ui.checkbox({ label: "Disabled", checked: "on", disabled: true }))
      ],
      "checkbox-group": [
        fixture("checkbox-group", "default", ui.checkboxGroup({ id: "fixture-topics", label: "Lesson topics", options: [{ id: "conversation", label: "Conversation" }, { id: "grammar", label: "Grammar" }], selected: ["conversation"] })),
        fixture("checkbox-group", "inline", ui.checkboxGroup({ id: "fixture-formats", label: "Lesson formats", layout: "inline", options: [{ id: "private", label: "Private" }, { id: "group", label: "Group" }], selected: ["private"] })),
        fixture("checkbox-group", "select-all", ui.checkboxGroup({ id: "fixture-goals", label: "Learning goals", options: [{ id: "speaking", label: "Speaking" }, { id: "grammar", label: "Grammar" }], selected: ["speaking"], selectAll: true })),
        fixture("checkbox-group", "disabled", ui.checkboxGroup({ id: "fixture-disabled", label: "Availability", options: [{ id: "weekday", label: "Weekday" }, { id: "weekend", label: "Weekend", disabled: true }], selected: ["weekday"] })),
        fixture("checkbox-group", "feedback", ui.checkboxGroup({ id: "fixture-feedback", label: "Time preference", options: [{ id: "morning", label: "Morning" }], feedback: "Choose at least one time.", feedbackTone: "error" }))
      ],
      radio: [
        fixture("radio", "default", ui.radio({ label: "Unchecked", value: "unchecked" })),
        fixture("radio", "checked", ui.radio({ label: "Checked", value: "checked", checked: true })),
        fixture("radio", "hover", ui.radio({ label: "Hovered", value: "hovered", state: "hover" })),
        fixture("radio", "disabled", ui.radio({ label: "Disabled", value: "disabled", checked: true, disabled: true })),
        fixture("radio", "inline", ui.radioGroup({ label: "Lesson length", selected: "45", options: ["30 min", { label: "45 min", value: "45" }, "60 min"] })),
        fixture("radio", "vertical", ui.radioGroup({ label: "Learning goal", layout: "vertical", selected: "conversation", options: [{ label: "Conversation", value: "conversation", description: "Everyday speaking practice." }, { label: "Business", value: "business", description: "Workplace communication." }] })),
        fixture("radio", "block", ui.radioGroup({ label: "Lesson package", block: true, selected: "package", options: [{ label: "Single lesson", value: "single" }, { label: "Lesson package", value: "package" }] }))
      ],
      selection: [
        fixture("selection", "icon-simple-default", ui.selection({ label: "Basic plan", subtext: "$10/month", description: "Includes 10 users.", leading: '<img src="Assets/Icons/16px/topic-sm.svg" alt="" />' })),
        fixture("selection", "icon-simple-selected", ui.selection({ label: "Basic plan", selected: true, leading: '<img src="Assets/Icons/16px/topic-sm.svg" alt="" />' })),
        fixture("selection", "icon-simple-hover", ui.selection({ label: "Basic plan", state: "hover", leading: '<img src="Assets/Icons/16px/topic-sm.svg" alt="" />' })),
        fixture("selection", "icon-simple-focus", ui.selection({ label: "Basic plan", state: "focus", leading: '<img src="Assets/Icons/16px/topic-sm.svg" alt="" />' })),
        fixture("selection", "icon-simple-disabled", ui.selection({ label: "Basic plan", disabled: true, leading: '<img src="Assets/Icons/16px/topic-sm.svg" alt="" />' })),
        fixture("selection", "icon-card-default", ui.selection({ label: "Basic plan", contentType: "icon-card", leading: '<img src="Assets/Icons/16px/topic-sm.svg" alt="" />', price: "$10", period: "per month", badge: "Limited time only", description: "Includes 10 users." })),
        fixture("selection", "avatar-default", ui.selection({ label: "Olivia Rhye", contentType: "avatar", leading: '<img src="Assets/Images/avatars/teacher-rachel.svg" alt="" />', description: "Product Manager" })),
        fixture("selection", "payment-icon-default", ui.selection({ label: "Visa ending in 4242", contentType: "payment-icon", leading: "VISA", description: "Expires 12/28" })),
        fixture("selection", "radio-default", ui.selection({ label: "Basic plan", contentType: "standard", selectionMode: "radio" })),
        fixture("selection", "radio-selected", ui.selection({ label: "Basic plan", contentType: "standard", selectionMode: "radio", selected: true })),
        fixture("selection", "checkbox-default", ui.selection({ label: "Written feedback", contentType: "standard", selectionMode: "checkbox" })),
        fixture("selection", "checkbox-selected", ui.selection({ label: "Written feedback", contentType: "standard", selectionMode: "checkbox", selected: true })),
        fixture("selection", "desktop", ui.selectionGroup({ label: "Lesson package", options: ["Single lesson", "Lesson package"], selected: "Lesson package" })),
        fixture("selection", "mobile", ui.selection({ label: "Basic plan", contentType: "icon-card", price: "$10", period: "per month", description: "Includes 10 users." }))
      ],
      "date-picker": [
        fixture("date-picker", "default", ui.datePicker({ id: "fixture-date-default", label: "Lesson date", placeholder: "Choose a date", months: dateMonths })),
        fixture("date-picker", "open", ui.datePicker({ id: "fixture-date-open", label: "Lesson date", selected: "2026-07-15", open: true, months: dateMonths })),
        fixture("date-picker", "disabled", ui.datePicker({ id: "fixture-date-disabled", label: "Lesson date", disabled: true, months: dateMonths })),
        fixture("date-picker", "selected", ui.datePicker({ id: "fixture-date-selected", label: "Lesson date", selected: "2026-07-15", months: dateMonths })),
        fixture("date-picker", "range", ui.datePicker({ id: "fixture-date-range", label: "Lesson date range", range: ["2026-07-15", "2026-07-18"], months: dateMonths }))
      ],
      tooltip: [
        fixture("tooltip", "default", ui.tooltip({ id: "fixture-tooltip-default", content: "Short supporting text" })),
        fixture("tooltip", "arrowless", ui.tooltip({ id: "fixture-tooltip-arrowless", content: "Optional label", arrow: false, open: true })),
        fixture("tooltip", "placement", ui.tooltip({ id: "fixture-tooltip-bottom", content: "Bottom placement", placement: "bottom", open: true })),
        fixture("tooltip", "disabled", ui.tooltip({ id: "fixture-tooltip-disabled", content: "This action is unavailable", disabled: true }))
      ],
      modal: [
        fixture("modal", "closed", ui.modal({ id: "fixture-modal-closed", title: "Reschedule lesson", body: "Dialog content" })),
        fixture("modal", "open", ui.modal({ id: "fixture-modal-open", title: "Reschedule lesson", body: "Dialog content", open: true })),
        fixture("modal", "wide", ui.modal({ id: "fixture-modal-wide", title: "Reschedule lesson", body: "Wide Dialog content", size: "wide", open: true })),
        fixture("modal", "non-closable", ui.modal({ id: "fixture-modal-locked", title: "Required action", body: "Complete this step first.", open: true, closable: false, maskClosable: false, keyboardClosable: false }))
      ],
      popup: [
        fixture("popup", "closed", ui.popup({ id: "fixture-popup-closed", title: "Teacher profile", body: "Local supporting information" })),
        fixture("popup", "open", ui.popup({ id: "fixture-popup-open", title: "Teacher profile", body: "Local supporting information", open: true })),
        fixture("popup", "placement", ui.popup({ id: "fixture-popup-top", title: "Teacher profile", body: "Top placement", placement: "top", open: true })),
        fixture("popup", "with-actions", ui.popup({ id: "fixture-popup-actions", title: "Teacher profile", body: "Local actions", actions: `${ui.button({ label: "View", variant: "text", size: 32, shape: "pill" })}${ui.button({ label: "Message", variant: "secondary", size: 32, shape: "pill" })}`, open: true })),
        fixture("popup", "leave-delay", ui.popup({ id: "fixture-popup-leave-delay", title: "Teacher profile", body: "Closes after pointer leave", open: true, closeOnLeave: true, leaveDelay: 300 }))
      ],
      popconfirm: [
        fixture("popconfirm", "closed", ui.popconfirm({ id: "fixture-popconfirm-closed", title: "Cancel this lesson?" })),
        fixture("popconfirm", "open", ui.popconfirm({ id: "fixture-popconfirm-open", title: "Cancel this lesson?", description: "This action cannot be undone.", open: true })),
        fixture("popconfirm", "with-cancel", ui.popconfirm({ id: "fixture-popconfirm-cancel", title: "Cancel this lesson?", cancelLabel: "Keep lesson", confirmLabel: "Cancel lesson", open: true })),
        fixture("popconfirm", "loading", ui.popconfirm({ id: "fixture-popconfirm-loading", title: "Cancel this lesson?", loading: true, open: true })),
        fixture("popconfirm", "disabled", ui.popconfirm({ id: "fixture-popconfirm-disabled", title: "Cancel this lesson?", disabled: true }))
      ],
      divider: [
        fixture("divider", "horizontal", ui.divider()),
        fixture("divider", "vertical", ui.divider({ type: "vertical" })),
        fixture("divider", "label", ui.divider({ label: "Lesson details" })),
        fixture("divider", "left", ui.divider({ label: "Lesson details", orientation: "left" })),
        fixture("divider", "right", ui.divider({ label: "Lesson details", orientation: "right", orientationMargin: "50px" })),
        fixture("divider", "dashed", ui.divider({ label: "Lesson details", dashed: true })),
        fixture("divider", "plain", ui.divider({ label: "Lesson details", plain: true }))
      ],
      link: [
        fixture("link", "default", ui.link({ label: "See beginner lessons" })),
        fixture("link", "hover", ui.link({ label: "See beginner lessons", state: "hover" })),
        fixture("link", "subtle", ui.link({ label: "Skip for now", variant: "subtle" })),
        fixture("link", "inverse", ui.link({ label: "Learn more", variant: "inverse" })),
        fixture("link", "chevron", ui.link({ label: "See beginner lessons", size: 14, trailingIcon: "chevron" })),
        fixture("link", "external", ui.link({ label: "italki Help Center", external: true })),
        fixture("link", "disabled", ui.link({ label: "Unavailable", disabled: true })),
      ],
      avatar: [
        fixture("avatar", "image", ui.avatar({ name: "Maya Chen", image: "Assets/Images/avatars/teacher-maya.svg", size: 48 })),
        fixture("avatar", "with-flag", ui.avatar({ name: "Maya Chen, USA", image: "Assets/Images/avatars/teacher-maya.svg", size: 56, flag: "us", flagLabel: "USA", variant: "with-flag" })),
        fixture("avatar", "empty", ui.avatar({ name: "Maya Chen", initials: "MC", size: 48, variant: "empty" })),
        fixture("avatar", "logo", ui.avatar({ name: "italki", size: 48, variant: "logo" })),
        fixture("avatar", "hover", ui.avatar({ name: "Maya Chen", initials: "MC", size: 48, variant: "empty", state: "hover" })),
        fixture("avatar", "group", ui.avatarGroup({ members: [{ name: "Maya Chen", initials: "MC" }, { name: "Elena Ruiz", initials: "ER" }, { name: "James Park", initials: "JP" }], overflow: 5, addLabel: "Add member", size: "md", ariaLabel: "Teacher group" })),
        fixture("avatar", "empty-group", ui.avatarGroup({ members: [{ name: "Avery", initials: "A", variant: "empty", tone: "warning" }, { name: "Bao", initials: "B", variant: "empty", tone: "success" }, { name: "Carmen", initials: "C", variant: "empty", tone: "info" }, { name: "Dario", initials: "D", variant: "empty", tone: "warning" }, { name: "italki", variant: "logo" }], size: "md", ariaLabel: "Empty avatar group" })),
        fixture("avatar", "flag", ui.flag({ countryCode: "us", countryLabel: "USA", size: 24 }))
      ],
      badge: [
        fixture("badge", "count", ui.badge({ type: "count", anchor: '<span class="fixture-badge-anchor"><img src="Assets/Icons/logo-italki-logomark.svg" alt="" /></span>', count: 8, ariaLabel: "8 unread inbox messages" })),
        fixture("badge", "overflow", ui.badge({ type: "count", anchor: '<span class="fixture-badge-anchor"><img src="Assets/Icons/logo-italki-logomark.svg" alt="" /></span>', count: 120, overflowCount: 99, ariaLabel: "99 or more updates" })),
        fixture("badge", "dot", ui.badge({ type: "dot", anchor: '<span class="fixture-badge-anchor"><img src="Assets/Icons/logo-italki-logomark.svg" alt="" /></span>', ariaLabel: "Mira has new activity" })),
        fixture("badge", "status", ui.badge({ type: "status", tone: "success", label: "Available" })),
        fixture("badge", "hidden", ui.badge({ type: "count", anchor: '<span class="fixture-badge-anchor"><img src="Assets/Icons/logo-italki-logomark.svg" alt="" /></span>', count: 0, hidden: true, ariaLabel: "No unread archived messages" }))
      ],
      breadcrumb: [
        fixture("breadcrumb", "standard", ui.breadcrumb({ items: [{ label: "Home" }, { label: "Find a teacher" }, { label: "English tutors", current: true }] })),
        fixture("breadcrumb", "icon-only", ui.breadcrumb({ items: [{ icon: "Assets/Icons/home-01.svg", ariaLabel: "Home" }, { label: "Lessons" }, { label: "Lesson details", current: true }] })),
        fixture("breadcrumb", "overflow", ui.breadcrumb({ items: [{ label: "Home" }, { label: "Learning", collapsed: true }, { label: "Language", collapsed: true }, { label: "Learning plan" }, { label: "Speaking practice", current: true }], collapsedOpen: true })),
        fixture("breadcrumb", "custom-separator", ui.breadcrumb({ separator: "/", items: [{ label: "Home" }, { label: "Community" }, { label: "Language exchange", current: true }] }))
      ],
      card: [
        fixture("card", "basic", ui.card({ eyebrow: "Lesson resource", title: "Conversation prompts", body: "<p>Prompts for your next speaking lesson.</p>" })),
        fixture("card", "media", ui.card({ media: "Assets/Images/avatars/lesson-card-sunshine.svg", mediaAlt: "", title: "Weekly learning plan", body: "<p>Media is supplied by the parent.</p>" })),
        fixture("card", "interactive", ui.card({ interactive: true, outlined: false, ariaLabel: "Open lesson materials", eyebrow: "Clickable card", title: "Lesson materials", body: "<p>One root action only.</p>" })),
        fixture("card", "compact", ui.card({ density: "compact", title: "Compact card", body: "<p>Dense local content.</p>" })),
        fixture("card", "comfortable", ui.card({ density: "comfortable", title: "Comfortable card", body: "<p>Spacious content region.</p>" }))
      ],
      alert: [
        fixture("alert", "info", ui.alert({ tone: "info", title: "Lesson reminder", description: "Your lesson starts in 30 minutes." })),
        fixture("alert", "success", ui.alert({ tone: "success", title: "Saved", description: "Your learning preference is up to date." })),
        fixture("alert", "warning", ui.alert({ tone: "warning", title: "Time zone needs attention", description: "Confirm the time before you book." })),
        fixture("alert", "error", ui.alert({ tone: "error", title: "Payment unsuccessful", description: "Choose another payment method to continue." })),
        fixture("alert", "closable", ui.alert({ tone: "info", title: "New message", description: "You have an unread message.", closable: true })),
        fixture("alert", "with-action", ui.alert({ tone: "info", title: "Profile incomplete", description: "Add a short introduction before publishing.", action: ui.button({ label: "Complete", variant: "text", size: 32, shape: "pill" }) })),
        fixture("alert", "banner", ui.alert({ tone: "warning", title: "Availability changes regularly.", banner: true }))
      ],
      tabs: [
        fixture("tabs", "basic", ui.tabs({ id: "fixture-tabs-basic", ariaLabel: "Lesson details", items: [{ id: "overview", label: "Overview", panel: "Lesson details content." }, { id: "reviews", label: "Reviews", panel: "Reviews content." }] })),
        fixture("tabs", "icon-count", ui.tabs({ id: "fixture-tabs-icon", ariaLabel: "Teacher profile", items: [{ id: "lessons", label: "Lessons", icon: "Assets/Icons/16px/lesson-sm.svg", panel: "Lessons content." }, { id: "messages", label: "Messages", icon: "Assets/Icons/16px/comments-sm.svg", count: "4", panel: "Messages content." }] })),
        fixture("tabs", "disabled", ui.tabs({ id: "fixture-tabs-disabled", ariaLabel: "Lesson availability", items: [{ id: "booking", label: "Booking", panel: "Booking content." }, { id: "history", label: "History", disabled: true, panel: "History content." }] })),
        fixture("tabs", "trailing-action", ui.tabs({ id: "fixture-tabs-extra", ariaLabel: "Teacher resources", extra: ui.button({ label: "View all", variant: "text", size: 32, shape: "pill" }), items: [{ id: "materials", label: "Materials", panel: "Materials content." }, { id: "goals", label: "Goals", panel: "Goals content." }] }))
      ],
      pagination: [
        fixture("pagination", "pages", ui.pagination({ pages: [1, 2, 3, "ellipsis", 12], current: 1, ariaLabel: "Results pages" })),
        fixture("pagination", "current", ui.pagination({ pages: [1, 2, 3], current: 2, ariaLabel: "Current page" })),
        fixture("pagination", "disabled", ui.pagination({ pages: [1], current: 1, previousDisabled: true, nextDisabled: true, ariaLabel: "Unavailable results pages" }))
      ],
      rate: [
        fixture("rate", "basic", ui.rate({ value: 2.5, allowHalf: true, label: "Rate this lesson" })),
        fixture("rate", "labels", ui.rate({ value: 3, labels: ["Terrible", "Poor", "Okay", "Good", "Excellent"], showText: true, label: "Rate lesson quality" })),
        fixture("rate", "clearable", ui.rate({ value: 3, allowClear: true, label: "Clearable rating" })),
        fixture("rate", "disabled", ui.rate({ value: 3, disabled: true, label: "Unavailable lesson rating" }))
      ],
      sidebar: [
        fixture("sidebar", "normal", ui.sidebar({ id: "fixture-sidebar-normal", items: sidebarItems, sections: sidebarSections, moreItems: sidebarMoreItems, footer: sidebarFooter, ariaLabel: "Workspace sidebar" })),
        fixture("sidebar", "plus", ui.sidebar({ id: "fixture-sidebar-plus", variant: "plus", items: sidebarItems, sections: sidebarSections, moreItems: sidebarMoreItems, footer: sidebarFooter, ariaLabel: "Workspace sidebar" })),
        fixture("sidebar", "collapsed", ui.sidebar({ id: "fixture-sidebar-collapsed", collapsed: true, items: sidebarItems, sections: sidebarSections, moreItems: sidebarMoreItems, footer: sidebarFooter, ariaLabel: "Workspace sidebar" })),
        fixture("sidebar", "expanded-section", ui.sidebar({ id: "fixture-sidebar-expanded", items: sidebarItems, sections: [{ ...sidebarSections[0], open: true }, sidebarSections[1]], moreItems: sidebarMoreItems, footer: sidebarFooter, ariaLabel: "Workspace sidebar" })),
        fixture("sidebar", "more-open", ui.sidebar({ id: "fixture-sidebar-more", items: sidebarItems, sections: sidebarSections, moreItems: sidebarMoreItems, moreOpen: true, footer: sidebarFooter, ariaLabel: "Workspace sidebar" }))
      ],
      statistic: [
        fixture("statistic", "default", ui.statistic({ title: "Lessons completed", value: "128" })),
        fixture("statistic", "with-affix", ui.statistic({ title: "Lesson price", value: "18", prefix: "$", suffix: "USD" })),
        fixture("statistic", "description", ui.statistic({ title: "Current streak", value: "18", suffix: "days", description: "+6 this week" })),
        fixture("statistic", "loading", ui.statistic({ title: "Learning hours", loading: true }))
      ],
      table: [
        fixture("table", "default", ui.table({ id: "fixture-table-default", caption: "Upcoming teacher lessons", columns: tableColumns, rows: tableRows, ariaLabel: "Upcoming teacher lessons" })),
        fixture("table", "with-action", ui.table({ id: "fixture-table-action", caption: "Teacher lessons", columns: tableColumns, rows: tableRows.slice(0, 1), ariaLabel: "Teacher lessons" })),
        fixture("table", "loading", ui.table({ id: "fixture-table-loading", columns: tableColumns, loading: true, ariaLabel: "Loading teacher lessons" })),
        fixture("table", "empty", ui.table({ id: "fixture-table-empty", columns: tableColumns.slice(0, 3), empty: "No upcoming lessons", ariaLabel: "No upcoming lessons" }))
      ],
      timeline: [
        fixture("timeline", "default", ui.timeline({ id: "fixture-timeline-default", items: timelineEvents, ariaLabel: "Lesson status" })),
        fixture("timeline", "with-label", ui.timeline({ id: "fixture-timeline-label", items: timelineEvents.map((item) => ({ ...item, label: item.description })), ariaLabel: "Lesson schedule" })),
        fixture("timeline", "alternate", ui.timeline({ id: "fixture-timeline-alternate", layout: "alternate", items: timelineEvents, ariaLabel: "Lesson event history" })),
        fixture("timeline", "pending", ui.timeline({ id: "fixture-timeline-pending", items: [...timelineEvents.slice(0, 2), { id: "pending", tone: "pending", title: "Pending", description: "Waiting for the next event." }], ariaLabel: "Pending lesson events" })),
        fixture("timeline", "reverse", ui.timeline({ id: "fixture-timeline-reverse", items: timelineEvents, reverse: true, ariaLabel: "Reverse lesson event history" })),
        fixture("timeline", "single-tone", ui.timeline({ id: "fixture-timeline-single-tone", tone: "info", items: timelineEvents, ariaLabel: "Info lesson event history" }))
      ],
      "top-nav": [
        fixture("top-nav", "global-default", topNavFixture({ id: "fixture-top-nav-global", compact: true, filter: false })),
        fixture("top-nav", "teacher-search", topNavFixture({ id: "fixture-top-nav-teacher" })),
        fixture("top-nav", "context-open", topNavFixture({ id: "fixture-top-nav-context-open", contextOpen: true })),
        fixture("top-nav", "search-query", topNavFixture({ id: "fixture-top-nav-query", value: "French" })),
        fixture("top-nav", "filtered", topNavFixture({ id: "fixture-top-nav-filtered", filtered: true }))
      ],
      slider: [
        fixture("slider", "default", ui.slider({ value: 50, label: "Default slider" })),
        fixture("slider", "hover", ui.slider({ value: 65, label: "Hover slider", tooltip: true, state: "hover" })),
        fixture("slider", "focus", ui.slider({ value: 65, label: "Focused slider", tooltip: true, state: "focus" })),
        fixture("slider", "disabled", ui.slider({ value: 60, label: "Disabled slider", disabled: true })),
        fixture("slider", "range", ui.sliderRange({ lower: 20, upper: 70, label: "Lesson duration" })),
        fixture("slider", "vertical", ui.sliderVertical({ value: 68, label: "Vertical slider" })),
        fixture("slider", "reverse", ui.slider({ value: 35, label: "Reverse slider", reversed: true }))
      ],
      panel: [
        fixture("panel", "with-title", ui.panel({ title: "Lesson details", extra: ui.button({ label: "Edit", variant: "text", size: 32, shape: "pill" }), divider: true, body: "Related information shares one stable Panel surface." })),
        fixture("panel", "without-title", ui.panel({ density: "small", body: "Small-density Panel without title." }))
      ],
      search: [
        fixture("search", "default", ui.search({ placeholder: "Default search" })),
        fixture("search", "hover", ui.search({ placeholder: "Hovered search", state: "hover" })),
        fixture("search", "focus", ui.search({ value: "French", clearable: true, state: "focus" })),
        fixture("search", "disabled", ui.search({ placeholder: "Disabled search", disabled: true })),
        fixture("search", "clearable", ui.search({ value: "Spanish", clearable: true }))
      ],
      select: [
        fixture("select", "default", ui.select({ id: "fixture-select-default", label: "Language", options: ["English", "French", { label: "Portuguese", disabled: true }] })),
        fixture("select", "focus", ui.select({ id: "fixture-select-focus", label: "Language", options: ["English", "French"], selected: "English", state: "focus" })),
        fixture("select", "disabled", ui.select({ id: "fixture-select-disabled", label: "Language", options: ["English", "French"], selected: "English", disabled: true })),
        fixture("select", "warning", ui.select({ id: "fixture-select-warning", label: "Language", options: ["English", "French"], status: "warning" })),
        fixture("select", "error", ui.select({ id: "fixture-select-error", label: "Language", options: ["English", "French"], status: "error" })),
        fixture("select", "loading", ui.select({ id: "fixture-select-loading", label: "Language", options: [], loading: true, placeholder: "Loading options" })),
        fixture("select", "clearable", ui.select({ id: "fixture-select-clearable", label: "Language", options: ["English", "French"], selected: "French", clearable: true })),
        fixture("select", "multiple", ui.select({ id: "fixture-select-multiple", label: "Languages", options: ["English", "French", "Spanish"], selected: ["English", "French"], mode: "multiple", clearable: true })),
        fixture("select", "searchable", ui.select({ id: "fixture-select-searchable", label: "Language", options: ["English", "French"], searchable: true, open: true })),
        fixture("select", "grouped", ui.select({ id: "fixture-select-grouped", label: "Language", groups: [{ label: "Popular", options: ["English", "French"] }, { label: "More", options: ["Japanese"] }], open: true })),
        fixture("select", "empty-result", ui.select({ id: "fixture-select-empty", label: "Language", options: [], searchable: true, open: true })),
        fixture("select", "disabled-option", ui.select({ id: "fixture-select-disabled-option", label: "Language", options: ["English", { label: "Portuguese", disabled: true }], open: true }))
      ],
      drawer: [
        fixture("drawer", "closed", ui.drawer({ id: "fixture-drawer-closed", title: "Filters", body: "Content" })),
        fixture("drawer", "right", ui.drawer({ id: "fixture-drawer-right", title: "Filters", body: "Content", open: true, placement: "right" })),
        fixture("drawer", "left", ui.drawer({ id: "fixture-drawer-left", title: "Filters", body: "Content", open: true, placement: "left" })),
        fixture("drawer", "bottom", ui.drawer({ id: "fixture-drawer-bottom", title: "Filters", body: "Content", open: true, placement: "bottom" })),
        fixture("drawer", "wide", ui.drawer({ id: "fixture-drawer-wide", title: "Filters", body: "Content", open: true, size: "wide" })),
        fixture("drawer", "non-closable", ui.drawer({ id: "fixture-drawer-locked", title: "Required", body: "Content", open: true, closable: false, maskClosable: false, keyboardClosable: false }))
      ],
      "form-field": [
        fixture("form-field", "default", ui.formField({ id: "fixture-field-default", label: "Email", control: ui.textInput({ id: "fixture-field-default" }) })),
        fixture("form-field", "helper", ui.formField({ id: "fixture-field-helper", label: "Email", helper: "We will only send lesson updates.", control: ui.textInput({ id: "fixture-field-helper" }) })),
        fixture("form-field", "leading-icon", ui.formField({ id: "fixture-field-search", label: "Search teachers", helper: "Search by teacher name or language.", control: ui.textInput({ id: "fixture-field-search", placeholder: "Search teachers", leadingIcon: "Assets/Icons/search.svg" }) })),
        fixture("form-field", "trailing-action", ui.formField({ id: "fixture-field-copy", label: "Email", helper: "Copy the account email address.", control: ui.textInput({ id: "fixture-field-copy", value: "maya@example.com", trailingAction: ui.button({ label: "Copy email", variant: "text", size: 32, shape: "pill", leadingIcon: "Assets/Icons/copy.svg", iconOnly: true, ariaLabel: "Copy email" }) }) })),
        fixture("form-field", "warning", ui.formField({ id: "fixture-field-warning", label: "Email", status: "warning", helper: "This email is already in use.", control: ui.textInput({ id: "fixture-field-warning", state: "warning" }) })),
        fixture("form-field", "error", ui.formField({ id: "fixture-field-error", label: "Email", error: "Enter a valid email address.", control: ui.textInput({ id: "fixture-field-error", state: "error" }) })),
        fixture("form-field", "required", ui.formField({ id: "fixture-field-required", label: "Email", required: true, control: ui.textInput({ id: "fixture-field-required" }) })),
        fixture("form-field", "disabled", ui.formField({ id: "fixture-field-disabled", label: "Email", disabled: true, control: ui.textInput({ id: "fixture-field-disabled", disabled: true }) }))
      ],
      "text-input": [
        fixture("text-input", "default", ui.textInput({ id: "fixture-input-default", placeholder: "Enter your full name" })),
        fixture("text-input", "hover", ui.textInput({ id: "fixture-input-hover", state: "hover" })),
        fixture("text-input", "focus", ui.textInput({ id: "fixture-input-focus", state: "focus" })),
        fixture("text-input", "warning", ui.textInput({ id: "fixture-input-warning", state: "warning" })),
        fixture("text-input", "error", ui.textInput({ id: "fixture-input-error", state: "error" })),
        fixture("text-input", "disabled", ui.textInput({ id: "fixture-input-disabled", disabled: true })),
        fixture("text-input", "read-only", ui.textInput({ id: "fixture-input-readonly", value: "English", readOnly: true })),
        fixture("text-input", "with-leading-icon", ui.textInput({ id: "fixture-input-leading-icon", placeholder: "Enter your full name", leadingIcon: "Assets/Icons/user.svg" })),
        fixture("text-input", "with-trailing-icon", ui.textInput({ id: "fixture-input-trailing-icon", value: "Maya Chen", trailingIcon: "Assets/Icons/check.svg" }))
      ],
      textarea: [
        fixture("textarea", "default", ui.textarea({ id: "fixture-area-default" })),
        fixture("textarea", "focus", ui.textarea({ id: "fixture-area-focus", state: "focus" })),
        fixture("textarea", "count", ui.textarea({ id: "fixture-area-count", value: "Lesson goals", maxLength: 120, showCount: true })),
        fixture("textarea", "warning", ui.textarea({ id: "fixture-area-warning", state: "warning" })),
        fixture("textarea", "error", ui.textarea({ id: "fixture-area-error", state: "error" })),
        fixture("textarea", "disabled", ui.textarea({ id: "fixture-area-disabled", disabled: true })),
        fixture("textarea", "read-only", ui.textarea({ id: "fixture-area-readonly", value: "Lesson notes", readOnly: true }))
      ],
      "number-stepper": [
        fixture("number-stepper", "default", ui.numberStepper({ id: "fixture-stepper-default", value: 2, min: 1, max: 8 })),
        fixture("number-stepper", "minimum", ui.numberStepper({ id: "fixture-stepper-min", value: 1, min: 1, max: 8 })),
        fixture("number-stepper", "maximum", ui.numberStepper({ id: "fixture-stepper-max", value: 8, min: 1, max: 8 })),
        fixture("number-stepper", "disabled", ui.numberStepper({ id: "fixture-stepper-disabled", value: 2, min: 1, max: 8, disabled: true }))
      ],
      combobox: [
        fixture("combobox", "default", ui.combobox({ id: "fixture-combobox-default", label: "Language", options: ["English", "French"] })),
        fixture("combobox", "open", ui.combobox({ id: "fixture-combobox-open", label: "Language", options: ["English", "French"], open: true })),
        fixture("combobox", "query", ui.combobox({ id: "fixture-combobox-query", label: "Language", options: ["English", "French"], query: "French" })),
        fixture("combobox", "selected", ui.combobox({ id: "fixture-combobox-selected", label: "Language", options: ["English", "French"], selected: "French" })),
        fixture("combobox", "empty-result", ui.combobox({ id: "fixture-combobox-empty", label: "Language", options: [], query: "Klingon" })),
        fixture("combobox", "disabled", ui.combobox({ id: "fixture-combobox-disabled", label: "Language", options: ["English"], disabled: true }))
      ],
      upload: [
        fixture("upload", "dropzone", ui.upload({ id: "fixture-upload-dropzone", label: "Add lesson material", description: "PDF, DOCX, PNG or JPG up to 10 MB.", accept: ".pdf,.docx,.png,.jpg" })),
        fixture("upload", "trigger", ui.upload({ id: "fixture-upload-trigger", variant: "trigger", label: "Lesson material", description: "Choose one file to attach." })),
        fixture("upload", "avatar-empty", ui.upload({ id: "fixture-upload-avatar-empty", variant: "avatar", label: "Profile photo", description: "JPG or PNG, up to 5 MB." })),
        fixture("upload", "avatar-filled", ui.upload({ id: "fixture-upload-avatar-filled", variant: "avatar", label: "Profile photo", avatar: "Assets/Images/avatars/teacher-rachel.svg", avatarAlt: "Elena Ruiz profile photo" })),
        fixture("upload", "avatar-uploading", ui.upload({ id: "fixture-upload-avatar-uploading", variant: "avatar", label: "Profile photo", avatar: "Assets/Images/avatars/teacher-rachel.svg", state: "uploading" })),
        fixture("upload", "avatar-error", ui.upload({ id: "fixture-upload-avatar-error", variant: "avatar", label: "Profile photo", state: "error", error: "Photo must be smaller than 5 MB." })),
        fixture("upload", "hover", ui.upload({ id: "fixture-upload-hover", label: "Add lesson material", state: "hover" })),
        fixture("upload", "focus", ui.upload({ id: "fixture-upload-focus", label: "Add lesson material", state: "focus" })),
        fixture("upload", "disabled", ui.upload({ id: "fixture-upload-disabled", label: "Add lesson material", disabled: true })),
        fixture("upload", "uploading", ui.upload({ id: "fixture-upload-uploading", variant: "trigger", label: "Lesson documents", files: [{ id: "notes", name: "speaking-notes.docx", size: 820000, status: "uploading", progress: 62 }] })),
        fixture("upload", "complete", ui.upload({ id: "fixture-upload-complete", label: "Lesson documents", files: [{ id: "brief", name: "lesson-brief.pdf", size: 1250000, status: "complete" }] })),
        fixture("upload", "error", ui.upload({ id: "fixture-upload-error", variant: "trigger", label: "Lesson documents", files: [{ id: "large", name: "portfolio.pdf", size: 14200000, status: "error", error: "This file is larger than 10 MB." }] })),
        fixture("upload", "multiple", ui.upload({ id: "fixture-upload-multiple", label: "Share preparation files", multiple: true, files: [{ id: "brief", name: "lesson-brief.pdf", size: 1250000, status: "complete" }, { id: "notes", name: "speaking-notes.docx", size: 820000, status: "uploading", progress: 62 }] })),
        fixture("upload", "accept", ui.upload({ id: "fixture-upload-accept", label: "Profile evidence", accept: ".pdf,.png", maxSize: "PDF or PNG up to 5 MB." }))
      ],
      stepper: [
        fixture("stepper", "default", ui.stepper({ id: "fixture-steps-default", items: ["Course", "Time", "Payment"] })),
        fixture("stepper", "current", ui.stepper({ id: "fixture-steps-current", items: ["Course", "Time", "Payment"], current: 1 })),
        fixture("stepper", "complete", ui.stepper({ id: "fixture-steps-complete", items: ["Course", "Time", "Payment"], current: 2 })),
        fixture("stepper", "vertical", ui.stepper({ id: "fixture-steps-vertical", items: ["Course", "Time", "Payment"], current: 1, orientation: "vertical" })),
        fixture("stepper", "flow-progress", ui.stepper({ id: "fixture-flow-current", items: ["Course", "Time", "Payment"], current: 1, variant: "flow-progress", ariaLabel: "Booking flow progress" }))
      ],
      progress: [
        fixture("progress", "default", ui.progress({ value: 62 })),
        fixture("progress", "success", ui.progress({ value: 100, status: "success" })),
        fixture("progress", "error", ui.progress({ value: 42, status: "error" })),
        fixture("progress", "indeterminate", ui.progress({ indeterminate: true }))
      ],
      toast: [
        fixture("toast", "info", ui.toast({ tone: "info", title: "Lesson reminder" })),
        fixture("toast", "success", ui.toast({ tone: "success", title: "Saved" })),
        fixture("toast", "warning", ui.toast({ tone: "warning", title: "Check time zone" })),
        fixture("toast", "error", ui.toast({ tone: "error", title: "Payment unsuccessful" })),
        fixture("toast", "closable", ui.toast({ tone: "info", title: "New message", closable: true }))
      ],
      notification: [
        fixture("notification", "info", ui.notification({ tone: "info", title: "Lesson reminder", description: "Your lesson starts in 30 minutes." })),
        fixture("notification", "success", ui.notification({ tone: "success", title: "Profile published", description: "Learners can now find you in Teacher Search." })),
        fixture("notification", "warning", ui.notification({ tone: "warning", title: "Availability needs attention", description: "Add new time slots before Friday." })),
        fixture("notification", "error", ui.notification({ tone: "error", title: "Payment needs updating", description: "Update your payment method to continue." })),
        fixture("notification", "closable", ui.notification({ tone: "info", title: "New message", closable: true })),
        fixture("notification", "with-action", ui.notification({ tone: "info", title: "Teacher replied", description: "Maya sent a new message.", action: ui.button({ label: "View lesson", variant: "text", size: 32, shape: "pill" }) }))
      ],
      result: [
        fixture("result", "success", ui.result({ tone: "success", title: "Lesson booked", description: "Your lesson with Maya is confirmed." })),
        fixture("result", "info", ui.result({ tone: "info", title: "Request received", description: "We will let you know once your teacher responds." })),
        fixture("result", "warning", ui.result({ tone: "warning", title: "Availability changed", description: "Choose another time to continue." })),
        fixture("result", "error", ui.result({ tone: "error", title: "Payment could not be completed", description: "Your booking has not been confirmed." })),
        fixture("result", "with-action", ui.result({ tone: "success", title: "Lesson booked", action: ui.button({ label: "View lesson", variant: "red", size: 40, shape: "pill" }) })),
        fixture("result", "with-secondary-action", ui.result({ tone: "error", title: "Payment could not be completed", action: ui.button({ label: "Try again", variant: "red", size: 40, shape: "pill" }), secondaryAction: ui.button({ label: "Back to lessons", variant: "secondary", size: 40, shape: "pill" }) }))
      ],
      skeleton: [
        fixture("skeleton", "text", ui.skeleton({ type: "text" })),
        fixture("skeleton", "content", ui.skeleton({ type: "content", avatar: true, lines: 2 })),
        fixture("skeleton", "avatar", ui.skeleton({ type: "avatar" })),
        fixture("skeleton", "button", ui.skeleton({ type: "button", shape: "round" })),
        fixture("skeleton", "input", ui.skeleton({ type: "input" })),
        fixture("skeleton", "image", ui.skeleton({ type: "image" })),
        fixture("skeleton", "card", ui.skeleton({ type: "card" })),
        fixture("skeleton", "reduced-motion", ui.skeleton({ type: "content", avatar: true, animated: false }))
      ],
      "dropdown-menu": [
        fixture("dropdown-menu", "closed", ui.dropdownMenu({ id: "fixture-dropdown-closed", items: ["Message"] })),
        fixture("dropdown-menu", "open", ui.dropdownMenu({ id: "fixture-dropdown-open", items: ["Message"], open: true })),
        fixture("dropdown-menu", "disabled-item", ui.dropdownMenu({ id: "fixture-dropdown-disabled", items: [{ label: "Delete", disabled: true }], open: true })),
        fixture("dropdown-menu", "destructive-item", ui.dropdownMenu({ id: "fixture-dropdown-danger", items: [{ label: "Cancel lesson", danger: true }], open: true }))
      ],
      disclosure: [
        fixture("disclosure", "closed", ui.disclosure({ id: "fixture-disclosure-closed", title: "Lesson details", content: "Content" })),
        fixture("disclosure", "open", ui.disclosure({ id: "fixture-disclosure-open", title: "Lesson details", content: "Content", open: true })),
        fixture("disclosure", "disabled", ui.disclosure({ id: "fixture-disclosure-disabled", title: "Lesson details", content: "Content", disabled: true })),
        fixture("disclosure", "details", ui.disclosure({ id: "fixture-disclosure-details", title: "Cancellation policy", content: "Policy details", open: true, kind: "details" }))
      ],
      "segmented-control": [
        fixture("segmented-control", "default", ui.segmentedControl({ id: "fixture-segmented-default", options: ["Week", "Month"] })),
        fixture("segmented-control", "pill", ui.segmentedControl({ id: "fixture-segmented-pill", options: ["Week", "Month"], shape: "pill" })),
        fixture("segmented-control", "rounded", ui.segmentedControl({ id: "fixture-segmented-rounded", options: ["Week", "Month"], shape: "rounded" })),
        fixture("segmented-control", "selected", ui.segmentedControl({ id: "fixture-segmented-selected", options: ["Week", "Month"], selected: "Month" })),
        fixture("segmented-control", "disabled", ui.segmentedControl({ id: "fixture-segmented-disabled", options: ["Week", "Month"], disabled: true }))
      ],
      "time-slot": [
        fixture("time-slot", "available", ui.timeSlot({ label: "09:00", state: "available" })),
        fixture("time-slot", "selected", ui.timeSlot({ label: "10:30", state: "selected" })),
        fixture("time-slot", "unavailable", ui.timeSlot({ label: "13:00", state: "unavailable" })),
        fixture("time-slot", "booked-by-others", ui.timeSlot({ label: "16:30", state: "booked-by-others" })),
        fixture("time-slot", "booked-by-you", ui.timeSlot({ label: "18:00", state: "booked-by-you" })),
        fixture("time-slot", "loading", ui.timeSlot({ loading: true })),
        fixture("time-slot", "option", ui.timeSlot({ label: "19:00", appearance: "option" }))
      ],
      "time-picker": [
        fixture("time-picker", "default", ui.timePicker({ id: "fixture-time-picker-default", slots: ["09:00", "10:30"] })),
        fixture("time-picker", "open", ui.timePicker({ id: "fixture-time-picker-open", slots: ["09:00", "10:30"], open: true })),
        fixture("time-picker", "selected", ui.timePicker({ id: "fixture-time-picker-selected", slots: ["09:00", "10:30"], selected: "10:30" })),
        fixture("time-picker", "disabled", ui.timePicker({ id: "fixture-time-picker-disabled", slots: ["09:00"], disabled: true }))
      ],
      calendar: [
        fixture("calendar", "default", ui.calendar({ id: "fixture-calendar-default", dates: calendarDates, rows: calendarRows })),
        fixture("calendar", "selected-slot", ui.calendar({ id: "fixture-calendar-selected", dates: calendarDates, rows: calendarRows })),
        fixture("calendar", "unavailable-slot", ui.calendar({ id: "fixture-calendar-unavailable", dates: calendarDates, rows: calendarRows.map((row, rowIndex) => rowIndex === 0 ? { ...row, slots: ["unavailable", ...row.slots.slice(1)] } : row) })),
        fixture("calendar", "with-time-picker", ui.calendar({ id: "fixture-calendar-time-picker", dates: calendarDates, rows: calendarRows, timePicker: { label: "Lesson time", slots: ["09:00", "10:30", "13:00"], selected: "10:30" } })),
        fixture("calendar", "teacher-availability", ui.calendar({ id: "fixture-calendar-teacher-availability", variant: "teacher-availability", availabilityLabel: "Available 14:15PM Today", teacherAvailability: teacherAvailabilityDays, ariaLabel: "Teacher availability" })),
        fixture("calendar", "compact-availability", ui.calendar({ id: "fixture-calendar-compact", variant: "compact-availability", timezone: "Asia/Shanghai (UTC +08:00)", dates: compactCalendarDates, rows: compactCalendarRows, ariaLabel: "Compact weekly availability" })),
        fixture("calendar", "lesson-record", ui.calendar({ id: "fixture-calendar-lesson-record", variant: "lesson-record", recordTitle: "My lessons", recordStats: [{ label: "Total lesson count", value: "421", tone: "info" }, { label: "Total practice hours", value: "562", tone: "success" }], recordMonths: lessonRecordMonths, ariaLabel: "Lesson record" }))
      ],
      footer: [
        fixture("footer", "standard", ui.footer({ id: "fixture-footer-standard", columns: [{ heading: "Explore", links: ["Teachers", "Lessons"] }] })),
        fixture("footer", "with-utilities", ui.footer({ id: "fixture-footer-utilities", columns: [{ heading: "Explore", links: ["Teachers"] }], utilities: ui.select({ id: "fixture-footer-language", label: "Language", options: ["English", "French"], selected: "English", size: 40, shape: "rounded" }) })),
        fixture("footer", "with-legal-links", ui.footer({ id: "fixture-footer-legal", columns: [{ heading: "Explore", links: ["Teachers"] }], copyright: "© italki", legalLinks: ["Terms", "Privacy"] })),
        fixture("footer", "with-social-links", ui.footer({ id: "fixture-footer-social", columns: [{ heading: "Explore", links: ["Teachers"] }], socialLinks: [{ label: "YouTube", icon: "Assets/Icons/youtube.svg" }] }))
      ],
      popover: [
        fixture("popover", "closed", ui.popover({ id: "fixture-popover-closed", title: "Teacher profile", body: "Content" })),
        fixture("popover", "open", ui.popover({ id: "fixture-popover-open", title: "Teacher profile", body: "Content", open: true })),
        fixture("popover", "placement", ui.popover({ id: "fixture-popover-placement", title: "Teacher profile", body: "Content", open: true, placement: "top" })),
        fixture("popover", "with-actions", ui.popover({ id: "fixture-popover-actions", title: "Teacher profile", body: "Content", open: true, actions: ui.button({ label: "Message", variant: "secondary", size: 32, shape: "pill" }) })),
        fixture("popover", "leave-delay", ui.popover({ id: "fixture-popover-delay", title: "Teacher profile", body: "Content", open: true, closeOnLeave: true, leaveDelay: 300 }))
      ],
      switch: [
        fixture("switch", "off", ui.switchControl({ label: "Off" })),
        fixture("switch", "on", ui.switchControl({ checked: true, label: "On" })),
        fixture("switch", "hover", ui.switchControl({ state: "hover", label: "Hover" })),
        fixture("switch", "disabled", ui.switchControl({ checked: true, disabled: true, label: "Disabled" }))
      ]
    };

    return {
      entries,
      groups: {
        buttons: entries.button.map((item) => item.markup).join(""),
        choices: [...entries.chip, ...entries.checkbox, ...entries.tag].map((item) => item.markup).join(""),
        checkboxGroups: entries["checkbox-group"].map((item) => item.markup).join(""),
        radios: entries.radio.map((item) => item.markup).join(""),
        selections: entries.selection.map((item) => item.markup).join(""),
        datePickers: entries["date-picker"].map((item) => item.markup).join(""),
        tooltips: entries.tooltip.map((item) => item.markup).join(""),
        modals: entries.modal.map((item) => item.markup).join(""),
        popups: entries.popup.map((item) => item.markup).join(""),
        popconfirms: entries.popconfirm.map((item) => item.markup).join(""),
        dividers: entries.divider.map((item) => item.markup).join(""),
        avatars: entries.avatar.map((item) => item.markup).join(""),
        badges: entries.badge.map((item) => item.markup).join(""),
        breadcrumbs: entries.breadcrumb.map((item) => item.markup).join(""),
        cards: entries.card.map((item) => item.markup).join(""),
        alerts: entries.alert.map((item) => item.markup).join(""),
        tabs: entries.tabs.map((item) => item.markup).join(""),
        pagination: entries.pagination.map((item) => item.markup).join(""),
        rates: entries.rate.map((item) => item.markup).join(""),
        sidebars: entries.sidebar.map((item) => item.markup).join(""),
        statistics: entries.statistic.map((item) => item.markup).join(""),
        tables: entries.table.map((item) => item.markup).join(""),
        timelines: entries.timeline.map((item) => item.markup).join(""),
        topNavs: entries["top-nav"].map((item) => item.markup).join(""),
        inputs: `<div class="row">${entries.search.map((item) => item.markup).join("")}</div><div class="row">${entries.switch.map((item) => item.markup).join("")}</div>`,
        selects: entries.select.map((item) => `<div class="select-fixture-cell">${item.markup}</div>`).join(""),
        sliders: entries.slider.map((item) => item.markup).join(""),
        panels: entries.panel.map((item) => item.markup).join(""),
        formFields: entries["form-field"].map((item) => item.markup).join(""),
        textInputs: entries["text-input"].map((item) => item.markup).join(""),
        textareas: entries.textarea.map((item) => item.markup).join(""),
        numberSteppers: entries["number-stepper"].map((item) => item.markup).join(""),
        uploads: entries.upload.map((item) => item.markup).join(""),
        comboboxes: entries.combobox.map((item) => `<div class="select-fixture-cell">${item.markup}</div>`).join(""),
        steppers: entries.stepper.map((item) => item.markup).join(""),
        progress: entries.progress.map((item) => item.markup).join(""),
        toasts: entries.toast.map((item) => item.markup).join(""),
        notifications: entries.notification.map((item) => item.markup).join(""),
        results: entries.result.map((item) => item.markup).join(""),
        skeletons: entries.skeleton.map((item) => item.markup).join(""),
        dropdownMenus: entries["dropdown-menu"].map((item) => item.markup).join(""),
        disclosures: entries.disclosure.map((item) => item.markup).join(""),
        segmentedControls: entries["segmented-control"].map((item) => item.markup).join(""),
        timeSlots: entries["time-slot"].map((item) => item.markup).join(""),
        timePickers: entries["time-picker"].map((item) => `<div class="select-fixture-cell">${item.markup}</div>`).join(""),
        calendars: entries.calendar.map((item) => item.markup).join(""),
        footers: entries.footer.map((item) => item.markup).join(""),
        drawers: entries.drawer.map((item) => item.markup).join(""),
        popovers: entries.popover.map((item) => item.markup).join("")
      }
    };
  }

  global.ITalkiUIFixtures = Object.freeze({ build });
})(window);
