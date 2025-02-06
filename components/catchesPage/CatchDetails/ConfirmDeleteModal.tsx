import { TextInput, Button, Group, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import classes from './CatchDetails.module.css';
import { IconTrash } from '@tabler/icons-react';

interface ConfirmDeleteModalProps {
  onConfirm: () => void;
  t: any;
}

export default function ConfirmDeleteModal({ onConfirm, t }: ConfirmDeleteModalProps) {
  const title = t('Modals.DeleteCatch.Title');
  const content = t('Modals.DeleteCatch.Content');
  const confirmLabel = t('Common.Delete');
  const cancelLabel = t('Common.Cancel');
  const confirmationtext = t('Modals.DeleteCatch.ConfirmationText');
  const placeholder = t('Modals.DeleteCatch.Placeholder');
  let confirmationText = '';

  modals.open({
    id: 'confirm-delete-modal',
    title: title,
    centered: true,
    withCloseButton: true,
    radius: 'lg',
    children: (
      <>
        <Text size="md" mb="md">
        {content}
        </Text>
        <TextInput
          mb="lg"
          placeholder={placeholder}
          onChange={(event) => {
            confirmationText = event.currentTarget.value;

            // Dynamically update modal when input changes
            if (confirmationText === confirmationtext) {
              modals.updateModal({
                modalId: 'confirm-delete-modal',
                children: (
                  <>
                    <Text size="md" mb="md">
                    {content}
                    </Text>
                    <TextInput mb={'lg'} value={confirmationText} onChange={() => {}} disabled />
                    <Group justify='end' mt="md">
                      <Button variant="default" onClick={() => modals.close('confirm-delete-modal')}>
                        {cancelLabel}
                      </Button>
                      <Button
                        color="red"
                        disabled={confirmationText !== confirmationtext}
                        leftSection={<IconTrash size={20}/>}
                        onClick={() => {
                          onConfirm();
                          modals.close('confirm-delete-modal');
                        }}
                      >
                        {confirmLabel}
                      </Button>
                    </Group>
                  </>
                ),
              });
            }
          }}
        />
        <Group justify='end' mt="md">
          <Button variant="default" onClick={() => modals.close('confirm-delete-modal')}>
            {cancelLabel}
          </Button>
          <Button disabled leftSection={<IconTrash size={20}/>}>{confirmLabel}</Button>
        </Group>
      </>
    ),
    zIndex: 2000,
    classNames: { header: classes.modalHeader, body: classes.modalBody, title: classes.modalTitle }
  });
}
