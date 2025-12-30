from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import asyncio, tempfile, os

app = FastAPI()

TIMEOUT = 5  # seconds

@app.websocket("/ws/run")
async def run_code(ws: WebSocket):
    await ws.accept()

    try:
        # 1️⃣ Receive code
        code = await ws.receive_text()

        # 2️⃣ Save to temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".py") as f:
            f.write(code.encode())
            filename = f.name

        # 3️⃣ Start process
        proc = await asyncio.create_subprocess_exec(
            "python",
            filename,
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )

        async def stream_output():
            while True:
                line = await proc.stdout.readline()
                if not line:
                    break
                await ws.send_text(line.decode())

        output_task = asyncio.create_task(stream_output())

        # 4️⃣ Handle stdin
        while True:
            try:
                user_input = await asyncio.wait_for(ws.receive_text(), timeout=TIMEOUT)
                proc.stdin.write((user_input + "\n").encode())
                await proc.stdin.drain()
            except asyncio.TimeoutError:
                proc.kill()
                await ws.send_text("\n❌ Execution timed out")
                break
            except WebSocketDisconnect:
                proc.kill()
                break

        await output_task

    finally:
        if os.path.exists(filename):
            os.remove(filename)
