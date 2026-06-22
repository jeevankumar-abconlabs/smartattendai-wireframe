export const statCards = [
  { value: '847', label: 'Total Students' },
  { value: '731', label: 'Present Today' },
  { value: '116', label: 'Absent' },
  { value: '94.2%', label: 'Attendance Rate' },
];

export const liveEvents = [
  { id: 1, name: 'Arjun Sharma', initials: 'AS', class: 'Class 10-A', time: '08:14 AM', status: 'Verified' },
  { id: 2, name: 'Priya Nair', initials: 'PN', class: 'Class 9-B', time: '08:15 AM', status: 'Verified' },
  { id: 3, name: 'Rohan Mehta', initials: 'RM', class: 'Class 11-C', time: '08:16 AM', status: 'Verified' },
  { id: 4, name: 'Sneha Iyer', initials: 'SI', class: 'Class 8-A', time: '08:17 AM', status: 'Verified' },
  { id: 5, name: 'Karthik Raj', initials: 'KR', class: 'Class 12-B', time: '08:18 AM', status: 'Verified' },
];

export const classSummary = [
  { className: 'Class 8', total: 180, present: 171, pct: '95%' },
  { className: 'Class 9', total: 175, present: 162, pct: '92.6%' },
  { className: 'Class 10', total: 190, present: 181, pct: '95.3%' },
  { className: 'Class 11', total: 160, present: 143, pct: '89.4%' },
  { className: 'Class 12', total: 142, present: 129, pct: '90.8%' },
];

export const students = [
  { id: 1, name: 'Arjun Sharma', initials: 'AS', roll: '1042', class: '10', section: 'A', rfid: 'RF-4201', enrolled: '12 Apr 2025' },
  { id: 2, name: 'Priya Nair', initials: 'PN', roll: '0891', class: '9', section: 'B', rfid: 'RF-3812', enrolled: '14 Apr 2025' },
  { id: 3, name: 'Rohan Mehta', initials: 'RM', roll: '1301', class: '11', section: 'C', rfid: 'RF-5501', enrolled: '10 Apr 2025' },
  { id: 4, name: 'Sneha Iyer', initials: 'SI', roll: '0432', class: '8', section: 'A', rfid: 'RF-2100', enrolled: '15 Apr 2025' },
  { id: 5, name: 'Karthik Raj', initials: 'KR', roll: '1589', class: '12', section: 'B', rfid: 'RF-6210', enrolled: '09 Apr 2025' },
  { id: 6, name: 'Ananya Krishnan', initials: 'AK', roll: '0761', class: '9', section: 'A', rfid: 'RF-3401', enrolled: '11 Apr 2025' },
  { id: 7, name: 'Vikram Patel', initials: 'VP', roll: '1102', class: '10', section: 'B', rfid: 'RF-4502', enrolled: '13 Apr 2025' },
  { id: 8, name: 'Divya Menon', initials: 'DM', roll: '0654', class: '8', section: 'C', rfid: 'RF-2301', enrolled: '16 Apr 2025' },
  { id: 9, name: 'Rahul Gupta', initials: 'RG', roll: '1421', class: '11', section: 'A', rfid: 'RF-5702', enrolled: '10 Apr 2025' },
  { id: 10, name: 'Meera Pillai', initials: 'MP', roll: '1633', class: '12', section: 'A', rfid: 'RF-6401', enrolled: '09 Apr 2025' },
];

