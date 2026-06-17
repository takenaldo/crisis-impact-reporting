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
  SimpleGrid,
  Radio,
  Group,
  Text,
  Autocomplete,
  Box,
  Stepper,
  Flex,
  ActionIcon,
  Divider,
  ScrollArea,
  Drawer,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import MapComponent from "./MapComponent";
import CirMap from "./map/CirMap";
import {
  IconAlertTriangle,
  IconCheck,
  IconX,
  IconArrowRight,
  IconArrowLeft,
} from "@tabler/icons-react";

import { useNavigate, useParams } from "react-router-dom";
import { MediaCaptureInput } from "./MediaCaptureInput";
import { useEffect, useState } from "react";
import { notifications } from "@mantine/notifications";
import { MobileFormDrawer } from "./MobileFormDrawer";
import { DateTimePicker } from "@mantine/dates";
import api from "./api";
import { savePendingReport } from "./map/utils/pendingReports";

const NATURE_OF_CRISIS_OPTIONS = [
  { value: "flood", label: "Flood" },
  { value: "eartchquake", label: "Earthquake" },
  { value: "hurricane", label: "Hurricane" },
  { value: "wildfire", label: "Wildfire" },
  { value: "landslide", label: "Landslide" },
  { value: "tsunami", label: "Tsunami" },
  { value: "drought", label: "Drought" },
  { value: "other_natural", label: "Other Natural Disaster" },
  { value: "conflict", label: "Conflict/War" },
  { value: "tech_failure", label: "Technological Failure" },
  { value: "industrial_accident", label: "Industrial Accident" },
  { value: "other_human", label: "Other Human-Made Crisis" },
];

const DAMAGE_SEVERITIES = [
  { value: "No Damage", label: "No Damage" },
  { value: "Minimal", label: "Minimal" },
  { value: "Partial", label: "Partial" },
  { value: "Complete", label: "Complete" },
];

