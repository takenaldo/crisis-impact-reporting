import React from "react";
import { Group, Text, ActionIcon, Indicator, Box, Image } from "@mantine/core";
import { IconMenu2, IconBell } from "@tabler/icons-react";

import { useTranslation } from "react-i18next";
import { LanguagePicker } from "./LanguagePicker";

import IconUNDP from "./icon-undp.png";
import { getUserDetails } from "./utils";

// Design System Colors
const COLORS = {
  navy: "#0D3B66",
  teal: "#009C9A",
  redOrange: "#E76F51",
  amber: "#F4A261",
  mint: "#E6F4F1",
  gray: "#868E96",
};

export default function Header() {
  const { t } = useTranslation();

  return (
    <Group justify="space-between" px="md" pt="xs" pb="sm">
      <Group gap="sm">
        <ActionIcon variant="subtle" color="dark">
          <IconMenu2 size={24} />
        </ActionIcon>
        <Group gap={8}>
          <Box c="white" px={4} py={2} style={{ borderRadius: 4 }}>
            <Image src={IconUNDP} h={30} />
          </Box>
          <Box>
            <Text
              fz={14}
              fw={700}
              c={COLORS.navy}
              style={{ fontFamily: "Montserrat", lineHeight: 1.2 }}
            >
              {t("Crisis Impact")}
            </Text>
            <Text
              fz={14}
              fw={700}
              c={COLORS.navy}
              style={{ fontFamily: "Montserrat", lineHeight: 1.2 }}
            >
              {t("Reporting")}
            </Text>
          </Box>
        </Group>
      </Group>
      <Group gap={1}>
        <LanguagePicker />
        {getUserDetails() !== null && (
          <Indicator color={COLORS.redOrange} size={10} offset={4} withBorder>
            <ActionIcon variant="subtle" color="dark">
              <IconBell size={24} />
            </ActionIcon>
          </Indicator>
        )}
      </Group>
    </Group>
  );
}
