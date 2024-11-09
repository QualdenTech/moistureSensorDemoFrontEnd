import React from 'react'

// Named Export: FilteredDateFormat function
export function FilteredDateFormat(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString(); // Format as 'MM/DD/YYYY' or use custom format
}

// Named Export: formatDate function
export function formatDateWithdateAndTime(dateString) {
  const date = new Date(dateString); // Convert to Date object
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // 24-hour format
  };
  return new Intl.DateTimeFormat('en-GB', options).format(date);
};
  
  // function FilteredDateFormat(dateString) {
  //   const date = new Date(dateString);
  //   return date.toLocaleDateString(); // Format as 'MM/DD/YYYY' or use custom format
  // }
  
  // export default FilteredDateFormat


