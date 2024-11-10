import React from 'react'

function NonNullFieldFilter(data) {
    return data.map(item => {
        const filteredItem = {};
        for (const key in item) {
          if (item[key] !== null) {
            filteredItem[key] = item[key];
          }
        }
        return filteredItem;
      });

      
}

export default NonNullFieldFilter