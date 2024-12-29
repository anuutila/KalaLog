'use client';

import { AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ColDef,
  GridReadyEvent,
} from 'ag-grid-community';

import './page.css';
import classes from './page.module.css';

import { ICatch } from '@lib/types/catch';
import {
  ActionIcon,
  Box,
  Button,
  Container,
  Stack,
  useCombobox,
} from '@mantine/core';
import { IconAdjustments } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { getColumnDefs } from '@/components/catchesPage/CatchesGrid/columnDefinitions';
import { defaultVisibleColumns, displayLabelToFieldMap, FieldIdentifier, fieldToDisplayLabelMap, years } from '@/components/catchesPage/constants';
import { getColumnOptions, getSelectAllOption, getYearOptions } from '@/components/catchesPage/optionGenerators';
import TableSettingsDrawer from '@/components/catchesPage/TableSettingsDrawer/TableSettingsDrawer';
import CatchesOverview from '@/components/catchesPage/CatchesOverview/CatchesOverview';
import CatchesGrid from '@/components/catchesPage/CatchesGrid/CatchesGrid';
import { useHeaderActions } from '@/context/HeaderActionsContext';

export default function CatchesPage() {
  const gridRef = useRef<AgGridReact<ICatch>>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { setActions } = useHeaderActions();

  const [filteredCatches, setFilteredCatches] = useState<ICatch[]>([]);
  const [rowCount, setRowCount] = useState<number>(0);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [opened, { open, close }] = useDisclosure(false);
  const [filtersSliderChecked, setFiltersSliderChecked] = useState(false);

  const [colDefs, setColDefs] = useState<ColDef<ICatch>[]>(getColumnDefs());
  const [defaultColDef, setDefaultColDef] = useState<ColDef>({
    sortable: true,
    filter: false,
    resizable: false,
    suppressHeaderFilterButton: true
  });
  
  const onGridReady = useCallback((params: GridReadyEvent) => {
    // Initial call to set the year filter
    applyYearFilter(selectedYear);
    // Initial call to set the default column visibilities
    applyColumnVisibility();
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

  useEffect(() => {
    // Set the header actions for this page
    setActions(
      <ActionIcon variant='default' onClick={open}><IconAdjustments size={20} /></ActionIcon>
    );

    // Cleanup when leaving the page
    return () => setActions(null);
  }, []);

  const updateRowCount = useCallback(() => {
    const count = gridRef.current!.api.getDisplayedRowCount();
    setRowCount(count);
  }, []);

  const updateFilteredCatches = useCallback(() => {
    const nodes: ICatch[] = [];
    gridRef.current!.api.forEachNodeAfterFilter((node) => {
      if (node.data) {
        nodes.push(node.data);
      }
    });
    setFilteredCatches(nodes);
  }, []);

  const updateRowCountAndFilteredCatches = useCallback(() => {
    updateRowCount();
    updateFilteredCatches();
  }, [updateRowCount, updateFilteredCatches]);

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
  }, [selectedYear]);

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

      // Hide all columns
      api.setColumnsVisible(Object.values(FieldIdentifier), false);

      // Show only selected columns
      const visibleFields = visibleColumns
        .map((header) => displayLabelToFieldMap[header])
        .filter(Boolean);
      api.setColumnsVisible(visibleFields, true);

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
  }, [visibleColumns]);

  const handleValueSelect = (val: string) => {
    if (val === 'Valitse kaikki') {
      if (visibleColumns.length === colDefs.length) {
        setVisibleColumns([]);
      } else {
        setVisibleColumns(Object.values(fieldToDisplayLabelMap));
      }
    } else {
      setVisibleColumns((current) => {
        if (current.includes(val)) {
          return current.filter((v) => v !== val);
        }
        return [...current, val];
      });
    }
  };

  const selectAllOption = getSelectAllOption(visibleColumns, colDefs);
  const columnOptions = getColumnOptions(colDefs, visibleColumns, fieldToDisplayLabelMap);
  const yearOptions = getYearOptions(years, selectedYear);

  return (
    <Container p={0} className={classes.catches_page_content_wrapper}>

      <Stack pb={'md'} pt={'sm'} pl={0} pr={0} gap={'sm'} align='flex-start'>
        <TableSettingsDrawer
          opened={opened}
          close={close}
          visibleColumns={visibleColumns}
          handleValueSelect={handleValueSelect}
          columnsCombobox={columnsCombobox}
          columnOptions={columnOptions}
          selectAllOption={selectAllOption}
          yearCombobox={yearCombobox}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          yearOptions={yearOptions}
          filtersSliderChecked={filtersSliderChecked}
          setFiltersSliderChecked={setFiltersSliderChecked}
          setVisibleColumns={setVisibleColumns}
        />

        <Box pl={'xs'} visibleFrom='md'>
          <Button variant="default" onClick={open} radius={'md'} bg="var(--mantine-color-dark-7)" leftSection={<IconAdjustments size={20} />}>
            Taulukon asetukset
          </Button>
        </Box>

        <CatchesOverview
          selectedYear={selectedYear}
          rowCount={rowCount}
          filteredCatches={filteredCatches}
          scrollRef={scrollRef}
        />
      </Stack>

      <CatchesGrid
        gridRef={gridRef}
        colDefs={colDefs}
        defaultColDef={defaultColDef}
        updateRowCountAndFilteredCatches={updateRowCountAndFilteredCatches}
        onGridReady={onGridReady}
      />

    </Container>
  );
}