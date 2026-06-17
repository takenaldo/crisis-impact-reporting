import React, { useState } from "react";
import {
  MantineProvider,
  Group,
  Text,
  ActionIcon,
  Indicator,
  Paper,
  Box,
  Button,
  Stack,
  Flex,
  ThemeIcon,
  Badge,
  Image,
} from "@mantine/core";
import {
  IconMenu2,
  IconBell,
  IconMapPinFilled,
  IconX,
  IconPlus,
  IconMinus,
  IconCurrentLocation,
  IconArrowRight,
  IconHome,
  IconFileDescription,
  IconInfoCircle,
  IconUser,
  IconWorld,
} from "@tabler/icons-react";
import { MobileFormDrawer2 } from "./MobileFormDrawer2";
import ImpactReportForm from "./ImpactReportForm";
import { useTranslation } from "react-i18next";
import { LanguagePicker } from "./LanguagePicker";

import IconUNDP from "./icon-undp.png";
import Home from "./Home";
import MyReports from "./MyReports";
import Information from "./Information";
import Profile from "./Profile";

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
    <Group justify="space-between" px="md" pt="xl" pb="sm">
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
        <Indicator color={COLORS.redOrange} size={10} offset={4} withBorder>
          <ActionIcon variant="subtle" color="dark">
            <IconBell size={24} />
          </ActionIcon>
        </Indicator>
      </Group>
    </Group>
  );
}
