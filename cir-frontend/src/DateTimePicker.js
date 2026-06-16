import { useState } from 'react';
import { DateTimePicker, DatesProvider } from '@mantine/dates';
// Import the specific locales you need from dayjs
import 'dayjs/locale/es';
import 'dayjs/locale/de';

export function LocalizedDateTimePicker() {
    const [value, setValue] = useState < Date | null > (null);

    // In a real app, you might get the user's locale from their browser 
    // via navigator.language or a user settings state.
    const userLocale = 'es'; // Example: Spanish

    // You can also detect the user's local timezone
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const handleSubmit = () => {
        if (value) {
            // BEST PRACTICE: Always convert to ISO string (UTC) before sending to the backend
            console.log("Sending to backend:", value.toISOString());
        }
    };

    return (
        <DatesProvider settings={{ locale: userLocale, timezone: userTimezone }}>
            <DateTimePicker
                value={value}
                onChange={setValue}
                label="Select Appointment Date and Time"
                placeholder="Pick date and time"
                valueFormat="DD MMM YYYY hh:mm A" // You can customize the format here
                clearable
            />

            {/* Optional: Show the user what timezone they are booking in */}
            <p style={{ fontSize: '12px', color: 'gray' }}>
                Times are shown in your local timezone ({userTimezone}).
            </p>
        </DatesProvider>
    );
}