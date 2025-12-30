const editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
  mode: "python",
  lineNumbers: true
});

const terminal = document.getElementById("terminal");
const input = document.getElementById("hiddenInput");

let ws;

function runCode() {
  terminal.textContent = "";
  input.value = "";
  input.focus();

  ws = new WebSocket("wss://ide-ezt1.onrender.com/ws/run");

  ws.onopen = () => {
    ws.send(editor.getValue());
  };

  ws.onmessage = (e) => {
    terminal.textContent += e.data;
    terminal.scrollTop = terminal.scrollHeight;
  };
}

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const value = input.value;
    terminal.textContent += value + "\n";
    ws.send(value);
    input.value = "";
  }
});

terminal.addEventListener("click", () => input.focus());
