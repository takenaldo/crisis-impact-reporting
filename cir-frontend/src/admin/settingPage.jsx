import React, { useState } from "react";
import {
  Title,
  Text,
  Stack,
  Button,
  Grid,
  Card,
  Badge,
  Switch,
  Select,
  Box,
  Container,
} from "@mantine/core";

import { COLORS } from "../utils";

export function SettingsPage() {
  return (
    <Box bg={COLORS.lightBackground} minHeight="100vh" py="md" px="lg"></Box>
  );
}
