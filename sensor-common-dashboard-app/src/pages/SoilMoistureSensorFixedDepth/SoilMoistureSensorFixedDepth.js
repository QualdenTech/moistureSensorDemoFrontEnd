import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import '../../styles/common.css';
import { Spinner, Container, Card, Button, Form } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import NonNullFieldFilter from '../../Common/NonNullFieldFilter';
import { FilteredDateFormat, formatDateWithdateAndTime } from '../../Common/FilteredDateFormat';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ThermostatIcon from '@mui/icons-material/Thermostat'; // Temperature icon
import WaterDropIcon from '@mui/icons-material/WaterDrop'; // Soil Moisture icon

function SoilMoistureSensorFixedDepth() {
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
    const [noDataMessage, setNoDataMessage] = useState(''); // New state for no data message
    const [latestData, setLatestData] = useState(null);

     // Get the current date and the date 6 months ago
     const currentDate = new Date();
     const sixMonthsAgo = new Date();
     sixMonthsAgo.setMonth(currentDate.getMonth() - 6);
     const minDate = sixMonthsAgo.toISOString().split('T')[0]; // Format: YYYY-MM-DD
     const maxDate = currentDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD

    useEffect(() => {
        if (apiDataByDeviceId) {
            const filteredDataTemp = NonNullFieldFilter(apiDataByDeviceId, ['p1', 'p2']);
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
                        setApiDataByDeviceId(data);
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
                        const nonNullData = NonNullFieldFilter(data, ['p1', 'p2']);
                        setDateFilteredData(nonNullData);
                        setIsDataFiltered(nonNullData.length > 0);
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
            Object.keys(dateFilteredData[0]).map(key => columnNames[key] || key).join(','), // Header
            ...dateFilteredData.map(row =>
                Object.keys(row).map(key => `"${row[key]}"`).join(',') // Rows
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
        p1: "Soil Moisture(30cm) %",
        p2: "Soil Temperature(30cm) °C",
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
                                <Box display="flex" alignItems="center" mb={2}>
                                    <ThermostatIcon color="primary" sx={{ mr: 1 }} />
                                    <Typography variant="v2" component="span">
                                        <strong>Temperature(30cm): </strong>{latestData.p2} °C
                                    </Typography>
                                </Box>
                                <Box display="flex" alignItems="center">
                                    <WaterDropIcon color="primary" sx={{ mr: 1 }} />
                                    <Typography variant="v2" component="gutterBottom">
                                        <strong>Soil Moisture(30cm): </strong>{latestData.p1} %
                                    </Typography>
                                </Box>
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

export default SoilMoistureSensorFixedDepth;
