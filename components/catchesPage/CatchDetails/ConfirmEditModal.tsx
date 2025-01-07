import { Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import classes from './CatchDetails.module.css';

interface ConfirmEditModalProps {
  onConfirm: () => void;
}

export default function ConfirmEditModal({ onConfirm }: ConfirmEditModalProps) {

  modals.openConfirmModal({
    title: 'Muokkaa saalista',
    centered: true,
    children: (
      <Text size="md">
        Haluatko muokata saaliin tietoja?
      </Text>
    ),
    labels: { confirm: 'Muokkaa', cancel: 'Peruuta' },
    confirmProps: { color: 'blue' },
    onConfirm: () => onConfirm(),
    zIndex: 2000,
    classNames: { title: classes.modalTitle }
  });
  
}
