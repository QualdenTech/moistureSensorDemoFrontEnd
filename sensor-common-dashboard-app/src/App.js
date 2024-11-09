import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Home';
import SoilMoistureSensorVariableDepth from './pages/SoilMoistureSensorVariableDepth/SoilMoistureSensorVariableDepth';
import SilageMonitoringAlarmSystem from './pages/SilageMonitoringAlarmSystem/SilageMonitoringAlarmSystem';
import SoilMoistureSensorFixedDepth from './pages/SoilMoistureSensorFixedDepth/SoilMoistureSensorFixedDepth';
import StartTopology from './pages/StartTopology/StartTopology';
import SmartAutomaticWeatherStation from './pages/SmartAutomaticWeatherStation/SmartAutomaticWeatherStation';


function App() {
  return (
    <div className="App">
      <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/SoilMoistureSensor" element={<SoilMoistureSensor />} /> */}
        <Route path="/SoilMoistureSensorVariableDepth" element={<SoilMoistureSensorVariableDepth />} />
        <Route path="/SilageMonitoringAlarmSystem" element={<SilageMonitoringAlarmSystem />} />
        <Route path="/SoilMoistureSensorFixedDepth" element={<SoilMoistureSensorFixedDepth />} />
        <Route path="/StartTopology" element={<StartTopology />} />
        <Route path="/SmartAutomaticWeatherStation" element={<SmartAutomaticWeatherStation />} />


        
      </Routes>
    </Router>
    </div>
  );
}

export default App;
