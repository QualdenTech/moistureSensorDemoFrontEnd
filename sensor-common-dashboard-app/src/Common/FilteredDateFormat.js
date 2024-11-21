import React from 'react'

// Named Export: FilteredDateFormat function
export function FilteredDateFormat(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString(); // Format as 'MM/DD/YYYY' or use custom format
}

// Named Export: formatDate function
export function formatDateWithdateAndTime(dateString) {
  const date = new Date(dateString); // Convert to Date object
  const istDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // 24-hour format
  };
  return new Intl.DateTimeFormat('en-GB', options).format(istDate);
};

export const calculateHourlyAverages = (data) => {
  const groupedData = {};

  data.forEach((item) => {
    const createdAt = new Date(item.createdAt);
    const hourStart = new Date(createdAt);
    hourStart.setMinutes(0, 0, 0); // Round down to the start of the hour
    const hourKey = hourStart.toISOString();

    if (!groupedData[hourKey]) {
      groupedData[hourKey] = { ...item, count: 0 };
      Object.keys(item).forEach((key) => {
        if (key.startsWith('p')) groupedData[hourKey][key] = 0;
      });
    }

    groupedData[hourKey].count += 1;
    Object.keys(item).forEach((key) => {
      if (key.startsWith('p')) groupedData[hourKey][key] += parseFloat(item[key]) || 0;
    });
  });

  return Object.keys(groupedData).map((key) => {
    const entry = groupedData[key];
    const endHour = new Date(key);
    endHour.setHours(endHour.getHours() + 1);

    const formattedEntry = {
      timestamp: `${new Date(key).toLocaleString()} to ${endHour.toLocaleString()}`,
    };

    Object.keys(entry).forEach((key) => {
      if (key.startsWith('p')) {
        formattedEntry[key] = (entry[key] / entry.count).toFixed(2); // Calculate average
      }
    });

    return formattedEntry;
  });
};