export const attendanceLogs = [
  { id: 1, time: '08:14:23 AM', name: 'Arjun Sharma', initials: 'AS', class: '10-A', roll: '1042', confidence: '97.3%', status: 'Verified', loggedBy: 'Camera' },
  { id: 2, time: '08:15:01 AM', name: 'Priya Nair', initials: 'PN', class: '9-B', roll: '0891', confidence: '95.1%', status: 'Verified', loggedBy: 'Camera' },
  { id: 3, time: '08:16:44 AM', name: 'Rohan Mehta', initials: 'RM', class: '11-C', roll: '1301', confidence: '91.7%', status: 'Verified', loggedBy: 'Camera' },
  { id: 4, time: '08:17:30 AM', name: 'Sneha Iyer', initials: 'SI', class: '8-A', roll: '0432', confidence: '96.8%', status: 'Manual Override', loggedBy: 'Staff' },
  { id: 5, time: '08:18:55 AM', name: 'Karthik Raj', initials: 'KR', class: '12-B', roll: '1589', confidence: '93.2%', status: 'Verified', loggedBy: 'Camera' },
  { id: 6, time: '08:19:44 AM', name: 'Unknown', initials: '?', class: '—', roll: '—', confidence: '48.2%', status: 'Unknown Face', loggedBy: 'Camera' },
  { id: 7, time: '08:22:10 AM', name: 'Ananya Krishnan', initials: 'AK', class: '9-A', roll: '0761', confidence: '98.0%', status: 'Verified', loggedBy: 'Camera' },
  { id: 8, time: '08:25:33 AM', name: 'Vikram Patel', initials: 'VP', class: '10-B', roll: '1102', confidence: '89.5%', status: 'Verified', loggedBy: 'Camera' },
  { id: 9, time: '08:30:05 AM', name: 'Divya Menon', initials: 'DM', class: '8-C', roll: '0654', confidence: '94.4%', status: 'Verified', loggedBy: 'Camera' },
  { id: 10, time: '08:33:21 AM', name: 'Rahul Gupta', initials: 'RG', class: '11-A', roll: '1421', confidence: '92.0%', status: 'Verified', loggedBy: 'Camera' },
  { id: 11, time: '08:35:49 AM', name: 'Meera Pillai', initials: 'MP', class: '12-A', roll: '1633', confidence: '96.1%', status: 'Verified', loggedBy: 'Camera' },
  { id: 12, time: '08:51:02 AM', name: 'Unknown', initials: '?', class: '—', roll: '—', confidence: '61.4%', status: 'Unknown Face', loggedBy: 'Camera' },
  { id: 13, time: '09:01:18 AM', name: 'Arjun Sharma', initials: 'AS', class: '10-A', roll: '1042', confidence: '97.1%', status: 'Verified', loggedBy: 'Camera' },
  { id: 14, time: '09:12:33 AM', name: 'Unknown', initials: '?', class: '—', roll: '—', confidence: '55.0%', status: 'Unknown Face', loggedBy: 'Camera' },
  { id: 15, time: '09:20:05 AM', name: 'Priya Nair', initials: 'PN', class: '9-B', roll: '0891', confidence: '94.8%', status: 'Manual Override', loggedBy: 'Staff' },
];

export const reportRows = [
  { name: 'Arjun Sharma', roll: '1042', class: 'Class 10-A', present: 22, absent: 0, pct: '100%' },
  { name: 'Priya Nair', roll: '0891', class: 'Class 9-B', present: 20, absent: 2, pct: '90.9%' },
  { name: 'Rohan Mehta', roll: '1301', class: 'Class 11-C', present: 21, absent: 1, pct: '95.5%' },
  { name: 'Sneha Iyer', roll: '0432', class: 'Class 8-A', present: 19, absent: 3, pct: '86.4%' },
  { name: 'Karthik Raj', roll: '1589', class: 'Class 12-B', present: 22, absent: 0, pct: '100%' },
  { name: 'Ananya Krishnan', roll: '0761', class: 'Class 9-A', present: 18, absent: 4, pct: '81.8%' },
  { name: 'Vikram Patel', roll: '1102', class: 'Class 10-B', present: 21, absent: 1, pct: '95.5%' },
  { name: 'Divya Menon', roll: '0654', class: 'Class 8-C', present: 20, absent: 2, pct: '90.9%' },
  { name: 'Rahul Gupta', roll: '1421', class: 'Class 11-A', present: 22, absent: 0, pct: '100%' },
  { name: 'Meera Pillai', roll: '1633', class: 'Class 12-A', present: 21, absent: 1, pct: '95.5%' },
];

export const recentExports = [
  { name: 'Monthly Report - May 2026.xlsx', exported: '01 Jun 2026' },
  { name: 'Class 10 Weekly - May W3.xlsx', exported: '22 May 2026' },
  { name: 'Class 12 Student-wise - April 2026.xlsx', exported: '01 May 2026' },
  { name: 'Daily Summary - 20 Apr 2026.xlsx', exported: '20 Apr 2026' },
];

export const healthMetrics = [
  { label: 'Avg. Confidence Score (Today)', value: '94.7%' },
  { label: 'Recognitions This Morning', value: '731' },
  { label: 'Below Threshold Events', value: '3' },
];

export const confidenceData = [
  { time: '6 AM', confidence: 92 },
  { time: '7 AM', confidence: 95 },
  { time: '8 AM', confidence: 91 },
  { time: '9 AM', confidence: 94 },
  { time: '10 AM', confidence: 97 },
];

export const alertLogs = [
  { time: '08:19 AM', confidence: '48.2%', action: 'Flagged as Unknown' },
  { time: '08:51 AM', confidence: '61.4%', action: 'Flagged as Unknown' },
  { time: '09:12 AM', confidence: '55.0%', action: 'Flagged as Unknown' },
];
