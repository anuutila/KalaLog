import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconLanguage } from '@tabler/icons-react';
import { useLocale, useTranslations } from 'next-intl';
import { ActionIcon, CheckIcon, Combobox, Group, Text, useCombobox } from '@mantine/core';

import './LanguageSwitcher.css';

enum locales {
  fi = 'fi',
  en = 'en',
}

export default function LanguageSwitcher() {
  const t = useTranslations('Locales');
  const [locale, setLocale] = useState<string>(useLocale());
  const router = useRouter();

  useEffect(() => {
    const localeCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('KALALOG_LOCALE='))
      ?.split('=')[1];
    if (localeCookie) {
      setLocale(localeCookie);
    } else {
      const browserLocale = navigator.language.split('-')[0];
      if (Object.values(locales).includes(browserLocale as locales)) {
        setLocale(browserLocale);
      }
      document.cookie = `KALALOG_LOCALE=${locale};`;
      router.refresh();
    }
  }, [router]);

  const changeLocale = (locale: string) => {
    setLocale(locale);
    document.cookie = `KALALOG_LOCALE=${locale};`;
    router.refresh();
  };

  useEffect(() => {
    changeLocale(locale);
  }, [locale]);

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const options = Object.values(locales).map((item) => (
    <Combobox.Option value={item} key={item}>
      <Group gap="sm">
        {locale === item ? <CheckIcon size={12} /> : null}
        <Text fw={500}>{t(item)}</Text>
      </Group>
    </Combobox.Option>
  ));

  return (
    <>
      <Combobox
        transitionProps={{ transition: 'slide-left' }}
        store={combobox}
        width={150}
        position="bottom-end"
        withArrow
        onOptionSubmit={(val) => {
          setLocale(val);
          combobox.closeDropdown();
        }}
        styles={{ dropdown: { background: 'var(--mantine-color-dark-8)' } }}
      >
        <Combobox.Target>
          <ActionIcon bg="var(--mantine-color-dark-8)" variant="default" onClick={() => combobox.toggleDropdown()}>
            <IconLanguage size={20} />
          </ActionIcon>
        </Combobox.Target>

        <Combobox.Dropdown>
          <Combobox.Options>{options}</Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
    </>
  );
}
