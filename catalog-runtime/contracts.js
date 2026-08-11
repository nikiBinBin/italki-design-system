window.ITalkiUIContracts = {
  "assetRoots": [
    "Assets/Icons/",
    "Assets/Flags/",
    "Assets/Images/"
  ],
  "components": {
    "button": {
      "acceptedProps": [
        "label",
        "variant",
        "size",
        "shape",
        "state",
        "leadingIcon",
        "trailingIcon",
        "iconOnly",
        "disabled",
        "loading",
        "demo",
        "ariaLabel",
        "href",
        "download",
        "target",
        "rel",
        "ariaExpanded",
        "ariaPressed",
        "ariaDescribedBy",
        "ariaControls"
      ],
      "props": {
        "variant": [
          "emphasis",
          "red",
          "secondary",
          "white",
          "ghost",
          "text",
          "link",
          "danger",
          "plus"
        ],
        "size": [
          32,
          40,
          48
        ],
        "shape": [
          "default",
          "rounded",
          "pill"
        ],
        "state": [
          "default",
          "hover",
          "focus",
          "pressed",
          "disabled",
          "loading"
        ]
      }
    },
    "chip": {
      "acceptedProps": [
        "label",
        "size",
        "surface",
        "checked",
        "selected",
        "disabled",
        "state",
        "demo"
      ],
      "props": {
        "size": [
          24,
          32,
          40
        ],
        "surface": [
          "default",
          "white",
          "transparent"
        ],
        "state": [
          "default",
          "hover",
          "checked",
          "disabled"
        ]
      }
    },
    "link": {
      "acceptedProps": [
        "label",
        "href",
        "size",
        "variant",
        "trailingIcon",
        "external",
        "disabled",
        "state",
        "ariaLabel",
        "demo"
      ],
      "props": {
        "size": [
          14,
          16
        ],
        "variant": [
          "default",
          "subtle",
          "inverse"
        ],
        "trailingIcon": [
          "none",
          "chevron",
          "external"
        ],
        "state": [
          "default",
          "hover",
          "disabled"
        ]
      }
    },
    "video": {
      "acceptedProps": [
        "id",
        "poster",
        "posterAlt",
        "title",
        "duration",
        "playLabel",
        "state",
        "demo"
      ],
      "props": {
        "state": [
          "default",
          "hover",
          "disabled"
        ]
      }
    },
    "tag": {
      "acceptedProps": [
        "label",
        "value",
        "size",
        "tone",
        "variant",
        "leadingIcon",
        "removable",
        "removeDemo",
        "removeAriaLabel"
      ],
      "props": {
        "size": [
          24,
          32,
          40
        ],
        "tone": [
          "neutral",
          "info",
          "success",
          "warning",
          "error"
        ],
        "variant": [
          "default",
          "status",
          "promo"
        ]
      }
    },
    "checkbox": {
      "acceptedProps": [
        "id",
        "label",
        "checked",
        "state",
        "disabled",
        "toggleMode",
        "demo"
      ],
      "props": {
        "checked": [
          "off",
          "on",
          "mixed"
        ],
        "state": [
          "default",
          "hover",
          "disabled"
        ],
        "toggleMode": [
          "binary",
          "indeterminate",
          "controlled"
        ]
      }
    },
    "checkbox-group": {
      "acceptedProps": [
        "id",
        "label",
        "description",
        "options",
        "selected",
        "layout",
        "selectAll",
        "feedback",
        "feedbackTone"
      ],
      "props": {
        "layout": [
          "vertical",
          "inline"
        ],
        "feedbackTone": [
          "default",
          "error"
        ]
      }
    },
    "radio": {
      "acceptedProps": [
        "label",
        "value",
        "checked",
        "disabled",
        "state",
        "description",
        "demo",
        "tabIndex"
      ],
      "props": {
        "state": [
          "default",
          "hover",
          "disabled"
        ]
      },
      "subcomponents": {
        "group": {
          "acceptedProps": [
            "label",
            "options",
            "selected",
            "layout",
            "block"
          ]
        }
      }
    },
    "selection": {
      "acceptedProps": [
        "label",
        "value",
        "subtext",
        "description",
        "leading",
        "badge",
        "price",
        "period",
        "discount",
        "quantity",
        "quantityLabel",
        "originalPrice",
        "totalPrice",
        "selected",
        "selectedMarker",
        "disabled",
        "contentType",
        "selectionMode",
        "state",
        "tabIndex",
        "demo"
      ],
      "props": {
        "contentType": [
          "standard",
          "icon-simple",
          "icon-card",
          "package-card",
          "lesson-options",
          "avatar",
          "payment-icon"
        ],
        "selectionMode": [
          "radio",
          "checkbox"
        ],
        "state": [
          "default",
          "hover",
          "focus",
          "disabled"
        ]
      },
      "subcomponents": {
        "group": {
          "acceptedProps": [
            "label",
            "options",
            "selected",
            "contentType",
            "selectionMode",
            "selectedMarker",
            "layout",
            "courseTitle",
            "courseMeta",
            "courses",
            "selectedDuration"
          ],
          "props": {
            "layout": [
              "stack",
              "grid",
              "package-grid"
            ]
          }
        }
      }
    },
    "date-picker": {
      "acceptedProps": [
        "id",
        "label",
        "value",
        "placeholder",
        "size",
        "shape",
        "status",
        "open",
        "disabled",
        "state",
        "monthLabel",
        "weekdays",
        "days",
        "months",
        "monthIndex",
        "selected",
        "range",
        "demo"
      ],
      "props": {
        "size": [
          32,
          40,
          48
        ],
        "shape": [
          "default",
          "rounded",
          "pill"
        ],
        "status": [
          "default",
          "warning",
          "error"
        ],
        "state": [
          "default",
          "hover",
          "focus",
          "disabled"
        ]
      }
    },
    "tooltip": {
      "acceptedProps": [
        "id",
        "content",
        "trigger",
        "triggerLabel",
        "placement",
        "arrow",
        "open",
        "disabled",
        "demo"
      ],
      "props": {
        "placement": [
          "top",
          "top-left",
          "top-right",
          "bottom",
          "bottom-left",
          "bottom-right",
          "left",
          "right"
        ]
      }
    },
    "modal": {
      "acceptedProps": [
        "id",
        "title",
        "body",
        "footer",
        "trigger",
        "triggerLabel",
        "open",
        "size",
        "titleAlign",
        "stage",
        "closable",
        "maskClosable",
        "keyboardClosable",
        "demo"
      ],
      "props": {
        "size": [
          "default",
          "wide"
        ],
        "titleAlign": [
          "start",
          "center"
        ],
        "stage": [
          "demo",
          "inline"
        ]
      }
    },
    "popup": {
      "acceptedProps": [
        "id",
        "title",
        "body",
        "actions",
        "trigger",
        "triggerLabel",
        "open",
        "placement",
        "triggerMode",
        "closeOnLeave",
        "leaveDelay",
        "demo",
        "ariaLabel"
      ],
      "props": {
        "placement": [
          "top",
          "bottom",
          "left",
          "right"
        ],
        "triggerMode": [
          "click",
          "hover",
          "focus"
        ],
        "closeOnLeave": [
          true,
          false
        ],
        "leaveDelay": [
          300
        ]
      }
    },
    "popconfirm": {
      "acceptedProps": [
        "id",
        "title",
        "description",
        "trigger",
        "triggerLabel",
        "confirm",
        "cancel",
        "confirmLabel",
        "cancelLabel",
        "showCancel",
        "open",
        "placement",
        "disabled",
        "loading",
        "demo",
        "ariaLabel"
      ],
      "props": {
        "placement": [
          "top",
          "bottom",
          "left",
          "right"
        ],
        "showCancel": [
          true,
          false
        ],
        "disabled": [
          true,
          false
        ],
        "loading": [
          true,
          false
        ]
      }
    },
    "divider": {
      "acceptedProps": [
        "type",
        "label",
        "orientation",
        "orientationMargin",
        "dashed",
        "plain",
        "tone",
        "icon",
        "ariaLabel"
      ],
      "props": {
        "type": [
          "horizontal",
          "vertical"
        ],
        "orientation": [
          "left",
          "center",
          "right"
        ],
        "dashed": [
          true,
          false
        ],
        "plain": [
          true,
          false
        ],
        "tone": [
          "divider",
          "border"
        ]
      }
    },
    "avatar": {
      "acceptedProps": [
        "name",
        "image",
        "initials",
        "size",
        "flag",
        "flagLabel",
        "variant",
        "tone",
        "interactive",
        "state",
        "ariaLabel"
      ],
      "props": {
        "size": [
          24,
          32,
          40,
          48,
          56,
          64,
          80,
          120
        ],
        "variant": [
          "without-flag",
          "with-flag",
          "empty",
          "logo"
        ],
        "tone": [
          "primary",
          "info",
          "success",
          "warning"
        ],
        "interactive": [
          true,
          false
        ],
        "state": [
          "default",
          "hover"
        ]
      },
      "subcomponents": {
        "flag": {
          "acceptedProps": [
            "countryCode",
            "countryLabel",
            "size",
            "decorative",
            "ariaLabel"
          ]
        },
        "group": {
          "acceptedProps": [
            "members",
            "overflow",
            "addLabel",
            "size",
            "ariaLabel"
          ]
        }
      }
    },
    "badge": {
      "acceptedProps": [
        "type",
        "anchor",
        "count",
        "label",
        "tone",
        "overflowCount",
        "hidden",
        "ariaLabel"
      ],
      "props": {
        "type": [
          "count",
          "dot",
          "status"
        ],
        "tone": [
          "default",
          "success",
          "info",
          "warning",
          "error"
        ],
        "hidden": [
          true,
          false
        ]
      }
    },
    "breadcrumb": {
      "acceptedProps": [
        "items",
        "separator",
        "ariaLabel",
        "collapsedOpen",
        "demo"
      ],
      "props": {
        "collapsedOpen": [
          true,
          false
        ]
      }
    },
    "card": {
      "acceptedProps": [
        "interactive",
        "outlined",
        "media",
        "mediaAlt",
        "mediaPlaceholder",
        "mediaRatio",
        "eyebrow",
        "title",
        "body",
        "meta",
        "footer",
        "density",
        "ariaLabel",
        "href",
        "demo"
      ],
      "props": {
        "interactive": [
          true,
          false
        ],
        "outlined": [
          true,
          false
        ],
        "mediaPlaceholder": [
          true,
          false
        ],
        "mediaRatio": [
          "16:9",
          "3:1"
        ],
        "density": [
          "compact",
          "default",
          "comfortable"
        ]
      }
    },
    "alert": {
      "acceptedProps": [
        "tone",
        "title",
        "description",
        "closable",
        "action",
        "banner",
        "ariaLabel",
        "demo"
      ],
      "props": {
        "tone": [
          "info",
          "success",
          "warning",
          "error"
        ],
        "closable": [
          true,
          false
        ],
        "banner": [
          true,
          false
        ]
      }
    },
    "tabs": {
      "acceptedProps": [
        "id",
        "items",
        "activeId",
        "extra",
        "ariaLabel",
        "orientation",
        "variant",
        "activation",
        "demo"
      ],
      "props": {
        "orientation": [
          "horizontal"
        ],
        "variant": [
          "default",
          "red-line"
        ],
        "activation": [
          "manual",
          "automatic"
        ]
      }
    },
    "pagination": {
      "acceptedProps": [
        "pages",
        "current",
        "previousDisabled",
        "nextDisabled",
        "ariaLabel",
        "demo"
      ],
      "props": {
        "previousDisabled": [
          true,
          false
        ],
        "nextDisabled": [
          true,
          false
        ]
      }
    },
    "rate": {
      "acceptedProps": [
        "id",
        "value",
        "count",
        "allowHalf",
        "allowClear",
        "disabled",
        "labels",
        "showText",
        "label",
        "variant",
        "state",
        "demo"
      ],
      "props": {
        "variant": [
          "interactive",
          "summary"
        ],
        "allowHalf": [
          true,
          false
        ],
        "allowClear": [
          true,
          false
        ],
        "disabled": [
          true,
          false
        ],
        "showText": [
          true,
          false
        ],
        "state": [
          "default",
          "hover",
          "disabled"
        ]
      }
    },
    "sidebar": {
      "acceptedProps": [
        "id",
        "variant",
        "collapsed",
        "items",
        "sections",
        "moreItems",
        "moreOpen",
        "footer",
        "balance",
        "avatarInitials",
        "ariaLabel",
        "sticky",
        "demo"
      ],
      "props": {
        "variant": [
          "normal",
          "plus"
        ],
        "collapsed": [
          true,
          false
        ],
        "moreOpen": [
          true,
          false
        ],
        "sticky": [
          true,
          false
        ]
      }
    },
    "statistic": {
      "acceptedProps": [
        "title",
        "value",
        "prefix",
        "suffix",
        "description",
        "loading",
        "ariaLabel",
        "demo"
      ],
      "props": {
        "loading": [
          true,
          false
        ]
      }
    },
    "table": {
      "acceptedProps": [
        "id",
        "columns",
        "rows",
        "caption",
        "density",
        "loading",
        "empty",
        "ariaLabel",
        "demo"
      ],
      "props": {
        "density": [
          "compact",
          "default"
        ],
        "loading": [
          true,
          false
        ]
      }
    },
    "timeline": {
      "acceptedProps": [
        "id",
        "items",
        "layout",
        "reverse",
        "tone",
        "ariaLabel",
        "demo"
      ],
      "props": {
        "layout": [
          "left",
          "right",
          "alternate"
        ],
        "tone": [
          "default",
          "info",
          "success",
          "warning",
          "error"
        ],
        "reverse": [
          true,
          false
        ]
      }
    },
    "top-nav": {
      "acceptedProps": [
        "id",
        "variant",
        "leading",
        "center",
        "trailing",
        "contextLabel",
        "contextFlag",
        "contextOptions",
        "searchPlaceholder",
        "searchFilterLabel",
        "actionLabel",
        "actionIcon",
        "ariaLabel",
        "sticky",
        "demo"
      ],
      "props": {
        "sticky": [
          true,
          false
        ],
        "variant": [
          "custom",
          "global-default",
          "teacher-search"
        ]
      },
      "subcomponents": {
        "context": {
          "acceptedProps": [
            "id",
            "mode",
            "selected",
            "options",
            "open",
            "ariaLabel",
            "demo"
          ],
          "props": {
            "mode": [
              "labelled",
              "compact"
            ],
            "open": [
              true,
              false
            ]
          }
        },
        "search": {
          "acceptedProps": [
            "id",
            "value",
            "placeholder",
            "filter",
            "filterLabel",
            "filterIcon",
            "filterCount",
            "filtered",
            "clearable",
            "disabled",
            "state",
            "ariaLabel",
            "demo"
          ],
          "props": {
            "filter": [
              true,
              false
            ],
            "filtered": [
              true,
              false
            ],
            "clearable": [
              true,
              false
            ],
            "disabled": [
              true,
              false
            ],
            "state": [
              "default",
              "focus",
              "disabled"
            ]
          }
        }
      }
    },
    "slider": {
      "acceptedProps": [
        "value",
        "label",
        "disabled",
        "tooltip",
        "reversed",
        "state"
      ],
      "props": {
        "orientation": [
          "horizontal",
          "vertical"
        ],
        "mode": [
          "single",
          "range"
        ],
        "state": [
          "default",
          "hover",
          "focus",
          "disabled"
        ],
        "reversed": [
          true,
          false
        ]
      },
      "subcomponents": {
        "range": {
          "acceptedProps": [
            "lower",
            "upper",
            "label"
          ]
        },
        "vertical": {
          "acceptedProps": [
            "value",
            "label",
            "disabled"
          ]
        }
      }
    },
    "panel": {
      "acceptedProps": [
        "title",
        "body",
        "extra",
        "divider",
        "density"
      ],
      "props": {
        "density": [
          "small",
          "medium",
          "large"
        ],
        "divider": [
          true,
          false
        ]
      }
    },
    "search": {
      "acceptedProps": [
        "id",
        "value",
        "placeholder",
        "size",
        "shape",
        "state",
        "clearable",
        "disabled"
      ],
      "props": {
        "size": [
          32,
          40,
          48
        ],
        "shape": [
          "rounded",
          "pill"
        ],
        "state": [
          "default",
          "hover",
          "focus",
          "disabled"
        ]
      }
    },
    "select": {
      "acceptedProps": [
        "id",
        "label",
        "placeholder",
        "options",
        "groups",
        "selected",
        "mode",
        "size",
        "shape",
        "status",
        "state",
        "clearable",
        "searchable",
        "query",
        "disabled",
        "loading",
        "open"
      ],
      "props": {
        "mode": [
          "single",
          "multiple"
        ],
        "size": [
          32,
          40,
          48
        ],
        "shape": [
          "default",
          "rounded",
          "pill"
        ],
        "status": [
          "default",
          "warning",
          "error"
        ],
        "state": [
          "default",
          "hover",
          "focus",
          "disabled",
          "loading"
        ]
      }
    },
    "switch": {
      "acceptedProps": [
        "checked",
        "disabled",
        "state",
        "demo",
        "label"
      ],
      "props": {
        "state": [
          "default",
          "hover",
          "disabled"
        ]
      }
    },
    "drawer": {
      "acceptedProps": [
        "id",
        "title",
        "body",
        "footer",
        "trigger",
        "triggerLabel",
        "open",
        "placement",
        "size",
        "closable",
        "maskClosable",
        "keyboardClosable",
        "demo"
      ],
      "props": {
        "placement": [
          "left",
          "right",
          "bottom"
        ],
        "size": [
          "default",
          "wide"
        ]
      }
    },
    "form-field": {
      "acceptedProps": [
        "id",
        "label",
        "control",
        "helper",
        "error",
        "status",
        "size",
        "shape",
        "state",
        "required",
        "disabled"
      ],
      "props": {
        "size": [
          32,
          40,
          48
        ],
        "shape": [
          "default",
          "rounded",
          "pill"
        ],
        "status": [
          "default",
          "warning",
          "error"
        ],
        "state": [
          "default",
          "hover",
          "focus",
          "disabled"
        ]
      }
    },
    "text-input": {
      "acceptedProps": [
        "id",
        "value",
        "placeholder",
        "size",
        "shape",
        "status",
        "state",
        "disabled",
        "readOnly",
        "leadingIcon",
        "trailingIcon",
        "trailingAction",
        "ariaLabel",
        "demo"
      ],
      "props": {
        "size": [
          32,
          40,
          48
        ],
        "shape": [
          "default",
          "rounded",
          "pill"
        ],
        "status": [
          "default",
          "warning",
          "error"
        ],
        "state": [
          "default",
          "hover",
          "focus",
          "warning",
          "error",
          "disabled"
        ]
      }
    },
    "textarea": {
      "acceptedProps": [
        "id",
        "value",
        "placeholder",
        "size",
        "rows",
        "maxLength",
        "showCount",
        "status",
        "state",
        "disabled",
        "readOnly",
        "ariaLabel",
        "demo"
      ],
      "props": {
        "size": [
          32,
          40,
          48
        ],
        "status": [
          "default",
          "warning",
          "error"
        ],
        "state": [
          "default",
          "hover",
          "focus",
          "warning",
          "error",
          "disabled"
        ]
      }
    },
    "number-stepper": {
      "acceptedProps": [
        "id",
        "value",
        "min",
        "max",
        "step",
        "size",
        "shape",
        "status",
        "state",
        "disabled",
        "label",
        "ariaLabel",
        "demo"
      ],
      "props": {
        "size": [
          32,
          40,
          48
        ],
        "shape": [
          "default",
          "rounded",
          "pill"
        ],
        "status": [
          "default",
          "warning",
          "error"
        ],
        "state": [
          "default",
          "hover",
          "focus",
          "disabled"
        ]
      }
    },
    "combobox": {
      "acceptedProps": [
        "id",
        "label",
        "placeholder",
        "options",
        "groups",
        "selected",
        "size",
        "shape",
        "status",
        "state",
        "clearable",
        "disabled",
        "loading",
        "open",
        "query"
      ],
      "props": {
        "size": [
          32,
          40,
          48
        ],
        "shape": [
          "default",
          "rounded",
          "pill"
        ],
        "status": [
          "default",
          "warning",
          "error"
        ],
        "state": [
          "default",
          "hover",
          "focus",
          "disabled",
          "loading"
        ]
      }
    },
    "upload": {
      "acceptedProps": [
        "id",
        "label",
        "description",
        "accept",
        "multiple",
        "files",
        "variant",
        "state",
        "disabled",
        "actionLabel",
        "maxSize",
        "avatar",
        "avatarAlt",
        "error",
        "ariaLabel",
        "demo"
      ],
      "props": {
        "variant": [
          "dropzone",
          "trigger",
          "avatar"
        ],
        "state": [
          "default",
          "hover",
          "focus",
          "disabled",
          "uploading",
          "error"
        ]
      }
    },
    "stepper": {
      "acceptedProps": [
        "id",
        "items",
        "current",
        "variant",
        "orientation",
        "value",
        "max",
        "label",
        "ariaLabel"
      ],
      "props": {
        "variant": [
          "default",
          "flow-progress",
          "dots",
          "top-indicator",
          "schedule-progress",
          "progress-steps"
        ],
        "orientation": [
          "horizontal",
          "vertical"
        ]
      }
    },
    "progress": {
      "acceptedProps": [
        "value",
        "max",
        "status",
        "type",
        "size",
        "showLabel",
        "indeterminate",
        "ariaLabel"
      ],
      "props": {
        "status": [
          "default",
          "success",
          "error"
        ],
        "type": [
          "line",
          "circle",
          "semicircle"
        ],
        "size": [
          80,
          120
        ]
      }
    },
    "toast": {
      "acceptedProps": [
        "id",
        "tone",
        "title",
        "description",
        "action",
        "duration",
        "closable",
        "open",
        "ariaLabel"
      ],
      "props": {
        "tone": [
          "info",
          "success",
          "warning",
          "error"
        ]
      }
    },
    "notification": {
      "acceptedProps": [
        "id",
        "tone",
        "title",
        "description",
        "action",
        "closable",
        "open",
        "ariaLabel"
      ],
      "props": {
        "tone": [
          "info",
          "success",
          "warning",
          "error"
        ]
      }
    },
    "result": {
      "acceptedProps": [
        "id",
        "tone",
        "title",
        "description",
        "action",
        "secondaryAction",
        "ariaLabel"
      ],
      "props": {
        "tone": [
          "info",
          "success",
          "warning",
          "error"
        ]
      }
    },
    "skeleton": {
      "acceptedProps": [
        "type",
        "lines",
        "width",
        "height",
        "title",
        "avatar",
        "lastLineWidth",
        "shape",
        "round",
        "animated",
        "ariaLabel"
      ],
      "props": {
        "type": [
          "text",
          "content",
          "avatar",
          "button",
          "input",
          "image",
          "card"
        ],
        "shape": [
          "default",
          "round",
          "circle",
          "square"
        ]
      }
    },
    "dropdown-menu": {
      "acceptedProps": [
        "id",
        "trigger",
        "triggerLabel",
        "items",
        "open",
        "placement",
        "ariaLabel"
      ],
      "props": {
        "placement": [
          "bottom-start",
          "bottom-end"
        ]
      }
    },
    "disclosure": {
      "acceptedProps": [
        "id",
        "title",
        "content",
        "open",
        "disabled",
        "kind",
        "ariaLabel"
      ],
      "props": {
        "kind": [
          "accordion",
          "details"
        ]
      }
    },
    "segmented-control": {
      "acceptedProps": [
        "id",
        "options",
        "selected",
        "size",
        "shape",
        "contentType",
        "disabled",
        "ariaLabel"
      ],
      "props": {
        "size": [
          32,
          40,
          48
        ],
        "shape": [
          "pill",
          "rounded"
        ],
        "contentType": [
          "text",
          "icon",
          "role"
        ]
      }
    },
    "time-slot": {
      "acceptedProps": [
        "id",
        "label",
        "time",
        "secondary",
        "appearance",
        "state",
        "selected",
        "unavailable",
        "held",
        "loading",
        "disabled",
        "duration",
        "teacher",
        "calendarDay",
        "calendarMinute",
        "ariaLabel",
        "tooltip",
        "demo"
      ],
      "props": {
        "appearance": [
          "availability",
          "option"
        ],
        "duration": [
          15,
          30,
          60
        ],
        "state": [
          "available",
          "selected",
          "unavailable",
          "booked-by-others",
          "booked-by-you",
          "loading"
        ]
      }
    },
    "time-picker": {
      "acceptedProps": [
        "id",
        "label",
        "placeholder",
        "slots",
        "selected",
        "selectionMode",
        "disabled",
        "open",
        "state",
        "ariaLabel"
      ],
      "props": {
        "state": [
          "default",
          "hover",
          "focus",
          "disabled"
        ],
        "selectionMode": [
          "single",
          "multiple"
        ]
      }
    },
    "calendar": {
      "acceptedProps": [
        "id",
        "variant",
        "timezone",
        "weekLabel",
        "todayLabel",
        "dates",
        "rows",
        "weekViews",
        "activeWeek",
        "todayWeek",
        "timePicker",
        "availabilityLabel",
        "teacherAvailability",
        "recordTitle",
        "recordMonths",
        "recordStats",
        "weekdays",
        "disabled",
        "ariaLabel",
        "demo"
      ],
      "props": {
        "variant": [
          "availability",
          "teacher-availability",
          "compact-availability",
          "lesson-record"
        ]
      }
    },
    "footer": {
      "acceptedProps": [
        "id",
        "columns",
        "utilities",
        "copyright",
        "legalLinks",
        "socialLinks",
        "ariaLabel",
        "demo"
      ],
      "props": {}
    },
    "section-intro": {
      "acceptedProps": [
        "id",
        "eyebrow",
        "title",
        "description",
        "action",
        "size",
        "alignment",
        "headingLevel",
        "ariaLabel"
      ],
      "props": {
        "size": [
          "compact",
          "default"
        ],
        "alignment": [
          "start",
          "center"
        ],
        "headingLevel": [
          2,
          3
        ]
      }
    },
    "list": {
      "acceptedProps": [
        "id",
        "items",
        "size",
        "variant",
        "divided",
        "ariaLabel",
        "demo"
      ],
      "props": {
        "size": [
          "small",
          "default",
          "large"
        ],
        "variant": [
          "default",
          "avatar",
          "image",
          "content"
        ],
        "divided": [
          true,
          false
        ]
      }
    },
    "popover": {
      "acceptedProps": [
        "id",
        "title",
        "body",
        "actions",
        "trigger",
        "triggerLabel",
        "open",
        "placement",
        "triggerMode",
        "closeOnLeave",
        "leaveDelay",
        "demo",
        "ariaLabel"
      ],
      "props": {
        "placement": [
          "top",
          "bottom",
          "left",
          "right"
        ],
        "triggerMode": [
          "click",
          "hover",
          "focus"
        ],
        "closeOnLeave": [
          true,
          false
        ],
        "leaveDelay": [
          300
        ]
      }
    }
  }
};
