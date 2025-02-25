import { useMemo } from 'react';
import { AG_GRID_LOCALE_EN, AG_GRID_LOCALE_FI } from '@ag-grid-community/locale';
import { AgGridReact } from 'ag-grid-react';
import { ICatch } from '@/lib/types/catch';
import CustomNoRowsOverlay from './CustomNoRowsOverlay/CustomNoRowsOverlay';

import './CatchesGrid.css';

import { useTranslations } from 'next-intl';

interface CatchesGridProps {
  gridRef: React.RefObject<AgGridReact<ICatch>>;
  colDefs: any[];
  defaultColDef: any;
  updateRowCountAndFilteredCatches: () => void;
  onGridReady: (params: any) => void;
  catches: ICatch[];
  catchesError: string | null;
  loadingCatches: boolean;
  onRowClicked: (event: any) => void;
  locale: string;
}

export default function CatchesGrid({
  gridRef,
  colDefs,
  defaultColDef,
  updateRowCountAndFilteredCatches,
  onGridReady,
  catches,
  catchesError,
  loadingCatches,
  onRowClicked,
  locale,
}: CatchesGridProps) {
  const t = useTranslations('CatchesPage.Table');

  const noRowsOverlayComponentParams = useMemo(() => {
    return {
      noRowsMessageFunc: () => (catchesError ? catchesError : t('NoData')),
    };
  }, [catchesError]);

  const localeText = useMemo(() => {
    return locale === 'fi' ? AG_GRID_LOCALE_FI : AG_GRID_LOCALE_EN;
  }, [locale]);

  return (
    <div key={locale} className="ag-theme-quartz-dark grid-wrapper">
      <AgGridReact<ICatch>
        ref={gridRef}
        rowData={catches}
        columnDefs={colDefs}
        defaultColDef={defaultColDef}
        suppressDragLeaveHidesColumns
        pagination
        onGridReady={onGridReady}
        onFilterChanged={updateRowCountAndFilteredCatches}
        noRowsOverlayComponent={CustomNoRowsOverlay}
        noRowsOverlayComponentParams={noRowsOverlayComponentParams}
        loading={loadingCatches}
        onRowClicked={onRowClicked}
        localeText={localeText}
      />
    </div>
  );
}
