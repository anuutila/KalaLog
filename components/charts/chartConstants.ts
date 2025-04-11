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

export const fixedColorMap: Record<string, string> = {
  'Kuha': ChartColorsRGB.blue,
  'Ahven': ChartColorsRGB.red,
  'Hauki': ChartColorsRGB.green,
  'Lahna': ChartColorsRGB.yellow,
  'Särki': ChartColorsRGB.violet,
  'Kiiski': ChartColorsRGB.orange,
};