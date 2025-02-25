import { ColDef } from 'ag-grid-community';
import { ICatch } from '@/lib/types/catch';
import {
  customUnitComparator,
  dateFormatter,
  lengthFormatter,
  upperCaseFormatter,
  weightFormatter,
} from '@/lib/utils/agGridUtils';
import { LocationCellRenderer } from './LocationCellRenderer/LocationCellRenderer';
import { speciesCellRenderer } from './SpeciesCellRenderer/SpeciesCellRenderer';

export const getColumnDefs = (
  imageIconsEnabled: boolean,
  speciesColumnWidth: number,
  locationIconsEnabled: boolean,
  locationColumnWidth: number,
  displayNameMap: { [userId: string]: string },
  t: any
): ColDef[] => [
  {
    field: 'species',
    headerName: t('Common.Species'),
    width: speciesColumnWidth, // 65 without and 95 with icon
    cellRenderer: speciesCellRenderer,
    cellRendererParams: {
      imageIconsEnabled, // Pass the value to the renderer
    },
  },
  {
    headerName: t('Common.Picture'),
    field: 'image',
    valueGetter: (params) => params.data.images?.length > 0,
    cellRenderer: 'agCheckboxCellRenderer',
    filter: false,
    width: 75,
  },
  {
    field: 'length',
    headerName: t('Common.Length'),
    sortingOrder: ['desc', 'asc', null],
    comparator: customUnitComparator,
    width: 88,
    valueFormatter: lengthFormatter,
  },
  {
    field: 'weight',
    headerName: t('Common.Weight'),
    sortingOrder: ['desc', 'asc', null],
    comparator: customUnitComparator,
    width: 83,
    valueFormatter: weightFormatter,
  },
  {
    field: 'lure',
    headerName: t('Common.Lure'),
    wrapText: true,
    autoHeight: true,
    width: 120,
    valueFormatter: upperCaseFormatter,
  },
  {
    field: 'location.bodyOfWater',
    headerName: t('Common.BodyOfWater'),
    wrapText: true,
    autoHeight: true,
    filter: true,
    width: 110,
    valueFormatter: upperCaseFormatter,
  },
  {
    field: 'location',
    headerName: t('Common.Spot'),
    wrapText: true,
    autoHeight: true,
    width: locationColumnWidth, // 120 without and 150 with icon
    cellClass: 'location-cell-custom-class',
    cellRenderer: LocationCellRenderer,
    cellRendererParams: {
      locationIconsEnabled,
    },
    valueGetter: (params) => params.data.location?.spot || '-',
    filter: 'agTextColumnFilter',
    filterParams: {
      textFormatter: (value: ICatch['location']['spot'] | null) => value?.toLowerCase() || '',
    },
  },
  {
    field: 'time',
    headerName: t('Common.Time'),
    width: 75,
  },
  {
    field: 'date',
    headerName: t('Common.DateShort'),
    width: 90,
    valueFormatter: dateFormatter,
    filter: true,
  },
  {
    field: 'caughtBy',
    headerName: t('Common.CaughtBy'),
    width: 85,
    valueFormatter: upperCaseFormatter,
    valueGetter: (params) =>
      params.data.caughtBy?.userId && displayNameMap[params.data.caughtBy.userId]
        ? displayNameMap[params.data.caughtBy.userId]
        : params.data.caughtBy.name,
  },
];
