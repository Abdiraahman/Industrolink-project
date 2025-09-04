import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/auth/useAuth';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Separator } from '../../components/ui/separator';
import { Badge } from '../../components/ui/badge';
import { 
  User, 
  GraduationCap, 
  Briefcase, 
  Building, 
  Lock, 
  Save, 
  Edit3,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

// API services
import { usersApi, UserProfile, UserUpdateData, PasswordChangeData } from '../../services/api/users';
import { studentsApi, StudentUpdateData } from '../../services/api/students';
import { lecturersApi, LecturerUpdateData } from '../../services/api/lecturers';
import { supervisorsApi, SupervisorUpdateData } from '../../services/api/supervisors';

interface PersonalDetails {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
}

interface StudentDetails {
  registration_no: string;
  academic_year: string;
  course: string;
  year_of_study: string;
  duration_in_weeks: number;
  start_date: string;
  completion_date: string;
  company_id?: string;
  company_name?: string;
}

interface LecturerDetails {
  department: string;
  title: string;
}

interface SupervisorDetails {
  phone_number: string;
  position: string;
  company_name: string;
}

interface PasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

interface Company {
  company_id: string;
  name: string;
  address: string;
  phone_number: string;
  email: string;
}

const Settings: React.FC = () => {
  const { user } = useAuth();
  
  // Separate loading states for each section
  const [loadingPersonal, setLoadingPersonal] = useState(false);
  const [loadingStudent, setLoadingStudent] = useState(false);
  const [loadingLecturer, setLoadingLecturer] = useState(false);
  const [loadingSupervisor, setLoadingSupervisor] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  
  // Separate edit states for each section
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [isEditingLecturer, setIsEditingLecturer] = useState(false);
  const [isEditingSupervisor, setIsEditingSupervisor] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [personalDetails, setPersonalDetails] = useState<PersonalDetails>({
    first_name: '',
    last_name: '',
    email: '',
    username: ''
  });

  const [studentDetails, setStudentDetails] = useState<StudentDetails>({
    registration_no: '',
    academic_year: '',
    course: '',
    year_of_study: '',
    duration_in_weeks: 0,
    start_date: '',
    completion_date: '',
    company_id: '',
    company_name: ''
  });

  const [lecturerDetails, setLecturerDetails] = useState<LecturerDetails>({
    department: '',
    title: ''
  });

  const [supervisorDetails, setSupervisorDetails] = useState<SupervisorDetails>({
    phone_number: '',
    position: '',
    company_name: ''
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [availableCompanies, setAvailableCompanies] = useState<Company[]>([]);

  // Load user profile data
  useEffect(() => {
    if (user) {
      loadUserProfile();
      if (user.role === 'student' || user.role === 'supervisor') {
        loadCompanies();
      }
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      // Load personal details
      const userProfile = await usersApi.getProfile();
      setPersonalDetails({
        first_name: userProfile.first_name || '',
        last_name: userProfile.last_name || '',
        email: userProfile.email || '',
        username: userProfile.username || ''
      });

      // Load role-specific details
      if (user.role === 'student') {
        try {
          const studentProfile = await studentsApi.getStudentProfile();
          setStudentDetails({
            registration_no: studentProfile.registration_no || '',
            academic_year: studentProfile.academic_year || '',
            course: studentProfile.course || '',
            year_of_study: studentProfile.year_of_study || '',
            duration_in_weeks: studentProfile.duration_in_weeks || 0,
            start_date: studentProfile.start_date || '',
            completion_date: studentProfile.completion_date || '',
            company_id: '', // We'll handle this separately
            company_name: studentProfile.company_name || ''
          });
        } catch (error) {
          console.log('Student profile not found or not accessible');
        }
      } else if (user.role === 'lecturer') {
        try {
          const lecturerProfile = await lecturersApi.getProfile();
          setLecturerDetails({
            department: lecturerProfile.department || '',
            title: lecturerProfile.title || ''
          });
        } catch (error) {
          console.log('Lecturer profile not found or not accessible');
        }
             } else if (user.role === 'supervisor') {
         try {
           const supervisorProfile = await supervisorsApi.getProfile();
           setSupervisorDetails({
             phone_number: supervisorProfile.phone_number || '',
             position: supervisorProfile.position || '',
             company_name: supervisorProfile.company?.name || ''
           });
         } catch (error) {
           console.log('Supervisor profile not found or not accessible');
         }
       }
    } catch (error: any) {
      toast.error('Failed to load profile data');
    }
  };

  const loadCompanies = async () => {
    try {
      // This would be a new API endpoint to get available companies
      // For now, we'll use a mock or you can implement this endpoint
      const companies = await supervisorsApi.getCompanies();
      setAvailableCompanies(companies);
    } catch (error) {
      console.log('Failed to load companies');
    }
  };

  const handlePersonalDetailsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingPersonal(true);

    try {
      const updateData: UserUpdateData = {
        first_name: personalDetails.first_name,
        last_name: personalDetails.last_name,
        email: personalDetails.email,
        username: personalDetails.username
      };

      await usersApi.updateProfile(updateData);
      toast.success('Personal details updated successfully');
      setIsEditingPersonal(false);

      // Reload user profile
      await loadUserProfile();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update personal details');
    } finally {
      setLoadingPersonal(false);
    }
  };

  const handleStudentDetailsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingStudent(true);

    try {
      const updateData: StudentUpdateData = {
        registration_no: studentDetails.registration_no,
        academic_year: studentDetails.academic_year,
        course: studentDetails.course,
        year_of_study: studentDetails.year_of_study,
        duration_in_weeks: studentDetails.duration_in_weeks,
        start_date: studentDetails.start_date,
        completion_date: studentDetails.completion_date,
        company_name: studentDetails.company_name
      };

      await studentsApi.updateProfile(updateData);
      toast.success('Academic and internship details updated successfully');
      setIsEditingStudent(false);

      // Reload user profile
      await loadUserProfile();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update academic and internship details');
    } finally {
      setLoadingStudent(false);
    }
  };

  const handleLecturerDetailsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingLecturer(true);

    try {
      const updateData: LecturerUpdateData = {
        department: lecturerDetails.department,
        title: lecturerDetails.title
      };

      await lecturersApi.updateProfile(updateData);
      toast.success('Department details updated successfully');
      setIsEditingLecturer(false);

      // Reload user profile
      await loadUserProfile();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update department details');
    } finally {
      setLoadingLecturer(false);
    }
  };

  const handleSupervisorDetailsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSupervisor(true);

    try {
      const updateData: SupervisorUpdateData = {
        phone_number: supervisorDetails.phone_number,
        position: supervisorDetails.position,
        company_name: supervisorDetails.company_name
      };

      await supervisorsApi.updateProfile(updateData);
      toast.success('Work details updated successfully');
      setIsEditingSupervisor(false);

      // Reload user profile
      await loadUserProfile();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update work details');
    } finally {
      setLoadingSupervisor(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingPassword(true);

    try {
      if (passwordData.new_password !== passwordData.confirm_password) {
        toast.error('New passwords do not match');
        return;
      }

      const passwordDataToSend: PasswordChangeData = {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
        confirm_password: passwordData.confirm_password
      };

      await usersApi.changePassword(passwordDataToSend);
      toast.success('Password changed successfully');

      // Clear password fields
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setLoadingPassword(false);
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'student': return 'Student';
      case 'lecturer': return 'University Lecturer';
      case 'supervisor': return 'Industry Supervisor';
      case 'admin': return 'System Administrator';
      default: return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'student': return <GraduationCap className="h-5 w-5" />;
      case 'lecturer': return <User className="h-5 w-5" />;
      case 'supervisor': return <Building className="h-5 w-5" />;
      case 'admin': return <Briefcase className="h-5 w-5" />;
      default: return <User className="h-5 w-5" />;
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">User not authenticated</h2>
          <p className="text-gray-600">Please log in to access settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account settings and profile information</p>
      </div>

      {/* User Role Badge */}
      <div className="mb-6">
        <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-sm">
          {getRoleIcon(user.role)}
          {getRoleDisplayName(user.role)}
        </Badge>
      </div>

      {/* Personal Details Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Details
          </CardTitle>
          <CardDescription>
            Update your basic personal information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePersonalDetailsUpdate}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={personalDetails.first_name}
                  onChange={(e) => setPersonalDetails(prev => ({ ...prev, first_name: e.target.value }))}
                  disabled={!isEditingPersonal}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={personalDetails.last_name}
                  onChange={(e) => setPersonalDetails(prev => ({ ...prev, last_name: e.target.value }))}
                  disabled={!isEditingPersonal}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={personalDetails.email}
                  onChange={(e) => setPersonalDetails(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!isEditingPersonal}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={personalDetails.username}
                  onChange={(e) => setPersonalDetails(prev => ({ ...prev, username: e.target.value }))}
                  disabled={!isEditingPersonal}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              {!isEditingPersonal ? (
                <Button type="button" onClick={() => setIsEditingPersonal(true)} variant="outline">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <>
                  <Button type="submit" disabled={loadingPersonal}>
                    <Save className="h-4 w-4 mr-2" />
                    {loadingPersonal ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button type="button" onClick={() => setIsEditingPersonal(false)} variant="outline">
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Role-Specific Details Section */}
      {user.role === 'student' && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Academic & Internship Details
            </CardTitle>
            <CardDescription>
              Update your academic information and attachment details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStudentDetailsUpdate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="registration_no">Registration Number</Label>
                  <Input
                    id="registration_no"
                    value={studentDetails.registration_no}
                    onChange={(e) => setStudentDetails(prev => ({ ...prev, registration_no: e.target.value }))}
                    disabled={!isEditingStudent}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="academic_year">Academic Year</Label>
                  <Input
                    id="academic_year"
                    value={studentDetails.academic_year}
                    onChange={(e) => setStudentDetails(prev => ({ ...prev, academic_year: e.target.value }))}
                    disabled={!isEditingStudent}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="course">Course</Label>
                  <Input
                    id="course"
                    value={studentDetails.course}
                    onChange={(e) => setStudentDetails(prev => ({ ...prev, course: e.target.value }))}
                    disabled={!isEditingStudent}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="year_of_study">Year of Study</Label>
                  <Input
                    id="year_of_study"
                    value={studentDetails.year_of_study}
                    onChange={(e) => setStudentDetails(prev => ({ ...prev, year_of_study: e.target.value }))}
                    disabled={!isEditingStudent}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="duration_in_weeks">Duration (Weeks)</Label>
                  <Input
                    id="duration_in_weeks"
                    type="number"
                    value={studentDetails.duration_in_weeks}
                    onChange={(e) => setStudentDetails(prev => ({ ...prev, duration_in_weeks: parseInt(e.target.value) || 0 }))}
                    disabled={!isEditingStudent}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={studentDetails.start_date}
                    onChange={(e) => setStudentDetails(prev => ({ ...prev, start_date: e.target.value }))}
                    disabled={!isEditingStudent}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="completion_date">Completion Date</Label>
                  <Input
                    id="completion_date"
                    type="date"
                    value={studentDetails.completion_date}
                    onChange={(e) => setStudentDetails(prev => ({ ...prev, completion_date: e.target.value }))}
                    disabled={!isEditingStudent}
                    className="mt-1"
                  />
                </div>
                                 <div>
                   <Label htmlFor="company">Company</Label>
                   <Select
                     value={studentDetails.company_name || ''}
                     onValueChange={(value) => {
                       const selectedCompany = availableCompanies.find(c => c.name === value);
                       setStudentDetails(prev => ({ 
                         ...prev, 
                         company_id: selectedCompany?.company_id || '',
                         company_name: value
                       }));
                     }}
                     disabled={!isEditingStudent}
                   >
                     <SelectTrigger className="mt-1">
                       <SelectValue placeholder={studentDetails.company_name || "Select a company"} />
                     </SelectTrigger>
                     <SelectContent>
                       {availableCompanies.map((company) => (
                         <SelectItem key={company.company_id} value={company.name}>
                           {company.name}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
              </div>
              <div className="flex gap-2 mt-4">
                {!isEditingStudent ? (
                  <Button type="button" onClick={() => setIsEditingStudent(true)} variant="outline">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                                 ) : (
                   <>
                     <Button type="submit" disabled={loadingStudent}>
                       <Save className="h-4 w-4 mr-2" />
                       {loadingStudent ? 'Saving...' : 'Save Changes'}
                     </Button>
                     <Button type="button" onClick={() => setIsEditingStudent(false)} variant="outline">
                       Cancel
                     </Button>
                   </>
                 )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {user.role === 'lecturer' && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Department & Title
            </CardTitle>
            <CardDescription>
              Update your department and academic title
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLecturerDetailsUpdate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={lecturerDetails.department}
                    onChange={(e) => setLecturerDetails(prev => ({ ...prev, department: e.target.value }))}
                    disabled={!isEditingLecturer}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="title">Academic Title</Label>
                  <Input
                    id="title"
                    value={lecturerDetails.title}
                    onChange={(e) => setLecturerDetails(prev => ({ ...prev, title: e.target.value }))}
                    disabled={!isEditingLecturer}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                {!isEditingLecturer ? (
                  <Button type="button" onClick={() => setIsEditingLecturer(true)} variant="outline">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                                 ) : (
                   <>
                     <Button type="submit" disabled={loadingLecturer}>
                       <Save className="h-4 w-4 mr-2" />
                       {loadingLecturer ? 'Saving...' : 'Save Changes'}
                     </Button>
                     <Button type="button" onClick={() => setIsEditingLecturer(false)} variant="outline">
                       Cancel
                     </Button>
                   </>
                 )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {user.role === 'supervisor' && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Work Details
            </CardTitle>
            <CardDescription>
              Update your work contact information and position
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSupervisorDetailsUpdate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    value={supervisorDetails.phone_number}
                    onChange={(e) => setSupervisorDetails(prev => ({ ...prev, phone_number: e.target.value }))}
                    disabled={!isEditingSupervisor}
                    className="mt-1"
                  />
                </div>
                               <div>
                 <Label htmlFor="position">Position</Label>
                 <Input
                   id="position"
                   value={supervisorDetails.position}
                   onChange={(e) => setSupervisorDetails(prev => ({ ...prev, position: e.target.value }))}
                   disabled={!isEditingSupervisor}
                   className="mt-1"
                 />
               </div>
               <div>
                 <Label htmlFor="company">Company</Label>
                 <Select
                   value={supervisorDetails.company_name || ''}
                   onValueChange={(value) => {
                     setSupervisorDetails(prev => ({ 
                       ...prev, 
                       company_name: value
                     }));
                   }}
                   disabled={!isEditingSupervisor}
                 >
                   <SelectTrigger className="mt-1">
                     <SelectValue placeholder={supervisorDetails.company_name || "Select a company"} />
                   </SelectTrigger>
                   <SelectContent>
                     {availableCompanies.map((company) => (
                       <SelectItem key={company.company_id} value={company.name}>
                         {company.name}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
              </div>
              <div className="flex gap-2 mt-4">
                {!isEditingSupervisor ? (
                  <Button type="button" onClick={() => setIsEditingSupervisor(true)} variant="outline">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                                 ) : (
                   <>
                     <Button type="submit" disabled={loadingSupervisor}>
                       <Save className="h-4 w-4 mr-2" />
                       {loadingSupervisor ? 'Saving...' : 'Save Changes'}
                     </Button>
                     <Button type="button" onClick={() => setIsEditingSupervisor(false)} variant="outline">
                       Cancel
                     </Button>
                   </>
                 )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Separator className="my-6" />

      {/* Password Change Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your account password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="current_password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current_password"
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                    className="mt-1 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="new_password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new_password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                    className="mt-1 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm_password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                    className="mt-1 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Button type="submit" disabled={loadingPassword}>
                <Lock className="h-4 w-4 mr-2" />
                {loadingPassword ? 'Changing Password...' : 'Change Password'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
