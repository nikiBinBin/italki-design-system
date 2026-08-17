import { expect, test } from "@playwright/test";

const fixture = "http://127.0.0.1:4173/maintenance/fixtures/visual-regression.html";

test("documented component states remain visually stable", async ({ page }) => {
  await page.goto(fixture);
  /* Tracks the fixture: it goes up when a documented state is added — List, Section intro and
     the segmented control's icon and role types brought the last eleven — and a drop means states stopped
     rendering. Each pair is unique, so this counts states, not duplicates. */
  await expect(page.locator("[data-contract-state]")).toHaveCount(341);
  await expect(page.locator('[data-contract-component="button"][data-contract-state="loading"] .ui-button')).toHaveAttribute("disabled", "");
  await expect(page.locator('[data-contract-component="checkbox"][data-contract-state="mixed"] [role="checkbox"]')).toHaveAttribute("aria-checked", "mixed");
  await expect(page.locator('[data-contract-component="checkbox-group"][data-contract-state="select-all"] [data-demo="ui-checkbox-group-all"]')).toHaveAttribute("aria-checked", "mixed");
  await expect(page.locator('[data-contract-component="radio"][data-contract-state="block"] [role="radiogroup"]')).toBeVisible();
  await expect(page.locator('[data-contract-component="selection"][data-contract-state="icon-simple-default"] .ui-selection')).toHaveClass(/ui-selection--icon-simple/);
  await expect(page.locator('[data-contract-component="selection"][data-contract-state="icon-simple-selected"] .ui-selection')).toHaveClass(/is-selected/);
  await expect(page.locator('[data-contract-component="selection"][data-contract-state="icon-simple-disabled"] .ui-selection')).toBeDisabled();
  /* The focus stroke is the title-color inset ring from the shared kit. */
  await expect(page.locator('[data-contract-component="selection"][data-contract-state="icon-simple-focus"] .ui-selection')).toHaveCSS("box-shadow", /rgb\(49, 49, 64\)/);
  await expect(page.locator('[data-contract-component="selection"][data-contract-state="icon-card-default"] .ui-selection')).toHaveClass(/ui-selection--icon-card/);
  await expect(page.locator('[data-contract-component="selection"][data-contract-state="lesson-options-list"] [data-ui-lesson-options]')).toBeVisible();
  /* The icon is a masked span painted with currentColor — see the dedicated test
     at the bottom of this file for the whole story. */
  await expect(page.locator('[data-contract-component="selection"][data-contract-state="package-card-default"] .ui-selection__package-offer .ui-selection__package-offer-icon')).toHaveCSS("mask-image", /category-sm\.svg/);
  await expect(page.locator('[data-contract-component="selection"][data-contract-state="radio-selected"] [role="radio"]')).toHaveAttribute("aria-checked", "true");
  await expect(page.locator('[data-contract-component="selection"][data-contract-state="checkbox-selected"] [role="checkbox"]')).toHaveAttribute("aria-checked", "true");
  /* The size variants gave way to responsive desktop/mobile fixtures. */
  await expect(page.locator('[data-contract-component="selection"][data-contract-state="desktop"] .ui-selection').first()).toBeVisible();
  await expect(page.locator('[data-contract-component="selection"][data-contract-state="mobile"] .ui-selection').first()).toBeVisible();
  await expect(page.locator('[data-contract-component="date-picker"][data-contract-state="open"] [role="dialog"]')).toBeVisible();
  await expect(page.locator('[data-contract-component="date-picker"][data-contract-state="disabled"] .ui-date-picker__trigger')).toBeDisabled();
  await expect(page.locator('[data-contract-component="tooltip"][data-contract-state="placement"] [role="tooltip"]')).toBeVisible();
  await expect(page.locator('[data-contract-component="modal"][data-contract-state="open"] [role="dialog"]')).toBeVisible();
  await expect(page.locator('[data-contract-component="modal"][data-contract-state="non-closable"] [data-demo="ui-modal-close"]')).toHaveCount(0);
  await expect(page.locator('[data-contract-component="popup"][data-contract-state="open"] [role="dialog"]')).toBeVisible();
  await expect(page.locator('[data-contract-component="popconfirm"][data-contract-state="open"] [role="alertdialog"]')).toBeVisible();
  await expect(page.locator('[data-contract-component="divider"][data-contract-state="vertical"] [role="separator"]')).toHaveAttribute("aria-orientation", "vertical");
  await expect(page.locator('[data-contract-component="divider"][data-contract-state="left"] .ui-divider')).toHaveClass(/is-left/);
  await expect(page.locator('[data-contract-component="avatar"][data-contract-state="with-flag"] .ui-flag')).toHaveClass(/ui-flag--16/);
  await expect(page.locator('[data-contract-component="avatar"][data-contract-state="logo"] .ui-avatar__logo')).toHaveAttribute("src", "Assets/Icons/logo-italki-logomark-white.svg");
  await expect(page.locator('[data-contract-component="avatar"][data-contract-state="group"] [role="group"]')).toBeVisible();
  await expect(page.locator('[data-contract-component="avatar"][data-contract-state="empty-group"] .ui-avatar--logo')).toBeVisible();
  await expect(page.locator('[data-contract-component="badge"][data-contract-state="overflow"] .ui-badge__marker')).toHaveText("99+");
  await expect(page.locator('[data-contract-component="badge"][data-contract-state="status"] [role="status"]')).toBeVisible();
  await expect(page.locator('[data-contract-component="badge"][data-contract-state="hidden"] .ui-badge__marker')).toHaveCount(0);
  await expect(page.locator('[data-contract-component="breadcrumb"][data-contract-state="standard"] [aria-current="page"]')).toHaveText("English tutors");
  await expect(page.locator('[data-contract-component="breadcrumb"][data-contract-state="overflow"] [role="menu"]')).toBeVisible();
  await expect(page.locator('[data-contract-component="card"][data-contract-state="interactive"] .ui-card')).toHaveClass(/is-interactive/);
  await expect(page.locator('[data-contract-component="card"][data-contract-state="media"] .ui-card__media')).toBeVisible();
  await expect(page.locator('[data-contract-component="alert"][data-contract-state="success"] .ui-alert__icon-image')).toHaveAttribute("src", "Assets/Icons/check.svg");
  await expect(page.locator('[data-contract-component="alert"][data-contract-state="closable"] [data-demo="ui-alert-close"]')).toBeVisible();
  await expect(page.locator('[data-contract-component="tabs"][data-contract-state="icon-count"] .ui-tabs__count')).toHaveText("4");
  await expect(page.locator('[data-contract-component="tabs"][data-contract-state="disabled"] [role="tab"][disabled]')).toBeVisible();
  await expect(page.locator('[data-contract-component="pagination"][data-contract-state="current"] [aria-current="page"]')).toHaveText("2");
  await expect(page.locator('[data-contract-component="pagination"][data-contract-state="disabled"] .ui-pagination__arrow:disabled')).toHaveCount(2);
  await expect(page.locator('[data-contract-component="rate"][data-contract-state="basic"] .ui-rate__item.is-half')).toHaveCount(1);
  await expect(page.locator('[data-contract-component="rate"][data-contract-state="basic"] .ui-rate__star-base').first()).toHaveAttribute("src", "Assets/Icons/star-outline.svg");
  await expect(page.locator('[data-contract-component="rate"][data-contract-state="basic"] .ui-rate__star-image').first()).toHaveAttribute("src", "Assets/Icons/star-solid.svg");
  await expect(page.locator('[data-contract-component="rate"][data-contract-state="summary"] .ui-rate__summary-star')).toHaveAttribute("src", "Assets/Icons/star-solid.svg");
  await expect(page.locator('[data-contract-component="rate"][data-contract-state="summary"] .ui-rate__summary-value')).toHaveText("4.98");
  await expect(page.locator('[data-contract-component="rate"][data-contract-state="labels"] [data-rate-text]')).toHaveText("Okay");
  await expect(page.locator('[data-contract-component="rate"][data-contract-state="disabled"] [role="radio"][disabled]')).toHaveCount(5);
  await expect(page.locator('[data-contract-component="sidebar"][data-contract-state="normal"] [data-ui-sidebar]')).toBeVisible();
  await expect(page.locator('[data-contract-component="sidebar"][data-contract-state="normal"] .ui-sidebar__brand-wordmark')).toBeVisible();
  await expect(page.locator('[data-contract-component="sidebar"][data-contract-state="normal"] .ui-sidebar__brand-mark')).toBeHidden();
  await expect(page.locator('[data-contract-component="sidebar"][data-contract-state="normal"] .ui-sidebar__brand-plus')).toBeHidden();
  await expect(page.locator('[data-contract-component="sidebar"][data-contract-state="normal"] .ui-sidebar__brand-expand')).toBeHidden();
  await expect(page.locator('[data-contract-component="sidebar"][data-contract-state="plus"] [data-ui-sidebar]')).toHaveClass(/ui-sidebar--plus/);
  await expect(page.locator('[data-contract-component="sidebar"][data-contract-state="plus"] .ui-sidebar__brand-plus')).toBeVisible();
  await expect(page.locator('[data-contract-component="sidebar"][data-contract-state="collapsed"] [data-ui-sidebar]')).toHaveClass(/is-collapsed/);
  await expect(page.locator('[data-contract-component="sidebar"][data-contract-state="expanded-section"] [data-ui-sidebar-section].is-open')).toBeVisible();
  await expect(page.locator('[data-contract-component="sidebar"][data-contract-state="more-open"] [role="menu"]')).toBeVisible();
  await expect(page.locator('[data-contract-component="statistic"][data-contract-state="with-affix"] .ui-statistic__prefix')).toHaveText("$");
  /* The loading state skeletons both lines now, so the bare block class matches
     two elements. Named individually — that is the shape being documented. */
  await expect(page.locator('[data-contract-component="statistic"][data-contract-state="loading"] .ui-statistic__skeleton--value')).toBeVisible();
  await expect(page.locator('[data-contract-component="statistic"][data-contract-state="loading"] .ui-statistic__skeleton--description')).toBeVisible();
  await expect(page.locator('[data-contract-component="table"][data-contract-state="default"] table')).toBeVisible();
  await expect(page.locator('[data-contract-component="table"][data-contract-state="with-action"] .ui-button--text')).toBeVisible();
  await expect(page.locator('[data-contract-component="table"][data-contract-state="loading"] [aria-busy="true"] .ui-table__skeleton')).toHaveCount(12);
  await expect(page.locator('[data-contract-component="table"][data-contract-state="empty"] .ui-table__empty')).toHaveText("No upcoming lessons");
  await expect(page.locator('[data-contract-component="timeline"][data-contract-state="with-label"] .ui-timeline')).toHaveClass(/has-labels/);
  expect(await page.locator('[data-contract-component="timeline"][data-contract-state="with-label"] [data-timeline-item]').first().evaluate((item) => {
    const dot = item.querySelector('.ui-timeline__dot');
    if (!dot) return false;
    const itemBox = item.getBoundingClientRect();
    const dotBox = dot.getBoundingClientRect();
    const lineLeft = Number.parseFloat(getComputedStyle(item, '::before').left);
    return Math.abs((dotBox.left - itemBox.left + dotBox.width / 2) - lineLeft) < .1;
  })).toBe(true);
  await expect(page.locator('[data-contract-component="timeline"][data-contract-state="alternate"] .ui-timeline')).toHaveClass(/ui-timeline--alternate/);
  await expect(page.locator('[data-contract-component="timeline"][data-contract-state="pending"] .ui-timeline__dot--pending')).toBeVisible();
  await expect(page.locator('[data-contract-component="timeline"][data-contract-state="reverse"] [data-ui-timeline]')).toHaveAttribute("data-timeline-reversed", "true");
  await expect(page.locator('[data-contract-component="timeline"][data-contract-state="single-tone"] .ui-timeline__dot--info')).toHaveCount(3);
  await expect(page.locator('[data-contract-component="top-nav"][data-contract-state="global-default"] .ui-top-nav-context--compact')).toBeVisible();
  await expect(page.locator('[data-contract-component="top-nav"][data-contract-state="context-open"] [role="menu"]')).toBeVisible();
  await expect(page.locator('[data-contract-component="top-nav"][data-contract-state="search-query"] .ui-top-nav-search__clear')).toBeVisible();
  await expect(page.locator('[data-contract-component="top-nav"][data-contract-state="filtered"] .ui-top-nav-search__filter')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('[data-contract-component="search"][data-contract-state="clearable"] .ui-search__clear')).toBeVisible();
  await expect(page.locator('[data-contract-component="select"][data-contract-state="multiple"] [role="combobox"]')).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator('[data-contract-component="select"][data-contract-state="disabled-option"] [role="option"][disabled]')).toBeVisible();
  await expect(page.locator('[data-contract-component="drawer"][data-contract-state="right"] [role="dialog"]')).toBeVisible();
  await expect(page.locator('[data-contract-component="drawer"][data-contract-state="non-closable"] [data-demo="ui-drawer-close"]')).toHaveCount(0);
  await expect(page.locator('[data-contract-component="form-field"][data-contract-state="error"] [role="alert"]')).toBeVisible();
  await expect(page.locator('[data-contract-component="form-field"][data-contract-state="leading-icon"] .ui-text-input__icon')).toBeVisible();
  await expect(page.locator('[data-contract-component="form-field"][data-contract-state="trailing-action"] .ui-text-input__trailing .ui-button')).toBeVisible();
  await expect(page.locator('[data-contract-component="text-input"][data-contract-state="disabled"] input')).toBeDisabled();
  await expect(page.locator('[data-contract-component="textarea"][data-contract-state="count"] [data-ui-textarea-count]')).toHaveText('12 / 120');
  await expect(page.locator('[data-contract-component="number-stepper"][data-contract-state="minimum"] [data-demo="ui-number-stepper-decrement"]')).toBeDisabled();
  await expect(page.locator('[data-contract-component="combobox"][data-contract-state="open"] [role="listbox"]')).toBeVisible();
  await expect(page.locator('[data-contract-component="upload"][data-contract-state="dropzone"] input[type="file"]')).toHaveAttribute("accept", ".pdf,.docx,.png,.jpg");
  await expect(page.locator('[data-contract-component="upload"][data-contract-state="trigger"] [data-demo="ui-upload-trigger"]')).toBeVisible();
  await expect(page.locator('[data-contract-component="upload"][data-contract-state="avatar-empty"] .ui-upload__avatar')).toBeVisible();
  /* "Filled" showed the user glyph, which is what the empty state shows; it
      carries a real photo now, which is the point of the state. Pinning the one
      filename would fail the next time the sample photo changes, so this asks
      that the filled state holds a photo and that the photo loaded. */
  const filledAvatar = page.locator('[data-contract-component="upload"][data-contract-state="avatar-filled"] .ui-upload__avatar-image');
  await expect(filledAvatar).toHaveAttribute("src", /Assets\/Images\//);
  expect(await filledAvatar.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);
  await expect(page.locator('[data-contract-component="upload"][data-contract-state="avatar-uploading"] .ui-upload__avatar-loading .ui-upload__file-spinner')).toBeVisible();
  await expect(page.locator('[data-contract-component="upload"][data-contract-state="avatar-error"] .ui-upload__avatar-copy small[role="alert"]')).toHaveText(/smaller than 5 MB/);
  await expect(page.locator('[data-contract-component="upload"][data-contract-state="uploading"] .ui-upload__file-spinner')).toBeVisible();
  await expect(page.locator('[data-contract-component="upload"][data-contract-state="complete"] .ui-upload__file-copy small[role="status"]')).toHaveText(/Uploaded/);
  await expect(page.locator('[data-contract-component="upload"][data-contract-state="error"] .ui-upload__file-copy small[role="alert"]')).toHaveText(/larger than 10 MB/);
  await expect(page.locator('[data-contract-component="upload"][data-contract-state="multiple"] [data-ui-upload-file]')).toHaveCount(2);
  await expect(page.locator('[data-contract-component="stepper"][data-contract-state="current"] [aria-current="step"]')).toBeVisible();
  await expect(page.locator('[data-contract-component="stepper"][data-contract-state="flow-progress"] [aria-current="step"]')).toBeVisible();
  await expect(page.locator('[data-contract-component="progress"][data-contract-state="indeterminate"] [role="progressbar"]')).toHaveAttribute('aria-valuetext', 'Loading');
  await expect(page.locator('[data-contract-component="toast"][data-contract-state="closable"] [data-demo="ui-toast-close"]')).toBeVisible();
  await expect(page.locator('[data-contract-component="alert"][data-contract-state="with-action"] .ui-button')).toBeVisible();
  await expect(page.locator('[data-contract-component="skeleton"][data-contract-state="reduced-motion"] .ui-skeleton')).not.toHaveClass(/is-animated/);
  await expect(page.locator('[data-contract-component="skeleton"][data-contract-state="content"] .ui-skeleton__header .ui-skeleton__avatar')).toBeVisible();
  await expect(page.locator('[data-contract-component="skeleton"][data-contract-state="button"] .ui-skeleton--button')).toBeVisible();
  await expect(page.locator('[data-contract-component="dropdown-menu"][data-contract-state="open"] [role="menu"]')).toBeVisible();
  await expect(page.locator('[data-contract-component="disclosure"][data-contract-state="open"] [data-demo="ui-disclosure-toggle"]')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('[data-contract-component="segmented-control"][data-contract-state="selected"] [aria-pressed="true"]')).toHaveText('Month');
  await expect(page.locator('[data-contract-component="time-slot"][data-contract-state="unavailable"] .ui-time-slot')).toBeDisabled();
  await expect(page.locator('[data-contract-component="time-slot"][data-contract-state="booked-by-you"] .ui-time-slot')).toHaveAttribute("data-time-slot-state", "booked-by-you");
  await expect(page.locator('[data-contract-component="time-picker"][data-contract-state="open"] [role="listbox"]')).toBeVisible();
  await expect(page.locator('[data-contract-component="calendar"][data-contract-state="default"] [role="grid"]')).toBeVisible();
  /* A selected hour spans four quarter-hour controls. */
  await expect(page.locator('[data-contract-component="calendar"][data-contract-state="selected-slot"] .ui-time-slot.is-selected')).toHaveCount(4);
  await expect(page.locator('[data-contract-component="calendar"][data-contract-state="with-time-picker"] [data-ui-time-picker]')).toBeVisible();
  await expect(page.locator('[data-contract-component="calendar"][data-contract-state="teacher-availability"] [data-calendar-variant="teacher-availability"]')).toBeVisible();
  await expect(page.locator('[data-contract-component="calendar"][data-contract-state="teacher-availability"] .ui-calendar__teacher-date')).toHaveCount(7);
  await expect(page.locator('[data-contract-component="calendar"][data-contract-state="teacher-availability"] .ui-calendar__teacher-cell.is-available').first()).toHaveCSS("background-color", "rgb(152, 212, 95)");
  await expect(page.locator('[data-contract-component="calendar"][data-contract-state="compact-availability"] [data-calendar-variant="compact-availability"]')).toBeVisible();
  await expect(page.locator('[data-contract-component="calendar"][data-contract-state="compact-availability"] .ui-calendar__compact-cell.is-available')).toHaveCount(35);
  await expect(page.locator('[data-contract-component="calendar"][data-contract-state="lesson-record"] [data-calendar-variant="lesson-record"]')).toBeVisible();
  await expect(page.locator('[data-contract-component="calendar"][data-contract-state="lesson-record"] .ui-calendar__record-cell.is-mixed')).toHaveCount(2);
  await expect(page.locator('[data-contract-component="footer"][data-contract-state="with-utilities"] .ui-footer__utilities .ui-select')).toBeVisible();
  await expect(page.locator('[data-contract-component="footer"][data-contract-state="with-social-links"] .ui-footer__social-link')).toBeVisible();
  await expect(page.locator('[data-contract-component="popover"][data-contract-state="open"] [role="dialog"]')).toBeVisible();
  await expect(page.locator("section:has(#selections)")).toHaveScreenshot("selection-states.png", { animations: "disabled" });
});

