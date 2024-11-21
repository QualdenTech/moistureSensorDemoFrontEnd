import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom'; // Import the zoom plugin

// Register the plugin and chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, zoomPlugin);

function LargeGraph() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const param = queryParams.get('param');
  const deviceId = queryParams.get('deviceId');

  const [graphData, setGraphData] = useState([]);

  useEffect(() => {
    if (deviceId) {
      fetch(`/api/moistureSensor/getDataByDeviceId?deviceId=${deviceId}`)
        .then((response) => response.json())
        .then((data) => {
          if (data) {
            setGraphData(data);
          }
        })
        .catch((error) => console.error('Error fetching graph data:', error));
    }
  }, [deviceId]);

  const labels = graphData.map((item) => new Date(item.createdAt).toLocaleString());
  const dataPoints = graphData.map((item) => parseFloat(item[param]));

  return (
    <div style={{ padding: '20px' }}>
      <Line
        data={{
          labels,
          datasets: [
            {
              label: param,
              data: dataPoints,
              borderColor: 'blue',
              borderWidth: 2,
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: `Detailed View of ${param}`,
            },
          },
          // Zoom configuration
          interaction: {
            mode: 'index',  // Only zoom along the X-axis
            intersect: false,
          },
          scales: {
            x: {
              ticks: {
                autoSkip: true,
                maxTicksLimit: 20, // Limit the number of ticks on the X-axis
              },
            },
            y: {
              beginAtZero: false, // Allow Y-axis zooming freely
            },
          },
          // Enable zooming and panning
          plugins: {
            zoom: {
              pan: {
                enabled: true,
                mode: 'xy', // Allow both X and Y-axis panning
                speed: 10,  // Control the panning speed
              },
              zoom: {
                enabled: true,
                mode: 'xy', // Allow both X and Y-axis zooming
                speed: 0.1, // Control the zoom speed
                sensitivity: 3, // Sensitivity for zooming
                onZoomComplete: ({ chart }) => {
                  // Optional: You can log or perform actions when zooming is complete
                  console.log('Zoom completed');
                },
              },
            },
          },
        }}
      />
    </div>
  );
}

export default LargeGraph;
