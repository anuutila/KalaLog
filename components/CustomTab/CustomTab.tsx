import React from 'react';
import Link from 'next/link';
import { TablerIcon } from '@tabler/icons-react';
import { Button } from '@mantine/core';
import classes from './CustomTab.module.css';

interface CustomTabProps {
  icon: TablerIcon;
  path: string;
  label: string;
  isActive: boolean;
}

const CustomTab: React.FC<CustomTabProps> = ({ icon: Icon, path, label, isActive }) => (
  <Link href={path} passHref className={classes.link} prefetch>
    <Button
      component="span"
      variant="subtle"
      className={`${classes.tab_button} ${isActive ? classes.active : ''}`}
      radius={0}
      p={0}
    >
      <div className={classes.icon_label_container}>
        <div>
          <Icon className={classes.icon} />
        </div>
        <span className={classes.label}>{label}</span>
      </div>
    </Button>
  </Link>
);

export default CustomTab;
