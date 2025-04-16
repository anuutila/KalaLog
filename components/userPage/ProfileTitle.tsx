import { IPublicUserProfile } from '@/lib/types/user';
import { Title, Box, Group } from '@mantine/core';
import { useState, useRef, useEffect } from 'react';
import LevelIcon from '../LevelIcon/LevelIcon';

interface ProfileTitleProps {
  profileData: IPublicUserProfile;
}

export default function ProfileTitle({ profileData }: ProfileTitleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  // State to determine if there isn't enough space
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const checkSpace = () => {
      if (containerRef.current && titleRef.current && iconRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const titleContentWidth = titleRef.current.clientWidth;
        const iconWidth = iconRef.current.clientWidth;

        if ((titleContentWidth + iconWidth) > (containerWidth)) {
          setIsNarrow(true);
        } else {
          setIsNarrow(false);
        }
      }
    };

    // Run the check on mount and whenever profile data changes
    checkSpace();

    // Also check on window resize
    window.addEventListener('resize', checkSpace);
    return () => {
      window.removeEventListener('resize', checkSpace);
    };
  }, [profileData.firstName, profileData.lastName]);

  return (
    <Box maw={'100%'} w={'100%'}>
      <Group ref={containerRef} wrap='nowrap' pl={15} gap={0} maw={'100%'} w={'100%'} justify='center'>
      <Title ref={titleRef} order={1} c="white" style={{ textAlign: 'center', textWrap: `${isNarrow ? 'wrap' : 'nowrap'}` }} w={isNarrow ? 'min-content' : 'auto'}>
        {profileData.firstName} {profileData.lastName}
      </Title>
      <Box ref={iconRef}>
        <LevelIcon level={profileData.level} absolutePos={false} />
      </Box>
        </Group>
    </Box>
  );
}
