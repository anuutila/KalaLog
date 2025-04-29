import { Chart, ScriptableContext } from "chart.js";

type BorderWidthObject = { top: number; right: number; bottom: number; left: number };

/**
 * Calculates the border width for stacked horizontal bar segments.
 * Skips the left border entirely.
 * Skips the right border if there is another non-zero segment
 * further down the stack for the same bar item.
 *
 * @param context - The Chart.js scriptable context.
 * @param defaultWidth - The desired border width for visible borders (e.g., 2).
 * @returns An object specifying border widths for top, right, bottom, left.
 */
export function getStackedBarBorderWidth(
  context: ScriptableContext<'bar'>,
  defaultWidth: number
): BorderWidthObject {
  const chart = context.chart as Chart<'bar'>;
  const currentDatasetIndex = context.datasetIndex;
  const currentDataIndex = context.dataIndex;

  if (!chart.data?.datasets || currentDataIndex === undefined || currentDataIndex < 0) {
    return { top: defaultWidth, right: defaultWidth, bottom: defaultWidth, left: 0 };
  }

  // Default border widths, assuming this segment is the last visible one
  let borderWidth: BorderWidthObject = {
    top: defaultWidth,
    right: defaultWidth,
    bottom: defaultWidth,
    left: 0 // Always skip left border
  };

  // Look ahead to see if subsequent datasets have a value for this bar index
  for (let i = currentDatasetIndex + 1; i < chart.data.datasets.length; i++) {
    const nextDataset = chart.data.datasets[i];
    const nextValue = nextDataset.data?.[currentDataIndex] as (number | null | undefined);
    if (nextValue !== null && nextValue !== undefined && nextValue !== 0) {
      // Found a non-zero value in a later dataset for this bar,
      // so the current segment is NOT the last visible one.
      borderWidth.right = 0; // Skip the right border
      break;
    }
  }

  return borderWidth;
}