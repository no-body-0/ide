from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import asyncio, tempfile, os

app = FastAPI()

@app.websocket("/ws/run")
async def run_code(ws: WebSocket):
    await ws.accept()
    filename = None

    try:
        code = await ws.receive_text()

        with tempfile.NamedTemporaryFile(delete=False, suffix=".py") as f:
            f.write(code.encode())
            filename = f.name

        proc = await asyncio.create_subprocess_exec(
            "python",
            "-u",
            filename,
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.STDOUT
        )

        async def stream_output():
            while True:
                data = await proc.stdout.read(1024)
                if not data:
                    break
                await ws.send_text(data.decode())

        output_task = asyncio.create_task(stream_output())

        while True:
            try:
                user_input = await ws.receive_text()
                proc.stdin.write((user_input + "\n").encode())
                await proc.stdin.drain()
            except WebSocketDisconnect:
                proc.kill()
                break

        await output_task

    finally:
        if filename and os.path.exists(filename):
            os.remove(filename)
