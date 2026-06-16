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
import { notifications } from "@mantine/notifications";
import { IconApi } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import api from "./api";

export function MobileFormDrawer({ reportID }) {
  const navigate = useNavigate();
  const [opened, { open, close }] = useDisclosure(true);

  const [crisisRecommendations, setCrisisRecommendations] = useState([]);
  const [crisis, setCrisis] = useState(null);

  useEffect(() => {
    const fetchMappingRecommendations = async () => {
      try {
        const response = await api.get(
          "/impact-reports/" + reportID + "/get_mapping_recommendations/",
        );
        setCrisisRecommendations(response.data);
      } catch (error) {}
    };

    fetchMappingRecommendations();
  }, []);

  const handleSubmit = async () => {
    if (crisis !== null) {
      try {
        await api.put("/impact-reports/" + reportID + "/", {
          crisis_id: crisis,
        });

        notifications.show({
          title: "Success",
          message: "Report Mapped to a crisis succesfullly.",
          color: "green",
          icon: <IconApi />,
        });

        navigate("/");
      } catch (error) {}
    }
  };

  return (
    <>
      <Drawer
        opened={opened}
        onClose={close}
        position="bottom"
        size="90%"
        radius="xl"
        title={
          <Stack gap={2}>
            <Title order={4}>Community Needs Assessment</Title>
            <Text size="xs" c="dimmed">
              Post-crisis situational report
            </Text>
          </Stack>
        }
        styles={{
          body: {
            height: "calc(100% - 70px)",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <ScrollArea h="100%" offsetScrollbars type="never" style={{ flex: 1 }}>
          <Stack gap="xl" pb="xl">
            <Stack>
              <Radio.Group
                label="Damage Severity"
                required
                onChange={(e) => {
                  setCrisis(e);
                }}
                // {...form.getInputProps("damageSeverity")}
              >
                <Stack gap="xs" mt="xs">
                  {crisisRecommendations?.map((crisis) => (
                    <Radio
                      key={crisis.id}
                      value={crisis.id}
                      label={crisis.name}
                    />
                  ))}
                </Stack>
              </Radio.Group>
            </Stack>

            <Stack gap="xs" mt="md">
              <Button
                // type="submit"
                color="red"
                fullWidth
                size="md"
                onClick={() => handleSubmit()}
              >
                Submit
              </Button>
              <Button
                variant="subtle"
                color="gray"
                fullWidth
                size="md"
                onClick={close}
              >
                Cancel
              </Button>
            </Stack>
          </Stack>
        </ScrollArea>
      </Drawer>
    </>
  );
}
