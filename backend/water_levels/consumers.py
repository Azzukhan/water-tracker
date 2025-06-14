import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import WaterStation, WaterLevel

class WaterLevelConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.station_id = self.scope['url_route']['kwargs']['station_id']
        self.station_group_name = f'water_level_{self.station_id}'

        # Join station group
        await self.channel_layer.group_add(
            self.station_group_name,
            self.channel_name
        )

        await self.accept()
        
        # Send initial data
        station_exists = await self.check_station_exists(self.station_id)
        if station_exists:
            data = await self.get_latest_water_level(self.station_id)
            if data:
                await self.send(text_data=json.dumps(data))
        else:
            await self.send(text_data=json.dumps({
                'error': f'Station with ID {self.station_id} does not exist.'
            }))

    async def disconnect(self, close_code):
        # Leave station group
        await self.channel_layer.group_discard(
            self.station_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json.get('message', '')
        
        if message == 'get_latest':
            data = await self.get_latest_water_level(self.station_id)
            if data:
                await self.send(text_data=json.dumps(data))

    # Receive message from station group
    async def water_level_update(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps(event['data']))

    @database_sync_to_async
    def check_station_exists(self, station_id):
        return WaterStation.objects.filter(id=station_id).exists()

    @database_sync_to_async
    def get_latest_water_level(self, station_id):
        try:
            water_level = WaterLevel.objects.filter(
                station_id=station_id
            ).order_by('-timestamp').first()
            
            if water_level:
                return {
                    'id': water_level.id,
                    'station_id': water_level.station.id,
                    'station_name': water_level.station.name,
                    'level': water_level.level,
                    'normal_level': water_level.normal_level,
                    'status': water_level.status,
                    'trend': water_level.trend,
                    'timestamp': water_level.timestamp.isoformat(),
                }
            return None
        except Exception as e:
            return {'error': str(e)}
