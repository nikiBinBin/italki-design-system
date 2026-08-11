(function installItalkiUI(global) {
  "use strict";

  const contracts = global.ITalkiUIContracts || {};
  const componentContracts = contracts.components || {};
  const assetRoots = contracts.assetRoots || ["Assets/Icons/", "Assets/Flags/"];

  const escapeHTML = (value) => String(value ?? "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  }[character]));

  const enumValue = (component, name, value, subcomponent = "") => {
    const contract = subcomponent ? componentContracts[component]?.subcomponents?.[subcomponent] : componentContracts[component];
    if (value === undefined || !contract?.props?.[name]) return;
    if (!contract.props[name].includes(value)) {
      throw new Error(`${component}.${name} does not accept ${String(value)}`);
    }
  };

  /* "does not accept prop defaultCollapsed" is true and unhelpful: the prop is
     called `collapsed`, and the reader has no list to check against. Name the
     nearest accepted prop when there is an obvious one. */
  const nearestProp = (name, allowed) => {
    const lower = String(name).toLowerCase();
    const near = (a, b) => {
      if (Math.abs(a.length - b.length) > 2) return 99;
      const row = Array.from({ length: b.length + 1 }, (_, i) => i);
      for (let i = 1; i <= a.length; i += 1) {
        let prev = row[0];
        row[0] = i;
        for (let j = 1; j <= b.length; j += 1) {
          const swap = row[j];
          row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
          prev = swap;
        }
      }
      return row[b.length];
    };
    const hit = allowed.find((candidate) => {
      const other = candidate.toLowerCase();
      return other !== lower && (other.includes(lower) || lower.includes(other));
    }) || allowed.find((candidate) => near(lower, candidate.toLowerCase()) <= 2);
    return hit ? ` — did you mean ${hit}?` : "";
  };

  const assertProps = (component, props, subcomponent = "") => {
    const contract = componentContracts[component];
    const allowed = subcomponent ? (contract?.subcomponents?.[subcomponent]?.acceptedProps || []) : (contract?.acceptedProps || []);
    for (const name of Object.keys(props || {})) {
      if (!allowed.includes(name)) throw new Error(`${component} does not accept prop ${name}${nearestProp(name, allowed)}`);
    }
  };

  /* A page two or three folders down addresses the same approved asset with a
     leading pair of dot-dot steps, and that was rejected: the check required
     the path to start with the root. It bit where nothing was watching — the pin
     controls re-render a row from its stored icon path, so on a card the row
     silently refused to move. Leading ./ and ../ steps are part of addressing,
     not of identity, so they come off before the root is checked. Everything
     else — absolute URLs, other origins, paths outside the roots — is rejected
     exactly as before. */
  /* Where the page sits relative to the asset folder. Markup rendered at build
     time can be rebased by whoever writes the file, but markup the runtime
     creates later — a row rebuilt by the pin controls, a menu row restored from
     the roster — cannot: it is produced long after, by code that has no idea
     the page is three folders down. Both broke as soon as they were touched.
     The host states the depth once and every path the runtime emits follows it. */
  const assetBase = () => String(global.ITalkiUIAssetBase || "");
  const withBase = (path) => (/^([a-z]+:|\/|\.)/i.test(path) ? path : assetBase() + path);

  const approvedAsset = (path) => {
    if (!path) return true;
    const withinSite = String(path).replace(/^(?:\.{1,2}\/)+/, "");
    return assetRoots.some((root) => withinSite.startsWith(root));
  };

  /* An icon may be named rather than pathed. Every consumer that wrote one by
     hand reached for `icon: "dashboard"` — the name in the library — and got
     "Unapproved asset: dashboard", because the prop had always meant a path.
     A name is the safer form of the two: it cannot point outside the library,
     so it is resolved against the manifest and rejected when the manifest does
     not have it. A value containing a slash is still taken as a path. */
  const iconLibrary = () => {
    const manifest = global.ITalkiIconManifest;
    return Array.isArray(manifest) ? manifest : (manifest && manifest.icons) || null;
  };
  const resolveIcon = (value) => {
    if (!value || value.includes("/")) return value;
    const library = iconLibrary();
    /* With the manifest present the name is verified, and 16px/ icons resolve
       to their real folder. Without it — a host that loaded the runtime alone —
       fall back to the library root rather than refusing to render. */
    if (!library) return `Assets/Icons/${value}.svg`;
    const hit = library.find((entry) => String(entry).endsWith("/" + value + ".svg"));
    if (!hit) throw new Error(`Unknown icon: "${value}" is not in the icon library`);
    return hit;
  };

  const icon = (rawPath, className = "ui-icon") => {
    if (!rawPath) return "";
    const path = resolveIcon(rawPath);
    if (!approvedAsset(path)) throw new Error(`Unapproved asset: ${path}`);
    return `<img class="${className}" src="${escapeHTML(withBase(path))}" alt="" />`;
  };

  const resolveControlShape = (size, shape) => shape === "default" ? (size === 32 ? "pill" : "rounded") : shape;

  // Field controls separate interaction from validation. Legacy state="warning" and
  // state="error" remain supported while consumers move to status.
  const resolveFieldPresentation = ({ state = "default", status = "default", disabled = false, readOnly = false }) => ({
    state: disabled ? "disabled" : (readOnly ? "read-only" : state),
    status: ["warning", "error"].includes(state) ? state : status
  });

  function button(props = {}) {
    assertProps("button", props);
    const {
    label = "",
    variant = "emphasis",
    size = 40,
    shape = "default",
    state = "default",
    leadingIcon = "",
    trailingIcon = "",
    iconOnly = false,
    disabled = false,
    loading = false,
    demo = "",
    ariaLabel = "",
    href = "",
    download = "",
    target = "",
    rel = "",
    ariaExpanded,
    ariaPressed,
    ariaDescribedBy = "",
    ariaControls = ""
    } = props;
    enumValue("button", "variant", variant);
    enumValue("button", "size", size);
    enumValue("button", "shape", shape);
    enumValue("button", "state", loading ? "loading" : (disabled ? "disabled" : state));
    const resolvedShape = resolveControlShape(size, shape);
    const isDisabled = disabled || state === "disabled" || loading;
    const classes = ["ui-button", `ui-button--${variant}`, `ui-button--${size}`, `ui-button--${resolvedShape}`, leadingIcon && !loading && !iconOnly ? "has-leading-icon" : "", trailingIcon && !loading && !iconOnly ? "has-trailing-icon" : "", state !== "default" ? `is-${state}` : "", loading ? "is-loading" : "", iconOnly ? "is-icon-only" : ""].filter(Boolean).join(" ");
    const leading = loading ? '<span class="ui-button__spinner" aria-hidden="true"></span>' : icon(leadingIcon, "ui-button__icon");
    const trailing = loading ? "" : icon(trailingIcon, "ui-button__icon");
    const readableLabel = iconOnly ? "" : `<span class="ui-button__label">${escapeHTML(label)}</span>`;
    const accessibleName = ariaLabel || (iconOnly ? label : "");
    const tag = href ? "a" : "button";
    const navigation = href ? ` href="${escapeHTML(href)}"${download ? ` download="${escapeHTML(download)}"` : ""}${target ? ` target="${escapeHTML(target)}"` : ""}${rel ? ` rel="${escapeHTML(rel)}"` : ""}` : ' type="button"';
    return `<${tag} class="${classes}" data-component="button"${demo ? ` data-demo="${escapeHTML(demo)}"` : ""}${accessibleName ? ` aria-label="${escapeHTML(accessibleName)}"` : ""}${ariaDescribedBy ? ` aria-describedby="${escapeHTML(ariaDescribedBy)}"` : ""}${ariaControls ? ` aria-controls="${escapeHTML(ariaControls)}"` : ""}${ariaExpanded === undefined ? "" : ` aria-expanded="${ariaExpanded}"`}${ariaPressed === undefined ? "" : ` aria-pressed="${ariaPressed}"`}${isDisabled ? (href ? ' aria-disabled="true"' : " disabled") : ""}${navigation}>${leading}${readableLabel}${trailing}</${tag}>`;
  }

  function chip(props = {}) {
    assertProps("chip", props);
    const { label = "", size = 32, surface = "default", checked, selected = false, disabled = false, state = "default", demo = "" } = props;
    const isChecked = checked === undefined ? selected : checked;
    enumValue("chip", "size", size);
    enumValue("chip", "surface", surface);
    enumValue("chip", "state", disabled ? "disabled" : (isChecked ? "checked" : state));
    const isHover = !disabled && !isChecked && state === "hover";
    const classes = ["ui-chip", `ui-chip--${size}`, `ui-chip--${surface}`, isChecked ? "is-selected" : "", isHover ? "is-hover" : "", disabled ? "is-disabled" : ""].filter(Boolean).join(" ");
    return `<button class="${classes}" type="button" data-component="chip"${demo ? ` data-demo="${escapeHTML(demo)}"` : ""} aria-pressed="${isChecked}"${disabled ? " disabled" : ""}>${escapeHTML(label)}</button>`;
  }

  function tag(props = {}) {
    assertProps("tag", props);
    const { label = "", value = label, size = 24, tone = "neutral", variant = "default", leadingIcon = "", removable = false, removeDemo = "", removeAriaLabel = "" } = props;
    enumValue("tag", "size", size);
    enumValue("tag", "tone", tone);
    enumValue("tag", "variant", variant);
    if (leadingIcon && !approvedAsset(leadingIcon)) throw new Error(`tag.leadingIcon must be an approved asset: ${leadingIcon}`);
    const leading = icon(leadingIcon, "ui-tag__icon");
    const remove = removable ? `<button class="ui-tag__remove" type="button"${removeDemo ? ` data-demo="${escapeHTML(removeDemo)}"` : ""}${removeAriaLabel ? ` aria-label="${escapeHTML(removeAriaLabel)}"` : ` aria-label="Remove ${escapeHTML(label)}"`}>${icon("Assets/Icons/16px/cross-sm.svg", "ui-tag__remove-icon")}</button>` : "";
    return `<span class="ui-tag ui-tag--${size} ui-tag--${tone} ui-tag--${variant}" data-component="tag" data-value="${escapeHTML(value)}">${leading}<span class="ui-tag__label">${escapeHTML(label)}</span>${remove}</span>`;
  }

  function link(props = {}) {
    assertProps("link", props);
    const {
      label = "", href = "#", size = 14, variant = "default",
      trailingIcon = "none", external = false, disabled = false,
      state = "default", ariaLabel = "", demo = "",
    } = props;
    enumValue("link", "size", size);
    enumValue("link", "variant", variant);
    enumValue("link", "trailingIcon", trailingIcon);
    enumValue("link", "state", state);
    /* An external link opens elsewhere, which the reader is entitled to know
       before clicking — so the arrow is the default marker for one, not an
       independent decoration. Passing an explicit trailingIcon still wins. */
    const marker = trailingIcon !== "none" ? trailingIcon : external ? "external" : "none";
    const glyph = marker === "chevron" ? "Assets/Icons/chevron-right.svg"
      : marker === "external" ? "Assets/Icons/arrow-up-right.svg" : "";
    const tail = glyph ? icon(glyph, "ui-link__icon") : "";
    /* A disabled link is not a link: it cannot be followed, so it must not be
       focusable or expose a destination. */
    const tag = disabled ? "span" : "a";
    const target = !disabled && external ? ' target="_blank" rel="noreferrer noopener"' : "";
    return `<${tag} class="ui-link ui-link--${size} ui-link--${variant}${disabled ? " is-disabled" : ""}${state === "hover" ? " is-hover" : ""}"`
      + ` data-component="link"`
      + (disabled ? ' aria-disabled="true"' : ` href="${escapeHTML(href)}"`)
      + target
      + (ariaLabel ? ` aria-label="${escapeHTML(ariaLabel)}"` : "")
      + (demo ? ` data-demo="${escapeHTML(demo)}"` : "")
      + `><span class="ui-link__label">${escapeHTML(label)}</span>${tail}</${tag}>`;
  }

  function video(props = {}) {
    assertProps("video", props);
    const {
      id = "", poster = "", posterAlt = "", title = "",
      duration = "", playLabel = "", state = "default", demo = "",
    } = props;
    enumValue("video", "state", state);
    if (!poster) throw new Error("video requires a poster: a play affordance over an empty frame tells the reader nothing about what they would be starting");
    approvedAsset(poster) || (() => { throw new Error(`video.poster must be an approved asset: ${poster}`); })();
    const disabled = state === "disabled";
    /* The component is the cover and the way in. What the click does — open a
       dialog, navigate, swap in a player — belongs to the page, so it arrives
       through the same data-demo hook every other interactive renderer uses. */
    const label = playLabel || (title ? `Play ${title}` : "Play video");
    return `<div class="ui-video${state === "hover" ? " is-hover" : ""}${disabled ? " is-disabled" : ""}" data-component="video"${id ? ` id="${escapeHTML(id)}"` : ""}>`
      + `<img class="ui-video__poster" src="${escapeHTML(poster)}" alt="${escapeHTML(posterAlt)}" />`
      + `<button class="ui-video__play" type="button" aria-label="${escapeHTML(label)}"${disabled ? " disabled" : ""}${demo ? ` data-demo="${escapeHTML(demo)}"` : ""}>`
      + `<span class="ui-video__play-disc" aria-hidden="true"></span></button>`
      + (duration ? `<span class="ui-video__duration">${escapeHTML(duration)}</span>` : "")
      + (title ? `<p class="ui-video__title">${escapeHTML(title)}</p>` : "")
      + `</div>`;
  }

  function checkbox(props = {}) {
    assertProps("checkbox", props);
    const { id = "", label = "Checkbox", checked = "off", state = "default", disabled = false, toggleMode = "binary", demo = "" } = props;
    enumValue("checkbox", "checked", checked);
    enumValue("checkbox", "state", disabled ? "disabled" : state);
    enumValue("checkbox", "toggleMode", toggleMode);
    const isDisabled = disabled || state === "disabled";
    const ariaChecked = checked === "mixed" ? "mixed" : String(checked === "on");
    const classes = ["ui-checkbox", `value-${checked}`, state === "hover" ? "is-hover" : "", isDisabled ? "is-disabled" : ""].filter(Boolean).join(" ");
    return `<button class="${classes}" type="button" role="checkbox" aria-checked="${ariaChecked}" data-component="checkbox" data-value="${checked}" data-checkbox-toggle="${toggleMode}"${id ? ` data-checkbox-id="${escapeHTML(id)}"` : ""}${demo ? ` data-demo="${escapeHTML(demo)}"` : ""}${isDisabled ? " disabled" : ""}><span class="ui-checkbox__box" aria-hidden="true">${icon("Assets/Icons/confirm-sm.svg", "ui-checkbox__check")}<i class="ui-checkbox__mixed"></i></span><span>${escapeHTML(label)}</span></button>`;
  }

  function checkboxGroup(props = {}) {
    assertProps("checkbox-group", props);
    const { id = "", label = "Checkbox group", description = "", options = [], selected = [], layout = "vertical", selectAll = false, feedback = "", feedbackTone = "default" } = props;
    enumValue("checkbox-group", "layout", layout);
    enumValue("checkbox-group", "feedbackTone", feedbackTone);
    const values = new Set((Array.isArray(selected) ? selected : [selected]).map(String));
    const normalized = options.map((option) => typeof option === "string" ? { id: option, label: option } : { ...option, id: option?.id || option?.value || option?.label || "" });
    const active = normalized.filter((option) => !option.disabled);
    const selectedCount = active.filter((option) => values.has(String(option.id))).length;
    const selectAllValue = selectedCount === 0 ? "off" : (selectedCount === active.length ? "on" : "mixed");
    const descriptionId = description && id ? `${id}-description` : "";
    const feedbackId = feedback && id ? `${id}-feedback` : "";
    const all = selectAll ? `<div class="ui-checkbox-group__select-all">${checkbox({ label: "Select all", checked: selectAllValue, demo: "ui-checkbox-group-all" })}</div>` : "";
    const items = normalized.map((option) => checkbox({ id: option.id, label: option.label, checked: values.has(String(option.id)) ? "on" : "off", disabled: Boolean(option.disabled), demo: "ui-checkbox-group-item" })).join("");
    const descriptionMarkup = description ? `<p class="ui-checkbox-group__description"${descriptionId ? ` id="${escapeHTML(descriptionId)}"` : ""}>${escapeHTML(description)}</p>` : "";
    const feedbackMarkup = feedback ? `<p class="ui-checkbox-group__feedback${feedbackTone === "error" ? " is-error" : ""}"${feedbackId ? ` id="${escapeHTML(feedbackId)}"` : ""} data-ui-checkbox-group-feedback>${escapeHTML(feedback)}</p>` : `<p class="ui-checkbox-group__feedback" data-ui-checkbox-group-count>${selectedCount} selected</p>`;
    const describedBy = [descriptionId, feedbackId].filter(Boolean).join(" ");
    return `<fieldset class="ui-checkbox-group ui-checkbox-group--${layout}" data-component="checkbox-group" data-ui-checkbox-group${id ? ` id="${escapeHTML(id)}"` : ""}${describedBy ? ` aria-describedby="${escapeHTML(describedBy)}"` : ""}><legend>${escapeHTML(label)}</legend>${descriptionMarkup}${all}<div class="ui-checkbox-group__options">${items}</div>${feedbackMarkup}</fieldset>`;
  }

  function radio(props = {}) {
    assertProps("radio", props);
    const { label = "Radio", value = label, checked = false, disabled = false, state = "default", description = "", demo = "", tabIndex = checked ? 0 : -1 } = props;
    enumValue("radio", "state", disabled ? "disabled" : state);
    const isDisabled = disabled || state === "disabled";
    const classes = ["ui-radio", checked ? "is-checked" : "", state === "hover" ? "is-hover" : "", isDisabled ? "is-disabled" : ""].filter(Boolean).join(" ");
    return `<button class="${classes}" type="button" role="radio" aria-checked="${checked}" data-component="radio" data-radio-value="${escapeHTML(value)}"${demo ? ` data-demo="${escapeHTML(demo)}"` : ""} tabindex="${Number(tabIndex)}"${isDisabled ? " disabled" : ""}><span class="ui-radio__indicator" aria-hidden="true"></span><span class="ui-radio__copy"><span>${escapeHTML(label)}</span>${description ? `<small>${escapeHTML(description)}</small>` : ""}</span></button>`;
  }

  function radioGroup(props = {}) {
    assertProps("radio", props, "group");
    const { label = "Radio group", options = [], selected = "", layout = "inline", block = false } = props;
    if (!["inline", "vertical"].includes(layout)) throw new Error(`radio.group.layout does not accept ${String(layout)}`);
    const normalized = options.map((option) => typeof option === "string" ? { label: option, value: option } : { ...option, value: option?.value || option?.label || "" });
    const requested = Array.isArray(selected) ? selected[0] : selected;
    const preselected = normalized.find((option) => option.checked && !option.disabled)?.value;
    const selectedValue = String(requested || preselected || "");
    const focusIndex = normalized.findIndex((option) => String(option.value) === selectedValue && !option.disabled);
    const fallbackFocusIndex = focusIndex >= 0 ? focusIndex : normalized.findIndex((option) => !option.disabled);
    const content = normalized.map((option, index) => {
      const checked = String(option.value) === selectedValue;
      return radio({
        label: option.label,
        value: option.value,
        checked,
        disabled: Boolean(option.disabled),
        state: option.state || "default",
        description: option.description || "",
        demo: "ui-radio",
        tabIndex: index === fallbackFocusIndex ? 0 : -1
      });
    }).join("");
    return `<div class="ui-radio-group ui-radio-group--${block ? "block" : layout}" data-component="radio-group" data-ui-radio-group role="radiogroup" aria-label="${escapeHTML(label)}">${content}</div>`;
  }

  function selection(props = {}) {
    assertProps("selection", props);
    const { label = "Selection", value = label, subtext = "", description = "", leading = "", badge = "", price = "", period = "", discount = "", quantity = "", quantityLabel = "Lessons", originalPrice = "", totalPrice = "", selected = false, selectedMarker = false, disabled = false, contentType = "icon-simple", selectionMode = "checkbox", state = "default", tabIndex = selectionMode === "checkbox" ? 0 : (selected ? 0 : -1), demo = "" } = props;
    enumValue("selection", "contentType", contentType);
    enumValue("selection", "selectionMode", selectionMode);
    enumValue("selection", "state", state);
    const isDisabled = disabled || state === "disabled";
    const isControlLeading = contentType === "standard";
    // Selection shares the Radio / Checkbox visual primitives while retaining one
    // interactive card shell, so it never nests an interactive control.
    const indicator = selectionMode === "radio"
      ? '<span class="ui-radio__indicator ui-selection__indicator ui-selection__indicator--radio" aria-hidden="true"></span>'
      : `<span class="ui-checkbox__box ui-selection__indicator ui-selection__indicator--checkbox" aria-hidden="true">${icon("Assets/Icons/confirm-sm.svg", "ui-checkbox__check")}</span>`;
    const feature = leading ? `<span class="ui-selection__feature ui-selection__feature--${contentType}">${leading}</span>` : "";
    const title = `<span class="ui-selection__title">${escapeHTML(label)}</span>${subtext ? `<span class="ui-selection__subtext">${escapeHTML(subtext)}</span>` : ""}`;
    const copy = `<span class="ui-selection__copy"><span class="ui-selection__title-row">${title}</span>${description ? `<span class="ui-selection__description">${escapeHTML(description)}</span>` : ""}</span>`;
    const packageOffer = discount ? `<span class="ui-selection__package-offer${discount === "No discount" ? " is-neutral" : ""}"><span class="ui-selection__package-offer-icon" aria-hidden="true"></span><span>${escapeHTML(discount)}</span></span>` : "";
    const packageQuantity = quantity ? `<span class="ui-selection__package-quantity"><strong>${escapeHTML(quantity)}</strong><span>${escapeHTML(quantityLabel)}</span></span>` : "";
    const packageTotal = originalPrice || totalPrice ? `<span class="ui-selection__package-total">${originalPrice ? `<s>${escapeHTML(originalPrice)}</s>` : ""}${totalPrice ? `<strong>${escapeHTML(totalPrice)}</strong>` : ""}</span>` : "";
    const packageBody = `<span class="ui-selection__package-copy">${packageOffer}${price ? `<span class="ui-selection__package-price">${escapeHTML(price)}${period ? `<small>${escapeHTML(period)}</small>` : ""}</span>` : ""}${description ? `<span class="ui-selection__package-description">${escapeHTML(description)}</span>` : ""}</span>${packageQuantity || packageTotal ? `<span class="ui-selection__package-footer">${packageQuantity}${packageTotal}</span>` : ""}`;
    const lessonSummary = `<span class="ui-selection__lesson-summary-copy"><span class="ui-selection__lesson-summary-title">${escapeHTML(label)}</span>${description ? `<span class="ui-selection__lesson-summary-meta">${escapeHTML(description)}</span>` : ""}</span>${price ? `<span class="ui-selection__lesson-summary-price">${escapeHTML(price)}</span>` : ""}`;
    const cardFeature = contentType === "icon-card" ? leading : feature;
    const body = contentType === "lesson-options"
      ? lessonSummary
      : contentType === "package-card"
      ? packageBody
      : contentType === "icon-card"
      ? `<span class="ui-selection__card-header">${cardFeature}<span class="ui-selection__card-title">${escapeHTML(label)}</span>${indicator}</span><span class="ui-selection__card-body"><span class="ui-selection__card-copy">${price ? `<span class="ui-selection__price">${escapeHTML(price)}${period ? `<small>${escapeHTML(period)}</small>` : ""}</span>` : ""}${description ? `<span class="ui-selection__description">${escapeHTML(description)}</span>` : ""}</span>${badge ? `<span class="ui-selection__badge">${badge}</span>` : ""}</span>`
      : `<span class="ui-selection__body">${isControlLeading ? indicator : ""}${feature}${copy}${isControlLeading ? "" : indicator}</span>`;
    const usesSelectedMarker = selectedMarker || contentType === "package-card";
    const classes = ["ui-selection", `ui-selection--${contentType}`, `ui-selection--${selectionMode}`, selected ? "is-selected" : "", usesSelectedMarker ? "uses-selected-marker" : "", selected && usesSelectedMarker ? "has-selected-marker" : "", isDisabled ? "is-disabled" : "", state === "hover" ? "is-hover" : "", state === "focus" ? "is-focused" : ""].filter(Boolean).join(" ");
    return `<button class="${classes}" type="button" data-component="selection" data-demo="${escapeHTML(demo || "ui-selection-card")}" data-selection-mode="${selectionMode}" data-selection-value="${escapeHTML(value)}" role="${selectionMode}" aria-checked="${selected}" aria-label="${escapeHTML(label)}" tabindex="${tabIndex}"${isDisabled ? " disabled" : ""}>${body}</button>`;
  }

  function selectionGroup(props = {}) {
    assertProps("selection", props, "group");
    const { label = "Selection", options = [], selected = "", contentType = "icon-simple", selectionMode = "radio", selectedMarker = false, layout = "stack", courseTitle = "", courseMeta = "", courses = [], selectedDuration = "" } = props;
    enumValue("selection", "contentType", contentType);
    enumValue("selection", "selectionMode", selectionMode);
    enumValue("selection", "layout", layout, "group");
    const normalized = options.map((option) => typeof option === "string" ? { label: option, value: option } : { ...option, value: option?.value || option?.label || "" });
    const selectedValues = new Set((Array.isArray(selected) ? selected : [selected]).filter(Boolean).map(String));
    if (contentType === "lesson-options" && courses.length) {
      if (selectionMode !== "radio") throw new Error("selection.lesson-options requires radio selectionMode");
      const courseCards = courses.map((course, courseIndex) => {
        const courseValue = String(course?.value || course?.label || course?.title || courseIndex);
        const courseSelected = selectedValues.has(courseValue);
        const courseOptions = Array.isArray(course?.options) ? course.options : (Array.isArray(course?.durations) ? course.durations : []);
        const durationValue = String(course?.selectedDuration || (courseSelected ? selectedDuration : ""));
        const durationRows = courseOptions.map((option, optionIndex) => {
          const optionValue = String(option?.value || option?.label || optionIndex);
          const optionSelected = durationValue === optionValue;
          const disabled = Boolean(option?.disabled);
          return `<button class="ui-selection__lesson-option${optionSelected ? " is-selected" : ""}${disabled ? " is-disabled" : ""}" type="button" data-component="selection" data-demo="ui-selection-card" data-selection-mode="radio" data-selection-value="${escapeHTML(optionValue)}" role="radio" aria-checked="${optionSelected}" aria-label="${escapeHTML(`${option?.label || optionValue}${option?.price ? `, ${option.price}` : ""}`)}" tabindex="${optionSelected || (!durationValue && optionIndex === 0) ? 0 : -1}"${disabled ? " disabled" : ""}><span class="ui-selection__lesson-option-label">${escapeHTML(option?.label || optionValue)}</span>${option?.price ? `<span class="ui-selection__lesson-option-price">${escapeHTML(option.price)}</span>` : ""}<span class="ui-selection__lesson-option-indicator" aria-hidden="true"></span></button>`;
        }).join("");
        const summary = `<button class="ui-selection__lesson-toggle${courseSelected ? " is-selected" : ""}" type="button" data-demo="ui-lesson-toggle" data-lesson-course="${escapeHTML(courseValue)}" aria-expanded="${courseSelected}" aria-checked="${courseSelected}" role="radio"><span class="ui-selection__lesson-summary-copy"><span class="ui-selection__lesson-summary-title">${escapeHTML(course?.title || course?.label || courseValue)}</span>${course?.meta ? `<span class="ui-selection__lesson-summary-meta">${escapeHTML(course.meta)}</span>` : ""}</span>${course?.price ? `<span class="ui-selection__lesson-summary-price">${escapeHTML(course.price)}</span>` : ""}</button>`;
        const durationMarkup = `<div class="ui-selection__lesson-options${courseSelected ? "" : " is-collapsed"}" data-ui-selection-group role="radiogroup" aria-label="${escapeHTML(`${course?.title || courseValue} duration`)}" aria-hidden="${!courseSelected}"${courseSelected ? "" : " inert"}><div class="ui-selection__lesson-options-inner">${durationRows}</div></div>`;
        return `<section class="ui-selection__lesson-card${courseSelected ? " is-expanded" : ""}" data-lesson-course-card="${escapeHTML(courseValue)}">${summary}${durationMarkup}</section>`;
      }).join("");
      return `<div class="ui-selection-group ui-selection-group--lesson-options-list" data-component="selection-group" data-ui-lesson-options data-selection-mode="radio" role="group" aria-label="${escapeHTML(label)}">${courseCards}</div>`;
    }
    if (contentType === "lesson-options") {
      if (selectionMode !== "radio") throw new Error("selection.lesson-options requires radio selectionMode");
      if (!courseTitle) throw new Error("selection.lesson-options requires courseTitle");
      const optionsMarkup = normalized.map((option, index) => {
        const optionSelected = selectedValues.has(String(option.value));
        const disabled = Boolean(option.disabled);
        return `<button class="ui-selection__lesson-option${optionSelected ? " is-selected" : ""}${disabled ? " is-disabled" : ""}" type="button" data-component="selection" data-demo="ui-selection-card" data-selection-mode="radio" data-selection-value="${escapeHTML(option.value)}" role="radio" aria-checked="${optionSelected}" aria-label="${escapeHTML(`${option.label}${option.price ? `, ${option.price}` : ""}`)}" tabindex="${optionSelected || (!selectedValues.size && index === 0) ? 0 : -1}"${disabled ? " disabled" : ""}><span class="ui-selection__lesson-option-label">${escapeHTML(option.label)}</span>${option.price ? `<span class="ui-selection__lesson-option-price">${escapeHTML(option.price)}</span>` : ""}<span class="ui-selection__lesson-option-indicator" aria-hidden="true"></span></button>`;
      }).join("");
      return `<section class="ui-selection-group ui-selection-group--lesson-options${selectedValues.size ? " is-selected" : ""}" data-component="selection-group" data-ui-selection-group data-selection-mode="radio" role="radiogroup" aria-label="${escapeHTML(label)}"><header class="ui-selection__lesson-header"><span class="ui-selection__lesson-title">${escapeHTML(courseTitle)}</span>${courseMeta ? `<span class="ui-selection__lesson-meta">${escapeHTML(courseMeta)}</span>` : ""}</header><div class="ui-selection__lesson-options">${optionsMarkup}</div></section>`;
    }
    const content = normalized.map((option, index) => {
      const optionSelected = selectedValues.has(String(option.value));
      const optionMode = option.selectionMode || selectionMode;
      return selection({ label: option.label, value: option.value, subtext: option.subtext || "", description: option.description || "", leading: option.leading || "", badge: option.badge || "", price: option.price || "", period: option.period || "", discount: option.discount || "", quantity: option.quantity || "", quantityLabel: option.quantityLabel || "Lessons", originalPrice: option.originalPrice || "", totalPrice: option.totalPrice || "", selected: optionSelected, selectedMarker: option.selectedMarker ?? selectedMarker, disabled: Boolean(option.disabled), contentType: option.contentType || contentType, selectionMode: optionMode, tabIndex: optionMode === "radio" ? (optionSelected || (!selectedValues.size && index === 0) ? 0 : -1) : 0 });
    }).join("");
    const groupRole = selectionMode === "radio" ? "radiogroup" : "group";
    return `<div class="ui-selection-group ui-selection-group--${selectionMode} ui-selection-group--${layout}" data-component="selection-group" data-ui-selection-group data-selection-mode="${selectionMode}" role="${groupRole}" aria-label="${escapeHTML(label)}">${content}</div>`;
  }

  const defaultDateWeekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const dateDay = (day, index) => {
    if (day === null || day === undefined || day === "") return null;
    if (typeof day === "object") return { label: String(day.label ?? day.value ?? ""), value: String(day.value ?? day.label ?? index), disabled: Boolean(day.disabled), muted: Boolean(day.muted) };
    return { label: String(day), value: String(day), disabled: false, muted: false };
  };
  const normalizeDateDays = (days) => (Array.isArray(days) ? days : []).map(dateDay);
  const selectedDateValues = (selected, range) => {
    const values = Array.isArray(range) && range.length ? range : (selected === "" || selected === undefined || selected === null ? [] : [selected]);
    return values.filter((value) => value !== "" && value !== undefined && value !== null).map(String).slice(0, 2);
  };
  const datePickerLabel = (days, values, fallback) => {
    if (!values.length) return fallback;
    const labels = values.map((value) => days.find((day) => day?.value === value)?.label || value);
    return labels.join(" - ");
  };
  const datePickerGrid = (days, values) => {
    const indexes = values.map((value) => days.findIndex((day) => day?.value === value)).filter((index) => index >= 0);
    const start = indexes.length === 2 ? Math.min(...indexes) : -1;
    const end = indexes.length === 2 ? Math.max(...indexes) : -1;
    return days.map((day, index) => {
      if (!day) return '<span class="ui-date-picker__blank" aria-hidden="true"></span>';
      const selected = values.includes(day.value);
      const inRange = start >= 0 && index > start && index < end;
      const rangeStart = start >= 0 && index === start;
      const rangeEnd = end >= 0 && index === end;
      const classes = ["ui-date-picker__day", selected ? "is-selected" : "", inRange ? "is-in-range" : "", rangeStart ? "is-range-start" : "", rangeEnd ? "is-range-end" : "", day.muted ? "is-muted" : ""].filter(Boolean).join(" ");
      return `<button class="${classes}" type="button" data-demo="ui-date-day" data-date-value="${escapeHTML(day.value)}"${day.disabled ? " disabled" : ""}>${escapeHTML(day.label)}</button>`;
    }).join("");
  };

  function datePicker(props = {}) {
    assertProps("date-picker", props);
    const { id = "", label = "Choose a date", value = "", placeholder = "Choose a date", size = 40, shape = "default", status = "default", open = false, disabled = false, state = "default", monthLabel = "", weekdays = defaultDateWeekdays, days = [], months = [], monthIndex = 0, selected = "", range = null, demo = "" } = props;
    enumValue("date-picker", "size", size);
    enumValue("date-picker", "shape", shape);
    enumValue("date-picker", "status", status);
    enumValue("date-picker", "state", disabled ? "disabled" : state);
    const presentation = resolveFieldPresentation({ state, status, disabled });
    const providedMonths = Array.isArray(months) && months.length ? months : [{ label: monthLabel || "Calendar", days }];
    const index = Math.min(Math.max(Number(monthIndex) || 0, 0), providedMonths.length - 1);
    const activeMonth = providedMonths[index] || { label: monthLabel || "Calendar", days };
    const normalizedDays = normalizeDateDays(activeMonth.days ?? days);
    const isRange = Array.isArray(range);
    const values = selectedDateValues(selected, range);
    const triggerValue = value || datePickerLabel(normalizedDays, values, placeholder);
    const rootId = id || `date-picker-${String(label).toLowerCase().replace(/[^a-z0-9]+/g, "-") || "field"}`;
    const isDisabled = disabled || presentation.state === "disabled";
    const isOpen = Boolean(open) && !isDisabled;
    const classes = ["ui-date-picker", `ui-date-picker--${size}`, `ui-date-picker--${resolveControlShape(size, shape)}`, isOpen ? "is-open" : "", isDisabled ? "is-disabled" : "", presentation.state === "hover" ? "is-hover" : "", presentation.state === "focus" ? "is-focus" : "", presentation.status !== "default" ? `is-${presentation.status}` : ""].filter(Boolean).join(" ");
    const calendar = icon("Assets/Icons/16px/today-sm.svg", "ui-date-picker__calendar-icon");
    const suffix = icon(isOpen ? "Assets/Icons/arrow-up-sm.svg" : "Assets/Icons/arrow-down-sm.svg", "ui-date-picker__suffix-icon");
    const previousDisabled = index === 0;
    const nextDisabled = index === providedMonths.length - 1;
    const popup = `<div class="ui-date-picker__popup" id="${escapeHTML(rootId)}-popup" role="dialog" aria-label="${escapeHTML(label)} calendar"><div class="ui-date-picker__header"><button type="button" data-demo="ui-date-previous" aria-label="Previous month"${previousDisabled ? " disabled" : ""}>${icon("Assets/Icons/arrow-left.svg", "ui-date-picker__month-icon")}</button><strong data-ui-date-month>${escapeHTML(activeMonth.label || monthLabel || "Calendar")}</strong><button type="button" data-demo="ui-date-next" aria-label="Next month"${nextDisabled ? " disabled" : ""}>${icon("Assets/Icons/arrow-right.svg", "ui-date-picker__month-icon")}</button></div><div class="ui-date-picker__weekdays">${(Array.isArray(weekdays) ? weekdays : defaultDateWeekdays).map((day) => `<span>${escapeHTML(day)}</span>`).join("")}</div><div class="ui-date-picker__grid" data-ui-date-grid>${datePickerGrid(normalizedDays, values)}</div></div>`;
    const isPlaceholder = !value && values.length === 0;
    return `<div class="${classes}" id="${escapeHTML(rootId)}" data-component="date-picker" data-ui-date-picker data-date-values="${escapeHTML(JSON.stringify(values))}" data-date-months="${escapeHTML(JSON.stringify(providedMonths))}" data-date-month-index="${index}" data-date-range="${isRange ? "true" : "false"}"><button class="ui-date-picker__trigger" type="button" data-demo="${escapeHTML(demo || "ui-date-toggle")}" aria-label="${escapeHTML(label)}" aria-haspopup="dialog" aria-expanded="${isOpen}" aria-controls="${escapeHTML(rootId)}-popup"${isDisabled ? " disabled" : ""}>${calendar}<span class="${isPlaceholder ? "ui-date-picker__placeholder" : ""}" data-ui-date-label>${escapeHTML(triggerValue)}</span>${suffix}</button>${popup}</div>`;
  }

  function tooltip(props = {}) {
    assertProps("tooltip", props);
    const { id = "", content = "", trigger = "", triggerLabel = "Hover me", placement = "top", arrow = true, open = false, disabled = false, demo = "" } = props;
    enumValue("tooltip", "placement", placement);
    const tooltipId = id || `tooltip-${String(triggerLabel).toLowerCase().replace(/[^a-z0-9]+/g, "-") || "hint"}`;
    const triggerMarkup = trigger || button({ label: triggerLabel, variant: "secondary", size: 32, shape: "pill", disabled, demo, ariaDescribedBy: tooltipId });
    const classes = ["ui-tooltip-wrap", open ? "is-open" : "", disabled ? "is-disabled" : ""].filter(Boolean).join(" ");
    return `<span class="${classes}" data-component="tooltip" data-ui-tooltip>${triggerMarkup}<span class="ui-tooltip${arrow ? "" : " no-arrow"}" id="${escapeHTML(tooltipId)}" data-placement="${placement}" role="tooltip">${escapeHTML(content)}</span></span>`;
  }

  function divider(props = {}) {
    assertProps("divider", props);
    const { type = "horizontal", label = "", orientation = "center", orientationMargin = "", dashed = false, plain = false, tone = "divider", icon: iconPath = "", ariaLabel = "" } = props;
    enumValue("divider", "type", type);
    enumValue("divider", "orientation", orientation);
    enumValue("divider", "dashed", dashed);
    enumValue("divider", "plain", plain);
    enumValue("divider", "tone", tone);

    const normalizeMargin = (value) => {
      if (value === "" || value === undefined || value === null) return "";
      if (typeof value === "number" && Number.isFinite(value) && value >= 0) return `${value}px`;
      const normalized = String(value).trim();
      if (!/^(?:0|[1-9]\d*)(?:px|%)?$/.test(normalized)) throw new Error("divider.orientationMargin must be a non-negative number, px, or percentage value");
      return normalized === "0" ? "0px" : normalized;
    };

    const resolvedMargin = type === "horizontal" && label && orientation !== "center" ? normalizeMargin(orientationMargin) : "";
    const classes = [
      "ui-divider",
      `ui-divider--${type}`,
      `ui-divider--${tone}`,
      label && type === "horizontal" ? "has-label" : "",
      label && type === "horizontal" ? `is-${orientation}` : "",
      dashed ? "is-dashed" : "",
      plain ? "is-plain" : ""
    ].filter(Boolean).join(" ");
    const margin = resolvedMargin ? ` style="--ui-divider-edge:${escapeHTML(resolvedMargin)}"` : "";

    if (type === "vertical") {
      return `<span class="${classes}" data-component="divider" role="separator" aria-orientation="vertical"${ariaLabel ? ` aria-label="${escapeHTML(ariaLabel)}"` : ""}></span>`;
    }

    const iconMarkup = label && iconPath ? icon(iconPath, "ui-divider__icon") : "";
    const labelMarkup = label ? `<span class="ui-divider__label">${iconMarkup}${escapeHTML(label)}</span>` : "";
    return `<div class="${classes}" data-component="divider" role="separator" aria-orientation="horizontal"${ariaLabel ? ` aria-label="${escapeHTML(ariaLabel)}"` : ""}${margin}>${labelMarkup}</div>`;
  }

  function sectionIntro(props = {}) {
    assertProps("section-intro", props);
    const { id = "", eyebrow = "", title = "", description = "", action = "", size = "default", alignment = "start", headingLevel = 2, ariaLabel = "" } = props;
    enumValue("section-intro", "size", size);
    enumValue("section-intro", "alignment", alignment);
    enumValue("section-intro", "headingLevel", headingLevel);
    if (!title && !ariaLabel) throw new Error("section-intro requires a title or ariaLabel");
    const headingTag = `h${headingLevel}`;
    const headingId = id ? `${id}-title` : "";
    const classes = ["ui-section-intro", `ui-section-intro--${size}`, `ui-section-intro--${alignment}`, action ? "has-action" : ""].filter(Boolean).join(" ");
    const eyebrowMarkup = eyebrow ? `<p class="ui-section-intro__eyebrow">${escapeHTML(eyebrow)}</p>` : "";
    const titleMarkup = title ? `<${headingTag} class="ui-section-intro__title"${headingId ? ` id="${escapeHTML(headingId)}"` : ""}>${escapeHTML(title)}</${headingTag}>` : "";
    const descriptionMarkup = description ? `<p class="ui-section-intro__description">${escapeHTML(description)}</p>` : "";
    const copy = `<div class="ui-section-intro__copy">${eyebrowMarkup}${titleMarkup}${descriptionMarkup}</div>`;
    return `<header class="${classes}" data-component="section-intro"${id ? ` id="${escapeHTML(id)}"` : ""}${ariaLabel ? ` aria-label="${escapeHTML(ariaLabel)}"` : ""}${headingId ? ` aria-labelledby="${escapeHTML(headingId)}"` : ""}>${copy}${action ? `<div class="ui-section-intro__action">${action}</div>` : ""}</header>`;
  }

  function flag(props = {}) {
    assertProps("avatar", props, "flag");
    const { countryCode = "", countryLabel = "", size = 24, decorative = false, ariaLabel = "" } = props;
    const code = String(countryCode).trim().toLowerCase();
    if (!/^[a-z]{2}$/.test(code)) throw new Error("avatar.flag countryCode must be an ISO 3166-1 alpha-2 code");
    if (![16, 24].includes(size)) throw new Error(`avatar.flag does not accept size ${String(size)}`);
    const label = ariaLabel || countryLabel || code.toUpperCase();
    return `<img class="ui-flag ui-flag--${size}" data-component="avatar" data-ui-avatar-part="flag" src="${escapeHTML(withBase(`Assets/Flags/${code}.svg`))}" alt="${decorative ? "" : escapeHTML(label)}"${decorative ? ' aria-hidden="true"' : ""} />`;
  }

  function avatar(props = {}) {
    assertProps("avatar", props);
    const { name = "", image = "", initials = "", size = 56, flag: countryCode = "", flagLabel = "", variant = countryCode ? "with-flag" : (image ? "without-flag" : "empty"), tone = "info", interactive = false, state = "default", ariaLabel = "" } = props;
    enumValue("avatar", "size", size);
    enumValue("avatar", "variant", variant);
    enumValue("avatar", "tone", tone);
    enumValue("avatar", "interactive", interactive);
    enumValue("avatar", "state", state);
    if (variant === "with-flag" && !countryCode) throw new Error("avatar.with-flag requires a flag country code");
    if (variant === "empty" && image) throw new Error("avatar.empty does not accept an image");
    if (variant === "logo" && (image || initials || countryCode)) throw new Error("avatar.logo does not accept image, initials, or flag content");
    if (!image && !initials && variant !== "logo") throw new Error("avatar without an image requires initials");
    const accessibleName = ariaLabel || name || initials || "italki";
    const content = variant === "logo"
      ? `<img class="ui-avatar__logo" src="${withBase("Assets/Icons/logo-italki-logomark-white.svg")}" alt="" />`
      : image
      ? `<img class="ui-avatar__image" src="${escapeHTML(image)}" alt="" />`
      : `<span class="ui-avatar__initials" aria-hidden="true">${escapeHTML(initials)}</span>`;
    const flagMarkup = variant === "with-flag"
      ? `<span class="ui-avatar__flag">${flag({ countryCode, countryLabel: flagLabel, size: size <= 56 ? 16 : 24, decorative: true })}</span>`
      : "";
    const classes = ["ui-avatar", `ui-avatar--${size}`, `ui-avatar--${variant}`, `ui-avatar--tone-${tone}`, interactive ? "is-interactive" : "", state === "hover" ? "is-hover" : ""].filter(Boolean).join(" ");
    return `<span class="${classes}" data-component="avatar" role="img" aria-label="${escapeHTML(accessibleName)}"><span class="ui-avatar__body">${content}</span>${flagMarkup}</span>`;
  }

  function avatarGroup(props = {}) {
    assertProps("avatar", props, "group");
    const { members = [], overflow = 0, addLabel = "", size = "md", ariaLabel = "Avatar group" } = props;
    const sizeMap = {
      xs: { avatar: 24, overlap: 4 },
      sm: { avatar: 32, overlap: 8 },
      md: { avatar: 40, overlap: 12 }
    };
    if (!sizeMap[size]) throw new Error(`avatar.group does not accept size ${String(size)}`);
    if (!Array.isArray(members)) throw new Error("avatar.group members must be an array");
    if (!Number.isInteger(overflow) || overflow < 0) throw new Error("avatar.group overflow must be a non-negative integer");
    const avatarSize = sizeMap[size].avatar;
    const memberMarkup = members.map((member) => avatar({ ...member, size: avatarSize })).join("");
    const overflowMarkup = overflow ? `<span class="ui-avatar-group__overflow" aria-label="${escapeHTML(`${overflow} additional members`)}">+${overflow}</span>` : "";
    const addMarkup = addLabel ? `<button class="ui-avatar-group__add" type="button" aria-label="${escapeHTML(addLabel)}">${icon("Assets/Icons/add.svg", "ui-avatar-group__add-icon")}</button>` : "";
    return `<span class="ui-avatar-group ui-avatar-group--${size}" data-component="avatar" data-ui-avatar-part="group" role="group" aria-label="${escapeHTML(ariaLabel)}"><span class="ui-avatar-group__stack">${memberMarkup}${overflowMarkup}${addMarkup}</span></span>`;
  }

  function badge(props = {}) {
    assertProps("badge", props);
    const { type = "count", anchor = "", count = 0, label = "", tone = "default", overflowCount = 99, hidden = false, ariaLabel = "" } = props;
    enumValue("badge", "type", type);
    enumValue("badge", "tone", tone);
    enumValue("badge", "hidden", hidden);
    if (!Number.isInteger(overflowCount) || overflowCount < 0) throw new Error("badge.overflowCount must be a non-negative integer");
    if ((type === "count" || type === "dot") && !anchor) throw new Error(`badge.${type} requires an anchor slot`);
    if (type === "status" && !label) throw new Error("badge.status requires a label");

    const numericCount = typeof count === "number" && Number.isFinite(count) ? count : null;
    const displayCount = numericCount !== null && numericCount > overflowCount ? `${overflowCount}+` : escapeHTML(String(count));
    const accessibleLabel = ariaLabel || (type === "status" ? label : type === "dot" ? "New activity" : `${displayCount} notifications`);
    const classes = ["ui-badge", `ui-badge--${type}`, `ui-badge--${tone}`, hidden ? "is-hidden" : ""].filter(Boolean).join(" ");

    if (type === "status") {
      return `<span class="${classes}" data-component="badge" role="status" aria-label="${escapeHTML(accessibleLabel)}"><span class="ui-badge__status-dot" aria-hidden="true"></span><span class="ui-badge__label">${escapeHTML(label)}</span></span>`;
    }

    const marker = hidden ? "" : type === "dot"
      ? '<span class="ui-badge__marker ui-badge__marker--dot" aria-hidden="true"></span>'
      : `<span class="ui-badge__marker ui-badge__marker--count" aria-hidden="true">${displayCount}</span>`;
    return `<span class="${classes}" data-component="badge" role="status" aria-label="${escapeHTML(accessibleLabel)}"><span class="ui-badge__anchor">${anchor}</span>${marker}</span>`;
  }

  function breadcrumb(props = {}) {
    assertProps("breadcrumb", props);
    const { items = [], separator = "Assets/Icons/arrow-right-sm.svg", ariaLabel = "Breadcrumb", collapsedOpen = false, demo = "" } = props;
    enumValue("breadcrumb", "collapsedOpen", collapsedOpen);
    if (!Array.isArray(items) || !items.length) throw new Error("breadcrumb requires at least one item");
    const currentIndex = items.findIndex((item) => item?.current);
    const resolvedCurrent = currentIndex === -1 ? items.length - 1 : currentIndex;
    if (items.some((item, index) => item?.current && index !== resolvedCurrent)) throw new Error("breadcrumb accepts one current item");

    const separatorMarkup = () => {
      if (separator && approvedAsset(separator)) return icon(separator, "ui-breadcrumb__separator");
      return `<span class="ui-breadcrumb__separator ui-breadcrumb__separator--text" aria-hidden="true">${escapeHTML(separator || "/")}</span>`;
    };
    const itemMarkup = (item, index) => {
      const { label = "", icon: iconPath = "", ariaLabel: itemAriaLabel = "", href = "", disabled = false } = item || {};
      if (iconPath && !approvedAsset(iconPath)) throw new Error(`Unapproved asset: ${iconPath}`);
      if (!label && !iconPath) throw new Error("breadcrumb item requires a label or icon");
      if (!label && !itemAriaLabel) throw new Error("icon-only breadcrumb item requires ariaLabel");
      const isCurrent = index === resolvedCurrent;
      const iconMarkup = iconPath ? icon(iconPath, "ui-breadcrumb__icon") : "";
      const content = `${iconMarkup}${label ? `<span class="ui-breadcrumb__label">${escapeHTML(label)}</span>` : ""}`;
      if (isCurrent) return `<li class="ui-breadcrumb__item is-current"><span class="ui-breadcrumb__current" aria-current="page">${content}</span></li>`;
      const classes = ["ui-breadcrumb__link", iconPath ? "has-icon" : "", !label ? "is-icon-only" : ""].filter(Boolean).join(" ");
      const navigation = href ? ` href="${escapeHTML(href)}"` : ' type="button"';
      const disabledMarkup = disabled ? (href ? ' aria-disabled="true"' : " disabled") : "";
      return `<li class="ui-breadcrumb__item"><${href ? "a" : "button"} class="${classes}" data-demo="${escapeHTML(demo || "ui-breadcrumb-item")}"${itemAriaLabel ? ` aria-label="${escapeHTML(itemAriaLabel)}"` : ""}${disabledMarkup}${navigation}>${content}</${href ? "a" : "button"}></li>`;
    };

    const output = [];
    let collapsedHandled = false;
    items.forEach((item, index) => {
      if (item?.collapsed) {
        if (collapsedHandled) return;
        collapsedHandled = true;
        const collapsed = items.filter((candidate) => candidate?.collapsed);
        const menuItems = collapsed.map((candidate) => `<li role="none"><button type="button" role="menuitem" data-demo="ui-breadcrumb-overflow-item">${escapeHTML(candidate.label || candidate.ariaLabel || "Path item")}</button></li>`).join("");
        output.push(`<li class="ui-breadcrumb__item ui-breadcrumb__overflow-wrap"><button class="ui-breadcrumb__overflow" type="button" data-demo="ui-breadcrumb-overflow" aria-label="Show hidden path items" aria-expanded="${collapsedOpen}" aria-controls="ui-breadcrumb-overflow-menu">${icon("Assets/Icons/more.svg", "ui-breadcrumb__overflow-icon")}</button><ul class="ui-breadcrumb__menu" id="ui-breadcrumb-overflow-menu" role="menu"${collapsedOpen ? "" : " hidden"}>${menuItems}</ul></li>`);
      } else {
        output.push(itemMarkup(item, index));
      }
    });
    const joined = output.flatMap((item, index) => index < output.length - 1 ? [item, `<li class="ui-breadcrumb__item ui-breadcrumb__separator-wrap">${separatorMarkup()}</li>`] : [item]).join("");
    return `<nav class="ui-breadcrumb" data-component="breadcrumb" aria-label="${escapeHTML(ariaLabel)}"><ol class="ui-breadcrumb__list">${joined}</ol></nav>`;
  }

  function toggleBreadcrumb(control) {
    const wrapper = control?.closest?.(".ui-breadcrumb__overflow-wrap");
    const menu = wrapper?.querySelector?.(".ui-breadcrumb__menu");
    if (!menu) return;
    const open = menu.hasAttribute("hidden");
    menu.toggleAttribute("hidden", !open);
    control.setAttribute("aria-expanded", String(open));
  }

  function closeBreadcrumbs(except = null) {
    document.querySelectorAll(".ui-breadcrumb__overflow-wrap").forEach((wrapper) => {
      if (wrapper.contains(except)) return;
      wrapper.querySelector(".ui-breadcrumb__menu")?.setAttribute("hidden", "");
      wrapper.querySelector("[data-demo=ui-breadcrumb-overflow]")?.setAttribute("aria-expanded", "false");
    });
  }

  function card(props = {}) {
    assertProps("card", props);
    const { interactive = false, outlined = true, media = "", mediaAlt = "", mediaPlaceholder = false, mediaRatio = "16:9", eyebrow = "", title = "", body = "", meta = "", footer = "", density = "default", ariaLabel = "", href = "", demo = "" } = props;
    enumValue("card", "interactive", interactive);
    enumValue("card", "outlined", outlined);
    enumValue("card", "mediaRatio", mediaRatio);
    enumValue("card", "density", density);
    if (!title && !ariaLabel) throw new Error("card requires a title or ariaLabel");
    if (href && !interactive) throw new Error("card.href requires interactive true");
    const tag = interactive ? (href ? "a" : "button") : "article";
    const rootAttributes = interactive
      ? (href ? ` href="${escapeHTML(href)}"` : ' type="button"')
      : "";
    const hasMedia = Boolean(media || mediaPlaceholder);
    const classes = ["ui-card", interactive ? "is-interactive" : "is-static", outlined && !interactive ? "is-outlined" : "", `ui-card--${density}`, hasMedia ? `ui-card--media-${mediaRatio.replace(":", "-")}` : ""].filter(Boolean).join(" ");
    const mediaMarkup = media
      ? `<img class="ui-card__media" src="${escapeHTML(media)}" alt="${escapeHTML(mediaAlt)}" />`
      : mediaPlaceholder ? `<span class="ui-card__media ui-media-placeholder" aria-hidden="true"><img src="${withBase("Assets/Icons/logo-italki-logomark-white.svg")}" alt="" /></span>` : "";
    const eyebrowMarkup = eyebrow ? `<span class="ui-card__eyebrow">${escapeHTML(eyebrow)}</span>` : "";
    const titleMarkup = title ? `<h3 class="ui-card__title">${escapeHTML(title)}</h3>` : "";
    const heading = eyebrow || title || meta ? `<header class="ui-card__heading"><div>${eyebrowMarkup}${titleMarkup}</div>${meta ? `<div class="ui-card__meta">${meta}</div>` : ""}</header>` : "";
    const bodyMarkup = body ? `<div class="ui-card__body">${body}</div>` : "";
    const footerMarkup = footer ? `<footer class="ui-card__footer">${footer}</footer>` : "";
    return `<${tag} class="${classes}" data-component="card"${demo ? ` data-demo="${escapeHTML(demo)}"` : ""}${ariaLabel ? ` aria-label="${escapeHTML(ariaLabel)}"` : ""}${rootAttributes}>${mediaMarkup}<div class="ui-card__content">${heading}${bodyMarkup}${footerMarkup}</div></${tag}>`;
  }

  function list(props = {}) {
    assertProps("list", props);
    const { id = "", items = [], size = "default", variant = "default", divided = true, ariaLabel = "List", demo = "" } = props;
    enumValue("list", "size", size);
    enumValue("list", "variant", variant);
    enumValue("list", "divided", divided);
    if (!Array.isArray(items) || !items.length) throw new Error("list requires at least one item");
    const content = items.map((rawItem, index) => {
      const item = typeof rawItem === "string" ? { label: rawItem } : rawItem || {};
      const { id: itemId = `item-${index + 1}`, label = "", description = "", content = "", avatar = "", likes = "", comments = "", trailing = "", image = "", imageAlt = "", imagePlaceholder = false, href = "", disabled = false, ariaLabel: itemAriaLabel = "", demo: itemDemo = "" } = item;
      if (!label && !itemAriaLabel) throw new Error("list item requires a label or ariaLabel");
      if (variant === "avatar" && !avatar) throw new Error("list.avatar items require an avatar slot");
      if (variant === "image" && !image && !imagePlaceholder) throw new Error("list.image items require an image or placeholder");
      if (variant === "content" && (!avatar || !content || (!image && !imagePlaceholder))) throw new Error("list.content items require avatar, content, and image or placeholder");
      if (image && !approvedAsset(image)) throw new Error(`list.image must be an approved asset: ${image}`);
      const interactive = Boolean(href || itemDemo);
      const tag = href && !disabled ? "a" : interactive ? "button" : "div";
      const actionAttrs = href && !disabled ? ` href="${escapeHTML(href)}"` : interactive ? ` type="button"${disabled ? " disabled" : ""}` : "";
      const avatarMarkup = avatar ? `<span class="ui-list__avatar">${avatar}</span>` : "";
      const descriptionMarkup = description ? `<span class="ui-list__description">${escapeHTML(description)}</span>` : "";
      const contentMarkup = content ? `<span class="ui-list__content">${escapeHTML(content)}</span>` : "";
      const metricsMarkup = likes !== "" || comments !== "" ? `<span class="ui-list__metrics">${likes !== "" ? `<span>${icon("Assets/Icons/16px/upvote-sm.svg", "ui-list__metric-icon")}${escapeHTML(likes)}</span>` : ""}${comments !== "" ? `<span>${icon("Assets/Icons/16px/comments-sm.svg", "ui-list__metric-icon")}${escapeHTML(comments)}</span>` : ""}</span>` : "";
      const trailingMarkup = trailing ? `<span class="ui-list__trailing">${trailing}</span>` : "";
      const imageMarkup = imagePlaceholder
        ? `<span class="ui-list__image-placeholder ui-media-placeholder" aria-hidden="true"><img src="${withBase("Assets/Icons/logo-italki-logomark-white.svg")}" alt="" /></span>`
        : image ? `<img class="ui-list__image" src="${escapeHTML(image)}" alt="${escapeHTML(imageAlt)}" />` : "";
      const identityMarkup = `<span class="ui-list__copy"><span class="ui-list__label">${escapeHTML(label)}</span>${descriptionMarkup}</span>`;
      const rowContent = variant === "content"
        ? `${avatarMarkup}${identityMarkup}${imageMarkup}${contentMarkup}${metricsMarkup}${trailingMarkup}`
        : `${avatarMarkup}${identityMarkup}${trailingMarkup}${imageMarkup}`;
      return `<li class="ui-list__item${interactive ? " is-interactive" : ""}${disabled ? " is-disabled" : ""}" data-list-item="${escapeHTML(itemId)}"><${tag} class="ui-list__row"${actionAttrs}${itemAriaLabel ? ` aria-label="${escapeHTML(itemAriaLabel)}"` : ""}${itemDemo || demo ? ` data-demo="${escapeHTML(itemDemo || demo)}"` : ""}>${rowContent}</${tag}></li>`;
    }).join("");
    return `<ul class="ui-list ui-list--${size} ui-list--${variant}${divided ? " is-divided" : ""}" data-component="list"${id ? ` id="${escapeHTML(id)}"` : ""} aria-label="${escapeHTML(ariaLabel)}">${content}</ul>`;
  }

  function alert(props = {}) {
    assertProps("alert", props);
    const { tone = "info", title = "", description = "", closable = false, action = "", banner = false, ariaLabel = "", demo = "" } = props;
    enumValue("alert", "tone", tone);
    enumValue("alert", "closable", closable);
    enumValue("alert", "banner", banner);
    if (!title && !ariaLabel) throw new Error("alert requires a title or ariaLabel");
    const iconByTone = {
      info: "Assets/Icons/info.svg",
      success: "Assets/Icons/check.svg",
      warning: "Assets/Icons/warning.svg",
      error: "Assets/Icons/error.svg"
    };
    const close = closable ? `<button class="ui-alert__close" type="button" data-demo="ui-alert-close" aria-label="Dismiss alert">${icon("Assets/Icons/cross.svg", "ui-alert__close-icon")}</button>` : "";
    const descriptionMarkup = description ? `<span class="ui-alert__description">${escapeHTML(description)}</span>` : "";
    const actionMarkup = action ? `<div class="ui-alert__action">${action}</div>` : "";
    const classes = ["ui-alert", `ui-alert--${tone}`, action ? "has-action" : "", closable ? "is-closable" : "", banner ? "is-banner" : ""].filter(Boolean).join(" ");
    return `<section class="${classes}" data-component="alert"${demo ? ` data-demo-alert="${escapeHTML(demo)}"` : ""} role="alert" aria-label="${escapeHTML(ariaLabel || title)}"><span class="ui-alert__icon" aria-hidden="true">${icon(iconByTone[tone], "ui-alert__icon-image")}</span><div class="ui-alert__copy"><strong>${escapeHTML(title)}</strong>${descriptionMarkup}</div>${actionMarkup}${close}</section>`;
  }

  function dismissAlert(control) {
    control?.closest?.("[data-component=alert]")?.remove();
  }

  function tabs(props = {}) {
    assertProps("tabs", props);
    const { id = "tabs", items = [], activeId = "", extra = "", ariaLabel = "Tabs", orientation = "horizontal", variant = "default", activation = "automatic", demo = "" } = props;
    enumValue("tabs", "orientation", orientation);
    enumValue("tabs", "variant", variant);
    enumValue("tabs", "activation", activation);
    if (!Array.isArray(items) || !items.length) throw new Error("tabs requires at least one item");
    const normalizedItems = items.map((item, index) => ({ ...item, id: item?.id || `${id}-${index}` }));
    if (normalizedItems.some((item) => !item.label)) throw new Error("tabs items require a label");
    for (const item of normalizedItems) if (item.icon && !approvedAsset(item.icon)) throw new Error(`Unapproved asset: ${item.icon}`);
    const selectedId = activeId || normalizedItems.find((item) => !item.disabled)?.id;
    const activeItem = normalizedItems.find((item) => item.id === selectedId && !item.disabled) || normalizedItems.find((item) => !item.disabled);
    if (!activeItem) throw new Error("tabs requires one enabled item");
    const triggers = normalizedItems.map((item) => {
      const active = item.id === activeItem.id;
      const iconMarkup = item.icon ? icon(item.icon, "ui-tabs__icon") : "";
      const countMarkup = item.count === undefined || item.count === "" ? "" : `<span class="ui-tabs__count" aria-label="${escapeHTML(`${item.count} notifications`)}">${escapeHTML(item.count)}</span>`;
      return `<button class="ui-tabs__trigger${active ? " is-active" : ""}" type="button" role="tab" id="${escapeHTML(item.id)}-tab" data-demo="${escapeHTML(demo || "ui-tabs-trigger")}" data-tab="${escapeHTML(item.id)}" aria-selected="${active}" aria-controls="${escapeHTML(item.id)}-panel" tabindex="${active ? "0" : "-1"}"${item.disabled ? " disabled" : ""}>${iconMarkup}<span>${escapeHTML(item.label)}</span>${countMarkup}</button>`;
    }).join("");
    const panels = normalizedItems.map((item) => `<section class="ui-tabs__panel" id="${escapeHTML(item.id)}-panel" role="tabpanel" aria-labelledby="${escapeHTML(item.id)}-tab"${item.id === activeItem.id ? "" : " hidden"}>${item.panel || ""}</section>`).join("");
    const extraMarkup = extra ? `<div class="ui-tabs__extra">${extra}</div>` : "";
    return `<section class="ui-tabs ui-tabs--${orientation} ui-tabs--${variant}${extra ? " has-extra" : ""}" data-component="tabs" data-ui-tabs data-activation="${activation}" aria-label="${escapeHTML(ariaLabel)}"><div class="ui-tabs__header"><div class="ui-tabs__list" role="tablist" aria-orientation="${orientation}" aria-label="${escapeHTML(ariaLabel)}">${triggers}</div>${extraMarkup}</div>${panels}</section>`;
  }

  function selectTab(control) {
    const tabsRoot = control?.closest?.("[data-ui-tabs]");
    if (!tabsRoot || control.disabled) return;
    const tabId = control.dataset.tab;
    tabsRoot.querySelectorAll("[role=tab]").forEach((trigger) => {
      const active = trigger === control;
      trigger.classList.toggle("is-active", active);
      trigger.setAttribute("aria-selected", String(active));
      trigger.tabIndex = active ? 0 : -1;
    });
    const activePanelId = `${tabId}-panel`;
    tabsRoot.querySelectorAll("[role=tabpanel]").forEach((panel) => {
      const active = panel.id === activePanelId;
      panel.hidden = !active;
      if (!active) {
        panel.classList.remove("is-entering");
        return;
      }
      panel.classList.remove("is-entering");
      const nextFrame = global.requestAnimationFrame || ((callback) => global.setTimeout(callback, 0));
      nextFrame(() => panel.classList.add("is-entering"));
    });
  }

  function handleTabsKeydown(event) {
    const control = event?.target?.closest?.('[role="tab"]');
    const tabsRoot = control?.closest?.("[data-ui-tabs]");
    if (!control || !tabsRoot || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const enabled = [...tabsRoot.querySelectorAll('[role="tab"]')].filter((tab) => !tab.disabled);
    const currentIndex = enabled.indexOf(control);
    let nextIndex = currentIndex;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + enabled.length) % enabled.length;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % enabled.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = enabled.length - 1;
    event.preventDefault();
    const next = enabled[nextIndex];
    next.focus();
    if (tabsRoot.dataset.activation === "automatic") selectTab(next);
  }

  function pagination(props = {}) {
    assertProps("pagination", props);
    const { pages = [], current = 1, previousDisabled = false, nextDisabled = false, ariaLabel = "Pagination", demo = "" } = props;
    enumValue("pagination", "previousDisabled", previousDisabled);
    enumValue("pagination", "nextDisabled", nextDisabled);
    if (!Array.isArray(pages) || !pages.some((page) => page === current)) throw new Error("pagination.pages must contain current");
    const suppliedPages = pages.filter((page) => Number.isInteger(page));
    const currentIndex = suppliedPages.indexOf(current);
    const previousUnavailable = previousDisabled || currentIndex <= 0;
    const nextUnavailable = nextDisabled || currentIndex >= suppliedPages.length - 1;
    const pageItems = pages.map((page) => {
      if (page === "ellipsis") return '<span class="ui-pagination__ellipsis" aria-hidden="true">...</span>';
      if (!Number.isInteger(page) || page < 1) throw new Error("pagination pages must be positive integers or ellipsis");
      const active = page === current;
      return `<button class="ui-pagination__page${active ? " is-current" : ""}" type="button" data-demo="${escapeHTML(demo || "ui-pagination")}" data-page="${page}"${active ? ' aria-current="page"' : ""}>${page}</button>`;
    }).join("");
    const previous = `<button class="ui-pagination__arrow" type="button" data-demo="${escapeHTML(demo || "ui-pagination")}" data-page="prev" aria-label="Previous page"${previousUnavailable ? " disabled" : ""}>${icon("Assets/Icons/arrow-left-sm.svg", "ui-pagination__arrow-icon")}</button>`;
    const next = `<button class="ui-pagination__arrow" type="button" data-demo="${escapeHTML(demo || "ui-pagination")}" data-page="next" aria-label="Next page"${nextUnavailable ? " disabled" : ""}>${icon("Assets/Icons/arrow-right-sm.svg", "ui-pagination__arrow-icon")}</button>`;
    return `<nav class="ui-pagination" data-component="pagination" data-pagination-previous-disabled="${previousDisabled}" data-pagination-next-disabled="${nextDisabled}" aria-label="${escapeHTML(ariaLabel)}">${previous}${pageItems}${next}</nav>`;
  }

  function selectPaginationPage(control) {
    const pager = control?.closest?.(".ui-pagination");
    if (!pager || control.disabled) return;
    const pages = [...pager.querySelectorAll("[data-page]")].filter((page) => /^\d+$/.test(page.dataset.page));
    const current = pages.findIndex((page) => page.classList.contains("is-current"));
    const requested = control.dataset.page;
    const nextIndex = requested === "prev" ? Math.max(0, current - 1) : (requested === "next" ? Math.min(pages.length - 1, current + 1) : pages.findIndex((page) => page.dataset.page === requested));
    if (nextIndex < 0) return;
    pages.forEach((page, index) => {
      const active = index === nextIndex;
      page.classList.toggle("is-current", active);
      if (active) page.setAttribute("aria-current", "page");
      else page.removeAttribute("aria-current");
    });
    const previous = pager.querySelector('[data-page="prev"]');
    const next = pager.querySelector('[data-page="next"]');
    if (previous) previous.disabled = pager.dataset.paginationPreviousDisabled === "true" || nextIndex === 0;
    if (next) next.disabled = pager.dataset.paginationNextDisabled === "true" || nextIndex === pages.length - 1;
  }

  function rate(props = {}) {
    assertProps("rate", props);
    const {
      id = "",
      value = 0,
      count = 5,
      allowHalf = false,
      allowClear = true,
      disabled = false,
      labels = [],
      showText = false,
      label = "Rate this item",
      variant = "interactive",
      state = "default",
      demo = ""
    } = props;
    enumValue("rate", "variant", variant);
    enumValue("rate", "allowHalf", allowHalf);
    enumValue("rate", "allowClear", allowClear);
    enumValue("rate", "disabled", disabled);
    enumValue("rate", "showText", showText);
    enumValue("rate", "state", disabled ? "disabled" : state);
    if (!Number.isInteger(count) || count < 1 || count > 10) throw new Error("rate.count must be an integer from 1 to 10");
    if (!Array.isArray(labels) || labels.some((item) => typeof item !== "string")) throw new Error("rate.labels must be an array of strings");
    if (variant === "summary") {
      if (!Number.isFinite(value) || value < 0 || value > count) throw new Error("rate.value must be within count");
      const displayValue = String(value);
      return `<div class="ui-rate ui-rate--summary"${id ? ` id="${escapeHTML(id)}"` : ""} data-component="rate" role="img" aria-label="${escapeHTML(`${label}: ${displayValue} out of ${count}`)}">${icon("Assets/Icons/star-solid.svg", "ui-rate__summary-star")}<output class="ui-rate__summary-value">${escapeHTML(displayValue)}</output></div>`;
    }
    if (!Number.isFinite(value) || value < 0 || value > count || (!allowHalf && !Number.isInteger(value)) || (allowHalf && Math.round(value * 2) !== value * 2)) throw new Error("rate.value must be within count and match the active step");
    const activeIndex = Math.max(1, Math.ceil(value || 1));
    const display = `${value || 0} / ${count}`;
    const text = value && labels.length ? labels[Math.ceil(value) - 1] || "" : "";
    const starBase = icon("Assets/Icons/star-outline.svg", "ui-rate__star-base");
    const starFill = icon("Assets/Icons/star-solid.svg", "ui-rate__star-image");
    const items = Array.from({ length: count }, (_, offset) => {
      const index = offset + 1;
      const active = value >= index;
      const half = allowHalf && !active && value === index - .5;
      const name = labels[offset] || `${index} out of ${count}`;
      const visualState = state === "hover" ? `${active || half ? " is-preview-active" : ""}${half ? " is-preview-half" : ""}` : `${active ? " is-active" : ""}${half ? " is-half" : ""}`;
      return `<button class="ui-rate__item${visualState}" type="button" role="radio" aria-checked="${String(active || half)}" aria-label="${escapeHTML(name)}" data-demo="${escapeHTML(demo || "ui-rate")}" data-rate-index="${index}" tabindex="${index === activeIndex ? "0" : "-1"}"${labels[offset] ? ` title="${escapeHTML(labels[offset])}"` : ""}${disabled ? " disabled" : ""}><span class="ui-rate__star" aria-hidden="true">${starBase}<span class="ui-rate__star-fill">${starFill}</span></span></button>`;
    }).join("");
    const classes = ["ui-rate", disabled ? "is-disabled" : "", state === "hover" ? "is-preview" : ""].filter(Boolean).join(" ");
    const idAttribute = id ? ` id="${escapeHTML(id)}"` : "";
    return `<div class="${classes}"${idAttribute} data-component="rate" data-ui-rate data-rate-value="${value}" data-rate-count="${count}" data-rate-allow-half="${allowHalf}" data-rate-allow-clear="${allowClear}" data-rate-disabled="${disabled}" data-rate-labels="${escapeHTML(labels.join("|"))}" role="radiogroup" aria-label="${escapeHTML(label)}">${items}<output class="ui-rate__output" data-rate-output>${display}</output>${showText ? `<span class="ui-rate__text" data-rate-text>${escapeHTML(text)}</span>` : ""}</div>`;
  }

  function rateRoot(control) {
    return control?.closest?.("[data-ui-rate]");
  }

  function setRateVisual(root, value, preview = false) {
    if (!root) return;
    const labels = root.dataset.rateLabels ? root.dataset.rateLabels.split("|") : [];
    const allowHalf = root.dataset.rateAllowHalf === "true";
    root.classList.toggle("is-preview", preview);
    root.querySelectorAll("[data-demo=ui-rate]").forEach((item) => {
      const index = Number(item.dataset.rateIndex);
      const active = value >= index;
      const half = allowHalf && !active && value === index - .5;
      item.classList.toggle("is-active", !preview && active);
      item.classList.toggle("is-half", !preview && half);
      item.classList.toggle("is-preview-active", preview && (active || half));
      item.classList.toggle("is-preview-half", preview && half);
      item.setAttribute("aria-checked", String(active || half));
      item.tabIndex = index === Math.max(1, Math.ceil(value || 1)) ? 0 : -1;
    });
    const output = root.querySelector("[data-rate-output]");
    if (output) output.textContent = `${value || 0} / ${root.dataset.rateCount}`;
    const text = root.querySelector("[data-rate-text]");
    if (text) text.textContent = value && labels.length ? labels[Math.ceil(value) - 1] || "" : "";
  }

  function setRateValue(root, value) {
    if (!root || root.dataset.rateDisabled === "true") return false;
    root.dataset.rateValue = String(value);
    setRateVisual(root, value);
    return true;
  }

  function rateValueFromPointer(root, item, event) {
    const index = Number(item?.dataset?.rateIndex);
    if (!root || !Number.isFinite(index) || root.dataset.rateAllowHalf !== "true" || !event?.clientX) return index;
    const bounds = item.getBoundingClientRect();
    return event.clientX - bounds.left < bounds.width / 2 ? index - .5 : index;
  }

  function selectRate(control, event) {
    const root = rateRoot(control);
    if (!root || control?.disabled || root.dataset.rateDisabled === "true") return false;
    const value = rateValueFromPointer(root, control, event);
    const next = root.dataset.rateAllowClear !== "false" && value === Number(root.dataset.rateValue) ? 0 : value;
    return setRateValue(root, next);
  }

  function previewRate(control, event) {
    const root = rateRoot(control);
    if (!root || control?.disabled || root.dataset.rateDisabled === "true") return;
    setRateVisual(root, rateValueFromPointer(root, control, event), true);
  }

  function resetRatePreview(control) {
    const root = rateRoot(control);
    if (!root || root.dataset.rateDisabled === "true") return;
    setRateVisual(root, Number(root.dataset.rateValue));
  }

  function handleRateKeydown(event) {
    const item = event?.target?.closest?.("[data-demo=ui-rate]");
    const root = rateRoot(item);
    if (!item || !root || root.dataset.rateDisabled === "true" || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return false;
    const count = Number(root.dataset.rateCount);
    const step = root.dataset.rateAllowHalf === "true" ? .5 : 1;
    const current = Number(root.dataset.rateValue);
    const next = event.key === "Home" ? 0 : (event.key === "End" ? count : Math.max(0, Math.min(count, current + (event.key === "ArrowLeft" ? -step : step))));
    event.preventDefault();
    setRateValue(root, next);
    root.querySelector(`[data-demo=ui-rate][data-rate-index="${Math.max(1, Math.ceil(next))}"]`)?.focus();
    return true;
  }

  function sidebarPrimaryRow(item = {}, demo = "") {
    const { id: itemId = "", label = "", icon: iconPath = "", active = false, disabled = false, fixed = false } = item;
    if (!itemId || !label) throw new Error("sidebar items require id and label");
    const eventAttribute = demo ? ` data-sidebar-demo="${escapeHTML(demo)}"` : "";
    const fixedItem = Boolean(fixed);
    const itemClass = ["ui-sidebar__item", active ? "is-active" : ""].filter(Boolean).join(" ");
    const pinControl = fixedItem ? "" : `<button class="ui-sidebar__pin-toggle" type="button" data-demo="ui-sidebar-unpin" aria-label="Unpin ${escapeHTML(label)}">${icon("Assets/Icons/pin-solid.svg", "ui-sidebar__pin-toggle-icon")}</button>`;
    return `<div class="ui-sidebar__nav-row${fixedItem ? " is-fixed" : " is-pinnable"}${active ? " is-active" : ""}" data-ui-sidebar-primary-row data-sidebar-item="${escapeHTML(itemId)}" data-sidebar-label="${escapeHTML(label)}" data-sidebar-icon="${escapeHTML(iconPath)}" data-sidebar-fixed="${fixedItem}"${fixedItem ? "" : ' draggable="true"'}><button class="${itemClass}" type="button" data-demo="ui-sidebar-item" data-sidebar-item="${escapeHTML(itemId)}"${active ? ' aria-current="page"' : ""}${disabled ? " disabled" : ""}${eventAttribute}>${iconPath ? icon(iconPath, "ui-sidebar__item-icon") : ""}<span>${escapeHTML(label)}</span></button>${pinControl}</div>`;
  }

  function sidebarMoreRow(item = {}) {
    const { id: itemId = "", label = "", icon: iconPath = "", dividerBefore = false, disabled = false } = item;
    if (!itemId || !label) throw new Error("sidebar moreItems require id and label");
    /* The flag rides on the row rather than only being rendered once: a row
       that leaves and comes back has to know whether it still starts a group. */
    return `${dividerBefore ? '<i class="ui-sidebar__more-divider" aria-hidden="true"></i>' : ""}<div class="ui-sidebar__more-row" role="none" data-ui-sidebar-more-row data-sidebar-item="${escapeHTML(itemId)}" data-sidebar-label="${escapeHTML(label)}" data-sidebar-icon="${escapeHTML(iconPath)}" draggable="true"><button class="ui-sidebar__more-menu-item" type="button" role="menuitem" data-demo="ui-sidebar-more-item" data-sidebar-item="${escapeHTML(itemId)}"${disabled ? " disabled" : ""}>${iconPath ? icon(iconPath, "ui-sidebar__more-icon") : ""}<span>${escapeHTML(label)}</span></button><button class="ui-sidebar__pin-toggle" type="button" data-demo="ui-sidebar-pin" aria-label="Pin ${escapeHTML(label)}">${icon("Assets/Icons/pin-outline.svg", "ui-sidebar__pin-toggle-icon")}</button></div>`;
  }

  /* italki's own shell navigation, defined once.
     The Sidebar component takes its rows as data, which is right — it has no
     business knowing what italki's destinations are. But then every page that
     mounts it wrote out the list again, and three hand-written copies drifted
     into three different More menus: the Catalog's card had five entries, one
     template had five including a Practice and a Vocabulary that were never
     part of the spec, and the other had two. Nothing was keeping them in step
     because nothing could.

     So the roster lives here, beside the component, as data rather than
     behaviour: this is what italki's shell contains, and a page says which row
     is current. Icons stay bare names — the renderer resolves them against the
     manifest, which is also what makes the same list correct two folders down,
     where literal paths would not be.

     moreItems is the full roster in canonical order, not just what is hidden
     right now. A destination missing from it has nowhere to return to when it
     is unpinned, and the dividers are the grouping: each holds whichever of its
     members is currently in the menu. */
  const APP_SHELL_ITEMS = [
    { id: "home", label: "Home", icon: "dashboard", fixed: true },
    { id: "search-teachers", label: "Search Teachers", icon: "search-list", fixed: true },
    { id: "my-lessons", label: "My Lessons", icon: "lesson" },
    { id: "my-calendar", label: "My Calendar", icon: "calendar" },
    { id: "learn", label: "Learn", icon: "tabbar-learn" },
    { id: "progress", label: "Progress", icon: "chart" },
    { id: "mira", label: "italki Mira", icon: "mira" },
    { id: "more", label: "More", icon: "more", more: true },
  ];
  const APP_SHELL_MORE = [
    { id: "my-lessons", label: "My Lessons", icon: "lesson" },
    { id: "my-calendar", label: "My Calendar", icon: "calendar" },
    { id: "my-teachers", label: "My Teachers", icon: "teacher" },
    { id: "learn", label: "Learn", icon: "tabbar-learn", dividerBefore: true },
    { id: "progress", label: "Progress", icon: "chart" },
    { id: "flowy", label: "Flowy", icon: "flowy" },
    { id: "mira", label: "italki Mira", icon: "mira", dividerBefore: true },
    { id: "group-class", label: "Group Class", icon: "group", dividerBefore: true },
    { id: "community", label: "Community", icon: "community" },
    { id: "business", label: "italki Business", icon: "briefcase", dividerBefore: true },
  ];

  function appShellNav(options = {}) {
    const { active = "" } = options;
    /* Copied out, not handed over: the caller spreads extra keys onto these
       rows, and a shared array that one page mutates is the same drift in a
       new shape. */
    const clone = (row) => ({ ...row });
    return {
      items: APP_SHELL_ITEMS.map((row) => (active && row.id === active ? { ...row, active: true } : clone(row))),
      moreItems: APP_SHELL_MORE.map(clone),
    };
  }

  function sidebar(props = {}) {
    assertProps("sidebar", props);
    const {
      id = "",
      variant = "normal",
      collapsed = false,
      items = [],
      sections = [],
      moreItems = [],
      moreOpen = false,
      footer = "",
      balance = "",
      avatarInitials = "",
      ariaLabel = "Sidebar",
      sticky = true,
      demo = ""
    } = props;
    enumValue("sidebar", "variant", variant);
    enumValue("sidebar", "collapsed", collapsed);
    enumValue("sidebar", "sticky", sticky);
    enumValue("sidebar", "moreOpen", moreOpen);
    if (!Array.isArray(items) || !Array.isArray(sections) || !Array.isArray(moreItems)) throw new Error("sidebar.items, sidebar.sections, and sidebar.moreItems must be arrays");
    const sidebarId = id || `sidebar-${String(ariaLabel).toLowerCase().replace(/[^a-z0-9]+/g, "-") || "navigation"}`;
    const eventAttribute = demo ? ` data-sidebar-demo="${escapeHTML(demo)}"` : "";
    const renderIcon = (path, className) => path ? icon(path, className) : "";
    const renderItem = (item) => {
      const { id: itemId = "", label = "", icon: iconPath = "", active = false, disabled = false, more = false } = item || {};
      if (!itemId || !label) throw new Error("sidebar items require id and label");
      const itemClass = ["ui-sidebar__item", active ? "is-active" : ""].filter(Boolean).join(" ");
      const content = `${renderIcon(iconPath, "ui-sidebar__item-icon")}<span>${escapeHTML(label)}</span>`;
      if (more) {
        /* moreItems is the overflow roster in its canonical order, not just
           what happens to be in the menu right now. A destination pinned out to
           the primary list is simply not rendered here — which is what lets it
           come back to its own place instead of the bottom of the list. */
        const pinnedOut = new Set(items.map((entry) => (entry || {}).id));
        const inMenu = moreItems.filter((entry) => entry && !pinnedOut.has(entry.id));
        /* Same rule as refreshSidebarMoreMenu: the line belongs to the first
           member of the group that is actually showing. */
        let groupIndex = 0;
        const groupOf = new Map();
        for (const entry of moreItems) {
          if (entry && entry.dividerBefore) groupIndex += 1;
          if (entry) groupOf.set(entry.id, groupIndex);
        }
        let previousGroup = null;
        const menuRows = inMenu.map((entry) => {
          const current = groupOf.get(entry.id);
          const starts = previousGroup !== null && current !== previousGroup;
          previousGroup = current;
          return sidebarMoreRow({ ...entry, dividerBefore: starts });
        });
        const moreMenu = `<div class="ui-sidebar__more-menu" role="menu" aria-label="More destinations" data-sidebar-more-roster="${escapeHTML(JSON.stringify(moreItems))}">${menuRows.join("")}<p class="ui-sidebar__more-empty" data-ui-sidebar-more-empty${inMenu.length ? " hidden" : ""}>No more destinations.</p></div>`;
        return `<div class="ui-sidebar__more${moreOpen ? " is-open" : ""}" data-ui-sidebar-more><button class="${itemClass}" type="button" data-demo="ui-sidebar-more" aria-expanded="${moreOpen}" aria-haspopup="menu"${disabled ? " disabled" : ""}${eventAttribute}>${content}</button>${moreMenu}</div>`;
      }
      return sidebarPrimaryRow(item, demo);
    };
    const renderSection = (section) => {
      const { id: sectionId = "", label = "", items: sectionItems = [], open = false } = section || {};
      if (!sectionId || !label || !Array.isArray(sectionItems)) throw new Error("sidebar sections require id, label, and items");
      const rows = sectionItems.map((item) => {
        const { id: itemId = "", label: itemLabel = "", leading = "", avatar: avatarImage = "", prefix = "", divider = false, secondary = "", disabled = false } = item || {};
        if (!itemId || !itemLabel) throw new Error("sidebar section items require id and label");
        /* A chat row leads with the person's face, and `leading` takes rendered
           markup — so every consumer that had only a URL either pre-rendered an
           avatar or, more often, passed the URL as `avatar` and watched it be
           dropped without a word. The row builds it now. */
        const leadingMarkup = leading || (avatarImage
          ? avatar({ image: avatarImage, size: 24, ariaLabel: itemLabel })
          : "");
        const prefixMarkup = prefix ? `<span class="ui-sidebar__subitem-prefix">${escapeHTML(prefix)}</span>` : "";
        const dividerMarkup = divider ? '<i class="ui-sidebar__subitem-divider" aria-hidden="true"></i>' : "";
        const secondaryMarkup = secondary ? `<span class="ui-sidebar__subitem-secondary">${escapeHTML(secondary)}</span>` : "";
        return `<li><button class="ui-sidebar__subitem" type="button" data-demo="ui-sidebar-item" data-sidebar-item="${escapeHTML(itemId)}"${disabled ? " disabled" : ""}${eventAttribute}>${leadingMarkup}<span class="ui-sidebar__subitem-content">${prefixMarkup}${dividerMarkup}<span class="ui-sidebar__subitem-label">${escapeHTML(itemLabel)}</span>${secondaryMarkup}</span></button></li>`;
      }).join("");
      return `<section class="ui-sidebar__section${open ? " is-open" : ""}" data-ui-sidebar-section><button class="ui-sidebar__section-toggle" id="${escapeHTML(sidebarId)}-${escapeHTML(sectionId)}" type="button" data-demo="ui-sidebar-section" aria-expanded="${open}" aria-controls="${escapeHTML(sidebarId)}-${escapeHTML(sectionId)}-items"${eventAttribute}><span>${escapeHTML(label)}</span>${renderIcon("Assets/Icons/chevron-right.svg", "ui-sidebar__section-arrow")}</button><ul class="ui-sidebar__section-list" id="${escapeHTML(sidebarId)}-${escapeHTML(sectionId)}-items"${open ? "" : ' aria-hidden="true" inert'}>${rows}</ul></section>`;
    };
    const brand = `<button class="ui-sidebar__brand" type="button" data-demo="ui-sidebar-brand" aria-label="${collapsed ? "Show sidebar" : "italki"}" aria-controls="${escapeHTML(sidebarId)}"${eventAttribute}>${renderIcon("Assets/Icons/logo-italki-wordmark.svg", "ui-sidebar__brand-wordmark")} ${renderIcon("Assets/Icons/logo-italki-logomark.svg", "ui-sidebar__brand-mark")} ${renderIcon("Assets/Icons/logo-italki-plus.svg", "ui-sidebar__brand-plus")} ${renderIcon("Assets/Icons/layout-left.svg", "ui-sidebar__brand-expand")}</button>`;
    const brandTooltip = tooltip({ id: `${sidebarId}-expand-tooltip`, content: "Show sidebar", placement: "bottom", trigger: brand });
    const collapseTrigger = `<button class="ui-sidebar__utility" type="button" data-demo="ui-sidebar-collapse" aria-label="Hide sidebar" aria-expanded="${!collapsed}" aria-controls="${escapeHTML(sidebarId)}"${eventAttribute}>${renderIcon("Assets/Icons/layout-left.svg", "ui-sidebar__utility-icon")}</button>`;
    const collapseTooltip = tooltip({ id: `${sidebarId}-collapse-tooltip`, content: "Hide sidebar", placement: "bottom", trigger: collapseTrigger });
    /* The footer is a slot, and the only thing anyone puts in it is the wallet
       balance and the account avatar. Filling it meant calling button() and
       avatar() and concatenating their markup, so consumers reached for
       `balance` and `avatarInitials` instead, got "does not accept prop", and
       shipped a rail with no footer. The standard footer is declarative now;
       the slot still wins when it is given. */
    const footerContent = footer || ((balance || avatarInitials)
      ? (balance ? button({ label: balance, variant: "secondary", size: 40, shape: "pill", leadingIcon: "wallet" }) : "")
        + (avatarInitials ? avatar({ initials: avatarInitials, size: 32, tone: "primary", interactive: true, ariaLabel: "Your profile" }) : "")
      : "");
    const classes = ["ui-sidebar", `ui-sidebar--${variant}`, collapsed ? "is-collapsed" : "", sticky ? "" : "is-flow"].filter(Boolean).join(" ");
    return `<aside class="${classes}" id="${escapeHTML(sidebarId)}" data-component="sidebar" data-ui-sidebar data-sidebar-collapsed="${collapsed}"${demo ? ` data-sidebar-demo="${escapeHTML(demo)}"` : ""} aria-label="${escapeHTML(ariaLabel)}"><header class="ui-sidebar__header">${brandTooltip}${collapseTooltip}</header><div class="ui-sidebar__scroll"><nav class="ui-sidebar__nav" aria-label="${escapeHTML(ariaLabel)} destinations">${items.map(renderItem).join("")}</nav>${sections.map(renderSection).join("")}</div>${footerContent ? `<footer class="ui-sidebar__footer">${footerContent}</footer>` : ""}</aside>`;
  }

  function sidebarRoot(control) {
    return control?.closest?.("[data-ui-sidebar]");
  }

  function setSidebarVariant(root, variant) {
    if (!root) return false;
    enumValue("sidebar", "variant", variant);
    root.classList.remove("ui-sidebar--normal", "ui-sidebar--plus");
    root.classList.add(`ui-sidebar--${variant}`);
    return true;
  }

  function setSidebarCollapsed(root, collapsed) {
    if (!root) return false;
    root.classList.toggle("is-collapsed", collapsed);
    root.dataset.sidebarCollapsed = String(collapsed);
    root.querySelector("[data-demo=ui-sidebar-collapse]")?.setAttribute("aria-expanded", String(!collapsed));
    root.querySelector("[data-demo=ui-sidebar-collapse]")?.setAttribute("aria-label", collapsed ? "Show sidebar" : "Hide sidebar");
    root.querySelector("[data-demo=ui-sidebar-brand]")?.setAttribute("aria-label", collapsed ? "Show sidebar" : "italki");
    return collapsed;
  }

  function toggleSidebar(control) {
    const root = sidebarRoot(control);
    if (!root) return false;
    if (control?.dataset?.demo === "ui-sidebar-brand" && !root.classList.contains("is-collapsed")) return false;
    return setSidebarCollapsed(root, !root.classList.contains("is-collapsed"));
  }

  function selectSidebarItem(control) {
    const root = sidebarRoot(control);
    if (!root || control?.disabled) return false;
    root.querySelectorAll("[data-demo=ui-sidebar-item], [data-demo=ui-sidebar-more-item]").forEach((item) => {
      const active = item === control;
      item.classList.toggle("is-active", active);
      if (active) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    });
    root.querySelectorAll("[data-ui-sidebar-primary-row]").forEach((row) => {
      row.classList.toggle("is-active", Boolean(row.querySelector("[data-demo=ui-sidebar-item].is-active")));
    });
    return true;
  }

  function sidebarItemData(row) {
    const itemButton = row?.querySelector?.("[data-sidebar-item]");
    if (!row || !itemButton) return null;
    return {
      id: row.dataset.sidebarItem || itemButton.dataset.sidebarItem || "",
      label: row.dataset.sidebarLabel || "",
      icon: row.dataset.sidebarIcon || "",
      active: itemButton.classList.contains("is-active"),
      disabled: itemButton.disabled
    };
  }

  function updateSidebarMoreEmpty(root) {
    const menu = root?.querySelector?.(".ui-sidebar__more-menu");
    const empty = menu?.querySelector?.("[data-ui-sidebar-more-empty]");
    if (empty) empty.hidden = Boolean(menu.querySelector("[data-ui-sidebar-more-row]"));
  }

  /* The overflow roster travels with the menu so a row that comes back can be
     rebuilt from the roster rather than from the primary row it was sitting in
     — the two legitimately differ, and a destination called "Mira" beside the
     nav is "italki Mira" inside the menu. */
  function sidebarMoreRoster(menu) {
    try { return JSON.parse(menu?.dataset?.sidebarMoreRoster || "[]"); }
    catch { return []; }
  }

  /* Dividers separate groups, so they are a property of the arrangement rather
     than of a row: the first visible row must not carry one, and a group whose
     every member is pinned out must not leave a line behind. Recomputed from
     what is actually in the menu, after every move. */
  function refreshSidebarMoreMenu(menu) {
    if (!menu) return;
    menu.querySelectorAll(".ui-sidebar__more-divider").forEach((line) => line.remove());
    /* A line goes before the first *visible* member of each group, not before
       the one the roster happens to name first: pin that one out to the nav and
       the rest of its group would silently merge into the group above. */
    const group = new Map();
    let index = 0;
    for (const entry of sidebarMoreRoster(menu)) {
      if (entry.dividerBefore) index += 1;
      group.set(entry.id, index);
    }
    const rows = [...menu.querySelectorAll("[data-ui-sidebar-more-row]")];
    let previous = null;
    for (const row of rows) {
      const current = group.get(row.dataset.sidebarItem);
      if (previous !== null && current !== previous) {
        row.insertAdjacentHTML("beforebegin", '<i class="ui-sidebar__more-divider" aria-hidden="true"></i>');
      }
      previous = current;
    }
    const empty = menu.querySelector("[data-ui-sidebar-more-empty]");
    if (empty) empty.toggleAttribute("hidden", rows.length > 0);
  }

  function unpinSidebarItem(control) {
    const root = sidebarRoot(control);
    const row = control?.closest?.("[data-ui-sidebar-primary-row]");
    const menu = root?.querySelector?.(".ui-sidebar__more-menu");
    if (!root || !row || !menu || row.dataset.sidebarFixed === "true") return false;
    const item = sidebarItemData(row);
    if (!item) return false;
    /* Back to its own place, not to the end. The menu carries the canonical
       order, so the row goes in front of the first destination that ranks after
       it — which is also what keeps its group intact. */
    const roster = sidebarMoreRoster(menu);
    const order = roster.map((entry) => entry.id);
    const rank = order.indexOf(item.id);
    row.remove();
    const markup = sidebarMoreRow({ ...item, ...(roster[rank] || {}), dividerBefore: false });
    const after = rank < 0 ? null : [...menu.querySelectorAll("[data-ui-sidebar-more-row]")]
      .find((sibling) => order.indexOf(sibling.dataset.sidebarItem) > rank);
    if (after) after.insertAdjacentHTML("beforebegin", markup);
    else (menu.querySelector("[data-ui-sidebar-more-empty]") || menu)
      .insertAdjacentHTML(menu.querySelector("[data-ui-sidebar-more-empty]") ? "beforebegin" : "beforeend", markup);
    refreshSidebarMoreMenu(menu);
    updateSidebarMoreEmpty(root);
    return true;
  }

  function pinSidebarItem(control) {
    const root = sidebarRoot(control);
    const row = control?.closest?.("[data-ui-sidebar-more-row]");
    const nav = root?.querySelector?.(".ui-sidebar__nav");
    const more = nav?.querySelector?.("[data-ui-sidebar-more]");
    if (!root || !row || !nav || !more) return false;
    const item = sidebarItemData(row);
    if (!item) return false;
    const menu = row.closest(".ui-sidebar__more-menu");
    row.remove();
    more.insertAdjacentHTML("beforebegin", sidebarPrimaryRow(item, root.dataset.sidebarDemo || ""));
    /* Removing a row can orphan the line that separated its group, or promote
       the next row to first, where a line must not be. Recompute rather than
       patch the neighbour. */
    refreshSidebarMoreMenu(menu);
    updateSidebarMoreEmpty(root);
    closeSidebarMore(root);
    return true;
  }

  function startSidebarDrag(event) {
    const row = event?.target?.closest?.("[data-ui-sidebar-primary-row].is-pinnable, [data-ui-sidebar-more-row]");
    if (!row) return false;
    const root = sidebarRoot(row);
    if (!root) return false;
    root.sidebarDraggedRow = row;
    row.classList.add("is-dragging");
    event.dataTransfer?.setData?.("text/plain", row.dataset.sidebarItem || "");
    if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
    return true;
  }

  function moveSidebarDrag(event) {
    const target = event?.target?.closest?.("[data-ui-sidebar-primary-row].is-pinnable, [data-ui-sidebar-more-row]");
    const root = sidebarRoot(target);
    const dragged = root?.sidebarDraggedRow;
    if (!root || !dragged || !target || dragged === target || dragged.parentElement !== target.parentElement) return false;
    event.preventDefault();
    const box = target.getBoundingClientRect?.();
    const insertAfter = box && event.clientY > box.top + box.height / 2;
    const draggedDivider = dragged.previousElementSibling?.classList?.contains("ui-sidebar__more-divider") ? dragged.previousElementSibling : null;
    const targetDivider = target.previousElementSibling?.classList?.contains("ui-sidebar__more-divider") ? target.previousElementSibling : null;
    const reference = insertAfter ? target.nextSibling : (targetDivider || target);
    if (draggedDivider) target.parentElement.insertBefore(draggedDivider, reference);
    target.parentElement.insertBefore(dragged, reference);
    return true;
  }

  function endSidebarDrag(event) {
    const row = event?.target?.closest?.("[data-ui-sidebar-primary-row], [data-ui-sidebar-more-row]");
    const root = sidebarRoot(row);
    if (row) row.classList.remove("is-dragging");
    if (root) root.sidebarDraggedRow = null;
    return true;
  }

  function sidebarSectionOpenScrollTarget(section, list) {
    const scroll = section?.closest?.(".ui-sidebar__scroll");
    const control = section?.querySelector?.("[data-demo=ui-sidebar-section]");
    const items = [...(list?.querySelectorAll?.(".ui-sidebar__subitem") || [])].slice(0, 3);
    if (!scroll || !control || !items.length) return null;

    const scrollBox = scroll.getBoundingClientRect?.();
    const sectionBox = section.getBoundingClientRect?.();
    if (!scrollBox || !sectionBox) return null;

    const inset = 16;
    const sectionTop = scroll.scrollTop + sectionBox.top - scrollBox.top;
    const firstRowsHeight = items.reduce((total, item) => total + Math.max(item.offsetHeight || 0, 40), 0) + Math.max(0, items.length - 1) * 2;
    const listMargin = 4;
    const desiredTop = Math.max(0, sectionTop - inset);
    const desiredBottom = sectionTop + control.offsetHeight + listMargin + firstRowsHeight + inset;
    const visibleBottom = scroll.scrollTop + scroll.clientHeight;

    if (sectionTop < scroll.scrollTop + inset) return desiredTop;
    if (desiredBottom > visibleBottom) return Math.max(0, desiredBottom - scroll.clientHeight);
    return null;
  }

  function scrollSidebarSectionIntoView(section, list, targetTop) {
    const scroll = section?.closest?.(".ui-sidebar__scroll");
    if (!scroll || targetTop === null || Math.abs(targetTop - scroll.scrollTop) <= 1) return;

    const requestFrame = global.requestAnimationFrame || ((callback) => global.setTimeout(() => callback(Date.now()), 16));
    const startTop = scroll.scrollTop;
    const distance = targetTop - startTop;
    const duration = 340;
    const startTime = global.performance?.now?.() || Date.now();
    const scrollStep = (now) => {
      const elapsed = Math.min(1, (now - startTime) / duration);
      const eased = .5 - Math.cos(Math.PI * elapsed) / 2;
      const maximum = Math.max(0, scroll.scrollHeight - scroll.clientHeight);
      scroll.scrollTop = Math.min(startTop + distance * eased, maximum);
      if (elapsed < 1) requestFrame(scrollStep);
    };

    // The section's height expands over the same 260ms. Scrolling every frame
    // avoids the browser clamping a one-off scroll before that new height exists.
    requestFrame(scrollStep);
  }

  function toggleSidebarSection(control) {
    const section = control?.closest?.("[data-ui-sidebar-section]");
    if (!section) return false;
    const next = !section.classList.contains("is-open");
    const list = section.querySelector(".ui-sidebar__section-list");
    const scroll = section.closest(".ui-sidebar__scroll");
    const targetTop = next ? sidebarSectionOpenScrollTarget(section, list) : null;
    if (next && list) list.style.setProperty("--ui-sidebar-section-height", `${list.scrollHeight}px`);
    section.classList.toggle("is-open", next);
    control.setAttribute("aria-expanded", String(next));
    if (list) {
      if (next) list.removeAttribute("aria-hidden");
      else list.setAttribute("aria-hidden", "true");
      list.toggleAttribute("inert", !next);
    }
    if (next && scroll) scrollSidebarSectionIntoView(section, list, targetTop);
    return next;
  }

  function closeSidebarMore(control) {
    const root = sidebarRoot(control);
    const wrappers = root ? root.querySelectorAll("[data-ui-sidebar-more].is-open") : global.document?.querySelectorAll?.("[data-ui-sidebar-more].is-open") || [];
    wrappers.forEach((wrapper) => {
      wrapper.classList.remove("is-open");
      wrapper.querySelector("[data-demo=ui-sidebar-more]")?.setAttribute("aria-expanded", "false");
    });
  }

  function toggleSidebarMore(control) {
    const root = sidebarRoot(control);
    const wrapper = control?.closest?.("[data-ui-sidebar-more]");
    if (!root || !wrapper || control.disabled) return false;
    if (root.classList.contains("is-collapsed")) setSidebarCollapsed(root, false);
    global.clearTimeout?.(wrapper.moreCloseTimer);
    const next = !wrapper.classList.contains("is-open");
    closeSidebarMore(root);
    wrapper.classList.toggle("is-open", next);
    control.setAttribute("aria-expanded", String(next));
    if (next) positionSidebarMore(root, wrapper, control);
    return next;
  }

  /* The menu opens under the More row, but it cannot be positioned against it:
     the row lives inside .ui-sidebar__scroll, and a menu whose containing block
     is inside a scroll container gets clipped by it. So the containing block
     stays the rail — which is why this used to sit at a fixed `bottom: 80px`,
     pinned above the footer no matter where More was — and the offset is
     measured instead. Flips above the row when there is not room below. */
  function positionSidebarMore(root, wrapper, control) {
    const menu = wrapper.querySelector(".ui-sidebar__more-menu");
    if (!menu || !root.getBoundingClientRect) return;
    const rail = root.getBoundingClientRect();
    const row = control.getBoundingClientRect();
    const gap = 4;
    const below = row.bottom - rail.top + gap;
    const height = menu.offsetHeight || 0;
    const footer = root.querySelector(".ui-sidebar__footer");
    const floor = (footer ? footer.getBoundingClientRect().top : rail.bottom) - rail.top - gap;
    const above = row.top - rail.top - gap - height;
    menu.style.bottom = "auto";
    menu.style.top = (below + height > floor && above > 0 ? above : below) + "px";
  }

  function cancelSidebarMoreClose(control) {
    const wrapper = control?.closest?.("[data-ui-sidebar-more]");
    if (wrapper) global.clearTimeout?.(wrapper.moreCloseTimer);
  }

  function scheduleSidebarMoreClose(control) {
    const wrapper = control?.closest?.("[data-ui-sidebar-more]");
    if (!wrapper || !wrapper.classList.contains("is-open")) return;
    global.clearTimeout?.(wrapper.moreCloseTimer);
    wrapper.moreCloseTimer = global.setTimeout?.(() => closeSidebarMore(wrapper), 300);
  }

  function statistic(props = {}) {
    assertProps("statistic", props);
    const { title = "", value = "", prefix = "", suffix = "", description = "", loading = false, ariaLabel = "", demo = "" } = props;
    enumValue("statistic", "loading", loading);
    if (!title && !ariaLabel) throw new Error("statistic requires a title or ariaLabel");
    if (!loading && value === "") throw new Error("statistic requires a value unless loading");
    const readableValue = `${prefix}${value}${suffix}`;
    const label = ariaLabel || (loading ? [title, "Loading"].filter(Boolean).join(", ") : [title, readableValue, description].filter(Boolean).join(", "));
    const amount = loading
      ? '<span class="ui-statistic__skeleton ui-statistic__skeleton--value" aria-hidden="true"></span>'
      : `<strong class="ui-statistic__value">${prefix ? `<span class="ui-statistic__prefix">${escapeHTML(prefix)}</span>` : ""}${escapeHTML(value)}${suffix ? `<span class="ui-statistic__suffix">${escapeHTML(suffix)}</span>` : ""}</strong>`;
    const supporting = loading
      ? '<span class="ui-statistic__skeleton ui-statistic__skeleton--description" aria-hidden="true"></span>'
      : (description ? `<small class="ui-statistic__description">${escapeHTML(description)}</small>` : "");
    return `<section class="ui-statistic${loading ? " is-loading" : ""}" data-component="statistic" role="group" aria-label="${escapeHTML(label)}"${loading ? ' aria-busy="true"' : ""}${demo ? ` data-demo="${escapeHTML(demo)}"` : ""}><span class="ui-statistic__title">${escapeHTML(title)}</span>${amount}${supporting}</section>`;
  }

  function table(props = {}) {
    assertProps("table", props);
    const { id = "", columns = [], rows = [], caption = "", density = "default", loading = false, empty = "", ariaLabel = "", demo = "" } = props;
    enumValue("table", "density", density);
    enumValue("table", "loading", loading);
    if (!Array.isArray(columns) || columns.length === 0) throw new Error("table.columns must be a non-empty array");
    if (!Array.isArray(rows)) throw new Error("table.rows must be an array");
    const tableId = id || `table-${String(ariaLabel || caption || "data").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    const readableLabel = ariaLabel || caption || "Data table";
    const renderHeader = (column) => {
      const { id: columnId = "", label = "", align = "left" } = column || {};
      if (!columnId) throw new Error("table columns require id");
      if (!['left', 'center', 'right'].includes(align)) throw new Error(`table column ${columnId} has unsupported alignment`);
      return `<th scope="col" class="ui-table__head is-${align}" data-table-column="${escapeHTML(columnId)}">${escapeHTML(label)}</th>`;
    };
    const renderRow = (row) => {
      const { id: rowId = "", cells = [] } = row || {};
      if (!rowId || !Array.isArray(cells) || cells.length !== columns.length) throw new Error("table rows require an id and one cell for each column");
      const cellsMarkup = cells.map((cell, index) => {
        const { content = "", rowHeader = false, align = columns[index]?.align || "left" } = cell || {};
        if (!['left', 'center', 'right'].includes(align)) throw new Error(`table cell ${rowId}:${index} has unsupported alignment`);
        const tag = rowHeader ? "th" : "td";
        const scope = rowHeader ? ' scope="row"' : "";
        return `<${tag} class="ui-table__cell is-${align}"${scope}>${content}</${tag}>`;
      }).join("");
      return `<tr data-table-row="${escapeHTML(rowId)}">${cellsMarkup}</tr>`;
    };
    const skeletonRows = Array.from({ length: 3 }, (_, index) => `<tr data-table-row="loading-${index}">${columns.map((column) => `<td class="ui-table__cell is-${column.align || "left"}"><span class="ui-table__skeleton" aria-hidden="true"></span></td>`).join("")}</tr>`).join("");
    const emptyRow = `<tr><td class="ui-table__empty" colspan="${columns.length}">${escapeHTML(empty || "No results")}</td></tr>`;
    const body = loading ? skeletonRows : (rows.length ? rows.map(renderRow).join("") : emptyRow);
    return `<section class="ui-table ui-table--${density}" id="${escapeHTML(tableId)}" data-component="table" role="region" aria-label="${escapeHTML(readableLabel)}"${loading ? ' aria-busy="true"' : ""}${demo ? ` data-demo="${escapeHTML(demo)}"` : ""}><div class="ui-table__scroll"><table>${caption ? `<caption class="ui-table__caption">${escapeHTML(caption)}</caption>` : ""}<thead><tr>${columns.map(renderHeader).join("")}</tr></thead><tbody>${body}</tbody></table></div></section>`;
  }

  function timeline(props = {}) {
    assertProps("timeline", props);
    const { id = "", items = [], layout = "left", reverse = false, tone = "", ariaLabel = "", demo = "" } = props;
    enumValue("timeline", "layout", layout);
    enumValue("timeline", "reverse", reverse);
    if (tone) enumValue("timeline", "tone", tone);
    if (!Array.isArray(items) || items.length === 0) throw new Error("timeline.items must be a non-empty array");
    const timelineId = id || `timeline-${String(ariaLabel || "events").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    const readableLabel = ariaLabel || "Timeline";
    const hasLabels = layout !== "alternate" && items.some((item) => item?.label);
    const orderedItems = reverse ? [...items].reverse() : items;
    const renderItem = (item, index) => {
      const { id: itemId = "", title = "", description = "", label = "", tone: itemTone = "default", dot = "" } = item || {};
      if (!itemId || !title) throw new Error("timeline items require an id and title");
      const resolvedTone = tone || itemTone;
      if (!["default", "info", "success", "warning", "error", "pending"].includes(resolvedTone)) throw new Error(`timeline item ${itemId} has unsupported tone`);
      if (dot && !approvedAsset(dot)) throw new Error(`Unapproved asset: ${dot}`);
      const isLeft = layout === "alternate" && index % 2 === 0;
      const dotMarkup = dot ? icon(dot, "ui-timeline__dot-icon") : "";
      const labelMarkup = label ? `<span class="ui-timeline__label">${escapeHTML(label)}</span>` : "";
      const copyLabel = layout === "alternate" ? labelMarkup : "";
      return `<li class="ui-timeline__item${isLeft ? " is-left" : ""}" data-timeline-item="${escapeHTML(itemId)}">${layout !== "alternate" ? labelMarkup : ""}<span class="ui-timeline__dot ui-timeline__dot--${resolvedTone}${dot ? " has-custom-dot" : ""}" aria-hidden="true">${dotMarkup}</span><div class="ui-timeline__copy">${copyLabel}<strong>${escapeHTML(title)}</strong>${description ? `<span>${escapeHTML(description)}</span>` : ""}</div></li>`;
    };
    return `<section class="ui-timeline ui-timeline--${layout}${hasLabels ? " has-labels" : ""}" id="${escapeHTML(timelineId)}" data-component="timeline" data-ui-timeline data-timeline-reversed="${reverse}"${tone ? ` data-timeline-tone="${escapeHTML(tone)}"` : ""} role="region" aria-label="${escapeHTML(readableLabel)}"${demo ? ` data-demo="${escapeHTML(demo)}"` : ""}><ol class="ui-timeline__list">${orderedItems.map(renderItem).join("")}</ol></section>`;
  }

  function setTimelineReverse(control, reverse) {
    const root = control?.closest?.("[data-ui-timeline]") || control?.querySelector?.("[data-ui-timeline]");
    if (!root) return;
    const shouldReverse = typeof reverse === "boolean" ? reverse : root.dataset.timelineReversed !== "true";
    const currentlyReversed = root.dataset.timelineReversed === "true";
    if (shouldReverse === currentlyReversed) return;
    const list = root.querySelector(".ui-timeline__list");
    if (!list) return;
    list.replaceChildren(...Array.from(list.children).reverse());
    root.dataset.timelineReversed = String(shouldReverse);
  }

  function setTimelineTone(control, tone) {
    const root = control?.closest?.("[data-ui-timeline]") || control?.closest?.(".component-doc-block")?.querySelector?.("[data-ui-timeline]") || control?.querySelector?.("[data-ui-timeline]");
    if (!root) return false;
    if (!["default", "info", "success", "warning", "error"].includes(tone)) throw new Error(`timeline has unsupported tone: ${tone}`);
    root.querySelectorAll(".ui-timeline__dot").forEach((dot) => {
      dot.classList.remove("ui-timeline__dot--default", "ui-timeline__dot--info", "ui-timeline__dot--success", "ui-timeline__dot--warning", "ui-timeline__dot--error", "ui-timeline__dot--pending");
      dot.classList.add(`ui-timeline__dot--${tone}`);
    });
    root.dataset.timelineTone = tone;
    return true;
  }

  function topNav(props = {}) {
    assertProps("top-nav", props);
    const {
      id = "", variant = "custom", leading = "", center = "", trailing = "",
      contextLabel = "", contextFlag = "", contextOptions = [],
      searchPlaceholder = "Search", searchFilterLabel = "Filter",
      actionLabel = "Book lessons", actionIcon = "nav-plus",
      ariaLabel = "Top navigation", sticky = true, demo = "",
    } = props;
    enumValue("top-nav", "sticky", sticky);
    enumValue("top-nav", "variant", variant);
    /* The two bars italki actually ships have names — the Catalog lists
       global-default and teacher-search among this component's required states
       — but they existed only as a recipe the Catalog route followed by hand:
       call topNavContext, call topNavSearch, call button, thread three HTML
       strings back through the slots. Every consumer had to rediscover the
       recipe, and the ones that got it wrong shipped an empty bar. The two are
       variants now; the difference between them is the whole of it, so it is
       written once here rather than in each page.

         global-default   compact context, search without a filter
         teacher-search   labelled context, search with a filter

       `custom` keeps the slots-only behaviour, and a slot still wins wherever
       one is given, so arbitrary content stays arbitrary. */
    /* `custom` means "I am filling the slots myself". A page that passes the
       context options, the placeholder and the action label has plainly not
       done that — it has handed over the data and expects the bar. Refusing to
       compose because the variant was left unwritten is the component playing
       dumb, and what it produced was an empty bar with no error to explain it. */
    const navId = id || `top-nav-${String(ariaLabel).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    const hasBarData = Boolean(contextLabel || contextOptions.length || searchPlaceholder !== "Search" || actionLabel !== "Book lessons");
    const composed = variant !== "custom" || (hasBarData && !leading && !center && !trailing);
    const searchBar = variant === "teacher-search";
    const contextSelected = contextOptions.find((option) => option && option.label === contextLabel)
      || contextOptions[0]
      || (contextLabel ? { id: "context", label: contextLabel, flag: contextFlag } : null);
    const leadingContent = leading || (composed && contextSelected
      ? topNavContext({
          /* Same reason as the search field below: this derived its id from its
             aria-label, which is the same on every nav, so two navs on one page
             published the same id twice — and the trigger's aria-controls then
             pointed at an ambiguous target. */
          id: `${navId}-context`,
          mode: searchBar ? "labelled" : "compact",
          selected: contextSelected,
          options: contextOptions.length ? contextOptions : [contextSelected],
        })
      : "");
    /* The search element used to derive its own id from its placeholder, so two
       navs asking for the same placeholder produced the same id twice on one
       page — id has to be unique, and a duplicate breaks label association and
       fragment links. Derived from the nav that owns it instead. */
    const centerContent = center || (composed
      ? topNavSearch({ id: `${navId}-search`, placeholder: searchPlaceholder, filter: searchBar, filterLabel: searchFilterLabel })
      : "");
    const trailingContent = trailing || (composed
      ? button({ label: actionLabel, variant: "emphasis", size: 40, shape: "pill", leadingIcon: actionIcon })
      : "");
    return `<header class="ui-top-nav${sticky ? "" : " is-flow"}" id="${escapeHTML(navId)}" data-component="top-nav" data-ui-top-nav aria-label="${escapeHTML(ariaLabel)}"${demo ? ` data-demo="${escapeHTML(demo)}"` : ""}><div class="ui-top-nav__leading">${leadingContent}</div><div class="ui-top-nav__center">${centerContent}</div><div class="ui-top-nav__trailing">${trailingContent}</div></header>`;
  }

  function topNavContext(props = {}) {
    assertProps("top-nav", props, "context");
    const { id = "", mode = "labelled", selected = {}, options = [], open = false, ariaLabel = "Navigation context", demo = "" } = props;
    enumValue("top-nav", "mode", mode, "context");
    enumValue("top-nav", "open", open, "context");
    if (!Array.isArray(options) || options.length === 0) throw new Error("top-nav.context.options must be a non-empty array");
    const contextId = id || `top-nav-context-${String(ariaLabel).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    const current = typeof selected === "string" ? { id: selected, label: selected, flag: "" } : selected;
    if (!current?.label || !current?.flag) throw new Error("top-nav.context.selected requires label and flag");
    if (!approvedAsset(current.flag)) throw new Error(`Unapproved asset: ${current.flag}`);
    const contextOptions = options.map((option) => {
      const { id: optionId = "", label = "", flag = "" } = option || {};
      if (!optionId || !label || !flag) throw new Error("top-nav.context options require id, label, and flag");
      if (!approvedAsset(flag)) throw new Error(`Unapproved asset: ${flag}`);
      return `<button class="ui-top-nav-context__option" type="button" role="menuitem" data-demo="ui-top-nav-context-option" data-context-label="${escapeHTML(label)}" data-context-flag="${escapeHTML(flag)}">${icon(flag, "ui-top-nav-context__option-flag")}<span>${escapeHTML(label)}</span></button>`;
    }).join("");
    return `<div class="ui-top-nav-context ui-top-nav-context--${mode}" id="${escapeHTML(contextId)}" data-ui-top-nav-context data-component="top-nav-context"><button class="ui-top-nav-context__trigger" type="button" data-demo="ui-top-nav-context" aria-expanded="${open}" aria-haspopup="menu" aria-controls="${escapeHTML(contextId)}-menu" aria-label="${escapeHTML(ariaLabel)}">${icon(current.flag, "ui-top-nav-context__flag")}${mode === "compact" ? "" : `<span class="ui-top-nav-context__label">${escapeHTML(current.label)}</span>`}${icon("Assets/Icons/arrow-down-sm.svg", "ui-top-nav-context__arrow")}</button><div class="ui-top-nav-context__menu${open ? " is-open" : ""}" id="${escapeHTML(contextId)}-menu" role="menu" aria-label="${escapeHTML(ariaLabel)}"${open ? "" : " aria-hidden=\"true\""}>${contextOptions}</div></div>`;
  }

  function setTopNavContextOpen(control, open) {
    const root = control?.closest?.("[data-ui-top-nav-context]") || control?.querySelector?.("[data-ui-top-nav-context]");
    if (!root) return;
    const shouldOpen = typeof open === "boolean" ? open : root.querySelector("[data-demo=ui-top-nav-context]")?.getAttribute("aria-expanded") !== "true";
    if (shouldOpen) closeTopNavContexts(root.ownerDocument);
    const trigger = root.querySelector("[data-demo=ui-top-nav-context]");
    const menu = root.querySelector("[role=menu]");
    if (!trigger || !menu) return;
    trigger.setAttribute("aria-expanded", String(shouldOpen));
    menu.classList.toggle("is-open", shouldOpen);
    menu.toggleAttribute("aria-hidden", !shouldOpen);
  }

  function closeTopNavContexts(scope = global.document) {
    scope?.querySelectorAll?.("[data-ui-top-nav-context]").forEach((root) => setTopNavContextOpen(root, false));
  }

  function selectTopNavContext(control) {
    const root = control?.closest?.("[data-ui-top-nav-context]");
    if (!root) return;
    const label = control.dataset.contextLabel || "";
    const flag = control.dataset.contextFlag || "";
    if (!label || !flag || !approvedAsset(flag)) return;
    const trigger = root.querySelector("[data-demo=ui-top-nav-context]");
    const triggerLabel = root.querySelector(".ui-top-nav-context__label");
    const triggerFlag = root.querySelector(".ui-top-nav-context__flag");
    if (triggerLabel) triggerLabel.textContent = label;
    if (triggerFlag) triggerFlag.src = flag;
    setTopNavContextOpen(root, false);
    trigger?.focus();
  }

  function topNavSearch(props = {}) {
    assertProps("top-nav", props, "search");
    const { id = "", value = "", placeholder = "Search", filter = false, filterLabel = "Filter", filterIcon = "Assets/Icons/filter-sliders.svg", filterCount = 0, filtered = false, clearable = true, disabled = false, state = "default", ariaLabel = "", demo = "" } = props;
    enumValue("top-nav", "filter", filter, "search");
    enumValue("top-nav", "filtered", filtered, "search");
    enumValue("top-nav", "clearable", clearable, "search");
    enumValue("top-nav", "disabled", disabled, "search");
    enumValue("top-nav", "state", disabled ? "disabled" : state, "search");
    if (!approvedAsset(filterIcon)) throw new Error(`Unapproved asset: ${filterIcon}`);
    const searchId = id || `top-nav-search-${String(ariaLabel || placeholder).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    const isDisabled = disabled || state === "disabled";
    const filterCopy = filtered ? `${filterLabel} · ${filterCount}` : filterLabel;
    const filterSlot = filter ? `<button class="ui-top-nav-search__filter${filtered ? " is-filtered" : ""}" type="button" data-demo="ui-top-nav-filter" data-filter-count="${escapeHTML(filterCount)}" data-filter-label="${escapeHTML(filterLabel)}" aria-pressed="${filtered}"${isDisabled ? " disabled" : ""}>${icon(filterIcon, "ui-top-nav-search__filter-icon")}<i aria-hidden="true"></i><span>${escapeHTML(filterCopy)}</span></button>` : "";
    const classes = ["ui-top-nav-search", value ? "has-query" : "", filtered ? "is-filtered" : "", state === "focus" ? "is-input-focused" : "", isDisabled ? "is-disabled" : ""].filter(Boolean).join(" ");
    return `<form class="${classes}" id="${escapeHTML(searchId)}" data-component="top-nav-search" data-ui-top-nav-search${demo ? ` data-demo="${escapeHTML(demo)}"` : ""} role="search"><img class="ui-top-nav-search__icon" src="Assets/Icons/search.svg" alt="" /><input class="ui-top-nav-search__input" type="text" value="${escapeHTML(value)}" placeholder="${escapeHTML(placeholder)}" aria-label="${escapeHTML(ariaLabel || placeholder)}" data-demo="ui-top-nav-search-input"${isDisabled ? " disabled" : ""} /><button class="ui-top-nav-search__clear" type="button" data-demo="ui-top-nav-search-clear" aria-label="Clear search"${clearable && value ? "" : " hidden"}${isDisabled ? " disabled" : ""}>${icon("Assets/Icons/16px/cross-sm.svg", "ui-top-nav-search__clear-icon")}</button>${filterSlot}</form>`;
  }

  function setTopNavSearchFocus(control, focused) {
    const root = control?.closest?.("[data-ui-top-nav-search]") || control?.querySelector?.("[data-ui-top-nav-search]");
    if (!root || root.classList.contains("is-disabled")) return;
    root.classList.toggle("is-input-focused", Boolean(focused));
  }

  function syncTopNavSearch(input) {
    const root = input?.closest?.("[data-ui-top-nav-search]");
    if (!root) return;
    const hasQuery = Boolean(input.value);
    root.classList.toggle("has-query", hasQuery);
    const clear = root.querySelector("[data-demo=ui-top-nav-search-clear]");
    if (clear) clear.hidden = !hasQuery;
  }

  function clearTopNavSearch(control) {
    const root = control?.closest?.("[data-ui-top-nav-search]");
    const input = root?.querySelector?.(".ui-top-nav-search__input");
    if (!input) return;
    input.value = "";
    syncTopNavSearch(input);
    input.focus();
  }

  function toggleTopNavFilter(control) {
    const filtered = !control.classList.contains("is-filtered");
    control.classList.toggle("is-filtered", filtered);
    control.setAttribute("aria-pressed", String(filtered));
    const label = control.dataset.filterLabel || "Filter";
    const count = control.dataset.filterCount || "0";
    const copy = control.querySelector("span");
    if (copy) copy.textContent = filtered ? `${label} · ${count}` : label;
  }

  function modal(props = {}) {
    assertProps("modal", props);
    const { id = "", title = "Dialog", body = "", footer = "", trigger, triggerLabel = "Open modal", open = false, size = "default", titleAlign = "start", stage = "demo", closable = true, maskClosable = true, keyboardClosable = true, demo = "" } = props;
    enumValue("modal", "size", size);
    enumValue("modal", "titleAlign", titleAlign);
    enumValue("modal", "stage", stage);
    const modalId = id || `modal-${String(title).toLowerCase().replace(/[^a-z0-9]+/g, "-") || "dialog"}`;
    /* Not passing a trigger asks for the default button; passing an empty one
       says the dialog is opened from somewhere else on the page. A filter that
       opens from the top nav has no trigger of its own, and the template had to
       hand-roll the entire modal to get rid of the button this used to insert
       unconditionally. Undefined and "" are different answers to the question. */
    const triggerMarkup = trigger === undefined
      ? button({ label: triggerLabel, variant: "secondary", demo: demo || "ui-modal-open", ariaExpanded: open, ariaControls: `${modalId}-dialog` })
      : trigger;
    const close = closable ? `<button class="ui-modal__close" type="button" data-demo="ui-modal-close" aria-label="Close dialog">${icon("Assets/Icons/cross.svg", "ui-modal__close-icon")}</button>` : "";
    const footerMarkup = footer ? `<footer class="ui-modal__footer">${footer}</footer>` : "";
    return `<div class="ui-modal-stage ui-modal-stage--${stage}${open ? " is-open" : ""}" id="${escapeHTML(modalId)}" data-component="modal" data-ui-modal data-mask-closable="${maskClosable}" data-keyboard-closable="${keyboardClosable}">${triggerMarkup}<div class="ui-modal__layer"${open ? "" : " aria-hidden=\"true\""}><button class="ui-modal__mask" type="button" data-demo="ui-modal-mask" aria-label="Close dialog"></button><section class="ui-modal ui-modal--${size}" id="${escapeHTML(modalId)}-dialog" role="dialog" aria-modal="true" aria-labelledby="${escapeHTML(modalId)}-title" tabindex="-1"><header class="ui-modal__header${titleAlign === "center" ? " is-title-centered" : ""}"><h3 id="${escapeHTML(modalId)}-title">${escapeHTML(title)}</h3>${close}</header><div class="ui-modal__body">${body}</div>${footerMarkup}</section></div></div>`;
  }

  function popup(props = {}) {
    assertProps("popup", props);
    const { id = "", title = "", body = "", actions = "", trigger = "", triggerLabel = "More details", open = false, placement = "bottom", triggerMode = "click", closeOnLeave = true, leaveDelay = 300, demo = "", ariaLabel = "" } = props;
    enumValue("popup", "placement", placement);
    enumValue("popup", "triggerMode", triggerMode);
    enumValue("popup", "closeOnLeave", closeOnLeave);
    enumValue("popup", "leaveDelay", leaveDelay);
    const popupId = id || `popup-${String(title || triggerLabel).toLowerCase().replace(/[^a-z0-9]+/g, "-") || "details"}`;
    const triggerMarkup = trigger || button({ label: triggerLabel, variant: "secondary", size: 32, shape: "pill", demo: demo || "ui-popup-toggle", ariaExpanded: open, ariaControls: `${popupId}-surface` });
    const titleMarkup = title ? `<h3 id="${escapeHTML(popupId)}-title">${escapeHTML(title)}</h3>` : "";
    const bodyMarkup = body ? `<p>${escapeHTML(body)}</p>` : "";
    const actionsMarkup = actions ? `<footer class="ui-popup__actions">${actions}</footer>` : "";
    const labelledBy = title ? ` aria-labelledby="${escapeHTML(popupId)}-title"` : ` aria-label="${escapeHTML(ariaLabel || triggerLabel)}"`;
    return `<div class="ui-popup${open ? " is-open" : ""}" id="${escapeHTML(popupId)}" data-component="popup" data-ui-popup data-popup-trigger-mode="${triggerMode}" data-close-on-leave="${closeOnLeave}" data-leave-delay="${leaveDelay}">${triggerMarkup}<section class="ui-popup__surface" id="${escapeHTML(popupId)}-surface" data-placement="${placement}" role="dialog"${labelledBy}${open ? "" : " aria-hidden=\"true\""}>${titleMarkup}${bodyMarkup}${actionsMarkup}</section></div>`;
  }

  function popconfirm(props = {}) {
    assertProps("popconfirm", props);
    const { id = "", title = "Confirm action?", description = "", trigger = "", triggerLabel = "Confirm", confirm = "", cancel = "", confirmLabel = "Confirm", cancelLabel = "Cancel", showCancel = true, open = false, placement = "bottom", disabled = false, loading = false, demo = "", ariaLabel = "" } = props;
    enumValue("popconfirm", "placement", placement);
    enumValue("popconfirm", "showCancel", showCancel);
    enumValue("popconfirm", "disabled", disabled);
    enumValue("popconfirm", "loading", loading);
    const popconfirmId = id || `popconfirm-${String(title).toLowerCase().replace(/[^a-z0-9]+/g, "-") || "action"}`;
    const triggerMarkup = trigger || button({ label: triggerLabel, variant: "secondary", size: 32, shape: "pill", disabled, demo: demo || "ui-popconfirm-toggle", ariaExpanded: open, ariaControls: `${popconfirmId}-surface` });
    const cancelMarkup = showCancel ? (cancel || button({ label: cancelLabel, variant: "secondary", size: 32, shape: "pill", demo: "ui-popconfirm-close" })) : "";
    const confirmMarkup = confirm || button({ label: confirmLabel, variant: "danger", size: 32, shape: "pill", disabled: disabled || loading, loading, demo: "ui-popconfirm-close" });
    const descriptionMarkup = description ? `<p>${escapeHTML(description)}</p>` : "";
    const labelledBy = title ? ` aria-labelledby="${escapeHTML(popconfirmId)}-title"` : ` aria-label="${escapeHTML(ariaLabel || triggerLabel)}"`;
    return `<div class="ui-popconfirm${open ? " is-open" : ""}${disabled ? " is-disabled" : ""}" id="${escapeHTML(popconfirmId)}" data-component="popconfirm" data-ui-popconfirm data-loading="${loading}">${triggerMarkup}<section class="ui-popconfirm__surface" id="${escapeHTML(popconfirmId)}-surface" data-placement="${placement}" role="alertdialog"${labelledBy}${open ? "" : " aria-hidden=\"true\""}><h3 id="${escapeHTML(popconfirmId)}-title">${escapeHTML(title)}</h3>${descriptionMarkup}<footer class="ui-popconfirm__actions">${cancelMarkup}${confirmMarkup}</footer></section></div>`;
  }

  function slider(props = {}) {
    assertProps("slider", props);
    const { value = 0, label = "Slider", disabled = false, tooltip = false, reversed = false, state = "default" } = props;
    enumValue("slider", "orientation", "horizontal");
    enumValue("slider", "mode", "single");
    enumValue("slider", "state", disabled ? "disabled" : state);
    const classes = ["ui-slider", tooltip ? "has-tooltip" : "", reversed ? "is-reversed" : "", state === "hover" ? "is-hover" : "", state === "focus" ? "is-focus" : "", disabled ? "is-disabled" : ""].filter(Boolean).join(" ");
    return `<div class="${classes}" data-component="slider"><div class="ui-slider__row"><span class="ui-slider__control" style="--ui-slider-progress:${Number(value)}%"><input class="${reversed ? "is-reversed" : ""}" type="range" min="0" max="100" value="${Number(value)}" data-demo="ui-slider" aria-label="${escapeHTML(label)}"${disabled ? " disabled" : ""}/>${tooltip ? `<output class="ui-slider__tooltip">${Number(value)}</output>` : ""}</span><output class="ui-slider__value" data-slider-value>${Number(value)}</output></div></div>`;
  }

  function sliderRange(props = {}) {
    assertProps("slider", props, "range");
    const { lower = 20, upper = 70, label = "Range" } = props;
    const start = Number(lower);
    const end = Number(upper);
    return `<div class="ui-slider" data-component="slider"><div class="ui-slider__row"><span class="ui-slider__range" data-slider-range style="--ui-slider-range-start:${start}%;--ui-slider-range-end:${end}%"><input type="range" min="0" max="100" value="${start}" data-demo="ui-slider-range" data-range-handle="lower" aria-label="Minimum ${escapeHTML(label)}" /><input type="range" min="0" max="100" value="${end}" data-demo="ui-slider-range" data-range-handle="upper" aria-label="Maximum ${escapeHTML(label)}" /></span><output class="ui-slider__value ui-slider__value--range" data-range-value>${start}–${end}</output></div></div>`;
  }

  function sliderVertical(props = {}) {
    assertProps("slider", props, "vertical");
    const { value = 0, label = "Vertical slider", disabled = false } = props;
    enumValue("slider", "orientation", "vertical");
    return `<div class="ui-slider-vertical" data-component="slider"><span class="ui-slider-vertical__control" style="--ui-slider-progress:${Number(value)}%"><input type="range" min="0" max="100" value="${Number(value)}" data-demo="ui-slider" aria-label="${escapeHTML(label)}"${disabled ? " disabled" : ""}/></span><output data-slider-value>${Number(value)}</output></div>`;
  }

  function panel(props = {}) {
    assertProps("panel", props);
    const { title = "", body = "", extra = "", divider = false, density = "medium" } = props;
    enumValue("panel", "density", density);
    enumValue("panel", "divider", divider);
    const header = title || extra ? `<header class="ui-panel__header">${title ? `<span>${escapeHTML(title)}</span>` : ""}${extra}</header>` : "";
    return `<section class="ui-panel ui-panel--${density}${divider && header ? " has-divider" : ""}" data-component="panel">${header}<div class="ui-panel__body">${body}</div></section>`;
  }

  function search(props = {}) {
    assertProps("search", props);
    const { id = "", value = "", placeholder = "Search", size = 40, shape = "pill", state = "default", clearable = false, disabled = false } = props;
    enumValue("search", "size", size);
    enumValue("search", "shape", shape);
    enumValue("search", "state", disabled ? "disabled" : state);
    const classes = ["ui-search", `ui-search--${size}`, `ui-search--${shape}`, state === "hover" ? "is-hover" : "", state === "focus" ? "is-focus" : "", disabled ? "is-disabled" : ""].filter(Boolean).join(" ");
    return `<div class="${classes}" data-component="search">${icon("Assets/Icons/16px/search-sm.svg", "ui-search__icon")}<input${id ? ` id="${escapeHTML(id)}"` : ""} type="search" value="${escapeHTML(value)}" placeholder="${escapeHTML(placeholder)}" aria-label="${escapeHTML(placeholder)}"${disabled ? " disabled" : ""} />${clearable ? `<button class="ui-search__clear" type="button" data-demo="ui-search-clear" aria-label="Clear search"${value ? "" : " hidden"}>${icon("Assets/Icons/16px/cross-sm.svg", "ui-search__clear-icon")}</button>` : ""}</div>`;
  }

  const normalizeSelectOption = (option) => typeof option === "string" ? { label: option, value: option } : { label: option?.label || "", value: option?.value || option?.label || "", disabled: Boolean(option?.disabled) };
  const selectOptionsFromProps = ({ options = [], groups = [] }) => groups.length ? groups.flatMap((group) => group.options || []) : options;
  const selectValueTags = (values) => values.map((value) => tag({ label: value, value, removable: true, removeDemo: "ui-select-remove" })).join("");

  function select(props = {}) {
    assertProps("select", props);
    const {
      id = "select",
      label = "Select an option",
      placeholder = "Select an option",
      options = [],
      groups = [],
      selected = [],
      mode = "single",
      size = 40,
      shape = "default",
      status = "default",
      state = "default",
      clearable = false,
      searchable = false,
      query = "",
      disabled = false,
      loading = false,
      open = false
    } = props;
    enumValue("select", "mode", mode);
    enumValue("select", "size", size);
    enumValue("select", "shape", shape);
    enumValue("select", "status", status);
    enumValue("select", "state", loading ? "loading" : (disabled ? "disabled" : state));
    const values = (Array.isArray(selected) ? selected : [selected]).filter(Boolean).map(String);
    const resolvedShape = resolveControlShape(size, shape);
    const normalizedOptions = selectOptionsFromProps({ options, groups }).map(normalizeSelectOption);
    const normalizedQuery = String(query).trim().toLowerCase();
    const matchesQuery = (option) => !normalizedQuery || String(option.label).toLowerCase().includes(normalizedQuery);
    const renderOption = (option) => {
      const isSelected = values.includes(String(option.value));
      return `<button class="ui-select__option${isSelected ? " is-selected" : ""}${matchesQuery(option) ? "" : " is-filtered"}" type="button" role="option" aria-selected="${isSelected}" data-demo="ui-select-option" data-select-value="${escapeHTML(option.value)}" data-select-label="${escapeHTML(option.label)}"${option.disabled ? " disabled" : ""}><span>${escapeHTML(option.label)}</span>${isSelected ? icon("Assets/Icons/confirm-sm.svg", "ui-select__option-check") : ""}</button>`;
    };
    const menuOptions = groups.length
      ? groups.map((group) => {
        const groupOptions = (group.options || []).map(normalizeSelectOption);
        return `<div class="ui-select__group" data-select-group${groupOptions.some(matchesQuery) ? "" : " hidden"}><p>${escapeHTML(group.label || "")}</p>${groupOptions.map(renderOption).join("")}</div>`;
      }).join("")
      : normalizedOptions.map(renderOption).join("");
    const hasVisibleOptions = normalizedOptions.some(matchesQuery);
    const selection = mode === "multiple"
      ? `<span class="ui-select__values" data-ui-select-values>${values.length ? selectValueTags(values) : `<span class="ui-select__placeholder">${escapeHTML(placeholder)}</span>`}</span>`
      : `<span class="${values[0] ? "ui-select__value" : "ui-select__placeholder"}" data-ui-select-single>${escapeHTML(values[0] || placeholder)}</span>`;
    const unavailable = disabled || loading || state === "disabled" || state === "loading";
    const classes = ["ui-select", `ui-select--${size}`, `ui-select--${resolvedShape}`, status !== "default" ? `is-${status}` : "", state === "hover" ? "is-hover" : "", state === "focus" ? "is-focus" : "", unavailable ? "is-disabled" : "", loading ? "is-loading" : "", open ? "is-open" : ""].filter(Boolean).join(" ");
    const clear = clearable && !loading ? `<button class="ui-select__clear" type="button" data-demo="ui-select-clear" aria-label="Clear selection"${values.length ? "" : " hidden"}>${icon("Assets/Icons/16px/cross-sm.svg", "ui-select__clear-icon")}</button>` : "";
    const suffix = loading ? '<span class="ui-select__loading" aria-hidden="true"></span>' : icon("Assets/Icons/arrow-down-sm.svg", "ui-select__suffix");
    return `<div class="${classes}" data-component="select" data-select-mode="${mode}" data-select-placeholder="${escapeHTML(placeholder)}"><div class="ui-select__trigger" tabindex="${unavailable ? "-1" : "0"}" data-demo="ui-select-trigger" role="combobox" aria-label="${escapeHTML(label)}" aria-haspopup="listbox" aria-expanded="${open}" aria-controls="${escapeHTML(id)}-menu" aria-disabled="${unavailable}">${selection}${clear}${suffix}</div><div class="ui-select__menu" id="${escapeHTML(id)}-menu" role="listbox"${mode === "multiple" ? ' aria-multiselectable="true"' : ""}>${searchable ? `<label class="ui-select__search">${icon("Assets/Icons/16px/search-sm.svg", "ui-select__search-icon")}<input type="search" value="${escapeHTML(String(query))}" data-demo="ui-select-search" placeholder="Search options" aria-label="Search options" /></label>` : ""}${menuOptions}<p class="ui-select__empty" data-ui-select-empty${hasVisibleOptions ? " hidden" : ""}>No options found.</p></div></div>`;
  }

  function switchControl(props = {}) {
    assertProps("switch", props);
    const { checked = false, disabled = false, state = "default", demo = "", label = "Toggle" } = props;
    const isDisabled = disabled || state === "disabled";
    enumValue("switch", "state", isDisabled ? "disabled" : state);
    const classes = ["ui-switch", checked ? "is-checked" : "", !isDisabled && state === "hover" ? "is-hover" : "", isDisabled ? "is-disabled" : ""].filter(Boolean).join(" ");
    return `<button class="${classes}" type="button" role="switch" aria-checked="${checked}" aria-label="${escapeHTML(label)}" data-component="switch"${demo ? ` data-demo="${escapeHTML(demo)}"` : ""}${isDisabled ? " disabled" : ""}></button>`;
  }

  function setCheckboxValue(control, value) {
    enumValue("checkbox", "checked", value);
    if (!control) return;
    control.dataset.value = value;
    control.classList.remove("value-off", "value-on", "value-mixed");
    control.classList.add(`value-${value}`);
    control.setAttribute("aria-checked", value === "mixed" ? "mixed" : String(value === "on"));
  }

  const checkboxGroupItems = (group) => [...(group?.querySelectorAll?.('[data-demo="ui-checkbox-group-item"]') || [])];

  function syncCheckboxGroup(group) {
    if (!group) return;
    const items = checkboxGroupItems(group).filter((item) => !item.disabled);
    const selectedCount = items.filter((item) => item.dataset.value === "on").length;
    const all = group.querySelector('[data-demo="ui-checkbox-group-all"]');
    if (all) setCheckboxValue(all, selectedCount === 0 ? "off" : (selectedCount === items.length ? "on" : "mixed"));
    const count = group.querySelector("[data-ui-checkbox-group-count]");
    if (count) count.textContent = `${selectedCount} selected`;
  }

  function toggleCheckboxGroup(control) {
    const group = control?.closest?.("[data-ui-checkbox-group]");
    if (!group || control.disabled) return false;
    if (control.dataset.demo === "ui-checkbox-group-all") {
      const next = control.dataset.value === "on" ? "off" : "on";
      checkboxGroupItems(group).filter((item) => !item.disabled).forEach((item) => setCheckboxValue(item, next));
    } else {
      setCheckboxValue(control, control.dataset.value === "on" ? "off" : "on");
    }
    syncCheckboxGroup(group);
    return true;
  }

  const radioControls = (group) => [...(group?.querySelectorAll?.('[data-component="radio"]') || [])];

  function syncSelectionGroup(group) {
    group?.querySelectorAll?.('[data-component="selection"]').forEach((item) => {
      item.classList.toggle("is-selected", item.querySelector('[data-component="radio"]')?.getAttribute("aria-checked") === "true");
    });
  }

  function selectRadio(control) {
    const group = control?.closest?.("[data-ui-radio-group]");
    if (!group || control.disabled) return false;
    radioControls(group).forEach((item) => {
      const selected = item === control;
      item.classList.toggle("is-checked", selected);
      item.setAttribute("aria-checked", String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    syncSelectionGroup(group);
    return true;
  }

  const selectionCards = (group) => [...(group?.querySelectorAll?.('[data-component="selection"]') || [])];

  function setSelectionCardState(control, selected) {
    if (!control) return;
    control.classList.toggle("is-selected", Boolean(selected));
    control.setAttribute("aria-checked", String(Boolean(selected)));
    if (control.dataset.selectionMode === "radio") control.tabIndex = selected ? 0 : -1;
  }

  function toggleSelectionCard(control) {
    if (!control || control.disabled) return false;
    const group = control.closest("[data-ui-selection-group]");
    const mode = control.dataset.selectionMode || group?.dataset.selectionMode || "radio";
    if (mode === "radio") {
      const cards = group ? selectionCards(group) : [control];
      cards.forEach((item) => setSelectionCardState(item, item === control));
      return true;
    }
    const next = !control.classList.contains("is-selected");
    setSelectionCardState(control, next);
    return next;
  }

  function toggleLessonOptions(control) {
    if (!control || control.disabled) return false;
    const list = control.closest("[data-ui-lesson-options]");
    if (!list) return false;
    const card = control.closest("[data-lesson-course-card]");
    const shouldExpand = !card?.classList.contains("is-expanded");
    list.querySelectorAll("[data-lesson-course-card]").forEach((item) => {
      const expanded = shouldExpand && item === card;
      item.classList.toggle("is-expanded", expanded);
      const toggle = item.querySelector("[data-demo=ui-lesson-toggle]");
      const options = item.querySelector("[data-ui-selection-group]");
      toggle?.classList.toggle("is-selected", expanded);
      toggle?.setAttribute("aria-expanded", String(expanded));
      toggle?.setAttribute("aria-checked", String(expanded));
      if (options) {
        options.classList.toggle("is-collapsed", !expanded);
        options.setAttribute("aria-hidden", String(!expanded));
        options.inert = !expanded;
      }
    });
    return true;
  }

  function handleSelectionCardKeydown(event) {
    const control = event.target?.closest?.('[data-demo="ui-selection-card"]');
    if (!control || control.dataset.selectionMode !== "radio" || !["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"].includes(event.key)) return false;
    const group = control.closest("[data-ui-selection-group]");
    const cards = selectionCards(group).filter((item) => !item.disabled);
    const current = cards.indexOf(control);
    if (current < 0 || cards.length < 2) return false;
    event.preventDefault();
    const direction = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
    const next = cards[(current + direction + cards.length) % cards.length];
    toggleSelectionCard(next);
    next.focus();
    return true;
  }

  const datePickerRoot = (element) => element?.closest?.("[data-ui-date-picker]");
  const readDatePickerMonths = (picker) => {
    try { return JSON.parse(picker?.dataset?.dateMonths || "[]"); } catch { return []; }
  };
  const readDatePickerValues = (picker) => {
    try { return JSON.parse(picker?.dataset?.dateValues || "[]"); } catch { return []; }
  };

  function setDatePickerOpen(trigger, open) {
    const picker = datePickerRoot(trigger);
    if (!picker || picker.classList.contains("is-disabled")) return false;
    picker.classList.toggle("is-open", Boolean(open));
    const button = picker.querySelector('[data-demo="ui-date-toggle"]') || picker.querySelector(".ui-date-picker__trigger");
    button?.setAttribute("aria-expanded", String(Boolean(open)));
    const suffix = button?.querySelector(".ui-date-picker__suffix-icon");
    /* Through withBase, like everything else the runtime emits. A raw
       page-relative path is correct for the Catalog and wrong on a card three
       folders down, and this one is assigned after render — so the generator,
       which rebases the markup it captures, never sees it. The arrow was fine
       until the picker had been opened once, and then it was a broken image. */
    if (suffix) suffix.src = withBase(open ? "Assets/Icons/arrow-up-sm.svg" : "Assets/Icons/arrow-down-sm.svg");
    return true;
  }

  function toggleDatePicker(trigger) {
    const picker = datePickerRoot(trigger);
    return setDatePickerOpen(trigger, !picker?.classList.contains("is-open"));
  }

  function syncDatePicker(picker) {
    if (!picker) return;
    const months = readDatePickerMonths(picker);
    const monthIndex = Number(picker.dataset.dateMonthIndex || 0);
    const activeMonth = months[monthIndex] || {};
    const days = normalizeDateDays(activeMonth.days || []);
    const values = readDatePickerValues(picker);
    picker.querySelector("[data-ui-date-month]")?.replaceChildren(activeMonth.label || "Calendar");
    const grid = picker.querySelector("[data-ui-date-grid]");
    if (grid) grid.innerHTML = datePickerGrid(days, values);
    const previous = picker.querySelector('[data-demo="ui-date-previous"]');
    const next = picker.querySelector('[data-demo="ui-date-next"]');
    if (previous) previous.disabled = monthIndex <= 0;
    if (next) next.disabled = monthIndex >= months.length - 1;
    const dateLabel = picker.querySelector("[data-ui-date-label]");
    if (dateLabel) {
      dateLabel.replaceChildren(datePickerLabel(days, values, "Choose a date"));
      dateLabel.classList.toggle("ui-date-picker__placeholder", values.length === 0);
    }
  }

  function navigateDatePicker(control, direction) {
    const picker = datePickerRoot(control);
    if (!picker || control.disabled) return false;
    const months = readDatePickerMonths(picker);
    const nextIndex = Math.min(Math.max(Number(picker.dataset.dateMonthIndex || 0) + Number(direction || 0), 0), months.length - 1);
    if (nextIndex === Number(picker.dataset.dateMonthIndex || 0)) return false;
    picker.dataset.dateMonthIndex = String(nextIndex);
    syncDatePicker(picker);
    return true;
  }

  function selectDatePickerDay(control) {
    const picker = datePickerRoot(control);
    if (!picker || control.disabled) return false;
    const value = String(control.dataset.dateValue || "");
    let values = readDatePickerValues(picker);
    const isRange = picker.dataset.dateRange === "true";
    if (isRange) {
      values = values.length === 1 && values[0] !== value ? [values[0], value] : [value];
      const days = [...picker.querySelectorAll('[data-demo="ui-date-day"]')];
      if (values.length === 2 && days.findIndex((day) => day.dataset.dateValue === values[0]) > days.findIndex((day) => day.dataset.dateValue === values[1])) values.reverse();
    } else values = [value];
    picker.dataset.dateValues = JSON.stringify(values);
    syncDatePicker(picker);
    const isRangeComplete = isRange && values.length === 2 && values[0] !== values[1];
    if (!isRange || isRangeComplete) setDatePickerOpen(picker.querySelector(".ui-date-picker__trigger"), false);
    return true;
  }

  function closeDatePickers(except = null) {
    document.querySelectorAll?.("[data-ui-date-picker].is-open").forEach((picker) => {
      if (picker !== except) setDatePickerOpen(picker.querySelector(".ui-date-picker__trigger"), false);
    });
  }

  const modalRoot = (element) => element?.closest?.("[data-ui-modal]");
  const modalTrigger = (root) => root?.querySelector?.('[data-demo="ui-modal-open"]');

  function syncModalScrollLock() {
    const documentRoot = global.document?.documentElement;
    const body = global.document?.body;
    const locked = Boolean(global.document?.querySelector?.(".ui-modal-stage--inline.is-open"));
    documentRoot?.classList.toggle("ui-modal-scroll-locked", locked);
    body?.classList.toggle("ui-modal-scroll-locked", locked);
  }

  function setModalOpen(element, open) {
    const root = modalRoot(element) || element?.closest?.("[data-ui-modal]") || element;
    if (!root?.classList?.contains("ui-modal-stage")) return false;
    root.classList.toggle("is-open", Boolean(open));
    const layer = root.querySelector(".ui-modal__layer");
    if (layer) {
      if (open) layer.removeAttribute("aria-hidden");
      else layer.setAttribute("aria-hidden", "true");
    }
    modalTrigger(root)?.setAttribute("aria-expanded", String(Boolean(open)));
    syncModalScrollLock();
    if (open) {
      const dialog = root.querySelector('[role="dialog"]');
      global.setTimeout?.(() => dialog?.focus(), 0);
    } else modalTrigger(root)?.focus();
    return true;
  }

  function openModal(control) { return setModalOpen(control, true); }
  function closeModal(control) { return setModalOpen(control, false); }

  function handleModalKeydown(event) {
    const root = event.target?.closest?.("[data-ui-modal]") || global.document?.querySelector?.("[data-ui-modal].is-open");
    if (!root?.classList?.contains("is-open")) return false;
    if (event.key === "Escape" && root.dataset.keyboardClosable !== "false") {
      event.preventDefault();
      closeModal(root);
      return true;
    }
    if (event.key !== "Tab") return false;
    const focusable = [...root.querySelectorAll('.ui-modal [href], .ui-modal button:not([disabled]), .ui-modal [tabindex]:not([tabindex="-1"])')];
    if (!focusable.length) return false;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && event.target === first) { event.preventDefault(); last.focus(); return true; }
    if (!event.shiftKey && event.target === last) { event.preventDefault(); first.focus(); return true; }
    return false;
  }

  const popupRoot = (element) => element?.closest?.("[data-ui-popup]");
  const popupTrigger = (root) => root?.querySelector?.('[data-demo="ui-popup-toggle"]');

  function setPopupOpen(element, open, returnFocus = false) {
    const root = popupRoot(element) || element;
    if (!root?.classList?.contains("ui-popup")) return false;
    global.clearTimeout?.(root.popupCloseTimer);
    root.classList.toggle("is-open", Boolean(open));
    root.querySelector(".ui-popup__surface")?.toggleAttribute("aria-hidden", !open);
    const trigger = popupTrigger(root);
    trigger?.setAttribute("aria-expanded", String(Boolean(open)));
    if (!open && returnFocus) trigger?.focus();
    return true;
  }

  function closePopups(except = null) {
    global.document?.querySelectorAll?.("[data-ui-popup].is-open").forEach((root) => {
      if (root !== except) setPopupOpen(root, false);
    });
  }

  function openPopup(control) {
    const root = popupRoot(control) || control;
    closePopups(root);
    return setPopupOpen(root, true);
  }

  function closePopup(control, returnFocus = false) { return setPopupOpen(control, false, returnFocus); }

  function togglePopup(control) {
    const root = popupRoot(control);
    if (!root) return false;
    if (root.classList.contains("is-open")) return closePopup(root);
    return openPopup(root);
  }

  function cancelPopupClose(control) {
    const root = popupRoot(control) || control;
    if (!root?.classList?.contains("ui-popup")) return false;
    global.clearTimeout?.(root.popupCloseTimer);
    return true;
  }

  function schedulePopupClose(control) {
    const root = popupRoot(control) || control;
    if (!root?.classList?.contains("ui-popup") || root.dataset.closeOnLeave === "false" || !root.classList.contains("is-open")) return false;
    cancelPopupClose(root);
    root.popupCloseTimer = global.setTimeout?.(() => closePopup(root), Number(root.dataset.leaveDelay || 300));
    return true;
  }

  function handlePopupKeydown(event) {
    if (event.key !== "Escape") return false;
    const root = popupRoot(event.target) || global.document?.querySelector?.("[data-ui-popup].is-open");
    if (!root?.classList?.contains("is-open")) return false;
    event.preventDefault();
    closePopup(root, true);
    return true;
  }

  const popconfirmRoot = (element) => element?.closest?.("[data-ui-popconfirm]");
  const popconfirmTrigger = (root) => root?.querySelector?.('[data-demo="ui-popconfirm-toggle"]');

  function setPopconfirmOpen(element, open, returnFocus = false) {
    const root = popconfirmRoot(element) || element;
    if (!root?.classList?.contains("ui-popconfirm") || root.classList.contains("is-disabled") || root.dataset.loading === "true") return false;
    root.classList.toggle("is-open", Boolean(open));
    root.querySelector(".ui-popconfirm__surface")?.toggleAttribute("aria-hidden", !open);
    const trigger = popconfirmTrigger(root);
    trigger?.setAttribute("aria-expanded", String(Boolean(open)));
    if (!open && returnFocus) trigger?.focus();
    return true;
  }

  function closePopconfirms(except = null) {
    global.document?.querySelectorAll?.("[data-ui-popconfirm].is-open").forEach((root) => {
      if (root !== except) setPopconfirmOpen(root, false);
    });
  }

  function openPopconfirm(control) {
    const root = popconfirmRoot(control) || control;
    closePopconfirms(root);
    return setPopconfirmOpen(root, true);
  }

  function closePopconfirm(control, returnFocus = false) { return setPopconfirmOpen(control, false, returnFocus); }

  function togglePopconfirm(control) {
    const root = popconfirmRoot(control);
    if (!root) return false;
    if (root.classList.contains("is-open")) return closePopconfirm(root);
    return openPopconfirm(root);
  }

  function handlePopconfirmKeydown(event) {
    if (event.key !== "Escape") return false;
    const root = popconfirmRoot(event.target) || global.document?.querySelector?.("[data-ui-popconfirm].is-open");
    if (!root?.classList?.contains("is-open")) return false;
    event.preventDefault();
    closePopconfirm(root, true);
    return true;
  }

  function handleRadioKeydown(event) {
    const control = event.target?.closest?.("[data-demo=ui-radio]");
    if (!control || !["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"].includes(event.key)) return false;
    const group = control.closest("[data-ui-radio-group]");
    const controls = radioControls(group).filter((item) => !item.disabled);
    const current = controls.indexOf(control);
    if (current < 0 || controls.length < 2) return false;
    event.preventDefault();
    const direction = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
    const next = controls[(current + direction + controls.length) % controls.length];
    selectRadio(next);
    next.focus();
    return true;
  }

  function toggleChip(control) {
    if (!control || control.disabled) return false;
    const selected = control.classList.toggle("is-selected");
    control.setAttribute("aria-pressed", String(selected));
    return selected;
  }

  function toggleSwitch(control) {
    if (!control || control.disabled) return false;
    const checked = control.classList.toggle("is-checked");
    control.setAttribute("aria-checked", String(checked));
    return checked;
  }

  function clearSearch(control) {
    const search = control?.closest?.(".ui-search");
    const input = search?.querySelector("input");
    if (!input) return;
    input.value = "";
    control.hidden = true;
    input.focus();
  }

  function syncSearchInput(input) {
    const clear = input?.closest?.(".ui-search")?.querySelector("[data-demo=ui-search-clear]");
    if (clear) clear.hidden = !input.value;
  }

  const selectRoot = (control) => control?.closest?.(".ui-select");
  const selectOptionNodes = (root) => [...(root?.querySelectorAll?.('[data-demo="ui-select-option"]') || [])];

  function closeSelects(except = null) {
    global.document?.querySelectorAll?.(".ui-select.is-open").forEach((root) => {
      if (root !== except) setSelectOpen(root, false);
    });
  }

  function setSelectOpen(root, open) {
    if (!root || root.classList.contains("is-disabled") || root.classList.contains("is-loading")) return false;
    root.classList.toggle("is-open", open);
    root.querySelector("[data-demo=ui-select-trigger]")?.setAttribute("aria-expanded", String(open));
    if (open) {
      global.requestAnimationFrame?.(() => root.querySelector("[data-demo=ui-select-search]")?.focus());
    }
    return open;
  }

  function toggleSelect(control) {
    const root = selectRoot(control);
    if (!root || root.classList.contains("is-disabled") || root.classList.contains("is-loading")) return false;
    const next = !root.classList.contains("is-open");
    closeSelects(root);
    return setSelectOpen(root, next);
  }

  function syncSelectDisplay(root) {
    if (!root) return;
    const values = selectOptionNodes(root).filter((option) => option.getAttribute("aria-selected") === "true").map((option) => option.dataset.selectValue);
    const multiple = root.dataset.selectMode === "multiple";
    const placeholder = root.dataset.selectPlaceholder || "Select an option";
    if (multiple) {
      const output = root.querySelector("[data-ui-select-values]");
      if (output) output.innerHTML = values.length ? selectValueTags(values) : `<span class="ui-select__placeholder">${escapeHTML(placeholder)}</span>`;
    } else {
      const output = root.querySelector("[data-ui-select-single]");
      if (output) {
        output.className = values[0] ? "ui-select__value" : "ui-select__placeholder";
        output.textContent = values[0] || placeholder;
      }
    }
    const clear = root.querySelector("[data-demo=ui-select-clear]");
    if (clear) clear.hidden = values.length === 0;
  }

  function setSelectOption(option, selected) {
    option.classList.toggle("is-selected", selected);
    option.setAttribute("aria-selected", String(selected));
    const existingCheck = option.querySelector(".ui-select__option-check");
    if (selected && !existingCheck) option.insertAdjacentHTML("beforeend", icon("Assets/Icons/confirm-sm.svg", "ui-select__option-check"));
    if (!selected && existingCheck) existingCheck.remove();
  }

  function selectOption(control) {
    const root = selectRoot(control);
    if (!root || control?.disabled) return false;
    const multiple = root.dataset.selectMode === "multiple";
    if (multiple) setSelectOption(control, control.getAttribute("aria-selected") !== "true");
    else selectOptionNodes(root).forEach((option) => setSelectOption(option, option === control));
    syncSelectDisplay(root);
    if (!multiple) {
      setSelectOpen(root, false);
      root.querySelector("[data-demo=ui-select-trigger]")?.focus();
    }
    return true;
  }

  function clearSelect(control) {
    const root = selectRoot(control);
    if (!root) return;
    selectOptionNodes(root).forEach((option) => setSelectOption(option, false));
    syncSelectDisplay(root);
    root.querySelector("[data-demo=ui-select-trigger]")?.focus();
  }

  function removeSelectValue(control) {
    const root = selectRoot(control);
    const tagRoot = control?.closest?.("[data-component=tag]");
    const value = tagRoot?.dataset.value;
    const option = selectOptionNodes(root).find((item) => item.dataset.selectValue === value);
    if (option) setSelectOption(option, false);
    syncSelectDisplay(root);
    root?.querySelector("[data-demo=ui-select-trigger]")?.focus();
  }

  function filterSelectOptions(input) {
    const root = selectRoot(input);
    if (!root) return;
    const query = input.value.trim().toLowerCase();
    const options = selectOptionNodes(root);
    options.forEach((option) => option.classList.toggle("is-filtered", !option.dataset.selectLabel.toLowerCase().includes(query)));
    root.querySelectorAll("[data-select-group]").forEach((group) => {
      group.hidden = ![...group.querySelectorAll(".ui-select__option")].some((option) => !option.classList.contains("is-filtered"));
    });
    const empty = root.querySelector("[data-ui-select-empty]");
    if (empty) empty.hidden = options.some((option) => !option.classList.contains("is-filtered"));
  }

  function handleSelectKeydown(event) {
    const trigger = event.target?.closest?.("[data-demo=ui-select-trigger]");
    if (trigger && ["ArrowDown", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      const root = selectRoot(trigger);
      const next = event.key === "ArrowDown" ? true : !root.classList.contains("is-open");
      closeSelects(root);
      setSelectOpen(root, next);
      if (next && event.key === "ArrowDown") global.requestAnimationFrame?.(() => selectOptionNodes(root).find((option) => !option.disabled && !option.classList.contains("is-filtered"))?.focus());
      return true;
    }
    const option = event.target?.closest?.("[data-demo=ui-select-option]");
    if (option && ["Enter", " "].includes(event.key)) {
      event.preventDefault();
      selectOption(option);
      return true;
    }
    if (option && ["ArrowUp", "ArrowDown"].includes(event.key)) {
      const options = selectOptionNodes(selectRoot(option)).filter((item) => !item.disabled && !item.classList.contains("is-filtered"));
      const current = options.indexOf(option);
      if (current >= 0 && options.length > 1) {
        event.preventDefault();
        options[(current + (event.key === "ArrowUp" ? -1 : 1) + options.length) % options.length].focus();
        return true;
      }
    }
    return false;
  }

  function setSelectPresentation(container, { size, shape }) {
    enumValue("select", "size", size);
    enumValue("select", "shape", shape);
    container?.querySelectorAll?.(".ui-select").forEach((root) => {
      root.classList.remove("ui-select--32", "ui-select--40", "ui-select--48", "ui-select--rounded", "ui-select--pill");
      root.classList.add(`ui-select--${size}`, `ui-select--${resolveControlShape(size, shape)}`);
    });
  }

  function setTextInputPresentation(container, { size, shape }) {
    enumValue("text-input", "size", size);
    enumValue("text-input", "shape", shape);
    container?.querySelectorAll?.(".ui-text-input").forEach((root) => {
      root.classList.remove("ui-text-input--32", "ui-text-input--40", "ui-text-input--48", "ui-text-input--rounded", "ui-text-input--pill");
      root.classList.add(`ui-text-input--${size}`, `ui-text-input--${resolveControlShape(size, shape)}`);
    });
  }

  function setNumberStepperPresentation(container, { size, shape }) {
    enumValue("number-stepper", "size", size);
    enumValue("number-stepper", "shape", shape);
    container?.querySelectorAll?.(".ui-number-stepper").forEach((root) => {
      root.classList.remove("ui-number-stepper--32", "ui-number-stepper--40", "ui-number-stepper--48", "ui-number-stepper--rounded", "ui-number-stepper--pill");
      root.classList.add(`ui-number-stepper--${size}`, `ui-number-stepper--${resolveControlShape(size, shape)}`);
    });
  }

  function setTextareaPresentation(container, { size }) {
    enumValue("textarea", "size", size);
    container?.querySelectorAll?.(".ui-textarea").forEach((root) => {
      root.classList.remove("ui-textarea--32", "ui-textarea--40", "ui-textarea--48");
      root.classList.add(`ui-textarea--${size}`);
    });
  }

  function setDatePickerPresentation(container, { size, shape }) {
    enumValue("date-picker", "size", size);
    enumValue("date-picker", "shape", shape);
    container?.querySelectorAll?.(".ui-date-picker").forEach((root) => {
      root.classList.remove("ui-date-picker--32", "ui-date-picker--40", "ui-date-picker--48", "ui-date-picker--rounded", "ui-date-picker--pill");
      root.classList.add(`ui-date-picker--${size}`, `ui-date-picker--${resolveControlShape(size, shape)}`);
    });
  }

  function setTagPresentation(container, { size }) {
    enumValue("tag", "size", size);
    container?.querySelectorAll?.(".ui-tag").forEach((root) => {
      root.classList.remove("ui-tag--24", "ui-tag--32", "ui-tag--40");
      root.classList.add(`ui-tag--${size}`);
    });
  }

  function setChipPresentation(container, { size }) {
    enumValue("chip", "size", size);
    container?.querySelectorAll?.(".ui-chip").forEach((root) => {
      root.classList.remove("ui-chip--24", "ui-chip--32", "ui-chip--40");
      root.classList.add(`ui-chip--${size}`);
    });
  }

  function syncSliderInput(input) {
    const slider = input?.closest?.(".ui-slider");
    const verticalUnit = input?.closest?.(".ui-slider-vertical");
    const output = slider?.querySelector("[data-slider-value]") || verticalUnit?.querySelector("[data-slider-value]");
    const tooltip = slider?.querySelector(".ui-slider__tooltip");
    if (output) output.textContent = input.value;
    if (tooltip) tooltip.textContent = input.value;
    const min = Number(input.min || 0);
    const max = Number(input.max || 100);
    const progress = max === min ? 0 : ((Number(input.value) - min) / (max - min)) * 100;
    input.closest(".ui-slider__control")?.style.setProperty("--ui-slider-progress", `${progress}%`);
    input.closest(".ui-slider-vertical__control")?.style.setProperty("--ui-slider-progress", `${progress}%`);
  }

  function syncSliderRange(input) {
    const range = input?.closest?.("[data-slider-range]");
    if (!range) return;
    const lower = range.querySelector('[data-range-handle="lower"]');
    const upper = range.querySelector('[data-range-handle="upper"]');
    const step = Number(input.step || 1);
    if (input.dataset.rangeHandle === "lower" && Number(lower.value) > Number(upper.value) - step) lower.value = String(Number(upper.value) - step);
    if (input.dataset.rangeHandle === "upper" && Number(upper.value) < Number(lower.value) + step) upper.value = String(Number(lower.value) + step);
    const min = Number(lower.min || 0);
    const max = Number(lower.max || 100);
    const lowerProgress = ((Number(lower.value) - min) / (max - min)) * 100;
    const upperProgress = ((Number(upper.value) - min) / (max - min)) * 100;
    range.style.setProperty("--ui-slider-range-start", `${lowerProgress}%`);
    range.style.setProperty("--ui-slider-range-end", `${upperProgress}%`);
    range.closest(".ui-slider")?.querySelector("[data-range-value]")?.replaceChildren(`${lower.value}–${upper.value}`);
  }

  function startSliderRangeDrag(event) {
    const range = event?.target?.closest?.("[data-slider-range]");
    if (!range || (event.button !== undefined && event.button !== 0)) return false;
    const lower = range.querySelector('[data-range-handle="lower"]');
    const upper = range.querySelector('[data-range-handle="upper"]');
    if (!lower || !upper || lower.disabled || upper.disabled) return false;

    const bounds = range.getBoundingClientRect();
    const min = Number(lower.min || 0);
    const max = Number(lower.max || 100);
    const step = Number(lower.step || 1);
    const valueAtPointer = (pointerEvent) => {
      const progress = Math.min(1, Math.max(0, (pointerEvent.clientX - bounds.left) / bounds.width));
      const raw = min + ((max - min) * progress);
      return Math.min(max, Math.max(min, min + (Math.round((raw - min) / step) * step)));
    };
    const targetValue = valueAtPointer(event);
    const active = Math.abs(targetValue - Number(lower.value)) <= Math.abs(targetValue - Number(upper.value)) ? lower : upper;
    const update = (pointerEvent) => {
      if (pointerEvent.pointerId !== event.pointerId) return;
      active.value = String(valueAtPointer(pointerEvent));
      syncSliderRange(active);
    };
    const finish = (pointerEvent) => {
      if (pointerEvent.pointerId !== event.pointerId) return;
      global.removeEventListener("pointermove", update);
      global.removeEventListener("pointerup", finish);
      global.removeEventListener("pointercancel", finish);
    };
    event.preventDefault();
    update(event);
    active.focus({ preventScroll: true });
    global.addEventListener("pointermove", update);
    global.addEventListener("pointerup", finish);
    global.addEventListener("pointercancel", finish);
    return true;
  }

  function drawer(props = {}) {
    assertProps("drawer", props);
    const { id = "", title = "Drawer", body = "", footer = "", trigger = "", triggerLabel = "Open drawer", open = false, placement = "right", size = "default", closable = true, maskClosable = true, keyboardClosable = true, demo = "" } = props;
    enumValue("drawer", "placement", placement);
    enumValue("drawer", "size", size);
    const drawerId = id || `drawer-${String(title).toLowerCase().replace(/[^a-z0-9]+/g, "-") || "panel"}`;
    const triggerMarkup = trigger || button({ label: triggerLabel, variant: "secondary", size: 32, shape: "pill", demo: demo || "ui-drawer-open", ariaExpanded: open, ariaControls: `${drawerId}-dialog` });
    const close = closable ? `<button class="ui-drawer__close" type="button" data-demo="ui-drawer-close" aria-label="Close drawer">${icon("Assets/Icons/cross.svg", "ui-drawer__close-icon")}</button>` : "";
    const footerMarkup = footer ? `<footer class="ui-drawer__footer">${footer}</footer>` : "";
    return `<div class="ui-drawer-stage${open ? " is-open" : ""}" id="${escapeHTML(drawerId)}" data-component="drawer" data-ui-drawer data-mask-closable="${maskClosable}" data-keyboard-closable="${keyboardClosable}">${triggerMarkup}<div class="ui-drawer__layer"${open ? "" : " aria-hidden=\"true\""}><button class="ui-drawer__mask" type="button" data-demo="ui-drawer-mask" aria-label="Close drawer"></button><aside class="ui-drawer ui-drawer--${placement} ui-drawer--${size}" id="${escapeHTML(drawerId)}-dialog" role="dialog" aria-modal="true" aria-labelledby="${escapeHTML(drawerId)}-title" tabindex="-1"><div class="ui-drawer__content"><header class="ui-drawer__header"><h3 id="${escapeHTML(drawerId)}-title">${escapeHTML(title)}</h3>${close}</header><div class="ui-drawer__body">${body}</div>${footerMarkup}</div></aside></div></div>`;
  }

  function formField(props = {}) {
    assertProps("form-field", props);
    const { id = "", label = "Field label", control = "", helper = "", error = "", status = "default", size = 40, shape = "default", state = "default", required = false, disabled = false } = props;
    enumValue("form-field", "size", size);
    enumValue("form-field", "shape", shape);
    enumValue("form-field", "status", status);
    enumValue("form-field", "state", disabled ? "disabled" : state);
    const message = error || helper;
    const messageId = message && id ? `${id}-${error ? "error" : "helper"}` : "";
    const labelId = id ? `${id}-label` : "";
    const isFieldControl = /data-component="(?:text-input|textarea|select|combobox|date-picker)"/.test(control);
    const associatedControl = isFieldControl && (labelId || messageId)
      ? control.replace(/<(input|textarea|button)\b([^>]*)>/, (match, tag, attributes) => {
        const cleanAttributes = attributes.replace(/\s*\/\s*$/, "");
        const labelledBy = labelId && !/\saria-labelledby=/.test(cleanAttributes) ? ` aria-labelledby="${escapeHTML(labelId)}"` : "";
        const describedBy = messageId && !/\saria-describedby=/.test(cleanAttributes) ? ` aria-describedby="${escapeHTML(messageId)}"` : "";
        return `<${tag}${cleanAttributes}${labelledBy}${describedBy}>`;
      })
      : control;
    const presentation = resolveFieldPresentation({ state, status: error ? "error" : status, disabled });
    const classes = ["ui-form-field", `ui-form-field--${presentation.status}`, `ui-form-field--${size}`, `ui-form-field--${resolveControlShape(size, shape)}`, presentation.state !== "default" ? `is-${presentation.state}` : ""].filter(Boolean).join(" ");
    return `<div class="${classes}" data-component="form-field"><label${labelId ? ` id="${escapeHTML(labelId)}"` : ""}${id ? ` for="${escapeHTML(id)}"` : ""}>${escapeHTML(label)}${required ? '<span aria-hidden="true"> *</span>' : ""}</label>${associatedControl}${message ? `<p class="ui-form-field__message${error ? " is-error" : ""}"${messageId ? ` id="${escapeHTML(messageId)}"` : ""}${error ? ' role="alert"' : ""}>${escapeHTML(message)}</p>` : ""}</div>`;
  }

  function textInput(props = {}) {
    assertProps("text-input", props);
    const { id = "", value = "", placeholder = "", size = 40, shape = "default", status = "default", state = "default", disabled = false, readOnly = false, leadingIcon = "", trailingIcon = "", trailingAction = "", ariaLabel = "", demo = "" } = props;
    enumValue("text-input", "size", size);
    enumValue("text-input", "shape", shape);
    enumValue("text-input", "status", status);
    enumValue("text-input", "state", disabled ? "disabled" : state);
    const presentation = resolveFieldPresentation({ state, status, disabled, readOnly });
    const classes = ["ui-text-input", `ui-text-input--${size}`, `ui-text-input--${resolveControlShape(size, shape)}`, presentation.state === "default" ? "" : `is-${presentation.state}`, presentation.status !== "default" ? `is-${presentation.status}` : ""].filter(Boolean).join(" ");
    return `<div class="${classes}" data-component="text-input">${icon(leadingIcon, "ui-text-input__icon")}<input${id ? ` id="${escapeHTML(id)}"` : ""} type="text" value="${escapeHTML(value)}" placeholder="${escapeHTML(placeholder)}" aria-label="${escapeHTML(ariaLabel || placeholder || "Text input")}"${demo ? ` data-demo="${escapeHTML(demo)}"` : ""}${disabled ? " disabled" : ""}${readOnly ? " readonly" : ""} />${icon(trailingIcon, "ui-text-input__icon ui-text-input__trailing-icon")}${trailingAction ? `<span class="ui-text-input__trailing">${trailingAction}</span>` : ""}</div>`;
  }

  function textarea(props = {}) {
    assertProps("textarea", props);
    const { id = "", value = "", placeholder = "", size = 40, rows = 3, maxLength = 0, showCount = false, status = "default", state = "default", disabled = false, readOnly = false, ariaLabel = "", demo = "" } = props;
    enumValue("textarea", "size", size);
    enumValue("textarea", "status", status);
    enumValue("textarea", "state", disabled ? "disabled" : state);
    const presentation = resolveFieldPresentation({ state, status, disabled, readOnly });
    const classes = ["ui-textarea", `ui-textarea--${size}`, presentation.state === "default" ? "" : `is-${presentation.state}`, presentation.status !== "default" ? `is-${presentation.status}` : ""].filter(Boolean).join(" ");
    const count = showCount ? `<span class="ui-textarea__count" data-ui-textarea-count>${String(value).length}${maxLength ? ` / ${maxLength}` : ""}</span>` : "";
    return `<div class="${classes}" data-component="textarea"><textarea${id ? ` id="${escapeHTML(id)}"` : ""} rows="${Math.max(1, Number(rows) || 3)}" placeholder="${escapeHTML(placeholder)}" aria-label="${escapeHTML(ariaLabel || placeholder || "Textarea")}"${maxLength ? ` maxlength="${Math.max(1, Number(maxLength))}"` : ""}${demo ? ` data-demo="${escapeHTML(demo)}"` : ""}${disabled ? " disabled" : ""}${readOnly ? " readonly" : ""}>${escapeHTML(value)}</textarea>${count}</div>`;
  }

  function numberStepper(props = {}) {
    assertProps("number-stepper", props);
    const { id = "", value = 1, min = 0, max = 99, step = 1, size = 40, shape = "default", status = "default", state = "default", disabled = false, label = "Quantity", ariaLabel = "", demo = "" } = props;
    enumValue("number-stepper", "size", size);
    enumValue("number-stepper", "shape", shape);
    enumValue("number-stepper", "status", status);
    enumValue("number-stepper", "state", disabled ? "disabled" : state);
    const presentation = resolveFieldPresentation({ state, status, disabled });
    const numericMin = Number(min);
    const numericMax = Math.max(numericMin, Number(max));
    const numericStep = Math.max(1, Number(step));
    const numericValue = Math.min(numericMax, Math.max(numericMin, Number(value)));
    const decrementDisabled = disabled || numericValue <= numericMin;
    const incrementDisabled = disabled || numericValue >= numericMax;
    return `<div class="ui-number-stepper ui-number-stepper--${size} ui-number-stepper--${resolveControlShape(size, shape)}${presentation.state !== "default" ? ` is-${presentation.state}` : ""}${presentation.status !== "default" ? ` is-${presentation.status}` : ""}" data-component="number-stepper" data-ui-number-stepper data-min="${numericMin}" data-max="${numericMax}" data-step="${numericStep}"${id ? ` id="${escapeHTML(id)}"` : ""} aria-label="${escapeHTML(ariaLabel || label)}"><button class="ui-number-stepper__action" type="button" data-demo="ui-number-stepper-decrement" aria-label="Decrease ${escapeHTML(label)}"${decrementDisabled ? " disabled" : ""}>${icon("Assets/Icons/minus-circle.svg", "ui-number-stepper__icon")}</button><output data-ui-number-stepper-value>${numericValue}</output><button class="ui-number-stepper__action" type="button" data-demo="ui-number-stepper-increment" aria-label="Increase ${escapeHTML(label)}"${incrementDisabled ? " disabled" : ""}>${icon("Assets/Icons/plus-circle.svg", "ui-number-stepper__icon")}</button></div>`;
  }

  function combobox(props = {}) {
    assertProps("combobox", props);
    const {
      id = "combobox",
      label = "Find an option",
      placeholder = "Find an option",
      options = [],
      groups = [],
      selected = [],
      size = 48,
      shape = "default",
      status = "default",
      state = "default",
      clearable = false,
      disabled = false,
      loading = false,
      open = false,
      query = ""
    } = props;
    const markup = select({ id, label, placeholder, options, groups, selected, mode: "single", size, shape, status, state, clearable, searchable: true, query, disabled, loading, open: Boolean(open || query) });
    return markup.replace('data-component="select"', 'data-component="combobox"').replace('data-ui-select', 'data-ui-select data-ui-combobox');
  }

  function formatUploadSize(value) {
    const bytes = Math.max(0, Number(value) || 0);
    if (!bytes) return "";
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1)} MB`;
  }

  function normalizeUploadFile(file, index) {
    const supplied = typeof file === "string" ? { name: file } : (file || {});
    const status = ["uploading", "complete", "error"].includes(supplied.status) ? supplied.status : "complete";
    return {
      id: supplied.id || `file-${index + 1}`,
      name: supplied.name || "Untitled file",
      size: supplied.size || 0,
      status,
      progress: Math.min(100, Math.max(0, Number(supplied.progress) || (status === "complete" ? 100 : 0))),
      error: supplied.error || "Upload could not be completed."
    };
  }

  function renderUploadFile(file) {
    const meta = file.status === "error"
      ? file.error
      : file.status === "uploading"
        ? `${file.progress}% uploaded`
        : [formatUploadSize(file.size), "Uploaded"].filter(Boolean).join(" · ");
    const announcement = file.status === "complete" ? ' role="status" aria-label="Upload complete"' : file.status === "error" ? ' role="alert"' : "";
    const progressStatus = file.status === "uploading" ? `<span class="ui-upload__file-status" aria-label="uploading"><i class="ui-upload__file-spinner" aria-hidden="true"></i></span>` : "";
    return `<li class="ui-upload__file is-${file.status}" data-ui-upload-file data-upload-file-id="${escapeHTML(file.id)}"><span class="ui-upload__file-icon">${icon("Assets/Icons/file.svg", "ui-upload__file-type-icon")}</span><span class="ui-upload__file-copy"><strong>${escapeHTML(file.name)}</strong><small${announcement}>${escapeHTML(meta)}</small>${file.status === "uploading" ? `<i class="ui-upload__progress" aria-label="${file.progress}% uploaded"><i style="width:${file.progress}%"></i></i>` : ""}</span>${progressStatus}${button({ label: `Remove ${file.name}`, variant: "text", size: 32, shape: "pill", iconOnly: true, leadingIcon: "Assets/Icons/16px/cross-sm.svg", ariaLabel: `Remove ${file.name}`, demo: "ui-upload-remove" })}</li>`;
  }

  function renderUploadFiles(files) {
    return files.length ? `<ul class="ui-upload__files" data-ui-upload-files>${files.map(renderUploadFile).join("")}</ul>` : `<ul class="ui-upload__files" data-ui-upload-files hidden></ul>`;
  }

  function upload(props = {}) {
    assertProps("upload", props);
    const {
      id = "upload",
      label = "Upload files",
      description = "Drag and drop files here, or choose files from your device.",
      accept = "",
      multiple = false,
      files = [],
      variant = "dropzone",
      state = "default",
      disabled = false,
      actionLabel = "Choose file",
      maxSize = "",
      avatar = "",
      avatarAlt = "",
      error = "",
      ariaLabel = "File upload",
      demo = ""
    } = props;
    enumValue("upload", "variant", variant);
    enumValue("upload", "state", disabled ? "disabled" : state);
    const uploadId = id || "upload";
    const normalizedFiles = Array.isArray(files) ? files.map(normalizeUploadFile) : [];
    const classes = ["ui-upload", `ui-upload--${variant}`, disabled ? "is-disabled" : state !== "default" ? `is-${state}` : ""].filter(Boolean).join(" ");
    const resolvedAccept = variant === "avatar" && !accept ? ".jpg,.jpeg,.png" : accept;
    const avatarBusy = variant === "avatar" && state === "uploading";
    const input = `<input class="ui-upload__input" id="${escapeHTML(uploadId)}-input" type="file"${resolvedAccept ? ` accept="${escapeHTML(resolvedAccept)}"` : ""}${multiple && variant !== "avatar" ? " multiple" : ""}${disabled || avatarBusy ? " disabled" : ""} data-demo="ui-upload-input" aria-label="${escapeHTML(ariaLabel)}" />`;
    const hint = [description, maxSize].filter(Boolean).join(maxSize && description ? " " : "");
    const trigger = button({ label: actionLabel, variant: "secondary", size: 32, shape: "pill", disabled, demo: "ui-upload-trigger", ariaControls: `${uploadId}-input` });
    const avatarHasImage = Boolean(avatar);
    const avatarAction = avatarHasImage ? "Change photo" : "Upload photo";
    const avatarMessage = state === "uploading"
      ? "Uploading photo…"
      : state === "error"
        ? (error || "Could not upload photo. Try again.")
        : hint;
    const avatarAriaLabel = ariaLabel === "File upload" ? `${avatarAction}: ${label}` : ariaLabel;
    const content = variant === "avatar"
      ? `<div class="ui-upload__avatar-field"><button class="ui-upload__avatar" type="button" data-demo="ui-upload-trigger" aria-controls="${escapeHTML(uploadId)}-input" aria-label="${escapeHTML(avatarAriaLabel)}"${avatarBusy ? ' aria-busy="true"' : ""}${disabled || avatarBusy ? " disabled" : ""}>${avatarHasImage ? `<img class="ui-upload__avatar-image" src="${escapeHTML(avatar)}" alt="${escapeHTML(avatarAlt || label)}" />` : icon("Assets/Icons/whiteboard-upload.svg", "ui-upload__avatar-icon")}<span class="ui-upload__avatar-overlay" aria-hidden="true">${escapeHTML(avatarAction)}</span>${avatarBusy ? `<span class="ui-upload__avatar-loading" aria-hidden="true"><i class="ui-upload__file-spinner"></i></span>` : ""}</button><span class="ui-upload__avatar-copy"><strong>${escapeHTML(label)}</strong>${avatarMessage ? `<small${state === "error" ? ' role="alert"' : state === "uploading" ? ' role="status"' : ""}>${escapeHTML(avatarMessage)}</small>` : ""}</span></div>`
      : variant === "trigger"
      ? `<div class="ui-upload__trigger-row"><span class="ui-upload__trigger-copy"><strong>${escapeHTML(label)}</strong>${hint ? `<small>${escapeHTML(hint)}</small>` : ""}</span>${trigger}</div>`
      : `<button class="ui-upload__dropzone" type="button" data-demo="ui-upload-trigger" aria-controls="${escapeHTML(uploadId)}-input"${disabled ? " disabled" : ""}>${icon("Assets/Icons/whiteboard-upload.svg", "ui-upload__dropzone-icon")}<span><strong>${escapeHTML(label)}</strong>${hint ? `<small>${escapeHTML(hint)}</small>` : ""}</span><span class="ui-upload__action">${escapeHTML(actionLabel)}</span></button>`;
    return `<section class="${classes}" data-component="upload" data-ui-upload${demo ? ` data-upload-demo="${escapeHTML(demo)}"` : ""}>${input}${content}${renderUploadFiles(normalizedFiles)}</section>`;
  }

  function openUploadPicker(control) {
    const root = control?.closest?.("[data-ui-upload]");
    const input = root?.querySelector(".ui-upload__input");
    if (!root || root.classList.contains("is-disabled") || !input || input.disabled) return false;
    input.click();
    return true;
  }

  function setUploadFiles(root, files = []) {
    const uploadRoot = root?.closest?.("[data-ui-upload]") || root;
    const list = uploadRoot?.querySelector?.("[data-ui-upload-files]");
    if (!uploadRoot || !list) return false;
    if (uploadRoot.classList.contains("ui-upload--avatar")) {
      const avatarFile = Array.from(files)[0];
      let image = uploadRoot.querySelector(".ui-upload__avatar-image");
      const avatarButton = uploadRoot.querySelector(".ui-upload__avatar");
      const message = uploadRoot.querySelector(".ui-upload__avatar-copy small");
      if (avatarFile && !image && avatarButton) {
        avatarButton.insertAdjacentHTML("afterbegin", `<img class="ui-upload__avatar-image" alt="" />`);
        avatarButton.querySelector(".ui-upload__avatar-icon")?.remove();
        image = avatarButton.querySelector(".ui-upload__avatar-image");
      }
      if (avatarFile && image && global.URL?.createObjectURL) image.src = global.URL.createObjectURL(avatarFile);
      if (avatarFile && image) image.alt = avatarFile.name || image.alt;
      if (avatarFile && avatarButton) avatarButton.setAttribute("aria-label", `Change photo: ${avatarFile.name || "profile photo"}`);
      if (avatarFile && message) message.textContent = "Photo selected";
      if (typeof global.CustomEvent === "function") uploadRoot.dispatchEvent(new global.CustomEvent("italki:upload-change", { bubbles: true, detail: { files: avatarFile ? [avatarFile] : [], avatar: avatarFile || null } }));
      return true;
    }
    const normalized = Array.from(files).map((file, index) => normalizeUploadFile({ id: `${file.name}-${file.lastModified || index}`, name: file.name, size: file.size, status: "complete" }, index));
    list.hidden = normalized.length === 0;
    list.innerHTML = normalized.map(renderUploadFile).join("");
    if (typeof global.CustomEvent === "function") uploadRoot.dispatchEvent(new global.CustomEvent("italki:upload-change", { bubbles: true, detail: { files: normalized } }));
    return true;
  }

  function removeUploadFile(control) {
    const file = control?.closest?.("[data-ui-upload-file]");
    const list = file?.parentElement;
    if (!file || !list) return false;
    const fileId = file.dataset.uploadFileId || "";
    file.remove();
    list.hidden = list.children.length === 0;
    if (typeof global.CustomEvent === "function") list.closest("[data-ui-upload]")?.dispatchEvent(new global.CustomEvent("italki:upload-remove", { bubbles: true, detail: { id: fileId } }));
    return true;
  }

  function normalizeStep(item, index) {
    return typeof item === "string" ? { id: `step-${index + 1}`, label: item } : { id: item?.id || `step-${index + 1}`, label: item?.label || `Step ${index + 1}`, description: item?.description || "", disabled: Boolean(item?.disabled) };
  }

  function stepper(props = {}) {
    assertProps("stepper", props);
    const { id = "", items = [], current = 0, variant = "default", orientation = "horizontal", value = 0, max = 0, label = "", ariaLabel = "" } = props;
    enumValue("stepper", "variant", variant);
    enumValue("stepper", "orientation", orientation);
    const normalized = items.map(normalizeStep);
    const currentIndex = Math.max(0, Math.min(normalized.length - 1, Number(current)));
    if (variant === "flow-progress") {
      if (orientation !== "horizontal") throw new Error("flow-progress Stepper only supports horizontal orientation");
      const flowItem = (item, index) => `<li class="ui-stepper__item${index < currentIndex ? " is-complete" : ""}${index === currentIndex ? " is-current" : ""}${item.disabled ? " is-disabled" : ""}"${index === currentIndex ? ' aria-current="step"' : ""}${item.disabled ? ' aria-disabled="true"' : ""}><span class="ui-stepper__marker">${index < currentIndex ? icon("Assets/Icons/confirm-sm.svg", "ui-stepper__complete-icon") : index + 1}</span><strong>${escapeHTML(item.label)}</strong></li>`;
      const content = normalized.flatMap((item, index) => [flowItem(item, index), index < normalized.length - 1 ? `<li class="ui-stepper__connector${index < currentIndex ? " is-complete" : ""}" role="presentation" aria-hidden="true"></li>` : ""]).join("");
      return `<ol class="ui-stepper ui-stepper--flow-progress" data-component="stepper" data-ui-stepper${id ? ` id="${escapeHTML(id)}"` : ""} aria-label="${escapeHTML(ariaLabel || "Steps")}">${content}</ol>`;
    }
    if (variant === "dots") {
      const content = normalized.map((item, index) => `<li class="ui-stepper__dot${index === currentIndex ? " is-current" : ""}"${index === currentIndex ? ' aria-current="step"' : ""}><span class="ui-stepper__sr-only">${escapeHTML(item.label)}</span></li>`).join("");
      return `<ol class="ui-stepper ui-stepper--dots" data-component="stepper" data-ui-stepper${id ? ` id="${escapeHTML(id)}"` : ""} aria-label="${escapeHTML(ariaLabel || "Steps")}">${content}</ol>`;
    }
    if (variant === "top-indicator") {
      const content = normalized.map((item, index) => `<li class="ui-stepper__segment${index < currentIndex ? " is-complete" : ""}${index === currentIndex ? " is-current" : ""}"${index === currentIndex ? ' aria-current="step"' : ""}><span class="ui-stepper__sr-only">${escapeHTML(item.label)}</span></li>`).join("");
      return `<ol class="ui-stepper ui-stepper--top-indicator" data-component="stepper" data-ui-stepper${id ? ` id="${escapeHTML(id)}"` : ""} aria-label="${escapeHTML(ariaLabel || "Steps")}">${content}</ol>`;
    }
    if (variant === "schedule-progress") {
      const safeMax = Math.max(1, Number(max) || normalized.length || 1);
      const safeValue = Math.max(0, Math.min(safeMax, Number(value)));
      const percent = (safeValue / safeMax) * 100;
      const progressLabel = label || "Scheduled lessons";
      return `<div class="ui-stepper ui-stepper--schedule-progress" data-component="stepper" data-ui-stepper${id ? ` id="${escapeHTML(id)}"` : ""} role="progressbar" aria-label="${escapeHTML(ariaLabel || progressLabel)}" aria-valuemin="0" aria-valuemax="${safeMax}" aria-valuenow="${safeValue}"><div class="ui-stepper__schedule-meta"><span>${escapeHTML(progressLabel)}</span><strong><b>${safeValue}</b><i>/${safeMax}</i></strong></div><span class="ui-stepper__schedule-track"><i style="--ui-stepper-schedule-value:${percent}%"></i></span></div>`;
    }
    if (variant === "progress-steps") {
      if (orientation !== "horizontal") throw new Error("progress-steps Stepper only supports horizontal orientation");
      const progressStep = (item, index) => `<li class="ui-stepper__item${index < currentIndex ? " is-complete" : ""}${index === currentIndex ? " is-current" : ""}${item.disabled ? " is-disabled" : ""}"${index === currentIndex ? ' aria-current="step"' : ""}${item.disabled ? ' aria-disabled="true"' : ""}><span class="ui-stepper__marker">${index < currentIndex ? icon("Assets/Icons/confirm-sm.svg", "ui-stepper__complete-icon") : index + 1}</span><strong>${escapeHTML(item.label)}</strong></li>`;
      const content = normalized.flatMap((item, index) => [progressStep(item, index), index < normalized.length - 1 ? `<li class="ui-stepper__connector${index < currentIndex ? " is-complete" : ""}" role="presentation" aria-hidden="true"></li>` : ""]).join("");
      return `<ol class="ui-stepper ui-stepper--progress-steps" data-component="stepper" data-ui-stepper${id ? ` id="${escapeHTML(id)}"` : ""} aria-label="${escapeHTML(ariaLabel || "Steps")}">${content}</ol>`;
    }
    const stepItem = (item, index) => `<li class="ui-stepper__item${index < currentIndex ? " is-complete" : ""}${index === currentIndex ? " is-current" : ""}${item.disabled ? " is-disabled" : ""}"><button type="button" data-demo="ui-stepper" data-step-index="${index}" aria-current="${index === currentIndex ? "step" : "false"}"${item.disabled ? " disabled" : ""}><span class="ui-stepper__marker">${index < currentIndex ? icon("Assets/Icons/confirm-sm.svg", "ui-stepper__complete-icon") : index + 1}</span><span><strong>${escapeHTML(item.label)}</strong>${item.description ? `<small>${escapeHTML(item.description)}</small>` : ""}</span></button></li>`;
    const content = orientation === "horizontal"
      ? normalized.flatMap((item, index) => [stepItem(item, index), index < normalized.length - 1 ? `<li class="ui-stepper__connector${index < currentIndex ? " is-complete" : ""}" role="presentation" aria-hidden="true"></li>` : ""]).join("")
      : normalized.map(stepItem).join("");
    return `<nav class="ui-stepper ui-stepper--${orientation}" data-component="stepper" data-ui-stepper${id ? ` id="${escapeHTML(id)}"` : ""} aria-label="${escapeHTML(ariaLabel || "Steps")}"><ol>${content}</ol></nav>`;
  }

  function progress(props = {}) {
    assertProps("progress", props);
    const { value = 0, max = 100, status = "default", type = "line", size = 80, showLabel = true, indeterminate = false, ariaLabel = "Progress" } = props;
    enumValue("progress", "status", status);
    enumValue("progress", "type", type);
    enumValue("progress", "size", size);
    if (indeterminate && type !== "line") throw new Error("indeterminate progress only supports the line type");
    const safeMax = Math.max(1, Number(max));
    const safeValue = Math.min(safeMax, Math.max(0, Number(value)));
    const percent = Math.round((safeValue / safeMax) * 100);
    const label = indeterminate ? "Loading" : `${percent}%`;
    const colorClass = `ui-progress--${status}`;
    if (type === "line") return `<div class="ui-progress ui-progress--line ${colorClass}${indeterminate ? " is-indeterminate" : ""}" data-component="progress" role="progressbar" aria-label="${escapeHTML(ariaLabel)}" aria-valuemin="0" aria-valuemax="${safeMax}"${indeterminate ? " aria-valuetext=\"Loading\"" : ` aria-valuenow="${safeValue}"`}><span class="ui-progress__track"><i style="--ui-progress-value:${percent}%"></i></span>${showLabel ? `<output>${label}</output>` : ""}</div>`;
    const circularPath = type === "circle"
      ? '<circle class="ui-progress__ring-track" cx="60" cy="60" r="52" pathLength="100"></circle><circle class="ui-progress__ring-value" cx="60" cy="60" r="52" pathLength="100"></circle>'
      : '<path class="ui-progress__ring-track" d="M 8 60 A 52 52 0 0 1 112 60" pathLength="100"></path><path class="ui-progress__ring-value" d="M 8 60 A 52 52 0 0 1 112 60" pathLength="100"></path>';
    const ringStroke = type === "circle" ? 12 : 8;
    return `<div class="ui-progress ui-progress--${type} ${colorClass}" data-component="progress" role="progressbar" aria-label="${escapeHTML(ariaLabel)}" aria-valuemin="0" aria-valuemax="${safeMax}" aria-valuenow="${safeValue}" style="--ui-progress-size:${size}px;--ui-progress-value:${percent};--ui-progress-ring-stroke:${ringStroke}px"><svg class="ui-progress__ring" viewBox="0 0 120 ${type === "circle" ? 120 : 68}" aria-hidden="true">${circularPath}</svg>${showLabel ? `<output>${label}</output>` : ""}</div>`;
  }

  function toast(props = {}) {
    assertProps("toast", props);
    const { id = "", tone = "info", title = "", description = "", action = "", duration = 0, closable = true, open = true, ariaLabel = "" } = props;
    enumValue("toast", "tone", tone);
    const iconByTone = { info: "Assets/Icons/info.svg", success: "Assets/Icons/check.svg", warning: "Assets/Icons/warning.svg", error: "Assets/Icons/error.svg" };
    const close = closable ? `<button class="ui-toast__close" type="button" data-demo="ui-toast-close" aria-label="Dismiss notification">${icon("Assets/Icons/cross.svg", "ui-toast__close-icon")}</button>` : "";
    return `<section class="ui-toast ui-toast--${tone}${open ? " is-open" : ""}" data-component="toast"${id ? ` id="${escapeHTML(id)}"` : ""}${duration ? ` data-duration="${Math.max(0, Number(duration))}"` : ""} role="status" aria-live="polite" aria-label="${escapeHTML(ariaLabel || title || "Notification")}">${icon(iconByTone[tone], "ui-toast__icon")}<div class="ui-toast__copy">${title ? `<strong>${escapeHTML(title)}</strong>` : ""}${description ? `<p>${escapeHTML(description)}</p>` : ""}${action ? `<div class="ui-toast__action">${action}</div>` : ""}</div>${close}</section>`;
  }

  function notification(props = {}) {
    assertProps("notification", props);
    const { id = "", tone = "info", title = "", description = "", action = "", closable = true, open = true, ariaLabel = "" } = props;
    enumValue("notification", "tone", tone);
    const iconByTone = { info: "Assets/Icons/info.svg", success: "Assets/Icons/check.svg", warning: "Assets/Icons/warning.svg", error: "Assets/Icons/error.svg" };
    const close = closable ? `<button class="ui-notification__close" type="button" data-demo="ui-notification-close" aria-label="Dismiss notification">${icon("Assets/Icons/cross.svg", "ui-notification__close-icon")}</button>` : "";
    const role = tone === "error" ? "alert" : "status";
    return `<section class="ui-notification ui-notification--${tone}${open ? " is-open" : ""}" data-component="notification"${id ? ` id="${escapeHTML(id)}"` : ""} role="${role}" aria-live="polite" aria-label="${escapeHTML(ariaLabel || title || "Notification")}">${icon(iconByTone[tone], "ui-notification__icon")}<div class="ui-notification__copy">${title ? `<strong>${escapeHTML(title)}</strong>` : ""}${description ? `<p>${escapeHTML(description)}</p>` : ""}${action ? `<div class="ui-notification__action">${action}</div>` : ""}</div>${close}</section>`;
  }

  function result(props = {}) {
    assertProps("result", props);
    const { id = "", tone = "success", title = "", description = "", action = "", secondaryAction = "", ariaLabel = "" } = props;
    enumValue("result", "tone", tone);
    const iconByTone = { info: "Assets/Icons/info.svg", success: "Assets/Icons/check.svg", warning: "Assets/Icons/warning.svg", error: "Assets/Icons/error.svg" };
    const titleId = id ? `${id}-title` : "";
    const actions = action || secondaryAction ? `<div class="ui-result__actions">${action}${secondaryAction}</div>` : "";
    return `<section class="ui-result ui-result--${tone}" data-component="result"${id ? ` id="${escapeHTML(id)}"` : ""} role="${tone === "error" ? "alert" : "status"}"${titleId ? ` aria-labelledby="${escapeHTML(titleId)}"` : ` aria-label="${escapeHTML(ariaLabel || title || "Result")}"`}><span class="ui-result__icon">${icon(iconByTone[tone], "ui-result__icon-image")}</span><div class="ui-result__copy">${title ? `<h3${titleId ? ` id="${escapeHTML(titleId)}"` : ""}>${escapeHTML(title)}</h3>` : ""}${description ? `<p>${escapeHTML(description)}</p>` : ""}</div>${actions}</section>`;
  }

  function skeleton(props = {}) {
    assertProps("skeleton", props);
    const { type = "text", lines, width = "", height = "", title = true, avatar = false, lastLineWidth = "", shape = "default", round = false, animated = true, ariaLabel = "Loading content" } = props;
    enumValue("skeleton", "type", type);
    enumValue("skeleton", "shape", shape);
    const resolvedLines = Math.max(1, Number(lines) || (type === "content" ? 2 : 3));
    const style = [width ? `--ui-skeleton-width:${escapeHTML(width)}` : "", height ? `--ui-skeleton-height:${escapeHTML(height)}` : ""].filter(Boolean).join(";");
    const root = (name, content, extra = "") => `<div class="ui-skeleton ui-skeleton--${name}${round ? " is-round" : ""}${animated ? " is-animated" : ""}${extra}" data-component="skeleton" role="status" aria-label="${escapeHTML(ariaLabel)}" aria-busy="true"${style ? ` style="${style}"` : ""}>${content}</div>`;
    const block = (className = "", blockStyle = "") => `<i class="ui-skeleton__block${className ? ` ${className}` : ""}"${blockStyle ? ` style="${blockStyle}"` : ""}></i>`;
    const paragraph = (count = resolvedLines) => Array.from({ length: count }, (_, index) => {
      const isLast = index === count - 1;
      const lineWidth = isLast && count > 1 ? (lastLineWidth || "68%") : "";
      return block("ui-skeleton__line", lineWidth ? `width:${escapeHTML(lineWidth)}` : "");
    }).join("");
    if (type === "avatar") return root("avatar", block("ui-skeleton__element"), ` ui-skeleton--${shape}`);
    if (["button", "input", "image"].includes(type)) return root(type, block("ui-skeleton__element"), ` ui-skeleton--${shape}`);
    if (type === "content") {
      const header = avatar ? `<span class="ui-skeleton__header">${block("ui-skeleton__avatar")}</span>` : "";
      const content = `<span class="ui-skeleton__content">${title ? block("ui-skeleton__title") : ""}<span class="ui-skeleton__paragraph">${paragraph()}</span></span>`;
      return root("content", `${header}${content}`);
    }
    if (type === "card") return root("card", `${block("ui-skeleton__media")}<span class="ui-skeleton__content">${block("ui-skeleton__title")}<span class="ui-skeleton__paragraph">${paragraph()}</span></span>`);
    return root("text", paragraph());
  }

  function dropdownMenu(props = {}) {
    assertProps("dropdown-menu", props);
    const { id = "", trigger = "", triggerLabel = "More actions", items = [], open = false, placement = "bottom-start", ariaLabel = "Menu" } = props;
    enumValue("dropdown-menu", "placement", placement);
    const menuId = id || `dropdown-${String(triggerLabel).toLowerCase().replace(/[^a-z0-9]+/g, "-") || "menu"}`;
    const triggerMarkup = trigger || button({ label: triggerLabel, variant: "secondary", size: 32, shape: "pill", demo: "ui-dropdown-toggle", ariaExpanded: open, ariaControls: `${menuId}-menu` });
    const menuItems = items.map((item, index) => {
      const normalized = typeof item === "string" ? { label: item } : item || {};
      return `<button class="ui-dropdown-menu__item${normalized.danger ? " is-danger" : ""}" type="button" role="menuitem" data-demo="ui-dropdown-item"${normalized.disabled ? " disabled" : ""}>${normalized.icon ? icon(normalized.icon, "ui-dropdown-menu__item-icon") : ""}<span>${escapeHTML(normalized.label || `Action ${index + 1}`)}</span></button>`;
    }).join("");
    return `<div class="ui-dropdown-menu${open ? " is-open" : ""}" data-component="dropdown-menu" data-ui-dropdown${id ? ` id="${escapeHTML(menuId)}"` : ""}>${triggerMarkup}<div class="ui-dropdown-menu__surface" id="${escapeHTML(menuId)}-menu" data-placement="${placement}" role="menu" aria-label="${escapeHTML(ariaLabel)}"${open ? "" : " aria-hidden=\"true\""}>${menuItems}</div></div>`;
  }

  function disclosure(props = {}) {
    assertProps("disclosure", props);
    const { id = "", title = "Details", content = "", open = false, disabled = false, kind = "accordion", ariaLabel = "" } = props;
    enumValue("disclosure", "kind", kind);
    const disclosureId = id || `disclosure-${String(title).toLowerCase().replace(/[^a-z0-9]+/g, "-") || "details"}`;
    return `<section class="ui-disclosure ui-disclosure--${kind}${open ? " is-open" : ""}${disabled ? " is-disabled" : ""}" data-component="disclosure" data-ui-disclosure${id ? ` id="${escapeHTML(disclosureId)}"` : ""}><button class="ui-disclosure__trigger" type="button" data-demo="ui-disclosure-toggle" aria-expanded="${open}" aria-controls="${escapeHTML(disclosureId)}-content"${ariaLabel ? ` aria-label="${escapeHTML(ariaLabel)}"` : ""}${disabled ? " disabled" : ""}><span>${escapeHTML(title)}</span>${icon("Assets/Icons/arrow-down-sm.svg", "ui-disclosure__icon")}</button><div class="ui-disclosure__content" id="${escapeHTML(disclosureId)}-content"${open ? "" : " hidden"}>${content}</div></section>`;
  }

  function segmentedControl(props = {}) {
    assertProps("segmented-control", props);
    const { id = "", options = [], selected = "", size = 40, shape = "pill", contentType = "text", disabled = false, ariaLabel = "Segmented control" } = props;
    enumValue("segmented-control", "size", size);
    enumValue("segmented-control", "shape", shape);
    enumValue("segmented-control", "contentType", contentType);
    const normalized = options.map((option) => typeof option === "string" ? { label: option, value: option } : { ...option, label: option?.label || option?.value || "", value: option?.value || option?.label || "" });
    if (["icon", "role"].includes(contentType) && normalized.some((option) => !option.icon)) throw new Error("Icon segmented-control options require an approved icon and accessible label");
    if (contentType === "role" && normalized.length !== 2) throw new Error("Role segmented-control requires exactly two options");
    const selectedValue = String(selected || normalized.find((option) => option.selected)?.value || normalized[0]?.value || "");
    const buttons = normalized.map((option) => {
      const content = contentType === "icon" ? icon(option.icon, "ui-segmented-control__icon") : (contentType === "role" ? `<span class="ui-segmented-control__role-content">${icon(option.icon, "ui-segmented-control__role-icon")}<span>${escapeHTML(option.label)}</span></span>` : escapeHTML(option.label));
      return `<button type="button" data-demo="ui-segmented-control" data-segment-value="${escapeHTML(option.value)}" aria-label="${escapeHTML(option.label)}" aria-pressed="${String(option.value) === selectedValue}"${disabled || option.disabled ? " disabled" : ""}>${content}</button>`;
    }).join("");
    const roleSwitch = contentType === "role" ? `<span class="ui-segmented-control__role-switch" aria-hidden="true">${icon("Assets/Icons/switch.svg", "ui-segmented-control__role-switch-icon")}</span>` : "";
    return `<div class="ui-segmented-control ui-segmented-control--${size} ui-segmented-control--${shape} ui-segmented-control--${contentType}" data-component="segmented-control" data-ui-segmented-control${id ? ` id="${escapeHTML(id)}"` : ""} role="group" aria-label="${escapeHTML(ariaLabel)}">${buttons}${roleSwitch}</div>`;
  }

  function timeSlot(props = {}) {
    assertProps("time-slot", props);
    const { id = "", label = "09:00", time = "", secondary = "", appearance = "availability", state = "available", selected = false, unavailable = false, held = false, loading = false, disabled = false, duration = 15, teacher = "", calendarDay = "", calendarMinute = null, ariaLabel = "", tooltip: tooltipContent = "", demo = "" } = props;
    enumValue("time-slot", "appearance", appearance);
    enumValue("time-slot", "duration", duration);
    const resolvedState = loading ? "loading" : (selected ? "selected" : (unavailable || disabled ? "unavailable" : (held ? "booked-by-others" : state)));
    enumValue("time-slot", "state", resolvedState);
    const unavailableState = resolvedState === "unavailable" || resolvedState === "booked-by-others" || resolvedState === "booked-by-you" || resolvedState === "loading";
    const stateLabel = { available: "Available", selected: "Selected", unavailable: "Unavailable", "booked-by-others": "Booked by another student", "booked-by-you": "Booked by you", loading: "Loading" }[resolvedState];
    const interval = String(time || label || "Time");
    const tooltipCopy = {
      available: `Book from ${interval}`,
      selected: `Selected: ${interval}`,
      unavailable: "No available time slots",
      "booked-by-others": `Booked by others\n${interval}`,
      "booked-by-you": `You've booked${teacher ? ` with ${teacher}` : ""}\n${interval}`,
      loading: `Checking availability for ${interval}`
    }[resolvedState];
    const slotId = id || `time-slot-${interval.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "interval"}-${resolvedState}`;
    const tooltipId = `${slotId}-tooltip`;
    const classes = ["ui-time-slot", `ui-time-slot--${appearance}`, `ui-time-slot--${duration}`, `is-${resolvedState}`].join(" ");
    const slotLabel = loading ? '<i class="ui-time-slot__spinner" aria-hidden="true"></i>' : (appearance === "availability" ? "" : escapeHTML(label));
    const calendarMetadata = calendarDay ? ` data-calendar-day="${escapeHTML(calendarDay)}"${calendarMinute === null || calendarMinute === undefined ? "" : ` data-calendar-minute="${escapeHTML(calendarMinute)}"`}` : "";
    const tooltipDisabled = appearance === "availability" && resolvedState === "selected";
    const slotControl = `<button class="${classes}" type="button" data-component="time-slot" data-time-slot-state="${resolvedState}" data-time-slot-duration="${escapeHTML(duration)}" data-time-slot-time="${escapeHTML(interval)}"${calendarMetadata} id="${escapeHTML(slotId)}"${demo ? ` data-demo="${escapeHTML(demo)}"` : ""} aria-pressed="${resolvedState === "selected"}" aria-label="${escapeHTML(ariaLabel || `${interval}, ${stateLabel}`)}"${appearance === "availability" && !tooltipDisabled ? ` aria-describedby="${escapeHTML(tooltipId)}"` : ""}${disabled || unavailableState ? " disabled" : ""}><span class="ui-time-slot__label">${slotLabel}</span>${secondary && appearance !== "availability" ? `<small>${escapeHTML(secondary)}</small>` : ""}</button>`;
    if (appearance !== "availability") return slotControl;
    return tooltip({ id: tooltipId, content: tooltipContent || tooltipCopy, placement: "bottom", trigger: slotControl }).replace('class="ui-tooltip-wrap"', `class="ui-tooltip-wrap ui-time-slot__tooltip-wrap${tooltipDisabled ? " is-tooltip-disabled" : ""}"`);
  }

  function timePicker(props = {}) {
    assertProps("time-picker", props);
    const { id = "", label = "Time", placeholder = "Choose a time", slots = [], selected = "", selectionMode = "single", disabled = false, open = false, state = "default", ariaLabel = "" } = props;
    enumValue("time-picker", "state", disabled ? "disabled" : state);
    enumValue("time-picker", "selectionMode", selectionMode);
    const pickerId = id || `time-picker-${String(label).toLowerCase().replace(/[^a-z0-9]+/g, "-") || "time"}`;
    const selectedValues = new Set((Array.isArray(selected) ? selected : [selected]).filter((value) => value !== "" && value !== undefined && value !== null).map(String));
    const normalizedSlots = slots.map((slot, index) => {
      const normalized = typeof slot === "string" ? { label: slot } : slot || {};
      return { ...normalized, value: String(normalized.value || normalized.label || `slot-${index}`), label: String(normalized.label || normalized.value || `slot-${index}`) };
    });
    const selectedLabels = normalizedSlots.filter((slot) => selectedValues.has(slot.value)).map((slot) => slot.label);
    const triggerLabel = selectedLabels.join(", ") || placeholder;
    const triggerIcon = icon("Assets/Icons/16px/time-sm.svg", `ui-time-picker__icon${selectedLabels.length ? "" : " is-placeholder"}`);
    const slotMarkup = normalizedSlots.map((slot) => timeSlot({ id: `${pickerId}-${slot.value}`, label: slot.label, secondary: slot.secondary || "", appearance: "option", state: slot.state || "available", selected: selectedValues.has(slot.value), unavailable: Boolean(slot.unavailable), held: Boolean(slot.held), loading: Boolean(slot.loading), disabled: Boolean(slot.disabled), demo: "ui-time-picker-slot" }).replace('data-demo="ui-time-picker-slot"', `data-demo="ui-time-picker-slot" data-time-picker-value="${escapeHTML(slot.value)}"`)).join("");
    const classes = ["ui-time-picker", `ui-time-picker--${selectionMode}`, open ? "is-open" : "", disabled ? "is-disabled" : "", state === "default" ? "" : `is-${state}`].filter(Boolean).join(" ");
    return `<div class="${classes}" data-component="time-picker" data-ui-time-picker data-time-picker-selection-mode="${selectionMode}" data-time-picker-placeholder="${escapeHTML(placeholder)}"${id ? ` id="${escapeHTML(pickerId)}"` : ""}><button class="ui-time-picker__trigger" type="button" data-demo="ui-time-picker-toggle" role="combobox" aria-label="${escapeHTML(ariaLabel || label)}" aria-expanded="${open}" aria-controls="${escapeHTML(pickerId)}-menu"${disabled ? " disabled" : ""}>${triggerIcon}<span class="${selectedLabels.length ? "" : "ui-time-picker__placeholder"}">${escapeHTML(triggerLabel)}</span>${icon("Assets/Icons/arrow-down-sm.svg", "ui-time-picker__suffix")}</button><div class="ui-time-picker__menu" id="${escapeHTML(pickerId)}-menu" role="listbox" aria-label="${escapeHTML(label)} options"${selectionMode === "multiple" ? ' aria-multiselectable="true"' : ""}${open ? "" : " aria-hidden=\"true\""}>${slotMarkup}</div></div>`;
  }

  function calendar(props = {}) {
    assertProps("calendar", props);
    const { id = "", variant = "availability", timezone = "Asia/Shanghai", weekLabel = "15–21 December 2025", todayLabel = "Today", dates = [], rows = [], weekViews = [], activeWeek = 0, todayWeek = 0, timePicker: timePickerProps = null, availabilityLabel = "", teacherAvailability = [], recordTitle = "My lessons", recordMonths = [], recordStats = [], weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], disabled = false, ariaLabel = "Weekly availability", demo = "" } = props;
    enumValue("calendar", "variant", variant);
    if (variant === "lesson-record") {
      if (!Array.isArray(recordMonths) || !recordMonths.length) throw new Error("lesson-record calendar requires ordered recordMonths");
      if (!Array.isArray(weekdays) || weekdays.length !== 7) throw new Error("lesson-record calendar requires seven weekday labels");
      if (!Array.isArray(recordStats)) throw new Error("lesson-record calendar recordStats must be an array");
      const validRecordStates = new Set(["empty", "info", "success", "mixed", "selected", "out-of-range"]);
      const calendarId = id || `calendar-${String(recordTitle).toLowerCase().replace(/[^a-z0-9]+/g, "-") || "lesson-record"}`;
      const normalizedMonths = recordMonths.map((month, monthIndex) => {
        if (!month || !month.label || !Array.isArray(month.weeks) || !month.weeks.length) throw new Error(`lesson-record month ${monthIndex + 1} requires a label and ordered weeks`);
        const weeks = month.weeks.map((week, weekIndex) => {
          if (!Array.isArray(week) || week.length !== 7) throw new Error(`lesson-record month ${monthIndex + 1} week ${weekIndex + 1} requires seven cells`);
          return week.map((cell, dayIndex) => {
            const normalized = typeof cell === "string" ? { state: cell } : (cell || {});
            const state = normalized.state || "empty";
            if (!validRecordStates.has(state)) throw new Error(`Unknown lesson-record cell state: ${state}`);
            return { state, label: normalized.label || `${month.label}, ${weekdays[dayIndex]}, ${state.replaceAll("-", " ")}` };
          });
        });
        return { id: month.id || `month-${monthIndex + 1}`, label: month.label, current: Boolean(month.current), weeks };
      });
      const stats = recordStats.map((stat, index) => {
        if (!stat || !stat.label || stat.value === undefined || stat.value === null) throw new Error(`lesson-record stat ${index + 1} requires a label and value`);
        const tone = stat.tone === "success" ? "success" : "info";
        return `<div class="ui-calendar__record-stat"><span class="ui-calendar__record-stat-label"><i class="is-${tone}" aria-hidden="true"></i>${escapeHTML(stat.label)}</span><strong>${escapeHTML(String(stat.value))}</strong></div>`;
      }).join("");
      const monthMarkup = normalizedMonths.map((month) => {
        const cells = month.weeks.flat().map((cell) => `<span class="ui-calendar__record-cell is-${escapeHTML(cell.state)}" aria-label="${escapeHTML(cell.label)}"></span>`).join("");
        return `<section class="ui-calendar__record-month${month.current ? " is-current" : ""}" aria-label="${escapeHTML(month.label)}"><h3>${escapeHTML(month.label)}</h3><div class="ui-calendar__record-weeks">${cells}</div></section>`;
      }).join("");
      return `<section class="ui-calendar ui-calendar--lesson-record${disabled ? " is-disabled" : ""}" data-component="calendar" data-ui-calendar data-calendar-variant="lesson-record" id="${escapeHTML(calendarId)}"${demo ? ` data-demo="${escapeHTML(demo)}"` : ""} aria-label="${escapeHTML(ariaLabel)}"><header class="ui-calendar__record-header"><h2>${escapeHTML(recordTitle)}</h2>${stats ? `<div class="ui-calendar__record-summary">${stats}</div>` : ""}</header><div class="ui-calendar__record-scroll"><div class="ui-calendar__record-grid" role="img" aria-label="${escapeHTML(ariaLabel)}" style="--ui-record-month-count:${normalizedMonths.length}"><div class="ui-calendar__record-days">${weekdays.map((day) => `<span>${escapeHTML(day)}</span>`).join("")}</div>${monthMarkup}</div></div></section>`;
    }
    if (variant === "compact-availability") {
      if (!Array.isArray(dates) || dates.length !== 7) throw new Error("compact-availability calendar requires seven ordered date headers");
      if (!Array.isArray(rows) || !rows.length) throw new Error("compact-availability calendar requires ordered time-band rows");
      const validCompactStates = new Set(["available", "unavailable"]);
      const calendarId = id || `calendar-${String(weekLabel).toLowerCase().replace(/[^a-z0-9]+/g, "-") || "compact-availability"}`;
      const normalizedDates = dates.map((date, index) => typeof date === "string" ? { id: `day-${index + 1}`, label: date, date: "" } : { ...date, id: date?.id || `day-${index + 1}`, label: date?.label || `Day ${index + 1}`, date: date?.date || "" });
      const normalizedRows = rows.map((row, index) => {
        const normalized = typeof row === "string" ? { id: `time-${index + 1}`, label: row, slots: [] } : (row || {});
        if (!Array.isArray(normalized.slots) || normalized.slots.length !== 7) throw new Error(`compact-availability row ${index + 1} requires seven supplied cells`);
        return { ...normalized, id: normalized.id || `time-${index + 1}`, label: normalized.label || `Time ${index + 1}` };
      });
      const durationForBand = (label) => {
        const values = String(label).match(/\d{1,2}/g)?.map(Number) || [];
        if (values.length < 2) return 0;
        const duration = (values[1] - values[0] + 24) % 24;
        return duration || 24;
      };
      const durationLabel = (hours) => `${hours} ${hours === 1 ? "hour" : "hours"}`;
      const dateHeader = normalizedDates.map((date) => `<div class="ui-calendar__compact-date" role="columnheader"><span>${escapeHTML(date.label)}</span>${date.date ? `<strong>${escapeHTML(date.date)}</strong>` : ""}</div>`).join("");
      const timeRows = normalizedRows.map((row) => {
        const cells = row.slots.map((supplied, index) => {
          const cell = typeof supplied === "string" ? { state: supplied } : (supplied || {});
          const state = cell.state || "unavailable";
          if (!validCompactStates.has(state)) throw new Error(`Unknown compact-availability cell state: ${state}`);
          const date = normalizedDates[index];
          const suppliedHours = Number(cell.hours);
          const hours = Number.isFinite(suppliedHours) && suppliedHours > 0 ? suppliedHours : durationForBand(row.label);
          const duration = durationLabel(hours);
          const label = cell.ariaLabel || `${row.label}, ${date.label}${date.date ? ` ${date.date}` : ""}, ${state === "available" ? `${duration} available` : state}`;
          const cellMarkup = `<span class="ui-calendar__compact-cell is-${escapeHTML(state)}" role="gridcell" aria-label="${escapeHTML(label)}"></span>`;
          const tooltipPlacement = index === 0 ? "top-left" : (index === row.slots.length - 1 ? "top-right" : "top");
          const tooltipEdge = index === 0 ? " is-start-edge" : (index === row.slots.length - 1 ? " is-end-edge" : "");
          return state === "available"
            ? tooltip({ id: `${calendarId}-${row.id}-${date.id}-availability`, content: cell.tooltip || duration, placement: tooltipPlacement, trigger: cellMarkup }).replace('class="ui-tooltip-wrap"', `class="ui-tooltip-wrap ui-calendar__compact-tooltip${tooltipEdge}"`)
            : cellMarkup;
        }).join("");
        return `<div class="ui-calendar__compact-row" role="row"><div class="ui-calendar__compact-time" role="rowheader">${escapeHTML(row.label)}</div>${cells}</div>`;
      }).join("");
      return `<section class="ui-calendar ui-calendar--compact-availability${disabled ? " is-disabled" : ""}" data-component="calendar" data-ui-calendar data-calendar-variant="compact-availability" id="${escapeHTML(calendarId)}"${demo ? ` data-demo="${escapeHTML(demo)}"` : ""} aria-label="${escapeHTML(ariaLabel)}"><div class="ui-calendar__compact-scroll"><div class="ui-calendar__compact-grid" role="grid" aria-label="${escapeHTML(ariaLabel)}"><div class="ui-calendar__compact-header" role="row"><div class="ui-calendar__compact-corner" aria-hidden="true"></div>${dateHeader}</div>${timeRows}</div></div><p class="ui-calendar__compact-timezone">Based on your timezone: ${escapeHTML(timezone)}</p></section>`;
    }
    if (variant === "teacher-availability") {
      if (!Array.isArray(teacherAvailability) || teacherAvailability.length !== 7) throw new Error("teacher-availability calendar requires seven ordered day entries");
      const validTeacherStates = new Set(["available", "unavailable"]);
      const calendarId = id || `calendar-${String(weekLabel).toLowerCase().replace(/[^a-z0-9]+/g, "-") || "teacher-availability"}`;
      const normalizedDays = teacherAvailability.map((day, dayIndex) => {
        if (!day || !day.label || day.date === undefined || !Array.isArray(day.slots)) throw new Error(`teacher-availability day ${dayIndex + 1} requires label, date, and slots`);
        const slots = day.slots.map((supplied, slotIndex) => {
          const slot = typeof supplied === "string" ? { label: supplied, state: "available" } : (supplied || {});
          const state = slot.state || (slot.label ? "available" : "unavailable");
          if (!validTeacherStates.has(state)) throw new Error(`Unknown teacher-availability cell state: ${state}`);
          if (state === "available" && !slot.label) throw new Error(`teacher-availability available cell ${dayIndex + 1}:${slotIndex + 1} requires a label`);
          return { state, label: slot.label || "", ariaLabel: slot.ariaLabel || "" };
        });
        return { id: day.id || `day-${dayIndex + 1}`, label: day.label, date: String(day.date), current: Boolean(day.current), slots };
      });
      const rowCount = Math.max(1, ...normalizedDays.map((day) => day.slots.length));
      const action = (actionName, buttonProps) => button({ ...buttonProps, demo: "ui-calendar-action" }).replace('data-demo="ui-calendar-action"', `data-demo="ui-calendar-action" data-calendar-action="${actionName}"`);
      const activeDayIndex = Math.max(0, normalizedDays.findIndex((day) => day.current));
      const previous = action("previous-date", { label: "Previous date", variant: "secondary", size: 32, shape: "pill", leadingIcon: "Assets/Icons/arrow-left-sm.svg", iconOnly: true, ariaLabel: "Previous date" });
      const next = action("next-date", { label: "Next date", variant: "secondary", size: 32, shape: "pill", leadingIcon: "Assets/Icons/arrow-right-sm.svg", iconOnly: true, ariaLabel: "Next date" });
      const header = normalizedDays.map((day, index) => `<button class="ui-calendar__teacher-date${day.current ? " is-current" : ""}${index === activeDayIndex ? " is-selected-date" : ""}" type="button" role="columnheader" data-demo="ui-teacher-date" data-teacher-date-index="${index}" data-teacher-date-label="${escapeHTML(`${day.label} ${day.date}`)}" aria-pressed="${index === activeDayIndex}"><span>${escapeHTML(day.label)}</span><strong>${escapeHTML(day.date)}</strong></button>`).join("");
      const scheduleRows = Array.from({ length: rowCount }, (_, rowIndex) => {
        const cells = normalizedDays.map((day, dayIndex) => {
          const slot = day.slots[rowIndex] || { state: "unavailable", label: "" };
          const cellLabel = slot.ariaLabel || `${day.label} ${day.date}, ${slot.label || "unavailable"}`;
          return `<div class="ui-calendar__teacher-cell is-${escapeHTML(slot.state)}${dayIndex === activeDayIndex ? " is-active-date" : ""}" role="gridcell" data-teacher-date-index="${dayIndex}" aria-label="${escapeHTML(cellLabel)}">${slot.label ? `<span>${escapeHTML(slot.label)}</span>` : ""}</div>`;
        }).join("");
        return `<div class="ui-calendar__teacher-row" role="row">${cells}</div>`;
      }).join("");
      return `<section class="ui-calendar ui-calendar--teacher-availability${disabled ? " is-disabled" : ""}" data-component="calendar" data-ui-calendar data-calendar-variant="teacher-availability" data-teacher-active-date="${activeDayIndex}" id="${escapeHTML(calendarId)}"${demo ? ` data-demo="${escapeHTML(demo)}"` : ""} aria-label="${escapeHTML(ariaLabel)}"><header class="ui-calendar__teacher-controls"><p class="ui-calendar__teacher-availability-label" role="status">${escapeHTML(availabilityLabel)}</p><nav class="ui-calendar__teacher-week-navigation" aria-label="Date navigation">${previous}${next}</nav></header><div class="ui-calendar__teacher-grid-shell"><div class="ui-calendar__teacher-grid" role="grid" aria-label="${escapeHTML(ariaLabel)}"><div class="ui-calendar__teacher-header" role="row">${header}</div><div class="ui-calendar__teacher-scroll"><div class="ui-calendar__teacher-schedule" role="rowgroup">${scheduleRows}</div></div></div></div></section>`;
    }
    const suppliedViews = Array.isArray(weekViews) && weekViews.length ? weekViews : [{ weekLabel, dates, rows }];
    const normalizeAvailabilityView = (view, viewIndex) => {
      if (!view || !Array.isArray(view.dates) || !view.dates.length) throw new Error(`calendar week view ${viewIndex + 1} requires ordered dates`);
      if (!Array.isArray(view.rows) || !view.rows.length) throw new Error(`calendar week view ${viewIndex + 1} requires ordered time rows`);
      return {
        weekLabel: view.weekLabel || weekLabel,
        dates: view.dates.map((date, index) => typeof date === "string" ? { id: `day-${index + 1}`, label: date, date: "" } : { ...date, id: date?.id || `day-${index + 1}`, label: date?.label || `Day ${index + 1}`, date: date?.date || "" }),
        rows: view.rows.map((row, index) => typeof row === "string" ? { id: `time-${index + 1}`, label: row, slots: [] } : { ...row, id: row?.id || `time-${index + 1}`, label: row?.label || `Time ${index + 1}`, slots: Array.isArray(row?.slots) ? row.slots : [] })
      };
    };
    const normalizedWeekViews = suppliedViews.map(normalizeAvailabilityView);
    const activeWeekIndex = Math.max(0, Math.min(normalizedWeekViews.length - 1, Number(activeWeek) || 0));
    const todayWeekIndex = Math.max(0, Math.min(normalizedWeekViews.length - 1, Number(todayWeek) || 0));
    const currentView = normalizedWeekViews[activeWeekIndex];
    const displayedWeekLabel = currentView.weekLabel;
    const calendarId = id || `calendar-${String(displayedWeekLabel).toLowerCase().replace(/[^a-z0-9]+/g, "-") || "availability"}`;
    const normalizedDates = currentView.dates;
    const normalizedRows = currentView.rows;
    const timeAtOffset = (label, offset) => {
      const match = String(label).trim().match(/^(\d{1,2}):(\d{2})(?:\s*([AaPp][Mm]))?$/);
      if (!match) return String(label);
      const [, rawHour, rawMinute, suffix = ""] = match;
      let minutes = Number(rawHour) * 60 + Number(rawMinute) + offset;
      if (suffix) {
        const initialHour = Number(rawHour) % 12;
        minutes = (initialHour + (suffix.toLowerCase() === "pm" ? 12 : 0)) * 60 + Number(rawMinute) + offset;
      }
      minutes = ((minutes % 1440) + 1440) % 1440;
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;
      const displayHour = suffix ? (rawHour === "00" && hour < 12 ? hour : (hour % 12 || 12)) : hour;
      const paddedHour = rawHour.length === 2 ? String(displayHour).padStart(2, "0") : String(displayHour);
      const displaySuffix = suffix ? ` ${hour >= 12 ? "PM" : "AM"}` : "";
      return `${paddedHour}:${String(minute).padStart(2, "0")}${displaySuffix}`;
    };
    const timeOfDayMinutes = (label) => {
      const match = String(label).trim().match(/^(\d{1,2}):(\d{2})(?:\s*([AaPp][Mm]))?$/);
      if (!match) return 0;
      const [, rawHour, rawMinute, suffix = ""] = match;
      const parsedHour = Number(rawHour);
      const minute = Number(rawMinute);
      if (!suffix) return parsedHour * 60 + minute;
      return ((parsedHour % 12) + (suffix.toLowerCase() === "pm" ? 12 : 0)) * 60 + minute;
    };
    const normalizeQuarterHours = (supplied, rowLabel) => {
      const values = (Array.isArray(supplied) ? supplied : [supplied]).map((slot) => typeof slot === "string" ? { state: slot } : (slot || {}));
      const source = values.length ? values : [{}];
      // Calendar accepts quarter-hour source data, but its visible grid groups it
      // into two 30-minute rows so 15-minute separator lines never appear.
      const quarters = source.length === 4
        ? source
        : source.length === 2
          ? [source[0], source[0], source[1], source[1]]
          : Array.from({ length: 4 }, (_, index) => source[Math.min(Math.floor(index * source.length / 4), source.length - 1)]);
      return quarters.map((slot, index) => ({
        ...slot,
        time: source.length === 4 ? (slot.time || slot.label || timeAtOffset(rowLabel, index * 15)) : timeAtOffset(rowLabel, index * 15)
      }));
    };
    const dateHeader = normalizedDates.map((date) => `<div class="ui-calendar__date${date.current ? " is-current" : ""}" role="columnheader"><span>${escapeHTML(date.label)}</span>${date.date ? `<strong>${escapeHTML(date.date)}</strong>` : ""}</div>`).join("");
    const timeRows = normalizedRows.map((row) => {
      const rowStartMinute = timeOfDayMinutes(row.label);
      const cells = normalizedDates.map((date, index) => {
        const quarterHours = normalizeQuarterHours(row.slots[index], row.label);
        const groups = [0, 2].map((startIndex) => {
          const units = quarterHours.slice(startIndex, startIndex + 2);
          const primary = units[0] || {};
          return { state: primary.state || "available", disabled: units.some((slot) => Boolean(slot.disabled)), tooltip: primary.tooltip || "", teacher: primary.teacher || "", units, startIndex };
        });
        const segments = groups.map((group) => {
          /* The segment paints as one 30-minute block, but each quarter stays
             its own control so hover previews and booking can start on any
             15-minute boundary. */
          const controls = group.units.map((slot, unitIndex) => {
            const quarterIndex = group.startIndex + unitIndex;
            const start = slot.time;
            const end = timeAtOffset(row.label, (quarterIndex + 1) * 15);
            const interval = `${start} – ${end}`;
            const minute = rowStartMinute + quarterIndex * 15;
            const state = slot.state || group.state;
            return timeSlot({ id: `${calendarId}-${row.id}-${date.id}-${quarterIndex + 1}`, time: interval, label: interval, secondary: slot.secondary || "", appearance: "availability", duration: 15, state, disabled: Boolean(disabled || slot.disabled || group.disabled), teacher: slot.teacher || group.teacher || "", calendarDay: date.id, calendarMinute: minute, ariaLabel: slot.ariaLabel || `${date.label}${date.date ? ` ${date.date}` : ""}, ${interval}, ${state.replaceAll("-", " ")}`, tooltip: slot.tooltip || group.tooltip || "", demo: "ui-calendar-slot" });
          }).join("");
          return `<div class="ui-calendar__slot-segment" role="gridcell">${controls}</div>`;
        }).join("");
        return `<div class="ui-calendar__slot">${segments}</div>`;
      }).join("");
      return `<div class="ui-calendar__row" role="row"><div class="ui-calendar__time" role="rowheader">${escapeHTML(row.label)}</div>${cells}</div>`;
    }).join("");
    const selectedTime = timePickerProps ? timePicker({ id: `${calendarId}-time-picker`, ...timePickerProps }) : "";
    const action = (actionName, buttonProps) => button({ ...buttonProps, demo: "ui-calendar-action" }).replace('data-demo="ui-calendar-action"', `data-demo="ui-calendar-action" data-calendar-action="${actionName}"`);
    const hasWeekViews = normalizedWeekViews.length > 1;
    const previous = action("previous-week", { label: "Previous week", variant: "secondary", size: 32, shape: "pill", leadingIcon: "Assets/Icons/arrow-left-sm.svg", iconOnly: true, ariaLabel: "Previous week", disabled: hasWeekViews && activeWeekIndex === 0 });
    const next = action("next-week", { label: "Next week", variant: "secondary", size: 32, shape: "pill", leadingIcon: "Assets/Icons/arrow-right-sm.svg", iconOnly: true, ariaLabel: "Next week", disabled: hasWeekViews && activeWeekIndex === normalizedWeekViews.length - 1 });
    const today = action("today", { label: todayLabel, variant: "secondary", size: 32, shape: "pill", leadingIcon: "Assets/Icons/16px/today-sm.svg" });
    const scrollable = normalizedRows.length > 12;
    const calendarConfig = hasWeekViews ? escapeHTML(JSON.stringify({ id: calendarId, variant, timezone, weekLabel, todayLabel, weekViews, todayWeek: todayWeekIndex, timePicker: timePickerProps, disabled, ariaLabel, demo })) : "";
    return `<section class="ui-calendar${scrollable ? " ui-calendar--scrollable" : ""}${disabled ? " is-disabled" : ""}" data-component="calendar" data-ui-calendar data-calendar-week-index="${activeWeekIndex}" data-calendar-today-week="${todayWeekIndex}"${calendarConfig ? ` data-calendar-config="${calendarConfig}"` : ""} id="${escapeHTML(calendarId)}"${demo ? ` data-demo="${escapeHTML(demo)}"` : ""} aria-label="${escapeHTML(ariaLabel)}"><header class="ui-calendar__controls"><div class="ui-calendar__context"><span class="ui-calendar__timezone"><span class="ui-calendar__timezone-icon" aria-hidden="true"></span><span>${escapeHTML(timezone)}</span></span>${selectedTime ? `<div class="ui-calendar__time-picker">${selectedTime}</div>` : ""}</div><div class="ui-calendar__actions">${today}<div class="ui-calendar__week-navigation">${previous}<strong>${escapeHTML(displayedWeekLabel)}</strong>${next}</div></div></header><div class="ui-calendar__scroll"><div class="ui-calendar__grid" role="grid" aria-label="${escapeHTML(ariaLabel)}" style="--ui-calendar-day-count:${normalizedDates.length};--ui-calendar-grid-height:${(normalizedRows.length + 1) * 40}px"><div class="ui-calendar__row ui-calendar__row--header" role="row"><div class="ui-calendar__corner" aria-hidden="true"></div>${dateHeader}</div>${timeRows}</div></div></section>`;
  }

  function popover(props = {}) {
    assertProps("popover", props);
    return popup(props).replace('data-component="popup"', 'data-component="popover"').replace('data-ui-popup', 'data-ui-popup data-ui-popover');
  }

  function footer(props = {}) {
    assertProps("footer", props);
    const { id = "", columns = [], utilities = "", copyright = "", legalLinks = [], socialLinks = [], ariaLabel = "Footer", demo = "" } = props;
    if (!Array.isArray(columns) || !columns.length) throw new Error("footer requires at least one supplied column");
    if (!Array.isArray(legalLinks) || !Array.isArray(socialLinks)) throw new Error("footer legalLinks and socialLinks must be arrays");
    const footerLinks = (links, context) => {
      if (!Array.isArray(links)) throw new Error(`${context} requires a link list`);
      return links.map((link) => {
        const normalized = typeof link === "string" ? { label: link } : link || {};
        if (!normalized.label) throw new Error("footer links require a label");
        return `<a class="ui-footer__link" href="${escapeHTML(normalized.href || "#")}">${escapeHTML(normalized.label)}</a>`;
      }).join("");
    };
    const renderedColumns = columns.map((column, index) => {
      if (!column) throw new Error(`footer column ${index + 1} is required`);
      const groups = Array.isArray(column.groups)
        ? column.groups
        : (column.heading && Array.isArray(column.links) ? [{ heading: column.heading, links: column.links }] : []);
      if (!groups.length) throw new Error(`footer column ${index + 1} requires a group or heading and links`);
      const groupMarkup = groups.map((group, groupIndex) => {
        if (!group || !group.heading) throw new Error(`footer column ${index + 1} group ${groupIndex + 1} requires a heading`);
        return `<section class="ui-footer__group"><h2>${escapeHTML(group.heading)}</h2><div class="ui-footer__links">${footerLinks(group.links, `footer column ${index + 1} group ${groupIndex + 1}`)}</div></section>`;
      }).join("");
      return `<nav class="ui-footer__column" aria-label="Footer navigation group ${index + 1}">${groupMarkup}</nav>`;
    }).join("");
    const legalMarkup = legalLinks.map((link) => {
      const normalized = typeof link === "string" ? { label: link } : link || {};
      if (!normalized.label) throw new Error("footer legal links require a label");
      return `<a class="ui-footer__legal-link" href="${escapeHTML(normalized.href || "#")}">${escapeHTML(normalized.label)}</a>`;
    }).join("");
    const socialMarkup = socialLinks.map((link) => {
      if (!link?.label || !link?.icon) throw new Error("footer social links require label and approved icon");
      if (!approvedAsset(link.icon)) throw new Error(`Unapproved asset: ${link.icon}`);
      return `<a class="ui-footer__social-link" href="${escapeHTML(link.href || "#")}" aria-label="${escapeHTML(link.label)}">${icon(link.icon, "ui-footer__social-icon")}</a>`;
    }).join("");
    const copyrightBand = copyright ? `<div class="ui-footer__copyright-band"><span class="ui-footer__copyright">${escapeHTML(copyright)}</span></div>` : "";
    const lower = legalMarkup || socialMarkup ? `<div class="ui-footer__bottom"><div class="ui-footer__bottom-inner">${legalMarkup ? `<nav class="ui-footer__legal" aria-label="Footer legal links">${legalMarkup}</nav>` : ""}${socialMarkup ? `<div class="ui-footer__social" aria-label="Footer social links">${socialMarkup}</div>` : ""}</div></div>` : "";
    const columnCount = columns.length + (utilities ? 1 : 0);
    return `<footer class="ui-footer" data-component="footer"${id ? ` id="${escapeHTML(id)}"` : ""}${demo ? ` data-demo="${escapeHTML(demo)}"` : ""} aria-label="${escapeHTML(ariaLabel)}"><div class="ui-footer__upper" style="--ui-footer-column-count:${columnCount}"><div class="ui-footer__columns">${renderedColumns}</div>${utilities ? `<div class="ui-footer__utilities">${utilities}</div>` : ""}</div>${copyrightBand}${lower}</footer>`;
  }

  const drawerRoot = (element) => element?.closest?.("[data-ui-drawer]");
  const drawerTrigger = (root) => root?.querySelector?.('[data-demo="ui-drawer-open"]');

  function setDrawerOpen(element, open) {
    const root = drawerRoot(element) || element;
    if (!root?.classList?.contains("ui-drawer-stage")) return false;
    root.classList.toggle("is-open", Boolean(open));
    root.querySelector(".ui-drawer__layer")?.toggleAttribute("aria-hidden", !open);
    drawerTrigger(root)?.setAttribute("aria-expanded", String(Boolean(open)));
    if (open) {
      global.setTimeout?.(() => {
        const dialog = root.querySelector('[role="dialog"]');
        // Opening a transformed inline Drawer must not ask the browser to scroll
        // its trigger or the catalog viewport into a new position.
        dialog?.focus?.({ preventScroll: true });
      }, 0);
    }
    else drawerTrigger(root)?.focus();
    return true;
  }

  function openDrawer(control) { return setDrawerOpen(control, true); }
  function closeDrawer(control) { return setDrawerOpen(control, false); }
  function handleDrawerKeydown(event) {
    if (event.key !== "Escape") return false;
    const root = drawerRoot(event.target) || global.document?.querySelector?.("[data-ui-drawer].is-open");
    if (!root?.classList?.contains("is-open") || root.dataset.keyboardClosable === "false") return false;
    event.preventDefault();
    return closeDrawer(root);
  }

  function setNumberStepperValue(control, nextValue) {
    const root = control?.closest?.("[data-ui-number-stepper]") || control;
    if (!root || root.classList.contains("is-disabled")) return false;
    const min = Number(root.dataset.min || 0);
    const max = Number(root.dataset.max || 0);
    const step = Math.max(1, Number(root.dataset.step || 1));
    const value = Math.max(min, Math.min(max, Number(nextValue)));
    root.querySelector("[data-ui-number-stepper-value]").textContent = value;
    const decrement = root.querySelector('[data-demo="ui-number-stepper-decrement"]');
    const increment = root.querySelector('[data-demo="ui-number-stepper-increment"]');
    if (decrement) decrement.disabled = value <= min;
    if (increment) increment.disabled = value >= max;
    root.dataset.value = String(value);
    root.dataset.step = String(step);
    return true;
  }

  function adjustNumberStepper(control, direction) {
    const root = control?.closest?.("[data-ui-number-stepper]");
    if (!root) return false;
    const current = Number(root.querySelector("[data-ui-number-stepper-value]")?.textContent || 0);
    return setNumberStepperValue(root, current + (Math.max(1, Number(root.dataset.step || 1)) * direction));
  }

  function toggleDropdownMenu(control) {
    const root = control?.closest?.("[data-ui-dropdown]");
    if (!root) return false;
    const open = !root.classList.contains("is-open");
    global.document?.querySelectorAll?.("[data-ui-dropdown].is-open").forEach((menu) => { if (menu !== root) menu.classList.remove("is-open"); });
    root.classList.toggle("is-open", open);
    root.querySelector(".ui-dropdown-menu__surface")?.toggleAttribute("aria-hidden", !open);
    root.querySelector('[data-demo="ui-dropdown-toggle"]')?.setAttribute("aria-expanded", String(open));
    return open;
  }

  function closeDropdownMenus(except = null) {
    global.document?.querySelectorAll?.("[data-ui-dropdown].is-open").forEach((root) => {
      if (root !== except) {
        root.classList.remove("is-open");
        root.querySelector(".ui-dropdown-menu__surface")?.setAttribute("aria-hidden", "true");
        root.querySelector('[data-demo="ui-dropdown-toggle"]')?.setAttribute("aria-expanded", "false");
      }
    });
  }

  function toggleDisclosure(control) {
    const root = control?.closest?.("[data-ui-disclosure]");
    if (!root || root.classList.contains("is-disabled")) return false;
    const open = !root.classList.contains("is-open");
    root.classList.toggle("is-open", open);
    root.querySelector(".ui-disclosure__trigger")?.setAttribute("aria-expanded", String(open));
    root.querySelector(".ui-disclosure__content")?.toggleAttribute("hidden", !open);
    return open;
  }

  function selectSegmentedControl(control) {
    const root = control?.closest?.("[data-ui-segmented-control]");
    if (!root || control.disabled) return false;
    root.querySelectorAll("button").forEach((button) => button.setAttribute("aria-pressed", String(button === control)));
    return true;
  }

  function toggleTimePicker(control) {
    const root = control?.closest?.("[data-ui-time-picker]");
    if (!root || root.classList.contains("is-disabled")) return false;
    const open = !root.classList.contains("is-open");
    closeTimePickers(root);
    root.classList.toggle("is-open", open);
    root.querySelector(".ui-time-picker__trigger")?.setAttribute("aria-expanded", String(open));
    root.querySelector(".ui-time-picker__menu")?.toggleAttribute("aria-hidden", !open);
    return open;
  }

  function closeTimePickers(except = null) {
    global.document?.querySelectorAll?.("[data-ui-time-picker].is-open").forEach((root) => {
      if (root !== except) {
        root.classList.remove("is-open");
        root.querySelector(".ui-time-picker__trigger")?.setAttribute("aria-expanded", "false");
        root.querySelector(".ui-time-picker__menu")?.setAttribute("aria-hidden", "true");
      }
    });
  }

  function selectTimePickerSlot(control) {
    const root = control?.closest?.("[data-ui-time-picker]");
    if (!root || control.disabled) return false;
    const multiple = root.dataset.timePickerSelectionMode === "multiple";
    if (multiple) {
      const selected = !control.classList.contains("is-selected");
      control.setAttribute("aria-pressed", String(selected));
      control.classList.toggle("is-selected", selected);
    } else root.querySelectorAll(".ui-time-slot").forEach((slot) => {
      const selected = slot === control;
      slot.setAttribute("aria-pressed", String(selected));
      slot.classList.toggle("is-selected", selected);
    });
    const selectedLabels = [...root.querySelectorAll(".ui-time-slot.is-selected")].map((slot) => slot.querySelector(".ui-time-slot__label")?.textContent || "").filter(Boolean);
    const trigger = root.querySelector(".ui-time-picker__trigger span");
    if (trigger) {
      trigger.textContent = selectedLabels.join(", ") || root.dataset.timePickerPlaceholder || "Choose a time";
      trigger.classList.toggle("ui-time-picker__placeholder", selectedLabels.length === 0);
    }
    root.querySelector(".ui-time-picker__icon")?.classList.toggle("is-placeholder", selectedLabels.length === 0);
    if (!multiple) {
      root.classList.remove("is-open");
      root.querySelector(".ui-time-picker__trigger")?.setAttribute("aria-expanded", "false");
      root.querySelector(".ui-time-picker__menu")?.setAttribute("aria-hidden", "true");
    }
    return true;
  }

  function selectCalendarSlot(control) {
    const root = control?.closest?.("[data-ui-calendar]");
    if (!root || control.disabled || root.classList.contains("is-disabled")) return false;
    const day = control.dataset.calendarDay;
    const startMinute = Number(control.dataset.calendarMinute);
    if (!day || !Number.isFinite(startMinute)) return false;
    const daySlots = [...root.querySelectorAll(`.ui-calendar__slot .ui-time-slot[data-calendar-day="${day}"]`)]
      .sort((left, right) => Number(left.dataset.calendarMinute) - Number(right.dataset.calendarMinute));
    const unitMinutes = daySlots.reduce((smallest, slot, index) => {
      if (!index) return smallest;
      const gap = Number(slot.dataset.calendarMinute) - Number(daySlots[index - 1].dataset.calendarMinute);
      return Number.isFinite(gap) && gap > 0 ? Math.min(smallest, gap) : smallest;
    }, 60);
    const selectedRange = daySlots
      .filter((slot) => {
        const minute = Number(slot.dataset.calendarMinute);
        return Number.isFinite(minute) && minute >= startMinute && minute < startMinute + 60;
      })
      .sort((left, right) => Number(left.dataset.calendarMinute) - Number(right.dataset.calendarMinute));
    const expectedUnits = Math.round(60 / unitMinutes);
    if (selectedRange.length !== expectedUnits || selectedRange.some((slot) => slot.disabled || !slot.classList.contains("is-available") && slot !== control && !slot.classList.contains("is-selected"))) return false;
    root.querySelectorAll(".ui-calendar__slot-segment.is-calendar-selected-range").forEach((segment) => segment.classList.remove("is-calendar-selected-range"));
    root.querySelectorAll(".ui-calendar__slot .ui-time-slot.is-selected").forEach((slot) => {
      slot.classList.remove("is-selected");
      slot.classList.add("is-available");
      slot.dataset.timeSlotState = "available";
      slot.setAttribute("aria-pressed", "false");
      slot.setAttribute("aria-describedby", `${slot.id}-tooltip`);
      slot.closest(".ui-time-slot__tooltip-wrap")?.classList.remove("is-tooltip-disabled");
    });
    selectedRange.forEach((slot) => {
      slot.classList.remove("is-available");
      slot.classList.add("is-selected");
      slot.dataset.timeSlotState = "selected";
      slot.setAttribute("aria-pressed", "true");
      slot.removeAttribute("aria-describedby");
      slot.closest(".ui-time-slot__tooltip-wrap")?.classList.add("is-tooltip-disabled");
      slot.closest(".ui-calendar__slot-segment")?.classList.add("is-calendar-selected-range");
    });
    if (typeof global.CustomEvent === "function") root.dispatchEvent(new global.CustomEvent("italki:calendar-change", { bubbles: true, detail: { id: control.id, value: control.getAttribute("aria-label"), duration: 60 } }));
    return true;
  }

  function positionCalendarTooltip(wrapper) {
    const calendar = wrapper?.closest?.(".ui-calendar--scrollable");
    const tooltipElement = wrapper?.querySelector?.(".ui-tooltip");
    if (!calendar || !tooltipElement) return false;
    const rect = wrapper.getBoundingClientRect();
    const viewportWidth = global.innerWidth || global.document?.documentElement?.clientWidth || 0;
    const viewportHeight = global.innerHeight || global.document?.documentElement?.clientHeight || 0;
    const left = Math.max(12, Math.min(viewportWidth - 12, rect.left + rect.width / 2));
    const top = Math.min(viewportHeight - 12, rect.bottom + 8);
    wrapper.style.setProperty("--ui-calendar-tooltip-left", `${left}px`);
    wrapper.style.setProperty("--ui-calendar-tooltip-top", `${top}px`);
    wrapper.classList.add("is-calendar-tooltip-positioned");
    return true;
  }

  function setActiveCalendarTooltip(wrapper) {
    const calendar = wrapper?.closest?.("[data-ui-calendar]");
    if (!calendar) return false;
    calendar.querySelectorAll(".ui-time-slot__tooltip-wrap.is-calendar-tooltip-active").forEach((candidate) => {
      candidate.classList.toggle("is-calendar-tooltip-active", candidate === wrapper);
    });
    wrapper?.classList.add("is-calendar-tooltip-active");
    return true;
  }

  function syncCalendarTooltipPosition(target) {
    const scrollRoot = target?.matches?.(".ui-calendar__scroll") ? target : target?.closest?.(".ui-calendar__scroll");
    const wrapper = scrollRoot?.querySelector?.(".ui-tooltip-wrap:hover");
    setActiveCalendarTooltip(wrapper);
    return positionCalendarTooltip(wrapper);
  }

  function setTeacherAvailabilityDate(root, requestedIndex) {
    if (!root || root.dataset.calendarVariant !== "teacher-availability") return false;
    const dates = [...root.querySelectorAll(".ui-calendar__teacher-date")];
    if (!dates.length) return false;
    const index = Math.max(0, Math.min(dates.length - 1, Number(requestedIndex)));
    dates.forEach((date, dateIndex) => {
      const active = dateIndex === index;
      date.classList.toggle("is-selected-date", active);
      date.setAttribute("aria-pressed", String(active));
    });
    root.querySelectorAll(".ui-calendar__teacher-cell").forEach((cell) => {
      cell.classList.toggle("is-active-date", Number(cell.dataset.teacherDateIndex) === index);
    });
    root.dataset.teacherActiveDate = String(index);
    const activeDate = dates[index];
    const activeDateLabel = activeDate?.dataset.teacherDateLabel || "";
    if (typeof global.CustomEvent === "function") root.dispatchEvent(new global.CustomEvent("italki:teacher-availability-date-change", { bubbles: true, detail: { index, label: activeDateLabel } }));
    return true;
  }

  function selectTeacherAvailabilityDate(control) {
    const root = control?.closest?.("[data-ui-calendar]");
    return setTeacherAvailabilityDate(root, control?.dataset?.teacherDateIndex);
  }

  function setCalendarWeekView(root, requestedIndex) {
    if (!root?.dataset?.calendarConfig) return false;
    let config;
    try {
      config = JSON.parse(root.dataset.calendarConfig);
    } catch {
      return false;
    }
    if (!Array.isArray(config.weekViews) || !config.weekViews.length) return false;
    const index = Math.max(0, Math.min(config.weekViews.length - 1, Number(requestedIndex)));
    const markup = calendar({ ...config, activeWeek: index });
    root.outerHTML = markup;
    const updatedRoot = global.document?.getElementById?.(config.id);
    if (updatedRoot && typeof global.CustomEvent === "function") updatedRoot.dispatchEvent(new global.CustomEvent("italki:calendar-week-change", { bubbles: true, detail: { index, weekLabel: config.weekViews[index]?.weekLabel || "" } }));
    return Boolean(updatedRoot);
  }

  function notifyCalendarAction(control) {
    const root = control?.closest?.("[data-ui-calendar]");
    if (!root || control.disabled || root.classList.contains("is-disabled")) return false;
    const action = control.dataset.calendarAction || "";
    if (root.dataset.calendarVariant === "teacher-availability" && (action === "previous-date" || action === "next-date")) {
      const dayCount = root.querySelectorAll(".ui-calendar__teacher-date").length;
      const current = Number(root.dataset.teacherActiveDate || 0);
      return setTeacherAvailabilityDate(root, Math.max(0, Math.min(dayCount - 1, current + (action === "previous-date" ? -1 : 1))));
    }
    if (root.dataset.calendarConfig && (action === "previous-week" || action === "next-week" || action === "today")) {
      const current = Number(root.dataset.calendarWeekIndex || 0);
      const today = Number(root.dataset.calendarTodayWeek || 0);
      const next = action === "previous-week" ? current - 1 : action === "next-week" ? current + 1 : today;
      return setCalendarWeekView(root, next);
    }
    if (typeof global.CustomEvent === "function") root.dispatchEvent(new global.CustomEvent("italki:calendar-action", { bubbles: true, detail: { action } }));
    return true;
  }

  function dismissToast(control) {
    const root = control?.closest?.("[data-component=toast]");
    if (!root) return false;
    root.remove();
    return true;
  }

  function dismissNotification(control) {
    const root = control?.closest?.("[data-component=notification]");
    if (!root) return false;
    root.remove();
    return true;
  }

  global.document?.addEventListener?.("pointerover", (event) => {
    const wrapper = event.target?.closest?.(".ui-calendar .ui-tooltip-wrap");
    setActiveCalendarTooltip(wrapper);
    positionCalendarTooltip(wrapper);
  });
  global.document?.addEventListener?.("scroll", (event) => {
    syncCalendarTooltipPosition(event.target);
  }, true);

  global.ITalkiUI = Object.freeze({
    contracts,
    approvedAsset,
    appShellNav,
    button,
    chip,
    tag,
    link,
    video,
    checkbox,
    checkboxGroup,
    radio,
    radioGroup,
    selection,
    selectionGroup,
    datePicker,
    tooltip,
    divider,
    sectionIntro,
    avatar,
    flag,
    avatarGroup,
    badge,
    breadcrumb,
    card,
    list,
    alert,
    tabs,
    pagination,
    rate,
    sidebar,
    statistic,
    table,
    timeline,
    topNav,
    topNavContext,
    topNavSearch,
    modal,
    popup,
    popconfirm,
    slider,
    sliderRange,
    sliderVertical,
    panel,
    search,
    select,
    switchControl,
    drawer,
    formField,
    textInput,
    textarea,
    numberStepper,
    combobox,
    upload,
    stepper,
    progress,
    toast,
    notification,
    result,
    skeleton,
    dropdownMenu,
    disclosure,
    segmentedControl,
    timeSlot,
    timePicker,
    calendar,
    popover,
    footer,
    setCheckboxValue,
    syncCheckboxGroup,
    toggleCheckboxGroup,
    selectRadio,
    handleRadioKeydown,
    toggleSelectionCard,
    toggleLessonOptions,
    handleSelectionCardKeydown,
    toggleBreadcrumb,
    closeBreadcrumbs,
    dismissAlert,
    selectTab,
    handleTabsKeydown,
    selectPaginationPage,
    setRateVisual,
    setRateValue,
    rateValueFromPointer,
    selectRate,
    previewRate,
    resetRatePreview,
    handleRateKeydown,
    setSidebarVariant,
    setSidebarCollapsed,
    toggleSidebar,
    selectSidebarItem,
    unpinSidebarItem,
    pinSidebarItem,
    startSidebarDrag,
    moveSidebarDrag,
    endSidebarDrag,
    toggleSidebarSection,
    closeSidebarMore,
    toggleSidebarMore,
    cancelSidebarMoreClose,
    scheduleSidebarMoreClose,
    setDatePickerOpen,
    toggleDatePicker,
    navigateDatePicker,
    selectDatePickerDay,
    closeDatePickers,
    setModalOpen,
    openModal,
    closeModal,
    handleModalKeydown,
    setPopupOpen,
    openPopup,
    closePopup,
    closePopups,
    togglePopup,
    cancelPopupClose,
    schedulePopupClose,
    handlePopupKeydown,
    setPopconfirmOpen,
    openPopconfirm,
    closePopconfirm,
    closePopconfirms,
    togglePopconfirm,
    handlePopconfirmKeydown,
    toggleChip,
    toggleSwitch,
    clearSearch,
    syncSearchInput,
    closeSelects,
    setSelectOpen,
    toggleSelect,
    selectOption,
    clearSelect,
    removeSelectValue,
    filterSelectOptions,
    handleSelectKeydown,
    setSelectPresentation,
    setTextInputPresentation,
    setNumberStepperPresentation,
    setTextareaPresentation,
    setDatePickerPresentation,
    openUploadPicker,
    setUploadFiles,
    removeUploadFile,
    setTagPresentation,
    setChipPresentation,
    syncSliderInput,
    syncSliderRange,
    startSliderRangeDrag,
    setTimelineReverse,
    setTimelineTone,
    setTopNavContextOpen,
    closeTopNavContexts,
    selectTopNavContext,
    setTopNavSearchFocus,
    syncTopNavSearch,
    clearTopNavSearch,
    toggleTopNavFilter,
    setDrawerOpen,
    openDrawer,
    closeDrawer,
    handleDrawerKeydown,
    setNumberStepperValue,
    adjustNumberStepper,
    toggleDropdownMenu,
    closeDropdownMenus,
    toggleDisclosure,
    selectSegmentedControl,
    toggleTimePicker,
    closeTimePickers,
    selectTimePickerSlot,
    selectCalendarSlot,
    selectTeacherAvailabilityDate,
    setTeacherAvailabilityDate,
    setCalendarWeekView,
    setActiveCalendarTooltip,
    positionCalendarTooltip,
    syncCalendarTooltipPosition,
    notifyCalendarAction,
    dismissToast,
    dismissNotification
  });
})(window);
