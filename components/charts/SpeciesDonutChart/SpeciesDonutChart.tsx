import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartData, ChartOptions, Plugin, ChartEvent, ActiveElement, Chart, TooltipItem } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ICatch } from '@/lib/types/catch';
import CustomHtmlLegend from './CustomHtmlLegend';
import { Box, Stack } from '@mantine/core';
import { ChartColorsDimmedRGBA, ChartColorsRGBA, fixedColorMap, fixedColorMapDimmed } from '../chartConstants';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const OTHER_THRESHOLD_PERCENTAGE = 2.0; // Group species < 2% of total
const OTHER_BG_COLOR = ChartColorsDimmedRGBA.gray;
const OTHER_BORDER_COLOR = ChartColorsRGBA.gray;

const SPACER_ANGLE_DEGREES = 5.0;
const INITIAL_SPACER_VALUE = 1

interface GroupedDetail {
  label: string;
  count: number;
}

function prepareChartDataJs(catches: ICatch[], otherLabelString: string): {
  labels: string[];
  counts: number[];
  backgroundColors: string[];
  borderColors: string[];
  borderHoverColors: string[];
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
    return { labels: [], counts: [], backgroundColors: [], borderColors: [], borderHoverColors: [], groupedDetails: [] };
  }

  const allBgColors = Object.values(ChartColorsDimmedRGBA);
  const allBorderColors = Object.values(ChartColorsRGBA);
  const fixedBgColorsUsed = new Set(Object.values(fixedColorMapDimmed));
  const fixedBorderColorsUsed = new Set(Object.values(fixedColorMap));
  let remainingBgColors = allBgColors.filter(color => !fixedBgColorsUsed.has(color));
  let remainingBorderColors = allBorderColors.filter(color => !fixedBorderColorsUsed.has(color));

  if (remainingBgColors.length === 0) remainingBgColors = [...allBgColors.filter(c => c !== OTHER_BG_COLOR)];
  if (remainingBorderColors.length === 0) remainingBorderColors = [...allBorderColors.filter(c => c !== OTHER_BORDER_COLOR)];

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

  const finalLabels: string[] = [];
  const finalCounts: number[] = [];
  const finalBackgroundColors: string[] = [];
  const finalBorderColors: string[] = [];
  const finalBorderHoverColors: string[] = [];

  // Interleave data with spacer segments
  for (let i = 0; i < labelsAboveThreshold.length; i++) {
    const label = labelsAboveThreshold[i];
    const count = speciesCount[label];

    finalLabels.push(label);
    finalCounts.push(count);
    finalBackgroundColors.push(fixedColorMapDimmed[label] || remainingBgColors[i % remainingBgColors.length]);
    finalBorderColors.push(fixedColorMap[label] || remainingBorderColors[i % remainingBorderColors.length]);
    finalBorderHoverColors.push('white');

    // Add spacer segment
    finalLabels.push('');
    finalCounts.push(INITIAL_SPACER_VALUE); // Small value for spacer
    finalBackgroundColors.push('rgba(0,0,0,0)'); // Transparent
    finalBorderColors.push('rgba(0,0,0,0)'); // Transparent
    finalBorderHoverColors.push('rgba(0,0,0,0)'); // Transparent
  }

  // Handle "Other" category if present
  if (otherCount > 0) {
    finalLabels.push(otherLabelString);
    finalCounts.push(otherCount);
    finalBackgroundColors.push(OTHER_BG_COLOR);
    finalBorderColors.push(OTHER_BORDER_COLOR);
    finalBorderHoverColors.push('white');

    // Add spacer after "Other"
    finalLabels.push('');
    finalCounts.push(INITIAL_SPACER_VALUE);
    finalBackgroundColors.push('rgba(0,0,0,0)');
    finalBorderColors.push('rgba(0,0,0,0)');
    finalBorderHoverColors.push('rgba(0,0,0,0)');
  }

  return {
    labels: finalLabels,
    counts: finalCounts,
    backgroundColors: finalBackgroundColors,
    borderColors: finalBorderColors,
    borderHoverColors: finalBorderHoverColors,
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

          if (label === '') {
            setSelectedSliceData(null); // Ignore spacer clicks
            return;
          }

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

  const handleLegendItemClick = (index: number) => {
    const chart = chartRef.current;
    if (!chart) return;

    const labels = chart.data.labels || [];
    // Ensure we are clicking a data arc
    const isDataArc = index < labels.length && labels[index] !== '';
    if (!isDataArc) {
        console.warn("Legend click on unexpected index or spacer:", index);
        return;
    }

    const spacerIndex = index + 1;
    const hasFollowingSpacer = spacerIndex < labels.length && labels[spacerIndex] === '';

    // Toggle visibilities
    chart.toggleDataVisibility(index);
    if (hasFollowingSpacer) {
        chart.toggleDataVisibility(spacerIndex);
    }

    // Trigger chart update - the plugin will run before this completes
    chart.update();

    // Update React state for legend UI styling
    setVisibility(prev => ({
        ...prev,
        [index]: chart.getDataVisibility(index)
    }));

    // Reset center text selection
    setSelectedSliceData(null);
};

  const calculateSpacerValue = useCallback((chart: Chart<'doughnut'> | null): number => {
    if (!chart || !chart.data.datasets || !chart.data.datasets[0]?.data) {
      return 0.001; // Minimal value if chart/data not ready
    }

    const dataset = chart.data.datasets[0];
    const data = dataset.data;
    const labels = chart.data.labels || [];
    const totalCircumferenceDegrees = chart.config.options?.circumference || 360;

    let totalVisibleDataValue = 0;
    let visibleDataArcCount = 0;

    for (let i = 0; i < data.length; i++) {
      if (labels[i] !== '' && chart.getDataVisibility(i)) { // Check NOT spacer AND visible
        const value = data[i];
        if (typeof value === 'number') {
          totalVisibleDataValue += value;
          visibleDataArcCount++;
        }
      }
    }

    if (visibleDataArcCount === 0 || totalVisibleDataValue <= 0) {
      return 0.001;
    }

    const totalSpacerAngle = visibleDataArcCount * SPACER_ANGLE_DEGREES;

    if (totalSpacerAngle >= totalCircumferenceDegrees) {
      console.warn("Total spacer angle exceeds chart circumference!");
      return 0.001;
    }

    const totalDataAngle = totalCircumferenceDegrees - totalSpacerAngle;

    // Ensure totalDataAngle is positive to avoid division by zero or negative numbers
    if (totalDataAngle <= 0) {
      console.warn("Total data angle is zero or negative after accounting for spacers!");
      return 0.001;
    }

    const valuePerDegree = totalVisibleDataValue / totalDataAngle;
    const spacerValue = SPACER_ANGLE_DEGREES * valuePerDegree;

    return Math.max(spacerValue, 0.001);
  }, []); 

  const dynamicSpacerPlugin: Plugin<'doughnut'> = useMemo(() => ({
    id: 'dynamicSpacerPlugin',
    beforeUpdate: (chart) => {
      const typedChart = chart as Chart<'doughnut'>;
      if (!typedChart.data.datasets || !typedChart.data.datasets[0]?.data) {
        return;
      }

      const calculatedSpacerValue = calculateSpacerValue(typedChart);

      const data = typedChart.data.datasets[0].data;
      const labels = typedChart.data.labels || [];

      // Update the data array directly for all spacer elements
      for (let i = 0; i < data.length; i++) {
        if (labels[i] === '') {
          if (Math.abs((data[i] as number) - calculatedSpacerValue) > 0.0001) {
            data[i] = calculatedSpacerValue;
            // No need to track 'changed' or call update,
            // the plugin runs *during* the update process.
          }
        }
      }
    }
  }), [calculateSpacerValue]);

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
      if (displayData && displayData.label !== '') {
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
        const labels = typedChart.data.labels || [];

        if (Array.isArray(dataPoints)) {
          dataPoints.forEach((_, index) => {
            // Check visibility AND if it's NOT a spacer
            if (labels[index] !== '' && typedChart.getDataVisibility(index)) {
              const value = dataPoints[index];
              if (typeof value === 'number') {
                visibleTotal += value; // Only add actual data values
              }
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
      borderColor: preparedData.borderColors,
      hoverBackgroundColor: preparedData.borderColors,
      hoverBorderWidth: 3,
      hoverBorderColor: preparedData.borderHoverColors,
      hoverBorderDashOffset: 10,
      hoverOffset: 50,
      borderWidth: 3,
      cutout: '60%',
      // spacing: 20,
      borderRadius: 5,
      borderJoinStyle: 'round',
      borderAlign: 'center',
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
            plugins={[centerTextPluginDefinition, dynamicSpacerPlugin]}
          />
        </div>
      </Box>
      <CustomHtmlLegend
        labels={preparedData.labels}
        colors={preparedData.borderColors}
        onItemClick={handleLegendItemClick}
        getItemVisibility={getItemVisibility}
      />
    </Stack>
  );
}