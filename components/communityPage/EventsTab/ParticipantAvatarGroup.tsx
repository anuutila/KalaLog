import { nameToColor } from "@/lib/utils/utils";
import { Avatar, AvatarGroup, darken, Stack, Text, Tooltip } from "@mantine/core";

interface IParticipantAvatarGroupProps {
  participantNames: string[];
  disableTooltip?: boolean;
  maxAvatarsVisible?: number;
}

export default function ParticipantAvatarGroup({ participantNames, maxAvatarsVisible = 4, disableTooltip = false }: IParticipantAvatarGroupProps) {

  const maxAvatars = participantNames.length > maxAvatarsVisible ? (maxAvatarsVisible - 1) : maxAvatarsVisible;

  const tooltipLabelContent = (remainingNames: string[]) => (
    <Stack gap={2}>
      {remainingNames.map(name => (
        <Text key={name} size="sm">{name}</Text>
      ))}
    </Stack>
  );

  const borderColorGray = darken(`var(--mantine-color-gray-light-color)`, 0.5);

  return (
    <AvatarGroup>
      {participantNames.slice(0, maxAvatars).map(participant => {
        const color = nameToColor(participant);
        const borderColor = darken(`var(--mantine-color-${color}-light-color)`, 0.5);
        return (
          <Tooltip
            disabled={disableTooltip}
            key={participant}
            label={participant}
            withArrow
            arrowSize={8}
            position="top"
            events={{ hover: true, focus: true, touch: true }}>
            <Avatar
              size={36}
              radius={'xl'}
              name={participant}
              color={color}
              style={{
                border: `3px solid ${borderColor}`,
                outline: '2px solid var(--my-ui-item-background-color)',
                outlineOffset: '-1px',
                boxSizing: 'content-box'
              }}
            />
          </Tooltip>
        );
      })}
      {participantNames.length > maxAvatars &&
        <Tooltip
          disabled={disableTooltip}
          label={tooltipLabelContent(participantNames.slice(maxAvatars))}
          withArrow
          arrowSize={8}
          position="top"
          events={{ hover: true, focus: true, touch: true }}
        >
          <Avatar
            size={36}
            radius="xl"
            color="gray"
            style={{
              border: `3px solid ${borderColorGray}`,
              outline: '2px solid var(--my-ui-item-background-color)',
              outlineOffset: '-1px',
              boxSizing: 'content-box'
            }}
          >
            +{participantNames.length - maxAvatars}
          </Avatar>
        </Tooltip>
      }
    </AvatarGroup>
  );
}