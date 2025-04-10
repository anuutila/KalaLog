import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartData, ChartOptions, Plugin, ChartEvent, ActiveElement, Chart, TooltipItem } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ICatch } from '@/lib/types/catch';
import CustomHtmlLegend from './CustomHtmlLegend';
import { Box, Stack } from '@mantine/core';
import { ChartColorsRGB, fixedColorMap } from '../chartConstants';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const OTHER_THRESHOLD_PERCENTAGE = 2.0; // Group species < 2% of total
const OTHER_COLOR = ChartColorsRGB.gray;

interface GroupedDetail {
  label: string;
  count: number;
}

function prepareChartDataJs(catches: ICatch[], otherLabelString: string): {
  labels: string[];
  counts: number[];
  backgroundColors: string[];
  groupedDetails: GroupedDetail[];
} {
  const speciesCount: Record<string, number> = {};
  let totalCount = 0;
  catches.forEach(({ species }) => {
    if (species) {
      const count = (speciesCount[species] || 0) + 1;
      speciesCount[species] = count;
      totalCount++;
    }
  });

  if (totalCount === 0) {
    return { labels: [], counts: [], backgroundColors: [], groupedDetails: [] };
  }

  const allEnumColors = Object.values(ChartColorsRGB);
  const fixedColorsUsed = new Set(Object.values(fixedColorMap));
  let remainingColors = allEnumColors.filter(color => !fixedColorsUsed.has(color));
  if (remainingColors.length === 0) remainingColors = [...allEnumColors.filter(c => c !== OTHER_COLOR)];

  // Separate Species Above/Below Threshold & Collect "Other" Details
  const labelsAboveThreshold: string[] = [];
  let otherCount = 0;
  const groupedItems: GroupedDetail[] = [];
  const thresholdValue = totalCount * (OTHER_THRESHOLD_PERCENTAGE / 100);

  Object.entries(speciesCount).forEach(([species, count]) => {
      if (count < thresholdValue && totalCount > 0) {
          otherCount += count;
          groupedItems.push({ label: species, count: count });
      } else {
          labelsAboveThreshold.push(species);
      }
  });

  // Sort Labels Above Threshold by Count
  labelsAboveThreshold.sort((a, b) => speciesCount[b] - speciesCount[a]);

  // Prepare Final Labels & Counts (including "Other" if needed)
  const finalLabels = [...labelsAboveThreshold];
  const finalCounts = labelsAboveThreshold.map(label => speciesCount[label]);

  if (otherCount > 0) {
      finalLabels.push(otherLabelString);
      finalCounts.push(otherCount);
      // Sort the details alphabetically
      groupedItems.sort((a, b) => b.count - a.count);
  }

  // Assign Colors
  let remainingColorIndex = 0;
  const finalBackgroundColors = finalLabels.map(label => {
      if (label === otherLabelString) {
          return OTHER_COLOR;
      } else if (fixedColorMap[label]) {
          return fixedColorMap[label];
      } else {
          const color = remainingColors[remainingColorIndex % remainingColors.length];
          remainingColorIndex++;
          return color;
      }
  });

  return {
      labels: finalLabels,
      counts: finalCounts,
      backgroundColors: finalBackgroundColors,
      groupedDetails: groupedItems
  };
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
  const translatedOtherLabel = t('Common.Other');
  const chartRef = useRef<ChartJS<'doughnut'>>(null);
  const componentContainerRef = useRef<HTMLDivElement>(null);
  const preparedData = useMemo(() => prepareChartDataJs(catches, translatedOtherLabel), [catches, translatedOtherLabel]);
  const [visibility, setVisibility] = useState<Record<number, boolean>>({});
  const [selectedSliceData, setSelectedSliceData] = useState<SelectedSliceData>(null);

  Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji';
  Chart.defaults.font.size = 16;

  useEffect(() => {
    // Handler checks if the event target is outside the component's container
    function handleInteractionOutside(event: MouseEvent | TouchEvent) {
      if (
        componentContainerRef.current &&
        !componentContainerRef.current.contains(event.target as Node) // Check if target is outside container
      ) {
        // Interaction occurred outside - deselect any active slice
        setSelectedSliceData(null);
      }
    }

    document.addEventListener('mousedown', handleInteractionOutside);
    document.addEventListener('touchstart', handleInteractionOutside);

    return () => {
      document.removeEventListener('mousedown', handleInteractionOutside);
      document.removeEventListener('touchstart', handleInteractionOutside);
    };
  }, []);

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
      groupedDetails: preparedData.groupedDetails,
      animation: {
        duration: 400,
      }
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
      tooltip: {
        enabled: true,
        // Filter: Only show tooltip for the "Other" slice
        filter: function (tooltipItem: TooltipItem<'doughnut'>) {
          // Check the label of the item being hovered
          return tooltipItem.label === t('Common.Other');
        },
        callbacks: {
          // Tooltip Title
          title: function (context) {
            if (context[0]?.label !== translatedOtherLabel) {
              return '';
            } else {
             return translatedOtherLabel;
            }
          },
          // Main label: Hide the default "Other: count" line
          label: function (tooltipItem: TooltipItem<'doughnut'>) {
            return ''; // Return empty string to hide default label line
          },
          // After Body: Add custom lines for each grouped item
          afterBody: function (context) {
            const tooltipItem = context[0];
            if (!tooltipItem) return [];

            // Access the custom details stored on the dataset
            const details = (tooltipItem.dataset as any).groupedDetails as GroupedDetail[] | undefined;

            if (!details || details.length === 0) {
              return ['Empty'];
            }

            // Limit the number of items shown if desired (e.g., top 10)
            // const maxItemsToShow = 10;
            // const itemsToShow = details.slice(0, maxItemsToShow);
            const itemsToShow = details; // Show all for now

            const bodyLines = itemsToShow.map(item => {
              const speciesName = tFish.has(item.label) ? tFish(item.label) : item.label;
              const formattedCount = numFormatter.format(item.count);
              return `  ${speciesName}: ${formattedCount}`; // Indent slightly
            });

            return bodyLines;
          }
        }
      },
      centerTextPlugin: {
        selectedData: selectedSliceData,
        translationFunc: t,
        fishTranslationFunc: tFish,
        formatter: numFormatter
      },
      datalabels: {
        display: false
      },
    },
    onClick: handleChartClick
  }), [handleChartClick, selectedSliceData, t, tFish, numFormatter]);

  return (
    <Stack h={'100%'} align='stretch' justify='center' pos={'relative'} gap={'xs'} p={0} pb={'xs'}>
      <Box>
        <div ref={componentContainerRef} 
        style={{ 
          display: 'flex', 
          width: '100%', 
          height: '100%', 
          maxWidth: 500, 
          justifySelf: 'center', 
          userSelect: 'none'
        }}>
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