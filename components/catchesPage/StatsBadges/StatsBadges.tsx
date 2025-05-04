import React from 'react';
import { useTranslations } from 'next-intl';
import { Badge } from '@mantine/core';
import { ICatch } from '@/lib/types/catch';
import classes from './StatsBadges.module.css';
import { AdditionalFishColorsMantine3RGB, AllColorsMantine3RGB, AllColorsMantine6RGB, FixedFishColors } from '@/lib/constants/constants';

interface StatsBadgesProps {
  badgesCatches: ICatch[];
  selectedSpecies: string[];
  toggleSpecies: (species: string) => void;
}

const additionalColors = Object.keys(AdditionalFishColorsMantine3RGB);

export default function StatsBadges({ badgesCatches, selectedSpecies, toggleSpecies }: StatsBadgesProps) {
  const t = useTranslations('Fish');

  // Helper function to get random color from the additionalColors array
  const getRandomColor = () => {
    return additionalColors[Math.floor(Math.random() * additionalColors.length)];
  };

  const isSpeciesFilteringOn = selectedSpecies.length > 0;

  const fishCounts = badgesCatches.reduce(
    (acc, row) => {
      const fishKey = row.species.toLowerCase().trim();
      if (!acc[fishKey]) {
        acc[fishKey] = { count: 0, displayName: row.species };
      }
      acc[fishKey].count += 1;
      return acc;
    },
    {} as Record<string, { count: number; displayName: string }>
  );

  const sortedFishEntries = Object.entries(fishCounts).sort((a, b) => b[1].count - a[1].count);

  const fishBadges = sortedFishEntries.map(([fishKey, { count, displayName }]) => {
    const color = FixedFishColors[fishKey as keyof typeof FixedFishColors] || getRandomColor();
    const isActive = selectedSpecies.includes(fishKey);

    const variant = !isSpeciesFilteringOn
      ? ('light' as const)
      : isActive
        ? ('filled' as const)
        : ('outline' as const);

    const customStyle = !isSpeciesFilteringOn
      ? {
        color: `var(--mantine-color-${color}-3)`,
        background: `var(--mantine-color-${color}-light-hover)`,
        border: `3px solid #0d0d0d`,
      }
      : isActive
        ? {
          color: `var(--mantine-color-${color}-3)`,
          background: `var(--mantine-color-${color}-light-hover)`,
          border: `3px solid rgba(${AllColorsMantine6RGB[color]}, 0.4)`,
        }
        : {
          color: `var(--mantine-color-dark-3)`,
          background: `transparent`,
          border: `1px solid var(--mantine-color-dark-3)`,
          marginLeft: '2px',
          marginRight: '2px',
        };

    return (
      <Badge
        px={12}
        pt={1}
        h={28}
        style={{ cursor: 'pointer', ...customStyle }}
        key={fishKey}
        classNames={{ root: classes.root, label: classes.label }}
        size="lg"
        onClick={() => toggleSpecies(fishKey)}
      >
        {t.has(displayName) ? t(displayName) : displayName}: {count}
      </Badge>
    );
  });

  return <>{fishBadges}</>;
}
