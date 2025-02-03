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
  [FieldIdentifier.Species]: 'Laji',
  [FieldIdentifier.Image]: 'Kuva',
  [FieldIdentifier.Length]: 'Pituus',
  [FieldIdentifier.Weight]: 'Paino',
  [FieldIdentifier.Lure]: 'Viehe',
  [FieldIdentifier.BodyOfWater]: 'Vesialue',
  [FieldIdentifier.Location]: 'Paikka',
  [FieldIdentifier.Time]: 'Aika',
  [FieldIdentifier.Date]: 'Pvm.',
  [FieldIdentifier.CaughtBy]: 'Kalastaja',
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