import { ColDef } from 'ag-grid-community';
import { LocationCellRenderer } from './LocationCellRenderer/LocationCellRenderer';
import { lengthFormatter, weightFormatter, upperCaseFormatter, dateFormatter, customComparator } from '@/lib/utils/agGridUtils';

export const getColumnDefs = (): ColDef[] => [
  { field: 'species', headerName: 'Laji', width: 70, valueFormatter: upperCaseFormatter },
  {
    field: 'length',
    headerName: 'Pituus',
    sortingOrder: ['desc', 'asc', null],
    comparator: customComparator,
    width: 88,
    valueFormatter: lengthFormatter,
  },
  {
    field: 'weight',
    headerName: 'Paino',
    sortingOrder: ['desc', 'asc', null],
    comparator: customComparator,
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
    cellClass: ['location-cell-custom-class'],
  },
  { field: 'time', headerName: 'Aika', width: 75 },
  { field: 'date', headerName: 'Pvm.', width: 90, valueFormatter: dateFormatter, filter: true },
  { field: 'caughtBy.name', headerName: 'Saaja', width: 82, valueFormatter: upperCaseFormatter },
];
