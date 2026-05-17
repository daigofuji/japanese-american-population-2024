import mapboxgl from "mapbox-gl";
import { useCallback, useRef } from "react";
import MapGL, { NavigationControl, ScaleControl } from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";
import InfoPanel from "./InfoPanel";

const COUNTY_LAYER = "counties-japanese";
const TRACT_LAYER = "us-tracts-japanese-2024";
const COUNTY_SELECTED = "county-selected";
const TRACT_SELECTED = "tract-selected";
const NO_MATCH: mapboxgl.FilterSpecification = ["==", ["get", "geoid"], ""];
const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;

type FeatureProps = {
  geoid: string;
  name: string;
  state: string;
  japanese_pop: number;
  japanese_pct: number;
  total_pop: number;
};

function getStyleLayer(map: mapboxgl.Map, layerId: string) {
  return map.getStyle().layers.find((l) => l.id === layerId) as
    | { source: string; "source-layer": string }
    | undefined;
}

function safeSetFilter(map: mapboxgl.Map, layerId: string, filter: mapboxgl.FilterSpecification) {
  if (map.getLayer(layerId)) map.setFilter(layerId, filter);
}

function popupHTML({ name, state, japanese_pop, japanese_pct, total_pop }: FeatureProps) {
  return `
    <div class="text-xs">
      <p class="font-bold text-sm">${name}</p>
      <p class="text-gray-500">${state} | Pop.: ${Number(total_pop).toLocaleString()}</p>
      <p class="mt-0.5">${Number(japanese_pop).toLocaleString()} Japanese Americans</p>
      <p class="text-gray-400">${Number(japanese_pct).toFixed(2)}% of total population</p>
    </div>
  `;
}

export default function App() {
  const mapRef = useRef<MapRef>(null);

  const onLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    // Selection outline layers — zoom-matched to their parent layers
    const selectionLayers: [string, string, number?, number?][] = [
      [COUNTY_LAYER, COUNTY_SELECTED, undefined, 7],
      [TRACT_LAYER, TRACT_SELECTED, 7, undefined],
    ];
    for (const [parentId, selectedId, minzoom, maxzoom] of selectionLayers) {
      const base = getStyleLayer(map, parentId);
      if (!base) continue;
      map.addLayer({
        id: selectedId,
        type: "line",
        source: base.source,
        "source-layer": base["source-layer"],
        paint: { "line-color": "#000000", "line-width": 2.5 },
        filter: NO_MATCH,
        ...(minzoom !== undefined && { minzoom }),
        ...(maxzoom !== undefined && { maxzoom }),
      });
    }

    const popup = new mapboxgl.Popup({
      closeButton: true,
      anchor: "bottom",
      focusAfterOpen: false,
    });

    // Closing the popup (any reason) clears both selection borders
    popup.on("close", () => {
      safeSetFilter(map, COUNTY_SELECTED, NO_MATCH);
      safeSetFilter(map, TRACT_SELECTED, NO_MATCH);
    });

    // Shared click handler for both data layers
    for (const [layerId, selectedId, otherSelectedId] of [
      [COUNTY_LAYER, COUNTY_SELECTED, TRACT_SELECTED],
      [TRACT_LAYER, TRACT_SELECTED, COUNTY_SELECTED],
    ]) {
      map.on("click", layerId, (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const props = feature.properties as FeatureProps;
        safeSetFilter(map, selectedId, ["==", ["get", "geoid"], props.geoid]);
        safeSetFilter(map, otherSelectedId, NO_MATCH);
        popup.setLngLat(e.lngLat).setHTML(popupHTML(props)).addTo(map);
      });

      map.on("mouseenter", layerId, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", layerId, () => {
        map.getCanvas().style.cursor = "";
      });
    }

    // Click outside both layers → close popup (close handler clears selection)
    map.on("click", (e) => {
      const activeLayers = [COUNTY_LAYER, TRACT_LAYER].filter((id) => map.getLayer(id));
      const hits = activeLayers.length
        ? map.queryRenderedFeatures(e.point, { layers: activeLayers })
        : [];
      if (hits.length === 0) popup.remove();
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
