export enum ChartColorsRGB {
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

export enum ChartColorsRGBA {
  blue = 'rgba(34, 139, 230, 1)',   // from #228be6
  red = 'rgba(250, 82, 82, 1)',    // from #fa5252
  yellow = 'rgba(250, 176, 5, 1)',   // from #fab005
  green = 'rgba(64, 192, 87, 1)',   // from #40c057
  violet = 'rgba(121, 80, 242, 1)',  // from #7950f2
  orange = 'rgba(253, 126, 20, 1)',  // from #fd7e14
  pink = 'rgba(230, 73, 128, 1)',   // from #e64980
  cyan = 'rgba(21, 170, 191, 1)',   // from #15aabf
  lime = 'rgba(130, 201, 30, 1)',   // from #82c91e
  indigo = 'rgba(76, 110, 245, 1)',  // from #4c6ef5
  teal = 'rgba(18, 184, 134, 1)',   // from #12b886
  gray = 'rgba(233, 236, 239, 1)',  // from #e9ecef
}

export enum ChartColorsDimmedRGBA {
  blue = 'rgba(34, 139, 230, 0.6)',   // from #228be6
  red = 'rgba(250, 82, 82, 0.6)',    // from #fa5252
  yellow = 'rgba(250, 176, 5, 0.6)',   // from #fab005
  green = 'rgba(64, 192, 87, 0.6)',   // from #40c057
  violet = 'rgba(121, 80, 242, 0.6)',  // from #7950f2
  orange = 'rgba(253, 126, 20, 0.6)',  // from #fd7e14
  pink = 'rgba(230, 73, 128, 0.6)',   // from #e64980
  cyan = 'rgba(21, 170, 191, 0.6)',   // from #15aabf
  lime = 'rgba(130, 201, 30, 0.6)',   // from #82c91e
  indigo = 'rgba(76, 110, 245, 0.6)',  // from #4c6ef5
  teal = 'rgba(18, 184, 134, 0.6)',   // from #12b886
  gray = 'rgba(233, 236, 239, 0.6)',  // from #e9ecef
}

export enum BarChartBgColors {
  blue = 'rgb(31, 94, 149)',
  red = 'rgb(161, 60, 60)',
  yellow = 'rgb(161, 117, 14)',
  green = 'rgb(49, 126, 63)',
  violet = 'rgb(84, 59, 156)',
  orange = 'rgb(163, 87, 23)',
  pink = 'rgb(149, 55, 88)',
  cyan = 'rgb(24, 113, 126)',
  lime = 'rgb(89, 132, 29)',
  indigo = 'rgb(57, 77, 158)',
  teal = 'rgb(22, 121, 91)',
  gray = 'rgb(151, 153, 154)',
}

export const fixedColorMap: Record<string, string> = {
  'Kuha': ChartColorsRGBA.blue,
  'Ahven': ChartColorsRGBA.red,
  'Hauki': ChartColorsRGBA.green,
  'Lahna': ChartColorsRGBA.yellow,
  'Särki': ChartColorsRGBA.violet,
  'Kiiski': ChartColorsRGBA.orange,
};

export const fixedColorMapDimmed: Record<string, string> = {
  'Kuha': ChartColorsDimmedRGBA.blue,
  'Ahven': ChartColorsDimmedRGBA.red,
  'Hauki': ChartColorsDimmedRGBA.green,
  'Lahna': ChartColorsDimmedRGBA.yellow,
  'Särki': ChartColorsDimmedRGBA.violet,
  'Kiiski': ChartColorsDimmedRGBA.orange,
}

export const fixedBarChartBgColorMap: Record<string, string> = {
  'Kuha': BarChartBgColors.blue,
  'Ahven': BarChartBgColors.red,
  'Hauki': BarChartBgColors.green,
  'Lahna': BarChartBgColors.yellow,
  'Särki': BarChartBgColors.violet,
  'Kiiski': BarChartBgColors.orange,
};
  