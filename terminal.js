function initPortfolioTerminal() {
  const terminal = document.getElementById("portfolio-terminal");
  const output = terminal?.querySelector(".terminal-output");
  const form = terminal?.querySelector(".terminal-prompt");
  const input = terminal?.querySelector(".terminal-input");
  const announcer = terminal?.querySelector(".terminal-announcer");

  if (!terminal || !output || !form || !input || !announcer) return;

  const about = "I'm a senior at the University of Michigan majoring in Electrical Engineering. My focus is embedded systems and microwave engineering, with hands-on experience in PCB design, hardware verification, and firmware development. I'm especially drawn to the intersection of embedded systems and quantum technology, and I have specialized experience in qubit control electronics and space-grade hardware.";

  const virtualFiles = {
    "bio.txt": [about],
    "education.txt": [
      "University of Michigan",
      "     graduation date: May 2027",
      "     major: Electrical Engineering",
      "     GPA: 3.67/4",
      "     honors and awards: Dean's List, James B. Angell Scholar, Ernest W. Reynolds Endowment",
      "Universidad Carlos III de Madrid (study abroad)",
      "     term: Spring 2026",
      "     churros eaten: 112"
    ],
    "experience.txt": [
      "IBM        | Quantum Firmware Intern       | Jun. 2026 - Aug. 2026",
      "MASA       | Avionics Hardware Lead        | Apr. 2025 - Dec. 2025",
      "Rocket Lab | Electrical Engineering Intern | May 2025 - Aug. 2025",
      "Pair Tech  | Data Science Intern           | May 2024 - Aug. 2024",
      "",
      "(view the projects and timeline section of this website for more details"
    ],
    "skills.txt": [
      "Hardware            | Firmware/Software",
      "---------------------------------------",
      "Altium              | Python",
      "LTspice             | C++",
      "VHDL                | C",
      "Oscilloscope        | Assembly",
      "VNA                 | Qiskit",
      "DMM                 | Linux",
      "Power Supplies      | Arduino",
      "Low-Voltage Design  | MATLAB",
      "Mixed-System Design | Git",
      "Hardware Assembly   | Pytest",
      "Systems Integration | Docker",
      "",
      "(view the skills section of this website for more details)"
    ],
    "courses.txt": [
      "Intro to Computer Organization",
      "Digital Logic",
      "Circuit Analysis",
      "Signals and Systems",
      "Electromagnetics",
      "Principles of Optics",
      "Electrical Engineering System Design",
      "Intro to Data Structures and Algorithms",
      "Intro to Quantum Information Technology",
      "Intro to Quantum Nanotechnology (Fall 2026)",
      "Microwave Circuits I (Capstone) (Fall 2026)"
    ],
    "hobbies.txt": [
      "Travelling",
      "Weightlifting",
      "Running and hiking",
      "Reading",
      "Coding for fun",
      "Breakfast",
    ],
  };

  const contentFileNames = Object.keys(virtualFiles);
  const fileNames = [...contentFileNames, "all.txt"];
  const jumpDestinations = ["skills", "projects", "timeline", "contact"];

  const getAllFileContent = () =>
    contentFileNames.flatMap((fileName, index) => [
      ...(index === 0 ? [] : [""]),
      `===== ${fileName} =====`,
      ...virtualFiles[fileName],
    ]);

  const helpText = [
    "Available commands:",
    "  ls                    list available .txt files",
    "  cat <file>            print the context of a .txt file",
    "  jump <section>        go to skills, projects, timeline, or contact",
    "  help                  show this guide",
    "  clear                 clear the terminal",
    "Use ↑ and ↓ to browse command history.",
    "",
    "(Enter 'cat all.txt' to view all information)"
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
    await printLines(["", about, "", "Enter 'help' to see the available commands, or enter 'cat all.txt' to view all information."]);
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

    const jumpMatch = command.match(/^jump(?:\s+(.+))?$/);
    if (jumpMatch) {
      const destination = jumpMatch[1];

      if (!destination || destination.includes(" ")) {
        await printLines([
          "Usage: jump <section>",
          `Available sections: ${jumpDestinations.join(", ")}`
        ], "muted");
        return;
      }

      if (!jumpDestinations.includes(destination)) {
        await printLines([
          `jump: ${destination}: No such section`,
          `Available sections: ${jumpDestinations.join(", ")}`
        ], "error");
        return;
      }

      const navigationLink = document.querySelector(`.navbar-nav a[href="#${destination}"]`);
      if (!navigationLink) {
        await printLines([`jump: ${destination}: Navigation unavailable`], "error");
        return;
      }

      await printLines([`Jumping to ${destination}...`]);
      navigationLink.click();
      return;
    }

    const catMatch = command.match(/^cat(?:\s+(.+))?$/);
    if (catMatch) {
      const args = catMatch[1]?.split(" ").filter(Boolean) ?? [];
      const fileName = args[0];

      if (!fileName || args.length > 1) {
        await printLines(["Usage: cat <file>", "Try: cat bio.txt or cat all.txt"], "muted");
      } else if (fileName === "all.txt") {
        await printLines(getAllFileContent());
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
