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
  Plugin
} from 'chart.js';
import Chart from 'chartjs-plugin-datalabels';
import { ChartColorsRGB, fixedColorMap } from '../chartConstants';
import { JwtUserInfo } from '@/lib/types/jwtUserInfo';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Box } from '@mantine/core';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Chart
);

const allEnumColors = Object.values(ChartColorsRGB);
const fixedColorsUsedSet = new Set(Object.values(fixedColorMap));
const remainingColors = allEnumColors.filter(color => !fixedColorsUsedSet.has(color));
if (remainingColors.length === 0) remainingColors.push(...allEnumColors);

interface AggregatedUser {
  displayName: string;
  totalCatches: number;
  speciesCounts: Record<string, number>;
  isCurrentUser: boolean;
  rank: number;
}

interface LeaderboardData {
  rankedUsers: AggregatedUser[];
  allSpecies: string[];
}

interface YAxisLabelPluginOptions {
  ranks: number[];
  labels: string[];
  users: AggregatedUser[];
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
    const rankXPosition = chartArea.left - 80;
    const nameXPosition = chartArea.left - 75;
    const defaultColor = '#e0e0e0';
    const highlightColor = '#FFFFFF';
    const defaultWeight = 'normal';
    const highlightWeight = 'bold';
    const fontSize = 16;
    const fontFamily = "'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif";


    ctx.save();
    ctx.textBaseline = 'middle';

    yAxis.getTicks().forEach((tick, index) => {
      const yPosition = yAxis.getPixelForTick(index);

      // Prevent drawing outside the chart area (optional safety check)
      // if (yPosition < chartArea.top || yPosition > chartArea.bottom) {
      //    return;
      // }

      const rank = ranks[index];
      const label = labels[index];
      const user = users[index];
      const isCurrent = user?.isCurrentUser ?? false;

      // Determine Styles
      const currentColor = isCurrent ? highlightColor : defaultColor;
      const currentWeight = isCurrent ? highlightWeight : defaultWeight;
      ctx.font = `${currentWeight} ${fontSize}px ${fontFamily}`;
      ctx.fillStyle = currentColor;

      // Draw Rank Number
      if (rank !== undefined && rank !== 0) {
        ctx.textAlign = 'right';
        ctx.fillText(`#${rank}`, rankXPosition, yPosition);
      }

      // Draw User Name
      ctx.font = `${currentWeight} ${fontSize}px ${fontFamily}`;
      ctx.textAlign = 'left'; 
      const displayName = label.length > 9 ? label.substring(0, 6) + '...' : label;
      ctx.fillText(displayName, nameXPosition, yPosition);

    });

    ctx.restore();
  }
};

function processLeaderboardData(
  catches: ICatch[],
  currentname: string | null | undefined,
  userDisplayNameMap: { [userId: string]: string },
  topN: number = 10
): LeaderboardData {

  // Aggregate data per user
  const userAggregates: Record<string, Omit<AggregatedUser, 'displayName' | 'isCurrentUser' | 'rank'>> = {};
  const allSpeciesSet = new Set<string>();

  catches.forEach(c => {
    if (!c?.caughtBy?.name || !c?.species) return;

    const userDisplayName = (c.caughtBy.userId && userDisplayNameMap[c.caughtBy.userId]) || c.caughtBy.name
    const species = c.species;
    allSpeciesSet.add(species);

    if (!userAggregates[userDisplayName]) {
      userAggregates[userDisplayName] = { totalCatches: 0, speciesCounts: {} };
    }

    userAggregates[userDisplayName].totalCatches++;
    userAggregates[userDisplayName].speciesCounts[species] = (userAggregates[userDisplayName].speciesCounts[species] || 0) + 1;
  });

  // Convert to array and add user info
  const allUsersRanked: AggregatedUser[] = Object.entries(userAggregates)
    .map(([userDisplayName, data]) => ({
      displayName: userDisplayName,
      totalCatches: data.totalCatches,
      speciesCounts: data.speciesCounts,
      isCurrentUser: userDisplayName === currentname,
      rank: 0 // Placeholder for rank
    }))
    .sort((a, b) => b.totalCatches - a.totalCatches);

  // Assign ranks
  allUsersRanked.forEach((user, index) => { user.rank = index + 1; });

  // Get Top N and potentially add current user
  let leaderboardUsers = allUsersRanked.slice(0, topN);
  const currentUserData = allUsersRanked.find(u => u.isCurrentUser);
  const isCurrentUserInTopN = leaderboardUsers.some(u => u.isCurrentUser);

  if (currentUserData && !isCurrentUserInTopN) {
    // Ensure we don't add duplicates if topN is small and user is just outside
    if (!leaderboardUsers.find(u => u.displayName === currentUserData.displayName)) {
      leaderboardUsers.push(currentUserData); // Add as 11th (or N+1 th)
    }
  }

  const allSpecies = Array.from(allSpeciesSet).sort(); // Sort alphabetically for consistent dataset order

  return { rankedUsers: leaderboardUsers, allSpecies };
}

