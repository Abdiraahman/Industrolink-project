import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface Profile {
  name: string;
  registration: string;
  email: string;
  year: string;
  yearofstudy: string;
  course: string;
  university: string;
  phonenumber: string;
  notifications: boolean;
  emailUpdates: boolean;
  address: string;
}

const Settings: React.FC = () => {
  const [profile, setProfile] = useState<Profile>({
    name: '',
    registration:'',
    email: '',
    year: '',
    yearofstudy: '',
    phonenumber: '',
    notifications: true,
    emailUpdates: true,
    course: '',
    university: '',
    address: '',
  });

  const handleProfileUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Profile updated:', profile);
  };

  const handleInputChange = (field: keyof Profile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Settings</h2>
        
        {/* Profile Settings */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={profile.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="registration" className="block text-sm font-medium text-gray-700 mb-2">
                  Registration number
                </label>
                <input
                  type="text"
                  id="registration"
                  value={profile.registration}
                  onChange={(e) => handleInputChange('registration', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="yearofstudy" className="block text-sm font-medium text-gray-700 mb-2">
                  Academic Year of study
                </label>
                <input
                  type="year"
                  id="yearofstudy"
                  value={profile.yearofstudy}
                  onChange={(e) => handleInputChange('yearofstudy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                  Academic Year
                </label>
                <input
                  type="year"
                  id="year"
                  value={profile.year}
                  onChange={(e) => handleInputChange('year', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={profile.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Institution address
                </label>
                <input
                  type="address"
                  id="address"
                  value={profile.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <Button variant="default" size="lg"
              type="submit" 
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Update Profile
            </Button>
          </form>
        </div>

        {/* Notification Settings */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Push Notifications</h4>
                <p className="text-sm text-gray-600">Receive notifications about important updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.notifications}
                  onChange={(e) => handleInputChange('notifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Email Updates</h4>
                <p className="text-sm text-gray-600">Receive weekly progress updates via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.emailUpdates}
                  onChange={(e) => handleInputChange('emailUpdates', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

