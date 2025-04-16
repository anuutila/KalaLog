import React from 'react';
import Link from 'next/link';
import { Group, Badge, Box, Text, ActionIcon, MantineColor } from '@mantine/core';
import { IconFish, IconChevronRight } from '@tabler/icons-react';
import { ICatch } from '@/lib/types/catch';
import { useTranslations } from 'next-intl';

interface PersonalBestRowProps {
    speciesLabel: string;
    color: MantineColor;
    biggestCatch: ICatch | null;
}

export function BiggestFishStat({
    speciesLabel,
    color,
    biggestCatch
}: PersonalBestRowProps) {
    const t = useTranslations();

    const weight = biggestCatch?.weight || null;
    const length = biggestCatch?.length || null;

    let statsText: string;

    if (weight && length) {
        statsText = `${weight} kg  /  ${length} cm`;
    } else if (weight) {
        statsText = `${weight} kg`;
    } else if (length) {
        statsText = `${length} cm`;
    } else {
        statsText = '-';
    }

    return (
        <Group align='center' justify="space-between" >
            <Badge
                size="lg"
                color={color}
                variant="light"
                radius={'xl'}
                w={130}
                leftSection={<IconFish size={28} stroke={2} />}
            >
                {t(`Fish.${speciesLabel}`)}
            </Badge>
            <Box>
                <Link
                    href={(biggestCatch && statsText !== '-') ? `/catches?catchNumber=${biggestCatch.catchNumber}` : '#'}
                    passHref
                    prefetch={!!biggestCatch}
                    style={{
                        textDecoration: 'none',
                        color: 'inherit',
                        pointerEvents: (statsText !== '-') ? 'auto' : 'none',
                        opacity: (statsText !== '-') ? 1 : 0.5,
                        display: 'inline-block'
                    }}
                    aria-label={`View details for biggest ${speciesLabel}`}
                >
                    <Group wrap="nowrap" gap="xs">
                        <Text c={'white'} fw={500} fz={'lg'} lh={1} style={{ whiteSpace: 'nowrap' }}>
                            {statsText}
                        </Text>
                        <ActionIcon variant='subtle' color='inherit' disabled={statsText === '-'}>
                            <IconChevronRight size={20} stroke={2.5} />
                        </ActionIcon>
                    </Group>
                </Link>
            </Box>
        </Group>
    );
}