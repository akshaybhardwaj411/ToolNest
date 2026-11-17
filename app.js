
"use strict";

/* =================================
   TOOLNEST - APPLICATION CONTROLLER
================================= */

const $ = id => document.getElementById(id);

let activeTool = null;
let currentCategory = "All";
let lastCopy = "";

/* =================================
   TOOL DATABASE
================================= */

const tools = [

  /* AGE CALCULATOR */
  {
    id: "age",
    name: "Age Calculator",
    icon: "🎂",
    category: "Date",
    label: "DATE & TIME",
    description: "Calculate your exact age in years, months and days.",
    short: "Discover your exact age from your date of birth.",
    instructions: "Select your date of birth. We calculate your age using today's date.",
    fields: `
      <label class="field-label" for="birth">Your date of birth</label>
      <input class="field" type="date" id="birth">
      <div class="action-row">
        <button class="btn btn-primary" id="calculate">Calculate my age →</button>
        <button class="btn btn-secondary" id="reset">Reset</button>
      </div>
    `,
    calculate() {
      const value = $("birth").value;
      if (!value) return error("Please select your date of birth.");

      const birth = new Date(value + "T00:00:00");
      const today = new Date();

      if (birth > today) return error("Birth date cannot be in the future.");

      let y = today.getFullYear() - birth.getFullYear();
      let m = today.getMonth() - birth.getMonth();
      let d = today.getDate() - birth.getDate();

      if (d < 0) {
        m--;
        d += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
      }

      if (m < 0) {
        y--;
        m += 12;
      }

      return {
        main: `${y} years`,
        sub: `${m} months and ${d} days`,
        copy: `Age: ${y} years, ${m} months, ${d} days`
      };
    }
  },

  /* GST CALCULATOR */
  {
    id: "gst",
    name: "GST Calculator",
    icon: "🧾",
    category: "Finance",
    label: "FINANCE",
    description: "Calculate GST, inclusive and exclusive prices with tax breakdown.",
    short: "Calculate GST and final prices instantly.",
    instructions: "Enter an amount, select GST rate, calculation mode and tax type.",
    fields: `
      <label class="field-label" for="gstAmount">Amount (₹)</label>
      <input class="field" type="number" id="gstAmount" placeholder="e.g. 1000" min="0" step="0.01">

      <label class="field-label" for="gstRate">GST rate</label>
      <select class="field" id="gstRate">
        <option value="5">5%</option>
        <option value="12">12%</option>
        <option value="18" selected>18%</option>
        <option value="28">28%</option>
      </select>

      <label class="field-label" for="gstMode">Calculation mode</label>
      <select class="field" id="gstMode">
        <option value="exclusive">Add GST (Exclusive)</option>
        <option value="inclusive">Remove GST (Inclusive)</option>
      </select>

      <label class="field-label" for="gstType">Tax type</label>
      <select class="field" id="gstType">
        <option value="intra">CGST + SGST</option>
        <option value="inter">IGST</option>
      </select>

      <div class="action-row">
        <button class="btn btn-primary" id="calculate">Calculate GST →</button>
        <button class="btn btn-secondary" id="reset">Reset</button>
      </div>
    `,
    calculate() {
      const amountValue = $("gstAmount").value;
      const amount = Number(amountValue);
      const rate = Number($("gstRate").value);
      const mode = $("gstMode").value;
      const type = $("gstType").value;

      if (
        amountValue.trim() === "" ||
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        return error("Please enter a valid amount greater than zero.");
      }

      let base;
      let gst;
      let total;

      if (mode === "exclusive") {
        base = amount;
        gst = base * rate / 100;
        total = base + gst;
      } else {
        total = amount;
        base = total / (1 + rate / 100);
        gst = total - base;
      }

      const cgst = type === "intra" ? gst / 2 : 0;
      const sgst = type === "intra" ? gst / 2 : 0;
      const igst = type === "inter" ? gst : 0;

      const money = value => "₹" + value.toFixed(2);

      const breakdown = type === "intra"
        ? `CGST (${rate / 2}%): ${money(cgst)} | SGST (${rate / 2}%): ${money(sgst)}`
        : `IGST (${rate}%): ${money(igst)}`;

      return {
        main: money(total),
        sub: `Base: ${money(base)} | GST: ${money(gst)} | ${breakdown}`,
        copy: `GST Calculation
Mode: ${mode}
Tax type: ${type}
GST rate: ${rate}%
Base amount: ${money(base)}
GST amount: ${money(gst)}
${breakdown}
Final amount: ${money(total)}`
      };
    }
  },

  /* PERCENTAGE CALCULATOR */
  {
    id: "percentage",
    name: "Percentage Calculator",
    icon: "📊",
    category: "Student",
    label: "STUDENT",
    description: "Calculate your marks percentage with a clear breakdown.",
    short: "Find your percentage from obtained and total marks.",
    instructions: "Enter your obtained marks and total marks. Your percentage is calculated instantly.",
    fields: `
      <label class="field-label" for="obtained">Obtained marks</label>
      <input class="field" type="number" id="obtained" placeholder="e.g. 450" min="0">

      <label class="field-label" for="total">Total marks</label>
      <input class="field" type="number" id="total" placeholder="e.g. 500" min="1">

      <div class="action-row">
        <button class="btn btn-primary" id="calculate">Calculate percentage →</button>
        <button class="btn btn-secondary" id="reset">Reset</button>
      </div>
    `,
    calculate() {
      const a = $("obtained").value;
      const b = $("total").value;

      if (
        a === "" ||
        b === "" ||
        Number(b) <= 0 ||
        Number(a) < 0 ||
        Number(a) > Number(b)
      ) {
        return error("Enter valid marks. Obtained marks cannot exceed total marks.");
      }

      const percentage = Number(a) / Number(b) * 100;

      return {
        main: percentage.toFixed(2) + "%",
        sub: `${a} marks obtained out of ${b}`,
        copy: `Percentage: ${percentage.toFixed(2)}%`
      };
    }
  },

  /* WORD COUNTER */
  {
    id: "words",
    name: "Word Counter",
    icon: "✍️",
    category: "Text",
    label: "TEXT TOOLS",
    description: "Count words, characters and reading time while you write.",
    short: "Analyse your text with live statistics.",
    instructions: "Type or paste your text. Word count and character count update automatically.",
    fields: `
      <label class="field-label" for="wordText">Your text</label>
      <textarea class="field" id="wordText" placeholder="Start typing or paste your text here..."></textarea>

      <div class="live-stats">
        <div class="live-stat">
          <strong id="wordCount">0</strong>
          <span>Words</span>
        </div>
        <div class="live-stat">
          <strong id="charCount">0</strong>
          <span>Characters</span>
        </div>
        <div class="live-stat">
          <strong id="readTime">0</strong>
          <span>Min read</span>
        </div>
      </div>

      <div class="action-row">
        <button class="btn btn-secondary" id="reset">Clear text</button>
      </div>
    `,
    calculate() {
      const text = $("wordText").value;
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const chars = text.length;
      const reading = words ? Math.max(1, Math.ceil(words / 200)) : 0;

      return {
        main: words + " words",
        sub: `${chars} characters · ${reading} min estimated reading time`,
        copy: `Words: ${words}\nCharacters: ${chars}\nReading time: ${reading} minutes`
      };
    }
  },

  /* DATE CALCULATOR */
  {
    id: "date",
    name: "Date Calculator",
    icon: "📅",
    category: "Date",
    label: "DATE & TIME",
    description: "Find the exact number of days between two dates.",
    short: "Calculate the difference between any two dates.",
    instructions: "Choose your start date and end date to calculate the difference.",
    fields: `
      <label class="field-label" for="date1">Start date</label>
      <input class="field" type="date" id="date1">

      <label class="field-label" for="date2">End date</label>
      <input class="field" type="date" id="date2">

      <div class="action-row">
        <button class="btn btn-primary" id="calculate">Calculate difference →</button>
        <button class="btn btn-secondary" id="reset">Reset</button>
      </div>
    `,
    calculate() {
      const a = $("date1").value;
      const b = $("date2").value;

      if (!a || !b) return error("Please select both dates.");

      const start = Date.parse(a + "T00:00:00Z");
      const end = Date.parse(b + "T00:00:00Z");
      const days = Math.abs(end - start) / 86400000;

      return {
        main: days + " days",
        sub: "Difference between the selected dates.",
        copy: `Date difference: ${days} days`
      };
    }
  },

  /* BMI CALCULATOR */
  {
    id: "bmi",
    name: "BMI Calculator",
    icon: "⚖️",
    category: "Calculators",
    label: "CALCULATOR",
    description: "Calculate your body mass index using height and weight.",
    short: "Check your BMI using your body measurements.",
    instructions: "Enter weight in kilograms and height in centimetres. BMI is a general screening measure, not a diagnosis.",
    fields: `
      <label class="field-label" for="weight">Weight (kg)</label>
      <input class="field" type="number" id="weight" placeholder="e.g. 70" step="0.1" min="0">

      <label class="field-label" for="height">Height (cm)</label>
      <input class="field" type="number" id="height" placeholder="e.g. 175" step="0.1" min="0">

      <div class="action-row">
        <button class="btn btn-primary" id="calculate">Calculate BMI →</button>
        <button class="btn btn-secondary" id="reset">Reset</button>
      </div>
    `,
    calculate() {
      const w = $("weight").value;
      const h = $("height").value;

      if (!w || !h || Number(w) <= 0 || Number(h) <= 0) {
        return error("Please enter valid weight and height.");
      }

      const bmi = Number(w) / ((Number(h) / 100) ** 2);

      let status = bmi < 18.5
        ? "Below standard adult BMI range"
        : bmi < 25
        ? "Within standard adult BMI range"
        : bmi < 30
        ? "Above standard adult BMI range"
        : "High adult BMI range";

      return {
        main: bmi.toFixed(1),
        sub: status + ". This is a screening measure, not a diagnosis.",
        copy: `BMI: ${bmi.toFixed(1)}\n${status}`
      };
    }
  },

  /* TEXT CASE CONVERTER */
  {
    id: "text",
    name: "Text Case Converter",
    icon: "🔠",
    category: "Text",
    label: "TEXT TOOLS",
    description: "Transform your text into the format you need.",
    short: "Convert your text into uppercase or lowercase.",
    instructions: "Enter your text and choose the conversion you need.",
    fields: `
      <label class="field-label" for="caseText">Your text</label>
      <textarea class="field" id="caseText" placeholder="Type or paste your text..."></textarea>

      <div class="action-row">
        <button class="btn btn-primary" id="upper">UPPERCASE</button>
        <button class="btn btn-secondary" id="lower">lowercase</button>
        <button class="btn btn-outline" id="reset">Clear</button>
      </div>
    `
  }
];

