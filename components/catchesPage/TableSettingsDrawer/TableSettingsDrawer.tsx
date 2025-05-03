import { SetStateAction } from 'react';
import {
  Box,
  Button,
  Combobox,
  Drawer,
  Group,
  Input,
  InputBase,
  Pill,
  PillsInput,
  Stack,
  Switch,
  Text,
  Tooltip,
} from '@mantine/core';
import classes from './TableSettingsDrawer.module.css';

import './TableSettingsDrawer.css';

import { IconCalendar, IconInfoCircle, IconRestore, IconRipple, IconTableColumn } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { displayLabelToFieldMap, fieldToIconMap } from '../constants';

const MAX_DISPLAYED_VALUES = 2;

interface TableSettingsDrawerProps {
  opened: boolean;
  close: () => void;
  visibleColumns: string[];
  handleValueSelect: (value: string) => void;
  columnsCombobox: any;
  columnOptions: any;
  selectAllOption: any;
  yearCombobox: any;
  selectedYear: string | null;
  setSelectedYear: (year: string) => void;
  yearOptions: JSX.Element[];
  bodyOfWaterCombobox: any;
  selectedBodyOfWater: string | null;
  setSelectedBodyOfWater: (bodyOfWater: string) => void;
  bodyOfWaterOptions: JSX.Element[];
  filtersSliderChecked: boolean;
  setFiltersSliderChecked: (checked: boolean) => void;
  imageIconsEnabled: boolean;
  setImageIconsEnabled: (enabled: boolean) => void;
  locationIconsEnabled: boolean;
  setLocationIconsEnabled: (enabled: boolean) => void;
  setVisibleColumns: (value: SetStateAction<string[]>) => void;
  resetTableSettings: () => void;
}

