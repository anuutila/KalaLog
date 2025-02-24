'use client';

import { AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  Text,
  useCombobox,
} from '@mantine/core';
import { IconAdjustments } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { getColumnDefs } from '@/components/catchesPage/CatchesGrid/columnDefinitions';
import { defaultVisibleColumns, displayLabelToFieldMap, FieldIdentifier, fieldToDisplayLabelMap } from '@/components/catchesPage/constants';
import { getBodyOfWaterOptions, getColumnOptions, getSelectAllOption, getYearOptions } from '@/components/catchesPage/optionGenerators';
import TableSettingsDrawer from '@/components/catchesPage/TableSettingsDrawer/TableSettingsDrawer';
import CatchesOverview from '@/components/catchesPage/CatchesOverview/CatchesOverview';
import CatchesGrid from '@/components/catchesPage/CatchesGrid/CatchesGrid';
import { useHeaderActions } from '@/context/HeaderActionsContext';
import { useGlobalState } from '@/context/GlobalState';
import CatchDetails from '@/components/catchesPage/CatchDetails/CatchDetails';
import { useRouter } from 'next/navigation';
import { DEFAULT_BODY_OF_WATER } from '@/lib/constants/constants';
import { CatchUtils } from '@/lib/utils/catchUtils';
import { useLocale, useTranslations } from 'next-intl';

const currentYear = new Date().getFullYear().toString();

enum SpeciesColWidths {
  WithIcon = 95,
  NoIcon = 65,
}

enum LocationColWidths {
  WithIcon = 150,
  NoIcon = 120,
}

const updateQueryParams = (selectedCatch: ICatch | null, router: ReturnType<typeof useRouter>) => {
  if (selectedCatch) {
    router.push(`?catchNumber=${selectedCatch.catchNumber}`, { scroll: false });
  } else {
    router.push('/', { scroll: false });
  }
}

