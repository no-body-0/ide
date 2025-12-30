document.addEventListener("DOMContentLoaded", () => {

  const editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
    mode: "python",
    lineNumbers: true
  });

  const terminal = document.getElementById("terminal");
  const input = document.getElementById("hiddenInput");
  const cursor = document.getElementById("cursor");

  let ws = null;

  function write(text) {
    cursor.remove();
    terminal.textContent += text;
    terminal.appendChild(cursor);
    terminal.scrollTop = terminal.scrollHeight;
  }

  window.runCode = function () {
    terminal.textContent = "";
    terminal.appendChild(cursor);
    input.value = "";
    input.focus();

    ws = new WebSocket("wss://ide-ezt1.onrender.com/ws/run");

    ws.onopen = () => ws.send(editor.getValue());

    ws.onmessage = (e) => write(e.data);

    ws.onerror = () => write("\n[WebSocket error]\n");
  };

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && ws && ws.readyState === 1) {
      e.preventDefault();
      write(input.value + "\n");
      ws.send(input.value);
      input.value = "";
    }
  });

  terminal.addEventListener("click", () => input.focus());

});
