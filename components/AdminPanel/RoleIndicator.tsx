import { useState } from 'react';
import { FloatingIndicator, UnstyledButton } from '@mantine/core';
import { IUser, UserRole } from '@/lib/types/user';
import classes from './FloatingIndicator.module.css';

interface RoleIndicatorProps {
  options: UserRole[];
  user: IUser;
  handleToggle: (userId: string, role: UserRole) => void;
}

export default function RoleIndicator({ options, user, handleToggle }: RoleIndicatorProps) {
  const [rootRef, setRootRef] = useState<HTMLDivElement | null>(null);
  const [controlsRefs, setControlsRefs] = useState<Record<string, HTMLButtonElement | null>>({});
  const [active, setActive] = useState(Object.values(UserRole).reverse().indexOf(user.role));

  const setControlRef = (index: number) => (node: HTMLButtonElement) => {
    controlsRefs[index] = node;
    setControlsRefs(controlsRefs);
  };

  const controls = options.map((item, index) => (
    <UnstyledButton
      key={item}
      className={classes.control}
      ref={setControlRef(index)}
      onClick={() => {
        setActive(index);
        handleToggle(user.id ?? '', item);
      }}
      mod={{ active: active === index }}
    >
      <span className={classes.controlLabel}>{item}</span>
    </UnstyledButton>
  ));

  return (
    <div className={classes.root} ref={setRootRef}>
      {controls}

      <FloatingIndicator target={controlsRefs[active]} parent={rootRef} className={classes.indicator} />
    </div>
  );
}
