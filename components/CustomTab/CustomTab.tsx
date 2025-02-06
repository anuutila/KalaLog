import React from 'react';
import Link from 'next/link';
import { TablerIcon } from '@tabler/icons-react';
import { Button } from '@mantine/core';
import classes from './CustomTab.module.css';
import { useTranslations } from 'next-intl';

interface CustomTabProps {
  icon: TablerIcon;
  path: string;
  label: string;
  isActive: boolean;
}

export default function CustomTab({ icon: Icon, path, label, isActive }: CustomTabProps) {
  const t = useTranslations();

  return (
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
        <span className={classes.label}>{t(label)}</span>
      </div>
    </Button>
  </Link>
  )
};
