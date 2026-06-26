import json
from channels.generic.websocket import AsyncWebsocketConsumer


class GroupConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = self.scope['url_route']['kwargs']['group_name']
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        await self.channel_layer.group_send(
            self.group_name,
            {'type': 'group.message', 'message': json.loads(text_data)},
        )

    async def group_message(self, event):
        await self.send(text_data=json.dumps(event['message']))
