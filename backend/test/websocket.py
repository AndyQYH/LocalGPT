import asyncio
import websockets

async def test_ws():
    uri = "ws://localhost:8000/ws/testuser"
    async with websockets.connect(uri) as websocket:
        await websocket.send("Hello!")
        while True:
            message = await websocket.recv()
            print(message)
            if "[DONE]" in message:
                break

asyncio.run(test_ws())
