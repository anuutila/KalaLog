import { ICatch } from '../types/catch';

/**
 * Utility functions for analyzing catch data
 */
export const CatchUtils = {
  /**
   * Get unique fish species from catch records
   */
  getUniqueSpecies(catches: ICatch[]): string[] {
    return Array.from(
      new Set(catches.map((c) => c.species).filter((species) => species && species.trim().length > 0))
    ).sort();
  },

  /**
   * Get unique fishing spots
   */
  getUniqueSpots(catches: ICatch[]): string[] {
    return Array.from(
      new Set(
        catches
          .map((c) => c.location.spot)
          .filter((spot): spot is string => spot !== null && spot !== undefined && spot.trim().length > 0)
      )
    ).sort();
  },

  /**
   * Get unique fish lenghts
   */
  getUniqueLengths(catches: ICatch[]): number[] {
    return Array.from(
      new Set(
        catches
          .map((c) => c.length)
          .filter((length): length is number => length !== null && length !== undefined && length > 0)
      )
    ).sort((a, b) => a - b);
  },

  /**
   * Get unique fish weights
   */
  getUniqueWeights(catches: ICatch[]): number[] {
    return Array.from(
      new Set(
        catches
          .map((c) => c.weight)
          .filter((weight): weight is number => weight !== null && weight !== undefined && weight > 0)
      )
    ).sort((a, b) => a - b);
  },

  /**
   * Get unique bodies of water with their catch counts
   */
  getUniqueBodiesOfWater(catches: ICatch[]): Array<{
    bodyOfWater: string;
    catchCount: number;
  }> {
    const bodyOfWaterMap = new Map<string, number>();

    catches.forEach((c) => {
      const bodyOfWater = c.location.bodyOfWater;
      if (!bodyOfWater) {
        return;
      }

      bodyOfWaterMap.set(bodyOfWater, (bodyOfWaterMap.get(bodyOfWater) || 0) + 1);
    });

    return Array.from(bodyOfWaterMap.entries())
      .map(([bodyOfWater, catchCount]) => ({
        bodyOfWater,
        catchCount,
      }))
      .sort((a, b) => b.catchCount - a.catchCount);
  },

  /**
   * Get unique anglers with their catch counts
   */
  getUniqueAnglers(catches: ICatch[]): Array<{
    name: string;
    userId: string | null | undefined;
    catchCount: number;
  }> {
    const anglerMap = new Map<
      string,
      {
        userId: string | null | undefined;
        catchCount: number;
      }
    >();

    catches.forEach((c) => {
      const name = c.caughtBy.name;
      if (!name) {
        return;
      }

      const existing = anglerMap.get(name) || {
        userId: c.caughtBy.userId,
        catchCount: 0,
      };

      existing.catchCount++;
      anglerMap.set(name, existing);
    });

    return Array.from(anglerMap.entries())
      .map(([name, data]) => ({
        name,
        userId: data.userId,
        catchCount: data.catchCount,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  /**
   * Get unique lures with their catch counts
   */
  getUniqueLures(catches: ICatch[]): Array<{
    lure: string;
    catchCount: number;
  }> {
    const lureMap = new Map<string, number>();

    catches.forEach((c) => {
      const lure = c.lure;
      if (!lure) {
        return;
      }

      lureMap.set(lure, (lureMap.get(lure) || 0) + 1);
    });

    return Array.from(lureMap.entries())
      .map(([lure, catchCount]) => ({
        lure,
        catchCount,
      }))
      .sort((a, b) => b.catchCount - a.catchCount);
  },

  /**
   * Get unique years with their catch counts
   */
  getUniqueYears(catches: ICatch[]): Array<{
    year: string;
    catchCount: number;
  }> {
    const yearMap = new Map<string, number>();

    catches.forEach((c) => {
      const year = c.date.split('-')[0];
      yearMap.set(year, (yearMap.get(year) || 0) + 1);
    });

    return Array.from(yearMap.entries())
      .map(([year, catchCount]) => ({
        year,
        catchCount,
      }))
      .sort((a, b) => b.year.localeCompare(a.year));
  },

  /**
   * Get unique years with their catch counts, but only for a specific body of water
   */
  getUniqueYearsForBodyOfWater(
    catches: ICatch[],
    bodyOfWater: string
  ): Array<{
    year: string;
    catchCount: number;
  }> {
    const yearMap = new Map<string, number>();

    catches
      .filter((c) => c.location.bodyOfWater === bodyOfWater)
      .forEach((c) => {
        const year = c.date.split('-')[0];
        yearMap.set(year, (yearMap.get(year) || 0) + 1);
      });

    return Array.from(yearMap.entries())
      .map(([year, catchCount]) => ({
        year,
        catchCount,
      }))
      .sort((a, b) => b.year.localeCompare(a.year));
  },

  /**
   * Get the total amount of a specific species
   */
  getSpeciesTotal(catches: ICatch[], species: string): number {
    return catches.filter((c) => c.species === species)?.length || 0;
  },

  /**
   * Get the length of the longest daily fishing streak
   */
  getLongestFishingStreak(catches: ICatch[]): number {
    if (!catches.length) {
      return 0;
    }

    // Extract unique dates and sort them.
    const uniqueDates = Array.from(new Set(catches.map((c) => c.date))).sort();

    let longestStreak = 0;
    let currentStreak = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
      // Convert date strings to Date objects.
      const prevDate = new Date(uniqueDates[i - 1]);
      const currDate = new Date(uniqueDates[i]);

      // Calculate the difference in days.
      const diffInDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

      if (diffInDays === 1) {
        currentStreak++;
      } else {
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreak = 1;
      }
    }

    longestStreak = Math.max(longestStreak, currentStreak);
    return longestStreak;
  },

  /**
   * Get the amount of unique seasons in the catch records
   */
  getUniqueSeasons(catches: ICatch[]): number {
    const seasons = Array.from(
      new Set(
        catches.map((c) => {
          const month = parseInt(c.date.split('-')[1], 10);
          if (month >= 3 && month <= 5) {
            return 'spring';
          }
          if (month >= 6 && month <= 8) {
            return 'summer';
          }
          if (month >= 9 && month <= 11) {
            return 'autumn';
          }
          return 'winter';
        })
      )
    );

    return seasons.length || 0;
  },

  /**
   * Calculates the maximum number of catches occurring within any given timeframe (in minutes).
   * If requiredCatchCount is provided and a window meets or exceeds that count,
   * the function immediately returns that count.
   *
   * Assumes each catch has a date string ("YYYY-MM-DD") and a time string ("HH:MM").
   */
  resolveTimeframeCatches(catches: ICatch[], timeframe: number, requiredCatchCount?: number): number {
    if (!catches || catches.length === 0) {
      return 0;
    }

    // Convert catches into Date objects and sort them chronologically.
    const dateTimeCatches = catches
      .map((c) => new Date(`${c.date}T${c.time}:00`))
      .sort((a, b) => a.getTime() - b.getTime());

    let maxCount = 0;

    for (let i = 0; i < dateTimeCatches.length; i++) {
      let count = 1;
      const windowStart = dateTimeCatches[i].getTime();
      for (let j = i + 1; j < dateTimeCatches.length; j++) {
        const diffInMinutes = (dateTimeCatches[j].getTime() - windowStart) / (1000 * 60);
        if (diffInMinutes <= timeframe) {
          count++;
          // If a required catch count is provided and the condition is met, return immediately.
          if (requiredCatchCount && count >= requiredCatchCount) {
            return count;
          }
        } else {
          break;
        }
      }
      if (count > maxCount) {
        maxCount = count;
      }
    }

    return maxCount;
  },

  /**
   * Given an array of catches and a minimum distance (in meters),
   * returns the maximum count of unique spots within a single body of water.
   *
   * Only catches within the same body of water (catch.location.bodyOfWater)
   * are grouped together, and unique spots are determined by their GPS
   * coordinates (catch.location.coordinates, formatted as "lat,lng").
   */
  getUniqueSpotsBasedOnDistanceAndBoW(catches: ICatch[], minDistance: number): number {
    // Group catches by body of water.
    const groups: Record<string, ICatch[]> = {};
    catches.forEach((catchItem) => {
      const bodyOfWater = catchItem.location?.bodyOfWater;
      if (!bodyOfWater) {
        return;
      }
      if (!groups[bodyOfWater]) {
        groups[bodyOfWater] = [];
      }
      groups[bodyOfWater].push(catchItem);
    });

    // For each group, calculate the count of unique spots.
    const getUniqueCount = (groupCatches: ICatch[]): number => {
      const uniqueSpots: { lat: number; lng: number }[] = [];
      groupCatches.forEach((catchItem) => {
        const coordStr = catchItem.location?.coordinates;
        if (!coordStr) {
          return;
        }
        const [latStr, lngStr] = coordStr.split(',');
        const lat = parseFloat(latStr);
        const lng = parseFloat(lngStr);
        if (isNaN(lat) || isNaN(lng)) {
          return;
        }

        const isUnique = uniqueSpots.every(
          (spot) => getDistanceBetweenPoints(lat, lng, spot.lat, spot.lng) >= minDistance
        );
        if (isUnique) {
          uniqueSpots.push({ lat, lng });
        }
      });
      return uniqueSpots.length;
    };

    // Determine the maximum unique spots count across all groups.
    let maxCount = 0;
    Object.values(groups).forEach((groupCatches) => {
      const count = getUniqueCount(groupCatches);
      if (count > maxCount) {
        maxCount = count;
      }
    });

    return maxCount;
  },

  /**
   * Get statistics for each species
   */
  getSpeciesStats(catches: ICatch[]): Array<{
    species: string;
    catchCount: number;
    avgWeight: number | null;
    avgLength: number | null;
    maxWeight: number | null;
    maxLength: number | null;
  }> {
    const speciesMap = new Map<
      string,
      {
        weights: number[];
        lengths: number[];
        count: number;
      }
    >();

    catches.forEach((c) => {
      const species = c.species;
      if (!species) {
        return;
      }

      const existing = speciesMap.get(species) || {
        weights: [],
        lengths: [],
        count: 0,
      };

      if (c.weight) {
        existing.weights.push(c.weight);
      }
      if (c.length) {
        existing.lengths.push(c.length);
      }
      existing.count++;

      speciesMap.set(species, existing);
    });

    return Array.from(speciesMap.entries())
      .map(([species, data]) => ({
        species,
        catchCount: data.count,
        avgWeight: data.weights.length ? data.weights.reduce((a, b) => a + b, 0) / data.weights.length : null,
        avgLength: data.lengths.length ? data.lengths.reduce((a, b) => a + b, 0) / data.lengths.length : null,
        maxWeight: data.weights.length ? Math.max(...data.weights) : null,
        maxLength: data.lengths.length ? Math.max(...data.lengths) : null,
      }))
      .sort((a, b) => b.catchCount - a.catchCount);
  },
};

export function createCatchAndImagesFormData(
  catchData: Omit<ICatch, 'id' | 'createdAt' | 'catchNumber'>,
  addedImages: File[],
  deletedImages: (string | undefined)[] = []
): FormData {
  const catchAndImageData = new FormData();

  // Append form data (parsedFormData fields)
  Object.entries(catchData).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (key === 'location') {
        catchAndImageData.append(key, JSON.stringify(value));
      } else if (key === 'caughtBy') {
        catchAndImageData.append(key, JSON.stringify(value));
      } else if (key === 'images') {
        catchAndImageData.append(key, JSON.stringify(value));
      } else {
        catchAndImageData.append(key, value as string);
      }
    }
  });

  // Append added and deleted images
  addedImages.forEach((file) => {
    catchAndImageData.append(`addedImages`, file);
  });
  deletedImages.forEach((publicId) => {
    catchAndImageData.append(`deletedImages`, publicId || '');
  });

  return catchAndImageData;
}

/**
 * Calculates the distance (in meters) between two coordinates using the Haversine formula.
 */
function getDistanceBetweenPoints(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const toRad = (x: number) => (x * Math.PI) / 180;
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaPhi = toRad(lat2 - lat1);
  const deltaLambda = toRad(lng2 - lng1);
  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
