import { Button, Center, Group, Stack, Text } from "@mantine/core";
import { IconBuilding, IconUser } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { getUserDetails } from "./utils";
import LoginPage from "./LoginPage";

const Profile = () => {
  const navigate = useNavigate();

  const user = getUserDetails();
  return (
    <Center h={"100%"}>
      {user ? (
        <Stack gap={5}>
          <Group>
            <IconUser size={16} />
            <Text c={"gray"} fw={"bold"}>
              {user?.first_name} {user?.last_name}
            </Text>
          </Group>

          <Group>
            <IconBuilding size={16} />
            <Text c={"gray"}>Best Ethiopia</Text>
          </Group>

          <Button
            onClick={() => {
              localStorage.removeItem("access_token");
              localStorage.removeItem("refresh_token");
              localStorage.removeItem("user");

              navigate("/");
            }}
            bg={"var(--color-red-orange)"}
            mt={20}
          >
            Log Out
          </Button>
        </Stack>
      ) : (
        <Stack gap={5}>
          <LoginPage />
        </Stack>
      )}
    </Center>
  );
};

export default Profile;
