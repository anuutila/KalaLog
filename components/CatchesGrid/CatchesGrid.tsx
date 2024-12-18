'use client';

import { AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ColDef,
  GridReadyEvent,
  SizeColumnsToContentStrategy,
  SizeColumnsToFitGridStrategy,
  SizeColumnsToFitProvidedWidthStrategy,
  ValueFormatterParams,
} from 'ag-grid-community';

import './CatchesGrid.css';
import classes from './CatchesGrid.module.css';

import { ICatch } from '@lib/types/catch';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  CheckIcon,
  Collapse,
  Combobox,
  Container,
  Drawer,
  Group,
  Input,
  InputBase,
  MultiSelect,
  Paper,
  Pill,
  PillsInput,
  ScrollArea,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
  useCombobox,
} from '@mantine/core';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import StatsBadges from './StatsBadges/StatsBadges';

interface CatchesGridProps {
  catches: ICatch[];
}

enum FieldIdentifier {
  Fish = 'fish',
  Length = 'length',
  Weight = 'weight',
  Lure = 'lure',
  Place = 'place',
  Time = 'time',
  Date = 'date',
  Person = 'person',
}

const fieldToDisplayLabelMap: Record<FieldIdentifier, string> = {
  [FieldIdentifier.Fish]: '🐟 Laji',
  [FieldIdentifier.Length]: '📏 Pituus',
  [FieldIdentifier.Weight]: '⚖️ Paino',
  [FieldIdentifier.Lure]: '🎣 Viehe',
  [FieldIdentifier.Place]: '📍 Paikka',
  [FieldIdentifier.Time]: '🕑 Aika',
  [FieldIdentifier.Date]: '📅 Pvm.',
  [FieldIdentifier.Person]: '🙋 Saaja',
};

const defaultVisibleColumns = [
  fieldToDisplayLabelMap[FieldIdentifier.Fish],
  fieldToDisplayLabelMap[FieldIdentifier.Length],
  fieldToDisplayLabelMap[FieldIdentifier.Weight],
  fieldToDisplayLabelMap[FieldIdentifier.Date],
  fieldToDisplayLabelMap[FieldIdentifier.Person]
];

const displayLabelToFieldMap: Record<string, FieldIdentifier> = Object.fromEntries(
  Object.entries(fieldToDisplayLabelMap).map(([field, label]) => [label, field as FieldIdentifier])
);

const years: string[] = ['2024', '2023', '2022', '2021', '2020', 'Kaikki vuodet'];

