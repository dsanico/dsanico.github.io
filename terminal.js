function initPortfolioTerminal() {
  const terminal = document.getElementById("portfolio-terminal");
  const output = terminal?.querySelector(".terminal-output");
  const form = terminal?.querySelector(".terminal-prompt");
  const input = terminal?.querySelector(".terminal-input");
  const announcer = terminal?.querySelector(".terminal-announcer");

  if (!terminal || !output || !form || !input || !announcer) return;

  const about = "I'm a rising senior at the University of Michigan majoring in Electrical Engineering. My focus is embedded systems, with hands-on experience in PCB design, hardware verification, and firmware development. I'm especially drawn to the intersection of embedded systems and quantum technology, while remaining passionate about software and firmware.";

  const virtualFiles = {
    "bio.txt": [about],
    "education.txt": [
      "University of Michigan — Electrical Engineering",
      "Rising senior focused on embedded systems, PCB design, hardware verification, and firmware development.",
      "Study Abroad — Universidad Carlos III de Madrid (Jan. 2026 – May 2026)",
    ],
    "objective.txt": [
      "Build dependable embedded systems and help advance the hardware and firmware behind emerging quantum technology.",
    ],
    "prof_exp.txt": [
      "IBM — Quantum Firmware Intern (Jun. 2026 – Sep. 2026)",
      "MASA — Avionics Hardware Lead (Apr. 2025 – Dec. 2025)",
      "Rocket Lab — Electrical Engineering Intern (May 2025 – Aug. 2025)",
      "Pair Tech — Data Science Intern (May 2024 – Aug. 2024)",
    ],
    "xtracurriculars.txt": [
      "Michigan Aeronautical Research Association — Avionics",
      "Tau Epsilon Kappa — Quantum Circuit Simulator hackathon project",
    ],
    "hobbies.txt": [
      "Watercoloring and drawing",
      "Weightlifting",
      "Running and hiking",
      "Reading",
      "Breakfast",
    ],
  };

  const fileNames = Object.keys(virtualFiles);

  const helpText = [
    "Available commands:",
    "  ls                    list available .txt files",
    "  cat <file>            print a file",
    "  help                  show this guide",
    "  clear                 clear the terminal",
    "Use ↑ and ↓ to browse command history.",
  ];

  let started = false;
  let ready = false;
  let mode = "start";
  let historyIndex = 0;
  const history = [];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  input.disabled = true;

  const scrollToLatest = () => {
    terminal.scrollTop = terminal.scrollHeight;
  };

  const wait = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration));

  async function typeLine(text, variant = "") {
    const line = document.createElement("p");
    line.className = `terminal-line${variant ? ` terminal-line--${variant}` : ""}`;
    output.appendChild(line);

    if (reducedMotion || text.length === 0) {
      line.textContent = text || " ";
      announcer.textContent = text;
      scrollToLatest();
      return;
    }

    for (const character of text) {
      line.textContent += character;
      scrollToLatest();
      await wait(2 + Math.random() * 2);
    }
    announcer.textContent = text;
  }

  async function printLines(lines, variant = "") {
    input.disabled = true;
    ready = false;
    for (const line of lines) await typeLine(line, variant);
    ready = true;
    input.disabled = false;
    input.focus({ preventScroll: true });
    scrollToLatest();
  }

  function echoCommand(command) {
    const line = document.createElement("p");
    line.className = "terminal-line terminal-command-echo";
    line.textContent = `> ${command}`;
    output.appendChild(line);
  }

  async function beginSession() {
    mode = "commands";
    await printLines(["", about, "", "Type help to see the available commands."]);
  }

  async function runCommand(rawCommand) {
    const command = rawCommand.trim().toLowerCase().replace(/\s+/g, " ");
    if (!command) return;

    history.push(rawCommand.trim());
    historyIndex = history.length;
    echoCommand(rawCommand.trim());

    if (command === "clear") {
      output.replaceChildren();
      return;
    }

    if (command === "help") {
      await printLines(helpText);
      return;
    }

    if (command === "ls") {
      await printLines(fileNames);
      return;
    }

    const catMatch = command.match(/^cat(?:\s+(.+))?$/);
    if (catMatch) {
      const args = catMatch[1]?.split(" ").filter(Boolean) ?? [];
      const fileName = args[0];

      if (!fileName || args.length > 1) {
        await printLines(["Usage: cat <file>", "Try: cat bio.txt or cat prof_exp.txt"], "muted");
      } else if (virtualFiles[fileName]) {
        await printLines(virtualFiles[fileName]);
      } else {
        await printLines([`cat: ${fileName}: No such file`, "Type ls to see available files."], "error");
      }
      return;
    }

    await printLines([`Command not found: ${command}`, "Type help to see available commands."], "error");
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!ready) return;

    const command = input.value;
    input.value = "";

    if (mode === "start") {
      await beginSession();
    } else {
      await runCommand(command);
      if (!input.disabled) input.focus({ preventScroll: true });
    }
  });

  input.addEventListener("keydown", (event) => {
    if (mode !== "commands" || history.length === 0) return;

    if (event.key === "ArrowUp") {
      event.preventDefault();
      historyIndex = Math.max(0, historyIndex - 1);
      input.value = history[historyIndex];
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      historyIndex = Math.min(history.length, historyIndex + 1);
      input.value = history[historyIndex] ?? "";
    }
  });

  terminal.addEventListener("click", () => {
    if (!input.disabled) input.focus({ preventScroll: true });
  });

  window.portfolioTerminal = {
    async start() {
      if (started) return;
      started = true;
      await printLines(["Press Enter to start."], "muted");
    },
  };
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPortfolioTerminal);
} else {
  initPortfolioTerminal();
}
