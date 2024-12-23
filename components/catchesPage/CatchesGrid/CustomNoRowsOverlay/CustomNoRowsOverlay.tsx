import React from "react";

import type { CustomNoRowsOverlayProps } from "ag-grid-react";

export default (
  props: CustomNoRowsOverlayProps & { noRowsMessageFunc: () => string },
) => {
  const message = props.noRowsMessageFunc();
  return (
    <span className="ag-overlay-no-rows-center">{message}</span>
  );
};