export default function TableSettingsDrawer({
  opened,
  close,
  visibleColumns,
  handleValueSelect,
  columnsCombobox,
  columnOptions,
  selectAllOption,
  yearCombobox,
  selectedYear,
  setSelectedYear,
  yearOptions,
  bodyOfWaterCombobox,
  selectedBodyOfWater,
  setSelectedBodyOfWater,
  bodyOfWaterOptions,
  filtersSliderChecked,
  setFiltersSliderChecked,
  imageIconsEnabled,
  setImageIconsEnabled,
  locationIconsEnabled,
  setLocationIconsEnabled,
  setVisibleColumns,
  resetTableSettings,
}: TableSettingsDrawerProps) {
  const t = useTranslations();
  const tTable = useTranslations('CatchesPage.TableSettings');
  const tCommon = useTranslations('Common');

  const handleValueRemove = (val: string) => setVisibleColumns((current) => current.filter((v) => v !== val));

  const pillValues = visibleColumns
    .slice(0, MAX_DISPLAYED_VALUES === visibleColumns.length ? MAX_DISPLAYED_VALUES : MAX_DISPLAYED_VALUES - 1)
    .map((item) => {
      const field = displayLabelToFieldMap[item];
      const Icon = fieldToIconMap[field];

      return (
        <Pill key={item} withRemoveButton onRemove={() => handleValueRemove(item)} fz="var(--mantine-font-size-sm)">
          <Group h="100%" gap="xs" align="center" wrap="nowrap">
            <Icon size={16} />
            <Text fz="sm">{t(item)}</Text>
          </Group>
        </Pill>
      );
    });

    const filtersSwitchLabel = () => {
      return (
        <Group gap="xs" wrap="nowrap" align="center">
          <Text fw={500}>{tTable('Filters')}</Text>
          <Tooltip
            onClick={(event) => event.preventDefault()}
            label={tTable('FiltersInfo')}
            withArrow
            multiline
            w={200}
            events={{ hover: true, focus: true, touch: true }}
          >
            <IconInfoCircle size={22} stroke={2} color="var(--mantine-color-dimmed)" />
          </Tooltip>
        </Group>
      );
    };

  const imageIconSwitchLabel = () => {
    return (
      <Group gap="xs" wrap="nowrap" align="center">
        <Text fw={500}>{tTable('ImageIcons')}</Text>
        <Tooltip
          onClick={(event) => event.preventDefault()}
          label={tTable('ImageIconsInfo')}
          withArrow
          multiline
          w={200}
          events={{ hover: true, focus: true, touch: true }}
        >
          <IconInfoCircle size={22} stroke={2} color="var(--mantine-color-dimmed)" />
        </Tooltip>
      </Group>
    );
  };

  const locationIconSwitchLabel = () => {
    return (
      <Group gap="xs" wrap="nowrap" align="center">
        <Text fw={500}>{tTable('LocationIcons')}</Text>
        <Tooltip
          onClick={(event) => event.preventDefault()}
          label={tTable('LocationIconsInfo')}
          withArrow
          multiline
          w={200}
          events={{ hover: true, focus: true, touch: true }}
        >
          <IconInfoCircle size={22} stroke={2} color="var(--mantine-color-dimmed)" />
        </Tooltip>
      </Group>
    );
  };

  return (
    <Drawer.Root opened={opened} onClose={close} size="xs">
      <Drawer.Overlay />
      <Drawer.Content bg="var(--mantine-color-dark-9)">
        <Drawer.Header bg="var(--mantine-color-dark-9)">
          <Drawer.Title fz="var(--mantine-font-size-lg)" fw="var(--mantine-heading-font-weight)">
            {tTable('Title')}
          </Drawer.Title>
          <Drawer.CloseButton />
        </Drawer.Header>
        <Drawer.Body>
          <Stack gap="var(--mantine-spacing-lg)">
            <Combobox store={columnsCombobox} onOptionSubmit={handleValueSelect} withinPortal={false} size="md">
              <Combobox.DropdownTarget>
                <PillsInput
                  classNames={{ label: classes.input_label }}
                  pointer
                  onClick={() => columnsCombobox.toggleDropdown()}
                  label={tTable('Columns')}
                  fz="var(--mantine-font-size-md)"
                  rightSection={<Combobox.Chevron />}
                  rightSectionPointerEvents="none"
                  size="md"
                  leftSection={<IconTableColumn size={20} />}
                  leftSectionPointerEvents="none"
                >
                  <Pill.Group style={{ gap: '6px', flexWrap: 'nowrap' }}>
                    {visibleColumns.length > 0 ? (
                      <>
                        {pillValues}
                        {visibleColumns.length > MAX_DISPLAYED_VALUES && (
                          <Pill>
                            +{visibleColumns.length - (MAX_DISPLAYED_VALUES - 1)} {tCommon('Others')}
                          </Pill>
                        )}
                      </>
                    ) : (
                      <Input.Placeholder>{tCommon('OneOrMore')}</Input.Placeholder>
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
                <Combobox.Options>
                  {columnOptions}
                  <Combobox.Group label="-">{selectAllOption}</Combobox.Group>
                </Combobox.Options>
              </Combobox.Dropdown>
            </Combobox>

            <Combobox
              store={bodyOfWaterCombobox}
              onOptionSubmit={(val) => {
                setSelectedBodyOfWater(val);
                bodyOfWaterCombobox.closeDropdown();
              }}
              size="md"
            >
              <Combobox.Target>
                <InputBase
                  classNames={{ label: classes.input_label }}
                  label={tTable('BodyOfWater')}
                  component="button"
                  type="button"
                  pointer
                  rightSection={<Combobox.Chevron />}
                  rightSectionPointerEvents="none"
                  onClick={() => bodyOfWaterCombobox.toggleDropdown()}
                  size="md"
                  leftSection={<IconRipple size={20} />}
                  leftSectionPointerEvents="none"
                >
                  {selectedBodyOfWater === 'AllBodiesOfWater'
                    ? t('CatchesPage.TableSettings.AllBodiesOfWater')
                    : selectedBodyOfWater || <Input.Placeholder>{tTable('BodyOfWater')}</Input.Placeholder>}
                </InputBase>
              </Combobox.Target>

              <Combobox.Dropdown>
                <Combobox.Options>{bodyOfWaterOptions}</Combobox.Options>
              </Combobox.Dropdown>
            </Combobox>

            <Combobox
              store={yearCombobox}
              onOptionSubmit={(val) => {
                setSelectedYear(val);
                yearCombobox.closeDropdown();
              }}
              size="md"
            >
              <Combobox.Target>
                <InputBase
                  classNames={{ label: classes.input_label }}
                  label={tTable('Year')}
                  component="button"
                  type="button"
                  pointer
                  rightSection={<Combobox.Chevron />}
                  rightSectionPointerEvents="none"
                  onClick={() => yearCombobox.toggleDropdown()}
                  size="md"
                  leftSection={<IconCalendar size={20} />}
                  leftSectionPointerEvents="none"
                >
                  {selectedYear === 'AllYears'
                    ? t('CatchesPage.TableSettings.AllYears')
                    : selectedYear || <Input.Placeholder>{tTable('Year')}</Input.Placeholder>}
                </InputBase>
              </Combobox.Target>

              <Combobox.Dropdown>
                <Combobox.Options>{yearOptions}</Combobox.Options>
              </Combobox.Dropdown>
            </Combobox>

            <Stack>
              <Switch
                classNames={{ body: classes.switch_body, label: classes.switch_input_label }}
                checked={filtersSliderChecked}
                fw={500}
                label={filtersSwitchLabel()}
                labelPosition="left"
                onChange={(event) => setFiltersSliderChecked(event.currentTarget.checked)}
                size="md"
              />
              <Switch
                classNames={{ body: classes.switch_body, label: classes.switch_input_label }}
                checked={imageIconsEnabled}
                fw={500}
                label={imageIconSwitchLabel()}
                labelPosition="left"
                onChange={(event) => setImageIconsEnabled(event.currentTarget.checked)}
                size="md"
              />
              <Switch
                classNames={{ body: classes.switch_body, label: classes.switch_input_label }}
                checked={locationIconsEnabled}
                fw={500}
                label={locationIconSwitchLabel()}
                labelPosition="left"
                onChange={(event) => setLocationIconsEnabled(event.currentTarget.checked)}
                size="md"
              />
            </Stack>

            <Box mt="lg">
              <Button
                onClick={resetTableSettings}
                variant="default"
                size="md"
                radius="md"
                leftSection={<IconRestore size={20} />}
              >
                {tTable('Restore')}
              </Button>
            </Box>
          </Stack>
        </Drawer.Body>
      </Drawer.Content>
    </Drawer.Root>
  );
}
