import { expect, test } from "@playwright/test";

const catalog = "http://127.0.0.1:4173/COMPONENT_CATALOG.html";

test("Catalog consumes the shared UI-kit implementation", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto(`${catalog}#button-variants`);
  await expect(page.locator("h1")).toHaveText("Button variants");
  await expect(page.locator(".button-detail .ui-button").first()).toBeVisible();
  const redStateButtons = page.locator(".button-state-group").filter({ hasText: "Red CTA" }).getByRole("button", { name: "Book trial" });
  const emphasisStateButtons = page.locator(".button-state-group").filter({ hasText: "Emphasis" }).getByRole("button", { name: "Continue" });
  const plusStateButtons = page.locator(".button-state-group").filter({ hasText: "Plus button" }).getByRole("button", { name: "Invite friends" });
  await expect(redStateButtons).toHaveCount(2);
  await expect(emphasisStateButtons).toHaveCount(4);
  await expect(plusStateButtons).toHaveCount(2);
  for (const availableButton of [redStateButtons.nth(0), redStateButtons.nth(1), emphasisStateButtons.nth(0), emphasisStateButtons.nth(1), emphasisStateButtons.nth(2), plusStateButtons.nth(0)]) {
    await expect(availableButton).toHaveCSS("color", "rgb(255, 255, 255)");
  }
  await expect(emphasisStateButtons.nth(2)).toHaveCSS("background-color", "rgb(49, 49, 64)");
  await expect(emphasisStateButtons.nth(2)).toHaveCSS("outline-style", "none");
  const whiteButton = page.getByRole("button", { name: "View details" }).first();
  await whiteButton.hover();
  const whiteButtonHoverColor = await whiteButton.evaluate((button) => getComputedStyle(button).backgroundColor);
  expect(whiteButtonHoverColor).not.toBe("rgb(255, 255, 255)");
  expect(whiteButtonHoverColor).not.toBe("rgb(245, 246, 249)");
  await expect(plusStateButtons.nth(0)).toHaveCSS("background-position", "0% 50%");
  await plusStateButtons.nth(0).hover();
  await expect(plusStateButtons.nth(0)).toHaveCSS("background-position", "100% 50%");
  await page.getByRole("button", { name: "32px" }).click();
  await expect(page.locator(".button-detail .ui-button--32").first()).toBeVisible();

  await page.goto(`${catalog}#color`);
  const colorUsageTrigger = page.getByRole("button", { name: "When To Use" });
  await expect(colorUsageTrigger).toHaveClass(/ui-button--32/);
  await colorUsageTrigger.click();
  const colorUsageDialog = page.locator("#color-usage-modal").getByRole("dialog");
  await expect(colorUsageDialog).toBeVisible();
  await expect(colorUsageDialog).toContainText("Brand color");
  await expect(colorUsageDialog).toContainText("Functional color");
  await expect(colorUsageDialog).toContainText("Gradient/Pro");
  await expect(colorUsageDialog.locator(".color-usage-figure")).toHaveCount(3);
  await expect(colorUsageDialog.locator(".color-usage-row")).toHaveCount(14);
  await expect(colorUsageDialog.locator(".color-usage-paint.is-outlined")).toHaveCount(4);
  await expect(colorUsageDialog.locator(".color-usage > p")).toHaveCSS("font-weight", "400");
  await expect(colorUsageDialog.locator(".color-usage-copy p").first()).toHaveCSS("font-weight", "400");
  expect(await colorUsageDialog.evaluate((dialog) => dialog.scrollWidth <= dialog.clientWidth)).toBe(true);
  expect(await page.evaluate(() => window.scrollX)).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const sidebarBox = await page.locator(".sidebar-navigation").boundingBox();
  expect(sidebarBox).not.toBeNull();
  expect(sidebarBox.x).toBeGreaterThanOrEqual(0);
  expect(sidebarBox.x + sidebarBox.width).toBeGreaterThan(0);
  for (const section of await colorUsageDialog.locator(".color-usage-section").all()) {
    const copy = section.locator(".color-usage-copy");
    const figure = section.locator(".color-usage-figure");
    const [copyBox, figureBox] = await Promise.all([copy.boundingBox(), figure.boundingBox()]);
    expect(copyBox).not.toBeNull();
    expect(figureBox).not.toBeNull();
    expect(copyBox.x + copyBox.width).toBeLessThanOrEqual(figureBox.x + 0.5);
    expect(await copy.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    expect(await figure.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  }
  await colorUsageDialog.getByRole("button", { name: "Close dialog" }).click();
  await expect(colorUsageDialog).toBeHidden();

  await page.goto(`${catalog}#badge`);
  await expect(page.locator(".ds-badge-stage .badge-demo-anchor").first()).toHaveCSS("background-color", "rgb(255, 241, 241)");

  await page.goto(`${catalog}#components`);
  for (const [route, surfaceSelector] of [["popconfirm", ".ui-popconfirm__surface"], ["popup", ".ui-popup__surface"]]) {
    const card = page.locator(`[data-component-route="${route}"]`);
    const surface = card.locator(surfaceSelector);
    await expect(surface).toBeVisible();
    const [cardBox, surfaceBox] = await Promise.all([card.boundingBox(), surface.boundingBox()]);
    expect(cardBox).not.toBeNull();
    expect(surfaceBox).not.toBeNull();
    expect(surfaceBox.x).toBeGreaterThanOrEqual(cardBox.x - 0.5);
    expect(surfaceBox.y).toBeGreaterThanOrEqual(cardBox.y - 0.5);
    expect(surfaceBox.x + surfaceBox.width).toBeLessThanOrEqual(cardBox.x + cardBox.width + 0.5);
    expect(surfaceBox.y + surfaceBox.height).toBeLessThanOrEqual(cardBox.y + cardBox.height + 0.5);
  }
  const modalCard = page.locator('[data-component-route="modal"]');
  const modalStage = modalCard.locator('.ui-modal-stage');
  const modalPreview = modalCard.getByRole('dialog');
  await expect(modalPreview).toBeVisible();
  const [modalStageBox, modalPreviewBox] = await Promise.all([modalStage.boundingBox(), modalPreview.boundingBox()]);
  expect(modalStageBox).not.toBeNull();
  expect(modalPreviewBox).not.toBeNull();
  // Rendering uses sub-pixel grid math; retain the 80% intent without failing on a <1px rounding difference.
  expect(modalPreviewBox.width + 1).toBeGreaterThan(modalStageBox.width * 0.8);

  await page.goto(`${catalog}#slider`);
  await expect(page.locator(".ui-slider")).toHaveCount(5);
  await expect(page.locator(".ui-slider-vertical")).toHaveCount(1);
  const rangeLower = page.locator('[data-demo="ui-slider-range"][data-range-handle="lower"]');
  await rangeLower.fill("32");
  const rangeValue = page.locator("[data-range-value]");
  await expect(rangeValue).toHaveText("32–70");
  await expect(rangeValue).toHaveCSS("white-space", "nowrap");
  await expect(rangeValue).toHaveCSS("width", "44px");
  const rangeRail = page.locator("[data-slider-range]");
  const rangeMarks = page.locator(".ui-slider__marks-row.is-range .ui-slider__marks");
  const [rangeRailBox, rangeMarksBox, rangeValueBox] = await Promise.all([rangeRail.boundingBox(), rangeMarks.boundingBox(), rangeValue.boundingBox()]);
  expect(rangeRailBox).not.toBeNull();
  expect(rangeMarksBox).not.toBeNull();
  expect(rangeValueBox).not.toBeNull();
  expect(rangeValueBox.height).toBeLessThanOrEqual(20);
  expect(rangeMarksBox.x).toBeCloseTo(rangeRailBox.x, 1);
  expect(rangeMarksBox.width).toBeCloseTo(rangeRailBox.width, 1);
  expect(rangeMarksBox.x + rangeMarksBox.width).toBeLessThanOrEqual(rangeValueBox.x + 0.5);
  await page.mouse.move(rangeRailBox.x + (rangeRailBox.width * 0.32), rangeRailBox.y + (rangeRailBox.height / 2));
  await page.mouse.down();
  await page.mouse.move(rangeRailBox.x + (rangeRailBox.width * 0.36), rangeRailBox.y + (rangeRailBox.height / 2), { steps: 4 });
  await page.mouse.up();
  await expect(rangeLower).toHaveValue("36");
  await expect(rangeValue).toHaveText("36–70");

  await page.goto(`${catalog}#panel`);
  await expect(page.locator(".ui-panel").first()).toHaveCSS("border-radius", "12px");

  await page.goto(`${catalog}#footer`);
  const footer = page.locator("#footer-demo");
  await expect(footer.locator(".ui-footer__column")).toHaveCount(4);
  await expect(footer.locator(".ui-footer__group")).toHaveCount(7);
  await expect(footer.locator(".ui-footer__utilities .ui-select")).toHaveCount(2);
  await expect(footer.locator(".ui-footer__copyright")).toHaveText("© 2026 italki HK Limited.");
  await expect(footer.locator(".ui-footer__legal-link")).toHaveCount(7);

  await page.goto(`${catalog}#teacher-card`);
  const recommendationCards = page.locator('.teacher-recommendation-card');
  await expect(recommendationCards).toHaveCount(3);
  const recommendationCardLayout = await recommendationCards.evaluateAll((cards) => cards.map((card) => {
    const footer = card.querySelector('.teacher-recommendation-footer');
    const cardBox = card.getBoundingClientRect();
    const footerBox = footer.getBoundingClientRect();
    return Math.round(cardBox.bottom - footerBox.bottom);
  }));
  // The 1px card border sits outside the shared 16px content padding.
  expect(recommendationCardLayout).toEqual([17, 17, 17]);

  await page.goto(`${catalog}#upload`);
  const uploadShowcases = page.locator('.upload-showcase-grid');
  await expect(uploadShowcases).toHaveCount(2);
  const uploadShowcaseColumns = await uploadShowcases.evaluateAll((grids) => grids.map((grid) => getComputedStyle(grid).gridTemplateColumns.trim().split(/\s+/).length));
  expect(uploadShowcaseColumns).toEqual([2, 3]);

  await page.goto(`${catalog}#time-slot`);
  const availabilityDays = page.locator('.time-slot-availability-day');
  await expect(availabilityDays).toHaveCount(6);
  const availabilityDayLayout = await availabilityDays.evaluateAll((days) => days.map((day) => {
    const box = day.getBoundingClientRect();
    return { top: Math.round(box.top), height: Math.round(box.height) };
  }));
  expect(availabilityDayLayout.map(({ height }) => height)).toEqual([80, 80, 80, 80, 80, 80]);
  expect(new Set(availabilityDayLayout.slice(0, 3).map(({ top }) => top)).size).toBe(1);
  expect(new Set(availabilityDayLayout.slice(3).map(({ top }) => top)).size).toBe(1);
  const pickerOptions = page.locator('.catalog-time-slot-grid .ui-time-slot');
  await expect(pickerOptions).toHaveCount(8);
  expect(await pickerOptions.evaluateAll((slots) => slots.every((slot) => Math.round(slot.getBoundingClientRect().height) === 40))).toBe(true);

  await page.goto(`${catalog}#chip`);
  const chip = page.locator('[data-demo="ds-chip"]').first();
  await expect(chip).toHaveAttribute("aria-pressed", "false");
  await chip.click();
  await expect(chip).toHaveAttribute("aria-pressed", "true");

  await page.goto(`${catalog}#segmented-control`);
  const segmentedBlocks = page.locator(".segmented-detail > .component-doc-block");
  await expect(segmentedBlocks).toHaveCount(3);
  const segmentedBoxes = await Promise.all([0, 1, 2].map((index) => segmentedBlocks.nth(index).boundingBox()));
  expect(segmentedBoxes.every(Boolean)).toBe(true);
  expect(segmentedBoxes[0].y).toBeCloseTo(segmentedBoxes[1].y, 1);
  expect(segmentedBoxes[1].y).toBeCloseTo(segmentedBoxes[2].y, 1);
  expect(segmentedBoxes[0].x).toBeLessThan(segmentedBoxes[1].x);
  expect(segmentedBoxes[1].x).toBeLessThan(segmentedBoxes[2].x);

  await page.goto(`${catalog}#tag`);
  const tags = page.locator('.tag-detail [data-component="tag"]');
  await expect(tags.first()).toHaveClass(/ui-tag--24/);
  await page.locator('#tag-size [data-demo="ui-segmented-control"][data-segment-value="40"]').click();
  await expect(tags.first()).toHaveClass(/ui-tag--40/);
  await expect(page.locator('.tag-detail .ui-tag--24')).toHaveCount(0);
  const tagRemove = page.locator('.tag-detail .ui-tag__remove').first();
  const tagRemoveIcon = tagRemove.locator('.ui-tag__remove-icon');
  await expect(tagRemoveIcon).toHaveCSS('opacity', '0.75');
  await tagRemove.hover();
  await expect(tagRemoveIcon).toHaveCSS('opacity', '1');

  await page.goto(`${catalog}#tabs`);
  const reviewsTab = page.locator('[data-tab="tabs-basic-reviews"]');
  await reviewsTab.hover();
  await expect(reviewsTab).toHaveCSS('border-radius', '8px');
  await expect(reviewsTab).toHaveCSS('background-color', 'rgb(245, 246, 249)');
  await reviewsTab.click();
  await expect(reviewsTab).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#tabs-basic-reviews-panel')).toHaveClass(/is-entering/);

  const tabsGrid = page.locator('.tabs-detail');
  const overflowTabs = page.locator('[data-component="tabs"][aria-label="Teacher profile views"]');
  const [tabsGridBox, overflowTabsBox] = await Promise.all([
    tabsGrid.boundingBox(),
    overflowTabs.boundingBox(),
  ]);
  expect(overflowTabsBox.width).toBeLessThan(tabsGridBox.width * 0.6);

  const overflowList = overflowTabs.locator('.ui-tabs__list');
  const overflowWidths = await overflowList.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));
  expect(overflowWidths.scrollWidth).toBeGreaterThan(overflowWidths.clientWidth);

  await page.goto(`${catalog}#checkbox`);
  const checkbox = page.locator('[data-demo="checkbox"]');
  await expect(checkbox).toHaveAttribute("aria-checked", "false");
  await checkbox.click();
  await expect(checkbox).toHaveAttribute("aria-checked", "true");

  const topicGroup = page.locator("#lesson-topics");
  await expect(topicGroup.locator("legend")).toHaveCSS("margin-bottom", "12px");
  const grammar = topicGroup.getByRole("checkbox", { name: "Grammar" });
  await expect(grammar).toHaveAttribute("aria-checked", "false");
  await grammar.click();
  await expect(grammar).toHaveAttribute("aria-checked", "true");
  await expect(topicGroup.locator("[data-ui-checkbox-group-count]")).toHaveText("3 selected");
  await topicGroup.getByRole("checkbox", { name: "Select all" }).click();
  await expect(topicGroup.locator("[data-ui-checkbox-group-count]")).toHaveText("0 selected");

  await page.goto(`${catalog}#radio`);
  const lessonFormat = page.locator('[aria-label="Lesson format"]');
  const onlineLesson = lessonFormat.getByRole("radio", { name: "Online lesson" });
  const inPersonLesson = lessonFormat.getByRole("radio", { name: "In-person lesson" });
  await expect(onlineLesson).toHaveAttribute("aria-checked", "true");
  await inPersonLesson.click();
  await expect(inPersonLesson).toHaveAttribute("aria-checked", "true");
  await expect(onlineLesson).toHaveAttribute("aria-checked", "false");
  await inPersonLesson.press("ArrowLeft");
  await expect(onlineLesson).toHaveAttribute("aria-checked", "true");

  await page.goto(`${catalog}#selection`);
  const selectionDetail = page.locator('.selection-detail');
  const selectionSizeControl = page.locator('.selection-global-controls');
  await selectionSizeControl.locator('#selection-size [data-demo="ui-segmented-control"][data-segment-value="md"]').click();
  await expect(selectionDetail.locator('.ui-selection--md').first()).toBeVisible();
  await selectionSizeControl.locator('#selection-presentation [data-demo="ui-segmented-control"][data-segment-value="icon-card"]').click();
  await expect(selectionDetail.locator('.ui-selection--icon-card').first()).toBeVisible();
  await selectionSizeControl.locator('#selection-presentation [data-demo="ui-segmented-control"][data-segment-value="radio"]').click();
  const lessonPackage = page.locator('[data-ui-selection-group][aria-label="Lesson package"]');
  const singleLesson = lessonPackage.getByRole("radio", { name: "Single lesson" });
  await singleLesson.click();
  await expect(singleLesson).toHaveAttribute("aria-checked", "true");
  await expect(singleLesson).toHaveClass(/is-selected/);
  await singleLesson.press("ArrowRight");
  await expect(lessonPackage.getByRole("radio", { name: "Lesson package" })).toHaveAttribute("aria-checked", "true");
  const lessonPreferences = page.locator('[data-ui-selection-group][aria-label="Lesson preferences"]');
  const writtenFeedback = lessonPreferences.getByRole("checkbox", { name: "Written feedback" });
  await writtenFeedback.click();
  await expect(writtenFeedback).toHaveAttribute("aria-checked", "false");
  const [lessonPackageBox, lessonPreferencesBox] = await Promise.all([lessonPackage.boundingBox(), lessonPreferences.boundingBox()]);
  expect(lessonPackageBox).not.toBeNull();
  expect(lessonPreferencesBox).not.toBeNull();
  expect(lessonPackageBox.width).toBeCloseTo(lessonPreferencesBox.width, 1);
  await expect(lessonPackage).toHaveCSS('row-gap', '16px');
  await expect(lessonPreferences).toHaveCSS('row-gap', '16px');

  await page.goto(`${catalog}#select`);
  const selectSuffixes = page.locator('.select-detail .ui-select__suffix');
  await expect(selectSuffixes.first()).toHaveAttribute('src', 'Assets/Icons/arrow-down-sm.svg');
  await expect(selectSuffixes.first()).toHaveCSS('width', '24px');
  await expect(selectSuffixes.first()).toHaveCSS('height', '24px');
  expect(await selectSuffixes.evaluateAll((icons) => icons.every((icon) => getComputedStyle(icon).width === '24px' && getComputedStyle(icon).height === '24px'))).toBe(true);
  const multipleClear = page.locator('.ui-select:has([aria-controls="select-multiple-menu"]) .ui-select__clear');
  const multipleClearIcon = multipleClear.locator('.ui-select__clear-icon');
  await expect(multipleClearIcon).toHaveCSS('opacity', '0.7');
  await multipleClear.hover();
  await expect(multipleClearIcon).toHaveCSS('opacity', '1');
  const queryMenu = page.locator('#combobox-query-menu');
  const queryState = queryMenu.locator('xpath=../..');
  await expect(queryMenu).toBeVisible();
  const [queryStateBox, queryMenuBox] = await Promise.all([queryState.boundingBox(), queryMenu.boundingBox()]);
  expect(queryStateBox).not.toBeNull();
  expect(queryMenuBox).not.toBeNull();
  expect(queryMenuBox.y + queryMenuBox.height).toBeLessThanOrEqual(queryStateBox.y + queryStateBox.height + 1);

  await page.goto(`${catalog}#filter`);
  const filterDialog = page.locator('#teacher-filter-modal').getByRole('dialog');
  await expect(filterDialog).toBeVisible();
  await expect(filterDialog).toContainText('Teacher from');
  await expect(filterDialog).toHaveCSS('width', '904px');
  const lessonCategoryParent = filterDialog.getByRole('checkbox', { name: 'Language Essentials' });
  const lessonCategoryChildren = filterDialog.locator('[data-filter-category-children]');
  await expect(lessonCategoryChildren).toBeVisible();
  await lessonCategoryParent.click();
  await expect(lessonCategoryParent).toHaveAttribute('aria-checked', 'false');
  await expect(lessonCategoryChildren).toBeHidden();
  await lessonCategoryParent.click();
  await expect(lessonCategoryParent).toHaveAttribute('aria-checked', 'true');
  await expect(lessonCategoryChildren).toBeVisible();
  const categoryAll = lessonCategoryChildren.getByRole('button', { name: 'All' });
  await categoryAll.click();
  await expect(categoryAll).toHaveAttribute('aria-pressed', 'false');
  await expect(filterDialog.locator('.filter-pattern__teacher-option')).toHaveCount(2);
  await expect(filterDialog.getByRole('button', { name: 'Show teachers' })).toBeVisible();
  await filterDialog.getByRole('button', { name: 'Close dialog' }).click();
  await expect(filterDialog).toBeHidden();
  await page.getByRole('button', { name: 'Open filters' }).click();
  await expect(filterDialog).toBeVisible();

  await page.goto(`${catalog}#date-picker`);
  const datePicker = page.locator("#date-picker-demo");
  const dateTrigger = datePicker.locator('[data-demo="ui-date-toggle"]');
  await expect(dateTrigger).toHaveAttribute("aria-expanded", "true");
  await datePicker.getByRole("button", { name: "Next month" }).click();
  await expect(datePicker.locator("[data-ui-date-month]")).toHaveText("August 2026");
  await datePicker.getByRole("button", { name: "Previous month" }).click();
  await expect(datePicker.locator("[data-ui-date-month]")).toHaveText("July 2026");
  await datePicker.locator('[data-demo="ui-date-day"][data-date-value="2026-07-16"]').click();
  await expect(dateTrigger).toHaveAttribute("aria-expanded", "false");
  await expect(dateTrigger).toContainText("16");
  const disabledDatePicker = page.locator("#date-picker-disabled");
  await expect(disabledDatePicker.locator(".ui-date-picker__trigger")).toBeDisabled();

  await page.goto(`${catalog}#calendar`);
  const weeklyCalendar = page.locator("#weekly-availability-calendar");
  const availabilitySlot = weeklyCalendar.locator('[data-time-slot-state="available"]').first();
  await availabilitySlot.hover();
  await expect(availabilitySlot).toHaveCSS("filter", "brightness(0.92)");
  await expect(availabilitySlot.locator("+ .ui-tooltip")).toHaveText("Book from 02:00 AM – 02:15 AM");
  await page.waitForTimeout(400);
  const availabilityTooltipIsOnTop = await availabilitySlot.locator("+ .ui-tooltip").evaluate((tooltip) => {
    const rect = tooltip.getBoundingClientRect();
    const element = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    return element === tooltip || tooltip.contains(element);
  });
  expect(availabilityTooltipIsOnTop).toBe(true);
  const bookedByOthersSlot = weeklyCalendar.locator('[data-time-slot-state="booked-by-others"]').first();
  await bookedByOthersSlot.hover();
  await expect(bookedByOthersSlot.locator("+ .ui-tooltip")).toHaveText("Booked by others\n00:30 AM – 00:45 AM");
  const bookedByYouSlot = weeklyCalendar.locator('[data-time-slot-state="booked-by-you"]').first();
  await bookedByYouSlot.hover();
  await expect(bookedByYouSlot.locator("+ .ui-tooltip")).toHaveText("You've booked with Maya Chen\n03:30 AM – 03:45 AM");
  const firstAvailabilityCell = weeklyCalendar.locator(".ui-calendar__slot").first();
  const todayIcon = weeklyCalendar.locator('[data-calendar-action="today"] .ui-button__icon');
  await expect(todayIcon).toHaveAttribute("src", "Assets/Icons/16px/today-sm.svg");
  await expect(todayIcon).toHaveCSS("width", "16px");
  await expect(todayIcon).toHaveCSS("height", "16px");
  await expect(firstAvailabilityCell).toHaveCSS("grid-template-rows", "10px 10px 10px 10px");
  await expect(firstAvailabilityCell).toHaveCSS("height", "40px");
  await expect(firstAvailabilityCell.locator(".ui-calendar__slot-segment")).toHaveCount(2);
  await expect(firstAvailabilityCell.locator(".ui-calendar__slot-segment").first()).toHaveCSS("grid-row-end", "span 2");
  await expect(firstAvailabilityCell.locator(".ui-calendar__slot-segment").first().locator(".ui-time-slot")).toHaveCount(2);
  const columnOffsets = await weeklyCalendar.evaluate((calendar) => {
    const origin = calendar.querySelector(".ui-calendar__grid").getBoundingClientRect().left;
    const dates = [...calendar.querySelectorAll(".ui-calendar__date")].map((cell) => cell.getBoundingClientRect().left - origin);
    const slots = [...calendar.querySelector(".ui-calendar__row:not(.ui-calendar__row--header)").querySelectorAll(".ui-calendar__slot")].map((cell) => cell.getBoundingClientRect().left - origin);
    return dates.map((date, index) => Math.abs(date - slots[index]));
  });
  expect(columnOffsets.every((offset) => offset < 0.01)).toBe(true);
  await expect(weeklyCalendar.locator('[data-time-slot-state="unavailable"]').first()).toBeDisabled();
  await expect(weeklyCalendar.getByRole("button", { name: "Wed 30, 00:00 AM – 00:15 AM, unavailable" })).toBeDisabled();
  await expect(weeklyCalendar.locator('[data-time-slot-state="selected"]')).toHaveCount(0);
  const middayStart = weeklyCalendar.locator('[aria-label="Wed 30, 12:15 PM – 12:30 PM, available"]');
  await middayStart.click();
  const selectedHour = [
    "Wed 30, 12:15 PM – 12:30 PM, available",
    "Wed 30, 12:30 PM – 12:45 PM, available",
    "Wed 30, 12:45 PM – 01:00 PM, available",
    "Wed 30, 01:00 PM – 01:15 PM, available"
  ];
  for (const label of selectedHour) await expect(weeklyCalendar.locator(`[aria-label="${label}"]`)).toHaveAttribute("aria-pressed", "true");
  await expect(weeklyCalendar.locator('[data-time-slot-state="selected"]')).toHaveCount(4);
  await expect(weeklyCalendar.locator(".ui-calendar__time")).toHaveCount(24);
  const calendarViewport = weeklyCalendar.locator(".ui-calendar__scroll");
  await expect(calendarViewport).toHaveCSS("max-height", "480px");
  await expect(calendarViewport).toHaveCSS("overflow-y", "auto");
  const canScrollCalendar = await calendarViewport.evaluate((viewport) => viewport.scrollHeight > viewport.clientHeight);
  expect(canScrollCalendar).toBe(true);
  const eveningSlot = weeklyCalendar.locator('[aria-label="Tus 29, 07:00 PM – 07:15 PM, available"]');
  await eveningSlot.click();
  await expect(eveningSlot).toHaveAttribute("aria-pressed", "true");
  const lessonRecord = page.locator("#lesson-record-calendar");
  await expect(lessonRecord).toHaveAttribute("data-calendar-variant", "lesson-record");
  await expect(lessonRecord.locator(".ui-calendar__record-month")).toHaveCount(12);
  await expect(lessonRecord.locator(".ui-calendar__record-cell.is-mixed").first()).toBeVisible();
  await expect(lessonRecord.locator(".ui-calendar__record-stat")).toHaveCount(2);
  const compactCalendar = page.locator("#compact-availability-calendar");
  await expect(compactCalendar).toHaveAttribute("data-calendar-variant", "compact-availability");
  await expect(compactCalendar.locator(".ui-calendar__compact-date")).toHaveCount(7);
  await expect(compactCalendar.locator(".ui-calendar__compact-cell")).toHaveCount(42);
  await expect(compactCalendar.locator(".ui-calendar__compact-cell.is-available").first()).toHaveCSS("background-color", "rgb(152, 212, 95)");
  await expect(compactCalendar.locator(".ui-calendar__compact-timezone")).toHaveText("Based on your timezone: Asia/Shanghai (UTC +08:00)");
  const teacherAvailabilityModal = page.locator("#teacher-availability-modal");
  const teacherAvailabilityCalendar = page.locator("#teacher-availability-calendar");
  await expect(teacherAvailabilityModal).toHaveCSS("min-height", "720px");
  await expect(teacherAvailabilityCalendar).toHaveAttribute("data-calendar-variant", "teacher-availability");
  await expect(teacherAvailabilityCalendar.locator(".ui-calendar__teacher-scroll")).toHaveCSS("max-height", "432px");
  await expect(teacherAvailabilityCalendar.locator(".ui-calendar__teacher-scroll")).toHaveCSS("overflow-y", "auto");
  await expect(teacherAvailabilityCalendar.locator(".ui-calendar__teacher-date")).toHaveCount(7);
  await expect(teacherAvailabilityCalendar.locator(".ui-calendar__teacher-date.is-current")).toHaveCSS("background-color", "rgb(231, 252, 245)");
  await teacherAvailabilityModal.getByRole("button", { name: "Check availability" }).click();
  await expect(teacherAvailabilityModal.getByRole("dialog")).toBeVisible();
  await expect(teacherAvailabilityModal.getByRole("button", { name: "Book now" })).toHaveClass(/ui-button--red/);
  await expect(teacherAvailabilityModal.locator(".ui-modal__header")).toHaveClass(/is-title-centered/);

  await page.goto(`${catalog}#teacher-card`);
  const teacherCards = page.locator(".teacher-pattern-card");
  await expect(teacherCards).toHaveCount(2);
  await expect(teacherCards.first().locator(".teacher-pattern-role")).toHaveText("Community Tutor");
  await expect(teacherCards.nth(1).locator(".teacher-pattern-role")).toHaveText("Professional Teacher");
  await expect(teacherCards.nth(1).locator(".ui-tag--info").filter({ hasText: "Business" })).toBeVisible();
  await expect(teacherCards.nth(1).locator(".ui-tag--warning").filter({ hasText: "Test Preparation" })).toBeVisible();
  await expect(teacherCards.first().locator(".teacher-pattern-summary")).toHaveCSS("-webkit-line-clamp", "2");
  await expect(teacherCards.first().locator(".teacher-pattern-availability")).toHaveCSS("color", "rgb(0, 179, 189)");
  const teacherMore = page.locator("#teacher-card-more-community");
  await teacherMore.getByRole("button", { name: "More actions for Elliot" }).click();
  await expect(teacherMore.getByRole("menu")).toBeVisible();
  await expect(teacherMore.getByRole("menuitem", { name: "View profile" })).toBeVisible();
  await expect(teacherMore.locator('.ui-button__icon')).toHaveCSS('transform', 'matrix(0, 1, -1, 0, 0, 0)');

  await page.goto(`${catalog}#lesson-card`);
  await expect(page.locator(".lesson-card-pattern-detail")).toHaveCSS("width", "1068px");
  await expect(page.locator(".lesson-card-pattern-detail .component-doc-content").first()).toHaveCSS("padding", "24px");
  const lessonCards = page.locator(".lesson-card-pattern .ui-card");
  await expect(lessonCards).toHaveCount(8);
  await expect(lessonCards.first()).toHaveCSS("width", "652px");
  await expect(lessonCards.first()).toHaveCSS("height", "120px");
  await expect(lessonCards.first().locator('[data-component="avatar"]')).toHaveCount(1);
  await expect(lessonCards.first().locator(".ui-avatar__image")).toHaveAttribute("src", "Assets/Images/avatars/teacher-rachel.png");
  await expect(lessonCards.first().locator(".ui-card__content")).toHaveCSS("padding", "0px");
  await expect(lessonCards.filter({ hasText: "English Group Class" })).toHaveCSS("border-top-width", "1px");
  await expect(lessonCards.first().locator(".lesson-card-pattern__status")).toHaveCSS("height", "40px");
  await expect(lessonCards.first().locator(".lesson-card-pattern__status")).toHaveCSS("background-color", "rgb(230, 247, 248)");
  await expect(lessonCards.first().locator(".lesson-card-pattern__status-icon")).toHaveAttribute("src", "Assets/Icons/16px/lesson-upcoming-sm.svg");
  await expect(lessonCards.first().locator(".lesson-card-pattern__body")).toHaveCSS("margin-top", "15px");
  await expect(lessonCards.filter({ hasText: "Waiting" }).locator(".lesson-card-pattern__status")).toHaveCSS("background-color", "rgb(255, 249, 230)");
  await expect(lessonCards.filter({ hasText: "Waiting" }).locator(".lesson-card-pattern__status-icon")).toHaveAttribute("src", "Assets/Icons/16px/lesson-waiting-sm.svg");
  await expect(lessonCards.filter({ hasText: "Action required" }).locator(".lesson-card-pattern__status")).toHaveCSS("background-color", "rgb(255, 242, 241)");
  await expect(lessonCards.filter({ hasText: "Active package" }).first()).toHaveCSS("height", "128px");
  await expect(lessonCards.filter({ hasText: "Lesson completed!" }).locator(".lesson-card-pattern__status")).toHaveCSS("background-color", "rgb(231, 252, 245)");

  await page.goto(`${catalog}#tooltip`);
  const tooltipTrigger = page.getByRole("button", { name: "Hover me" });
  await tooltipTrigger.hover();
  await expect(page.locator("#tooltip-basic")).toBeVisible();
  await expect(page.locator("#tooltip-no-arrow")).toBeHidden();
  await expect(page.locator("#tooltip-disabled")).toHaveAttribute("role", "tooltip");

  await page.goto(`${catalog}#modal`);
  const modalTrigger = page.locator("#modal-default").getByRole("button", { name: "Open modal" });
  await modalTrigger.click();
  const modalDialog = page.locator("#modal-default").getByRole("dialog");
  await expect(modalDialog).toBeVisible();
  await modalDialog.getByRole("button", { name: "Close dialog" }).click();
  await expect(modalDialog).toBeHidden();

  await page.goto(`${catalog}#popup`);
  const popupRoot = page.locator("#teacher-profile-popup");
  const popupTrigger = popupRoot.getByRole("button", { name: "More details" });
  await popupTrigger.click();
  await expect(popupRoot.getByRole("dialog")).toBeVisible();
  await popupTrigger.hover();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(350);
  await expect(popupRoot.getByRole("dialog")).toBeHidden();
  await popupTrigger.click();
  await popupRoot.getByRole("button", { name: "Message" }).click();
  await expect(popupRoot.getByRole("dialog")).toBeHidden();

  await page.goto(`${catalog}#popconfirm`);
  const popconfirmRoot = page.locator("#cancel-lesson-confirm");
  const popconfirmTrigger = popconfirmRoot.getByRole("button", { name: "Cancel lesson" });
  await popconfirmTrigger.click();
  await expect(popconfirmRoot.getByRole("alertdialog")).toBeVisible();
  await popconfirmRoot.getByRole("button", { name: "Keep lesson" }).click();
  await expect(popconfirmRoot.getByRole("alertdialog")).toBeHidden();

  await page.goto(`${catalog}#divider`);
  await expect(page.locator('.divider-detail [role="separator"][aria-orientation="vertical"]').first()).toBeVisible();
  await expect(page.locator('.divider-detail .ui-divider.is-right').first()).toBeVisible();

  await page.goto(`${catalog}#avatar`);
  await expect(page.locator('.avatar-detail .ui-avatar--with-flag').first()).toBeVisible();
  await expect(page.locator('.avatar-detail .ui-avatar-group[role="group"]').first()).toBeVisible();

  await page.goto(`${catalog}#badge`);
  await expect(page.locator('.ds-component-detail .ui-badge--count').first()).toHaveAttribute("role", "status");
  await expect(page.locator('.ds-component-detail .ui-badge--status')).toHaveCount(3);

  await page.goto(`${catalog}#breadcrumb`);
  const breadcrumb = page.locator('.breadcrumb-detail .ui-breadcrumb').nth(2);
  const overflowTrigger = breadcrumb.getByRole("button", { name: "Show hidden path items" });
  await overflowTrigger.click();
  await expect(breadcrumb.getByRole("menu")).toBeVisible();
  await expect(page.locator('.breadcrumb-detail .ui-breadcrumb__separator').first()).toHaveCSS("width", "16px");

  await page.goto(`${catalog}#card`);
  await expect(page.locator('.card-detail .ui-card.is-static').first()).toHaveCSS("border-radius", "12px");
  await expect(page.locator('.card-detail .ui-card.is-interactive')).toHaveCount(1);

  await page.goto(`${catalog}#alert`);
  await expect(page.locator('.ds-component-detail .ui-alert--success .ui-alert__icon-image')).toHaveAttribute("src", "Assets/Icons/check.svg");
  const closableAlert = page.locator('.ds-component-detail .ui-alert').filter({ hasText: "New message" });
  await closableAlert.getByRole("button", { name: "Dismiss alert" }).click();
  await expect(closableAlert).toHaveCount(0);

  await page.goto(`${catalog}#tabs`);
  const teacherTabs = page.locator('[aria-label="Teacher profile"]');
  const messagesTab = teacherTabs.getByRole("tab", { name: /Messages/ });
  await messagesTab.click();
  await expect(messagesTab).toHaveAttribute("aria-selected", "true");
  await expect(teacherTabs.getByRole("tabpanel")).toContainText("unread count state");
  await messagesTab.press("ArrowLeft");
  await expect(teacherTabs.getByRole("tab", { name: /Lessons/ })).toHaveAttribute("aria-selected", "true");

  await page.goto(`${catalog}#pagination`);
  const pagination = page.locator('[aria-label="Results pages"]');
  await pagination.getByRole("button", { name: "3" }).click();
  await expect(pagination.getByRole("button", { name: "3" })).toHaveAttribute("aria-current", "page");
  await expect(pagination.locator('[aria-current="page"]')).toHaveCSS("border-radius", "9999px");

  await page.goto(`${catalog}#rate`);
  const rate = page.locator("#rate-basic");
  const halfStar = rate.locator(".ui-rate__star").nth(2);
  const [starBaseBox, starFillBox] = await Promise.all([
    halfStar.locator(".ui-rate__star-base").boundingBox(),
    halfStar.locator(".ui-rate__star-image").boundingBox()
  ]);
  expect(starBaseBox).not.toBeNull();
  expect(starFillBox).not.toBeNull();
  expect(starFillBox.width).toBeCloseTo(starBaseBox.width, 1);
  expect(starFillBox.height).toBeCloseTo(starBaseBox.height, 1);
  expect(starFillBox.x).toBeCloseTo(starBaseBox.x, 1);
  expect(starFillBox.y).toBeCloseTo(starBaseBox.y, 1);
  const firstStar = rate.getByRole("radio").first();
  await firstStar.click({ position: { x: 3, y: 14 } });
  await expect(rate.locator("[data-rate-output]")).toHaveText("0.5 / 5");
  await firstStar.press("End");
  await expect(rate.locator("[data-rate-output]")).toHaveText("5 / 5");
  await expect(page.locator("#rate-disabled").getByRole("radio").first()).toBeDisabled();

  await page.goto(`${catalog}#sidebar`);
  const sidebar = page.locator("#workspace-sidebar");
  await expect(sidebar).toHaveClass(/ui-sidebar--normal/);
  const chats = sidebar.getByRole("button", { name: "Chats" });
  await expect(chats).toHaveAttribute("aria-expanded", "false");
  await chats.click();
  await expect(chats).toHaveAttribute("aria-expanded", "true");
  await expect(sidebar).toContainText("Sarah: lesson follow-up");
  await page.waitForTimeout(520);
  expect(await sidebar.locator(".ui-sidebar__scroll").evaluate((scroll) => scroll.scrollTop)).toBeGreaterThanOrEqual(100);
  const primaryRows = sidebar.locator("[data-ui-sidebar-primary-row]");
  await expect(primaryRows.nth(0)).toHaveAttribute("data-sidebar-item", "home");
  await expect(primaryRows.nth(1)).toHaveAttribute("data-sidebar-item", "search-teachers");
  await expect(primaryRows.nth(0).getByRole("button", { name: "Unpin Home" })).toHaveCount(0);
  await expect(primaryRows.nth(1).getByRole("button", { name: "Unpin Search Teachers" })).toHaveCount(0);
  await sidebar.getByRole("button", { name: "Unpin My Lessons" }).click();
  const more = sidebar.getByRole("button", { name: "More" });
  await more.click();
  await expect(sidebar.getByRole("menu")).toBeVisible();
  const myLessonsInMore = sidebar.getByRole("menu").getByRole("menuitem", { name: "My Lessons" });
  await expect(myLessonsInMore).toBeVisible();
  await myLessonsInMore.locator("..").getByRole("button", { name: "Pin My Lessons" }).click();
  await expect(sidebar.getByRole("button", { name: "Unpin My Lessons" })).toBeVisible();
  const pinnedOrder = await page.evaluate(() => {
    const root = document.querySelector("#workspace-sidebar");
    const dragged = root.querySelector('[data-ui-sidebar-primary-row][data-sidebar-item="my-lessons"]');
    const target = root.querySelector('[data-ui-sidebar-primary-row][data-sidebar-item="my-calendar"]');
    const transfer = new DataTransfer();
    dragged.dispatchEvent(new DragEvent("dragstart", { bubbles: true, dataTransfer: transfer }));
    target.dispatchEvent(new DragEvent("dragover", { bubbles: true, cancelable: true, clientY: target.getBoundingClientRect().top, dataTransfer: transfer }));
    dragged.dispatchEvent(new DragEvent("dragend", { bubbles: true, dataTransfer: transfer }));
    return [...root.querySelectorAll("[data-ui-sidebar-primary-row]")].map((row) => row.dataset.sidebarItem);
  });
  expect(pinnedOrder.slice(0, 4)).toEqual(["home", "search-teachers", "my-lessons", "my-calendar"]);
  await page.mouse.move(0, 0);
  await page.waitForTimeout(350);
  await expect(sidebar.getByRole("menu")).toBeHidden();
  await sidebar.getByRole("button", { name: "Hide sidebar" }).click();
  await expect(sidebar).toHaveClass(/is-collapsed/);
  await expect(page.locator('.sidebar-demo-stage')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await sidebar.getByRole("button", { name: "Show sidebar" }).click();
  await expect(sidebar).not.toHaveClass(/is-collapsed/);
  await page.getByRole("button", { name: "Plus" }).click();
  await expect(sidebar).toHaveClass(/ui-sidebar--plus/);

  await page.goto(`${catalog}#dropdown-menu`);
  const lessonActions = page.locator("#lesson-actions");
  const lessonActionsTrigger = lessonActions.getByRole("button", { name: "Lesson actions" });
  const lessonActionsArrow = lessonActionsTrigger.locator('img[src$="arrow-down-sm.svg"]');
  await expect(lessonActionsArrow).toHaveCSS("transform", "none");
  await lessonActionsTrigger.click();
  await expect(lessonActionsArrow).toHaveCSS("transform", /matrix\(-1, 0, 0, -1/);
  await lessonActions.getByRole("menuitem", { name: "Message teacher" }).click();
  await expect(lessonActionsArrow).toHaveCSS("transform", "none");

  await page.goto(`${catalog}#statistic`);
  await expect(page.locator('.ds-component-detail .ui-statistic')).toHaveCount(5);
  await expect(page.locator('.ds-component-detail .ui-statistic__prefix')).toHaveText("$");
  await expect(page.locator('.ds-component-detail .ui-statistic.is-loading .ui-statistic__skeleton')).toBeVisible();

  await page.goto(`${catalog}#table`);
  await expect(page.locator('#teacher-lessons-table table')).toBeVisible();
  await expect(page.locator('#teacher-lessons-table').getByRole('button', { name: 'View' }).first()).toBeVisible();
  await expect(page.locator('#loading-teacher-lessons-table')).toHaveAttribute('aria-busy', 'true');
  await expect(page.locator('#empty-teacher-lessons-table .ui-table__empty')).toHaveText('No upcoming lessons');

  await page.goto(`${catalog}#timeline`);
  const timeline = page.locator('#timeline-reverse');
  await expect(timeline.locator('[data-timeline-item]').first()).toHaveAttribute('data-timeline-item', 'booked');
  await page.getByRole('button', { name: 'Reverse order' }).click();
  await expect(timeline).toHaveAttribute('data-timeline-reversed', 'true');
  await expect(timeline.locator('[data-timeline-item]').first()).toHaveAttribute('data-timeline-item', 'pending');
  await expect(page.locator('#timeline-alternate')).toHaveClass(/ui-timeline--alternate/);

  await page.goto(`${catalog}#top-nav`);
  const topNav = page.locator('#top-nav-teacher');
  const contextTrigger = topNav.getByRole('button', { name: 'Teacher language' });
  await contextTrigger.click();
  await expect(contextTrigger).toHaveAttribute('aria-expanded', 'true');
  await topNav.getByRole('menuitem', { name: 'French Teachers' }).click();
  await expect(contextTrigger).toHaveAttribute('aria-expanded', 'false');
  await expect(topNav.locator('.ui-top-nav-context__label')).toHaveText('French Teachers');
  const navSearch = page.locator('#top-nav-search-teacher');
  const filter = navSearch.getByRole('button', { name: 'Filter' });
  await expect(navSearch).toHaveCSS('width', '400px');
  await filter.click();
  await expect(filter).toHaveAttribute('aria-pressed', 'true');
  await expect(navSearch).toHaveCSS('width', '400px');
  const navSearchInput = navSearch.getByRole('textbox', { name: 'Search teachers' });
  await navSearchInput.fill('French');
  await expect(navSearch).toHaveClass(/has-query/);
  await navSearch.getByRole('button', { name: 'Clear search' }).click();
  await expect(navSearchInput).toHaveValue('');
  await expect(topNav.getByRole('button', { name: 'Book lessons' })).toHaveClass(/ui-button--40/);

  await page.goto(`${catalog}#search`);
  const searchInput = page.locator("#search-default");
  await searchInput.fill("French");
  const clear = page.locator("#search-default").locator("xpath=..") .locator('[data-demo="ui-search-clear"]');
  await expect(clear).toBeVisible();
  await clear.click();
  await expect(searchInput).toHaveValue("");
  await page.locator('#search-size').getByRole('button', { name: '32px' }).click();
  await expect(page.locator(".search-detail .ui-search--32").first()).toBeVisible();

  await page.goto(`${catalog}#select`);
  const basicSelect = page.locator("#select-basic-menu").locator("xpath=..");
  const basicTrigger = basicSelect.locator('[data-demo="ui-select-trigger"]');
  await basicTrigger.click();
  await expect(basicTrigger).toHaveAttribute("aria-expanded", "true");
  await basicSelect.getByRole("option", { name: "French" }).click();
  await expect(basicTrigger).toHaveText("French");
  await expect(basicTrigger).toHaveAttribute("aria-expanded", "false");

  const clearableSelect = page.locator("#select-clearable-menu").locator("xpath=..");
  await clearableSelect.locator('[data-demo="ui-select-clear"]').click();
  await expect(clearableSelect.locator('[data-demo="ui-select-trigger"]')).toHaveText("Select an option");

  const searchableSelect = page.locator("#select-searchable-menu").locator("xpath=..");
  await searchableSelect.locator('[data-demo="ui-select-trigger"]').click();
  await searchableSelect.locator('[data-demo="ui-select-search"]').fill("zzz");
  await expect(searchableSelect.locator("[data-ui-select-empty]")).toBeVisible();
  await page.locator('#select-size').getByRole('button', { name: '32px' }).click();
  await expect(page.locator(".select-detail .ui-select--32").first()).toBeVisible();

  const combobox = page.locator("#combobox-default-menu").locator("xpath=..");
  const comboboxBlock = combobox.locator("xpath=ancestor::section[contains(@class, 'component-doc-block')]");
  const comboboxBlockBefore = await comboboxBlock.boundingBox();
  await combobox.locator('[data-demo="ui-select-trigger"]').click();
  const comboboxMenu = combobox.locator(".ui-select__menu");
  await expect(comboboxMenu).toBeVisible();
  const [comboboxBlockAfter, comboboxMenuBox] = await Promise.all([comboboxBlock.boundingBox(), comboboxMenu.boundingBox()]);
  expect(comboboxBlockBefore).not.toBeNull();
  expect(comboboxBlockAfter).not.toBeNull();
  expect(comboboxMenuBox).not.toBeNull();
  expect(comboboxBlockAfter.height).toBeCloseTo(comboboxBlockBefore.height, 1);
  expect(comboboxMenuBox.y + comboboxMenuBox.height).toBeGreaterThan(comboboxBlockAfter.y + comboboxBlockAfter.height);

  await page.goto(`${catalog}#switch`);
  await expect(page.locator('.switch-detail .switch-state')).toHaveCount(6);
  await expect(page.getByText('Off hover', { exact: true })).toBeVisible();
  await expect(page.getByText('On disabled', { exact: true })).toBeVisible();
  const switchControl = page.locator('[data-demo="ui-switch"]').first();
  await expect(switchControl).toHaveAttribute("aria-checked", "false");
  await switchControl.click();
  await expect(switchControl).toHaveAttribute("aria-checked", "true");

  await page.goto(`${catalog}#avatar`);
  await page.locator("#flag-search").fill("Brazil");
  await expect(page.locator("#flag-library")).toContainText("Brazil");
  await expect(page.locator("#flag-library")).not.toContainText("UK");
  expect(errors).toEqual([]);
});

test("every Catalog route renders without bypassing the shared runtime", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${catalog}#components`);
  const routes = await page.locator('.sidebar-navigation a[href^="#"]').evaluateAll((links) => [...new Set(links.map((link) => link.getAttribute("href")))]);

  for (const route of routes) {
    await page.goto(`${catalog}${route}`);
    await expect(page.locator("h1")).not.toHaveText("");
    const sectionOrders = await page.locator("[data-catalog-order]").evaluateAll((sections) => sections.map((section) => Number(section.dataset.catalogOrder)));
    expect(sectionOrders).toEqual([...sectionOrders].sort((left, right) => left - right));
  }

  expect(errors).toEqual([]);
});
