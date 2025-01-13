import { ICatch } from "../types/catch";

/**
 * Utility functions for analyzing catch data
 */
export const CatchUtils = {

  /**
   * Get unique fish species from catch records
   */
  getUniqueSpecies(catches: ICatch[]): string[] {
    return Array.from(new Set(
      catches
        .map(c => c.species)
        .filter(species => species && species.trim().length > 0)
    )).sort();
  },

  /**
   * Get unique fishing spots
   */
  getUniqueSpots(catches: ICatch[]): string[] {
    return Array.from(new Set(
      catches
        .map(c => c.location.spot)
        .filter((spot): spot is string => 
          spot !== null && spot !== undefined && spot.trim().length > 0)
    )).sort();
  },

  /**
   * Get unique bodies of water
   */
  getUniqueBodiesOfWater(catches: ICatch[]): string[] {
    return Array.from(new Set(
      catches
        .map(c => c.location.bodyOfWater)
        .filter(body => body && body.trim().length > 0)
    )).sort();
  },

  /**
   * Get unique anglers with their catch counts
   */
  getUniqueAnglers(catches: ICatch[]): Array<{ 
    name: string; 
    userId: string | null | undefined;
    catchCount: number;
  }> {
    const anglerMap = new Map<string, {
      userId: string | null | undefined;
      catchCount: number;
    }>();

    catches.forEach(c => {
      const name = c.caughtBy.name;
      if (!name) return;

      const existing = anglerMap.get(name) || {
        userId: c.caughtBy.userId,
        catchCount: 0
      };
      
      existing.catchCount++;
      anglerMap.set(name, existing);
    });

    return Array.from(anglerMap.entries())
      .map(([name, data]) => ({
        name,
        userId: data.userId,
        catchCount: data.catchCount
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

    catches.forEach(c => {
      const lure = c.lure;
      if (!lure) return;

      lureMap.set(lure, (lureMap.get(lure) || 0) + 1);
    });

    return Array.from(lureMap.entries())
      .map(([lure, catchCount]) => ({
        lure,
        catchCount
      }))
      .sort((a, b) => b.catchCount - a.catchCount);
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
    const speciesMap = new Map<string, {
      weights: number[];
      lengths: number[];
      count: number;
    }>();

    catches.forEach(c => {
      const species = c.species;
      if (!species) return;

      const existing = speciesMap.get(species) || {
        weights: [],
        lengths: [],
        count: 0
      };

      if (c.weight) existing.weights.push(c.weight);
      if (c.length) existing.lengths.push(c.length);
      existing.count++;

      speciesMap.set(species, existing);
    });

    return Array.from(speciesMap.entries())
      .map(([species, data]) => ({
        species,
        catchCount: data.count,
        avgWeight: data.weights.length ? 
          data.weights.reduce((a, b) => a + b, 0) / data.weights.length : null,
        avgLength: data.lengths.length ? 
          data.lengths.reduce((a, b) => a + b, 0) / data.lengths.length : null,
        maxWeight: data.weights.length ? 
          Math.max(...data.weights) : null,
        maxLength: data.lengths.length ? 
          Math.max(...data.lengths) : null
      }))
      .sort((a, b) => b.catchCount - a.catchCount);
  }
};

export function createCatchAndImagesFormData(catchData: Omit<ICatch, 'id' | 'createdAt' | 'catchNumber'>, addedImages: File[], deletedImages: string[] = []): FormData {
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
  addedImages.forEach((file, index) => {
    catchAndImageData.append(`addedImages`, file);
  });
  deletedImages.forEach((url, index) => {
    catchAndImageData.append(`deletedImages`, url);
  });

  return catchAndImageData;
}