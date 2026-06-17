"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "@maplibre/maplibre-gl-leaflet";
import {
  SKYTRACK_BASEMAP_ATTRIBUTION,
  SKYTRACK_BASEMAP_STYLE,
} from "@/lib/map-basemap";

const VIETNAM_ARCHIPELAGOS_SOURCE = "vietnam-archipelagos";
const VIETNAM_ARCHIPELAGOS_POINTS = "vietnam-archipelagos-points";
const VIETNAM_ARCHIPELAGOS_LABELS = "vietnam-archipelagos-labels";
const ARCHIPELAGOS_MIN_ZOOM = 4;
const ARCHIPELAGOS_MAX_ZOOM = 6;
const BASEMAP_DIM_PANE = "skytrack-basemap-dim";

class BasemapDimLayer extends L.GridLayer {
  createTile() {
    const tile = document.createElement("div");
    tile.style.background = "rgba(2, 8, 23, 0.46)";
    return tile;
  }
}

function usesNameField(value: unknown) {
  return typeof value === "string"
    ? value.includes("name")
    : JSON.stringify(value).includes('"name');
}

function addVietnameseArchipelagos(
  vectorMap: ReturnType<L.MaplibreGL["getMaplibreMap"]>,
) {
  if (vectorMap.getSource(VIETNAM_ARCHIPELAGOS_SOURCE)) return;

  vectorMap.addSource(VIETNAM_ARCHIPELAGOS_SOURCE, {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { name: "Quần đảo Hoàng Sa" },
          geometry: { type: "Point", coordinates: [112.25, 16.5] },
        },
        {
          type: "Feature",
          properties: { name: "Quần đảo Trường Sa" },
          geometry: { type: "Point", coordinates: [114.25, 10] },
        },
      ],
    },
  });

  vectorMap.addLayer({
    id: VIETNAM_ARCHIPELAGOS_POINTS,
    type: "circle",
    source: VIETNAM_ARCHIPELAGOS_SOURCE,
    minzoom: ARCHIPELAGOS_MIN_ZOOM,
    maxzoom: ARCHIPELAGOS_MAX_ZOOM,
    paint: {
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 4, 3, 8, 4.5],
      "circle-color": "#22d3ee",
      "circle-stroke-color": "#ecfeff",
      "circle-stroke-width": 1.25,
    },
  });

  vectorMap.addLayer({
    id: VIETNAM_ARCHIPELAGOS_LABELS,
    type: "symbol",
    source: VIETNAM_ARCHIPELAGOS_SOURCE,
    minzoom: ARCHIPELAGOS_MIN_ZOOM,
    maxzoom: ARCHIPELAGOS_MAX_ZOOM,
    layout: {
      "text-field": ["get", "name"],
      "text-font": ["Noto Sans Regular"],
      "text-size": ["interpolate", ["linear"], ["zoom"], 4, 13, 8, 16],
      "text-offset": [0, 1.15],
      "text-anchor": "top",
      "text-letter-spacing": 0.04,
      "text-max-width": 20,
      "text-padding": 4,
      "text-allow-overlap": true,
      "text-ignore-placement": true,
    },
    paint: {
      "text-color": "#ffffff",
      "text-halo-color": "#020817",
      "text-halo-width": 2,
      "text-halo-blur": 0.5,
    },
  });
}

export default function VietnameseVectorBasemap() {
  const map = useMap();

  useEffect(() => {
    const layer = L.maplibreGL({
      style: SKYTRACK_BASEMAP_STYLE,
      interactive: false,
      attributionControl: false,
      renderWorldCopies: true,
    });
    layer.addTo(map);

    const dimPane = map.getPane(BASEMAP_DIM_PANE) ?? map.createPane(BASEMAP_DIM_PANE);
    dimPane.style.zIndex = "250";
    dimPane.style.pointerEvents = "none";

    const dimLayer = new BasemapDimLayer({
      pane: BASEMAP_DIM_PANE,
      attribution: "",
    });
    dimLayer.addTo(map);

    const vectorMap = layer.getMaplibreMap();
    const localizeLabels = () => {
      const style = vectorMap.getStyle();
      for (const styleLayer of style.layers ?? []) {
        if (styleLayer.type !== "symbol") continue;
        const textField = styleLayer.layout?.["text-field"];
        if (!textField || !usesNameField(textField)) continue;

        vectorMap.setLayoutProperty(styleLayer.id, "text-field", [
          "coalesce",
          ["get", "name:vi"],
          ["get", "name_vi"],
          ["get", "name:latin"],
          ["get", "name_en"],
          ["get", "name"],
        ]);
      }

      addVietnameseArchipelagos(vectorMap);
    };

    vectorMap.once("load", localizeLabels);
    return () => {
      vectorMap.off("load", localizeLabels);
      map.removeLayer(dimLayer);
      map.removeLayer(layer);
    };
  }, [map]);

  return (
    <div className="pointer-events-none absolute bottom-1 left-1/2 z-[700] -translate-x-1/2 rounded bg-black/55 px-2 py-1 text-[8px] text-white/60 backdrop-blur-sm">
      {SKYTRACK_BASEMAP_ATTRIBUTION}
    </div>
  );
}
