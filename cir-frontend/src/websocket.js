import { useEffect } from 'react';
import { SERVER_IP } from './constants';

const WS_BASE = SERVER_IP.replace(/^http/, 'ws') + '/ws';

export function connectToGroup(group, onMessage) {
    const ws = new WebSocket(`${WS_BASE}/${group}/`);
    ws.onmessage = (event) => onMessage(JSON.parse(event.data));
    ws.onerror = (err) => console.error('[WS] error', err);
    return ws;
}

export function useWebSocket(group, onMessage) {
    useEffect(() => {
        const ws = connectToGroup(group, onMessage);
        return () => ws.close();
    }, [group]);
}
