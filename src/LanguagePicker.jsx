import { useState } from "react";
import {
  Menu,
  Button,
  Group,
  ChevronIcon,
  ActionIcon,
  Indicator,
} from "@mantine/core";
import {
  IconChevronDown,
  IconChevronsUpLeft,
  IconWorld,
} from "@tabler/icons-react";
import i18n from "./i18n";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "ch", label: "中文" },
  { value: "ar", label: "العربية" },
  { value: "ru", label: "Русский" },
  { value: "am", label: "Amharic" },
];

export function LanguagePicker() {
  const [opened, setOpened] = useState(false);
  const [currentLang, setCurrentLang] = useState(LANGUAGES[0]);

  const { i18n } = useTranslation();

  return (
    <>
      <Menu
        opened={opened}
        onChange={setOpened}
        shadow="md"
        width={160}
        position="bottom-end"
        transitionProps={{ transition: "pop-top-right", duration: 150 }}
      >
        <Menu.Target>
          <Group>
            <Indicator
              inline
              label={currentLang.value}
              size={16}
              offset={4}
              color="var(--color-teal)"
            >
              <ActionIcon variant="subtle" color="dark">
                <IconWorld size={24} />
              </ActionIcon>
            </Indicator>

            <span style={{ fontSize: "14px", fontWeight: 500 }}></span>
          </Group>
        </Menu.Target>

        <Menu.Dropdown>
          {LANGUAGES.map((lang) => (
            <Menu.Item
              key={lang.value}
              leftSection={<span>{lang.value}</span>}
              onClick={() => {
                i18n.changeLanguage(lang.value);
                setCurrentLang(lang);
              }}
              disabled={currentLang.value === lang.value}
              style={{
                fontWeight: currentLang.value === lang.value ? 600 : 400,
              }}
            >
              {lang.label}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
    </>
  );
}