/* This icon has now been three things: a ::before mask, an <img> tinted by a
   hand-tuned filter chain, and a masked span painted with currentColor. The
   point of the last move is that the colour comes from a token rather than from
   a filter imitating one — so the test asks for exactly that, and would fail
   again if anyone reintroduced a baked-in tint. */
test("lesson package offers paint the category icon with the offer's own colour", async ({ page }) => {
  await page.goto(fixture);
  const tokenColour = (token) => page.evaluate((name) => {
    const probe = document.createElement("span");
    probe.style.color = `var(${name})`;
    document.body.append(probe);
    const value = getComputedStyle(probe).color;
    probe.remove();
    return value;
  }, token);
  for (const state of ["package-card-default", "package-card-selected"]) {
    const offer = page.locator(`[data-contract-component="selection"][data-contract-state="${state}"] .ui-selection__package-offer`);
    const icon = offer.locator(".ui-selection__package-offer-icon");
    await expect(icon).toHaveCSS("mask-image", /category-sm\.svg/);
    await expect(icon).toHaveCSS("mask-repeat", "no-repeat");
    /* currentColor, so the paint is whatever the offer text is — info for a
       discount, secondary for "No discount". Compared against the offer's own
       resolved colour rather than a literal. */
    const [paint, text] = await Promise.all([
      icon.evaluate((element) => getComputedStyle(element).backgroundColor),
      offer.evaluate((element) => getComputedStyle(element).color),
    ]);
    expect(paint).toBe(text);
    expect([await tokenColour("--ui-color-info"), await tokenColour("--ui-color-secondary")]).toContain(paint);
    /* An <img> reports naturalWidth when its path is wrong; a mask just paints
       nothing. So the path is fetched — this is the only thing standing between
       a renamed icon and a silently empty square. */
    const maskUrl = await icon.evaluate((element) => getComputedStyle(element).maskImage.match(/url\("?([^")]+)"?\)/)?.[1]);
    expect(maskUrl, "the icon must carry a mask url").toBeTruthy();
    expect((await page.request.get(new URL(maskUrl, page.url()).href)).ok(), `${maskUrl} must resolve`).toBe(true);
  }
});
