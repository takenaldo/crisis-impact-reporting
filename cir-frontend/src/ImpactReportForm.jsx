import {
  TextInput,
  Textarea,
  Select,
  Checkbox,
  Button,
  Container,
  Title,
  Paper,
  Stack,
  FileInput,
  Fieldset,
  SimpleGrid,
  Radio,
  Notification,
  Group,
  Text,
  Autocomplete,
  Box,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import MapComponent from "./MapComponent";
import { IconApi } from "@tabler/icons-react";

import { api, dataURLtoFile } from "./utils"; // Adjust the path as needed
import { useNavigate, useParams } from "react-router-dom";
import { CameraInput } from "./CameraInput";
import { MediaCaptureInput } from "./MediaCaptureInput";
import { useEffect, useState } from "react";

import { notifications } from "@mantine/notifications";

// Mocking the Django constants from your .constants file
const CRISIS_CATEGORIES = [
  { value: "NATURAL", label: "Natural Disaster" },
  { value: "HUMAN", label: "Human-Made Crisis" },
];

const NATURE_OF_CRISIS_OPTIONS = [
  { value: "FLOOD", label: "Flood" },
  { value: "EARTHQUAKE", label: "Earthquake" },
  { value: "HURRICANE", label: "Hurricane" },
  { value: "WILDFIRE", label: "Wildfire" },
  { value: "LANDSLIDE", label: "Landslide" },
  { value: "TSUNAMI", label: "Tsunami" },
  { value: "DROUGHT", label: "Drought" },
  { value: "OTHER_NATURAL", label: "Other Natural Disaster" },
  { value: "CONFLICT", label: "Conflict/War" },
  { value: "TECH_FAILURE", label: "Technological Failure" },
  { value: "INDUSTRIAL_ACCIDENT", label: "Industrial Accident" },
  { value: "OTHER_HUMAN", label: "Other Human-Made Crisis" },
];

const DAMAGE_SEVERITIES = [
  { value: "NO DAMAGE", label: "No Damage" },
  { value: "MINIMAL", label: "Minimal" },
  { value: "PARTIAL", label: "Partial" },
  { value: "COMPLETE", label: "Complete" },
];

export default function ImpactReportForm() {
  const { id, name } = useParams();
  const navigate = useNavigate();

  const [crisisQuestions, setCrisisQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);

  const [nocQuestions, setNocQuestions] = useState([]);
  const [nocAnswers, setNocAnswers] = useState([]);

  const form = useForm({
    initialValues: {
      // Impact Report Base
      crisis_id: id || null,
      description: "",
      natureOfCrisis: null,
      natureOfCrisisCategory: "",
      damageSeverity: "",
      damageDatetime: null,

      // Infrastructure Details
      infrastructureName: "",
      infrastructureType: "",
      infrastructureDescription: "",
      accessibility: true,
      debris: false,
      debrisDescription: "",

      // Location (Maps to InfrastructureLocation model)
      infrastructure_latitude: "",
      infrastructure_longitude: "",
      street_address: "",

      city: "",
      state_province: "",
      country: "",
      street_address: "",
      // Photos (Maps to ManyToMany Photo model)
      photos: [],
      photoDescription: [],

      answers: [],
      noc_answers: [],
    },
  });

  useEffect(() => {
    const fetchQuestions = async () => {
      if (id !== null) {
        try {
          const response = await api.get(
            "crises/" + id + "/get_questions_for_crisis/",
          );
          setCrisisQuestions(response.data);
        } catch (error) {
        } finally {
        }
      }
    };

    fetchQuestions();
  }, [id]);

  useEffect(() => {
    const fetchNatureOfCrisisQuestions = async () => {
      if (form.values.natureOfCrisis !== null) {
        try {
          const response = await api.get(
            "nature-of-crisis-questions/get_nature_of_crisis_questions/?nature_of_crisis=" +
              form.values.natureOfCrisis,
          );
          setNocQuestions(response.data);
        } catch (error) {
        } finally {
        }
      }
    };

    fetchNatureOfCrisisQuestions();
  }, [form.values.natureOfCrisis]);

  // 2. Handle form submission
  const handleSubmit = async (values) => {
    const formData = new FormData();

    if (values.crisis_id) formData.append("crisis_id", values.crisis_id);

    formData.append("description", values.description);
    formData.append("natureOfCrisis", values.natureOfCrisis);
    formData.append("natureOfCrisisCategory", values.natureOfCrisisCategory);
    formData.append("damageSeverity", values.damageSeverity);
    formData.append(
      "damageDatetime",
      values.damageDatetime
        ? values.damageDatetime.toISOString()
        : new Date().toISOString(),
    );

    formData.append("infrastructureName", values.infrastructureName);
    formData.append("infrastructureType", values.infrastructureType);
    formData.append(
      "infrastructureDescription",
      values.infrastructureDescription,
    );
    formData.append("accessibility", values.accessibility);
    formData.append("debris", values.debris);
    formData.append("debrisDescription", values.debrisDescription);

    formData.append("infrastructure_latitude", values.infrastructure_latitude);
    formData.append(
      "infrastructure_longitude",
      values.infrastructure_longitude,
    );
    formData.append("street_address", values.street_address);
    formData.append("city", values.city);
    formData.append("state_province", values.state_province);
    formData.append("country", values.country);

    formData.append("answers", JSON.stringify(answers));
    formData.append("noc_answers", JSON.stringify(nocAnswers));

    // values.photos.forEach((photo) => {
    //   formData.append("photos", photo.file); // Add [] if your backend requires array notation
    // });

    values.photos.forEach((photoObj) => {
      formData.append("photos", photoObj.file);
      // formData.append("photoDescription", JSON.photoObj.description);
    });

    // const d = values.photos.map((photoObj) => photoObj.description);
    formData.append(
      "photoDescription",
      JSON.stringify(values.photos.map((photoObj) => photoObj.description)),
    );

    // values.photoDescription.forEach((description) => {
    // });

    try {
      // 3. Send to your API
      const response = await api.post("/impact-reports/", formData);

      form.reset(); // Clear the form on success

      notifications.show({
        title: "Report Submitted",
        message: "Your impact report has been successfully submitted.",
        color: "green",
        icon: <IconApi />,
      });
      navigate("/"); // Redirect to homepage or another page as needed
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <Container size="sm" py={{ base: "md", sm: "xl" }}>
      <Paper withBorder shadow="sm" p={{ base: "md", sm: "xl" }} radius="md">
        <Title order={2} ta="center" mb="lg">
          Submit Impact Report
        </Title>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="xl">
            {id && name && (
              <Group>
                <Text size="sm" c="dimmed">
                  Adding report for crisis:{" "}
                </Text>
                <Text component="span" size="lg" c={"#fa5252"} fw={"bolder"}>
                  {name}
                </Text>
              </Group>
            )}

            <Fieldset legend="Photos" radius="md">
              <Stack gap="md">
                <MediaCaptureInput form={form} fieldName="photos" />
              </Stack>
            </Fieldset>

            <Fieldset legend="Infrastructure" radius="md">
              <Stack gap="md">
                <Autocomplete
                  label="Infrastructure Type"
                  placeholder="Select or type infrastructure type"
                  data={[
                    "Residential Infrastructure (Houses and apartments)",
                    "Commercial Infrastructure (Markets, malls, shops, hotels, banks, industries, etc.)",
                    "Government Building (Administrative buildings, courthouses, police stations, fire stations, etc.)",
                    "Utility Infrastructure (Water pumps, power plants, waste treatment plants, etc.)",
                    "Transport and Communication Infrastructure (Roads, cell towers, bridges, railway station, bus station, etc.)",
                    "Community Infrastructure (Schools, hospitals, community halls, public toilets, etc.)",
                    "Public spaces/Recreation Infrastructure (stadiums, playgrounds, religious buildings, etc.)",
                    "Other, please specify",
                    "Other",
                  ]}
                  {...form.getInputProps("infrastructureType")}
                />

                <TextInput
                  label="Infrastructure Name"
                  placeholder="e.g., Main Street Bridge"
                  {...form.getInputProps("infrastructureName")}
                />
              </Stack>
            </Fieldset>
            <Fieldset legend="Damage" radius="md">
              <Stack gap="md">
                <Radio.Group
                  label="Damage Severity"
                  required
                  {...form.getInputProps("damageSeverity")}
                >
                  <Group gap="xs" mt="sm">
                    {DAMAGE_SEVERITIES.map((severity) => (
                      <Radio
                        key={severity.value}
                        value={severity.value}
                        label={severity.label}
                      />
                    ))}
                  </Group>
                </Radio.Group>

                {/* Checkboxes grouped for easy tapping on mobile */}
                <Stack gap="xs" mt="sm">
                  <Select
                    label="Nature of Crisis"
                    placeholder="Select the nature of the crisis"
                    data={NATURE_OF_CRISIS_OPTIONS}
                    {...form.getInputProps("natureOfCrisis")}
                  />

                  <Textarea
                    label="General Description"
                    placeholder="Describe the overall situation..."
                    autosize
                    minRows={2}
                    {...form.getInputProps("description")}
                  />
                  <Group>
                    <Checkbox
                      label="Debris is present at the site"
                      {...form.getInputProps("debris", { type: "checkbox" })}
                    />
                    <Checkbox
                      label="Infrastructure is accessible"
                      {...form.getInputProps("accessibility", {
                        type: "checkbox",
                      })}
                    />
                  </Group>
                </Stack>
              </Stack>
            </Fieldset>

            {/* SECTION 3: Location */}
            <Fieldset legend="Location Details" radius="md">
              <Stack gap="md">
                <MapComponent form={form} />

                <Text size="sm" c="dimmed">
                  Or You can also provide a more specific address if available:
                </Text>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  <TextInput
                    label="Country"
                    placeholder="e.g., United States"
                    {...form.getInputProps("country")}
                  />
                  <TextInput
                    label="State/Province"
                    placeholder="e.g., California"
                    {...form.getInputProps("state_province")}
                  />
                  <TextInput
                    label="City"
                    placeholder="City Name"
                    {...form.getInputProps("city")}
                  />
                  <TextInput
                    label="Street Address"
                    placeholder="123 Main St"
                    {...form.getInputProps("street_address")}
                  />
                </SimpleGrid>
              </Stack>
            </Fieldset>

            {crisisQuestions.length > 0 && (
              <Fieldset legend="Questions" radius="md">
                {crisisQuestions?.map((question) => (
                  <Stack gap={0}>
                    <Text>{question.text}</Text>

                    {question.is_multiple_choice ? (
                      <Radio.Group
                        label=""
                        required
                        onChange={(e) => {
                          console.log(question.id);

                          let arr = [];
                          if (answers.length === 0) {
                            const answer = {
                              question_id: question.id,
                              answer: e,
                            };
                            arr.push(answer);
                          }

                          for (let index = 0; index < answers.length; index++) {
                            const element = answers[index];
                            if (element["question_id"] === question.id) {
                              element["answer"] = e;
                              arr[index] = element;
                            }
                          }

                          setAnswers(arr);
                        }}
                      >
                        <Group gap="xs" mt="sm">
                          {Object.entries(question.choice_options).map(
                            ([choice, choiceFullAnswer]) => (
                              <Radio
                                key={choice}
                                value={choiceFullAnswer}
                                label={choice + ")   " + choiceFullAnswer}
                              ></Radio>
                            ),
                          )}
                        </Group>
                      </Radio.Group>
                    ) : (
                      <TextInput
                        onChange={(e) => {
                          console.log(question.id);

                          let arr = [];
                          if (answers.length === 0) {
                            const answer = {
                              question_id: question.id,
                              answer: e.target.value,
                            };
                            arr.push(answer);
                          }

                          for (let index = 0; index < answers.length; index++) {
                            const element = answers[index];
                            if (element["question_id"] === question.id) {
                              element["answer"] = e.target.value;
                              arr[index] = element;
                            }
                          }

                          setAnswers(arr);
                        }}
                      ></TextInput>
                    )}
                  </Stack>
                ))}
              </Fieldset>
            )}

            {nocQuestions.length > 0 && (
              <Fieldset
                legend={"Questions Related to " + form.values.natureOfCrisis}
                radius="md"
              >
                {nocQuestions?.map((question) => (
                  <Stack gap={0}>
                    <Text>{question.text}</Text>

                    {question.is_multiple_choice ? (
                      <Radio.Group
                        label=""
                        required
                        onChange={(e) => {
                          console.log(question.id);

                          let arr = [];
                          if (nocAnswers.length === 0) {
                            const answer = {
                              question_id: question.id,
                              answer: e,
                            };
                            arr.push(answer);
                          }

                          for (
                            let index = 0;
                            index < nocAnswers.length;
                            index++
                          ) {
                            const element = nocAnswers[index];
                            if (element["question_id"] === question.id) {
                              element["answer"] = e;
                              arr[index] = element;
                            }
                          }

                          setNocAnswers(arr);
                        }}
                      >
                        <Group gap="xs" mt="sm">
                          {Object.entries(question.choice_options).map(
                            ([choice, choiceFullAnswer]) => (
                              <Radio
                                key={choice}
                                value={choiceFullAnswer}
                                label={choice + ")   " + choiceFullAnswer}
                              ></Radio>
                            ),
                          )}
                        </Group>
                      </Radio.Group>
                    ) : (
                      <TextInput
                        onChange={(e) => {
                          console.log(question.id);

                          let arr = [];
                          if (nocAnswers.length === 0) {
                            const answer = {
                              question_id: question.id,
                              answer: e.target.value,
                            };
                            arr.push(answer);
                          }

                          for (
                            let index = 0;
                            index < nocAnswers.length;
                            index++
                          ) {
                            const element = nocAnswers[index];
                            if (element["question_id"] === question.id) {
                              element["answer"] = e.target.value;
                              arr[index] = element;
                            }
                          }

                          setNocAnswers(arr);
                        }}
                      ></TextInput>
                    )}
                  </Stack>
                ))}
              </Fieldset>
            )}
            {/* Submit Button */}
            <Button type="submit" fullWidth size="lg" mt="md" color="red">
              Submit Report
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