function formatChartJsData(
  leaderboardData: LeaderboardData
): { chartData: ChartData<'bar'>; totalValues: number[] } {
  const { rankedUsers, allSpecies } = leaderboardData;
  const yAxisLabels = rankedUsers.map(u => u.displayName);
  const totalValues = rankedUsers.map(u => u.totalCatches);

  let remainingColorIndex = 0;
  const datasets: ChartDataset<'bar'>[] = allSpecies.map((species) => {
    let color = fixedColorMap[species];
    if (!color) {
      color = remainingColors[remainingColorIndex % remainingColors.length];
      remainingColorIndex++;
    }
    const data = rankedUsers.map(user => user.speciesCounts[species] || 0);

    return {
      label: species,
      data: data,
      backgroundColor: color,
      borderRadius: 3,
      stack: 'userStack',
      borderColor: '#000',
      borderWidth: 1,
      pointStyle: 'circle',
      pointBorderWidth: 0,
      animation: {
        duration: 400,
      }
    };
  });

  const chartData: ChartData<'bar'> = {
    labels: yAxisLabels,
    datasets: datasets,
  };

  return { chartData, totalValues };
}

const EMPTY_LEADERBOARD_DATA: LeaderboardData = {
  rankedUsers: [],
  allSpecies: [],
};

const EMPTY_LEADERBOARD_DATA_2 = {
  chartData: { labels: [], datasets: [] } as ChartData<'bar'>,
  totalValues: []
};

const numFormatter = new Intl.NumberFormat("fi-FI");

interface LeaderboardBarChartProps {
  catches: ICatch[];
  userInfo: JwtUserInfo | null;
  userDisplayNameMap: { [userId: string]: string };
}

export default function LeaderboardBarChart({ catches, userInfo, userDisplayNameMap }: LeaderboardBarChartProps) {
  const t = useTranslations();

  // --- Future: State for selected metric ---
  // const [selectedMetric, setSelectedMetric] = useState('totalCatches');

  const { rankedUsers, allSpecies } = useMemo(() => {
    if (!userDisplayNameMap || !catches) {
      return EMPTY_LEADERBOARD_DATA;
    }
    const currentName = (userInfo?.userId && userDisplayNameMap[userInfo.userId]) || (userInfo?.firstname ?? null);
    return processLeaderboardData(catches, currentName, userDisplayNameMap);
  }, [catches, userInfo, userDisplayNameMap]);

  const { chartData, totalValues } = useMemo(() => {
    if (!userDisplayNameMap || !catches) {
      return EMPTY_LEADERBOARD_DATA_2;
    }
    return formatChartJsData({ rankedUsers, allSpecies });
  }, [catches, userInfo, userDisplayNameMap]);

  const chartOptions = useMemo<ChartOptions<'bar'>>(() => ({
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index', // Important: Interactions trigger based on the data index (the user bar)
    },
    hoverBorderColor: '#ffffff',
    hoverBorderWidth: 2,
    font: {
      family: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    },
    scales: {
      x: {
        stacked: true,
        beginAtZero: true,
        title: {
          display: true,
          text: t('StatisticsPage.CatchCount'),
          color: '#c9c9c9',
        },
        ticks: {
          color: '#c9c9c9',
          maxTicksLimit: 6,
        },
        grid: { color: '#444444' }
      },
      y: {
        stacked: true,
        ticks: {
          display: false,
          // color: (context) => {
          //   // context.index is the index of the user in your data/labels array
          //   const user = rankedUsers[context.index];
          //   const isCurrent = user?.isCurrentUser ?? false;
          //   // Use a brighter color (e.g., white) for the current user
          //   return isCurrent ? '#FFFFFF' : '#c9c9c9'; // Default gray otherwise
          // },
          // font: (context) => {
          //   const user = rankedUsers[context.index];
          //   const isCurrent = user?.isCurrentUser ?? false;
          //   return {
          //     size: 16,
          //     weight: isCurrent ? ('bold' as const) : ('normal' as const), // Need 'as const' for TS literal types
          //   };
          // },

          // // Callback to add ranks and shorten long names if needed
          // callback: function (value, index, ticks) {
          //   let label = this.getLabelForValue(value as number);
          //   const rank = rankedUsers[index].rank;
          //   label = rank ? `#${rank} ${label}` : label;
          //   return label.length > 12 ? label.substring(0, 10) + '...' : label;
          // }
        },
        grid: { drawOnChartArea: false }, // Hide vertical grid lines
      },
    },
    layout: {
      padding: {
        right: 25,
        left: 100
      }
    },
    plugins: {
      legend: {
        display: false,
        // Could use custom HTML legend for species colors if needed
      },
      tooltip: {
        mode: 'index',
        intersect: true,
        usePointStyle: true,
        filter: function (tooltipItem) {
          const value = tooltipItem.parsed?.x;
          return value !== null && value !== undefined && value > 0;
        },
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
          // Display the pre-calculated total for this user (bar index)
          const total = totalValues[context.dataIndex];
          return (total !== null && total !== undefined) ? numFormatter.format(total) : '';
        },
        display: (context) => {
          const isLastDataset = context.datasetIndex === context.chart.data.datasets.length - 1;
          // Only return true (display the label) for the very last dataset in the stack
          return isLastDataset;
        }
      },
      yAxisLabelPlugin: {
        ranks: rankedUsers.map(u => u.rank),
        labels: chartData.labels,
        users: rankedUsers
      } as YAxisLabelPluginOptions,
    },
  }), [totalValues, t, numFormatter]);


  return (
    <Box w={'100%'} h={'100%'} mah={750}>
      {/* Add Dropdown Here Later */}
      {/* <Select data={['totalCatches', 'otherMetric']} value={selectedMetric} onChange={setSelectedMetric} /> */}

      {chartData.labels && chartData.labels.length > 0 ? (
        <Bar 
          options={chartOptions} 
          data={chartData} 
          plugins={[yAxisLabelPlugin]}
        />
      ) : (
        <p>No data available for leaderboard.</p> // Handle empty state
      )}
    </Box>
  );
}