import { Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import classes from './CatchDetails.module.css';
import { IconEdit, IconPencil } from '@tabler/icons-react';

interface ConfirmEditModalProps {
  onConfirm: () => void;
}

export default function ConfirmEditModal({ onConfirm }: ConfirmEditModalProps) {

  modals.openConfirmModal({
    title: 'Muokkaa saalista',
    centered: true,
    radius: 'lg',
    children: (
      <Text size="md" mb={'lg'}>
        Haluatko muokata saaliin tietoja?
      </Text>
    ),
    labels: { confirm: 'Muokkaa', cancel: 'Peruuta' },
    confirmProps: { color: 'blue', leftSection: <IconEdit size={20}/>, radius: 'md' },
    onConfirm: () => onConfirm(),
    zIndex: 2000,
    classNames: { header: classes.modalHeader, body: classes.modalBody, title: classes.modalTitle }
  });
  
}
