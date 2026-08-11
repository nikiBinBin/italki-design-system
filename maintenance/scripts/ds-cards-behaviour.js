// Binds the kit's own behaviours inside a Design card.
//
// The renderers are pure string builders: they emit `data-demo` hooks and the
// consuming page decides what those do. The Catalog binds them in index.html;
// the cards did not bind anything at all, so Drawer, Modal, Popconfirm,
// Popover, Popup, DropdownMenu, Tabs and the rest rendered correctly and then
// ignored every click.
//
// This binds the same handlers the Catalog binds, taken from the same runtime
// — nothing here reimplements a behaviour, so a card cannot drift from the
// component. Only component-level hooks are wired: the Catalog's page-level
// controls (size and shape switchers, the icon search) are not part of a
// component and are stripped from cards before they get here.
(() => {
  /* Captured while this script executes, so the bundle can be found relative to
     this file rather than to the page. The card asks for it at ../../../, which
     is right for the project layout and wrong the moment the host serves the
     card from anywhere else — and when it is wrong nothing says so: the poll
     below simply never succeeds and every control on the card is inert. */
  const selfSrc = (document.currentScript && document.currentScript.src) || "";

  /* "not loaded" covers two very different faults — the request failed, or the
     script ran and threw — and telling them apart from the outside took a
     round trip through a person each time. Capture whatever the bundle throws,
     and on failure ask the server what it actually served. */
  let scriptError = "";
  window.addEventListener("error", (event) => {
    if (!scriptError && event && /_ds_bundle\.js/.test(String(event.filename || ""))) {
      scriptError = (event.message || "error") + " @" + (event.lineno || "?");
    }
  }, true);

  const start = () => {
    const ui = window.ITalkiUI;
    if (!ui) return false;

    /* Never let one missing helper take the page down with it. A card can be
       served with a bundle older than this script — the app caches them
       separately — and a single `ui.closeSidebarMore is not a function` thrown
       from the capture-phase listener stops every other card on the page from
       responding to any click at all. Missing is skipped and named once. */
    const missing = new Set();
    const call = (fn, name, ...args) => {
      if (typeof fn !== 'function') {
        if (!missing.has(name)) { missing.add(name); console.warn('ds-cards: ' + name + ' is not in this bundle'); }
        return undefined;
      }
      try { return fn(...args); } catch (error) { console.warn('ds-cards: ' + name + ' threw', error); }
      return undefined;
    };

    /* Same mapping as index.html's dispatcher. A hook with no entry is left
       alone rather than guessed at. */
    const CLICK = {
      'ui-drawer-open': (c) => call(ui.openDrawer, 'openDrawer', c),
      'ui-drawer-close': (c) => call(ui.closeDrawer, 'closeDrawer', c),
      'ui-drawer-mask': (c) => call(ui.closeDrawer, 'closeDrawer', c),
      'ui-modal-open': (c) => call(ui.openModal, 'openModal', c),
      'ui-modal-close': (c) => call(ui.closeModal, 'closeModal', c),
      'ui-popup-toggle': (c) => call(ui.togglePopup, 'togglePopup', c),
      'ui-popup-close': (c) => call(ui.closePopup, 'closePopup', c, true),
      'ui-popconfirm-toggle': (c) => call(ui.togglePopconfirm, 'togglePopconfirm', c),
      'ui-popconfirm-close': (c) => call(ui.closePopconfirm, 'closePopconfirm', c, true),
      'ui-dropdown-toggle': (c) => call(ui.toggleDropdownMenu, 'toggleDropdownMenu', c),
      'ui-dropdown-item': () => call(ui.closeDropdownMenus, 'closeDropdownMenus'),
      'ui-disclosure-toggle': (c) => call(ui.toggleDisclosure, 'toggleDisclosure', c),
      'ui-tabs-trigger': (c) => call(ui.selectTab, 'selectTab', c),
      'ui-select-trigger': (c) => call(ui.toggleSelect, 'toggleSelect', c),
      'ui-select-option': (c) => call(ui.selectOption, 'selectOption', c),
      'ui-select-clear': (c) => call(ui.clearSelect, 'clearSelect', c),
      'ui-select-remove': (c) => call(ui.removeSelectValue, 'removeSelectValue', c),
      'ui-breadcrumb-overflow': (c) => call(ui.toggleBreadcrumb, 'toggleBreadcrumb', c),
      'ui-breadcrumb-overflow-item': () => call(ui.closeBreadcrumbs, 'closeBreadcrumbs'),
      'ui-date-toggle': (c) => call(ui.toggleDatePicker, 'toggleDatePicker', c),
      'ui-date-day': (c) => call(ui.selectDatePickerDay, 'selectDatePickerDay', c),
      'ui-date-previous': (c) => call(ui.navigateDatePicker, 'navigateDatePicker', c, -1),
      'ui-date-next': (c) => call(ui.navigateDatePicker, 'navigateDatePicker', c, 1),
      'ui-time-picker-toggle': (c) => call(ui.toggleTimePicker, 'toggleTimePicker', c),
      'ui-number-stepper-decrement': (c) => call(ui.adjustNumberStepper, 'adjustNumberStepper', c, -1),
      'ui-number-stepper-increment': (c) => call(ui.adjustNumberStepper, 'adjustNumberStepper', c, 1),
      'ui-upload-remove': (c) => call(ui.removeUploadFile, 'removeUploadFile', c),
      'ui-selection-card': (c) => call(ui.toggleSelectionCard, 'toggleSelectionCard', c),
      /* The course card header in Selection's lesson-options group. The
         runtime emits this hook and exports the handler; the table did not
         carry it, so clicking an unselected course did nothing at all. */
      'ui-lesson-toggle': (c) => call(ui.toggleLessonOptions, 'toggleLessonOptions', c),
      /* Same class of gap: the runtime exports setTimelineReverse and the card
         renders the button, and nothing connected the two. The button sits
         beside the timeline rather than inside it, so the handler's closest()
         finds nothing — it also accepts a container holding one, and on a card
         that container is the cell. */
      'ui-timeline-reverse': (c) => call(ui.setTimelineReverse, 'setTimelineReverse', c.closest('.cell') || document.body),
      'ui-calendar-slot': (c) => call(ui.selectCalendarSlot, 'selectCalendarSlot', c),
      'ui-teacher-date': (c) => call(ui.selectTeacherAvailabilityDate, 'selectTeacherAvailabilityDate', c),
      'ui-toast-close': (c) => call(ui.dismissToast, 'dismissToast', c),
      'ui-notification-close': (c) => call(ui.dismissNotification, 'dismissNotification', c),
      'ui-alert-close': (c) => call(ui.dismissAlert, 'dismissAlert', c),
      'ui-sidebar-collapse': (c) => call(ui.toggleSidebar, 'toggleSidebar', c),
      'ui-sidebar-brand': (c) => call(ui.toggleSidebar, 'toggleSidebar', c),
      'ui-sidebar-section': (c) => call(ui.toggleSidebarSection, 'toggleSidebarSection', c),
      'ui-sidebar-item': (c) => call(ui.selectSidebarItem, 'selectSidebarItem', c),
      'ui-sidebar-more': (c) => call(ui.toggleSidebarMore, 'toggleSidebarMore', c),
      'ui-sidebar-more-item': (c) => { call(ui.selectSidebarItem, 'selectSidebarItem', c); call(ui.closeSidebarMore, 'closeSidebarMore', c); },
      'ui-sidebar-pin': (c) => call(ui.pinSidebarItem, 'pinSidebarItem', c),
      'ui-sidebar-unpin': (c) => call(ui.unpinSidebarItem, 'unpinSidebarItem', c),
      'ui-segmented-control': (c) => call(ui.selectSegmentedControl, 'selectSegmentedControl', c),
      /* The Filter pattern's own controls. Its behaviour lived only in the
         Catalog's dispatcher, so the card rendered 30 chips and a category tree
         that could not be touched — and NOT_CLICK below called them page-level,
         which is what kept the gap invisible. They are kit helpers now. */
      'ds-chip': (c) => call(ui.toggleChip, 'toggleChip', c),
      'filter-category-child': (c) => call(ui.toggleFilterCategoryChild, 'toggleFilterCategoryChild', c),
      'filter-category-parent': (c) => call(ui.toggleFilterCategoryParent, 'toggleFilterCategoryParent', c),
      'checkbox': (c) => call(ui.toggleCheckbox, 'toggleCheckbox', c),
      'ui-rate': (c, event) => call(ui.selectRate, 'selectRate', c, event),
      /* Hooks the Catalog binds and this table did not. Found by diffing the
         two: sixteen of them, so every one of those controls rendered
         correctly on its card and ignored the click. A dispatcher that is a
         hand-written subset of another dispatcher will always drift; the diff
         is now part of the audit. */
      'ui-radio': (c) => call(ui.selectRadio, 'selectRadio', c),
      'ui-switch': (c) => call(ui.toggleSwitch, 'toggleSwitch', c),
      'ui-checkbox-group-all': (c) => call(ui.toggleCheckboxGroup, 'toggleCheckboxGroup', c),
      'ui-checkbox-group-item': (c) => call(ui.toggleCheckboxGroup, 'toggleCheckboxGroup', c),
      'ui-pagination': (c) => call(ui.selectPaginationPage, 'selectPaginationPage', c),
      'ui-search-clear': (c) => call(ui.clearSearch, 'clearSearch', c),
      'ui-calendar-action': (c) => call(ui.notifyCalendarAction, 'notifyCalendarAction', c),
      'ui-time-picker-slot': (c) => call(ui.selectTimePickerSlot, 'selectTimePickerSlot', c),
      'ui-upload-trigger': (c) => call(ui.openUploadPicker, 'openUploadPicker', c),
      'ui-top-nav-context': (c) => call(ui.setTopNavContextOpen, 'setTopNavContextOpen', c),
      'ui-top-nav-context-option': (c) => call(ui.selectTopNavContext, 'selectTopNavContext', c),
      'ui-top-nav-filter': (c) => call(ui.toggleTopNavFilter, 'toggleTopNavFilter', c),
      'ui-top-nav-search-clear': (c) => call(ui.clearTopNavSearch, 'clearTopNavSearch', c),
      /* The mask closes only when the dialog says it may. */
      'ui-modal-mask': (c) => { if (c.closest('[data-ui-modal]')?.dataset.maskClosable !== 'false') call(ui.closeModal, 'closeModal', c); },
    };

    document.addEventListener('click', (event) => {
      if (!event.target.closest('[data-ui-sidebar-more]')) call(ui.closeSidebarMore, 'closeSidebarMore');
      const hook = event.target.closest('[data-demo]');
      const run = hook && CLICK[hook.dataset.demo];
      if (run) run(hook, event);
    }, true);

    /* Reordering, and the More menu's delayed close, are not clicks. */
    document.addEventListener('dragstart', (e) => call(ui.startSidebarDrag, 'startSidebarDrag', e));
    document.addEventListener('dragover', (e) => call(ui.moveSidebarDrag, 'moveSidebarDrag', e));
    document.addEventListener('dragend', (e) => call(ui.endSidebarDrag, 'endSidebarDrag', e));
    document.addEventListener('mouseover', (e) => {
      const more = e.target.closest('[data-ui-sidebar-more]');
      if (more && !more.contains(e.relatedTarget)) call(ui.cancelSidebarMoreClose, 'cancelSidebarMoreClose', more);
    }, true);
    document.addEventListener('mouseout', (e) => {
      const more = e.target.closest('[data-ui-sidebar-more]');
      if (more && !more.contains(e.relatedTarget)) call(ui.scheduleSidebarMoreClose, 'scheduleSidebarMoreClose', more);
    }, true);

    /* Say so when the card renders a hook nobody bound. This list has fallen
       behind the runtime five times now — More, the two pin controls, drag, the
       lesson-options course card and the timeline reversal — and each time the
       card looked correct and did nothing when clicked.

       The warning only earns attention if everything it names is a real gap, so
       the hooks that are deliberately not click-dispatched are declared. Two
       reasons for a hook to be here:
       — its state lives on an input, so it is synced on `input`/`change`;
       — it marks a control whose behaviour belongs to the page, not the kit:
         following a breadcrumb, choosing a step, applying a pattern's filters.
       The Catalog wires those on its own pages; a static card cannot. */
    const NOT_CLICK = new Set([
      'ui-slider', 'ui-slider-range', 'ui-textarea', 'ui-select-search',
      'ui-top-nav-search-input', 'ui-upload-input',
      'ui-breadcrumb-item', 'ui-stepper', 'button', 'tag-remove-demo',
      'teacher-discovery-a1', 'teacher-discovery-book-preview',
      'teacher-discovery-filter-apply', 'teacher-discovery-filter-reset',
      'teacher-discovery-pagination', 'teacher-discovery-tag-remove',
    ]);
    const unbound = new Set();
    for (const node of document.querySelectorAll('[data-demo]')) {
      const demo = node.dataset.demo;
      if (!CLICK[demo] && !NOT_CLICK.has(demo)) unbound.add(demo);
    }
    if (unbound.size) console.warn('ds-cards: no handler bound for ' + [...unbound].join(', '));

    /* Checkbox, radio and switch carry their state on the input, so they are
       synced rather than dispatched. */
    /* Same driver the Catalog binds: without it a card's range renders and cannot
       be dragged, because both inputs are pointer-events:none by design. */
    document.addEventListener('pointerdown', (event) => {
      if (event.target.closest?.('[data-slider-range]')) call(ui.startSliderRangeDrag, 'startSliderRangeDrag', event);
    });

    document.addEventListener('input', (event) => {
      /* Range handles are inputs, so they sync rather than dispatch — without
         this a card's price range drags and nothing moves. */
      const range = event.target.closest?.('[data-demo="ui-slider-range"]');
      if (range) call(ui.syncSliderRange, 'syncSliderRange', range);
      const single = event.target.closest?.('[data-demo="ui-slider"]');
      if (single) call(ui.syncSliderInput, 'syncSliderInput', single);
      if (range || single) call(ui.syncFilterPrice, 'syncFilterPrice', document);
    }, true);

    document.addEventListener('change', (event) => {
      const box = event.target.closest('[data-component="checkbox"] input, [data-component="checkbox-group"] input');
      if (box) call(ui.syncCheckboxGroup, 'syncCheckboxGroup', box);
    }, true);

    return true;
  };

  /* The bundle is loaded with defer, so it may not be installed yet. */
  if (!start()) {
    let tries = 0;
    let retried = false;
    const timer = setInterval(() => {
      if (start()) { clearInterval(timer); return; }
      tries += 1;
      /* ~600ms in, the deferred tag has had its chance. Load it again from
         beside this file, which is the one location we can be sure of. */
      if (tries === 20 && selfSrc && !retried) {
        retried = true;
        const again = document.createElement("script");
        again.src = new URL("_ds_bundle.js", selfSrc).href;
        document.head.appendChild(again);
      }
      if (tries > 100) {
        clearInterval(timer);
        console.error("ds-cards: window.ITalkiUI never appeared — the card is inert");
        const note = document.createElement("div");
        note.textContent = "Design-system bundle not usable — this card cannot respond to input.";
        const url = selfSrc ? new URL("_ds_bundle.js", selfSrc).href : "_ds_bundle.js";
        const say = (detail) => { note.textContent += " " + detail; console.error("ds-cards: " + detail); };
        if (scriptError) say("It loaded and threw: " + scriptError);
        else if (window.fetch) {
          fetch(url).then((response) => {
            if (!response.ok) return say("GET " + url + " → " + response.status);
            return response.text().then((body) => say(
              "GET " + url + " → 200, " + body.length + " bytes, but window.ITalkiUI was never set"
            ));
          }).catch((error) => say("GET " + url + " failed: " + error.message));
        }
        note.style.cssText = "position:fixed;z-index:9999;top:0;left:0;right:0;padding:6px 10px;"
          + "background:var(--ui-color-error);color:var(--ui-color-on-primary);font:12px/1.5 system-ui";
        document.body.appendChild(note);
      }
    }, 30);
  }
})();
