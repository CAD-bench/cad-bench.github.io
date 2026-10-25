
    const source = await fetch("results/index.html");
    if (!source.ok) throw new Error("The results could not be loaded.");
    const resultsDocument = new DOMParser().parseFromString(await source.text(), "text/html");
    const allHarnesses = JSON.parse(resultsDocument.getElementById("payload").textContent);
    document.getElementById("run-count").textContent = `${allHarnesses.length} configurations`;

    let harnessTable = null;
    const columnToggles = Array.from(document.querySelectorAll("[data-column-toggle]"));

    function percentText(value) {
      const number = Number(value);
      if (!Number.isFinite(number)) {
        return "";
      }
      const percent = number * 100;
      if (percent >= 99.9) {
        return "100%";
      }
      return `${percent.toFixed(1)}%`;
    }

    function numberText(value) {
      const number = Number(value);
      if (!Number.isFinite(number)) {
        return "";
      }
      return new Intl.NumberFormat("en-US").format(Math.round(number));
    }

    function usdText(value) {
      if (value === null || value === undefined || value === "") {
        return "";
      }
      const number = Number(value);
      if (!Number.isFinite(number) || number <= 0) {
        return "";
      }
      if (number >= 100) {
        return `$${number.toFixed(0)}`;
      }
      if (number >= 10) {
        return `$${number.toFixed(1)}`;
      }
      if (number >= 1) {
        return `$${number.toFixed(2)}`;
      }
      return `$${number.toFixed(3)}`;
    }

    function scoreFormatter(cell) {
      const value = Number(cell.getValue() || 0);
      return percentText(value);
    }

    function numberFormatter(cell) {
      return numberText(cell.getValue());
    }

    function usdFormatter(cell) {
      return usdText(cell.getValue());
    }

    function durationText(value) {
      const seconds = Number(value);
      if (!Number.isFinite(seconds)) {
        return "";
      }
      if (seconds < 60) {
        return `${seconds.toFixed(1)}s`;
      }
      const minutes = seconds / 60;
      if (minutes < 60) {
        return `${minutes.toFixed(1)}m`;
      }
      return `${(minutes / 60).toFixed(1)}h`;
    }

    function durationFormatter(cell) {
      return durationText(cell.getValue());
    }

    function yesNoText(value) {
      return value ? "Yes" : "No";
    }

    function yesNoFormatter(cell) {
      return yesNoText(Boolean(cell.getValue()));
    }

    function textHeaderFilter(headerValue, rowValue) {
      const needle = String(headerValue || "").trim().toLowerCase();
      if (!needle) {
        return true;
      }
      return String(rowValue ?? "").toLowerCase().includes(needle);
    }

    function percentHeaderFilter(headerValue, rowValue) {
      const needle = String(headerValue || "").trim().toLowerCase();
      if (!needle) {
        return true;
      }
      return percentText(rowValue).toLowerCase().includes(needle);
    }

    function numberHeaderFilter(headerValue, rowValue) {
      const needle = String(headerValue || "").trim().toLowerCase();
      if (!needle) {
        return true;
      }
      return numberText(rowValue).toLowerCase().includes(needle);
    }

    function usdHeaderFilter(headerValue, rowValue) {
      const needle = String(headerValue || "").trim().toLowerCase();
      if (!needle) {
        return true;
      }
      return usdText(rowValue).toLowerCase().includes(needle);
    }

    function durationHeaderFilter(headerValue, rowValue) {
      const needle = String(headerValue || "").trim().toLowerCase();
      if (!needle) {
        return true;
      }
      return durationText(rowValue).toLowerCase().includes(needle);
    }

    function booleanHeaderFilter(headerValue, rowValue) {
      const needle = String(headerValue || "").trim().toLowerCase();
      if (!needle) return true;
      if (["yes", "y", "true", "1", "web", "with web", "online"].includes(needle)) return Boolean(rowValue);
      if (["no", "n", "false", "0", "offline", "no web"].includes(needle)) return !Boolean(rowValue);
      return false;
    }

    const baseColumnSpecs = [
      {title: "Company", field: "company", minWidth: 88, widthGrow: 1, widthShrink: 1, headerFilter: "input", headerFilterFunc: textHeaderFilter},
      {title: "Model", field: "model", minWidth: 128, widthGrow: 5, widthShrink: 3, headerFilter: "input", headerFilterFunc: textHeaderFilter},
      {title: "Agent", field: "agent", minWidth: 60, widthGrow: 1, widthShrink: 2, headerFilter: "input", headerFilterFunc: textHeaderFilter},
      {title: "Internet", field: "web_access", formatter: yesNoFormatter, minWidth: 54, widthGrow: 0, widthShrink: 1, hozAlign: "center", headerHozAlign: "center", headerFilter: "input", headerFilterFunc: booleanHeaderFilter},
      {title: "Overall", field: "overall", sorter: "number", formatter: scoreFormatter, minWidth: 68, width: 76, widthGrow: 0, widthShrink: 1, hozAlign: "left", headerFilter: "input", headerFilterFunc: percentHeaderFilter},
      {title: "Cost", field: "estimated_cost_usd", sorter: "number", formatter: usdFormatter, minWidth: 68, widthGrow: 1, widthShrink: 1, hozAlign: "left", headerFilter: "input", headerFilterFunc: usdHeaderFilter},
      {title: "Time", field: "elapsed_s", sorter: "number", formatter: durationFormatter, minWidth: 72, widthGrow: 1, widthShrink: 1, hozAlign: "left", headerFilter: "input", headerFilterFunc: durationHeaderFilter},
      {title: "Tokens", field: "total_tokens", sorter: "number", formatter: numberFormatter, minWidth: 86, widthGrow: 1, widthShrink: 1, hozAlign: "left", headerFilter: "input", headerFilterFunc: numberHeaderFilter},
      {title: "Easy", field: "easy", sorter: "number", formatter: scoreFormatter, minWidth: 70, widthGrow: 1, widthShrink: 1, hozAlign: "left", headerFilter: "input", headerFilterFunc: percentHeaderFilter},
      {title: "Medium", field: "medium", sorter: "number", formatter: scoreFormatter, minWidth: 74, widthGrow: 1, widthShrink: 1, hozAlign: "left", headerFilter: "input", headerFilterFunc: percentHeaderFilter},
      {title: "Hard", field: "hard", sorter: "number", formatter: scoreFormatter, minWidth: 70, widthGrow: 1, widthShrink: 1, hozAlign: "left", headerFilter: "input", headerFilterFunc: percentHeaderFilter},
      {title: "Insane", field: "insane", sorter: "number", formatter: scoreFormatter, minWidth: 76, widthGrow: 1, widthShrink: 1, hozAlign: "left", headerFilter: "input", headerFilterFunc: percentHeaderFilter},
    ];
    const baseDefaultFields = ["model", "agent", "web_access", "overall", "estimated_cost_usd", "elapsed_s", "easy", "medium", "hard", "insane"];
    const compactDefaultFields = ["model", "agent", "web_access", "overall", "estimated_cost_usd", "elapsed_s"];
    const mobileDefaultFields = ["model", "agent", "overall"];
    const columnPrefsKey = "cad_bench_columns_v2_" + (isMobileScreen() ? "mobile" : "desktop");
    let userCustomizedColumns = false;
    let tableScale = 1;
    let fontsReadyApplied = false;
    const widthMeasureCanvas = document.createElement("canvas");
    const widthMeasureContext = widthMeasureCanvas.getContext("2d");

    function isMobileScreen() {
      return window.matchMedia("(max-width: 640px)").matches;
    }

    function tableAvailableWidth() {
      const shell = document.querySelector(".table-shell");
      return Math.max(
        0,
        Math.floor(shell?.clientWidth || window.innerWidth || 0),
      );
    }

    function rootFontSizePx() {
      return Number.parseFloat(getComputedStyle(document.documentElement).fontSize || "16") || 16;
    }

    function bodyFontSizePx(scale = tableScale) {
      return rootFontSizePx() * (isMobileScreen() ? 0.82 : 0.95) * scale;
    }

    function headerFontSizePx(scale = tableScale) {
      return rootFontSizePx() * (isMobileScreen() ? 0.8 : 0.95) * scale;
    }

    function horizontalCellPaddingPx(scale = tableScale) {
      return rootFontSizePx() * (isMobileScreen() ? 0.5 : 1.6) * scale;
    }

    function horizontalHeaderPaddingPx(scale = tableScale) {
      return rootFontSizePx() * (isMobileScreen() ? 0.35 : 1.6) * scale;
    }

    function measureTextWidth(text, font) {
      if (!widthMeasureContext) {
        return String(text || "").length * 8;
      }
      widthMeasureContext.font = font;
      return widthMeasureContext.measureText(String(text || "")).width;
    }

    function bodyFont(scale = tableScale) {
      return `400 ${bodyFontSizePx(scale)}px ${getComputedStyle(document.body).fontFamily}`;
    }

    function headerFont(scale = tableScale) {
      return `600 ${headerFontSizePx(scale)}px ${getComputedStyle(document.body).fontFamily}`;
    }

    function displayTextForField(field, value) {
      if (field === "overall" || field === "easy" || field === "medium" || field === "hard" || field === "insane") {
        return percentText(value);
      }
      if (field === "estimated_cost_usd") {
        return usdText(value);
      }
      if (field === "elapsed_s") {
        return durationText(value);
      }
      if (field === "total_tokens") {
        return numberText(value);
      }
      if (field === "web_access") {
        return yesNoText(Boolean(value)) || " ";
      }
      return String(value ?? "");
    }

    function contentWidthForSpec(spec, scale = tableScale) {
      const headerWidth = measureTextWidth(spec.title, headerFont(scale));
      const valueWidth = allHarnesses.reduce((maxWidth, row) => {
        return Math.max(maxWidth, measureTextWidth(displayTextForField(spec.field, row?.[spec.field]), bodyFont(scale)));
      }, 0);
      return Math.ceil(Math.max(headerWidth + horizontalHeaderPaddingPx(scale), valueWidth + horizontalCellPaddingPx(scale)));
    }

    function resolvedWidthForSpec(spec, scale = tableScale) {
      const minWidth = isMobileScreen() ? 0 : Number(spec.minWidth || 0) * scale;
      const fixedWidth = isMobileScreen() ? 0 : Number(spec.width || 0) * scale;
      const maxWidth = isMobileScreen() ? 0 : Number(spec.maxWidth || 0) * scale;
      let width = Math.max(minWidth, fixedWidth, contentWidthForSpec(spec, scale));
      if (maxWidth) {
        width = Math.min(width, maxWidth);
      }
      return Math.ceil(width);
    }

    function minimumWidthForFields(fields, scale = tableScale) {
      const enabled = new Set(fields);
      return baseColumnSpecs
        .filter((spec) => enabled.has(spec.field))
        .reduce((sum, spec) => sum + resolvedWidthForSpec(spec, scale), 0);
    }

    function mobileScaleForFields(fields) {
      const availableWidth = tableAvailableWidth();
      if (!availableWidth) {
        return 1;
      }
      const baseWidth = minimumWidthForFields(fields, 1);
      if (!baseWidth) {
        return 1;
      }
      return Math.max(0.62, Math.min(1, availableWidth / baseWidth));
    }

    function applyTableScale(scale) {
      tableScale = scale;
      document.documentElement.style.setProperty("--table-scale", scale.toFixed(4));
    }

    function canFitFields(fields) {
      const availableWidth = tableAvailableWidth();
      if (!availableWidth) {
        return true;
      }
      return minimumWidthForFields(fields) <= availableWidth;
    }

    function preferredDefaultFields() {
      if (isMobileScreen()) {
        return mobileDefaultFields;
      }
      return canFitFields(baseDefaultFields) ? baseDefaultFields : compactDefaultFields;
    }

    function setToggleState(fields) {
      const enabledFields = new Set(fields);
      for (const toggle of columnToggles) {
        toggle.checked = enabledFields.has(toggle.dataset.columnToggle);
      }
    }

    function validSavedFields(fields) {
      if (!Array.isArray(fields) || !fields.length) {
        return [];
      }
      const knownFields = new Set(baseColumnSpecs.map((spec) => spec.field));
      return fields.filter((field) => knownFields.has(String(field)));
    }

    function loadSavedColumnFields() {
      const raw = window.localStorage.getItem(columnPrefsKey);
      if (!raw) {
        return [];
      }
      return validSavedFields(JSON.parse(raw));
    }

    function saveActiveColumnFields() {
      window.localStorage.setItem(columnPrefsKey, JSON.stringify(activeColumnFields()));
    }

    function applyInitialToggleState() {
      const savedFields = loadSavedColumnFields();
      if (savedFields.length) {
        userCustomizedColumns = true;
        setToggleState(savedFields);
        return;
      }
      setToggleState(preferredDefaultFields());
    }

    function activeColumnFields() {
      return columnToggles
        .filter((toggle) => toggle.checked)
        .map((toggle) => toggle.dataset.columnToggle);
    }

    function activeColumnSpecs() {
      const fields = new Set(activeColumnFields());
      const specs = baseColumnSpecs
        .filter((spec) => fields.has(spec.field))
        .map((spec) => ({...spec}));
      if (!isMobileScreen()) {
        applyTableScale(1);
        return specs.map((spec) => {
          const desktopSpec = {...spec};
          delete desktopSpec.maxWidth;
          if (desktopSpec.field === "model") {
            desktopSpec.minWidth = 280;
            desktopSpec.widthGrow = 7;
            desktopSpec.widthShrink = 1;
            delete desktopSpec.width;
          } else if (desktopSpec.field === "agent") {
            desktopSpec.minWidth = Math.max(90, Number(desktopSpec.minWidth || 0));
            desktopSpec.widthGrow = 1;
            desktopSpec.widthShrink = 1;
            delete desktopSpec.width;
          } else if (desktopSpec.field === "web_access") {
            desktopSpec.minWidth = 104;
            desktopSpec.width = 104;
            desktopSpec.widthGrow = 0;
            desktopSpec.widthShrink = 1;
          } else {
            desktopSpec.minWidth = Math.max(92, Number(desktopSpec.minWidth || 0));
            desktopSpec.widthGrow = 1;
            desktopSpec.widthShrink = 1;
            delete desktopSpec.width;
          }
          return desktopSpec;
        });
      }
      applyTableScale(1);
      const widths = {model: Math.min(240, Math.max(165, tableAvailableWidth() - 126)), agent: 58, overall: 66, web_access: 68, estimated_cost_usd: 68, elapsed_s: 65, total_tokens: 88};
      return specs.map(spec => ({...spec, width: widths[spec.field] || 72, minWidth: widths[spec.field] || 72, widthGrow: 0, widthShrink: 0, tooltip: true}));
    }

    let tableReady = false;

    function buildTable() {
      applyInitialToggleState();
      harnessTable = new Tabulator("#harness-table", {
        data: allHarnesses,
        height: "560px",
        layout: "fitData",
        index: "harness_id",
        initialSort: [{column: "overall", dir: "desc"}],
        downloadRowRange: "active",
        columnDefaults: {
          headerHozAlign: "left",
          vertAlign: "middle",
          headerFilterPlaceholder: "Filter",
          tooltip: true,
        },
        columns: activeColumnSpecs(),
      });
      harnessTable.on("tableBuilt", () => {
        tableReady = true;
        syncAfterFontsReady();
        syncOptionalColumns();
      });
    }

    function syncOptionalColumns() {
      if (!tableReady || !harnessTable) {
        return;
      }
      Promise.resolve(harnessTable.setColumns(activeColumnSpecs())).then(() => harnessTable.redraw(true));
    }

    function syncAfterFontsReady() {
      if (fontsReadyApplied || !document.fonts?.ready) {
        return;
      }
      document.fonts.ready.then(() => {
        fontsReadyApplied = true;
        syncOptionalColumns();
      });
    }

    for (const toggle of columnToggles) {
      toggle.addEventListener("change", () => {
        userCustomizedColumns = true;
        saveActiveColumnFields();
        syncOptionalColumns();
      });
    }
    window.addEventListener("resize", () => {
      if (!tableReady || !harnessTable) {
        return;
      }
      if (!userCustomizedColumns) {
        const preferredFields = preferredDefaultFields();
        const activeFields = activeColumnFields();
        if (preferredFields.join("|") !== activeFields.join("|")) {
          setToggleState(preferredFields);
          syncOptionalColumns();
          return;
        }
      }
      syncOptionalColumns();
    });
    buildTable();
    window.cadLeaderboard = {get table() {return harnessTable;}, rows: allHarnesses};
  