'use client';

import { showNotification } from '@/lib/notifications/notifications';
import { ICatch } from '@/lib/types/catch';
import { CatchCreaetedResponse, ErrorResponse } from '@/lib/types/responses';
import { Button, rem } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertTriangle, IconCheck, IconExclamationMark, IconInfoSmall, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

export default function Page() {
  const [formData, setFormData] = useState<Omit<ICatch, 'id' | 'createdAt' | 'images'>>({
    species: '',
    date: new Date().toISOString().split('T')[0],
    length: undefined,
    weight: undefined,
    lure: null,
    location: {
      bodyOfWater: 'Nerkoonjärvi',
      spot: null,
      coordinates: null,
    },
    time: '',
    caughtBy: { name: '', userId: null },
  });

  const [inputValues, setInputValues] = useState({
    length: '',
    weight: '',
  });

  console.log('FormData on render:', formData);


  const [useGps, setUseGps] = useState(false); // State for GPS checkbox
  const [gpsError, setGpsError] = useState<string | null>(null); // State for GPS error message
  const [watchId, setWatchId] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'length' || name === 'weight') {
      // Update the temporary string state for number inputs
      setInputValues((prev) => ({
        ...prev,
        [name]: value,
      }));
      return;
    }

    setFormData((prevData) => {
      if (name === 'bodyOfWater' || name === 'spot' || name === 'coordinates') {
        // Handle nested location object
        return {
          ...prevData,
          location: {
            ...prevData.location,
            [name]: value,
          },
        };
      }

      if (name === 'caughtBy') {
        // Handle caughtBy object
        return {
          ...prevData,
          caughtBy: {
            ...prevData.caughtBy,
            name: value,
          },
        };
      }

      return {
        ...prevData,
        [name]: value,
      };
    });
  };

  const handleGpsToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (typeof navigator !== 'undefined') {
      setUseGps(e.target.checked);

      if (e.target.checked) {
        try {
          // Start watching the user's position
          const id = navigator.geolocation.watchPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              setFormData((prevData) => ({
                ...prevData,
                location: {
                  ...prevData.location,
                  coordinates: `${latitude}, ${longitude}`,
                },
              }));
              setGpsError(null); // Clear any previous errors
            },
            (error) => {
              setGpsError('Unable to retrieve GPS coordinates. Please enable location access.');
              console.error('GPS error:', error);
            },
            {
              enableHighAccuracy: true, // Use the most accurate location available
              maximumAge: 0, // Do not use cached locations
              timeout: 15000, // Timeout after 10 seconds if no location is retrieved
            }
          );
          setWatchId(id); // Save the watch ID to clear it later
        } catch (error) {
          setGpsError('Geolocation API is not supported.');
          console.error('Geolocation API error:', error);
        }
      } else {
        // Clear GPS coordinates and stop watching position
        setFormData((prevData) => ({
          ...prevData,
          location: {
            ...prevData.location,
            coordinates: '',
          },
        }));
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId); // Stop watching the user's position
          setWatchId(null);
        }
      }
    }
  };

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const parsedFormData = {
        ...formData,
        length: inputValues.length ? parseFloat(inputValues.length) : null,
        weight: inputValues.weight ? parseFloat(inputValues.weight) : null,
      };

      const response = await fetch('/api/catches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedFormData),
      });

      if (!response.ok) {
        const errorResponse: ErrorResponse = await response.json();
        console.error('Error:', errorResponse.message, errorResponse.details);
        showNotification('error', errorResponse.message, { withTitle: true });
      } else {
        const catchCreatedResponse: CatchCreaetedResponse = await response.json();
        console.log(catchCreatedResponse.message, catchCreatedResponse.data);
        showNotification('success', catchCreatedResponse.message, { withTitle: false });

        // Reset the form
        setFormData({
          species: '',
          date: new Date().toISOString().split('T')[0],
          length: undefined,
          weight: undefined,
          lure: null,
          location: { bodyOfWater: 'Nerkoonjärvi', spot: null, coordinates: null },
          time: '',
          caughtBy: { name: '', userId: null },
        });
        setInputValues({ length: '', weight: '' });
        setUseGps(false);
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
          setWatchId(null);
        }
      }
    } catch (error) {
      console.error('Unexpected error occured while creating new catch:', error);
      showNotification('error', 'An unexpected error occurred while creating a new catch. Please try again.', { withTitle: true });
    }
  };

  // TODO: disable if not logged in

  return (
    <div>
      <h1>New Catch</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" name="species" placeholder="Species" value={formData.species} onChange={handleChange} required />
        <input type="date" name="date" value={formData.date} onChange={handleChange} required />
        <input
          type="number"
          name="length"
          step={0.01}
          min={0}
          max={999}
          placeholder="Length (cm)"
          value={inputValues.length}
          onChange={handleChange}
          pattern="^\d*(\.\d*)?$" // Allow decimals
        />
        <input
          type="number"
          name="weight"
          step={0.01}
          min={0}
          max={999}
          placeholder="Weight (kg)"
          value={inputValues.weight}
          onChange={handleChange}
          pattern="^\d*(\.\d*)?$" // Allow decimals
        />
        <input type="text" name="lure" placeholder="Lure" value={formData.lure ?? ''} onChange={handleChange} />
        {/* <input type="text" name="bodyOfWater" placeholder="Body of Water" value={formData.location.bodyOfWater} onChange={handleChange} required /> */}
        <input type="text" name="spot" placeholder="Spot" value={formData.location.spot ?? ''} onChange={handleChange} />
        <label>
          <input type="checkbox" checked={useGps} onChange={handleGpsToggle} />
          Use GPS Coordinates
        </label>
        {gpsError && <p style={{ color: 'red' }}>{gpsError}</p>}
        {useGps ? (
          <input
            type="text"
            name="coordinates"
            placeholder="Coordinates"
            value={formData.location.coordinates ?? ''}
            onChange={handleChange}
          />
        ) : null}
        <input type="time" name="time" value={formData.time} onChange={handleChange} required />
        <input type="text" name="caughtBy" placeholder="Caught By" value={formData.caughtBy.name} onChange={handleChange} required />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
