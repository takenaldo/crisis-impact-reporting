import { useDisclosure } from "@mantine/hooks";
// 1. Added Checkbox to the imports
import {
  Drawer,
  Button,
  Radio,
  Stack,
  Title,
  Text,
  ScrollArea,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { api } from "./utils";
import { notifications } from "@mantine/notifications";
import { IconApi } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import ImpactReportForm from "./ImpactReportForm";

export function MobileFormDrawer2({ opened, onClose }) {
  const navigate = useNavigate();
  // const [opened, { open, close }] = useDisclosure(true);

  return (
    <>
      <Drawer
        opened={opened}
        onClose={onClose}
        position="bottom"
        size="90%"
        radius="xl"
        styles={{
          body: {
            height: "calc(100% - 70px)",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <ScrollArea h="100%" offsetScrollbars type="never" style={{ flex: 1 }}>
          <ImpactReportForm />
        </ScrollArea>
      </Drawer>
    </>
  );
}