/* =================================
   HOMEPAGE TOOL CARDS
================================= */

function renderTools() {
  $("toolGrid").innerHTML = tools.map(tool => `
    <article class="tool-card"
      data-name="${tool.name.toLowerCase()}"
      data-category="${tool.category}"
      data-tool="${tool.id}"
      tabindex="0"
      role="button"
      aria-label="Open ${tool.name}">

      <div class="tool-top">
        <div class="tool-icon">${tool.icon}</div>
        <span class="arrow">↗</span>
      </div>

      <h3>${tool.name}</h3>
      <p>${tool.short}</p>
      <span class="tool-label">${tool.label}</span>
    </article>
  `).join("");

  document.querySelectorAll(".tool-card").forEach(card => {
    card.addEventListener("click", () => {
      navigateToTool(card.dataset.tool);
    });

    card.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        navigateToTool(card.dataset.tool);
      }
    });
  });

  filterTools();
}

/* =================================
   NAVIGATION SYSTEM
================================= */

function navigateToTool(id) {
  const tool = tools.find(item => item.id === id);
  if (!tool) return;

  history.pushState(
    { view: "tool", toolId: id },
    "",
    "#tool-" + id
  );

  showTool(id);
}

function navigateHome() {
  history.pushState(
    { view: "home" },
    "",
    "#home"
  );

  showHome();
}

