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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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
      <h2>Graph for {param} (Device: {deviceId})</h2>
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
        }}
      />
    </div>
  );
}

export default LargeGraph;
