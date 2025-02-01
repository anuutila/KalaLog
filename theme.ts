'use client';

import { Autocomplete, Checkbox, createTheme, Input, InputBase, InputWrapper, NumberInput, PasswordInput, PillsInput, Textarea, TextInput } from '@mantine/core';

export const theme = createTheme({
  cursorType: 'pointer',
  defaultRadius: 'md',
  components: {
    Checkbox: {
      defaultProps: {
        radius: 'sm',
      },
    },
    InputBase: {
      classNames: {
        input: 'mantine-custom-input',
      },
    },
    TextInput: {
      classNames: {
        input: 'mantine-custom-input',
      },
    },
    PasswordInput: {
      classNames: {
        input: 'mantine-custom-input',
      },
    },
    Autocomplete: {
      classNames: {
        input: 'mantine-custom-input',
      },
    },
    NumberInput: {
      classNames: {
        input: 'mantine-custom-input',
      },
    },
    Textarea: {
      classNames: {
        input: 'mantine-custom-input',
      },
    },
    PillsInput: {
      classNames: {
        input: 'mantine-custom-input',
      },
    },
  },
});
