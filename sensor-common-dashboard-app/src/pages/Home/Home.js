import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { Card, Typography } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import 'font-awesome/css/font-awesome.min.css';

import QualdenLogo from "../../Images/QualdenLogo.png"
import image4 from "../../Images/image4.png"
import soilmoistureSensor from "../../Images/soil-moisture-sensor.png"



function Home() {
  const [inputValue, setInputValue] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // State for displaying error message
  const navigate = useNavigate();

  const handleClick = async () => {
    const prefix = inputValue.substring(0, 4).toUpperCase();

    try {
      // Call API to check if records exist
      const response = await fetch(`/api/moistureSensor/getDataByDeviceId?deviceId=${inputValue}`);
      const data = await response.json();

      // Check if API returned no records message
      if (data.message === "Provided deviceId records not available") {
        setErrorMessage(data.message); // Set the error message
        return; // Stop further execution if no records are available
      }

      // Clear error message and navigate based on deviceId prefix if data exists
      setErrorMessage('');
      switch (prefix) {
        case 'SMAS':
          navigate(`/SilageMonitoringAlarmSystem?deviceId=${encodeURIComponent(inputValue)}`);
          break;
        case 'SMSF':
          navigate(`/SoilMoistureSensorFixedDepth?deviceId=${encodeURIComponent(inputValue)}`);
          break;
        case 'STAR':
          navigate(`/StartTopology?deviceId=${encodeURIComponent(inputValue)}`);
          break;
        case 'SMSV':
          navigate(`/SoilMoistureSensorVariableDepth?deviceId=${encodeURIComponent(inputValue)}`);
          break;
        case 'SAWS':
          navigate(`/SmartAutomaticWeatherStation?deviceId=${encodeURIComponent(inputValue)}`);
          break;
        default:
          alert('Unknown device ID prefix!');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent the default action (form submission)
      handleClick(); // Trigger the handleClick function
    } else if (e.key === 'Tab') {
      handleClick(); // Trigger the handleClick function on Tab as well
    }
  };

  return (
    <div>
      {/* Main Container */}
      <Container fluid className="p-0" style={{  display: 'flex',
              justifyContent: 'center',
              alignItems: 'center', marginTop:'60px'}}>
        
        {/* Row for left (65%) and right (35%) divs */}
        <Row className="w-100 flex-grow-1 m-0">

          {/* Left side - 65% with background image and Material UI Card */}
          <Card
            sx={{
              width: { xs: '100%', md: '63%' },
              height: '80vh',
              backgroundImage: `url(${image4})`,
              backgroundSize: '55%',
              backgroundPosition: 'left',
              backgroundRepeat: 'no-repeat',
              color: 'black',
              display: 'flex',
              justifyContent: 'right',
              alignItems: 'center',
              textAlign: 'center',
              boxShadow: 4, // Material UI shadow
              border: '1px solid #ddd', // Border for the card
              marginLeft: '6px',
              paddingLeft: '40px',
            }}
          >

            {/* List of items */}
            <List>
              <Typography variant="h5" align="center" style={{
                marginBottom: '20px', fontWeight: 'bold',
                color: '#1976d2',
              }}>
                The IoT Data Collection Platform
              </Typography>

              <ListItem>
                <ListItemIcon>
                  {/* <i className="fa fa-bolt" style={{ fontSize: '24px', color: '#1976d2' }}></i> Bolt icon */}
                  <img
                    src={soilmoistureSensor}
                    alt="soilmoistureSensor"
                    style={{
                      width: '30px',
                      height: '40px',
                    }}
                  />
                </ListItemIcon>
                <Typography className='list-font'>
                  Soil Moisture Sensor Fixed Depth
                </Typography>
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <img
                    src={soilmoistureSensor}
                    alt="soilmoistureSensor"
                    style={{
                      width: '30px',
                      height: '40px',
                    }}
                  />
                </ListItemIcon>
                <Typography className='list-font'>
                  Soil Moisture Sensor Variable Depth
                </Typography>
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <i className="fa fa-bell" style={{ fontSize: '24px', color: '#1976d2' }}></i> {/* Bell icon */}
                </ListItemIcon>
                <Typography className='list-font'>
                  Silage Monitoring Alarm System
                </Typography>
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <i className="fa fa-cloud" style={{ fontSize: '24px', color: '#1976d2' }}></i> {/* Cloud icon */}
                </ListItemIcon>
                <Typography className='list-font'>
                  Smart Automatic Weather Station
                </Typography>
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <i className="fa fa-sitemap" style={{ fontSize: '24px', color: '#1976d2' }}></i> {/* Layers icon */}
                </ListItemIcon>
                <Typography className='list-font'>
                  StartTopology
                </Typography>
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <i className="fa fa-cogs" style={{ fontSize: '24px', color: '#1976d2' }}></i> {/* Gear icon */}
                </ListItemIcon>
                <Typography className='list-font'>
                  Automatic Pump Controller
                </Typography>
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  {/* <i className="fa fa-water" style={{ fontSize: '24px', color: '#1976d2' }}></i> Water icon */}
                  <i className="fa-solid fa-droplet" style={{ fontSize: '24px', color: '#1976d2' }}></i>
                </ListItemIcon>
                <Typography className='list-font'>
                  Siphone System
                </Typography>
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <i className="fa fa-tint" style={{ fontSize: '24px', color: '#1976d2' }}></i> {/* Water Drop icon */}
                </ListItemIcon>
                <Typography className='list-font'>
                  Water Meter
                </Typography>
              </ListItem>
            </List>
          </Card>

          {/* Right side - 35% for Device ID Navigation with Material UI Card */}
          <Card
            sx={{
              width: { xs: '100%', md: '36%' },
              height: '80vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '16px',
              boxShadow: 3,
              border: '1px solid #ddd',
              marginRight: '5px'
             
            }}
          >
            <img
              src={QualdenLogo}
              alt="QualdenLogo"
              style={{
                width: '200px',
                height: '80px',
                marginBottom: '90px',
                // marginRight: '10px',
                // // marginBottom: '40px',
                // display: 'flex',
                // justifyContent: 'center',
                // alignItems: 'center',
                // margin: '0 auto',
              }}
            />
            <h2 style={{marginBottom: '15px' }}>Device ID Navigation</h2>
            <Form className="w-100" style={{marginTop: '15px',}}>
              <Form.Group>
                <Form.Label>Enter Device ID</Form.Label>
                <Form.Control
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter a Device ID"
                  className="mb-3"
                  onKeyDown={handleKeyDown}
                />
              </Form.Group>
              <Button variant="primary" className="w-100" onClick={handleClick}>
                Get Details
              </Button>
              {errorMessage && <p className="text-danger mt-3">{errorMessage}</p>}
            </Form>
          </Card>

        </Row>

      </Container>
    </div>
  );



}

export default Home;
