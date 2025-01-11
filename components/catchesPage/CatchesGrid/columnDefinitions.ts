import { ColDef } from 'ag-grid-community';
import { LocationCellRenderer } from './LocationCellRenderer/LocationCellRenderer';
import { lengthFormatter, weightFormatter, upperCaseFormatter, dateFormatter, customUnitComparator, locationComparator } from '@/lib/utils/agGridUtils';
import { ICatch } from '@/lib/types/catch';
import { speciesCellRenderer } from './SpeciesCellRenderer/SpeciesCellRenderer';

export const getColumnDefs = (): ColDef[] => [
  { field: 'species', 
    headerName: 'Laji', 
    width: 95, 
    cellRenderer: speciesCellRenderer,
  },
  {
    headerName: 'Kuva',
    field: 'image',
    valueGetter: (params) => params.data.images?.length > 0,
    cellRenderer: 'agCheckboxCellRenderer',
    filter: false,
    width: 60,
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
    field: 'location',
    headerName: 'Paikka',
    wrapText: true,
    autoHeight: true,
    width: 150,
    cellRenderer: LocationCellRenderer,
    valueGetter: (params) => params.data.location?.spot || '-',
    filter: 'agTextColumnFilter',
    filterParams: {
      textFormatter: (value: ICatch['location']['spot'] | null) =>
        value?.toLowerCase() || '',
    },
  },
  { field: 'time', headerName: 'Aika', width: 75 },
  { field: 'date', headerName: 'Pvm.', width: 90, valueFormatter: dateFormatter, filter: true },
  { field: 'caughtBy.name', headerName: 'Kalastaja', width: 85, valueFormatter: upperCaseFormatter },
];
