from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


def broadcast(group: str, message: dict):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        group,
        {'type': 'group.message', 'message': message},
    )
