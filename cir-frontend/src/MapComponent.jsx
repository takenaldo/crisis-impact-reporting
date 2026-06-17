import CirMap from './map/CirMap';

const DEFAULT_CENTER = [9.032, 38.7486]; // Addis Ababa [lat, lng]

export default function MapComponent({ form }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div
        style={{
          position: 'relative',
          height: 320,
          borderRadius: 10,
          overflow: 'hidden',
          border: '1px solid #d1d5db',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}
      >
        <CirMap
          center={DEFAULT_CENTER}
          zoom={13}
          height="100%"
          locationPicker
          form={form}
          autoLocate
        />
      </div>

      <span style={{ fontSize: 12, color: '#9ca3af' }}>
        Tap the map to mark the incident location, or use the locate button.
      </span>
    </div>
  );
}
