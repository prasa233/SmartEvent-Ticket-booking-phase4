from fastapi import WebSocket
import asyncio

class AvailabilityManager:
    def __init__(self):
        self.connections: dict[int, set[WebSocket]] = {}
        self.lock = asyncio.Lock()

    async def connect(self, event_id: int, websocket: WebSocket):
        await websocket.accept()

        async with self.lock:
            self.connections.setdefault(event_id, set()).add(websocket)

    async def disconnect(self, event_id: int, websocket: WebSocket):
        async with self.lock:
            sockets = self.connections.get(event_id, set())
            sockets.discard(websocket)

            if not sockets:
                self.connections.pop(event_id, None)

    async def broadcast(self, event_id: int, data: dict):
        async with self.lock:
            sockets = list(self.connections.get(event_id, set()))

        stale = []

        for socket in sockets:
            try:
                await socket.send_json(data)
            except Exception:
                stale.append(socket)

        for socket in stale:
            await self.disconnect(event_id, socket)


availability_manager = AvailabilityManager()