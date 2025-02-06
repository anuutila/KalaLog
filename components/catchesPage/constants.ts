import {
  IconFish,
  IconCamera,
  IconRuler2,
  IconWeight,
  IconFishHook,
  IconMapPin2,
  IconClock,
  IconCalendar,
  IconUser,
  IconRipple,
} from '@tabler/icons-react';

export enum FieldIdentifier {
  Species = 'species',
  Image = 'image',
  Length = 'length',
  Weight = 'weight',
  Lure = 'lure',
  BodyOfWater = 'location.bodyOfWater',
  Location = 'location',
  Time = 'time',
  Date = 'date',
  CaughtBy = 'caughtBy',
}

export const fieldToDisplayLabelMap: Record<FieldIdentifier, string> = {
  [FieldIdentifier.Species]: 'Common.Species',
  [FieldIdentifier.Image]: 'Common.Picture',
  [FieldIdentifier.Length]: 'Common.Length',
  [FieldIdentifier.Weight]: 'Common.Weight',
  [FieldIdentifier.Lure]: 'Common.Lure',
  [FieldIdentifier.BodyOfWater]: 'Common.BodyOfWater',
  [FieldIdentifier.Location]: 'Common.Location',
  [FieldIdentifier.Time]: 'Common.Time',
  [FieldIdentifier.Date]: 'Common.Date',
  [FieldIdentifier.CaughtBy]: 'Common.CaughtBy',
};

export const fieldToIconMap: Record<FieldIdentifier, React.ElementType> = {
  [FieldIdentifier.Species]: IconFish,
  [FieldIdentifier.Image]: IconCamera,
  [FieldIdentifier.Length]: IconRuler2,
  [FieldIdentifier.Weight]: IconWeight,
  [FieldIdentifier.Lure]: IconFishHook,
  [FieldIdentifier.BodyOfWater]: IconRipple,
  [FieldIdentifier.Location]: IconMapPin2,
  [FieldIdentifier.Time]: IconClock,
  [FieldIdentifier.Date]: IconCalendar,
  [FieldIdentifier.CaughtBy]: IconUser,
};

export const defaultVisibleColumns = [
  fieldToDisplayLabelMap[FieldIdentifier.Species],
  fieldToDisplayLabelMap[FieldIdentifier.Length],
  fieldToDisplayLabelMap[FieldIdentifier.Date],
  fieldToDisplayLabelMap[FieldIdentifier.CaughtBy]
];

export const displayLabelToFieldMap: Record<string, FieldIdentifier> = Object.fromEntries(
  Object.entries(fieldToDisplayLabelMap).map(([field, label]) => [label, field as FieldIdentifier])
);