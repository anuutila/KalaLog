import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

import CatchesGrid from '@/components/CatchesGrid/CatchesGrid';
import { getCatches } from '@/lib/mongo/catches';

export default async function Page() {
  const { catches, error } = await getCatches();

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <CatchesGrid catches={catches} />
    </>
  );
}
