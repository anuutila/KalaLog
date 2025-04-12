'use client';

import { useRef, useState } from 'react';
import { TextInput, Button, Group, Stack, MultiSelect, TagsInput, Paper, Container, Fieldset, Title, ActionIcon, TagsInputProps, MultiSelectProps, Avatar, Text } from '@mantine/core';
import { createEvent } from '@/services/api/eventService';
import { showNotification } from '@/lib/notifications/notifications';
import dayjs from 'dayjs';
import { CreateEventData } from '@/lib/types/event';
import { EventCreatedResponse } from '@/lib/types/responses';
import { handleApiError } from '@/lib/utils/handleApiError';
import { useLoadingOverlay } from '@/context/LoadingOverlayContext';
import { CommunityPageUserInfo } from '@/app/community/page';
import { CatchUtils } from '@/lib/utils/catchUtils';
import { ICatch } from '@/lib/types/catch';
import { useTranslations } from 'next-intl';
import { IconX, IconCheck, IconTrash, IconLabel, IconCalendar } from '@tabler/icons-react';
import { nameToColor } from '@/lib/utils/utils';


interface CreateEventFormProps {
  users: CommunityPageUserInfo[];
  catches: ICatch[];
  onSuccessAction: () => void;
  onCancelAction: () => void;
}

export default function CreateEventForm({ users, catches, onSuccessAction, onCancelAction }: CreateEventFormProps) {
  const t = useTranslations();
  const tForm = useTranslations('CommunityPage.EventForm');
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [participants, setParticipants] = useState<string[]>([]); // Store selected user IDs
  const [bodiesOfWater, setBodiesOfWater] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { showLoading, hideLoading } = useLoadingOverlay();
  const formRef = useRef<HTMLFormElement>(null);
  const [isFormValid, setIsFormValid] = useState(false);

  // Format user data for MultiSelect
  const userSelectData: Record<string, { username: string; id: string }> = users.reduce((acc, user,) => {
    acc[`${user.firstName} ${user.lastName ?? ''}`] = { username: user.username, id: user.id ?? '' };
    return acc;
  }, {} as Record<string, { username: string; id: string }>);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const participantIds = participants
     .map(name => userSelectData[name]?.id)
     .filter((id): id is string => !!id);

    // Basic Client-side validation
    if (!name || startDate === '' || endDate === '' || participants.length === 0 || bodiesOfWater.length === 0) {
      showNotification('error', 'Please fill in all fields.', { withTitle: true });
      return;
    }
    if (dayjs(endDate).isBefore(dayjs(startDate))) {
      showNotification('error', 'End date cannot be earlier than start date.', { withTitle: true });
      return;
    }

    const eventData: CreateEventData = {
      name,
      startDate: startDate,
      endDate: endDate,
      participants: participantIds,
      bodiesOfWater,
    };

    showLoading();
    setLoading(true);
    try {
      const eventResponse: EventCreatedResponse = await createEvent(eventData);
      showNotification('success', 'Event created successfully!', { withTitle: false, duration: 3000 });
      onSuccessAction();
    } catch (err: any) {
      handleApiError(err, 'creating event');
    } finally {
      setLoading(false);
      hideLoading();
    }
  };

  const handleFormChange = (currentParticipantsValue: string[]) => {
    setIsFormValid(
      (formRef.current?.checkValidity() ?? false) 
      && currentParticipantsValue.length > 0 
      && bodiesOfWater.length > 0
    );
  };

  const renderMultiSelectOption: MultiSelectProps['renderOption'] = ({ option }) => (
    <Group gap="sm">
      <Avatar name={option.value} size={36} radius="xl" color={nameToColor(option.value)}/>
      <div>
        <Text size="sm">{option.value}</Text>
        <Text size="xs" opacity={0.5}>
          {userSelectData[option.value].username}
        </Text>
      </div>
    </Group>
  );

  return (
    <Paper
      pos="fixed"
      top="calc(var(--app-shell-header-offset)*2)"
      bottom={{ base: 'calc(var(--app-shell-footer-offset) + env(safe-area-inset-bottom))', md: 0 }}
      left={0}
      w="100%"
      p="md"
      radius={0}
      style={{
        backgroundColor: 'var(--mantine-color-body)',
        zIndex: 100,
        overflowY: 'auto',
      }}
    >
      <Container p={0} size="sm">
        <Stack p={0}>

          {/* Header */}
          <Group mb={4}>
            <Title c="white" order={2} p={0} mr="auto" pl={4}>
              {t('CommunityPage.NewEvent')}
            </Title>

            <Group gap="xs" align="center">
              {/* Close Button */}
              <ActionIcon
                size="lg"
                variant="light"
                color="gray"
                onClick={onCancelAction}
              >
                <IconX size={20} />
              </ActionIcon>
            </Group>
          </Group>

          <form onSubmit={handleSubmit} ref={formRef} onChange={() => handleFormChange(participants)}>
            <Fieldset disabled={loading} variant="default" radius="md" pt="md">
              <Stack>
                <TextInput
                  size="md"
                  type="text"
                  name="event name"
                  label={tForm('Name')}
                  placeholder={tForm('Placeholders.Name')}
                  value={name}
                  onChange={(event) => setName(event.currentTarget.value)}
                  required
                  data-autofocus
                  leftSection={<IconLabel size={20} />}
                  leftSectionPointerEvents="none"
                />
                <TextInput
                  size="md"
                  type="date"
                  name="event start date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.currentTarget.value)}
                  label={tForm('StartDate')}
                  placeholder={tForm('Placeholders.StartDate')}
                  required
                  leftSection={<IconCalendar size={20} />}
                  leftSectionPointerEvents="none"
                />
                <TextInput
                  size="md"
                  type="date"
                  name="event start date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.currentTarget.value)}
                  label={tForm('EndDate')}
                  placeholder={tForm('Placeholders.EndDate')}
                  min={startDate || undefined} // Prevent end date before start date
                  required
                  leftSection={<IconCalendar size={20} />}
                  leftSectionPointerEvents="none"
                />
                <MultiSelect
                  size='md'
                  name="participants"
                  type='text'
                  label={tForm('Participants')}
                  placeholder={tForm('Placeholders.Participants')}
                  data={Object.keys(userSelectData)}
                  value={participants}
                  renderOption={renderMultiSelectOption}
                  onChange={(value) => {setParticipants(value); handleFormChange(value)}}
                  searchable
                  required
                  hidePickedOptions
                  nothingFoundMessage="No users found"
                />
                <TagsInput
                  size='md'
                  type='text'
                  name="bodies of water"
                  label={tForm('BodyOfWater')}
                  placeholder={tForm('Placeholders.BodyOfWater')}
                  value={bodiesOfWater}
                  onChange={setBodiesOfWater}
                  clearable
                  required
                  data={CatchUtils.getUniqueBodiesOfWater(catches).map(item => item.bodyOfWater)}
                />
                <Group grow mt="md">
                  <Button
                    size='md'
                    variant="default"
                    onClick={onCancelAction}
                    disabled={loading}
                    leftSection={<IconTrash size={20} />}
                  >
                    {t('Common.Cancel')}
                  </Button>
                  <Button
                    size='md'
                    type="submit"
                    loading={loading}
                    disabled={!isFormValid}
                    leftSection={<IconCheck size={20} />}
                  >
                    {t('CommunityPage.CreateEvent')}
                  </Button>
                </Group>
              </Stack>
            </Fieldset>
          </form>
        </Stack>
      </Container>
    </Paper>
  );
}