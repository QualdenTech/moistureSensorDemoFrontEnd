import React from 'react';

function NonNullFieldFilter(data, fieldsToCheck = []) {
  return data.filter(row => {
    // Check if all specified fields have non-null values
    return fieldsToCheck.every(field => row[field] !== null);
  }).map(item => {
    const filteredItem = {};
    for (const key in item) {
      if (item[key] !== null) {
        filteredItem[key] = item[key];
      }
    }
    return filteredItem;
  });
}

export default NonNullFieldFilter;
