import React, { useRef, useState, useCallback } from "react";
import {
  Button,
  Group,
  Image,
  Stack,
  Text,
  SimpleGrid,
  ActionIcon,
  Box,
  Textarea,
  UnstyledButton,
  FileButton,
  Card,
} from "@mantine/core";
import Webcam from "react-webcam";
import { IconCamera, IconUpload, IconX } from "@tabler/icons-react";

// Helper to convert base64 camera snaps into File objects
function dataURLtoFile(dataurl, filename) {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export const MediaCapturePreview = ({ form, photoObj, fieldName, index }) => {
  return (
    <Card
      padding="0"
      radius="md"
      withBorder
      h="100%"
      pos="relative"
      style={{ overflow: "hidden" }}
    >
      {/* Absolute delete button layered cleanly on top-right of image */}
      <ActionIcon
        color="red"
        variant="filled"
        radius="xl"
        size="md"
        pos="absolute"
        top={8}
        right={8}
        style={{ zIndex: 2 }}
        onClick={() => {
          form.removeListItem(fieldName, index);
        }}
      >
        <IconX size={16} />
      </ActionIcon>

      <Image src={photoObj.preview} fit="cover" height={120} />

      {/* Styled caption block beneath the image */}
      <Box p="xs" bg="var(--mantine-color-body)">
        <Textarea
          placeholder="Add a caption..."
          radius="xs"
          size="xs"
          variant="unstyled"
          rows={2}
          autosize
          maxRows={3}
          value={photoObj.description || ""}
          onChange={(e) =>
            form.setFieldValue(
              `${fieldName}.${index}.description`,
              e.currentTarget.value,
            )
          }
          styles={{
            input: {
              padding: 0,
              fontSize: "12px",
              lineHeight: "1.4",
            },
          }}
        />
      </Box>
    </Card>
  );
};

export function MediaCaptureInput({ form, fieldName = "photos" }) {
  const webcamRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const photos = form.values[fieldName] || [];
  const error = form.errors[fieldName];

  // 1. Handle Camera Capture
  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return;
      const file = dataURLtoFile(imageSrc, `camera_snap_${Date.now()}.jpg`);

      form.insertListItem(fieldName, {
        file,
        preview: imageSrc,
        description: "",
      });
    }
  }, [webcamRef, form, fieldName]);

  // 2. Handle File Upload Appending
  const handleFileUpload = (newFiles) => {
    const mappedFiles = newFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      description: "",
    }));

    form.setFieldValue(fieldName, [...photos, ...mappedFiles]);
  };

  return (
    <Stack gap="sm">
      {/* Space-Saving Compact Input Controls */}
      {!isCameraOpen && (
        <SimpleGrid cols={2} spacing="xs">
          <FileButton
            onChange={handleFileUpload}
            multiple
            accept="image/png,image/jpeg,image/heic"
          >
            {(props) => (
              <UnstyledButton
                {...props}
                p="xs"
                bg="var(--mantine-color-gray-0)"
                bd="1px dashed var(--mantine-color-gray-4)"
                style={{
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  height: "44px",
                }}
              >
                <IconUpload
                  size={18}
                  color="var(--mantine-color-gray-7)"
                  stroke={1.5}
                />
                <Text size="xs" fw={500} c="dimmed">
                  Upload Files
                </Text>
              </UnstyledButton>
            )}
          </FileButton>

          <UnstyledButton
            onClick={() => setIsCameraOpen(true)}
            p="xs"
            bg="var(--mantine-color-gray-0)"
            bd="1px dashed var(--mantine-color-gray-4)"
            style={{
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              height: "44px",
            }}
          >
            <IconCamera
              size={18}
              color="var(--mantine-color-gray-7)"
              stroke={1.5}
            />
            <Text size="xs" fw={500} c="dimmed">
              Open Camera
            </Text>
          </UnstyledButton>
        </SimpleGrid>
      )}

      {/* Active Camera View */}
      {isCameraOpen && (
        <Card withBorder padding={0} radius="md" pos="relative">
          <Stack gap={0}>
            {/* Red 'X' Close Button (Top Right) */}
            <ActionIcon
              color="red"
              variant="filled"
              radius="xl"
              size="lg"
              pos="absolute"
              top={10}
              right={10}
              style={{ zIndex: 10 }}
              onClick={() => setIsCameraOpen(false)}
            >
              <IconX size={20} />
            </ActionIcon>

            {/* Webcam View */}
            <Box style={{ width: "100%", overflow: "hidden", lineHeight: 0 }}>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "environment" }}
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </Box>

            {/* Control Bar beneath the video feed */}
            <Box
              p="sm"
              bg="#E6F4F1"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderTop: "1px solid var(--mantine-color-dark-7)",
              }}
            >
              {/* Native UI Shutter Button with nested Camera Icon */}
              <UnstyledButton
                onClick={capture}
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  backgroundColor: "white",
                  border: "4px solid rgba(255, 255, 255, 0.4)",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4)",
                  cursor: "pointer",
                  transition: "transform 0.1s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                active={{ transform: "scale(0.92)" }}
              >
                <IconCamera size={24} color="#333333" stroke={2} />
              </UnstyledButton>
            </Box>
          </Stack>
        </Card>
      )}

      {/* Unified Preview Gallery */}
      {photos.length > 0 && (
        <Box>
          <Text size="xs" fw={600} mb="xs" c="dimmed">
            Attached Images ({photos.length})
          </Text>
          <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="xs">
            {photos.map((photoObj, index) => (
              <Box key={index}>
                <MediaCapturePreview
                  index={index}
                  photoObj={photoObj}
                  fieldName={fieldName}
                  form={form}
                />
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      )}

      {error && (
        <Text c="red" size="sm" fw={500}>
          {error}
        </Text>
      )}
    </Stack>
  );
}
