document.addEventListener("DOMContentLoaded", () => {

  const editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
    mode: "python",
    lineNumbers: true
  });

  const terminal = document.getElementById("terminal");
  const input = document.getElementById("hiddenInput");
  const cursor = document.getElementById("cursor");

  let ws = null;

  function clearTerminal() {
    terminal.innerHTML = "";
    terminal.appendChild(cursor);
  }

  function write(text) {
    cursor.remove();
    terminal.insertAdjacentText("beforeend", text);
    terminal.appendChild(cursor);
    terminal.scrollTop = terminal.scrollHeight;
  }

  window.runCode = function () {
    clearTerminal();
    input.value = "";
    input.focus();

    ws = new WebSocket("wss://ide-ezt1.onrender.com/ws/run");

    ws.onopen = () => {
      ws.send(editor.getValue());
    };

    ws.onmessage = (e) => {
      write(e.data);
    };

    ws.onerror =
