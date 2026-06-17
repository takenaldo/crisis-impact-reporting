import { useState } from "react";

import {
  Button,
  Center,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";

import api from "./api";

import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState();
  const [password, setPassword] = useState();

  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      const response = await api.post("login/", {
        username: username,
        password: password,
      });

      console.log(response);

      // 1. Extract the tokens from the DRF response
      const { access, refresh } = response.data;

      // 2. Store them (localStorage is common, though HttpOnly cookies are more secure)
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      console.log("Login successful! Tokens saved.");

      navigate("/home");
      console.log(",,,,");
      // return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  const handleSetValues = () => {
    if (!username) {
      setError("User account not selected!");
    } else if (!password) {
      setError("Password is required");
    } else {
      handleSubmit(username, password);
    }
  };

  return (
    <Center>
      <Stack gap={15}>
        <TextInput
          label="Username"
          description="Select your user account in order to write the log"
          onChange={(value) => {
            setUsername(value.target.value);
          }}
        ></TextInput>

        <PasswordInput
          label="Password"
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />

        <Text size="xs" c={"red"}>
          {error}
        </Text>

        <Button onClick={() => handleSetValues()}>Submit</Button>
      </Stack>
    </Center>
  );
};
export default LoginPage;
