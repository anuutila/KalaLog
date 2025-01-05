import { AgGridReact } from "ag-grid-react";
import { ICatch } from "@/lib/types/catch";
import { useMemo } from "react";
import { useGlobalState } from "@/context/GlobalState";
import CustomNoRowsOverlay from "./CustomNoRowsOverlay/CustomNoRowsOverlay";
import "./CatchesGrid.css";

interface CatchesGridProps {
  gridRef: React.RefObject<AgGridReact<ICatch>>;
  colDefs: any[];
  defaultColDef: any;
  updateRowCountAndFilteredCatches: () => void;
  onGridReady: (params: any) => void;
}

export default function CatchesGrid({
  gridRef,
  colDefs,
  defaultColDef,
  updateRowCountAndFilteredCatches,
  onGridReady,
}: CatchesGridProps) {
  const { catches, catchesError, loadingCatches } = useGlobalState();

  const noRowsOverlayComponentParams = useMemo(() => {
    return {
      noRowsMessageFunc: () =>
        catchesError ? catchesError : 'Ei näytettäviä saaliita', 
    };
  }, [catchesError]);
  
  return (
    <div className="ag-theme-quartz-dark grid-wrapper">
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
      />
    </div>
  )
};