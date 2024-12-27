import React, { useEffect, useState } from "react";
import { Badge } from "@mantine/core";
import { ICatch } from "@/lib/types/catch";
import classes from "./StatsBadges.module.css";

interface StatsBadgesProps {
  filteredCatches: ICatch[];
}

enum FishColors {
  kuha = "blue",
  ahven = "red",
  hauki = "yellow",
  lahna = "grape",
  särki = "green",
  kiiski = "cyan",
}

const additionalColors = ["orange", "wheat", "snow", "pink", "teal", "peru"];

export default function StatsBadges({ filteredCatches }: StatsBadgesProps) {

  // Helper function to get random color from the additionalColors array
  const getRandomColor = () =>
    additionalColors[Math.floor(Math.random() * additionalColors.length)];

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
      <Badge key={fishKey} color={color} variant="outline" classNames={{ root: classes.root, label: classes.label}}  size="md">
        {displayName}: {count}
      </Badge>
    );
  });

  return <>{fishBadges}</>;
}
