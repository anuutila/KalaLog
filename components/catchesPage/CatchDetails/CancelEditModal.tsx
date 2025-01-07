import { Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import classes from './CatchDetails.module.css';

interface ConfirmEditModalProps {
  onConfirm: () => void;
}

export default function CancelEditModal({ onConfirm }: ConfirmEditModalProps) {

  modals.openConfirmModal({
    title: 'Peruuta muokkaus',
    centered: true,
    children: (
      <Text size="md">
        Haluatko varmasti peruuttaa saaliin muokkauksen?
      </Text>
    ),
    labels: { confirm: 'Peruuta', cancel: 'Jatka muokkausta' },
    confirmProps: { color: 'red' },
    onConfirm: () => onConfirm(),
    zIndex: 2000,
    classNames: { title: classes.modalTitle }
  });
  
}
