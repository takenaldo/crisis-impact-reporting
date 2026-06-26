import { useEffect, useRef, useState } from 'react';
import { SERVER_IP } from './constants';

const WS_URL = SERVER_IP.replace(/^http/, 'ws') + '/ws/reports/';

const SEVERITY_COLOR = {
  critical: '#ef4444',
  high:     '#f97316',
  medium:   '#f59e0b',
  low:      '#22c55e',
};

const STATUS_COLOR = {
  connecting:   '#f59e0b',
  connected:    '#22c55e',
  disconnected: '#6b7280',
  error:        '#ef4444',
};

function EventCard({ event }) {
  if (event.type === 'new_report') {
    return (
      <div style={{ background: '#0f2027', border: '1px solid #1e3a4a', borderLeft: '4px solid #3b82f6', borderRadius: 6, padding: '10px 14px', marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ color: '#3b82f6', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>New Report #{event.id}</span>
          <span style={{ color: SEVERITY_COLOR[event.damage_severity] || '#94a3b8', fontSize: 12, fontWeight: 600 }}>
            {event.damage_severity?.toUpperCase() || 'UNKNOWN'}
          </span>
        </div>
        <div style={{ color: '#e2e8f0', fontSize: 14, marginBottom: 2 }}>
          {event.infrastructure_name || '—'} <span style={{ color: '#64748b' }}>({event.infrastructure_type || '—'})</span>
        </div>
        {(event.city || event.country) && (
          <div style={{ color: '#94a3b8', fontSize: 12 }}>
            📍 {[event.city, event.country].filter(Boolean).join(', ')}
            {event.lat && event.lon && <span style={{ color: '#475569' }}> · {Number(event.lat).toFixed(4)}, {Number(event.lon).toFixed(4)}</span>}
          </div>
        )}
      </div>
    );
  }

  if (event.type === 'report_updated') {
    return (
      <div style={{ background: '#0f1f0f', border: '1px solid #1e3a1e', borderLeft: '4px solid #22c55e', borderRadius: 6, padding: '10px 14px', marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ color: '#22c55e', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Report Updated #{event.id}</span>
          <span style={{ color: SEVERITY_COLOR[event.damage_severity] || '#94a3b8', fontSize: 12, fontWeight: 600 }}>
            {event.damage_severity?.toUpperCase() || 'UNKNOWN'}
          </span>
        </div>
        <div style={{ color: '#e2e8f0', fontSize: 14 }}>
          {event.infrastructure_name || '—'} <span style={{ color: '#64748b' }}>({event.infrastructure_type || '—'})</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#1e1e2e', border: '1px solid #334155', borderRadius: 6, padding: '10px 14px', marginBottom: 8, fontFamily: 'monospace', fontSize: 12, color: '#94a3b8' }}>
      <pre style={{ margin: 0 }}>{JSON.stringify(event, null, 2)}</pre>
    </div>
  );
}

export default function WsTestPage() {
  const [status, setStatus]   = useState('disconnected');
  const [events, setEvents]   = useState([]);
  const [rawLog, setRawLog]   = useState([]);
  const [tab, setTab]         = useState('events');
  const wsRef                 = useRef(null);

  function addLog(type, text) {
    setRawLog(prev => [...prev, { type, text, ts: new Date().toLocaleTimeString() }]);
  }

  function connect() {
    if (wsRef.current) wsRef.current.close();
    addLog('info', `Connecting to ${WS_URL} …`);
    setStatus('connecting');

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('connected');
      addLog('success', 'WebSocket connected — waiting for real events (submit a report to trigger one)');
    };

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      addLog('message', `← ${JSON.stringify(msg)}`);
      if (msg.type === 'new_report' || msg.type === 'report_updated') {
        setEvents(prev => [msg, ...prev]);
      }
    };

    ws.onerror = () => {
      setStatus('error');
      addLog('error', 'WebSocket error');
    };

    ws.onclose = (e) => {
      setStatus('disconnected');
      addLog('info', `Disconnected (code ${e.code})`);
    };
  }

  function disconnect() {
    wsRef.current?.close();
  }

  function sendMockEvent(type) {
    if (wsRef.current?.readyState !== WebSocket.OPEN) return;
    const mock = type === 'new_report'
      ? { type: 'new_report', id: Math.floor(Math.random() * 9000) + 1000, infrastructure_name: 'Menelik Bridge', infrastructure_type: 'bridge', damage_severity: ['low','medium','high','critical'][Math.floor(Math.random()*4)], city: 'Addis Ababa', country: 'Ethiopia', lat: 9.0249, lon: 38.7468 }
      : { type: 'report_updated', id: Math.floor(Math.random() * 9000) + 1000, infrastructure_name: 'Bole Road Tunnel', infrastructure_type: 'tunnel', damage_severity: 'medium' };
    wsRef.current.send(JSON.stringify(mock));
    addLog('sent', `→ sent mock ${type}`);
  }

  useEffect(() => () => wsRef.current?.close(), []);

  const dot   = { width: 10, height: 10, borderRadius: '50%', display: 'inline-block', marginRight: 8, background: STATUS_COLOR[status] };
  const card  = { background: '#1e1e2e', borderRadius: 8, padding: '12px 16px', marginBottom: 10 };
  const LOG_COLOR = { info: '#94a3b8', success: '#22c55e', error: '#ef4444', message: '#60a5fa', sent: '#a78bfa' };

  return (
    <div style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'sans-serif', padding: '0 16px', background: '#0d0d1a', minHeight: '100vh', color: '#e2e8f0' }}>
      <h2 style={{ marginBottom: 2, paddingTop: 32 }}>WebSocket Live Feed — Reports</h2>
      <p style={{ color: '#64748b', fontSize: 13, marginTop: 0, marginBottom: 16 }}>
        Real events: <code style={{ color: '#3b82f6' }}>new_report</code> fires when a report is submitted · <code style={{ color: '#22c55e' }}>report_updated</code> fires on edit
      </p>

      {/* Status + controls */}
      <div style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <span>
          <span style={dot} />
          <strong style={{ color: STATUS_COLOR[status] }}>{status.toUpperCase()}</strong>
          <span style={{ color: '#475569', fontSize: 12, marginLeft: 10 }}>{WS_URL}</span>
        </span>
        <span style={{ display: 'flex', gap: 6 }}>
          <button onClick={connect} disabled={status === 'connecting' || status === 'connected'} style={{ padding: '4px 12px', cursor: 'pointer', borderRadius: 4 }}>Connect</button>
          <button onClick={disconnect} disabled={status !== 'connected'} style={{ padding: '4px 12px', cursor: 'pointer', borderRadius: 4 }}>Disconnect</button>
        </span>
      </div>

      {/* Mock event buttons */}
      <div style={{ ...card }}>
        <div style={{ color: '#64748b', fontSize: 12, marginBottom: 8 }}>SEND MOCK EVENT (bypasses the form — good for testing the UI)</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => sendMockEvent('new_report')} disabled={status !== 'connected'}
            style={{ padding: '5px 14px', cursor: 'pointer', background: '#1e3a5f', color: '#93c5fd', border: '1px solid #2563eb', borderRadius: 4, fontSize: 13 }}>
            + new_report
          </button>
          <button onClick={() => sendMockEvent('report_updated')} disabled={status !== 'connected'}
            style={{ padding: '5px 14px', cursor: 'pointer', background: '#0f2a0f', color: '#86efac', border: '1px solid #16a34a', borderRadius: 4, fontSize: 13 }}>
            ✎ report_updated
          </button>
        </div>
        <div style={{ color: '#374151', fontSize: 11, marginTop: 8 }}>
          Or submit/edit a real report — it will appear here automatically.
        </div>
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 0, borderBottom: '1px solid #1e293b' }}>
        {['events', 'raw log'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '7px 18px', cursor: 'pointer', background: 'none', border: 'none', borderBottom: tab === t ? '2px solid #3b82f6' : '2px solid transparent', color: tab === t ? '#3b82f6' : '#64748b', fontWeight: tab === t ? 600 : 400, fontSize: 13 }}>
            {t} {t === 'events' && events.length > 0 && <span style={{ background: '#3b82f6', color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: 10, marginLeft: 4 }}>{events.length}</span>}
          </button>
        ))}
        <button onClick={() => { setEvents([]); setRawLog([]); }} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#374151', cursor: 'pointer', fontSize: 11 }}>clear</button>
      </div>

      <div style={{ ...card, borderRadius: '0 0 8px 8px', maxHeight: 420, overflowY: 'auto' }}>
        {tab === 'events' && (
          events.length === 0
            ? <div style={{ color: '#374151', padding: '20px 0', textAlign: 'center' }}>No events yet — connect then submit a report or send a mock event</div>
            : events.map((ev, i) => <EventCard key={i} event={ev} />)
        )}
        {tab === 'raw log' && (
          rawLog.length === 0
            ? <div style={{ color: '#374151', padding: '20px 0', textAlign: 'center' }}>No log entries yet</div>
            : rawLog.map((entry, i) => (
              <div key={i} style={{ color: LOG_COLOR[entry.type] || '#e2e8f0', marginBottom: 3, fontFamily: 'monospace', fontSize: 12 }}>
                <span style={{ color: '#374151', marginRight: 8 }}>{entry.ts}</span>{entry.text}
              </div>
            ))
        )}
      </div>
    </div>
  );
}