function showTool(id) {
  const tool = tools.find(item => item.id === id);
  if (!tool) return showHome();

  activeTool = id;
  lastCopy = "";

  $("homeView").hidden = true;
  $("workspace").hidden = false;

  $("workspaceTitle").textContent = tool.name;
  $("toolCategory").textContent = "TOOLNEST / " + tool.label;
  $("workspaceDescription").textContent = tool.description;
  $("workspaceIcon").textContent = tool.icon;

  $("toolFields").innerHTML = tool.fields;
  $("howItWorks").textContent = tool.instructions;

  resetResult();
  bindToolEvents(tool);

  window.scrollTo({ top: 0, behavior: "instant" });
}

function showHome() {
  activeTool = null;
  lastCopy = "";

  $("workspace").hidden = true;
  $("homeView").hidden = false;

  window.scrollTo({ top: 0, behavior: "instant" });
}

function goBack() {
  if (activeTool) {
    if (history.state && history.state.view === "tool") {
      history.back();
    } else {
      navigateHome();
    }
  } else {
    showHome();
  }
}

/* Browser / Android back button support */

window.addEventListener("popstate", event => {
  const state = event.state;

  if (state && state.view === "tool") {
    showTool(state.toolId);
  } else if (location.hash.startsWith("#tool-")) {
    const id = location.hash.replace("#tool-", "");
    showTool(id);
  } else {
    showHome();
  }
});

