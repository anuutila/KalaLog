'use client';

import React, { useState } from 'react';
import Map, { NavigationControl, GeolocateControl } from 'react-map-gl/mapbox';
import './CatchMap.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface CatchMapProps {
  initialLatitude?: number;
  initialLongitude?: number;
  initialZoom?: number;
}

export default function CatchMap({
  initialLatitude = 62.1467,
  initialLongitude = 23.215,
  initialZoom = 11
}: CatchMapProps) {

  const [viewState, setViewState] = useState({
    longitude: initialLongitude,
    latitude: initialLatitude,
    zoom: initialZoom,
    pitch: 0,
    bearing: 0
  });

  if (!MAPBOX_TOKEN) {
    console.error("Mapbox token is not configured!");
    return <div>Error: Mapbox token missing. Please configure NEXT_PUBLIC_MAPBOX_TOKEN.</div>;
  }

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapboxAccessToken={MAPBOX_TOKEN}
        // mapStyle="mapbox://styles/mapbox/outdoors-v12"
        // mapStyle="mapbox://styles/mapbox/dark-v11"
        mapStyle="mapbox://styles/anuutila/cma3129fq000001skaoqnfrg1"
        style={{ width: '100%', height: '100%' }}
        antialias={true}
        projection={"globe"}
      >
        <NavigationControl position="top-right" />
        <GeolocateControl position="top-right" />
      </Map>
    </div>
  );
}