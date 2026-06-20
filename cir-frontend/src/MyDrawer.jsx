import { Container, Drawer, ScrollArea } from "@mantine/core";

export const MyDrawer = ({ children, opened, onClose }) => {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="bottom"
      size="90%"
      radius="xl"
      title="Map View"
      withCloseButton={true}
      styles={{
        header: {
          paddingTop: "16px",
          paddingBottom: "16px",
          borderBottom: "1px solid #E2E8F0",
        },
        title: {
          flex: 1,
          marginRight: "16px",
        },
        body: {
          height: "calc(100% - 95px)",
          display: "flex",
          flexDirection: "column",
          padding: 0,
        },
        close: {
          size: "lg",
          marginTop: "10px",
        },
      }}
    >
      <ScrollArea h="100%" offsetScrollbars type="never" style={{ flex: 1 }}>
        <Container
          size="sm"
          py={{ base: "md", sm: "lg" }}
          pb="90px"
          px="md"
          style={{ position: "relative" }}
        >
          {children}
        </Container>
      </ScrollArea>
    </Drawer>
  );
};
