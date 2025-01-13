'use client';

import { Checkbox, createTheme } from '@mantine/core';

export const theme = createTheme({
  cursorType: 'pointer',
  defaultRadius: 'md',
  components: {
    Checkbox: {
      defaultProps: {
        radius: 'sm',
      },
    },
  },
});
