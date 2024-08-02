import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Attendence.css';

const Atta = () => {
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
      const dayHistory = history[dayString];

      if (dayHistory && dayHistory.length > 0) {
        hasData = true; // There's data to show
        const clockInEntry = dayHistory.find(entry => entry.type === 'Clock In');
        const clockOutEntry = dayHistory.find(entry => entry.type === 'Clock Out');
        const totalTime = clockInEntry && clockOutEntry
          ? formatTimeDifference(new Date(clockOutEntry.time), new Date(clockInEntry.time))
          : '--:--:--';

        csvContent += `${employeeDetails.id},${employeeDetails.name},${employeeDetails.teamLead},${employeeDetails.manager},${employeeDetails.number},${dayString},${clockInEntry ? formatTime(new Date(clockInEntry.time)) : '--:--:--'},${clockOutEntry ? formatTime(new Date(clockOutEntry.time)) : '--:--:--'},${totalTime}\n`;
      }
    }

    if (!hasData) {
      alert("No data available for the selected month."); // Show alert if no data
      return;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedDate.toLocaleString('default', { month: 'long' })}_attendance_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTimeDifference = (end, start) => {
    const totalSeconds = (end - start) / 1000;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const handleViewDetails = () => {
    setViewDetails(true);
  };

  const handleBack = () => {
    if (viewDetails) {
      setViewDetails(false);
    } else {
      // Implement the navigation logic here, for example:
      window.history.back();
    }
  };

  return (
    <div className="app">
      <div className="app-header">
        <h1>Attendance</h1>
        <div className="date-picker-container">
        <span className="calendar-icon">📅</span>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            
            dateFormat="MM/dd/yyyy"
            className="date-picker"
          />
        </div>
      </div>
      {viewDetails ? (
        <div className="history">
          <h4>Attendance History</h4>
          <div className="employee-details">
            <p>Employee ID: {employeeDetails.id}</p>
            <p>Employee Name: {employeeDetails.name}</p>
            <p>Team Lead: {employeeDetails.teamLead}</p>
            <p>Manager: {employeeDetails.manager}</p>
            <p>Contact Number: {employeeDetails.number}</p>
            <button className="download-btn" onClick={downloadReport}>Download Report</button>
          </div>
          <div className="history-list">
            {displayHistory.map((entry, index) => (
              <p key={index}>{entry.type} at {formatTime(new Date(entry.time))}</p>
            ))}
          </div>
          <button className="back-btn" onClick={handleBack}>Back</button>
        </div>
      ) : (
        <div className="clock-in-out">
          <button
            className={`clock-btn ${clockedIn ? 'clocked-in' : ''}`}
            onClick={clockedIn ? handleClockOut : handleClockIn}
          >
            {clockedIn ? 'Clock Out' : 'Clock In'}
          </button>
          <div className="status">
            <div className="status-box">
              <span>Clock In Time:</span>
              <span>{formatTime(startTime)}</span>
            </div>
            <div className="status-box">
              <span>Clock Out Time:</span>
              <span>{formatTime(endTime)}</span>
            </div>
            {totalHours && (
              <div className="status-box">
                <span>Total Hours:</span>
                <span>{totalHours}</span>
              </div>
            )}
          </div>
          <button className="view-details-btn" onClick={handleViewDetails}>View Details</button>
          <button className="back-btn" onClick={handleBack}>Back</button>
        </div>
      )}
    </div>
  );
};

export default Atta;
