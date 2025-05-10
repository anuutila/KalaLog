import { ICatch } from '@/lib/types/catch';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartDataset,
  ChartOptions,
  Plugin,
  TooltipItem,
  ScriptableContext
} from 'chart.js';
import Chart from 'chartjs-plugin-datalabels';
import { AchievementChartColors, BarChartBgColors, ChartColorsRGBA, fixedBarChartBgColorMap, fixedColorMap } from '../chartConstants';
import { JwtUserInfo } from '@/lib/types/jwtUserInfo';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Box, Combobox, Group, Input, InputBase, Select, Stack, useCombobox } from '@mantine/core';
import { IPublicUserProfile } from '@/lib/types/user';
import { StarRarityCounts } from '@/lib/utils/achievementUtils';
import { capitalizeFirstLetter } from '@/lib/utils/utils';
import { IconListNumbers, IconRuler2, IconTallymarks, IconWeight } from '@tabler/icons-react';
import { getPrimaryMetricOptions, getSecondaryMetricOptions } from '@/components/catchesPage/optionGenerators';
import { getStackedBarBorderWidth } from '@/lib/utils/chartUtils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Chart
);

const rarityTranslationKeys = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

const secondaryMetricIconMap: Record<SecondaryMetric, React.ElementType> = {
  'count': IconTallymarks,
  'weight': IconWeight,
  'length': IconRuler2,
};

export const getSecondaryMetricIcon = (metric: SecondaryMetric) => {
  const Icon = secondaryMetricIconMap[metric];
  return <Icon color={'#828282'} size={20} />;
};

const allBgColors = Object.values(BarChartBgColors);
const allBorderColors = Object.values(ChartColorsRGBA);
const fixedBgColorsUsed = new Set(Object.values(fixedBarChartBgColorMap));
const fixedBorderColorsUsed = new Set(Object.values(fixedColorMap));
const remainingBgColors = allBgColors.filter(color => !fixedBgColorsUsed.has(color));
const remainingBorderColors = allBorderColors.filter(color => !fixedBorderColorsUsed.has(color));
const usedNonFixedColors: string[] = [];

interface ProcessedLeaderboardUser {
  identifier: string;
  displayName: string;
  score: number;
  speciesCounts?: Record<string, number>;
  starsByRarity?: StarRarityCounts;
  isCurrentUser: boolean;
  isRegistered: boolean;
  rank: number;
}

interface ProcessedLeaderboardData {
  rankedUsers: ProcessedLeaderboardUser[];
  valueAxisLabel: string;
  categories: string[];
}

interface YAxisLabelPluginOptions {
  ranks: (number | null)[];
  labels: (string | null)[];
  users: (ProcessedLeaderboardUser | null)[];
}

interface LeaderboardBarChartProps {
  catches: ICatch[];
}

const yAxisLabelPlugin: Plugin<'bar', YAxisLabelPluginOptions> = {
  id: 'yAxisLabelPlugin',
  afterDraw: (chart, args, options) => {
    const { labels, ranks, users } = options;
    if (!labels || !ranks || !users || !labels.length || !ranks.length || !users.length) {
      return;
    }

    const { ctx } = chart;
    const yAxis = chart.scales.y;
    const chartArea = chart.chartArea;

    // Define drawing positions
    const rankXPosition = chartArea.left - 75;
    const nameXPosition = chartArea.left - 70;
    const defaultColor = '#e0e0e0';
    const highlightColor = '#FFFFFF';
    const defaultWeight = '500';
    const highlightWeight = 'bold';
    const fontSize = 16;
    const fontFamily = '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji';


    ctx.save();
    ctx.textBaseline = 'middle';

    yAxis.getTicks().forEach((tick, index) => {
      const yPosition = yAxis.getPixelForTick(index);

      const rank = ranks[index];
      const label = labels[index];
      const user = users[index];
      const isCurrent = user?.isCurrentUser ?? false;

      // Determine Styles
      const currentColor = isCurrent && user?.score ? highlightColor : defaultColor;
      const currentWeight = isCurrent && user?.score ? highlightWeight : defaultWeight;
      ctx.font = `${currentWeight} ${fontSize}px ${fontFamily}`;
      ctx.fillStyle = currentColor;

      // Draw Rank Number
      ctx.textAlign = 'right';
      ctx.fillText(`#${rank ?? index + 1}`, rankXPosition, yPosition);


      // Draw User Name
      ctx.font = `${currentWeight} ${fontSize}px ${fontFamily}`;
      ctx.textAlign = 'left';
      const displayName = ((label?.length ?? 0) > 9 && user?.score) ? label?.substring(0, 6) + '...' : (label && user?.score ? label : '');
      ctx.fillText(displayName, nameXPosition, yPosition);

    });

    ctx.restore();
  }
};

