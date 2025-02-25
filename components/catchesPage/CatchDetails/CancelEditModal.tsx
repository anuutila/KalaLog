import { IconEraser } from '@tabler/icons-react';
import { Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import classes from './CatchDetails.module.css';

interface ConfirmEditModalProps {
  onConfirm: () => void;
  t: any;
}

export default function CancelEditModal({ onConfirm, t }: ConfirmEditModalProps) {
  const title = t('Modals.CancelEdit.Title');
  const content = t('Modals.CancelEdit.Content');
  const confirmLabel = t('Common.Cancel');
  const cancelLabel = t('Modals.CancelEdit.Continue');

  modals.openConfirmModal({
    title,
    centered: true,
    radius: 'lg',
    children: <Text size="md">{content}</Text>,
    labels: { confirm: confirmLabel, cancel: cancelLabel },
    confirmProps: { color: 'red', leftSection: <IconEraser size={20} /> },
    onConfirm: () => onConfirm(),
    zIndex: 2000,
    classNames: { title: classes.modalTitle },
  });
}
