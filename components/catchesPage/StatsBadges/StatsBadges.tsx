import React, { useEffect, useState } from "react";
import { Badge } from "@mantine/core";
import { ICatch } from "@/lib/types/catch";
import classes from "./StatsBadges.module.css";
import { useTranslations } from "next-intl";

interface StatsBadgesProps {
  filteredCatches: ICatch[];
}

enum FishColors {
  kuha = "blue",
  ahven = "red",
  hauki = "yellow",
  lahna = "green",
  särki = "pink",
  kiiski = "cyan",
}

enum FishColorsRGB {
  blue = "116, 192, 252",
  red = "255, 168, 168",
  yellow = "255, 224, 102",
  pink = "250, 162, 193",
  green = "140, 233, 154",
  cyan = "102, 217, 232",
}

enum AdditionalColorsRGB {
  orange = "255, 192, 120",
  lime = "192, 235, 117",
  gray = "222, 226, 230",
  pink = "250, 162, 193",
  indigo = "145, 167, 255",
  violet = "177, 151, 252",
  teal = "99, 230, 190",
  blue = "166, 192, 252",
}

enum AllColorsRGB {
  blue = "116, 192, 252",
  red = "255, 168, 168",
  yellow = "255, 224, 102",
  pink = "250, 162, 193",
  green = "140, 233, 154",
  cyan = "102, 217, 232",
  orange = "255, 192, 120",
  lime = "192, 235, 117",
  gray = "222, 226, 230",
  indigo = "145, 167, 255",
  violet = "177, 151, 252",
  teal = "99, 230, 190",
}

const additionalColors = Object.keys(AdditionalColorsRGB);

export default function StatsBadges({ filteredCatches }: StatsBadgesProps) {
  const t = useTranslations('Fish');

  // Helper function to get random color from the additionalColors array
  const getRandomColor = () => {
    return additionalColors[Math.floor(Math.random() * additionalColors.length)];
  }

  const fishCounts = filteredCatches.reduce((acc, row) => {
    const fishKey = row.species.toLowerCase().trim();
    if (!acc[fishKey]) {
      acc[fishKey] = { count: 0, displayName: row.species };
    }
    acc[fishKey].count += 1;
    return acc;
  }, {} as Record<string, { count: number; displayName: string }>);

  const sortedFishEntries = Object.entries(fishCounts).sort(
    (a, b) => b[1].count - a[1].count
  );

  const fishBadges = sortedFishEntries.map(([fishKey, { count, displayName }]) => {
    const color = FishColors[fishKey as keyof typeof FishColors] || getRandomColor();
    return (
      <Badge 
        px={12} 
        pt={1} 
        h={28} 
        style={{ 
          color: `var(--mantine-color-${color}-3)`, 
          background: `var(--mantine-color-${color}-light-hover)` 
          /* , border: `2px solid rgba(${AllColorsRGB[color]}, 0.15)`*/
        }} 
        key={fishKey} 
        color={AllColorsRGB[color]} 
        variant="light" 
        classNames={{ root: classes.root, label: classes.label}} 
        size="lg"
      >
        {t.has(displayName) ? t(displayName) : displayName}: {count}
      </Badge>
    );
  });

  return <>{fishBadges}</>;
}