function processGenericLeaderboardData(
  allUserInfos: IPublicUserProfile[],
  catches: ICatch[],
  primaryMetric: PrimaryMetric,
  secondaryMetric: SecondaryMetric,
  loggedInUserInfo: JwtUserInfo | null,
  userDisplayNameMap: { [userId: string]: string },
  t: any,
  topN: number = 10
): ProcessedLeaderboardData {

  if ((primaryMetric === 'totalXP' || primaryMetric === 'level' || primaryMetric === 'totalStars') && !allUserInfos) {
    console.warn(`'allUserInfos' prop is required for metric: ${primaryMetric}`);
    return EMPTY_LEADERBOARD_DATA;
  }
  if (primaryMetric !== 'totalXP' && primaryMetric !== 'totalStars' && !catches) {
    console.warn(`'catches' prop is required for metric: ${primaryMetric}`);
    return EMPTY_LEADERBOARD_DATA;
  }

  let unsortedUsers: Omit<ProcessedLeaderboardUser, 'rank'>[] = [];
  let valueAxisLabel = '';
  let categories: string[] = [];

  const userInfoMap = new Map(allUserInfos.map(u => [u.id, u]));

  // Determine current user's identifier (ID or Name)
  const currentUserIdentifier = loggedInUserInfo?.userId ?? loggedInUserInfo?.firstname ?? null;


  // --- Calculate Scores based on Metric ---
  switch (primaryMetric) {
    case 'level':
    case 'totalStars':
    case 'totalXP':
      // These metrics only apply to REGISTERED users
      valueAxisLabel = primaryMetric === 'level' ? t('StatisticsPage.Level') : (primaryMetric === 'totalStars' ? t('StatisticsPage.TotalStars') : t('StatisticsPage.TotalXP'));
      categories = primaryMetric === 'totalStars' ? ['1', '2', '3', '4', '5'] : [valueAxisLabel];

      unsortedUsers = allUserInfos.map(user => ({
        identifier: user.id,
        displayName: (user.id && userDisplayNameMap[user.id]) || user.firstName,
        score: primaryMetric === 'level' ? user.level : (primaryMetric === 'totalStars' ? user.totalStars : user.totalXP),
        starsByRarity: primaryMetric === 'totalStars' ? user.starsByRarity : undefined,
        isCurrentUser: user.id === currentUserIdentifier,
        isRegistered: true,
      }));
      break;

    case 'totalCatches':
    case 'pike':
    case 'zander':
    case 'perch':
      // These metrics consider BOTH registered and unregistered users from catches
      const tempScores = new Map<string, { score: number; speciesCounts?: Record<string, number>; isRegistered: boolean; userId?: string | null }>();
      const allSpeciesSet = new Set<string>();

      // Filter catches by species when needed
      const relevantCatches = (primaryMetric === 'pike' || primaryMetric === 'zander' || primaryMetric === 'perch')
        ? catches.filter(c => c.species.toLowerCase() === t(`FishEnFi.${capitalizeFirstLetter(primaryMetric)}`).toLowerCase())
        : catches;

      // Aggregate scores from catches
      for (const c of relevantCatches) {
        if (!c.caughtBy?.name) continue;

        const userId = c.caughtBy.userId;
        const name = c.caughtBy.name;
        // Prefer userId as key if available, otherwise use name (for unregistered)
        const userKey = userId || `unregistered_${name}`;

        if (!tempScores.has(userKey)) {
          tempScores.set(userKey, { score: 0, speciesCounts: primaryMetric === 'totalCatches' ? {} : undefined, isRegistered: !!userId, userId: userId });
        }
        const userData = tempScores.get(userKey)!;

        // Add to species list for totalCatches
        if (primaryMetric === 'totalCatches') {
          allSpeciesSet.add(c.species);
          userData.speciesCounts![c.species] = (userData.speciesCounts![c.species] || 0) + 1;
        }

        // Update score based on metric/subMetric
        if (primaryMetric === 'totalCatches' || secondaryMetric === 'count') {
          userData.score++;
        } else if (secondaryMetric === 'weight') {
          userData.score = Math.max(userData.score, c.weight ?? 0);
        } else if (secondaryMetric === 'length') {
          userData.score = Math.max(userData.score, c.length ?? 0);
        }
      }

      unsortedUsers = Array.from(tempScores.entries()).map(([key, data]) => {
        const isCurrentUserCheck = data.userId ? data.userId === currentUserIdentifier : (!data.userId && key === `unregistered_${currentUserIdentifier}`);
        const displayName = (data.userId && userDisplayNameMap[data.userId]) || userInfoMap.get(key)?.firstName || key.replace('unregistered_', '');

        return {
          identifier: key,
          displayName: displayName,
          score: data.score,
          speciesCounts: data.speciesCounts,
          isCurrentUser: isCurrentUserCheck,
          isRegistered: data.isRegistered,
        };
      });

      // Determine Axis Label and Categories
      if (primaryMetric === 'totalCatches') {
        valueAxisLabel = t('StatisticsPage.CatchCount');

        const globalSpeciesTotals: Record<string, number> = {};
        catches.forEach(c => {
          if (c?.species) {
            globalSpeciesTotals[c.species] = (globalSpeciesTotals[c.species] || 0) + 1;
          }
        });
        const allSpeciesSorted = Array.from(allSpeciesSet).sort((speciesA, speciesB) => {
          const countA = globalSpeciesTotals[speciesA] || 0;
          const countB = globalSpeciesTotals[speciesB] || 0;
          return countA - countB;
        });
        categories = allSpeciesSorted;
      } else {
        const speciesName = t(`Fish.${capitalizeFirstLetter(primaryMetric)}`);
        if (secondaryMetric === 'count') valueAxisLabel = `${speciesName} ${t('StatisticsPage.Count')}`;
        else if (secondaryMetric === 'weight') valueAxisLabel = `${speciesName} ${t('StatisticsPage.Weight')} (kg)`;
        else if (secondaryMetric === 'length') valueAxisLabel = `${speciesName} ${t('StatisticsPage.Length')} (cm)`;
        categories = [valueAxisLabel];
      }
      break;
  }

  // --- Sort, Rank, Slice ---
  const sortedUsers = unsortedUsers.sort((a, b) => b.score - a.score);
  const sortedUsersWithRank: ProcessedLeaderboardUser[] = sortedUsers.map((user, index) => {
    const userWithRank = { ...user, rank: index + 1 };
    return userWithRank;
  });

  let rankedUsers = sortedUsersWithRank.slice(0, topN);
  const currentUserData = sortedUsersWithRank.find(u => u.isCurrentUser);

  // Add current user if they are outside topN and exist
  if (currentUserData && !rankedUsers.some(u => u.identifier === currentUserData.identifier)) {
    rankedUsers.push(currentUserData);
  }

  return { rankedUsers, valueAxisLabel, categories };
}

