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
} from "@mantine/core";
import Webcam from "react-webcam";
import { IconCamera, IconUpload } from "@tabler/icons-react";

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
    <>
      <Image src={photoObj.preview} radius="md" fit="cover" height={150} />
      <ActionIcon
        color="red"
        variant="filled"
        radius="xl"
        size="sm"
        pos="absolute"
        top={4}
        right={4}
        onClick={() => {
          // FIX 1: Deleting from this single array automatically cleans up everything
          form.removeListItem(fieldName, index);
        }}
      >
        ✕
      </ActionIcon>
      <Group gap={0}>
        <Textarea
          placeholder="Add a caption ..."
          radius="xs"
          size="xs"
          pos="absolute"
          bottom={4}
          left={4}
          // FIX 2: Controlled input bound to the nested object state
          value={photoObj.description || ""}
          // FIX 3: Clean Mantine nested string-path state update
          onChange={(e) =>
            form.setFieldValue(
              `${fieldName}.${index}.description`,
              e.currentTarget.value,
            )
          }
          styles={{
            input: {
              backgroundColor: "rgba(0, 0, 0, 0.5)", // Transparent gray
              color: "white",
              border: "none",
              padding: "4px 8px",
            },
          }}
        />
      </Group>
    </>
  );
};

export function MediaCaptureInput({ form, fieldName = "photos" }) {
  const webcamRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Safely grab the current array and errors for this specific field
  const photos = form.values[fieldName] || [];
  const error = form.errors[fieldName];

  // 1. Handle Camera Capture
  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      const file = dataURLtoFile(imageSrc, `camera_snap_${Date.now()}.jpg`);

      // FIX 4: Initialize item with an empty description field
      form.insertListItem(fieldName, {
        file,
        preview: imageSrc,
        description: "",
      });
    }
  }, [webcamRef, form, fieldName]);

  // 2. Handle File Upload Appending
  const handleFileUpload = (newFiles) => {
    // FIX 5: Initialize mapped upload files with an empty description field
    const mappedFiles = newFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      description: "",
    }));

    // Merge existing photos with newly uploaded ones
    form.setFieldValue(fieldName, [...photos, ...mappedFiles]);
  };

  return (
    <Stack spacing="sm">
      {/* Input Controls */}
      {!isCameraOpen && (
        <SimpleGrid cols={2} spacing="md">
          <FileButton
            onChange={handleFileUpload}
            multiple
            accept="image/png,image/jpeg,image/heic"
          >
            {(props) => (
              <UnstyledButton
                {...props}
                style={{
                  border: "2px dashed #e9ecef",
                  borderRadius: "8px",
                  padding: "32px 16px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  backgroundColor: "#f8f9fa",
                }}
              >
                <IconUpload size={32} color="#868e96" stroke={1.5} />
                <Text size="sm" mt="xs" weight={500} color="dimmed">
                  Upload Files
                </Text>
              </UnstyledButton>
            )}
          </FileButton>

          <UnstyledButton
            onClick={() => setIsCameraOpen(true)}
            style={{
              border: "2px dashed #e9ecef",
              borderRadius: "8px",
              padding: "32px 16px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              backgroundColor: "#f8f9fa",
            }}
          >
            <IconCamera size={32} color="#868e96" stroke={1.5} />
            <Text size="sm" mt="xs" weight={500} color="dimmed">
              Open Camera
            </Text>
          </UnstyledButton>
        </SimpleGrid>
      )}

      {/* Active Camera View */}
      {isCameraOpen && (
        <Stack
          align="center"
          spacing="xs"
          p="sm"
          style={{ border: "1px dashed #ccc", borderRadius: 8 }}
        >
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: "environment" }}
            style={{ width: "100%", borderRadius: "8px" }}
          />
          <Group>
            <Button variant="default" onClick={() => setIsCameraOpen(false)}>
              Close Camera
            </Button>
            <Button color="blue" onClick={capture}>
              Snap Photo
            </Button>
          </Group>
        </Stack>
      )}

      {/* Unified Preview Gallery */}
      {photos.length > 0 && (
        <Box mt="xs">
          <Text size="sm" weight={500} mb="xs">
            Attached Images ({photos.length})
          </Text>
          <SimpleGrid cols={2} spacing="sm">
            {photos.map((photoObj, index) => (
              <Box key={index} pos="relative">
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
        <Text color="red" size="sm">
          {error}
        </Text>
      )}
    </Stack>
  );
}