export default function CatchesGrid({ catches }: CatchesGridProps) {
  const gridRef = useRef<AgGridReact<ICatch>>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [filteredCatches, setFilteredCatches] = useState<ICatch[]>([]);
  const [rowCount, setRowCount] = useState<number>(0);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [opened, { open, close }] = useDisclosure(false);
  const [filtersSliderChecked, setFiltersSliderChecked] = useState(false);
  const [scrollState, setScrollState] = useState({
    isAtStart: true,
    isAtEnd: false,
  });

  const [colDefs, setColDefs] = useState<ColDef<ICatch>[]>([
    { field: 'fish', headerName: 'Laji', width: 70, valueFormatter: upperCaseFormatter },
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
      field: 'place',
      headerName: 'Paikka',
      wrapText: true,
      autoHeight: true,
      width: 120,
      valueFormatter: upperCaseFormatter,
    },
    { field: 'time', headerName: 'Aika', width: 75 },
    { field: 'date', headerName: 'Pvm.', width: 90, valueFormatter: dateFormatter, filter: true },
    { field: 'person', headerName: 'Saaja', width: 82, valueFormatter: upperCaseFormatter },
  ]);

  const [defaultColDef, setDefaultColDef] = useState<ColDef>({
    sortable: true,
    filter: false,
    resizable: false,
    suppressHeaderFilterButton: true
  });

  const defaultColDefWithFilters = useMemo<ColDef>(() => {
    return {
      sortable: true,
      filter: true,
      floatingFilter: true,
      resizable: false,
    };
  }, []);

  // const [currentColDef, setCurrentColDef] = useState<ColDef>(defaultColDef);

  // const [visibleColumns, setVisibleColumns] = useState<string[]>(['fish', 'length', 'weight']);
  // const columnOptions = colDefs.map((col) => ({ value: col.field, label: col.headerName }));

  // const handleColumnChange = (selectedColumns: string[]) => {
  //   setVisibleColumns(selectedColumns);
  //   const updatedColDefs = colDefs.filter((col) => selectedColumns.includes(col.field));
  //   gridRef.current!.api.setColumnDefs(updatedColDefs);
  // };

  function lengthFormatter(params: ValueFormatterParams) {
    return isNaN(params.value) ? '-' : `${params.value} cm`;
  }

  function weightFormatter(params: ValueFormatterParams) {
    return isNaN(params.value) ? '-' : `${params.value} kg`;
  }

  function upperCaseFormatter(params: ValueFormatterParams) {
    const value = params.value;
    if (typeof value === 'string' && value.length === 1) {
      return '-';
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function dateFormatter(params: ValueFormatterParams) {
    if (!params.value) return '-';
    const dateParts = params.value.split('-');
    if (dateParts.length !== 3) return params.value; // Return original value if format is unexpected
    return `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`;
  }

  function customComparator(valueA: number | null | undefined, valueB: number | null | undefined): number {
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

  const autoSizeStrategy = useMemo<
    SizeColumnsToFitGridStrategy | SizeColumnsToFitProvidedWidthStrategy | SizeColumnsToContentStrategy
  >(() => {
    return {
      type: 'fitCellContents',
    };
  }, []);

  const onGridReady = useCallback((params: GridReadyEvent) => {
    const updateRowCount = () => {
      const count = params.api.getDisplayedRowCount();
      setRowCount(count);
    };

    const updateFilteredCatches = () => {
      const nodes: ICatch[] = [];
      params.api.forEachNodeAfterFilter((node) => {
        nodes.push(node.data);
      });
      setFilteredCatches(nodes);
    }


    // Add event listeners for model updates
    params.api.addEventListener('modelUpdated', updateRowCount);
    params.api.addEventListener('modelUpdated', updateFilteredCatches);

    // Initial call to set the year filter
    applyYearFilter(selectedYear);

    // Initial call to set the default column visibilities
    applyColumnVisibility();

    // Cleanup function to remove the event listeners
    return () => {
      params.api.removeEventListener('modelUpdated', updateRowCount);
    };
  }, []);

  useEffect(() => {
    setDefaultColDef((prevColDef) => ({
      ...prevColDef,
      filter: filtersSliderChecked,
      floatingFilter: filtersSliderChecked,
    }));
  }, [filtersSliderChecked]);

  useEffect(() => {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.setGridOption('defaultColDef', defaultColDef);
    }
  }, [defaultColDef]);

  const handleYearChange = (year: string | null) => {
    setSelectedYear(year ?? new Date().getFullYear().toString());
  };

  const applyYearFilter = useCallback((year: string | null) => {
    if (year && year !== 'Kaikki vuodet') {
      const filterModel = {
        type: 'inRange',
        dateFrom: `${year}-01-01`,
        dateTo: `${year}-12-31`,
      };
      gridRef.current!.api.setColumnFilterModel('date', filterModel).then(() => {
        gridRef.current!.api.onFilterChanged();
      });
    } else {
      // Clear all filters if 'All Years' is selected
      gridRef.current!.api.setFilterModel(null);
    }
  }, []);

  useEffect(() => {
    if (gridRef.current && gridRef.current.api) {
      applyYearFilter(selectedYear);
    }
  }, [selectedYear, applyYearFilter]);

  const MAX_DISPLAYED_VALUES = 10;

  const columnsCombobox = useCombobox({
    onDropdownClose: () => columnsCombobox.resetSelectedOption(),
    onDropdownOpen: () => columnsCombobox.updateSelectedOptionIndex('active'),
  });
  
  const yearCombobox = useCombobox({
    onDropdownClose: () => yearCombobox.resetSelectedOption(),
    onDropdownOpen: () => yearCombobox.updateSelectedOptionIndex('active'),
  });

  const [visibleColumns, setVisibleColumns] = useState<string[]>(defaultVisibleColumns);

  const applyColumnVisibility = useCallback(() => {
    if (gridRef.current && gridRef.current.api) {
      const api = gridRef.current.api;
      const columnApi = gridRef.current.api;
  
      // Hide all columns
      columnApi.setColumnsVisible(Object.values(FieldIdentifier), false);
  
      // Show only selected columns
      const visibleFields = visibleColumns
        .map((header) => displayLabelToFieldMap[header])
        .filter(Boolean);
      columnApi.setColumnsVisible(visibleFields, true);
  
      adjustColumnFlex();
    }
  }, [gridRef, visibleColumns, displayLabelToFieldMap]);

  const adjustColumnFlex = () => {
    if (gridRef.current && gridRef.current.api) {
      const api = gridRef.current.api;
      // Calculate total width of visible columns
      const visibleColumnState = api.getAllDisplayedColumns();
      const totalVisibleWidth = visibleColumnState.reduce((total, column) => {
        return total + column.getColDef().width!;
      }, 0);

      // Get grid container width
      const gridContainer = document.querySelector('.grid-wrapper') as HTMLElement;
      const gridContainerWidth = gridContainer.clientWidth;

        // Update defaultColDef based on width comparison
        setDefaultColDef((prevColDef) => ({
          ...prevColDef,
          flex: totalVisibleWidth < gridContainerWidth ? 1 : 0,
        }));
    }
  };

  useEffect(() => {
    applyColumnVisibility();
  }, [visibleColumns, applyColumnVisibility]);

  const handleValueSelect = (val: string) =>
    setVisibleColumns((current) => (current.includes(val) ? current.filter((v) => v !== val) : [...current, val]));

  const handleValueRemove = (val: string) => setVisibleColumns((current) => current.filter((v) => v !== val));

  // Function to check scroll position
  const checkScrollPosition = () => {
    const el = scrollRef.current;
    if (el) {
      const isAtStart = el.scrollLeft <= 0;
      const isAtEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth;
      setScrollState({ isAtStart, isAtEnd });
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      // Check scroll position initially
      checkScrollPosition();
      // Add scroll event listener
      el.addEventListener("scroll", checkScrollPosition);
      return () => el.removeEventListener("scroll", checkScrollPosition);
    }
  }, [filteredCatches]);

  const values = visibleColumns
    .slice(0, MAX_DISPLAYED_VALUES === visibleColumns.length ? MAX_DISPLAYED_VALUES : MAX_DISPLAYED_VALUES - 1)
    .map((item) => (
      <Pill key={item} withRemoveButton onRemove={() => handleValueRemove(item)} fz={'var(--mantine-font-size-sm)'}>
        {item}
      </Pill>
    ));

  const columnOptions = colDefs.map((col) => {
    const field: string = col.field ?? '?';
    const header: string = col.headerName ?? '?'
    const displayLabel = fieldToDisplayLabelMap[field as FieldIdentifier] ?? header;

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
          <span>{displayLabel}</span>
        </Group>
      </Combobox.Option>
    );
  });

  const yearOptions = years.map((item) => (
    <Combobox.Option value={item} key={item} active={selectedYear === item}>
      <Group gap="sm">
          {selectedYear === item ? <CheckIcon size={12} /> : null}
          <span>{item}</span>
        </Group>
    </Combobox.Option>
  ));

  const fishBadges = Array.from(new Set(catches.map((c) => c.fish))).map((fish) => (
    <Badge key={fish} c="blue" variant="light">
      {fish}
    </Badge>
  ));

  return (
    <Container p={0} className={classes.catches_page_content_wrapper}>

      <Stack pb={'sm'} pt={'sm'} pl={'xs'} pr={'xs'} gap={'sm'} align='flex-start'>
        <Drawer.Root opened={opened} onClose={close} size="xs">
          <Drawer.Overlay />
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title fz={'var(--mantine-font-size-lg)'} fw='var(--mantine-heading-font-weight)'>Taulun asetukset</Drawer.Title>
              <Drawer.CloseButton />
            </Drawer.Header>
            <Drawer.Body>
              <Stack gap={'var(--mantine-spacing-lg)'}>
                <Combobox store={columnsCombobox} onOptionSubmit={handleValueSelect} withinPortal={false}>
                  <Combobox.DropdownTarget>
                    <PillsInput
                      classNames={{ label: classes.input_label}}
                      pointer
                      onClick={() => columnsCombobox.toggleDropdown()}
                      label="Näytä sarakkeet"
                      fz={'var(--mantine-font-size-md)'}
                      rightSection={<Combobox.Chevron />}
                      rightSectionPointerEvents="none"
                    >
                      <Pill.Group>
                        {visibleColumns.length > 0 ? (
                          <>
                            {values}
                            {visibleColumns.length > MAX_DISPLAYED_VALUES && (
                              <Pill>+{visibleColumns.length - (MAX_DISPLAYED_VALUES - 1)} muuta</Pill>
                            )}
                          </>
                        ) : (
                          <Input.Placeholder>Valitse yksi tai useampi</Input.Placeholder>
                        )}
                        <Combobox.EventsTarget>
                          {/* Replace the hidden input with a non-focusable div */}
                          <div
                            tabIndex={-1} // Ensure the div is not focusable
                            onBlur={() => columnsCombobox.closeDropdown()}
                          />
                        </Combobox.EventsTarget>
                      </Pill.Group>
                    </PillsInput>
                  </Combobox.DropdownTarget>
                  <Combobox.Dropdown>
                    <Combobox.Options>{columnOptions}</Combobox.Options>
                  </Combobox.Dropdown>
                </Combobox>

                <Combobox
                  store={yearCombobox}
                  onOptionSubmit={(val) => {
                    setSelectedYear(val);
                    yearCombobox.closeDropdown();
                  }}
                >
                  <Combobox.Target>
                    <InputBase
                      classNames={{ label: classes.input_label}}
                      label="Näytä saaliit vuodelta"
                      component="button"
                      type="button"
                      pointer
                      rightSection={<Combobox.Chevron />}
                      rightSectionPointerEvents="none"
                      onClick={() => yearCombobox.toggleDropdown()}
                    >
                      {selectedYear || <Input.Placeholder>Valitse vuosi</Input.Placeholder>}
                    </InputBase>
                  </Combobox.Target>

                  <Combobox.Dropdown>
                    <Combobox.Options>{yearOptions}</Combobox.Options>
                  </Combobox.Dropdown>
                </Combobox>
                <Switch
                  className={classes.switch_input_label}
                  checked={filtersSliderChecked}
                  fw={500}
                  label="Näytä suodattimet"
                  labelPosition='left'
                  onChange={(event) => setFiltersSliderChecked(event.currentTarget.checked)}
                />
                {/* <Button variant='default' onClick={toggleFilters}>
              {defaultColDef.floatingFilter ? 'Piilota suodattimet' : 'Näytä suodattimet'}
            </Button> */}
              </Stack>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Root>
        <Button variant="default" onClick={open} radius={'md'} bg="var(--mantine-color-dark-7)">
          Taulun asetukset
        </Button>

        <Card
          c="var(--mantine-color-text)"
          padding={0}
          radius="var(--mantine-spacing-sm)"
          bg="var(--mantine-color-dark-7)"
          w='100%'
          pb={'sm'}
        >
          <Stack p={'sm'} pb={6} gap={0}>
            <Text fw={600} c="white">Yhteenveto</Text>
            <Group gap="md">
              <Text>Kausi: {selectedYear}</Text>
              <Text>Saaliit: {rowCount}</Text>
            </Group>
          </Stack>

          <Box style={{ position: "relative" }}>
            <ScrollArea
              viewportRef={scrollRef}
              type="never"
            >
              <Group gap="xs" wrap="nowrap" pl={'sm'} pr={30}>
                <StatsBadges filteredCatches={filteredCatches} />
              </Group>
            </ScrollArea>

            {/* Dynamic Left Gradient */}
              <Box
                w="var(--mantine-spacing-sm)"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  height: "100%",
                  background: "linear-gradient(to right, var(--mantine-color-dark-7), transparent)",
                  pointerEvents: "none",
                }}
              />

            {/* Dynamic Right Gradient */}
              <Box
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  height: "100%",
                  width: "40px",
                  background: "linear-gradient(to left, var(--mantine-color-dark-7), transparent)",
                  pointerEvents: "none",
                }}
              />
          </Box>

        </Card>

      </Stack>
      
      <div className="ag-theme-quartz-dark grid-wrapper">
        <AgGridReact<ICatch>
          ref={gridRef}
          rowData={catches}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          // autoSizeStrategy={autoSizeStrategy}
          suppressDragLeaveHidesColumns={true}
          pagination={true}
          onGridReady={onGridReady}
        />
      </div>
    </Container>
  );
}
