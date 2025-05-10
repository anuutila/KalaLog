'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Map, { NavigationControl, GeolocateControl, MapRef, Popup, Source, Layer, FullscreenControl } from 'react-map-gl/mapbox';
import './CatchMap.css';
import { useGlobalState } from '@/context/GlobalState';
import { Box, Group, Stack, Text, Title } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { FishColorsMantine6RGB, FixedFishColors } from '@/lib/constants/constants';
import { CircleLayerSpecification, GeoJSONSource, MapMouseEvent, SymbolLayerSpecification } from 'mapbox-gl';
import Link from 'next/link';
import { IconChevronRight, IconRuler2, IconUser, IconWeight } from '@tabler/icons-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ICatch } from '@/lib/types/catch';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const SOURCE_ID = 'catches-source';

const unclusteredPointLayerStyle: CircleLayerSpecification = {
  id: 'unclustered-point-layer',
  type: 'circle',
  source: SOURCE_ID,
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': ['coalesce', ['get', 'markerColor'], '#cccccc'],
    'circle-radius': 6,
    'circle-stroke-width': 1,
    'circle-stroke-color': '#ffffff',
  }
};

const clusterCircleLayerStyle: CircleLayerSpecification = {
  id: 'cluster-circle-layer',
  type: 'circle',
  source: SOURCE_ID,
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': '#141414',
    'circle-radius': [
      'step',
      ['get', 'point_count'],
      15, // 15px radius for < 10 points
      10, 20, // 20px radius for 10-49 points
      50, 25  // 25px radius for >= 50 points
    ],
    'circle-stroke-width': [
      'step',
      ['get', 'point_count'],
      1.5, // 1px stroke for < 10 points
      10, 2, // 2px stroke for 10-49 points
      50, 3   // 3px stroke for >= 50 points
    ],
    'circle-stroke-color': '#228be6'
  }
};

const clusterCountLayerStyle: SymbolLayerSpecification = {
  id: 'cluster-count-layer',
  type: 'symbol',
  source: SOURCE_ID,
  filter: ['has', 'point_count'],
  layout: {
    'text-field': '{point_count_abbreviated}',
    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    'text-size': [
      'step',
      ['get', 'point_count'],
      16, // 16px for < 10 points
      10, 18, // 18px for 10-49 points
      50, 20   // 20px for >= 50 points
    ],
    'text-allow-overlap': true
  },
  paint: {
    'text-color': '#ffffff',
  }
};

interface CatchWithCoords {
  id?: string;
  catchNumber: number;
  species: string;
  length?: number | null;
  weight?: number | null;
  angler: string;
  latitude: number;
  longitude: number;
}

interface CatchMapProps {
  mapCatches?: ICatch[];
  initialLatitude?: number;
  initialLongitude?: number;
  initialZoom?: number;
  updateUrl?: boolean;
}

