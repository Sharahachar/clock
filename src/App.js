//App.js

import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';

const App = () => {
  const [clockedIn, setClockedIn] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [totalHours, setTotalHours] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [history, setHistory] = useState({});
  const [displayHistory, setDisplayHistory] = useState([]);
  const [viewDetails, setViewDetails] = useState(false);

  const employeeDetails = {
    id: 'SS0022',
    name: 'Shahbaz Khan',
    teamLead: 'Kamal',
    manager: 'Ramesh',
    number: '7075745143'
  };

 
  

  useEffect(() => {
    const selectedDateString = selectedDate.toDateString();
    if (history[selectedDateString]) {
      setDisplayHistory(history[selectedDateString]);
    } else {
      setDisplayHistory([]);
    }
  }, [selectedDate, history]);

  const handleClockIn = () => {
    if (selectedDate.toDateString() === new Date().toDateString()) {
      if (history[selectedDate.toDateString()] && history[selectedDate.toDateString()].some(entry => entry.type === 'Clock In')) {
        alert('You have already clocked in today.');
        return;
      }
      setClockedIn(true);
      const start = new Date();
      setStartTime(start);
      setEndTime(null);
      setTotalHours(null);
      const updatedHistory = { ...history };
      if (!updatedHistory[start.toDateString()]) {
        updatedHistory[start.toDateString()] = [];
      }
      updatedHistory[start.toDateString()].push({ type: 'Clock In', time: start });
      setHistory(updatedHistory);
    }
  };

  const handleClockOut = () => {
    if (selectedDate.toDateString() === new Date().toDateString()) {
      if (!history[selectedDate.toDateString()] || !history[selectedDate.toDateString()].some(entry => entry.type === 'Clock In')) {
        alert('You need to clock in before you can clock out.');
        return;
      }
      if (history[selectedDate.toDateString()].some(entry => entry.type === 'Clock Out')) {
        alert('You have already clocked out today.');
        return;
      }
      setClockedIn(false);
      const end = new Date();
      setEndTime(end);
      const totalSeconds = (end - startTime) / 1000;
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = Math.floor(totalSeconds % 60);
      setTotalHours(`${hours}h ${minutes}m ${seconds}s`);
      const updatedHistory = { ...history };
      updatedHistory[end.toDateString()].push({ type: 'Clock Out', time: end });
      setHistory(updatedHistory);
    }
  };

  const formatTime = (date) => {
    return date ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--';
  };

  const downloadReport = () => {
    const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
    let hasData = false; // Flag to check if there's any data to show
  
    let csvContent = "data:text/csv;charset=utf-8," +
      "Employee ID,Employee Name,Team Lead,Manager,Contact Number,Date,Clock In Time,Clock Out Time,Total Hours\n";
  
    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayString = d.toDateString();
      if (history[dayString]) {
        hasData = true; // Set flag to true if there's any data
        const dailyHistory = history[dayString];
        const clockInEntry = dailyHistory.find(entry => entry.type === 'Clock In');
        const clockOutEntry = dailyHistory.find(entry => entry.type === 'Clock Out');
        
        const clockInTime = clockInEntry ? formatTime(clockInEntry.time) : '--:--:--';
        const clockOutTime = clockOutEntry ? formatTime(clockOutEntry.time) : '--:--:--';
        const totalHoursFormatted = clockInEntry && clockOutEntry
          ? calculateTotalHours(clockInEntry.time, clockOutEntry.time)
          : '--:--';
  
        csvContent += [
          `${employeeDetails.id}`,
          `${employeeDetails.name}`,
          `${employeeDetails.teamLead}`,
          `${employeeDetails.manager}`,
          `${employeeDetails.number}`,
          `${dayString}`,
          `${clockInTime}`,
          `${clockOutTime}`,
          `${totalHoursFormatted}`
        ].join(",") + "\n";
      }
    }
  
    // If no data was added to the CSV content
    if (!hasData) {
      csvContent = "data:text/csv;charset=utf-8," +
        "No data found for the selected month\n";
    }
  
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "monthly_attendance_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  

  // Helper function to calculate total hours between two times
  const calculateTotalHours = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const totalSeconds = (end - start) / 1000;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div className="app">
      <header className="app-header">
        <h3>Attendance</h3>
      </header>
      <div className="container">
        {!viewDetails && (
          <>
            <div className="date-picker-container">
              <i className="fas fa-calendar calendar-icon"></i>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="MMMM d, yyyy"
                className="date-picker"
              />
            </div>
            <div className="clock-in-out">
          <button
            className={`clock-btn ${clockedIn ? 'clocked-in' : ''}`}
            onClick={clockedIn ? handleClockOut : handleClockIn}
            disabled={selectedDate.toDateString() !== new Date().toDateString()}
          >
            {clockedIn ? 'Clock Out' : 'Clock In'}
          </button>
              <div className="status">
                <div className="status-box">
                  <span>Today's In:</span>
                  <span>{formatTime(startTime)}</span>
                </div>
                <div className="status-box">
                  <span>Today's Out:</span>
                  <span>{formatTime(endTime)}</span>
                </div>
                <div className="status-box">
                  <span>Total Hours:</span>
                  <span>{totalHours !== null ? totalHours : '--:--'}</span>
                </div>
              </div>
              <button className="view-details-btn" onClick={() => setViewDetails(true)}>View Details</button>
            </div>
          </>
        )}
        {viewDetails && (
          <div className="history">
            <h2>History for {selectedDate.toLocaleDateString()}</h2>
            <div className="employee-details">
              <p>Employee ID: {employeeDetails.id}</p>
              <p>Name: {employeeDetails.name}</p>
              <p>Team Lead: {employeeDetails.teamLead}</p>
              <p>Manager: {employeeDetails.manager}</p>
            </div>
            {displayHistory.length > 0 ? (
              <div className="history-list">
                {displayHistory.map((entry, index) => (
                  <p key={index}>
                    {entry.type}: {entry.time.toLocaleString()}
                  </p>
                ))}
              </div>
            ) : (
              <p>No data found</p>
            )}
            <button className="download-btn" onClick={downloadReport}>Download Report</button>
            <button className="back-btn" onClick={() => setViewDetails(false)}>Back</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