/* =================================
   TOOL EVENT BINDINGS
================================= */

function bindToolEvents(tool) {
  const calculateButton = $("calculate");
  const resetButton = $("reset");

  if (calculateButton && tool.calculate) {
    calculateButton.addEventListener("click", () => {
      renderResult(tool.calculate());
    });
  }

  if (resetButton) {
    resetButton.addEventListener("click", resetTool);
  }

  if (tool.id === "words") {
    $("wordText").addEventListener("input", updateWordStats);
  }

  if (tool.id === "percentage" || tool.id === "bmi") {
    const ids = tool.id === "percentage"
      ? ["obtained", "total"]
      : ["weight", "height"];

    ids.forEach(id => {
      $(id).addEventListener("input", liveCalculate);
    });
  }

  if (tool.id === "gst") {
    ["gstAmount", "gstRate", "gstMode", "gstType"].forEach(id => {
      $(id).addEventListener("input", liveCalculate);
      $(id).addEventListener("change", liveCalculate);
    });
  }

  if (tool.id === "text") {
    $("upper").addEventListener("click", () => {
      convertText("upper");
    });

    $("lower").addEventListener("click", () => {
      convertText("lower");
    });
  }
}

/* =================================
   RESULTS
================================= */

function renderResult(data) {
  if (!data) return;

  $("resultContent").className = "result-panel";

  $("resultContent").innerHTML = `
    <div class="result-label">CALCULATION RESULT</div>
    <div class="result-value">${escapeHTML(data.main)}</div>
    <div class="result-sub">${escapeHTML(data.sub)}</div>
  `;

  lastCopy = data.copy || "";

  $("copyResult").classList.toggle("hidden", !lastCopy);
}

function error(message) {
  return {
    main: "Check your input",
    sub: message,
    copy: ""
  };
}

function resetResult() {
  $("resultContent").className = "result-placeholder";

  $("resultContent").innerHTML = `
    <div>
      <span>✧</span>
      Your result will appear here.
      <br>Enter your details to get started.
    </div>
  `;

  $("copyResult").classList.add("hidden");
  lastCopy = "";
}

function liveCalculate() {
  const tool = tools.find(item => item.id === activeTool);
  if (!tool || !tool.calculate) return;

  let ids;

  if (activeTool === "percentage") {
    ids = ["obtained", "total"];
  } else if (activeTool === "bmi") {
    ids = ["weight", "height"];
  } else if (activeTool === "gst") {
    ids = ["gstAmount"];
  } else {
    return;
  }

  const filled = ids.every(id => $(id).value.trim() !== "");

  if (filled) {
    renderResult(tool.calculate());
  } else {
    resetResult();
  }
}