export default function CatchMap({
  mapCatches = [],
  initialLatitude = 62.15,
  initialLongitude = 23.2129,
  initialZoom = 10.75,
  updateUrl = true,
}: CatchMapProps) {
  const t = useTranslations();
  const { catches, displayNameMap } = useGlobalState();
  const searchParams = useSearchParams();
  const catchNumParam = searchParams.get('catchNumber');
  const router = useRouter();

  const read = (key: string, fallback: number) => {
    const val = searchParams.get(key);
    return val ? parseFloat(val) : fallback;
  }

  const [viewState, setViewState] = useState({
    longitude: read('lng', initialLongitude),
    latitude: read('lat', initialLatitude),
    zoom: read('zoom', initialZoom),
    pitch: read('pitch', 0),
    bearing: read('bearing', 0),
  })

  const [selectedCatch, setSelectedCatch] = useState<CatchWithCoords | null>(null);
  const mapRef = useRef<MapRef | null>(null);

  const catchesWithCoords: CatchWithCoords[] = useMemo(() => {
    const catchItems = mapCatches.length ? mapCatches : catches;
    return catchItems.flatMap((c): CatchWithCoords[] => {
      const id = c.id;
      if (!id) {
        console.warn("Skipping catch: Missing ID", c);
        return [];
      }

      const coordsString = c.location?.coordinates;
      if (typeof coordsString !== 'string' || coordsString.trim() === '') {
        return [];
      }

      const parts = coordsString.split(',');
      if (parts.length !== 2) {
        console.warn(`Skipping catch ${id}: Invalid coordinate format "${coordsString}"`);
        return [];
      }

      const latStr = parts[0].trim();
      const lonStr = parts[1].trim();
      const latitude = parseFloat(latStr);
      const longitude = parseFloat(lonStr);

      if (isNaN(latitude) || isNaN(longitude)) {
        console.warn(`Skipping catch ${id}: Non-numeric coordinates "${coordsString}"`);
        return [];
      }

      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        console.warn(`Skipping catch ${id}: Coordinates out of range lat=${latitude}, lon=${longitude}`);
        return [];
      }

      const angler = (c.caughtBy.userId && displayNameMap[c.caughtBy.userId]) || c.caughtBy.name || 'Unknown Angler';

      const catchItem: CatchWithCoords = {
        id: id,
        catchNumber: c.catchNumber,
        species: c.species,
        length: c.length,
        weight: c.weight,
        angler: angler,
        latitude: latitude,
        longitude: longitude,
      };

      return [catchItem];

    });
  }, [catches, displayNameMap, mapCatches]);

  // const getRandomColor = () => {
  //   const color = AdditionalFishColors[Math.floor(Math.random() * Object.keys(AdditionalFishColors).length)];
  //   const rgbColor = AdditionalFishColorsMantine3RGB[color as keyof typeof AdditionalFishColorsMantine3RGB];
  //   return rgbColor;
  // };

  const geojsonData = useMemo(() => {
    return {
      type: 'FeatureCollection' as const,
      features: catchesWithCoords.map(catchItem => {
        const speciesKey = catchItem.species.toLowerCase().trim();
        const fixedColor = FixedFishColors[speciesKey as keyof typeof FixedFishColors];
        const finalRGBColor = `rgb(${FishColorsMantine6RGB[fixedColor as keyof typeof FishColorsMantine6RGB] || '100, 100, 100'})`;

        const feature = {
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [catchItem.longitude, catchItem.latitude]
          },
          properties: {
            ...catchItem,
            markerColor: finalRGBColor
          }
        };
        return feature;
      })
    };
  }, [catchesWithCoords]);

  useEffect(() => {
    if (catchNumParam && catchesWithCoords.length) {
      const num = parseInt(catchNumParam, 10);
      const found = catchesWithCoords.find(c => c.catchNumber === num) || null;
      setSelectedCatch(found);
    }
    else {
      setSelectedCatch(null);
    }
  }, [catchNumParam, catchesWithCoords]);

  const handleMapClick = useCallback((event: MapMouseEvent) => {
    const features = event.features;
    if (!features || features.length === 0) {
      handleOnClosePopup(); // Clicked on base map
      return;
    }

    const feature = features[0];
    const isCluster = feature.properties?.point_count > 0;
    const clickedLayerId = feature.layer?.id;

    // Check if a cluster circle was clicked
    if (isCluster && clickedLayerId === clusterCircleLayerStyle.id) {
      handleOnClosePopup();

      const map = mapRef.current?.getMap();
      const source = map?.getSource(SOURCE_ID) as GeoJSONSource | undefined;

      if (!source || !feature.properties?.cluster_id || feature.geometry.type !== 'Point') return;

      const clusterId = feature.properties.cluster_id;

      // Get the zoom level needed to expand this cluster
      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err || !zoom) {
          console.error("Error getting cluster expansion zoom:", err);
          return;
        }
        // Zoom the map to the cluster location and the required zoom level
        if (map) {
          map.easeTo({
            // @ts-ignore
            center: feature.geometry.coordinates as [number, number],
            zoom: zoom + 1,
            duration: 800
          });
        }
      });
    }
    // Check if an individual (unclustered) point was clicked
    else if (!isCluster && clickedLayerId === unclusteredPointLayerStyle.id) {
      if (feature.properties && feature.geometry.type === 'Point') {
        const catchData = feature.properties as CatchWithCoords;

        const url = new URL(window.location.href);
        if (url.searchParams.get('catchNumber') === String(catchData.catchNumber)) {
          return;
        }
        url.searchParams.set('catchNumber', String(catchData.catchNumber));
        router.replace(url.toString());
      } else {
        handleOnClosePopup();
      }
    }
    else {
      handleOnClosePopup();
    }

  }, [setSelectedCatch]);

  const handleMoveEnd = () => {
    if (!viewState || !updateUrl) {
      return;
    }
    const { longitude, latitude, zoom, pitch, bearing } = viewState
    const url = new URL(window.location.href);
    url.pathname = '/statistics';
    url.searchParams.set('lng', longitude.toFixed(8));
    url.searchParams.set('lat', latitude.toFixed(8));
    url.searchParams.set('zoom', zoom.toFixed(2));
    url.searchParams.set('pitch', pitch.toFixed(2));
    url.searchParams.set('bearing', bearing.toFixed(2));
    if (catchNumParam) {
      url.searchParams.set('catchNumber', catchNumParam);
    }
    url.hash = 'map';
    router.replace(url.toString());
  }

  const handleOnClosePopup = () => {
    const url = new URL(window.location.href);
    if (url.pathname !== '/statistics') {
      return;
    }
    url.searchParams.delete('catchNumber');
    router.replace(url.toString());
    setSelectedCatch(null);
  }

  if (!MAPBOX_TOKEN) {
    console.error("Mapbox token is not configured!");
    return <div>Error: Mapbox token missing. Please configure NEXT_PUBLIC_MAPBOX_TOKEN.</div>;
  }

  const href = useMemo(() => {
    const url = new URL(window.location.origin);
    url.pathname = '/catches';
    url.searchParams.set('catchNumber', String(selectedCatch?.catchNumber || ''));
    url.hash = '';
    return url;
  }, [selectedCatch])

  return (
    <Box h={'100%'} w={'100%'} pos={'relative'}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        onMoveEnd={handleMoveEnd}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/anuutila/cma3129fq000001skaoqnfrg1"
        style={{ width: '100%', height: '100%' }}
        antialias={true}
        projection={"globe"}
        onClick={handleMapClick}
        interactiveLayerIds={[clusterCircleLayerStyle.id, unclusteredPointLayerStyle.id]}
        onMouseEnter={(e) => {
          const feature = e.features?.[0];
          if (feature && (feature.layer?.id === unclusteredPointLayerStyle.id || feature.layer?.id === clusterCircleLayerStyle.id)) {
            mapRef.current?.getCanvas().style.setProperty('cursor', 'pointer');
          }
        }}
        onMouseLeave={() => { mapRef.current?.getCanvas().style.setProperty('cursor', ''); }}
      >
        <NavigationControl position="top-right" />
        <GeolocateControl position="top-right" />
        <FullscreenControl position="bottom-right" />

        {geojsonData && geojsonData.features.length > 0 && (
          <Source
            id={SOURCE_ID}
            type="geojson"
            data={geojsonData}
            cluster={true}
            clusterMaxZoom={14}
            clusterRadius={50}
          >
            <Layer {...clusterCircleLayerStyle} />
            <Layer {...clusterCountLayerStyle} />
            <Layer {...unclusteredPointLayerStyle} />
          </Source>
        )}

        {selectedCatch && (
          <Popup
            latitude={selectedCatch.latitude!}
            longitude={selectedCatch.longitude!}
            onClose={handleOnClosePopup}
            offset={10}
            maxWidth="300px"
            className="myPopup"
          >
            <Box>
              <Stack gap={4} c={'var(--mantine-color-dark-7)'}>
                <Group>
                  <Title order={4} mb={6}>
                    {t.has(`Fish.${selectedCatch.species}`) ? t(`Fish.${selectedCatch.species}`) : selectedCatch.species} #{selectedCatch.catchNumber}
                  </Title>
                </Group>
                <Group gap={6} wrap={'nowrap'}>
                  <Group gap={4} flex={1.5} align={'center'} wrap={'nowrap'}>
                    <IconRuler2 size={20} />
                    <Text size="sm" fw={500}>{t('Common.Length')}:</Text>
                  </Group>
                  <Text size="sm" fw={500} flex={1}>{selectedCatch.length ? `${selectedCatch.length} cm` : '-'}</Text>
                </Group >
                <Group gap={6} wrap={'nowrap'}>
                  <Group gap={4} flex={1.5} align={'center'} wrap={'nowrap'}>
                    <IconWeight size={20} />
                    <Text size="sm" fw={500}>{t('Common.Weight')}:</Text>
                  </Group>
                  <Text size="sm" fw={500} flex={1}>{selectedCatch.weight ? `${selectedCatch.weight} kg` : '-'}</Text>
                </Group>
                <Group gap={6} wrap={'nowrap'}>
                  <Group gap={4} flex={1.5} align={'center'} wrap={'nowrap'}>
                    <IconUser size={20} />
                    <Text size="sm" fw={500}>{t('Common.CaughtBy')}:</Text>
                  </Group>
                  <Text size="sm" fw={500} flex={1}>{selectedCatch.angler}</Text>
                </Group>
                <Group justify={'center'} align={'center'} gap={0} mt={6}>
                  <Link
                    href={href}
                    passHref
                    prefetch={!!selectedCatch}
                    style={{
                      color: 'inherit',
                      display: 'inline-block'
                    }}
                  >
                    <Group gap={2}>
                      <Text fz={12}>{t('StatisticsPage.ShowDetails')}</Text>
                      <IconChevronRight size={14} stroke={2.5} />
                    </Group>
                  </Link>
                </Group>
              </Stack>
            </Box>
          </Popup>
        )}
      </Map>
    </Box>
  );
}