export default function CatchesPage() {
  const locale = useLocale();
  const t = useTranslations();
  const gridRef = useRef<AgGridReact<ICatch>>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { setActions } = useHeaderActions();
  const { catches, catchesError, loadingCatches, displayNameMap } = useGlobalState();

  const [filteredCatches, setFilteredCatches] = useState<ICatch[]>([]);
  const [uniqueYears, setUniqueYears] = useState<string[]>([]);
  const [uniqueBodiesOfWater, setUniqueBodiesOfWater] = useState<string[]>([]);
  const [rowCount, setRowCount] = useState<number>(0);
  const [selectedBodyOfWater, setSelectedBodyOfWater] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [filtersEnabled, setFiltersEnabled] = useState(false);
  const [imageIconsEnabled, setImageIconsEnabled] = useState(false);
  const [locationIconsEnabled, setLocationIconsEnabled] = useState(false);
  const [selectedCatch, setSelectedCatch] = useState<ICatch | null>(null);
  const [catchDetailsOpen, setCatchDetailsOpen] = useState(false);
  const [colDefs, setColDefs] = useState<ColDef<ICatch>[]>(getColumnDefs(
    imageIconsEnabled, 
    SpeciesColWidths.NoIcon, 
    locationIconsEnabled, 
    LocationColWidths.NoIcon,
    displayNameMap,
    t
  )); 
  const [defaultColDef, setDefaultColDef] = useState<ColDef>({
    sortable: true,
    filter: false,
    resizable: false,
    suppressHeaderFilterButton: true
  });

  useEffect(() => {
    if (catches.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const catchNumber = params.get('catchNumber');
      if (catchNumber) {
        const catchData = catches.find(
          (catchItem) => catchItem.catchNumber.toString() === catchNumber
        );
        if (catchData) {
          setSelectedCatch(catchData);
        }
      }
    }
  }, [catches]);

  useEffect(() => {
    const newSpeciesColWidth = imageIconsEnabled ? SpeciesColWidths.WithIcon : SpeciesColWidths.NoIcon;
    const newLocationColWidth = locationIconsEnabled ? LocationColWidths.WithIcon : LocationColWidths.NoIcon;
    setColDefs(getColumnDefs(imageIconsEnabled, newSpeciesColWidth, locationIconsEnabled, newLocationColWidth, displayNameMap, t));
  }, [imageIconsEnabled, locationIconsEnabled, displayNameMap, locale]);
  
  const onGridReady = useCallback((params: GridReadyEvent) => {
    // Initial call to set the default column visibilities
    applyColumnVisibility();

    if (selectedYear) {
      applyYearFilter(selectedYear);
    }
    if (selectedBodyOfWater) {
      applyBodyOfWaterFilter(selectedBodyOfWater);
    }
  }, [selectedYear, selectedBodyOfWater]);

  useEffect(() => {
    if (catches.length > 0) {
      const uniqueYears = CatchUtils.getUniqueYearsForBodyOfWater(catches, DEFAULT_BODY_OF_WATER).map((item) => item.year);
      if (uniqueYears.length > 0) {
        setUniqueYears(uniqueYears);
        if (!selectedYear) {
          // Set the latest year as the default
          setSelectedYear(uniqueYears[0]);
        }
      } else {
        setUniqueYears([currentYear]);
        setSelectedYear(currentYear);
      }

      const uniqueBodiesOfWater = CatchUtils.getUniqueBodiesOfWater(catches);
      if (uniqueBodiesOfWater.length > 0) {
        setUniqueBodiesOfWater([...uniqueBodiesOfWater.map((item) => item.bodyOfWater)]);
        if (!selectedBodyOfWater) {
          // Set the body of water with most catches as the default
          setSelectedBodyOfWater(uniqueBodiesOfWater[0].bodyOfWater);
        }
      } else {
        setUniqueBodiesOfWater([DEFAULT_BODY_OF_WATER]);
        setSelectedBodyOfWater(DEFAULT_BODY_OF_WATER);
      }
    }
  }, [catches]);

  useEffect(() => {
    setDefaultColDef((prevColDef) => ({
      ...prevColDef,
      filter: filtersEnabled,
      floatingFilter: filtersEnabled,
    }));
  }, [filtersEnabled]);

  useEffect(() => {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.setGridOption('defaultColDef', defaultColDef);
    }
  }, [defaultColDef]);

  useEffect(() => {
    // Set the header actions for this page
    setActions(
      <ActionIcon bg={'var(--mantine-color-dark-8)'} variant='default' onClick={open} disabled={catchDetailsOpen}><IconAdjustments size={20}/></ActionIcon>
    );

    // Cleanup when leaving the page
    return () => setActions(null);
  }, []);

  const updateRowCount = useCallback(() => {
    const count = gridRef.current!.api.getDisplayedRowCount();
    setRowCount(count);

    // Show no rows overlay if there are no rows
    if (count === 0) {
      gridRef.current!.api.showNoRowsOverlay();
    } else {
      gridRef.current!.api.hideOverlay();
    }
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
    if (year && year !== 'AllYears') { 
      const filterModel = {
        type: 'inRange',
        dateFrom: `${year}-01-01`,
        dateTo: `${year}-12-31`,
      };
      gridRef.current!.api.setColumnFilterModel(FieldIdentifier.Date, filterModel).then(() => {
        gridRef.current!.api.onFilterChanged();
      });
    } else {
      // Clear filter if 'All Years' is selected
      gridRef.current!.api.setColumnFilterModel(FieldIdentifier.Date, null).then(() => {
        gridRef.current!.api.onFilterChanged();
      });
    }
  }, []);

  const applyBodyOfWaterFilter = useCallback((bodyOfWater: string | null) => {
    if (bodyOfWater && bodyOfWater !== 'AllBodiesOfWater') {
      const filterModel = {
        filterType: 'text',
        type: 'equals',
        filter: bodyOfWater
      };
      gridRef.current!.api.setColumnFilterModel(FieldIdentifier.BodyOfWater, filterModel)
        .then(() => {
          gridRef.current!.api.onFilterChanged();
        });
    } else {
      gridRef.current!.api.setColumnFilterModel(FieldIdentifier.BodyOfWater, null)
        .then(() => {
          gridRef.current!.api.onFilterChanged();
        });
    }
  }, [selectedBodyOfWater, catches]);

  useEffect(() => {
    if (gridRef.current?.api && selectedYear) {
      applyYearFilter(selectedYear);
    }
  }, [selectedYear, applyYearFilter]);
  
  useEffect(() => {
    if (gridRef.current?.api && selectedBodyOfWater) {
      applyBodyOfWaterFilter(selectedBodyOfWater);
    }
  }, [selectedBodyOfWater, applyBodyOfWaterFilter]);

  const columnsCombobox = useCombobox({
    onDropdownClose: () => columnsCombobox.resetSelectedOption(),
    onDropdownOpen: () => columnsCombobox.updateSelectedOptionIndex('active'),
  });

  const bodyOfWaterCombobox = useCombobox({
    onDropdownClose: () => bodyOfWaterCombobox.resetSelectedOption(),
    onDropdownOpen: () => bodyOfWaterCombobox.updateSelectedOptionIndex('active'),
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

  const allColumnLabels = useMemo(() => Object.values(fieldToDisplayLabelMap), [fieldToDisplayLabelMap]);

  const handleValueSelect = (val: string) => {
    setVisibleColumns((current) => {
      if (val === t('Common.SelectAll')) {
        // Toggle select all
        return current.length === colDefs.length ? [] : [...allColumnLabels];
      } else {
        // Toggle individual column
        return current.includes(val)
          ? current.filter((v) => v !== val)
          : [...current, val];
      }
    });
  };

  const onRowClicked = useCallback((event: any) => {
    if (event?.data) {
      console.log('Selected catch:', event.data);
      setSelectedCatch(event.data);
    }
  }, []);

  const resetTableSettings = () => {
    setVisibleColumns(defaultVisibleColumns);
    setSelectedYear(uniqueYears[0]);
    setSelectedBodyOfWater(uniqueBodiesOfWater[0]);
    setTimeout(() => {
      setFiltersEnabled(false);
    }, 150);
    setTimeout(() => {
      setImageIconsEnabled(false);
    }, 100);
    setTimeout(() => {
      setLocationIconsEnabled(false);
    }, 50);      
  };

  useEffect(() => {
    setCatchDetailsOpen(!!selectedCatch); // Automatically open or close based on selectedCatch
    updateQueryParams(selectedCatch, router); // Update query params based on selectedCatch
  }, [selectedCatch]);

  const selectAllOption = getSelectAllOption(t("Common.SelectAll"), visibleColumns, colDefs);
  const columnOptions = getColumnOptions(colDefs, visibleColumns, fieldToDisplayLabelMap, t);
  const yearOptions = getYearOptions(['AllYears', ...uniqueYears], selectedYear, t);
  const bodyOfWaterOptions = getBodyOfWaterOptions(['AllBodiesOfWater', ...uniqueBodiesOfWater], selectedBodyOfWater, t); 

  return (
    <Container p={0} pt={'md'} pb={'md'} size={'sm'}>

      <Stack p={0} gap={'sm'} align='flex-start'>
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
          bodyOfWaterCombobox={bodyOfWaterCombobox}
          selectedBodyOfWater={selectedBodyOfWater}
          setSelectedBodyOfWater={setSelectedBodyOfWater}
          bodyOfWaterOptions={bodyOfWaterOptions}
          filtersSliderChecked={filtersEnabled}
          imageIconsEnabled={imageIconsEnabled}
          setImageIconsEnabled={setImageIconsEnabled}
          locationIconsEnabled={locationIconsEnabled}
          setLocationIconsEnabled={setLocationIconsEnabled}
          setFiltersSliderChecked={setFiltersEnabled}
          setVisibleColumns={setVisibleColumns}
          resetTableSettings={resetTableSettings}
        />

        <Box pl={'xs'} pt={'sm'} visibleFrom='md'>
          <Button variant="default" onClick={open} radius={'md'} bg="var(--mantine-color-dark-7)" leftSection={<IconAdjustments size={20} />}>
            {t('CatchesPage.TableSettings.Button')}
          </Button>
        </Box>

        <CatchesOverview
          uniqueBodiesOfWater={uniqueBodiesOfWater}
          selectedBodyOfWater={selectedBodyOfWater}
          uniqueYears={uniqueYears}
          selectedYear={selectedYear}
          rowCount={rowCount}
          filteredCatches={filteredCatches}
          scrollRef={scrollRef}
        />
      </Stack>

      {catchDetailsOpen && selectedCatch && (
        <CatchDetails
          selectedCatch={selectedCatch}
          setSelectedCatch={setSelectedCatch}
        />
      )}

      <Box pl={'md'} pr={'md'}>
        <CatchesGrid
          gridRef={gridRef}
          colDefs={colDefs}
          defaultColDef={defaultColDef}
          updateRowCountAndFilteredCatches={updateRowCountAndFilteredCatches}
          onGridReady={onGridReady}
          catches={catches}
          catchesError={catchesError}
          loadingCatches={loadingCatches}
          onRowClicked={onRowClicked}
          locale={locale}
        />
      </Box>

    </Container>
  );
}