import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartData, ChartOptions, Plugin, ChartEvent, ActiveElement, Chart } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ICatch } from '@/lib/types/catch';
import CustomHtmlLegend from './CustomHtmlLegend';
import { Box, Stack } from '@mantine/core';

ChartJS.register(ArcElement, Tooltip, Legend);

enum ChartColorsRGB {
  blue = '#228be6',
  red = '#fa5252',
  yellow = '#fab005',
  green = '#40c057',
  violet = '#7950f2',
  orange = '#fd7e14',
  pink = '#e64980',
  cyan = '#15aabf',
  lime = '#82c91e',
  indigo = '#4c6ef5',
  teal = '#12b886',
  gray = '#e9ecef',
}

function prepareChartDataJs(catches: any[]): { labels: string[]; counts: number[]; backgroundColors: string[] } {
  const speciesCount: Record<string, number> = {};
  catches.forEach(({ species }) => {
    speciesCount[species] = (speciesCount[species] || 0) + 1;
  });

  const fixedColorMap: Record<string, string> = {
    'Kuha': ChartColorsRGB.blue,
    'Ahven': ChartColorsRGB.red,
    'Hauki': ChartColorsRGB.yellow,
    'Lahna': ChartColorsRGB.green,
    'Särki': ChartColorsRGB.violet,
    'Kiiski': ChartColorsRGB.orange,
  };

  const allEnumColors = Object.values(ChartColorsRGB);
  const fixedColorsUsed = new Set(Object.values(fixedColorMap));
  let remainingColors = allEnumColors.filter(color => !fixedColorsUsed.has(color));

  const labels = Object.keys(speciesCount).sort((a, b) => speciesCount[b] - speciesCount[a]);

  let remainingColorIndex = 0;
  const backgroundColors = labels.map(label => {
    // Check if the species has a fixed color assigned
    if (fixedColorMap[label]) {
      return fixedColorMap[label];
    } else {
      // Assign the next available color from the remaining list
      const color = remainingColors[remainingColorIndex % remainingColors.length];
      remainingColorIndex++;
      return color;
    }
  });

  const counts = labels.map(label => speciesCount[label]);

  return { labels, counts, backgroundColors };
}

const numFormatter = new Intl.NumberFormat("fi-FI");

type SelectedSliceData = { label: string; value: number } | null;

interface CenterTextPluginOptions {
  selectedData: SelectedSliceData;
  translationFunc: (key: string) => string;
  fishTranslationFunc: (key: string) => string;
  formatter: Intl.NumberFormat;
}

interface SpeciesDonutChartProps {
  catches: ICatch[];
}