interface FormattedChartDataResult {
  chartData: ChartData<'bar'>;
  totalValues: number[];
}

const EMPTY_FORMATTED_DATA: FormattedChartDataResult = {
  chartData: { labels: [], datasets: [] },
  totalValues: []
};

function formatGenericChartJsData(
  leaderboardData: ProcessedLeaderboardData,
  primaryMetric: PrimaryMetric,
  allUserInfos: IPublicUserProfile[],
  t: any
): FormattedChartDataResult {

  const { rankedUsers, categories } = leaderboardData;
  if (!rankedUsers || rankedUsers.length === 0) {
    return EMPTY_FORMATTED_DATA;
  }

  const targetLength = 10;
  const actualUserCount = rankedUsers.length;
  const paddingNeeded = Math.max(0, targetLength - actualUserCount);

  const yAxisLabels = [
    ...rankedUsers.map(u => u.displayName),
    ...Array(paddingNeeded).fill('')
  ];

  const totalValues = [
    ...rankedUsers.map(u => u.score),
    ...Array(paddingNeeded).fill(0)
  ];

  let datasets: ChartDataset<'bar'>[] = [];

  let remainingColorIndex = 0;
  const usedNonFixedColors: string[] = [];

  // Create Map for quick lookup of IPublicUserProfile by ID
  const userInfoMap = new Map(allUserInfos.map(u => [u.id, u]));

  // --- Generate Datasets based on Metric ---
  if (primaryMetric === 'totalCatches') {
    // STACKED BY SPECIES
    // @ts-ignore
    datasets = categories.map((species, datasetIndex, allDatasets) => {
      let bgColor = fixedBarChartBgColorMap[species];
      let borderColor = fixedColorMap[species];
      if (!bgColor) {
        bgColor = remainingBgColors[remainingColorIndex % remainingBgColors.length];
        borderColor = remainingBorderColors[remainingColorIndex % remainingBorderColors.length];
        usedNonFixedColors.push(borderColor); // Track for tooltips
        remainingColorIndex++;
      }

      const data = rankedUsers.map(user => user.speciesCounts?.[species] || 0);

      return {
        label: t.has(`Fish.${species}`) ? t(`Fish.${species}`) : species,
        data: data,
        backgroundColor: bgColor,
        hoverBackgroundColor: borderColor,
        borderColor: borderColor,
        stack: 'userStack',
        pointStyle: 'circle',
        pointBorderWidth: 0,
        borderWidth: (context: ScriptableContext<'bar'>) => getStackedBarBorderWidth(context, 3),
        hoverBorderWidth: (context: ScriptableContext<'bar'>) => getStackedBarBorderWidth(context, 4),
        animation: {
          duration: 400,
        }
      };
    });

  } else if (primaryMetric === 'totalStars') {
    // STACKED BY RARITY (Only for registered users)
    // @ts-ignore
    datasets = categories.map((rarityStr, datasetIndex, allDatasets) => {
      const rarity = parseInt(rarityStr, 10) as keyof StarRarityCounts;
      const rarityIndex = rarity - 1;

      const data = rankedUsers.map(user => {
        if (user.isRegistered && user.identifier) {
          const userInfo = userInfoMap.get(user.identifier);
          return userInfo?.starsByRarity?.[rarity] ?? 0;
        }
        return 0;
      });

      const colorKey = AchievementChartColors[rarityIndex] as keyof typeof BarChartBgColors;
      const bgColor = BarChartBgColors[colorKey];
      const borderColor = ChartColorsRGBA[colorKey];

      return {
        label: t(`AchievementsPage.Rarities.${rarityTranslationKeys[rarityIndex]}`),
        data: data,
        backgroundColor: bgColor,
        hoverBackgroundColor: borderColor,
        borderColor: borderColor,
        borderWidth: (context: ScriptableContext<'bar'>) => getStackedBarBorderWidth(context, 3),
        hoverBorderWidth: (context: ScriptableContext<'bar'>) => getStackedBarBorderWidth(context, 4),
        stack: 'userStack',
        pointStyle: 'circle',
        pointBorderWidth: 0,
        animation: {
          duration: 400,
        }
      };
    });

  } else {
    // SINGLE NON-STACKED BAR (XP, Level, Pike Count, Pike Weight etc.)
    let bgColor: string = BarChartBgColors.blue;
    let borderColor: string = ChartColorsRGBA.blue;

    if (primaryMetric !== 'totalXP' && primaryMetric !== 'level') {
      const speciesName = t(`FishEnFi.${capitalizeFirstLetter(primaryMetric)}`);
      bgColor = fixedBarChartBgColorMap[speciesName];
      borderColor = fixedColorMap[speciesName];
    }

    datasets.push({
      label: leaderboardData.valueAxisLabel,
      data: totalValues,
      backgroundColor: bgColor,
      hoverBackgroundColor: borderColor,
      borderColor: borderColor,
      borderWidth: 3,
      hoverBorderWidth: 4,
      borderSkipped: 'left',
      pointStyle: 'circle',
      animation: {
        duration: 400,
      }
    });
  }

  const chartData: ChartData<'bar'> = {
    labels: yAxisLabels,
    datasets: datasets,
  };

  return { chartData, totalValues };
}

