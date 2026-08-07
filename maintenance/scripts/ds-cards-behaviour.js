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
  const start = () => {
    const ui = window.ITalkiUI;
    if (!ui) return false;

    /* Same mapping as index.html's dispatcher. A hook with no entry is left
       alone rather than guessed at. */
    const CLICK = {
      'ui-drawer-open': (c) => ui.openDrawer(c),
      'ui-drawer-close': (c) => ui.closeDrawer(c),
      'ui-drawer-mask': (c) => ui.closeDrawer(c),
      'ui-modal-open': (c) => ui.openModal(c),
      'ui-modal-close': (c) => ui.closeModal(c),
      'ui-popup-toggle': (c) => ui.togglePopup(c),
      'ui-popup-close': (c) => ui.closePopup(c, true),
      'ui-popconfirm-toggle': (c) => ui.togglePopconfirm(c),
      'ui-popconfirm-close': (c) => ui.closePopconfirm(c, true),
      'ui-dropdown-toggle': (c) => ui.toggleDropdownMenu(c),
      'ui-dropdown-item': () => ui.closeDropdownMenus(),
      'ui-disclosure-toggle': (c) => ui.toggleDisclosure(c),
      'ui-tabs-trigger': (c) => ui.selectTab(c),
      'ui-select-trigger': (c) => ui.toggleSelect(c),
      'ui-select-option': (c) => ui.selectOption(c),
      'ui-select-clear': (c) => ui.clearSelect(c),
      'ui-select-remove': (c) => ui.removeSelectValue(c),
      'ui-breadcrumb-overflow': (c) => ui.toggleBreadcrumb(c),
      'ui-breadcrumb-overflow-item': () => ui.closeBreadcrumbs(),
      'ui-date-toggle': (c) => ui.toggleDatePicker(c),
      'ui-date-day': (c) => ui.selectDatePickerDay(c),
      'ui-date-previous': (c) => ui.navigateDatePicker(c, -1),
      'ui-date-next': (c) => ui.navigateDatePicker(c, 1),
      'ui-time-picker-toggle': (c) => ui.toggleTimePicker(c),
      'ui-number-stepper-decrement': (c) => ui.adjustNumberStepper(c, -1),
      'ui-number-stepper-increment': (c) => ui.adjustNumberStepper(c, 1),
      'ui-upload-remove': (c) => ui.removeUploadFile(c),
      'ui-selection-card': (c) => ui.toggleSelectionCard(c),
      'ui-calendar-slot': (c) => ui.selectCalendarSlot(c),
      'ui-teacher-date': (c) => ui.selectTeacherAvailabilityDate(c),
      'ui-toast-close': (c) => ui.dismissToast(c),
      'ui-notification-close': (c) => ui.dismissNotification(c),
      'ui-alert-close': (c) => ui.dismissAlert(c),
      'ui-sidebar-collapse': (c) => ui.toggleSidebar(c),
      'ui-sidebar-brand': (c) => ui.toggleSidebar(c),
      'ui-sidebar-section': (c) => ui.toggleSidebarSection(c),
      'ui-sidebar-item': (c) => ui.selectSidebarItem(c),
      'ui-sidebar-more': (c) => ui.toggleSidebarMore(c),
      'ui-sidebar-more-item': (c) => { ui.selectSidebarItem(c); ui.closeSidebarMore(c); },
      'ui-sidebar-pin': (c) => ui.pinSidebarItem(c),
      'ui-sidebar-unpin': (c) => ui.unpinSidebarItem(c),
      'ui-segmented-control': (c) => ui.selectSegmentedControl(c),
      'ui-rate': (c, event) => ui.selectRate(c, event),
    };

    document.addEventListener('click', (event) => {
      if (!event.target.closest('[data-ui-sidebar-more]')) ui.closeSidebarMore();
      const hook = event.target.closest('[data-demo]');
      const run = hook && CLICK[hook.dataset.demo];
      if (run) run(hook, event);
    }, true);

    /* Reordering, and the More menu's delayed close, are not clicks. */
    document.addEventListener('dragstart', (e) => ui.startSidebarDrag(e));
    document.addEventListener('dragover', (e) => ui.moveSidebarDrag(e));
    document.addEventListener('dragend', (e) => ui.endSidebarDrag(e));
    document.addEventListener('mouseover', (e) => {
      const more = e.target.closest('[data-ui-sidebar-more]');
      if (more && !more.contains(e.relatedTarget)) ui.cancelSidebarMoreClose(more);
    }, true);
    document.addEventListener('mouseout', (e) => {
      const more = e.target.closest('[data-ui-sidebar-more]');
      if (more && !more.contains(e.relatedTarget)) ui.scheduleSidebarMoreClose(more);
    }, true);

    /* Say so when the card renders a hook nobody bound. This list has fallen
       behind the runtime three times — More, the two pin controls, drag — and
       each time the card looked correct and did nothing when clicked, which no
       static check can see. */
    const unbound = new Set();
    for (const node of document.querySelectorAll('[data-demo]')) {
      if (!CLICK[node.dataset.demo]) unbound.add(node.dataset.demo);
    }
    if (unbound.size) console.warn('ds-cards: no handler bound for ' + [...unbound].join(', '));

    /* Checkbox, radio and switch carry their state on the input, so they are
       synced rather than dispatched. */
    document.addEventListener('change', (event) => {
      const box = event.target.closest('[data-component="checkbox"] input, [data-component="checkbox-group"] input');
      if (box && ui.syncCheckboxGroup) ui.syncCheckboxGroup(box);
    }, true);

    return true;
  };

  /* The bundle is loaded with defer, so it may not be installed yet. */
  if (!start()) {
    let tries = 0;
    const timer = setInterval(() => {
      if (start() || ++tries > 100) clearInterval(timer);
    }, 30);
  }
})();
