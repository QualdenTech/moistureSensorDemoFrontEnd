import React, { useEffect, useState } from 'react'; 
import { useLocation } from 'react-router-dom';
import '../../styles/common.css'; 
import { Spinner, Container, Card, Button, Form } from 'react-bootstrap'; 
import Table from 'react-bootstrap/Table';
import FilteredDateFormat from '../../Common/FilteredDateFormat';
import NonNullFieldFilter from '../../Common/NonNullFieldFilter';

function SoilMoistureSensor() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const deviceId = queryParams.get('deviceId');
  
  const [apiData, setApiData] = useState(null);
  const [filteredNullData, setFilteredNullData] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [dateFilteredData, setDateFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDataFiltered, setIsDataFiltered] = useState(false);

  useEffect(() => {
    if (apiData) {
      const filteredDataTemp = NonNullFieldFilter(apiData);
      setFilteredNullData(filteredDataTemp);
      setDateFilteredData(filteredDataTemp);
    }
  }, [apiData]);

  useEffect(() => {
    if (deviceId) {
      setLoading(true);
      fetch(`/api/moistureSensor/getDataByDeviceId?deviceId=${deviceId}`)
        .then(response => response.json())
        .then(data => {
          setLoading(false);
          if (data) {
            setApiData(data);
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
          if (data) {
            const nonNullData = NonNullFieldFilter(data);
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
    p1: "Soil Moisture(Level 20cm) %",
    p2: "Soil Temperature(Level 20cm) °C",
    p3: "Soil Moisture(Level 20cm) %",
    p4: "Soil Temperature(Level 20cm) °C",
    p5: "Soil Moisture(Level 20cm) %",
    p6: "Soil Temperature(Level 20cm) °C",
    createdAt: "Timestamp"
  };

  const columnsToDisplay = Object.keys(dateFilteredData[0] || {}).filter(
    (key) => key !== "id" && key !== "deviceId"
  );

  return (
    <Container className="mt-4" >
      <Card className="mx-auto" >
        <Card.Header>
          <h2>Sensor Data for Device {deviceId}</h2>
        </Card.Header>
        <Card.Body>
          {/* Date Filter Inputs */}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>From Date:</Form.Label>
              <Form.Control
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>To Date:</Form.Label>
              <Form.Control
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
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
      {!loading && dateFilteredData.length > 0 ? (
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
                {dateFilteredData.map((row, index) => (
                  <tr key={index}>
                    {columnsToDisplay.map((key, idx) => (
                      <td key={idx}>
                        {key === 'createdAt' ? FilteredDateFormat(row[key]) : row[key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      ) : !loading ? (
        <p>No data available for the selected device.</p>
      ) : null}
    </Container>
  );
}

export default SoilMoistureSensor;