function generateChartOptions(
  leaderboardData: ProcessedLeaderboardData,
  primaryMetric: PrimaryMetric,
  totalValues: number[],
): ChartOptions<'bar'> {
  const { rankedUsers, valueAxisLabel } = leaderboardData;

  const isStacked = ['totalCatches', 'totalStars'].includes(primaryMetric);

  return {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
    },
    font: {
      family: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    },
    hoverBorderColor: 'white',
    borderRadius: 5,
    scales: {
      x: {
        stacked: isStacked,
        beginAtZero: true,
        title: {
          display: true,
          text: valueAxisLabel,
          color: '#c9c9c9',
          font: { size: 14 },
        },
        ticks: {
          color: '#c9c9c9',
          maxTicksLimit: 6,
        },
        grid: { color: '#444444' }
      },
      y: {
        stacked: isStacked,
        ticks: {
          display: false, // Hide default labels, use plugin
        },
        grid: { drawOnChartArea: false }, // Hide vertical grid lines
      },
    },
    layout: {
      padding: {
        right: primaryMetric === 'totalXP' ? 75 : 25, // Increased right padding for datalabels
        left: 95
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: true,
        usePointStyle: true,
        caretPadding: 25,
        // Filter out zero values from tooltip
        filter: function (tooltipItem: TooltipItem<'bar'>) {
          const value = tooltipItem.parsed?.x;
          return value !== null && value !== undefined && value > 0;
        },
        // Sort items in tooltip (descending)
        itemSort: function (a: TooltipItem<'bar'>, b: TooltipItem<'bar'>) {
          const valueA = a.parsed?.x ?? 0;
          const valueB = b.parsed?.x ?? 0;
          return valueB - valueA;
        },
        callbacks: {
          labelColor: function (tooltipItem) {
            const dataset = tooltipItem.chart.data.datasets[tooltipItem.datasetIndex];
            const color = (dataset.borderColor || dataset.backgroundColor || ChartColorsRGBA.gray) as string;
            return {
              borderColor: color,
              backgroundColor: color,
              borderWidth: 2,
              borderRadius: 5,
            };
          },
        }
      },
      datalabels: {
        anchor: 'end',
        align: 'end',
        color: '#ffffff',
        font: {
          weight: 'bold',
          family: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
          size: 20,
        },
        formatter: (value, context) => {
          const total = totalValues[context.dataIndex];
          return (total !== null && total !== undefined && total > 0) ? numFormatter.format(total) : '';
        },
        padding: { left: 4 }, // Add padding so label isn't flush with bar end
        display: (context) => {
          // Display only on the last dataset (if stacked) or always (if not stacked)
          const datasetCount = context.chart.data.datasets.length;
          const isLastDataset = context.datasetIndex === datasetCount - 1;
          // Only display if the total value is > 0
          const total = totalValues[context.dataIndex];
          const shouldDisplay = total > 0 && (isStacked ? isLastDataset : true);
          return shouldDisplay;
        }
      },
      // @ts-ignore
      yAxisLabelPlugin: {
        ranks: rankedUsers.map(u => u.rank),
        labels: rankedUsers.map(u => u.displayName),
        users: rankedUsers
      } as YAxisLabelPluginOptions,
    },
  };
}

