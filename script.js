const editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
  mode: "python",
  lineNumbers: true,
  theme: "default"
});

let ws;

function runCode() {
  document.getElementById("output").textContent = "";

  ws = new WebSocket("wss://ide-ezt1.onrender.com/ws/run");

  ws.onopen = () => {
    ws.send(editor.getValue()); // send code first
  };

  ws.onmessage = (e) => {
    document.getElementById("output").textContent += e.data;
  };

  ws.onerror = () => {
    document.getElementById("output").textContent = "WebSocket error";
  };
}

function sendInput() {
  const input = document.getElementById("stdin").value;
  if (ws && ws.readyState === 1) {
    ws.send(input);
  }
  document.getElementById("stdin").value = "";
}
