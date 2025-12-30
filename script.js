document.addEventListener("DOMContentLoaded", () => {

  const editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
    mode: "python",
    lineNumbers: true
  });

  const terminal = document.getElementById("terminal");
  const input = document.getElementById("hiddenInput");

  let ws = null;

  window.runCode = function () {
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

    ws.onerror = () => {
      terminal.textContent += "\n[WebSocket error]\n";
    };
  };

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && ws && ws.readyState === 1) {
      e.preventDefault();
      terminal.textContent += input.value + "\n";
      ws.send(input.value);
      input.value = "";
    }
  });

  terminal.addEventListener("click", () => input.focus());

});
