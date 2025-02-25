import { IconEdit } from '@tabler/icons-react';
import { Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import classes from './CatchDetails.module.css';

interface ConfirmEditModalProps {
  onConfirm: () => void;
  t: any;
}

export default function ConfirmEditModal({ onConfirm, t }: ConfirmEditModalProps) {
  const title = t('Modals.EditCatch.Title');
  const content = t('Modals.EditCatch.Content');
  const confirmLabel = t('Common.Edit');
  const cancelLabel = t('Common.Cancel');

  modals.openConfirmModal({
    title,
    centered: true,
    radius: 'lg',
    children: (
      <Text size="md" mb="lg">
        {content}
      </Text>
    ),
    labels: { confirm: confirmLabel, cancel: cancelLabel },
    confirmProps: { color: 'blue', leftSection: <IconEdit size={20} />, radius: 'md' },
    onConfirm: () => onConfirm(),
    zIndex: 2000,
    classNames: { header: classes.modalHeader, body: classes.modalBody, title: classes.modalTitle },
  });
}