function updateWordStats() {
  const text = $("wordText").value;

  const words = text.trim()
    ? text.trim().split(/\s+/).length
    : 0;

  const reading = words
    ? Math.max(1, Math.ceil(words / 200))
    : 0;

  $("wordCount").textContent = words;
  $("charCount").textContent = text.length;
  $("readTime").textContent = reading;

  const tool = tools.find(item => item.id === "words");
  const data = tool.calculate();

  lastCopy = data.copy;
  $("copyResult").classList.toggle("hidden", !text.length);

  if (text.length) {
    $("resultContent").className = "result-panel";

    $("resultContent").innerHTML = `
      <div class="result-label">LIVE TEXT ANALYSIS</div>
      <div class="result-value">${words} words</div>
      <div class="result-sub">
        ${text.length} characters · ${reading} min reading time
      </div>
    `;
  } else {
    resetResult();
  }
}

function convertText(mode) {
  const input = $("caseText");

  const value = mode === "upper"
    ? input.value.toUpperCase()
    : input.value.toLowerCase();

  input.value = value;

  renderResult({
    main: "Text converted",
    sub: "Successfully converted to " +
      (mode === "upper" ? "uppercase." : "lowercase."),
    copy: value
  });
}

function resetTool() {
  $("toolFields")
    .querySelectorAll("input, textarea, select")
    .forEach(field => field.value = "");

  resetResult();

  if (activeTool === "words") {
    $("wordCount").textContent = "0";
    $("charCount").textContent = "0";
    $("readTime").textContent = "0";
  }
}

/* =================================
   HTML ESCAPE
================================= */

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

/* =================================
   COPY RESULT
================================= */

$("copyResult").addEventListener("click", async () => {
  if (!lastCopy) return;

  try {
    await navigator.clipboard.writeText(lastCopy);

    $("copyResult").textContent = "✓ Copied!";

    setTimeout(() => {
      $("copyResult").textContent = "▣ Copy result";
    }, 1500);

  } catch (error) {
    $("copyResult").textContent = "Copy unavailable";
  }
});

/* =================================
   SEARCH & CATEGORIES
================================= */

function filterTools() {
  const query = $("search").value.toLowerCase().trim();
  let visible = 0;

  document.querySelectorAll(".tool-card").forEach(card => {
    const nameMatch = card.dataset.name.includes(query);

    const categoryMatch =
      currentCategory === "All" ||
      card.dataset.category === currentCategory;

    const show = nameMatch && categoryMatch;

    card.style.display = show ? "" : "none";

    if (show) visible++;
  });

  $("count").textContent = visible + " tools";
  $("empty").hidden = visible !== 0;
}

$("search").addEventListener("input", filterTools);

document.querySelectorAll(".category").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".category")
      .forEach(item => item.classList.remove("active"));

    button.classList.add("active");
    currentCategory = button.dataset.category;

    filterTools();
  });
});

/* =================================
   THEME
================================= */

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  $("themeBtn").textContent = theme === "dark" ? "☀" : "☾";

  try {
    localStorage.setItem("toolnest-theme", theme);
  } catch (e) {}
}

$("themeBtn").addEventListener("click", () => {
  const current = document.documentElement.dataset.theme;
  setTheme(current === "dark" ? "light" : "dark");
});

/* =================================
   NAVIGATION BUTTONS
================================= */

$("backBtn").addEventListener("click", goBack);

$("homeLogo").addEventListener("click", event => {
  event.preventDefault();
  navigateHome();
});

$("toolsNav").addEventListener("click", () => {
  if (activeTool) navigateHome();

  setTimeout(() => {
    $("toolsSection").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }, 30);
});

function openAbout() {
  if (activeTool) navigateHome();

  setTimeout(() => {
    $("aboutSection").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }, 30);
}

$("aboutNav").addEventListener("click", openAbout);

$("footerAbout").addEventListener("click", event => {
  event.preventDefault();
  openAbout();
});

/* =================================
   APPLICATION INITIALIZATION
================================= */

function init() {
  renderTools();

  try {
    const savedTheme = localStorage.getItem("toolnest-theme");

    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
    }
  } catch (e) {}

  if (location.hash.startsWith("#tool-")) {
    const id = location.hash.replace("#tool-", "");
    showTool(id);
  } else {
    showHome();
  }
}

init();