const EMPTY_LEADERBOARD_DATA: ProcessedLeaderboardData = {
  rankedUsers: [], valueAxisLabel: '', categories: []
};

const EMPTY_LEADERBOARD_DATA_2 = {
  chartData: { labels: [], datasets: [] } as ChartData<'bar'>,
  totalValues: []
};

export type PrimaryMetric = 'totalCatches' | 'totalXP' | 'level' | 'totalStars' | 'pike' | 'zander' | 'perch';
export type SecondaryMetric = 'count' | 'weight' | 'length';

export const primaryMetricKeys: PrimaryMetric[] = [
  'totalCatches',
  'totalXP',
  'level',
  'totalStars',
  'pike',
  'zander',
  'perch'
];

const numFormatter = new Intl.NumberFormat("fi-FI");

interface LeaderboardBarChartProps {
  catches: ICatch[];
  userInfo: JwtUserInfo | null;
  userDisplayNameMap: { [userId: string]: string };
  allUserInfos: IPublicUserProfile[];
}

export default function LeaderboardBarChart({ catches, userInfo, userDisplayNameMap, allUserInfos }: LeaderboardBarChartProps) {
  const t = useTranslations();
  const [primaryMetric, setPrimaryMetric] = useState<PrimaryMetric>('totalCatches');
  const [secondaryMetric, setSecondaryMetric] = useState<SecondaryMetric>('count');

  const leaderboardData = useMemo(() => {
    return processGenericLeaderboardData(
      allUserInfos,
      catches,
      primaryMetric,
      secondaryMetric,
      userInfo,
      userDisplayNameMap,
      t
    );
  }, [allUserInfos, catches, primaryMetric, secondaryMetric, userInfo, userDisplayNameMap, t]);

  const { chartData, totalValues } = useMemo(() => {
    if (!leaderboardData.rankedUsers.length) return EMPTY_LEADERBOARD_DATA_2;
    return formatGenericChartJsData(leaderboardData, primaryMetric, allUserInfos, t);
  }, [leaderboardData, primaryMetric, allUserInfos]);

  const chartOptions = useMemo(() => {
    return generateChartOptions(leaderboardData, primaryMetric, totalValues);
  }, [leaderboardData, primaryMetric, secondaryMetric, totalValues, t]);

  const primaryCombobox = useCombobox({
    onDropdownClose: () => primaryCombobox.resetSelectedOption(),
    onDropdownOpen: () => primaryCombobox.updateSelectedOptionIndex('active'),
  });

  const secondaryCombobox = useCombobox({
    onDropdownClose: () => secondaryCombobox.resetSelectedOption(),
    onDropdownOpen: () => secondaryCombobox.updateSelectedOptionIndex('active'),
  });

  const primaryMetricOptions = useMemo(() => getPrimaryMetricOptions(primaryMetricKeys, primaryMetric, t), [primaryMetric, t]);
  const secondaryMetricOptions = useMemo(() => getSecondaryMetricOptions(['count', 'weight', 'length'], secondaryMetric, t), [secondaryMetric, t]);

  return (
    <Stack w={'100%'} h={'100%'} gap={0}>
      <Group mb="md" wrap='nowrap' pr={6}>
        <Box flex={1.5}>
          <Combobox
            store={primaryCombobox}
            onOptionSubmit={(val) => {
              setPrimaryMetric(val as PrimaryMetric);
              primaryCombobox.closeDropdown();
            }}
            size="sm"
          >
            <Combobox.Target>
              <InputBase
                component="button"
                type="button"
                pointer
                rightSection={<Combobox.Chevron />}
                rightSectionPointerEvents="none"
                onClick={() => primaryCombobox.toggleDropdown()}
                size="sm"
                leftSection={<IconListNumbers size={20} />}
                leftSectionPointerEvents="none"
              >
                {t.has(`Fish.${capitalizeFirstLetter(primaryMetric)}`)
                  ? t(`Fish.${capitalizeFirstLetter(primaryMetric)}`)
                  : t(`StatisticsPage.${capitalizeFirstLetter(primaryMetric)}`)
                  || <Input.Placeholder>{t('StatisticsPage.Metric')}</Input.Placeholder>}
              </InputBase>
            </Combobox.Target>

            <Combobox.Dropdown>
              <Combobox.Options>{primaryMetricOptions}</Combobox.Options>
            </Combobox.Dropdown>
          </Combobox>
        </Box>

        <Box flex={1}>
          {['pike', 'zander', 'perch'].includes(primaryMetric) && (
            <Combobox
            store={secondaryCombobox}
            onOptionSubmit={(val) => {
              setSecondaryMetric(val as SecondaryMetric);
              secondaryCombobox.closeDropdown();
            }}
            size="sm"
          >
            <Combobox.Target>
              <InputBase
                component="button"
                type="button"
                pointer
                rightSection={<Combobox.Chevron />}
                rightSectionPointerEvents="none"
                onClick={() => secondaryCombobox.toggleDropdown()}
                size="sm"
                leftSection={getSecondaryMetricIcon(secondaryMetric)}
                leftSectionPointerEvents="none"
              >
                {t(`StatisticsPage.${capitalizeFirstLetter(secondaryMetric)}`)
                  || <Input.Placeholder>{t('StatisticsPage.Metric')}</Input.Placeholder>}
              </InputBase>
            </Combobox.Target>

            <Combobox.Dropdown>
              <Combobox.Options>{secondaryMetricOptions}</Combobox.Options>
            </Combobox.Dropdown>
          </Combobox>
          )}
        </Box>
      </Group>
      <Box w={'100%'} h={'100%'} mah={750}>

        {chartData.labels && chartData.labels.length > 0 ? (
          <Bar
            options={chartOptions}
            data={chartData}
            plugins={[yAxisLabelPlugin]}
          />
        ) : (
          <p>No data available for leaderboard.</p>
        )}
      </Box>
    </Stack>
  );
}