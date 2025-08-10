import React, { useState } from 'react';
import { FileText } from 'lucide-react';

interface DailyReport {
  workDone: string;
  newSkills: string;
  challenges: string;
}

const Reports: React.FC = () => {
  const [dailyReport, setDailyReport] = useState<DailyReport>({
    workDone: '',
    newSkills: '',
    challenges: ''
  });

  const [weeklyReport, setWeeklyReport] = useState({
    weeklyBrief: ''
  });

  // State to track submitted reports
  const [submittedReports, setSubmittedReports] = useState([]);

  const handleDailyReportChange = (field, value) => {
    setDailyReport(prev => ({ ...prev, [field]: value }));
  };

  const handleWeeklyReportChange = (value) => {
    setWeeklyReport({ weeklyBrief: value });
  };

  const handleSubmitDailyReport = () => {
    // Validate that at least one field is filled
    if (!dailyReport.workDone.trim() && !dailyReport.newSkills.trim() && !dailyReport.challenges.trim()) {
      alert('Please fill in at least one field before submitting.');
      return;
    }

    // Create a new report entry
    const newReport = {
      id: Date.now(), // Simple ID generation
      title: 'Daily Report',
      status: 'SUBMITTED',
      week: `Week ${Math.ceil(new Date().getDate() / 7)}`,
      timeSubmitted: new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      }) + 'HRS',
      type: 'daily',
      content: dailyReport
    };

    // Add to submitted reports
    setSubmittedReports(prev => [newReport, ...prev]);
    
    console.log('Daily Report Submitted:', dailyReport);
    
    // Clear the form
    setDailyReport({
      workDone: '',
      newSkills: '',
      challenges: ''
    });

    // Show success message
    alert('Daily report submitted successfully!');
  };

  const handleSubmitWeeklyReport = () => {
    // Validate that the field is filled
    if (!weeklyReport.weeklyBrief.trim()) {
      alert('Please fill in the weekly brief before submitting.');
      return;
    }

    // Create a new report entry
    const newReport = {
      id: Date.now(), // Simple ID generation
      title: 'Weekly Report',
      status: 'SUBMITTED',
      week: `Week ${Math.ceil(new Date().getDate() / 7)}`,
      timeSubmitted: new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      }) + 'HRS',
      type: 'weekly',
      content: weeklyReport
    };

    // Add to submitted reports
    setSubmittedReports(prev => [newReport, ...prev]);
    
    console.log('Weekly Report Submitted:', weeklyReport);
    
    // Clear the form
    setWeeklyReport({ weeklyBrief: '' });

    // Show success message
    alert('Weekly report submitted successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Report Cards Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Report Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily report</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">WORK DONE</label>
              <textarea
                value={dailyReport.workDone}
                onChange={(e) => handleDailyReportChange('workDone', e.target.value)}
                className="w-full h-16 px-3 py-2 bg-gray-200 border-0 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-navy-500"
                placeholder="Describe the work completed today..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">NEW SKILLS ACQUIRED</label>
              <textarea
                value={dailyReport.newSkills}
                onChange={(e) => handleDailyReportChange('newSkills', e.target.value)}
                className="w-full h-16 px-3 py-2 bg-gray-200 border-0 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-navy-500"
                placeholder="List any new skills learned..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CHALLENGES MET</label>
              <textarea
                value={dailyReport.challenges}
                onChange={(e) => handleDailyReportChange('challenges', e.target.value)}
                className="w-full h-16 px-3 py-2 bg-gray-200 border-0 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-navy-500"
                placeholder="Describe any challenges faced..."
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button 
              onClick={handleSubmitDailyReport} 
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              Submit Daily Report
            </button>
          </div>
        </div>

        {/* Weekly Report Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Report</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">WEEKLY BRIEF</label>
            <textarea
              value={weeklyReport.weeklyBrief}
              onChange={(e) => handleWeeklyReportChange(e.target.value)}
              className="w-full h-48 px-3 py-2 bg-gray-200 border-0 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-navy-500"
              placeholder="Provide a comprehensive weekly summary..."
            />
          </div>
          <div className="flex justify-end mt-4">
            <button 
              onClick={handleSubmitWeeklyReport} 
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              Submit Weekly Report
            </button>
          </div>
        </div>
      </div>

      {/* Recent Reports Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent reports</h3>
        
        {submittedReports.length === 0 ? (
          // Show "No reports submitted" when no reports exist
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <FileText className="h-16 w-16 text-gray-300" />
            </div>
            <h4 className="text-lg font-medium text-gray-500 mb-2">No reports submitted</h4>
            <p className="text-gray-400">Your submitted reports will appear here once you submit them.</p>
          </div>
        ) : (
          // Show reports table when reports exist
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 uppercase tracking-wide">REPORT TITLE</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 uppercase tracking-wide">STATUS</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 uppercase tracking-wide">WEEK</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 uppercase tracking-wide">TIME SUBMITTED</th>
                </tr>
              </thead>
              <tbody>
                {submittedReports.map((report) => (
                  <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-navy-600 rounded-full"></div>
                        <span className="font-medium text-gray-900">{report.title}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.status === 'SUBMITTED' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-700 font-medium">{report.week}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-700 font-medium">{report.timeSubmitted}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;


