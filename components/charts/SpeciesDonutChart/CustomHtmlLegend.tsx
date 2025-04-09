import React from 'react';
import { Badge, Group } from '@mantine/core';
import { useTranslations } from 'next-intl';
import classes from './CustomHtmlLegend.module.css';

interface CustomHtmlLegendProps {
  labels: string[];
  colors: string[];
  onItemClick: (index: number) => void;
  getItemVisibility: (index: number) => boolean;
}

export default function CustomHtmlLegend({
  labels,
  colors,
  onItemClick,
  getItemVisibility,
}: CustomHtmlLegendProps) {
  const tFish = useTranslations('Fish');

  return (
    <Group justify="center" gap="xs">
      {labels.map((label, index) => {
        const isVisible = getItemVisibility(index);
        const dotColor = colors[index % colors.length];

        return (
          <Badge
            key={`${label}-${index}`}
            variant='dot'
            size='lg'
            color={dotColor}
            classNames={{ root: classes.badgeRoot }}
            style={{
              cursor: 'pointer',
              userSelect: 'none',
              opacity: isVisible ? 1 : 0.4, // Dim if hidden
              transition: 'opacity 0.2s ease-in-out',
            }}
            onClick={() => onItemClick(index)}
          >
            {tFish.has(label) ? tFish(label) : label}
          </Badge>
        );
      })}
      {/* Pagination Controls Here */}
      {/* <Group> <Button>Prev</Button> <Button>Next</Button> </Group> */}
    </Group>
  );
}