import { ActionIcon, Combobox, Drawer, Group, Input, InputBase, Pill, PillsInput, Stack, Switch, Text, Tooltip } from "@mantine/core";
import { SetStateAction } from "react";
import classes from "./TableSettingsDrawer.module.css";
import "./TableSettingsDrawer.css";
import { IconCalendar, IconInfoCircle, IconTableColumn } from "@tabler/icons-react";
import { displayLabelToFieldMap, FieldIdentifier, fieldToIconMap } from "../constants";

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
  yearOptions: any;
  filtersSliderChecked: boolean;
  setFiltersSliderChecked: (checked: boolean) => void;
  imageIconsEnabled: boolean;
  setImageIconsEnabled: (enabled: boolean) => void;
  locationIconsEnabled: boolean;
  setLocationIconsEnabled: (enabled: boolean) => void;
  setVisibleColumns: (value: SetStateAction<string[]>) => void;
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
  filtersSliderChecked,
  setFiltersSliderChecked,
  imageIconsEnabled,
  setImageIconsEnabled,
  locationIconsEnabled,
  setLocationIconsEnabled,
  setVisibleColumns
}: TableSettingsDrawerProps) {

  const handleValueRemove = (val: string) => setVisibleColumns((current) => current.filter((v) => v !== val));

  const pillValues = visibleColumns
    .slice(0, MAX_DISPLAYED_VALUES === visibleColumns.length ? MAX_DISPLAYED_VALUES : MAX_DISPLAYED_VALUES - 1)
    .map((item) => {
      const field = displayLabelToFieldMap[item];
      const Icon = fieldToIconMap[field];

      return (
      <Pill key={item} withRemoveButton onRemove={() => handleValueRemove(item)} fz={'var(--mantine-font-size-sm)'}>
        {<Group gap={'xs'} align="center" wrap="nowrap"><Icon size={16} /><Text fz={'sm'}>{item}</Text></Group>}
      </Pill>
      )
    });

  const imageIconSwitchLabel = () => {
    return (
      <Group
        gap={'xs'}
        wrap="nowrap"
        align="center"
      >
        <Text
          fw={500}
        >
          Näytä kameraikonit
        </Text>
        <Tooltip
          onClick={(event) => event.preventDefault()}
          label="Näytä kameraikoni saaliin laji-sarakkeessa, jos saaliille on lisätty yksi tai useampi kuva."
          withArrow
          multiline
          w={200}
          events={{ hover: true, focus: true, touch: true }}
        >
          <IconInfoCircle
            size={22}
            stroke={2}
            color="var(--mantine-color-dimmed)"
          />
        </Tooltip>
      </Group>
    )
  }

  const locationIconSwitchLabel = () => {
    return (
      <Group
        gap={'xs'}
        wrap="nowrap"
        align="center"
      >
        <Text
          fw={500}
        >
          Näytä sijainti-ikonit
        </Text>
        <Tooltip
          onClick={(event) => event.preventDefault()}
          label="Näytä sijainti-ikoni saaliin sijainti-sarakkeessa, jos saaliille on lisätty tarkat koordinaatit."
          withArrow
          multiline
          w={200}
          events={{ hover: true, focus: true, touch: true }}
        >
          <IconInfoCircle
            size={22}
            stroke={2}
            color="var(--mantine-color-dimmed)"
          />
        </Tooltip>
      </Group>
    )
  }

  return (
    <Drawer.Root opened={opened} onClose={close} size="xs">
      <Drawer.Overlay />
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title fz="var(--mantine-font-size-lg)" fw="var(--mantine-heading-font-weight)">
            Taulukon asetukset
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
                  label="Näytä sarakkeet"
                  fz={'var(--mantine-font-size-md)'}
                  rightSection={<Combobox.Chevron />}
                  rightSectionPointerEvents="none"
                  size="md"
                  leftSection={<IconTableColumn size={20}/>}
                  leftSectionPointerEvents='none'
                >
                  <Pill.Group>
                    {visibleColumns.length > 0 ? (
                      <>
                        {pillValues}
                        {visibleColumns.length > MAX_DISPLAYED_VALUES && (
                          <Pill>+{visibleColumns.length - (MAX_DISPLAYED_VALUES - 1)} muuta</Pill>
                        )}
                      </>
                    ) : (
                      <Input.Placeholder>Valitse yksi tai useampi</Input.Placeholder>
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
                  <Combobox.Group label="-">
                    {selectAllOption}
                  </Combobox.Group>
                </Combobox.Options>
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
                  label="Näytä saaliit vuodelta"
                  component="button"
                  type="button"
                  pointer
                  rightSection={<Combobox.Chevron />}
                  rightSectionPointerEvents="none"
                  onClick={() => yearCombobox.toggleDropdown()}
                  size="md"
                  leftSection={<IconCalendar size={20}/>}
                  leftSectionPointerEvents='none'
                >
                  {selectedYear || <Input.Placeholder>Valitse vuosi</Input.Placeholder>}
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
                label="Näytä suodattimet"
                labelPosition='left'
                onChange={(event) => setFiltersSliderChecked(event.currentTarget.checked)}
                size="md"
              />
              <Switch
                classNames={{ body: classes.switch_body, label: classes.switch_input_label }}
                checked={imageIconsEnabled}
                fw={500}
                label={imageIconSwitchLabel()}
                labelPosition='left'
                onChange={(event) => setImageIconsEnabled(event.currentTarget.checked)}
                size="md"
              />
              <Switch
                classNames={{ body: classes.switch_body, label: classes.switch_input_label }}
                checked={locationIconsEnabled}
                fw={500}
                label={locationIconSwitchLabel()}
                labelPosition='left'
                onChange={(event) => setLocationIconsEnabled(event.currentTarget.checked)}
                size="md"
              />
            </Stack>
            
          </Stack>
        </Drawer.Body>
      </Drawer.Content>
    </Drawer.Root>
  )
};
