import { TextInput, Button, Group, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import classes from './CatchDetails.module.css';
import { IconTrash } from '@tabler/icons-react';

interface ConfirmDeleteModalProps {
  onConfirm: () => void;
}

export default function ConfirmDeleteModal({ onConfirm }: ConfirmDeleteModalProps) {
  let confirmationText = '';

  const modalId = modals.open({
    title: 'Poista saalis',
    centered: true,
    withCloseButton: true,
    radius: 'md',
    children: (
      <>
        <Text size="md" mb="md">
          Haluatko varmasti poistaa tämän saaliin? Kirjoita 'POISTA' vahvistaaksesi.
        </Text>
        <TextInput
          mb="lg"
          placeholder="Kirjoita 'POISTA' vahvistaaksesi"
          onChange={(event) => {
            confirmationText = event.currentTarget.value;

            // Dynamically update modal when input changes
            if (confirmationText === 'POISTA') {
              modals.updateModal({
                modalId,
                children: (
                  <>
                    <Text size="md" mb="md">
                      Haluatko varmasti poistaa tämän saaliin? Kirjoita 'POISTA' vahvistaaksesi.
                    </Text>
                    <TextInput mb={'lg'} value={confirmationText} onChange={() => {}} disabled />
                    <Group justify='end' mt="md">
                      <Button variant="default" onClick={() => modals.close(modalId)}>
                        Peruuta
                      </Button>
                      <Button
                        color="red"
                        disabled={confirmationText !== 'POISTA'}
                        leftSection={<IconTrash size={20}/>}
                        onClick={() => {
                          onConfirm();
                          modals.close(modalId);
                        }}
                      >
                        Poista
                      </Button>
                    </Group>
                  </>
                ),
              });
            }
          }}
        />
        <Group justify='end' mt="md">
          <Button variant="default" onClick={() => modals.close(modalId)}>
            Peruuta
          </Button>
          <Button disabled leftSection={<IconTrash size={20}/>}>Poista</Button>
        </Group>
      </>
    ),
    zIndex: 2000,
    classNames: { title: classes.modalTitle }
  });
}
