// Two shims that let this template consume the kit from a nested folder.
//
// 1) Asset base — the vanilla builders hardcode page-relative paths ("Assets/Icons/x.svg").
//    This page lives two levels down, so those 404. An observer rewrites them as they land.
// 2) Component namespace — `SafeUI.<Name>` resolves to the kit's component of that
//    name. Prop filtering is the bundle's job now: its wrapper drops React's own
//    keys before the contract sees them, so this layer only has to forward.
(() => {
  /* Two different jobs with two different rules, and conflating them took both
     templates' shells out.
     — Listening is once per page. This file sits in the helmet, which the
       runtime may run again on a re-render, and a dispatcher bound twice
       handles every click twice; a toggle handled twice never moves. That was
       "clicking collapse does nothing".
     — Defining SafeUI is every time, unconditionally. It is a namespace, not a
       side effect: whoever is about to render needs it to exist right now.
     Guarding the whole file with one flag meant the second execution returned
     before SafeUI was defined, so every x-import resolved to nothing and the
     sidebar and top nav rendered empty — on both templates at once, because
     the flag lives on the shared window. Only the listeners get the guard. */
  const alreadyListening = window.__dsSafeBound;
  window.__dsSafeBound = true;

  const BASE = "../../";
  /* Two shapes of the same mistake. A page-relative "Assets/…" path is right
     for the kit and wrong two folders down, and a bare icon name — "share",
     "favorite-outline" — is what the components accept but a plain <img> does
     not, so it renders as a broken image. Both are resolved here, where the
     depth is known. */
  const NAMED = /^[a-z0-9][a-z0-9-]*$/i;
  const resolve = (src) => {
    if (!src) return null;
    if (src.startsWith("Assets/")) return BASE + src;
    if (NAMED.test(src)) return BASE + "Assets/Icons/" + src + ".svg";
    return null;
  };
  const rewrite = (root) => {
    if (!root || root.nodeType !== 1) return;
    const nodes = root.matches?.("img[src]") ? [root] : [];
    root.querySelectorAll?.("img[src]").forEach((n) => nodes.push(n));
    for (const img of nodes) {
      const next = resolve(img.getAttribute("src"));
      if (next) img.setAttribute("src", next);
    }
  };
  rewrite(document.body);
  if (!alreadyListening) {
    new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) rewrite(node);
        if (record.type === "attributes") rewrite(record.target);
      }
    }).observe(document.documentElement, {
      childList: true, subtree: true, attributes: true, attributeFilter: ["src"],
    });
  }

  /* Resolved on demand rather than from a list of names. A hand-kept list falls
     behind the kit silently: this template imports SafeUI.Tabs, SafeUI.Progress
     and SafeUI.Video, none of which were on it, so those three x-imports found
     nothing on the namespace and rendered as empty. A name that the kit does
     not have still returns a component — one that renders null — which is the
     same outcome as before, without the list to maintain. */
  /* React spells an initial-value prop `defaultChecked`, `defaultValue`; the
     kit spells the same idea `collapsed`, `open`, `checked`, because every one
     of its props is the current state. Anyone writing the template reaches for
     the React spelling, the contract rejects the name, and the whole component
     is replaced by an error — one attribute takes out the entire sidebar. This
     is the boundary between the two vocabularies, so the translation belongs
     here: defaultX becomes X when the component accepts X and X was not also
     given. Anything else is passed through and still rejected on its merits. */
  /* The templates call Component.kit() to reach the vanilla runtime, and a
     rewrite dropped the static that provided it — Component.kit is not a
     function, thrown from componentDidMount, which takes the whole page down
     before anything renders. Static members are inherited, so putting it on the
     base class serves every template without any of them having to carry it. */
  const kit = () => window.ITalkiUI || (window.ItalkiUI || {}).raw || null;
  const installKit = () => {
    const Base = window.DCLogic;
    if (typeof Base !== "function") return false;
    if (typeof Base.kit !== "function") Base.kit = kit;
    return true;
  };
  if (!installKit()) {
    let tries = 0;
    const timer = setInterval(() => { if (installKit() || ++tries > 100) clearInterval(timer); }, 20);
  }

  /* The kit ships behaviour as imperative helpers keyed off data-demo hooks and
     leaves the wiring to the page. Every template then carries its own copy of
     the same table, and when a rewrite drops it the page looks correct and does
     nothing: teacher-profile lost its dispatcher and with it the collapse
     toggle, More, the sections and both pin controls, with no error anywhere.
     One dispatcher here serves every template, and none of them has to carry
     it. Nothing is guessed — a hook with no entry is left alone. */
  const missing = new Set();
  const run = (name, ...args) => {
    const ui = kit();
    const fn = ui && ui[name];
    if (typeof fn !== "function") {
      if (!missing.has(name)) { missing.add(name); console.warn("ds-safe: " + name + " is not in this bundle"); }
      return;
    }
    try { fn(...args); } catch (error) { console.warn("ds-safe: " + name + " threw", error); }
  };
  const CLICK = {
    "ui-sidebar-collapse": (c) => run("toggleSidebar", c),
    "ui-sidebar-brand": (c) => run("toggleSidebar", c),
    "ui-sidebar-section": (c) => run("toggleSidebarSection", c),
    "ui-sidebar-item": (c) => run("selectSidebarItem", c),
    "ui-sidebar-more": (c) => run("toggleSidebarMore", c),
    "ui-sidebar-more-item": (c) => { run("selectSidebarItem", c); run("closeSidebarMore", c); },
    "ui-sidebar-pin": (c) => run("pinSidebarItem", c),
    "ui-sidebar-unpin": (c) => run("unpinSidebarItem", c),
    "ui-top-nav-context": (c) => run("setTopNavContextOpen", c),
    "ui-top-nav-context-option": (c) => run("selectTopNavContext", c),
    "ui-top-nav-search-clear": (c) => run("clearTopNavSearch", c),
    "ui-tabs-trigger": (c) => run("selectTab", c),
    "ui-calendar-slot": (c) => run("selectCalendarSlot", c),
    /* Same table as the cards. Kept in step by the audit, not by memory. */
    "ui-drawer-open": (c) => run("openDrawer", c),
    "ui-drawer-close": (c) => run("closeDrawer", c),
    "ui-drawer-mask": (c) => run("closeDrawer", c),
    "ui-modal-open": (c) => run("openModal", c),
    "ui-modal-close": (c) => run("closeModal", c),
    "ui-popup-toggle": (c) => run("togglePopup", c),
    "ui-popup-close": (c) => run("closePopup", c),
    "ui-popconfirm-toggle": (c) => run("togglePopconfirm", c),
    "ui-popconfirm-close": (c) => run("closePopconfirm", c),
    "ui-dropdown-toggle": (c) => run("toggleDropdownMenu", c),
    "ui-dropdown-item": (c) => run("closeDropdownMenus", c),
    "ui-disclosure-toggle": (c) => run("toggleDisclosure", c),
    "ui-select-trigger": (c) => run("toggleSelect", c),
    "ui-select-option": (c) => run("selectOption", c),
    "ui-select-clear": (c) => run("clearSelect", c),
    "ui-select-remove": (c) => run("removeSelectValue", c),
    "ui-breadcrumb-overflow": (c) => run("toggleBreadcrumb", c),
    "ui-breadcrumb-overflow-item": (c) => run("closeBreadcrumbs", c),
    "ui-date-toggle": (c) => run("toggleDatePicker", c),
    "ui-date-day": (c) => run("selectDatePickerDay", c),
    "ui-date-previous": (c) => run("navigateDatePicker", c),
    "ui-date-next": (c) => run("navigateDatePicker", c),
    "ui-time-picker-toggle": (c) => run("toggleTimePicker", c),
    "ui-number-stepper-decrement": (c) => run("adjustNumberStepper", c),
    "ui-number-stepper-increment": (c) => run("adjustNumberStepper", c),
    "ui-upload-remove": (c) => run("removeUploadFile", c),
    "ui-selection-card": (c) => run("toggleSelectionCard", c),
    "ui-lesson-toggle": (c) => run("toggleLessonOptions", c),
    "ui-timeline-reverse": (c) => run("setTimelineReverse", c),
    "ui-teacher-date": (c) => run("selectTeacherAvailabilityDate", c),
    "ui-toast-close": (c) => run("dismissToast", c),
    "ui-notification-close": (c) => run("dismissNotification", c),
    "ui-alert-close": (c) => run("dismissAlert", c),
    "ui-segmented-control": (c) => run("selectSegmentedControl", c),
    "ui-rate": (c) => run("selectRate", c),
    "ui-radio": (c) => run("selectRadio", c),
    "ui-switch": (c) => run("toggleSwitch", c),
    "ui-checkbox-group-all": (c) => run("toggleCheckboxGroup", c),
    "ui-checkbox-group-item": (c) => run("toggleCheckboxGroup", c),
    "ui-pagination": (c) => run("selectPaginationPage", c),
    "ui-search-clear": (c) => run("clearSearch", c),
    "ui-calendar-action": (c) => run("notifyCalendarAction", c),
    "ui-time-picker-slot": (c) => run("selectTimePickerSlot", c),
    "ui-upload-trigger": (c) => run("openUploadPicker", c),
    "ui-top-nav-filter": (c) => run("toggleTopNavFilter", c),
    /* The Filter pattern's own controls. The drawer composes from the kit, so
       its chips and category tree arrive as data-demo hooks with no onClick —
       and nothing bound them: 30 chips, 6 parent checkboxes and both price
       handles rendered correctly and could not be touched. The behaviour is a
       kit helper now, so this is a binding, not a reimplementation. */
    "ds-chip": (c) => run("toggleChip", c),
    "filter-category-child": (c) => run("toggleFilterCategoryChild", c),
    "filter-category-parent": (c) => run("toggleFilterCategoryParent", c),
    "ui-modal-mask": (c) => run("closeModal", c),
  };
  if (!alreadyListening) {
    document.addEventListener("click", (event) => {
      if (!event.target.closest?.("[data-ui-sidebar-more]")) run("closeSidebarMore");
      const hook = event.target.closest?.("[data-demo]");
      const handler = hook && CLICK[hook.dataset.demo];
      if (handler) handler(hook);
    }, true);
    document.addEventListener("dragstart", (e) => run("startSidebarDrag", e));
    document.addEventListener("dragover", (e) => run("moveSidebarDrag", e));
    document.addEventListener("dragend", (e) => run("endSidebarDrag", e));
    document.addEventListener("mouseover", (e) => {
      const more = e.target.closest?.("[data-ui-sidebar-more]");
      if (more && !more.contains(e.relatedTarget)) run("cancelSidebarMoreClose", more);
    }, true);
    document.addEventListener("mouseout", (e) => {
      const more = e.target.closest?.("[data-ui-sidebar-more]");
      if (more && !more.contains(e.relatedTarget)) run("scheduleSidebarMoreClose", more);
    }, true);
    document.addEventListener("input", (e) => {
      const input = e.target.closest?.('[data-demo="ui-top-nav-search-input"]');
      if (input) run("syncTopNavSearch", input);
    }, true);
    document.addEventListener("input", (e) => {
      /* The range handles are inputs, so they are synced rather than clicked —
         without this the price range could be dragged and nothing moved. */
      const range = e.target.closest?.('[data-demo="ui-slider-range"]');
      if (range) run("syncSliderRange", range);
      const single = e.target.closest?.('[data-demo="ui-slider"]');
      if (single) run("syncSliderInput", single);
    }, true);
    const searchFocus = (state) => (e) => {
      const input = e.target.closest?.('[data-demo="ui-top-nav-search-input"]');
      if (input) run("setTopNavSearchFocus", input, state);
    };
    document.addEventListener("focusin", searchFocus(true), true);
    document.addEventListener("focusout", searchFocus(false), true);
  }

  const contractFor = (name) => {
    const contract = (window.ITalkiUIContracts || {}).components || {};
    return contract[name] || contract[name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()] || null;
  };
  const acceptedFor = (name) => (contractFor(name) || {}).acceptedProps || [];
  const accepts = (name, prop) => acceptedFor(name).includes(prop);
  /* HTML lowercases attribute names, so `moreItems="…"` on an x-import reaches
     JavaScript as `moreitems`, and whether it is folded back to camelCase is up
     to whichever build of the dc-runtime the page happens to load. When it is
     not, the prop is silently not the prop: moreitems never became moreItems,
     the sidebar got no overflow list, and More opened onto "Nothing here yet".
     The contract knows the real spelling, so restore it from there rather than
     depending on the runtime's version. */
  const restoreCase = (name, key) => {
    const accepted = acceptedFor(name);
    if (!accepted.length || accepted.includes(key)) return key;
    const lower = key.toLowerCase();
    const matches = accepted.filter((prop) => prop.toLowerCase() === lower);
    return matches.length === 1 ? matches[0] : key;
  };
  const cache = {};
  const make = (name) => function SafeComponent(props) {
    const React = window.React;
    const Impl = (window.ItalkiUI || {})[name];
    if (!React || !Impl) return null;
    const clean = {};
    for (const key in props) {
      if (props[key] === undefined) continue;
      const cased = restoreCase(name, key);
      const defaulted = /^default[a-zA-Z]/.test(cased)
        && cased[7].toLowerCase() + cased.slice(8);
      if (defaulted && !(defaulted in props) && accepts(name, defaulted)) {
        clean[defaulted] = props[key];
        continue;
      }
      clean[cased] = props[key];
    }
    return React.createElement(Impl, clean, props.children);
  };
  window.SafeUI = new Proxy(cache, {
    get(target, name) {
      if (typeof name !== "string") return target[name];
      if (!target[name]) target[name] = make(name);
      return target[name];
    },
  });
})();
