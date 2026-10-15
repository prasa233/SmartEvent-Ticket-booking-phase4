
from typing import Dict, Set

from fastapi import WebSocket


class AvailabilityManager:
    def __init__(self):
        # Each event has its own connected WebSocket clients.
        self.connections: Dict[int, Set[WebSocket]] = {}

    async def connect(
        self,
        event_id: int,
        websocket: WebSocket,
    ):
        await websocket.accept()

        self.connections.setdefault(event_id, set()).add(
            websocket
        )

    def disconnect(
        self,
        event_id: int,
        websocket: WebSocket,
    ):
        clients = self.connections.get(event_id)

        if clients is not None:
            clients.discard(websocket)

            if not clients:
                self.connections.pop(event_id, None)

    async def broadcast(
        self,
        event_id: int,
        message: dict,
    ):
        clients = list(
            self.connections.get(event_id, set())
        )

        disconnected = []

        for websocket in clients:
            try:
                await websocket.send_json(message)
            except Exception:
                # Remove clients whose connections have failed.
                disconnected.append(websocket)

        for websocket in disconnected:
            self.disconnect(event_id, websocket)


manager = AvailabilityManager()
