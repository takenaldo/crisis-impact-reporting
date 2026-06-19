import React, { useState } from "react";
import "./MobileContainer.css";
import { Button, Group, Paper, Radio, Stack, Text } from "@mantine/core";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";

const MobileContainer = ({ children }) => {
  const [selectedView, setSelectedView] = useState("web");
  const [showSelector, setShowSelector] = useState(true);
  return (
    <Stack>
      <Group justify="right" align="flex-end">
        <Paper withBorder p="md" radius="md" bg="#E6F4F1" w={"100%"}>
          <Group justify="space-between">
            {showSelector && (
              <Radio.Group
                withAsterisk
                ff="Poppins"
                onChange={(v) => {
                  setSelectedView(v);
                  //   setShowSelector(false);
                }}
              >
                <Stack gap="xs" mt="sm">
                  <Radio
                    value="mobile_demo_view"
                    label="Mobile View for demo purposes only, if user is on PC"
                    ff="Poppins"
                  />
                  <Radio
                    value="web"
                    label="Web Browser, Bult for mobile browsers"
                    ff="Poppins"
                  />
                </Stack>
              </Radio.Group>
            )}
          </Group>
          <Group>
            <Button
              onClick={() => {
                setShowSelector(!showSelector);
              }}
              variant="light"
            >
              {showSelector ? (
                <IconChevronUp size={16} />
              ) : (
                <IconChevronDown size={16} />
              )}
            </Button>
            <Text> Choose how to view the MVP</Text>
          </Group>
        </Paper>
      </Group>

      {selectedView === "mobile_demo_view" && (
        <div className="mobile-wrapper">
          <div className="mobile-device">
            {/* The top notch (camera/speaker area) */}
            <div className="mobile-notch"></div>

            {/* The scrollable screen area */}
            <div className="mobile-screen">{children}</div>
          </div>
        </div>
      )}
      {selectedView === "web" && <>{children}</>}
    </Stack>
  );
};

export default MobileContainer;
