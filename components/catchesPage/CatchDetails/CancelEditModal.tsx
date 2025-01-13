import { Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import classes from './CatchDetails.module.css';
import { IconEraser } from '@tabler/icons-react';

interface ConfirmEditModalProps {
  onConfirm: () => void;
}

export default function CancelEditModal({ onConfirm }: ConfirmEditModalProps) {

  modals.openConfirmModal({
    title: 'Peruuta muokkaus',
    centered: true,
    radius: 'md',
    children: (
      <Text size="md">
        Haluatko varmasti peruuttaa saaliin muokkauksen? Menetät kaikki tekemäsi muutokset.
      </Text>
    ),
    labels: { confirm: 'Peruuta', cancel: 'Jatka muokkausta' },
    confirmProps: { color: 'red' , leftSection: <IconEraser size={20} />},
    onConfirm: () => onConfirm(),
    zIndex: 2000,
    classNames: { title: classes.modalTitle }
  });
  
}
