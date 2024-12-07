import { AgGridReact } from 'ag-grid-react'
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { useMemo, useState } from 'react';
import { ColDef, SizeColumnsToContentStrategy, SizeColumnsToFitGridStrategy, SizeColumnsToFitProvidedWidthStrategy, ValueFormatterParams } from 'ag-grid-community';
import classes from './CatchesGrid.module.css';

interface ICatch {
  species: string;        // Fish species
  date: string;           // Date of the catch (format: YYYY-MM-DD)
  length: string;         // Length of the fish in centimeters
  weight: string;         // Weight of the fish in kilograms
  lure: string;           // Type of lure used
  place: string;          // Location of the catch
  time: string;           // Time of the catch (format: HH:MM)
  person: string;         // Name of the person who made the catch
  coordinates: string;    // Coordinates of the catch location
}

export default function CatchesGrid() {

  const [rowData, setRowData] = useState<ICatch[]>([
    { species: "kuha", date: "2022-07-07", length: "54.5", weight: "1.28", lure: "Mikado Fishunter II 6,5 cm 329", place: "Ahvenniemi", time: "19:40", person: "Elmeri", coordinates: "60.2248, 25.0815" },
    { species: "hauki", date: "2023-05-15", length: "78.2", weight: "3.45", lure: "Rapala X-Rap 10 cm", place: "Kuusisaari", time: "14:20", person: "Aleksandra", coordinates: "61.2234, 24.9876" },
    { species: "ahven", date: "2022-08-12", length: "32.1", weight: "0.65", lure: "Storm Wildeye Minnow 5 cm", place: "Kalliojärvi", time: "17:50", person: "Jenna", coordinates: "60.4567, 25.3456" },
    { species: "kuha", date: "2023-06-18", length: "60.5", weight: "2.10", lure: "K.D. Baits 8 cm", place: "Hämeenlinna", time: "21:15", person: "Mikko", coordinates: "60.9911, 24.1234" },
    { species: "hauki", date: "2023-09-01", length: "85.0", weight: "4.75", lure: "Berkley PowerBait 12 cm", place: "Puruvesi", time: "12:10", person: "Veera", coordinates: "62.3456, 29.1234" },
    { species: "ahven", date: "2023-04-25", length: "28.7", weight: "0.52", lure: "Mikado Fishunter II 4,5 cm", place: "Isojärvi", time: "16:45", person: "Lauri", coordinates: "61.5678, 23.9876" },
    { species: "kuha", date: "2022-10-30", length: "58.3", weight: "1.95", lure: "Storm ThunderStick 7 cm", place: "Jämsä", time: "20:30", person: "Kaisa", coordinates: "61.6789, 25.3456" },
    { species: "hauki", date: "2023-07-10", length: "92.5", weight: "5.20", lure: "Savage Gear 3D Roach 10 cm", place: "Saimaanlahti", time: "11:00", person: "Eero", coordinates: "61.9087, 28.1234" },
    { species: "ahven", date: "2023-03-05", length: "30.4", weight: "0.58", lure: "Rapala Jigging Rap 5 cm", place: "Myllylampi", time: "15:30", person: "Tiina", coordinates: "60.4321, 23.8765" },
    { species: "kuha", date: "2023-05-22", length: "55.6", weight: "1.70", lure: "Berkley Ripple Shad 6 cm", place: "Lappeenranta", time: "18:40", person: "Antti", coordinates: "61.8765, 25.9876" },
    { species: "hauki", date: "2022-11-11", length: "76.4", weight: "3.90", lure: "Zalt Z 11 cm", place: "Ähtäri", time: "10:15", person: "Sanna", coordinates: "62.2345, 24.6789" },
    { species: "ahven", date: "2023-06-09", length: "33.2", weight: "0.68", lure: "Rapala Shad Rap 5 cm", place: "Vesijärvi", time: "13:50", person: "Jani", coordinates: "61.1234, 25.9876" },
    { species: "kuha", date: "2022-09-18", length: "61.8", weight: "2.40", lure: "Mikado Fishunter II 7 cm", place: "Pirkanmaa", time: "19:20", person: "Oskari", coordinates: "61.3456, 23.4567" },
    { species: "hauki", date: "2023-01-02", length: "83.1", weight: "4.50", lure: "Storm Suspending WildEye Swim Shad 12 cm", place: "Rautalampi", time: "09:30", person: "Pekka", coordinates: "63.4567, 26.1234" },
    { species: "ahven", date: "2023-08-22", length: "31.5", weight: "0.60", lure: "Savage Gear Cannibal Shad 6 cm", place: "Helsinki", time: "17:25", person: "Milla", coordinates: "60.1234, 24.5678" },
    { species: "kuha", date: "2022-07-07", length: "54.5", weight: "1.28", lure: "Mikado Fishunter II 6,5 cm 329", place: "Ahvenniemi", time: "19:40", person: "Elmeri", coordinates: "60.2248, 25.0815" },
    { species: "hauki", date: "2023-05-15", length: "78.2", weight: "3.45", lure: "Rapala X-Rap 10 cm", place: "Kuusisaari", time: "14:20", person: "Aapo", coordinates: "61.2234, 24.9876" },
    { species: "ahven", date: "2022-08-12", length: "32.1", weight: "0.65", lure: "Storm Wildeye Minnow 5 cm", place: "Kalliojärvi", time: "17:50", person: "Jenna", coordinates: "60.4567, 25.3456" },
    { species: "kuha", date: "2023-06-18", length: "60.5", weight: "2.10", lure: "K.D. Baits 8 cm", place: "Hämeenlinna", time: "21:15", person: "Mikko", coordinates: "60.9911, 24.1234" },
    { species: "hauki", date: "2023-09-01", length: "85.0", weight: "4.75", lure: "Berkley PowerBait 12 cm", place: "Puruvesi", time: "12:10", person: "Veera", coordinates: "62.3456, 29.1234" },
    { species: "ahven", date: "2023-04-25", length: "28.7", weight: "0.52", lure: "Mikado Fishunter II 4,5 cm", place: "Isojärvi", time: "16:45", person: "Lauri", coordinates: "61.5678, 23.9876" },
    { species: "kuha", date: "2022-10-30", length: "58.3", weight: "1.95", lure: "Storm ThunderStick 7 cm", place: "Jämsä", time: "20:30", person: "Kaisa", coordinates: "61.6789, 25.3456" },
    { species: "hauki", date: "2023-07-10", length: "92.5", weight: "5.20", lure: "Savage Gear 3D Roach 10 cm", place: "Saimaanlahti", time: "11:00", person: "Eero", coordinates: "61.9087, 28.1234" },
    { species: "ahven", date: "2023-03-05", length: "30.4", weight: "0.58", lure: "Rapala Jigging Rap 5 cm", place: "Myllylampi", time: "15:30", person: "Tiina", coordinates: "60.4321, 23.8765" },
    { species: "kuha", date: "2023-05-22", length: "55.6", weight: "1.70", lure: "Berkley Ripple Shad 6 cm", place: "Lappeenranta", time: "18:40", person: "Antti", coordinates: "61.8765, 25.9876" },
    { species: "hauki", date: "2022-11-11", length: "76.4", weight: "3.90", lure: "Zalt Z 11 cm", place: "Ähtäri", time: "10:15", person: "Sanna", coordinates: "62.2345, 24.6789" },
    { species: "ahven", date: "2023-06-09", length: "33.2", weight: "0.68", lure: "Rapala Shad Rap 5 cm", place: "Vesijärvi", time: "13:50", person: "Jani", coordinates: "61.1234, 25.9876" },
    { species: "kuha", date: "2022-09-18", length: "61.8", weight: "2.40", lure: "Mikado Fishunter II 7 cm", place: "Pirkanmaa", time: "19:20", person: "Oskari", coordinates: "61.3456, 23.4567" },
    { species: "hauki", date: "2023-01-02", length: "83.1", weight: "4.50", lure: "Storm Suspending WildEye Swim Shad 12 cm", place: "Rautalampi", time: "09:30", person: "Pekka", coordinates: "63.4567, 26.1234" },
    { species: "ahven", date: "2023-08-22", length: "31.5", weight: "0.60", lure: "Savage Gear Cannibal Shad 6 cm", place: "Helsinki", time: "17:25", person: "Milla", coordinates: "60.1234, 24.5678" }
  ]);

  const [colDefs, setColDefs] = useState<ColDef<ICatch>[]>([
    { field: 'species', headerName: 'Species', sortable: true, filter: true, resizable: false, maxWidth: 110, valueFormatter: upperCaseFormatter },
    { field: 'length', headerName: 'Length', sortable: true, filter: true, resizable: false, maxWidth: 110, valueFormatter: lengthFormatter },
    { field: 'weight', headerName: 'Weight', sortable: true, filter: true, resizable: false, maxWidth: 110, valueFormatter: weightFormatter },
    { field: 'lure', headerName: 'Lure', sortable: true, filter: true, resizable: false, wrapText: true, autoHeight: true, maxWidth: 140, valueFormatter: upperCaseFormatter },
    { field: 'place', headerName: 'Place', sortable: true, filter: true, resizable: false, maxWidth: 140, valueFormatter: upperCaseFormatter },
    { field: 'time', headerName: 'Time', sortable: true, filter: true, resizable: false, maxWidth: 90 },
    { field: 'date', headerName: 'Date', sortable: true, filter: true, resizable: false, maxWidth: 120 },
    { field: 'person', headerName: 'Person', sortable: true, filter: true, resizable: false, maxWidth: 100 },
  ]);

  function lengthFormatter(params: ValueFormatterParams) {
    return `${params.value} cm`;
  }

  function weightFormatter(params: ValueFormatterParams) {
    return `${params.value} kg`;
  }

  function upperCaseFormatter(params: ValueFormatterParams) {
    return params.value.charAt(0).toUpperCase() + params.value.slice(1);
  }

  const autoSizeStrategy = useMemo<
    | SizeColumnsToFitGridStrategy
    | SizeColumnsToFitProvidedWidthStrategy
    | SizeColumnsToContentStrategy
  >(() => {
    return {
      type: "fitCellContents",
    };
  }, []);

  return (
    <div className={`ag-theme-quartz-dark ${classes}`}>
      <AgGridReact<ICatch>
        rowData={rowData} 
        columnDefs={colDefs}
        autoSizeStrategy={autoSizeStrategy}
        suppressDragLeaveHidesColumns={true}
      />
    </div>
  );
}