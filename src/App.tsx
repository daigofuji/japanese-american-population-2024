import mapboxgl from "mapbox-gl";
import { useCallback, useRef } from "react";
import MapGL, { NavigationControl, ScaleControl } from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";
import InfoPanel from "./InfoPanel";

const LAYER = "counties-japanese";
const SELECTED_LAYER = "county-selected";
const NO_MATCH_FILTER: mapboxgl.FilterSpecification = ["==", ["id"], -1];
const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;

export default function App() {
  const mapRef = useRef<MapRef>(null);

  const onLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const styleLayers = map.getStyle().layers;
    const baseLayerDef = styleLayers.find((l) => l.id === LAYER) as
      | { source: string; "source-layer": string }
      | undefined;
    if (baseLayerDef) {
      map.addLayer({
        id: SELECTED_LAYER,
        type: "line",
        source: baseLayerDef.source,
        "source-layer": baseLayerDef["source-layer"],
        paint: { "line-color": "#000000", "line-width": 2.5 },
        filter: NO_MATCH_FILTER,
      });
    }

    const popup = new mapboxgl.Popup({
      closeButton: true,
      anchor: "bottom",
      focusAfterOpen: false,
    });

    map.on("click", LAYER, (e) => {
      const feature = e.features?.[0];
      if (!feature) return;
      const { name, state, japanese_pop, japanese_pct, total_pop } =
        feature.properties as {
          name: string;
          state: string;
          japanese_pop: number;
          japanese_pct: number;
          total_pop: number;
        };
      map.setFilter(SELECTED_LAYER, [
        "all",
        ["==", ["get", "name"], name],
        ["==", ["get", "state"], state],
      ]);
      popup
        .setLngLat(e.lngLat)
        .setHTML(`
          <div class="text-xs">

            <p class="font-bold text-sm">${name}</p>
            <p class="text-gray-500">${state} | Pop.: ${Number(total_pop).toLocaleString()}</p>
            <p class="mt-0.5">${Number(japanese_pop).toLocaleString()} Japanese Americans</p>
            <p class="text-gray-400">${Number(japanese_pct).toFixed(2)}% of total population</p>
          </div>
        `)
        .addTo(map);
    });

    map.on("click", (e) => {
      const hits = map.queryRenderedFeatures(e.point, { layers: [LAYER] });
      if (hits.length === 0) map.setFilter(SELECTED_LAYER, NO_MATCH_FILTER);
    });

    map.on("mouseenter", LAYER, () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", LAYER, () => {
      map.getCanvas().style.cursor = "";
    });
  }, []);

  return (
    <div className="w-full h-screen relative">
      <MapGL
        ref={mapRef}
        mapboxAccessToken={TOKEN}
        style={{ width: "100%", height: "100%" }}
        initialViewState={{
          longitude: -96,
          latitude: 38,
          zoom: 4.3,
        }}
        minZoom={3.5}
        maxZoom={11}
        mapStyle="mapbox://styles/daigofuji/cmp6zmu4j004f01s818jy6thz"
        onLoad={onLoad}
      >
        <NavigationControl position="top-right" />
        <ScaleControl unit="imperial" position="bottom-right" />
      </MapGL>
      <InfoPanel />
    </div>
  );
}
