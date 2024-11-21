import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import '../../styles/common.css';
import { Spinner, Container, Card, Button, Table, Form } from 'react-bootstrap';
import { calculateHourlyAverages, FilteredDateFormat, formatDateWithdateAndTime } from '../../Common/FilteredDateFormat';
import NonNullFieldFilter from '../../Common/NonNullFieldFilter';
import { Line } from 'react-chartjs-2'; // Import Line chart
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

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AirIcon from '@mui/icons-material/Air';
import CloudIcon from '@mui/icons-material/Cloud';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import OpacityIcon from '@mui/icons-material/Opacity';
// import ChemicalWeaponIcon from '@mui/icons-material/ChemicalWeaponIcon';
import GrainIcon from '@mui/icons-material/Grain';
import BlurOnIcon from '@mui/icons-material/BlurOn';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);



function SilageMonitoringAlarmSystem() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const deviceId = queryParams.get('deviceId');
  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);

  // Get the current date and the date 6 months ago
  const currentDateForDateRange = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(currentDateForDateRange.getMonth() - 6);
  const minDate = sixMonthsAgo.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  const maxDate = currentDateForDateRange.toISOString().split('T')[0]; // Format: YYYY-MM-DD

  const navigate = useNavigate();


  const [apiDataByDeviceId, setApiDataByDeviceId] = useState([]);
  const [filterCurrentDateData, setFilterCurrentDateData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noDataMessage, setNoDataMessage] = useState('');
  const [isDataFiltered, setIsDataFiltered] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [dateRangeFilteredData, setDateRangeFilteredData] = useState([]);
  const [showChart, setShowChart] = useState(false); // State for chart visibility
  const [latestData, setLatestData] = useState(null);

  const handleFromDateClick = () => {
    fromDateRef.current.showPicker();
  };

  const handleToDateClick = () => {
    toDateRef.current.showPicker();
  };


  const currentDate = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
  useEffect(() => {
    if (apiDataByDeviceId) {
      const filteredLatestDataTemp = NonNullFieldFilter(apiDataByDeviceId, ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10', 'p11']);
      // Find the latest data entry by sorting the response by 'createdAt'
      const sortedData = [...filteredLatestDataTemp].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setLatestData(sortedData[0]);  // Set the most recent data
    }
  }, [apiDataByDeviceId]);

  useEffect(() => {
    if (deviceId) {
      setLoading(true);
      fetch(`/api/moistureSensor/getDataByDeviceId?deviceId=${deviceId}`)
        .then(response => response.json())
        .then(data => {
          setLoading(false);
          if (data) {
            setApiDataByDeviceId(data);
            filterDataByCurrentDateData(data, currentDate); // Default filter by current date
          } else {
            setNoDataMessage('No data available for the selected device.');
          }
        })
        .catch(error => {
          console.error('Error fetching data:', error);
          setLoading(false);
        });
    }
  }, [deviceId]);

  // const chartDataByCurrentDateData = (data, date) => {
  //   const filtered = data.filter(item => item.createdAt.startsWith(date));
  //   setFilterCurrentDateData(filtered);
  // };

  // function to calculate hourly averages
  const filterDataByCurrentDateData = (data, date) => {
    const filtered = data.filter((item) => item.createdAt.startsWith(date));
    const hourlyAverages = calculateHourlyAverages(filtered);
    setFilterCurrentDateData(hourlyAverages);
  };

  const showAllData = () => {
    setFilterCurrentDateData(apiDataByDeviceId);
    setIsDataFiltered(false);
  };

  const showCurrentDateData = () => {
    filterDataByCurrentDateData(apiDataByDeviceId, currentDate);
    setIsDataFiltered(false);
  };

  const handleDateRangeFilterData = () => {
    if (deviceId && fromDate && toDate) {
      const url = `/api/moistureSensor/getDataByDeviceIdWithDateRange?deviceId=${deviceId}&fromDate=${fromDate}&toDate=${toDate}`;
      setLoading(true);
      fetch(url)
        .then(response => response.json())
        .then(data => {
          setLoading(false);
          if (data && data.message) {
            setNoDataMessage(data.message);
            setFilterCurrentDateData([]); // Clear table if no records are found
            setShowChart(false);
          } else if (data) {
            const nonNullData = NonNullFieldFilter(data, ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10', 'p11']);
            setDateRangeFilteredData(nonNullData);
            setFilterCurrentDateData(nonNullData); // Update the data for rendering
            setIsDataFiltered(nonNullData.length > 0);
            setShowChart(true);
          } else {
            console.error("No data received");
          }
        })
        .catch(error => {
          console.error('Error fetching filtered data:', error);
          setLoading(false);
        });
    } else {
      console.error("Please select both from and to dates.");
    }
  };


  const handleClearDateRangeFilterData = () => {
    setLoading(true);
    setTimeout(() => {
      setFromDate('');
      setToDate('');
      showCurrentDateData();
      setIsDataFiltered(false);
      setShowChart(false);
      setLoading(false);
    }, 300);
  };



  const downloadCSV = () => {
    if (!dateRangeFilteredData || dateRangeFilteredData.length === 0) return;

    const csvContent = [
      // Header row
      Object.keys(dateRangeFilteredData[0]).map(key => columnNames[key] || key).join(','),

      // Data rows with formatted 'createdAt' field
      ...dateRangeFilteredData.map(row =>
        Object.keys(row).map(key =>
          key === 'createdAt' ? `"${formatDateWithdateAndTime(row[key])}"` : `"${row[key]}"`
        ).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `Filtered_Data_${deviceId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const handleGraphClick = (parameterKey) => {
    navigate(`/detailed-graph?deviceId=${deviceId}&parameter=${parameterKey}`);
  };

  const columnNames = {
    p1: "NH₃ (Ammonia) (ppm)",
    p2: "NO₂ (Nitrogen Dioxide) (ppm)",
    p3: "SO₂ (Sulfur Dioxide) (ppm)",
    p4: "CO₂ (Carbon Dioxide) (ppm)",
    p5: "O₂ (Oxygen) (%)",
    p6: "C₂H₆O (Ethanol) (ppm)",
    p7: "pH (0-14)",
    p8: "Total Volatile Organic Compounds (TVOC) (ppm)",
    p9: "Silage Temperature (°C)",
    p10: "Silage Moisture (%)",
    p11: "Silage Electrical Conductivity (EC) (mS/cm)",
    createdAt: "Timestamp"
  };

  const columnsToDisplay = Object.keys(filterCurrentDateData[0] || {}).filter(
    key => key !== 'id' && key !== 'deviceId'
  );

  return (
    <Container className="mt-4">
      <Card className="mx-auto mb-3">
        <Card.Header>
          <h2>Sensor Data for Device {deviceId}</h2>
        </Card.Header>
        <Card.Body>

          {/* Latest Data */}
          {latestData && (
            <Card className="mb-4">
              <Card.Body>
                <h4>Last Updated Record (Date: {formatDateWithdateAndTime(latestData.createdAt)})</h4>

                {/* Container for Temperature readings */}
                <Grid container spacing={2} mb={2} mt={2}>
                  <Grid item xs={6} sm={4} md={3}>
                    <Box display="flex" alignItems="center">
                      <LocalFireDepartmentIcon color="primary" sx={{ mr: 1 }} /> {/* Ammonia icon */}
                      <Typography variant="body1">
                        <strong>NH₃ (Ammonia) (ppm):</strong> {latestData.p1}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Box display="flex" alignItems="center">
                      <AirIcon color="primary" sx={{ mr: 1 }} /> {/* Nitrogen Dioxide icon */}
                      <Typography variant="body1">
                        <strong>NO₂ (Nitrogen Dioxide) (ppm):</strong> {latestData.p2}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Box display="flex" alignItems="center">
                      <CloudIcon color="primary" sx={{ mr: 1 }} /> {/* Sulfur Dioxide icon */}
                      <Typography variant="body1">
                        <strong>SO₂ (Sulfur Dioxide) (ppm):</strong> {latestData.p3}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Box display="flex" alignItems="center">
                      <CloudQueueIcon color="primary" sx={{ mr: 1 }} /> {/* Carbon Dioxide icon */}
                      <Typography variant="body1">
                        <strong>CO₂ (Carbon Dioxide) (ppm):</strong> {latestData.p4}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Container for Soil Moisture readings */}
                <Grid container spacing={2} mb={2} mt={3}>
                  <Grid item xs={6} sm={4} md={3}>
                    <Box display="flex" alignItems="center">
                      <OpacityIcon color="primary" sx={{ mr: 1 }} /> {/* Oxygen icon */}
                      <Typography variant="body1">
                        <strong>O₂ (Oxygen) (%):</strong> {latestData.p5}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Box display="flex" alignItems="center">
                      <LocalFireDepartmentIcon color="primary" sx={{ mr: 1 }} /> {/* Ethanol icon */}
                      <Typography variant="body1">
                        <strong>C₂H₆O (Ethanol) (ppm):</strong> {latestData.p6}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Box display="flex" alignItems="center">
                      <ThermostatIcon color="primary" sx={{ mr: 1 }} /> {/* pH icon */}
                      <Typography variant="body1">
                        <strong>pH (0-14):</strong> {latestData.p7}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Box display="flex" alignItems="center">
                      <ThermostatIcon color="primary" sx={{ mr: 1 }} /> {/* Silage Temperature icon */}
                      <Typography variant="body1">
                        <strong>Silage Temperature (°C):</strong> {latestData.p9}
                      </Typography>
                    </Box>

                  </Grid>
                </Grid>

                {/* Container for additional readings */}
                <Grid container spacing={2} mb={2} mt={3}>
                  <Grid item xs={6} sm={4} md={3}>
                    <Box display="flex" alignItems="center">
                      <WaterDropIcon color="primary" sx={{ mr: 1 }} /> {/* TVOC icon */}
                      <Typography variant="body1">
                        <strong>Total Volatile Organic Compounds (TVOC) (ppm):</strong> {latestData.p8}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Box display="flex" alignItems="center">
                      <GrainIcon color="primary" sx={{ mr: 1 }} /> {/* Silage Moisture icon */}
                      <Typography variant="body1">
                        <strong>Silage Moisture (%):</strong> {latestData.p10}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Box display="flex" alignItems="center">
                      <BlurOnIcon color="primary" sx={{ mr: 1 }} /> {/* Silage EC icon */}
                      <Typography variant="body1">
                        <strong>Silage Electrical Conductivity (EC) (mS/cm):</strong> {latestData.p11}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Card.Body>
            </Card>
          )}
          {/* Date Filter Inputs */}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>From Date:</Form.Label>
              <Form.Control
                type="date"
                value={fromDate}
                ref={fromDateRef}
                onChange={(e) => setFromDate(e.target.value)}
                onClick={handleFromDateClick}
                min={minDate}
                max={maxDate}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>To Date:</Form.Label>
              <Form.Control
                type="date"
                value={toDate}
                ref={toDateRef}
                onChange={(e) => setToDate(e.target.value)}
                onClick={handleToDateClick}
                min={minDate}
                max={maxDate}
              />
            </Form.Group>
            <Button variant="primary" onClick={handleDateRangeFilterData} className="me-2">
              Filter Data
            </Button>
            <Button variant="secondary" onClick={handleClearDateRangeFilterData}>
              Clear Filter
            </Button>
            <Button
              variant="success"
              onClick={downloadCSV}
              disabled={!isDataFiltered}
              className="ms-2"
            >
              Download CSV
            </Button>
          </Form>
        </Card.Body>
      </Card>
      {showChart && filterCurrentDateData.length > 0 && (
        <div className="chart-grid">
          {Object.keys(columnNames)
            .filter((key) => key.startsWith("p")) // Only include parameter columns
            .map((key, index) => (
              <Card className="chart-card" key={index}>
                <Card.Header>{columnNames[key]}</Card.Header>
                <Card.Body>
                  <a
                    href={`/large-graph?param=${key}&deviceId=${deviceId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <Line
                      data={{
                        labels: filterCurrentDateData.map((item) =>
                          new Date(item.createdAt).toLocaleString()
                        ),
                        datasets: [
                          {
                            label: columnNames[key],
                            data: filterCurrentDateData.map((item) =>
                              parseFloat(item[key])
                            ),
                            borderColor: `hsl(${index * 30}, 70%, 50%)`,
                            borderWidth: 2,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: "top",
                          },
                          title: {
                            display: true,
                            text: columnNames[key],
                          },
                        },
                      }}
                    />
                  </a>
                </Card.Body>
              </Card>
            ))}
        </div>
      )}


      {/* Show Loader when Data is loading */}
      {loading && (
        <div className="centered-spinner">
          <Spinner animation="border" />
        </div>
      )}
      {!loading && (
        <>
          <div className="mb-3 mt-3">
            {/* Buttons for showing all data or current date data */}
            <Button variant="primary" className="me-2" onClick={showCurrentDateData}>
              Show Current Date Data
            </Button>
            <Button variant="secondary" onClick={showAllData}>
              Show All Data
            </Button>
          </div>
          {/* Display filtered data */}
          {filterCurrentDateData.length > 0 ? (
            <Card className="mt-4">
              <Card.Body>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      {columnsToDisplay.map((key, index) => (
                        <th key={index}>{columnNames[key] || key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filterCurrentDateData.map((row, index) => (
                      <tr key={index}>
                        {columnsToDisplay.map((key, idx) => (
                          <td key={idx}>
                            {key === 'createdAt'
                              // ? new Date(row[key]).toLocaleString()
                              ? new Date(row[key]).toLocaleString()
                              : row[key]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          ) : noDataMessage ? (
            <p className="mt-3">{noDataMessage}</p> // Display API's no data message
          ) : (
            <p>No data available for the selected device.</p> // Default message
          )}
        </>
      )}
    </Container>
  );

}

export default SilageMonitoringAlarmSystem;
