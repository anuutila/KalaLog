import React from 'react';
import { useTranslations } from 'next-intl';
import { Badge } from '@mantine/core';
import { ICatch } from '@/lib/types/catch';
import classes from './StatsBadges.module.css';
import { AdditionalFishColorsMantine3RGB, AllColorsMantine3RGB, FixedFishColors } from '@/lib/constants/constants';

interface StatsBadgesProps {
  filteredCatches: ICatch[];
}

const additionalColors = Object.keys(AdditionalFishColorsMantine3RGB);

export default function StatsBadges({ filteredCatches }: StatsBadgesProps) {
  const t = useTranslations('Fish');

  // Helper function to get random color from the additionalColors array
  const getRandomColor = () => {
    return additionalColors[Math.floor(Math.random() * additionalColors.length)];
  };

  const fishCounts = filteredCatches.reduce(
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
    return (
      <Badge
        px={12}
        pt={1}
        h={28}
        style={{
          color: `var(--mantine-color-${color}-3)`,
          background: `var(--mantine-color-${color}-light-hover)`,
          /* , border: `2px solid rgba(${AllColorsRGB[color]}, 0.15)`*/
        }}
        key={fishKey}
        color={AllColorsMantine3RGB[color]}
        variant="light"
        classNames={{ root: classes.root, label: classes.label }}
        size="lg"
      >
        {t.has(displayName) ? t(displayName) : displayName}: {count}
      </Badge>
    );
  });

  return <>{fishBadges}</>;
}