export default function ImpactReportForm({ opened, onClose, userLocation }) {
  const { id, name } = useParams();
  const navigate = useNavigate();

  const [active, setActive] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [crisisQuestions, setCrisisQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [nocQuestions, setNocQuestions] = useState([]);
  const [nocAnswers, setNocAnswers] = useState([]);

  const [showMappingRecommendation, setShowMappingRecommendation] =
    useState(false);
  const [reportID, setReportID] = useState(null);
  const [mapBounds, setMapBounds] = useState({ maxBounds: null, minZoom: 2 });

  const form = useForm({
    initialValues: {
      crisis_id: id || null,
      description: "",
      nature_of_crisis: null,
      nature_of_crisis_category: "",
      damage_severity: "",
      damage_datetime: new Date(),
      infrastructure_name: "",
      infrastructure_type: "",
      infrastructure_description: "",
      debris: false,
      infrastructure_latitude: "",
      infrastructure_longitude: "",
      street_address: "",
      city: "",
      state_province: "",
      country: "",
      photos: [],
      photoDescription: [],
      electricity_condition: "unknown",
      health_services_rating: "unknown",
      pressing_need: [],
      annotations: null,
    },

    validate: {
      damage_severity: (value) =>
        !value ? "Damage severity rating is required" : null,
      infrastructure_type: (value) =>
        !value ? "Infrastructure type is required" : null,
    },
  });

  // Pre-fill lat/lng from GPS/dragged location so it reaches the form submission
  useEffect(() => {
    if (userLocation) {
      form.setFieldValue("infrastructure_latitude",  userLocation.latitude);
      form.setFieldValue("infrastructure_longitude", userLocation.longitude);
    }
  }, [userLocation]); // eslint-disable-line

  // Fetch bbox whenever userLocation is known — always required in the form
  useEffect(() => {
    if (!userLocation) return;
    const fetchBounds = async () => {
      try {
        const res = await api.post('map/bbox/', {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        });
        const { min_lng, min_lat, max_lng, max_lat } = res.data.bbox;
        const lngSpan = max_lng - min_lng;
        const minZoom = Math.ceil(
          Math.log2(((window.innerWidth || 400) * 360) / (256 * lngSpan))
        );
        setMapBounds({
          maxBounds: [[min_lat, min_lng], [max_lat, max_lng]],
          minZoom: Math.max(2, minZoom),
        });
      } catch {
        // bbox unavailable — map stays unconstrained
      }
    };
    fetchBounds();
  }, [userLocation]); // eslint-disable-line

  // Mapping steps to form keys to trigger validation rules seamlessly on step transitions
  const stepFieldMappings = [
    ["photos"],
    ["country", "city", "street_address"],
    ["infrastructure_type", "infrastructure_name"], // Fixed from camelCase
    ["damage_severity", "nature_of_crisis"], // Fixed from camelCase
    ["electricity_condition", "health_services_rating", "pressing_need"],
  ];

  // useEffect(() => {
  //   const fetchQuestions = async () => {
  //     if (id && /^\d+$/.test(id)) {
  //       try {
  //         const response = await api.get(
  //           `crises/${id}/get_questions_for_crisis/`,
  //         );
  //         setCrisisQuestions(response.data);
  //       } catch (error) {
  //         console.error("Error fetching generic crisis questions:", error);
  //       }
  //     }
  //   };
  //   fetchQuestions();
  // }, [id]);

  // useEffect(() => {
  //   const fetchNatureOfCrisisQuestions = async () => {
  //     if (form.values.nature_of_crisis) {
  //       try {
  //         const response = await api.get(
  //           `nature-of-crisis-questions/get_nature_of_crisis_questions/?nature_of_crisis=${form.values.nature_of_crisis}`,
  //         );
  //         setNocQuestions(response.data);
  //       } catch (error) {
  //         console.error(
  //           "Error fetching specific nature of crisis questions:",
  //           error,
  //         );
  //       }
  //     }
  //   };
  //   fetchNatureOfCrisisQuestions();
  // }, [form.values.nature_of_crisis]);

  const handleSubmit = async (values) => {
    console.log("Submitting:", values);
    setIsSubmitting(true);

    // ── Offline path ────────────────────────────────────────────────────────
    if (!navigator.onLine) {
      try {
        await savePendingReport({
          fields: {
            ...values,
            damage_datetime: values.damage_datetime instanceof Date
              ? values.damage_datetime.toISOString()
              : values.damage_datetime,
          },
          photos: values.photos.map((p) => ({
            blob: p.file,
            description: p.description ?? '',
            name: p.file?.name ?? 'photo.jpg',
          })),
        });
        window.dispatchEvent(new CustomEvent('report-queued'));
        notifications.show({
          title: 'Saved offline',
          message: 'Your report is queued and will be submitted automatically when you reconnect.',
          color: '#F4A261',
          icon: <IconCheck size={16} />,
        });
      } catch {
        notifications.show({
          title: 'Could not save offline',
          message: 'Please check your storage settings and try again.',
          color: '#E76F51',
          icon: <IconAlertTriangle size={16} />,
        });
      }
      setIsSubmitting(false);
      setActive(0);
      form.reset();
      onClose();
      return;
    }

    const formData = new FormData();
    if (values.crisis_id) formData.append("crisis_id", values.crisis_id);

    formData.append("description", values.description);

    // Fixed: Appending formData keys to form snake_case keys
    formData.append("nature_of_crisis", values.nature_of_crisis);
    formData.append(
      "nature_of_crisis_category",
      values.nature_of_crisis_category,
    );
    formData.append("damage_severity", values.damage_severity);
    formData.append(
      "damage_datetime",
      values.damage_datetime
        ? values.damage_datetime
        : new Date().toISOString(),
    );
    formData.append("infrastructure_name", values.infrastructure_name);
    formData.append("infrastructure_type", values.infrastructure_type);
    formData.append(
      "infrastructureDescription",
      values.infrastructure_description,
    );

    formData.append("debris", values.debris);
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
    formData.append("electricity_condition", values.electricity_condition);
    formData.append("health_services_rating", values.health_services_rating);
    formData.append("pressing_need", values.pressing_need.join(", "));
    formData.append("annotations", JSON.stringify(values.annotations ?? {}));

    values.photos.forEach((photoObj) => {
      formData.append("photos", photoObj.file);
    });
    formData.append(
      "photoDescription",
      JSON.stringify(values.photos.map((p) => p.description)),
    );

    try {
      const response = await api.post("/impact-reports/", formData);
      form.reset();
      notifications.show({
        title: "Report Submitted",
        message: "Your crisis impact report has been saved successfully.",
        color: "#009C9A",
        icon: <IconCheck size={16} />,
      });

      setIsSubmitting(false);
      setActive(0);
      onClose();

      // const crisis = response.data.crisis;
      // if (!crisis) {
      //   setReportID(response.data.id);
      //   // setShowMappingRecommendation(true);
      // } else {
      //   navigate("/");
      // }
    } catch (error) {
      notifications.show({
        title: "Submission Error",
        message:
          "Failed to upload the report. Please verify connection metrics.",
        color: "#E76F51",
        icon: <IconAlertTriangle size={16} />,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    {
      label: "Location",
      description: "Geographic indicators",
      content: (
        <Stack gap="md">
          <Box style={{ borderRadius: "8px", overflow: "hidden", height: 320 }}>
            <CirMap
              height="320px"
              center={
                userLocation
                  ? [userLocation.latitude, userLocation.longitude]
                  : [9.032, 38.7486]
              }
              zoom={userLocation ? 15 : 2}
              showAnnotationTools
              userLocation={userLocation}
              onAnnotationChange={(a) => form.setFieldValue("annotations", a)}
              maxBounds={mapBounds.maxBounds}
              minZoom={mapBounds.minZoom}
            />
          </Box>
          <Divider
            label="Or provide address metrics"
            labelPosition="center"
            my="xs"
            ff="Poppins"
          />
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <TextInput
              label="Country"
              placeholder="e.g., United States"
              ff="Poppins"
              {...form.getInputProps("country")}
            />
            <TextInput
              label="State / Province"
              placeholder="e.g., California"
              ff="Poppins"
              {...form.getInputProps("state_province")}
            />
            <TextInput
              label="City"
              placeholder="City Name"
              ff="Poppins"
              {...form.getInputProps("city")}
            />
            <TextInput
              label="Street Address"
              placeholder="123 Main St"
              ff="Poppins"
              {...form.getInputProps("street_address")}
            />
          </SimpleGrid>
        </Stack>
      ),
    },

    {
      label: "Photos",
      description: "Upload media assets",
      content: (
        <Stack gap="md">
          <MediaCaptureInput form={form} fieldName="photos" />
        </Stack>
      ),
    },
    {
      label: "Infrastructure",
      description: "Type & Taxonomy",
      content: (
        <Stack gap="md">
          <Select
            label="Infrastructure Classification"
            placeholder="Select or type infrastructure type"
            required
            searchable
            ff="Poppins"
            data={[
              "Residential Infrastructure (Houses and apartments)",
              "Commercial Infrastructure (Markets, shops, hotels, banks, etc.)",
              "Government Building (Administrative, police, fire stations, etc.)",
              "Utility Infrastructure (Water pumps, power plants, treatment facilities)",
              "Transport & Communication (Roads, cell towers, bridges, railways)",
              "Community Infrastructure (Schools, hospitals, public toilets)",
              "Public Spaces/Recreation (Stadiums, religious spaces)",
              "Other",
            ]}
            {...form.getInputProps("infrastructure_type")}
          />
          <TextInput
            label="Infrastructure Name / Identifier"
            placeholder="e.g., Main Street Bridge"
            // required
            ff="Poppins"
            {...form.getInputProps("infrastructure_name")}
          />

          <DateTimePicker
            label="Select Date and Time"
            placeholder="Pick date and time"
            valueFormat="DD MMM YYYY hh:mm A"
            clearable
            {...form.getInputProps("damage_datetime")}
          />
        </Stack>
      ),
    },
    {
      label: "Damage details",
      description: "Severity metrics",
      content: (
        <Stack gap="lg">
          {/* <Select
            label="Nature of Crisis"
            placeholder="Select primary driving crisis category"
            required
            ff="Poppins"
            data={NATURE_OF_CRISIS_OPTIONS}
            {...form.getInputProps("nature_of_crisis")}
          /> */}

          <Paper withBorder p="md" radius="sm" bg="#E6F4F1">
            <Text fw={600} size="sm" mb="sm" c="#0D3B66" ff="Poppins">
              Damage Severity
            </Text>

            <Radio.Group required {...form.getInputProps("damage_severity")}>
              <SimpleGrid cols={2} gap="md" mt="xs">
                {DAMAGE_SEVERITIES.map((severity) => (
                  <Radio
                    key={severity.value}
                    value={severity.value}
                    label={severity.label}
                    ff="Poppins"
                  />
                ))}
              </SimpleGrid>
            </Radio.Group>
          </Paper>
          <Textarea
            label="General Damage Narrative"
            placeholder="Provide a high-level description of site impacts..."
            autosize
            minRows={5}
            ff="Poppins"
            {...form.getInputProps("description")}
          />

          <Paper withBorder p="md" radius="sm" bg="#E6F4F1">
            <Text fw={600} size="sm" mb="sm" c="#0D3B66" ff="Poppins">
              Site Attributes
            </Text>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
              <Checkbox
                label="Debris Present on Site"
                ff="Poppins"
                {...form.getInputProps("debris", { type: "checkbox" })}
              />
            </SimpleGrid>
          </Paper>
        </Stack>
      ),
    },
    {
      label: "Surveys",
      description: "Impact related questions",
      content: (
        <Stack gap="xl">
          <Paper withBorder p="md" radius="md" bg="#E6F4F1">
            <Radio.Group
              label="1. Current condition of local electricity infrastructure:"
              withAsterisk
              ff="Poppins"
              {...form.getInputProps("electricity_condition")}
            >
              <Stack gap="xs" mt="sm">
                <Radio
                  value="no_damage"
                  label="No damage observed"
                  ff="Poppins"
                />
                <Radio
                  value="minor"
                  label="Minor damage (service disruptions but quickly repairable)"
                  ff="Poppins"
                />
                <Radio
                  value="moderate"
                  label="Moderate damage (partial outages requiring structural repairs)"
                  ff="Poppins"
                />
                <Radio
                  value="severe"
                  label="Severe damage (major utility damage, prolonged dark state)"
                  ff="Poppins"
                />
                <Radio
                  value="destroyed"
                  label="Completely destroyed"
                  ff="Poppins"
                />
                <Radio
                  value="unknown"
                  label="Unknown/cannot be safely assessed"
                  ff="Poppins"
                />
              </Stack>
            </Radio.Group>
          </Paper>

          <Paper withBorder p="md" radius="md" bg="#E6F4F1">
            <Radio.Group
              label="2. Operational capability of health services since event execution:"
              withAsterisk
              ff="Poppins"
              {...form.getInputProps("health_services_rating")}
            >
              <Stack gap="xs" mt="sm">
                <Radio value="fully" label="Fully functional" ff="Poppins" />
                <Radio
                  value="partially"
                  label="Partially functional"
                  ff="Poppins"
                />
                <Radio
                  value="largely_disrupted"
                  label="Largely disrupted"
                  ff="Poppins"
                />
                <Radio
                  value="not_functioning"
                  label="Not functioning at all"
                  ff="Poppins"
                />
                <Radio value="unknown" label="Unknown" ff="Poppins" />
              </Stack>
            </Radio.Group>
          </Paper>

          <Paper withBorder p="md" radius="md" bg="#E6F4F1">
            <Checkbox.Group
              label="3. Immediate pressing needs within target sector: (Select all that apply)"
              withAsterisk
              ff="Poppins"
              {...form.getInputProps("pressing_need")}
            >
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs" mt="sm">
                <Checkbox
                  value="food_water"
                  label="Food & clean drinking water"
                  ff="Poppins"
                />
                <Checkbox
                  value="cash"
                  label="Direct financial provisions"
                  ff="Poppins"
                />
                <Checkbox
                  value="healthcare"
                  label="Medical access & essential drugs"
                  ff="Poppins"
                />
                <Checkbox
                  value="shelter"
                  label="Housing repair & staging"
                  ff="Poppins"
                />
                <Checkbox
                  value="livelihoods"
                  label="Income restoration pathways"
                  ff="Poppins"
                />
                <Checkbox
                  value="wash"
                  label="Sanitation assets & toilets"
                  ff="Poppins"
                />
                <Checkbox
                  value="infrastructure"
                  label="Core services (Power, Roads)"
                  ff="Poppins"
                />
                <Checkbox
                  value="protection"
                  label="Psychosocial support modules"
                  ff="Poppins"
                />
              </SimpleGrid>
            </Checkbox.Group>
          </Paper>
        </Stack>
      ),
    },
    // {
    //   label: "Crisis Form",
    //   description: "Specific Crisis Related Form",
    //   content: (
    //     // <Stack>

    //       { {crisisQuestions.length > 0 && (
    //         <Stack gap="md">
    //           <Divider
    //             label="Crisis Event Questions"
    //             labelPosition="left"
    //             ff="Poppins"
    //           />
    //           {crisisQuestions.map((question) => (
    //             <Paper
    //               withBorder
    //               p="md"
    //               radius="md"
    //               key={question.id}
    //               bg="#E6F4F1"
    //             >
    //               <Text fw={500} size="sm" mb="xs" ff="Poppins">
    //                 {question.text}
    //               </Text>
    //               {question.is_multiple_choice ? (
    //                 <Radio.Group
    //                   required
    //                   onChange={(value) => {
    //                     setAnswers((prev) => [
    //                       ...prev.filter(
    //                         (item) => item.question_id !== question.id,
    //                       ),
    //                       { question_id: question.id, answer: value },
    //                     ]);
    //                   }}
    //                 >
    //                   <Group gap="md">
    //                     {Object.entries(question.choice_options).map(
    //                       ([choice, choiceFullAnswer]) => (
    //                         <Radio
    //                           key={choice}
    //                           value={choiceFullAnswer}
    //                           label={`${choice}) ${choiceFullAnswer}`}
    //                           ff="Poppins"
    //                         />
    //                       ),
    //                     )}
    //                   </Group>
    //                 </Radio.Group>
    //               ) : (
    //                 <TextInput
    //                   placeholder="Type detailed answer parameter"
    //                   ff="Poppins"
    //                   onChange={(e) => {
    //                     const val = e.target.value;
    //                     setAnswers((prev) => [
    //                       ...prev.filter(
    //                         (item) => item.question_id !== question.id,
    //                       ),
    //                       { question_id: question.id, answer: val },
    //                     ]);
    //                   }}
    //                 />
    //               )}
    //             </Paper>
    //           ))}
    //         </Stack>
    //       )} }

    //       {{nocQuestions.length > 0 && (
    //         <Stack gap="md">
    //           <Divider
    //             label={`Specific to Context: ${form.values.nature_of_crisis}`}
    //             labelPosition="left"
    //             ff="Poppins"
    //           />
    //           {nocQuestions.map((question) => (
    //             <Paper
    //               withBorder
    //               p="md"
    //               radius="md"
    //               key={question.id}
    //               bg="#E6F4F1"
    //             >
    //               <Text fw={500} size="sm" mb="xs" ff="Poppins">
    //                 {question.text}
    //               </Text>
    //               {question.is_multiple_choice ? (
    //                 <Radio.Group
    //                   required
    //                   onChange={(value) => {
    //                     setNocAnswers((prev) => [
    //                       ...prev.filter(
    //                         (item) => item.question_id !== question.id,
    //                       ),
    //                       { question_id: question.id, answer: value },
    //                     ]);
    //                   }}
    //                 >
    //                   <Group gap="md">
    //                     {Object.entries(question.choice_options).map(
    //                       ([choice, choiceFullAnswer]) => (
    //                         <Radio
    //                           key={choice}
    //                           value={choiceFullAnswer}
    //                           label={`${choice}) ${choiceFullAnswer}`}
    //                           ff="Poppins"
    //                         />
    //                       ),
    //                     )}
    //                   </Group>
    //                 </Radio.Group>
    //               ) : (
    //                 <TextInput
    //                   placeholder="Type your contextual parameter answer"
    //                   ff="Poppins"
    //                   onChange={(e) => {
    //                     const val = e.target.value;
    //                     setNocAnswers((prev) => [
    //                       ...prev.filter(
    //                         (item) => item.question_id !== question.id,
    //                       ),
    //                       { question_id: question.id, answer: val },
    //                     ]);
    //                   }}
    //                 />
    //               )}
    //             </Paper>
    //           ))}
    //         </Stack>
    //       )}}
    //   ),
    // },
  ];

  const nextStep = () => {
    // Validate the fields allocated to the current step before advancing
    const fieldsToValidate = stepFieldMappings[active] || [];
    let stepHasErrors = false;

    fieldsToValidate.forEach((field) => {
      const validationResult = form.validateField(field);
      if (validationResult.hasError) {
        stepHasErrors = true;
      }
    });

    if (!stepHasErrors) {
      setActive((current) =>
        current < steps.length - 1 ? current + 1 : current,
      );
    }
  };

  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current));
  const isLastStep = active === steps.length - 1;

  // Custom component passed to Drawer's title prop to render step progress perfectly centered
  const DrawerHeaderTitle = () => (
    <Box style={{ width: "100%", paddingLeft: active > 0 ? "0px" : "40px" }}>
      <Flex
        align="center"
        justify="center"
        style={{ position: "relative", width: "100%" }}
      >
        {active > 0 && (
          <ActionIcon
            variant="subtle"
            color="gray"
            radius="xl"
            size="lg"
            onClick={prevStep}
            style={{
              position: "absolute",
              left: -10,
              backgroundColor: "#F0F4F8",
            }}
          >
            <IconArrowLeft size={18} color="#0D3B66" />
          </ActionIcon>
        )}
        <Stack gap={0} align="center" style={{ flex: 1 }}>
          <Text size="xs" fw={500} c="dimmed" ff="Poppins">
            Step {active + 1} of {steps.length}
          </Text>
          <Title
            order={3}
            ff="Montserrat"
            c="#0D3B66"
            style={{ letterSpacing: "-0.5px", fontSize: "20px" }}
          >
            Submit Impact Report
          </Title>
          {id && name && (
            <Text size="xs" c="dimmed" ff="Poppins" mt={2}>
              Linked to:{" "}
              <Text component="span" fw={600} c="black">
                {name}
              </Text>
            </Text>
          )}
        </Stack>
      </Flex>

      {/* Stepper bar indicator system matching image_78f053.png */}
      <SimpleGrid
        cols={steps.length}
        spacing="xs"
        mt="sm"
        px="xs"
        style={{ width: "100%" }}
      >
        {steps.map((_, idx) => (
          <Box
            key={idx}
            style={{
              height: "4px",
              borderRadius: "2px",
              backgroundColor: idx <= active ? "#009C9A" : "#E2E8F0",
              transition: "background-color 0.2s ease",
            }}
          />
        ))}
      </SimpleGrid>
    </Box>
  );

  return (
    <Drawer
      opened={opened}
      onClose={() => {
        form.reset();
        setActive(0);
        setIsSubmitting(false);
        onClose();
      }}
      position="bottom"
      size="90%"
      radius="xl"
      title={<DrawerHeaderTitle />}
      withCloseButton={true}
      styles={{
        header: {
          paddingTop: "16px",
          paddingBottom: "16px",
          borderBottom: "1px solid #E2E8F0",
          zIndex: 2000,
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
          {/* Main Core Form Card Container */}
          <Paper withBorder={false} p={0} radius="md">
            <form
              onSubmit={form.onSubmit(handleSubmit)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isLastStep) {
                  e.preventDefault();
                }
              }}
            >
              <Stack gap="xl">
                <Stepper
                  active={active}
                  onStepClick={setActive}
                  allowNextStepsSelect={false}
                  styles={{ steps: { display: "none" } }}
                >
                  {steps.map((step, index) => (
                    <Stepper.Step key={index}>
                      <Box>{step.content}</Box>
                    </Stepper.Step>
                  ))}
                </Stepper>

                {/* Sticky Action Button layout pinned directly to screen bottom */}
                <Box
                  style={{
                    position: "fixed",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: "#ffffff",
                    padding: "16px",
                    borderTop: "1px solid #E2E8F0",
                    zIndex: 1000,
                  }}
                >
                  <Container size="sm" p={0}>
                    {!isLastStep && (
                      <Button
                        type="button"
                        onClick={nextStep}
                        bg="#0D3B66"
                        size="lg"
                        radius="xl"
                        fullWidth
                        ff="Montserrat"
                        fw={600}
                        rightSection={<IconArrowRight size={18} />}
                        styles={{
                          root: {
                            height: "54px",
                            "&:hover": { backgroundColor: "#092949" },
                          },
                        }}
                      >
                        Continue
                      </Button>
                    )}

                    {isLastStep && (
                      <Button
                        type="submit"
                        bg="#009C9A"
                        size="lg"
                        radius="xl"
                        fullWidth
                        ff="Montserrat"
                        fw={600}
                        loading={isSubmitting}
                        rightSection={<IconCheck size={18} />}
                        styles={{
                          root: {
                            height: "54px",
                            "&:hover": { backgroundColor: "#007F7E" },
                          },
                        }}
                      >
                        Submit Report
                      </Button>
                    )}
                  </Container>
                </Box>
              </Stack>
            </form>
          </Paper>
        </Container>
      </ScrollArea>
    </Drawer>
  );
}
