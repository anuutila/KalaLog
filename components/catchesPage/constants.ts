export enum FieldIdentifier {
  Species = 'species',
  Image = 'image',
  Length = 'length',
  Weight = 'weight',
  Lure = 'lure',
  Location = 'location',
  Time = 'time',
  Date = 'date',
  CaughtBy = 'caughtBy.name',
}

export const fieldToDisplayLabelMap: Record<FieldIdentifier, string> = {
  [FieldIdentifier.Species]: '🐟 Laji',
  [FieldIdentifier.Image]: '📷 Kuva',
  [FieldIdentifier.Length]: '📏 Pituus',
  [FieldIdentifier.Weight]: '⚖️ Paino',
  [FieldIdentifier.Lure]: '🎣 Viehe',
  [FieldIdentifier.Location]: '📍 Paikka',
  [FieldIdentifier.Time]: '🕑 Aika',
  [FieldIdentifier.Date]: '📅 Pvm.',
  [FieldIdentifier.CaughtBy]: '🙋 Kalastaja',
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

export const years: string[] = ['2025', '2024', '2023', '2022', '2021', '2020', 'Kaikki vuodet'];