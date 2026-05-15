import { useCallback, useRef } from 'react';
import MapGL, { NavigationControl, ScaleControl } from 'react-map-gl/mapbox';
import type { MapRef } from 'react-map-gl/mapbox';
import mapboxgl from 'mapbox-gl';

const LAYER = 'counties-japanese';
const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;

export default function App() {
  const mapRef = useRef<MapRef>(null);

  const onLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const popup = new mapboxgl.Popup({ closeButton: true, anchor: 'bottom', focusAfterOpen: false });

    map.on('click', LAYER, (e) => {
      const feature = e.features?.[0];
      if (!feature) return;
      const { name, state, japanese_pop, japanese_pct, total_pop } = feature.properties as {
        name: string; state: string; japanese_pop: number; japanese_pct: number; total_pop: number;
      };
      popup
        .setLngLat(e.lngLat)
        .setHTML(`
          <div class="text-xs">
            <p class="text-gray-500">${state} | Pop.: ${Number(total_pop).toLocaleString()}</p>
            <p class="font-bold text-sm">${name}</p>
            <p class="mt-0.5">${Number(japanese_pop).toLocaleString()} Japanese Americans</p>
            <p class="text-gray-400">${Number(japanese_pct).toFixed(2)}% of total population</p>
          </div>
        `)
        .addTo(map);
    });

    map.on('mouseenter', LAYER, () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', LAYER, () => { map.getCanvas().style.cursor = ''; });
  }, []);

  return (
    <div className="w-full h-screen">
      <MapGL
        ref={mapRef}
        mapboxAccessToken={TOKEN}
        style={{ width: '100%', height: '100%' }}
        initialViewState={{
          longitude: -96,
          latitude: 38,
          zoom: 4.3,
        }}
        minZoom={2}
        maxZoom={12}
        mapStyle="mapbox://styles/daigofuji/cmp6zmu4j004f01s818jy6thz"
        onLoad={onLoad}
      >
        <NavigationControl position="top-right" />
        <ScaleControl unit="imperial" position="bottom-right" />
      </MapGL>
    </div>
  );
}
