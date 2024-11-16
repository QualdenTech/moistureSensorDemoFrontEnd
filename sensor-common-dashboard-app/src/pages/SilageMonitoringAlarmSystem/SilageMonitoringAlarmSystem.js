import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import '../../styles/common.css';
import { Spinner, Container, Card, Button, Form, CardImg } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import NonNullFieldFilter from '../../Common/NonNullFieldFilter';
import { FilteredDateFormat, formatDateWithdateAndTime } from '../../Common/FilteredDateFormat';
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

function SilageMonitoringAlarmSystem() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const deviceId = queryParams.get('deviceId');
  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);

  const handleFromDateClick = () => {
    fromDateRef.current.showPicker();
  };

  const handleToDateClick = () => {
    toDateRef.current.showPicker();
  };


  const [apiDataByDeviceId, setApiDataByDeviceId] = useState(null);
  const [filteredNullData, setFilteredNullData] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [dateFilteredData, setDateFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDataFiltered, setIsDataFiltered] = useState(false);
  const [latestData, setLatestData] = useState(null);
  const [noDataMessage, setNoDataMessage] = useState(''); // New state for no data message

  // Get the current date and the date 6 months ago
  const currentDate = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(currentDate.getMonth() - 6);
  const minDate = sixMonthsAgo.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  const maxDate = currentDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD


  useEffect(() => {
    if (apiDataByDeviceId) {
      console.log("if apiDataByDeviceId", apiDataByDeviceId)
      const filteredDataTemp = NonNullFieldFilter(apiDataByDeviceId, ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10', 'p11']);
      setFilteredNullData(filteredDataTemp);
      setDateFilteredData(filteredDataTemp);

      // Find the latest data entry by sorting the response by 'createdAt'
      const sortedData = [...filteredDataTemp].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
            const nonNullData = NonNullFieldFilter(data, ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10', 'p11']);
            setApiDataByDeviceId(nonNullData);
            // setApiDataByDeviceId(data);
          } else {
            console.error("No data received");
          }
        })
        .catch(error => {
          console.error('Error fetching data:', error);
          setLoading(false);
        });
    }
  }, [deviceId]);
  const handleFocus = (ref) => {
    if (ref.current) {
      ref.current.focus();
      ref.current.click();
    }
  };

  const handleFilterData = () => {
    if (deviceId && fromDate && toDate) {
      const url = `/api/moistureSensor/getDataByDeviceIdWithDateRange?deviceId=${deviceId}&fromDate=${fromDate}&toDate=${toDate}`;
      setLoading(true);
      fetch(url)
        .then(response => response.json())
        .then(data => {
          setLoading(false);
          if (data && data.message) {
            // Check for specific message
            setNoDataMessage(data.message);
            setDateFilteredData([]); // Clear data if no records are found
          } else if (data) {
            const nonNullData = NonNullFieldFilter(data, ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10', 'p11']);
            setDateFilteredData(nonNullData);
            setIsDataFiltered(nonNullData.length > 0);
            // setDateFilteredData(NonNullFieldFilter(data));
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

  const handleClearFilter = () => {
    setLoading(true);
    setTimeout(() => {
      setDateFilteredData(filteredNullData);
      setIsDataFiltered(false);
      setFromDate('');
      setToDate('');
      setNoDataMessage('');
      setLoading(false);
    }, 300);
  };


  const downloadCSV = () => {
    if (!dateFilteredData || dateFilteredData.length === 0) return;

    const csvContent = [
      // Header row
      Object.keys(dateFilteredData[0]).map(key => columnNames[key] || key).join(','),

      // Data rows with formatted 'createdAt' field
      ...dateFilteredData.map(row =>
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

  const columnsToDisplay = Object.keys(dateFilteredData[0] || {}).filter(
    (key) => key !== "id" && key !== "deviceId"
  );

  // Define rowsToDisplay by filtering out rows where both p1 and p2 are null
  const rowsToDisplay = dateFilteredData.filter(row => row.p1 !== null || row.p2 !== null);


  return (
    <Container className="mt-4" >
      <Card className="mx-auto" >
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
            <Button variant="primary" onClick={handleFilterData} className="me-2">
              Filter Data
            </Button>
            <Button variant="secondary" onClick={handleClearFilter}
            >
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

      {/* Show Loader when Data is loading */}
      {loading && (
        <div className="centered-spinner">
          <Spinner animation="border" />
        </div>
      )}

      {/* Display filtered data */}
      {!loading && rowsToDisplay.length > 0 ? (
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
                {rowsToDisplay.map((row, index) => (
                  <tr key={index}>
                    {columnsToDisplay.map((key, idx) => (
                      <td key={idx}>
                        {key === 'createdAt' ? formatDateWithdateAndTime(row[key]) : row[key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      ) : !loading && noDataMessage ? (
        <p className='mt-3'>{noDataMessage}</p> // Display API's no data message
      ) : (
        !loading && (
          <p >No data available for the selected device.</p> // Default message
        )
      )}
    </Container>
  );
}

export default SilageMonitoringAlarmSystem;
