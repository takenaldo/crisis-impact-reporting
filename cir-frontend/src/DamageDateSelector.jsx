import { Select } from "@mantine/core";
import { useState } from "react";

export function DamageDateSelector({ form }) {
  // Optional: keep track of the dropdown's strin\ value so the UI updates

  const [selectValue, setSelectValue] = useState("today");

  return (
    <Select
      label="Select Date and Time"
      placeholder="Pick relative date"
      clearable
      value={selectValue}
      onChange={setSelectValue}
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
