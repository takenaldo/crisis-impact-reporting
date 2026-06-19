import { Select } from "@mantine/core";
import dayjs from "dayjs";
import { useState } from "react";

export function DamageDateSelector({ form }) {
  // Optional: keep track of the dropdown's string value so the UI updates
  const [selectValue, setSelectValue] = useState("today");

  const handleDateChange = (value) => {
    setSelectValue(value);

    // If the user clears the input, clear the form value
    if (!value) {
      form.setFieldValue("damage_datetime", null);
      return;
    }

    // Calculate the Date object based on the selection
    const now = dayjs();
    let newDate;

    if (value === "today") newDate = now.toDate();
    if (value === "yesterday") newDate = now.subtract(1, "day").toDate();
    if (value === "last_week") newDate = now.subtract(1, "week").toDate();

    // Update the Mantine form with the actual Date object
    form.setFieldValue("damage_datetime", newDate.toISOString());
  };

  return (
    <Select
      label="Select Date and Time"
      placeholder="Pick relative date"
      clearable
      value={selectValue}
      onChange={handleDateChange}
      data={[
        { value: "today", label: "Today" },
        { value: "yesterday", label: "Yesterday" },
        { value: "last_week", label: "Last Week" },
      ]}
      // Pass the error state from the form manually
      error={form.errors.damage_datetime}
    />
  );
}