export default function SpeciesDonutChart({ catches }: SpeciesDonutChartProps) {
  const t = useTranslations();
  const tFish = useTranslations('Fish');
  const chartRef = useRef<ChartJS<'doughnut'>>(null);
  const preparedData = useMemo(() => prepareChartDataJs(catches), [catches]);
  const [visibility, setVisibility] = useState<Record<number, boolean>>({});
  const [selectedSliceData, setSelectedSliceData] = useState<SelectedSliceData>(null);

  useEffect(() => {
    const chart = chartRef.current;
    const initialVisibility: Record<number, boolean> = {};
    preparedData.labels.forEach((_, index) => {
      // If chart exists, get actual visibility, otherwise default to true
      initialVisibility[index] = chart ? chart.getDataVisibility(index) : true;
    });
    setVisibility(initialVisibility);
    // Run this effect if the labels array changes (e.g., new data)
  }, [preparedData.labels]);

  const handleChartClick = useCallback(
    (event: ChartEvent, elements: ActiveElement[], chart: Chart) => {
      // 'elements' array directly gives us the clicked items
      if (elements.length > 0) {
        const { index, datasetIndex } = elements[0]; // Get info from the first clicked element

        if (chart.data.labels && chart.data.datasets[datasetIndex]?.data) {
          const label = chart.data.labels[index] as string;
          const value = chart.data.datasets[datasetIndex].data[index] as number;

          // Use functional update for safety, avoids needing selectedSliceData in deps
          setSelectedSliceData(prevSelectedData => {
            if (prevSelectedData?.label === label && prevSelectedData?.value === value) {
              return null; // Deselect if clicking the same slice again
            } else {
              return { label, value }; // Select the new slice
            }
          });
        } else {
           // Handle cases where data might be missing, maybe deselect?
           setSelectedSliceData(null);
        }
      } else {
        // Clicked outside slices, deselect
        setSelectedSliceData(null);
      }
    },
    []
  );

  const handleLegendItemClick = useCallback((index: number) => {
    const chart = chartRef.current;
    if (!chart) {
      console.error("Chart instance not ready for legend interaction.");
      return;
    }

    // Toggle data visibility using Chart.js API
    chart.toggleDataVisibility(index);
    // IMPORTANT: Update the chart to reflect the change
    chart.update();

    // Update React state to match the chart's new visibility state
    setVisibility(prev => ({
      ...prev,
      [index]: chart.getDataVisibility(index) // Get the definitive state from the chart
    }));

    // Also reset the center text selection when legend is clicked,
    // as the context (total vs selection) has changed.
    setSelectedSliceData(null);

  }, []);

  const getItemVisibility = useCallback(
    (index: number): boolean => {
      return visibility[index] ?? true;
    },
    [visibility]
  );

  const centerTextPluginDefinition: Plugin<'doughnut', CenterTextPluginOptions> = {
    id: 'centerTextPlugin', // Static ID
    afterDatasetsDraw: (chart, args, options) => {
      // --- Access dynamic data/functions via the options object ---
      const currentSelectedData = options?.selectedData ?? null;
      const currentT = options?.translationFunc ?? ((key: string) => key);
      const currentTFish = options?.fishTranslationFunc ?? ((key: string) => key);
      const currentFormatter = options?.formatter ?? new Intl.NumberFormat();
  
      // --- Standard Drawing Setup ---
      const { ctx } = chart;
      const typedChart = chart as Chart<'doughnut', number[], string>;
      const { top, right, bottom, left, width, height } = typedChart.chartArea;
      // Guard against zero width/height before calculating center
      if (width <= 0 || height <= 0) return;
      const centerX = left + width / 2;
      const centerY = top + height / 2;
  
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
  
      let topText = '';
      let bottomText = '';
      let displayData: SelectedSliceData = null;
  
      // --- Determine what data to display (Hover > Selected > Total logic) ---
      const activeElements = typedChart.getActiveElements();
  
      if (activeElements.length > 0) {
        // 1. Priority: Hovered Element
        const { index, datasetIndex } = activeElements[0];
        if (typedChart.data.labels && typedChart.data.datasets[datasetIndex]?.data) {
          const label = typedChart.data.labels[index] as string;
          const value = typedChart.data.datasets[datasetIndex].data[index] as number;
          displayData = { label, value };
        }
      } else if (currentSelectedData) {
        // 2. Fallback: Selected Element (from options.selectedData)
        displayData = currentSelectedData;
      }
  
      // --- Draw Text (Using your specific styles/translations) ---
      if (displayData) {
        // Draw Selected/Hovered Data
        topText = tFish.has(displayData.label) ? currentTFish(displayData.label) : displayData.label;
        bottomText = currentFormatter.format(displayData.value);
  
        // Style for Species Label (Top)
        ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(topText, centerX, centerY - 15);
  
        // Style for Species Count Text (Bottom)
        ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(bottomText, centerX, centerY + 20);
  
      } else {
        // Draw Total Text
        let visibleTotal = 0;
        const dataPoints = typedChart.data.datasets[0]?.data;
        if (Array.isArray(dataPoints)) {
          dataPoints.forEach((_, index) => {
            if (typedChart.getDataVisibility(index)) {
              visibleTotal += dataPoints[index] as number;
            }
          });
        }
  
        topText = currentT('Common.Total');
        bottomText = currentFormatter.format(visibleTotal);
  
        // Style for "Total" Label (Top)
        ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(topText, centerX, centerY - 15);
  
        // Style for Total Count (Bottom) 
        ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(bottomText, centerX, centerY + 20);
      }
  
      ctx.restore();
    }
  };

  const chartJsData: ChartData<'doughnut'> = useMemo(() => ({
    labels: preparedData.labels,
    datasets: [{
      data: preparedData.counts,
      backgroundColor: preparedData.backgroundColors,
      hoverBackgroundColor: preparedData.backgroundColors,
      hoverBorderWidth: 3,
      hoverBorderColor: 'white',
      hoverOffset: 50,
      borderColor: '#1b1b1b',
      borderWidth: 5,
      borderRadius: 5,
    }]
  }), [preparedData]);

  const chartOptions: ChartOptions<'doughnut'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1,
    layout: {
      padding: 24
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
      centerTextPlugin: {
        selectedData: selectedSliceData,
        translationFunc: t,
        fishTranslationFunc: tFish,
        formatter: numFormatter
      },
    },
    onClick: handleChartClick
  }), [handleChartClick, selectedSliceData, t, numFormatter]);

  return (
    <Stack h={'100%'} align='stretch' justify='center' pos={'relative'} gap={'xs'} p={0} pb={'xs'}>
      <Box>
        <div style={{ display: 'flex', width: '100%', height: '100%', maxWidth: 500, justifySelf: 'center' }}>
          <Doughnut
            ref={chartRef}
            data={chartJsData}
            options={chartOptions}
            plugins={[centerTextPluginDefinition]}
          />
        </div>
      </Box>
      <CustomHtmlLegend
        labels={preparedData.labels}
        colors={preparedData.backgroundColors}
        onItemClick={handleLegendItemClick}
        getItemVisibility={getItemVisibility}
      />
    </Stack>
  );
}