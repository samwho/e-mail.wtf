// Email validator TypeScript
import { div } from "./dom.js";

interface EmailParseResult {
  name?: string;
  address?: string;
  local?: string;
  domain?: string;
  type?: string;
  format?: string;
  [key: string]: any;
}

// Theme management
function getTheme(): string {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    return savedTheme;
  }

  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches
  ) {
    return "light";
  }

  return "dark";
}

function setTheme(theme: string): void {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}

function toggleTheme(): void {
  const currentTheme = getTheme();
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  setTheme(newTheme);
}

// Make toggle function globally available
(window as any).toggleTheme = toggleTheme;

// JSON syntax highlighting
function syntaxHighlightJSON(obj: any): string {
  const json = JSON.stringify(obj, null, 2);
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = "json-number";
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "json-key";
        } else {
          cls = "json-string";
        }
      } else if (/true|false/.test(match)) {
        cls = "json-boolean";
      } else if (/null/.test(match)) {
        cls = "json-null";
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

function parseEmail(): void {
  const emailInputEl = document.getElementById(
    "emailInput"
  ) as HTMLInputElement;
  const rfc6532El = document.getElementById("rfc6532") as HTMLInputElement;
  const strictEl = document.getElementById("strict") as HTMLInputElement;
  const rejectTLDEl = document.getElementById("rejectTLD") as HTMLInputElement;

  if (!emailInputEl) return;

  const emailInput = emailInputEl.value;
  const rfc6532 = rfc6532El?.checked || false;
  const strict = strictEl?.checked || false;
  const rejectTLD = rejectTLDEl?.checked || false;

  const options = {
    input: emailInput,
    rfc6532,
    strict,
    rejectTLD,
  };

  try {
    // Parse the email address using the email-addresses library
    const result = (window as any).emailAddresses?.parseOneAddress(options);

    const resultsSection = document.getElementById("resultsSection");
    const statusIndicator = document.getElementById("statusIndicator");
    const parsedData = document.getElementById("parsedData");
    const astVisualization = document.getElementById("astVisualization");

    if (resultsSection) resultsSection.classList.remove("hidden");

    if (result) {
      // Success case
      if (statusIndicator)
        statusIndicator.className = "status-indicator status-valid";
      if (parsedData) parsedData.innerHTML = syntaxHighlightJSON(result);

      // Create AST visualization
      if (astVisualization) {
        astVisualization.innerHTML = "";
        createASTVisualization(result, astVisualization);
      }
    } else {
      // Failed to parse
      if (statusIndicator)
        statusIndicator.className = "status-indicator status-invalid";
      if (parsedData) {
        parsedData.innerHTML =
          '<div class="error-message">Failed to parse email address</div>';
      }

      if (astVisualization) {
        astVisualization.innerHTML =
          '<div class="ast-node error"><div class="node-label">Parsing Error</div><div class="node-value">The email address could not be parsed according to RFC 5322 specifications</div></div>';
      }
    }
  } catch (error: any) {
    // Exception occurred
    const resultsSection = document.getElementById("resultsSection");
    const statusIndicator = document.getElementById("statusIndicator");
    const parsedData = document.getElementById("parsedData");
    const astVisualization = document.getElementById("astVisualization");

    if (resultsSection) resultsSection.classList.remove("hidden");
    if (statusIndicator)
      statusIndicator.className = "status-indicator status-invalid";
    if (parsedData) {
      parsedData.innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
    }
    if (astVisualization) {
      astVisualization.innerHTML = `<div class="ast-node error"><div class="node-label">Exception</div><div class="node-value">${error.message}</div></div>`;
    }
  }
}

function createASTVisualization(
  data: EmailParseResult,
  container: HTMLElement
): void {
  // Main email address node
  const emailNode = div(
    { className: "ast-node email-address" },
    div({ className: "node-label" }, "Email Address"),
    div({ className: "node-value" }, data.address || "N/A")
  );

  const childrenContainer = div({ className: "node-children" });

  // Display name (if present)
  if (data.name) {
    const nameNode = div(
      { className: "ast-node display-name" },
      div({ className: "node-label" }, "Display Name"),
      div({ className: "node-value" }, `"${data.name}"`)
    );
    childrenContainer.appendChild(nameNode);
  }

  // Local part
  if (data.local) {
    const localNode = div(
      { className: "ast-node local-part" },
      div({ className: "node-label" }, "Local Part"),
      div({ className: "node-value" }, data.local)
    );
    childrenContainer.appendChild(localNode);
  }

  // Domain
  if (data.domain) {
    const domainNode = div(
      { className: "ast-node domain" },
      div({ className: "node-label" }, "Domain"),
      div({ className: "node-value" }, data.domain)
    );
    childrenContainer.appendChild(domainNode);
  }

  // Additional properties
  const additionalProps = ["type", "format"];
  additionalProps.forEach((prop) => {
    if (data[prop]) {
      const propNode = div(
        { className: "ast-node" },
        div(
          { className: "node-label" },
          prop.charAt(0).toUpperCase() + prop.slice(1)
        ),
        div({ className: "node-value" }, data[prop])
      );
      childrenContainer.appendChild(propNode);
    }
  });

  emailNode.appendChild(childrenContainer);
  container.appendChild(emailNode);
}

function loadExample(email: string): void {
  // Decode HTML entities for the input
  const decodedEmail = email
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
  const emailInputEl = document.getElementById(
    "emailInput"
  ) as HTMLInputElement;
  if (emailInputEl) {
    emailInputEl.value = decodedEmail;
    parseEmail();
  }
}

// Global functions for validator
(window as any).parseEmail = parseEmail;
(window as any).loadExample = loadExample;

// Initialize theme and set up event listeners for validator
document.addEventListener("DOMContentLoaded", () => {
  setTheme(getTheme());

  if (window.matchMedia) {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    mediaQuery.addEventListener("change", (e) => {
      if (!localStorage.getItem("theme")) {
        setTheme(e.matches ? "light" : "dark");
      }
    });
  }

  // Initialize validator functionality
  const emailInput = document.getElementById("emailInput") as HTMLInputElement;
  if (emailInput) {
    // Parse the default example on load
    parseEmail();

    // Set up real-time parsing
    emailInput.addEventListener("input", parseEmail);

    // Auto-parse when options change
    document.getElementById("rfc6532")?.addEventListener("change", parseEmail);
    document.getElementById("strict")?.addEventListener("change", parseEmail);
    document
      .getElementById("rejectTLD")
      ?.addEventListener("change", parseEmail);
  }
});
