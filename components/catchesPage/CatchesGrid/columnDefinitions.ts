import { ColDef } from 'ag-grid-community';
import { LocationCellRenderer } from './LocationCellRenderer/LocationCellRenderer';
import { lengthFormatter, weightFormatter, upperCaseFormatter, dateFormatter, customUnitComparator } from '@/lib/utils/agGridUtils';
import { ICatch } from '@/lib/types/catch';
import { speciesCellRenderer } from './SpeciesCellRenderer/SpeciesCellRenderer';

export const getColumnDefs = (
  imageIconsEnabled: boolean, 
  speciesColumnWidth: number, 
  locationIconsEnabled: boolean, 
  locationColumnWidth: number,
  displayNameMap: { [userId: string]: string }
): ColDef[] => [
  { field: 'species', 
    headerName: 'Laji', 
    width: speciesColumnWidth, // 65 without and 95 with icon
    cellRenderer: speciesCellRenderer,
    cellRendererParams: {
      imageIconsEnabled, // Pass the value to the renderer
    },
  },
  {
    headerName: 'Kuva',
    field: 'image',
    valueGetter: (params) => params.data.images?.length > 0,
    cellRenderer: 'agCheckboxCellRenderer',
    filter: false,
    width: 75,
  },
  {
    field: 'length',
    headerName: 'Pituus',
    sortingOrder: ['desc', 'asc', null],
    comparator: customUnitComparator,
    width: 88,
    valueFormatter: lengthFormatter,
  },
  {
    field: 'weight',
    headerName: 'Paino',
    sortingOrder: ['desc', 'asc', null],
    comparator: customUnitComparator,
    width: 83,
    valueFormatter: weightFormatter,
  },
  {
    field: 'lure',
    headerName: 'Viehe',
    wrapText: true,
    autoHeight: true,
    width: 120,
    valueFormatter: upperCaseFormatter,
  },
  {
    field: 'location.bodyOfWater',
    headerName: 'Vesialue',
    wrapText: true,
    autoHeight: true,
    filter: true,
    width: 110,
    valueFormatter: upperCaseFormatter,
  },
  {
    field: 'location',
    headerName: 'Paikka',
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
      textFormatter: (value: ICatch['location']['spot'] | null) =>
        value?.toLowerCase() || '',
    },
  },
  { 
    field: 'time', 
    headerName: 'Aika', 
    width: 75 },
  { 
    field: 'date', 
    headerName: 'Pvm.', 
    width: 90, 
    valueFormatter: dateFormatter, 
    filter: true },
  { 
    field: 'caughtBy', 
    headerName: 'Kalastaja', 
    width: 85, valueFormatter: 
    upperCaseFormatter, 
    valueGetter: (params) => 
      params.data.caughtBy?.userId && displayNameMap[params.data.caughtBy.userId] 
        ? displayNameMap[params.data.caughtBy.userId] 
        : params.data.caughtBy.name
  },
];