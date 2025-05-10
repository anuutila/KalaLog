import { ColDef } from 'ag-grid-community';
import { Checkbox, CheckIcon, Combobox, Group } from '@mantine/core';
import { DEFAULT_BODY_OF_WATER } from '@/lib/constants/constants';
import { ICatch } from '@/lib/types/catch';
import { FieldIdentifier, fieldToIconMap } from './constants';
import { getSecondaryMetricIcon, PrimaryMetric, SecondaryMetric } from '../charts/LeaderboardBarChart/LeaderboardBarChart';
import { capitalizeFirstLetter } from '@/lib/utils/utils';

const currentYear = new Date().getFullYear();

export const getColumnOptions = (
  colDefs: ColDef<ICatch>[],
  visibleColumns: string[],
  displayLabelMap: Record<FieldIdentifier, string>,
  t: any
) =>
  colDefs.map((col) => {
    const field: string = col.field ?? '?';
    const header: string = col.headerName ?? '?';
    const Icon = fieldToIconMap[field as FieldIdentifier];
    const displayLabel = displayLabelMap[field as FieldIdentifier] ?? header;

    return (
      <Combobox.Option value={displayLabel} key={header} active={visibleColumns.includes(header)}>
        <Group gap="xs">
          <Checkbox
            checked={visibleColumns.includes(displayLabel)}
            onChange={() => { }}
            aria-hidden
            tabIndex={-1}
            style={{ pointerEvents: 'none' }}
          />
          <Icon size={20} />
          <span>{t(displayLabel)}</span>
        </Group>
      </Combobox.Option>
    );
  });

export const getYearOptions = (years: string[], selectedYear: string | null = currentYear.toString(), t: any) =>
  years.map((item) => (
    <Combobox.Option value={item} key={item} active={selectedYear === item}>
      <Group gap="sm">
        {selectedYear === item ? <CheckIcon size={12} /> : null}
        <span>{item === 'AllYears' ? t('CatchesPage.TableSettings.AllYears') : item}</span>
      </Group>
    </Combobox.Option>
  ));

export const getBodyOfWaterOptions = (
  bodiesOfWater: string[],
  selectedBodyOfWater: string | null = DEFAULT_BODY_OF_WATER,
  t: any
) =>
  bodiesOfWater.map((item) => (
    <Combobox.Option value={item} key={item} active={selectedBodyOfWater === item}>
      <Group gap="sm">
        {selectedBodyOfWater === item ? <CheckIcon size={12} /> : null}
        <span>{item === 'AllBodiesOfWater' ? t('CatchesPage.TableSettings.AllBodiesOfWater') : item}</span>
      </Group>
    </Combobox.Option>
  ));

export const getSelectAllOption = (value: string, visibleColumns: string[], colDefs: ColDef<ICatch>[]) => (
  <Combobox.Option value={value} key="selectAll" active={visibleColumns.length === colDefs.length}>
    <Group gap="xs">
      <Checkbox
        checked={visibleColumns.length === colDefs.length}
        onChange={() => { }}
        aria-hidden
        tabIndex={-1}
        style={{ pointerEvents: 'none' }}
      />
      <span>{value}</span>
    </Group>
  </Combobox.Option>
);

export const getPrimaryMetricOptions = (metrics: string[], primaryMetric: PrimaryMetric | null = 'totalCatches', t: any) =>
  metrics.map((metric, index) => (
    <Combobox.Option value={metric} key={metric} active={primaryMetric === metric}>
      <Group gap="sm">
        {primaryMetric === metric ? <CheckIcon size={12} /> : null}
        <span>{['pike', 'zander', 'perch'].includes(metric) ? t(`Fish.${capitalizeFirstLetter(metric)}`) : t(`StatisticsPage.${capitalizeFirstLetter(metric)}`)}</span>
      </Group>
    </Combobox.Option>
  ));

export const getSecondaryMetricOptions = (metrics: SecondaryMetric[], secondaryMetric: SecondaryMetric = 'count', t: any) =>
  metrics.map((metric, index) => (
    <Combobox.Option value={metric} key={metric} active={secondaryMetric === metric}>
      <Group gap="sm">
        {secondaryMetric === metric ? <CheckIcon size={12} /> : null}
        <Group gap={4}>
          {getSecondaryMetricIcon(metric)}
          <span>
            {t(`StatisticsPage.${capitalizeFirstLetter(metric)}`)}
          </span>
        </Group>
      </Group>
    </Combobox.Option>
  ));