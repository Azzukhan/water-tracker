from channels.generic.websocket import AsyncWebsocketConsumer


class WaterLevelConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.close()
