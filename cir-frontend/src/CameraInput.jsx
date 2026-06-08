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
} from "@mantine/core";
import Webcam from "react-webcam";

export function CameraInput({ form, fieldName = "photos" }) {
  const webcamRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Safely get the current photos array from the form state
  const photos = form.values[fieldName] || [];
  const error = form.errors[fieldName];

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      // Insert the new base64 string into the Mantine form array
      form.insertListItem(fieldName, imageSrc);
    }
  }, [webcamRef, form, fieldName]);

  return (
    <Stack spacing="sm">
      <Group position="apart">
        <Text size="sm" weight={500}>
          Captured Photos ({photos.length})
        </Text>
        {!isCameraOpen && (
          <Button
            variant="outline"
            size="xs"
            onClick={() => setIsCameraOpen(true)}
          >
            Open Camera
          </Button>
        )}
      </Group>

      {/* Camera View */}
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
            videoConstraints={{ facingMode: "user" }}
            style={{ width: "100%", borderRadius: "8px" }}
          />
          <Group>
            <Button variant="default" onClick={() => setIsCameraOpen(false)}>
              Done
            </Button>
            <Button color="blue" onClick={capture}>
              Snap Photo
            </Button>
          </Group>
        </Stack>
      )}

      {/* Image Gallery Preview */}
      {photos.length > 0 && (
        <SimpleGrid cols={3} spacing="sm">
          {photos.map((src, index) => (
            <Box key={index} pos="relative">
              <Image src={src} radius="md" fit="cover" height={100} />
              <ActionIcon
                color="red"
                variant="filled"
                radius="xl"
                size="sm"
                pos="absolute"
                top={4}
                right={4}
                onClick={() => form.removeListItem(fieldName, index)}
              >
                ✕
              </ActionIcon>
            </Box>
          ))}
        </SimpleGrid>
      )}

      {/* Error Message */}
      {error && (
        <Text color="red" size="sm">
          {error}
        </Text>
      )}
    </Stack>
  );
}
