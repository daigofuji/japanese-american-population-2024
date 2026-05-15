import MapGL from 'react-map-gl/mapbox';

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;

export default function App() {
  return (
    <div className="w-full h-screen">
      <MapGL
        mapboxAccessToken={TOKEN}
        style={{ width: '100%', height: '100%' }}
        initialViewState={{
          longitude: -96,
          latitude: 38,
          zoom: 3.5,
        }}
        mapStyle="mapbox://styles/daigofuji/cmp6zmu4j004f01s818jy6thz"
      />
    </div>
  );
}
