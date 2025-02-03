import { ValueFormatterParams } from 'ag-grid-community';

export function lengthFormatter(params: ValueFormatterParams) {
  return isNaN(params.value) || params.value === null ? '-' : `${params.value} cm`;
}

export function weightFormatter(params: ValueFormatterParams) {
  return isNaN(params.value) || params.value === null ? '-' : `${params.value} kg`;
}

export function upperCaseFormatter(params: ValueFormatterParams) {
  const value = params.value;
  if (!value) {
    return '-';
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function dateFormatter(params: ValueFormatterParams) {
  if (!params.value) return '-';
  const dateParts = params.value.split('-');
  if (dateParts.length !== 3) return params.value; // Return original value if format is unexpected
  // remove leading zeros
  dateParts[2] = dateParts[2].replace(/^0+/, '');
  dateParts[1] = dateParts[1].replace(/^0+/, '');
  return `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`;
}

export function customUnitComparator(valueA: number | null | undefined, valueB: number | null | undefined): number {
  // Check if valueA or valueB is NaN
  const isValueANaN = Number.isNaN(valueA);
  const isValueBNaN = Number.isNaN(valueB);

  if (isValueANaN && isValueBNaN) {
    return 0; // Both values are NaN
  } else if (isValueANaN) {
    return -1; // Only valueA is NaN
  } else if (isValueBNaN) {
    return 1; // Only valueB is NaN
  }

  return (valueA ?? 0) - (valueB ?? 0);
}