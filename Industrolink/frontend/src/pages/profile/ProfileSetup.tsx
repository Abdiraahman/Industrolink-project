import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Building, GraduationCap, Briefcase, Phone, Mail, MapPin, Clock, CheckCircle, Plus, Search, X } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';

interface Company {
  id: string;
  name: string;
  address: string;
  phone_number: string;
  email: string;
}

interface ProfileSetupProps {}

const ProfileSetup: React.FC<ProfileSetupProps> = () => {
  const { user, checkAuth } = useAuthContext();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Common fields for all users
  const [commonFields, setCommonFields] = useState({
    first_name: user?.firstName || user?.fullName?.split(' ')[0] || '',
    middle_name: user?.fullName?.split(' ')[1] || '',
    last_name: user?.lastName || user?.fullName?.split(' ').slice(-1)[0] || '',
    phone_number: '',
  });

  // Student-specific fields
  const [studentFields, setStudentFields] = useState({
    registration_no: '',
    academic_year: '',
    course: '',
    year_of_study: '',
    company_id: '',
    company_name: '',
    company_address: '',
    company_phone: '',
    company_email: '',
    duration_in_weeks: '',
    start_date: '',
    completion_date: '',
  });

  // Lecturer-specific fields
  const [lecturerFields, setLecturerFields] = useState({
    department: '',
    title: '',
  });

  // Supervisor-specific fields
  const [supervisorFields, setSupervisorFields] = useState({
    company_id: '',
    company_name: '',
    company_address: '',
    company_phone: '',
    company_email: '',
    position: '',
    phone_number: '',
  });

  // Company management
  const [companies, setCompanies] = useState<Array<{ id: string; name: string; address: string; phone_number: string; email: string }>>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Array<{ id: string; name: string; address: string; phone_number: string; email: string }>>([]);
  const [companySearch, setCompanySearch] = useState('');
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '',
    address: '',
    phone_number: '',
    email: '',
  });
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);

  useEffect(() => {
    // For now, we'll check if the user has a profile by trying to fetch it
    // This will be updated when we implement profile_completed in the backend
    if (user) {
      checkProfileStatus();
    }
  }, [user, navigate]);

  useEffect(() => {
    // Load companies if user is a student or supervisor
    if (user?.role === 'student' || user?.role === 'supervisor') {
      loadCompanies();
    }
  }, [user?.role]);

  // Filter companies based on search
  useEffect(() => {
    if (companySearch.trim() === '') {
      setFilteredCompanies(companies);
    } else {
      const filtered = companies.filter(company => 
        company.name.toLowerCase().includes(companySearch.toLowerCase()) ||
        company.address.toLowerCase().includes(companySearch.toLowerCase())
      );
      setFilteredCompanies(filtered);
    }
  }, [companySearch, companies]);

  const checkProfileStatus = async () => {
    try {
      // Try to fetch the user's profile to see if it exists
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/${user?.role}s/profile/`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        // Profile exists, redirect to dashboard
        navigate('/dashboard');
      }
      // If 404, profile doesn't exist, stay on this page
    } catch (error) {
      console.error('Error checking profile status:', error);
    }
  };

  const loadCompanies = async () => {
    try {
      console.log('Loading companies...');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/supervisors/companies/`, {
        credentials: 'include',
      });
      console.log('Company response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Company data received:', data);
        
        // Handle both paginated and non-paginated responses
        let companiesList = [];
        if (data.results && Array.isArray(data.results)) {
          // Paginated response
          companiesList = data.results;
        } else if (Array.isArray(data)) {
          // Non-paginated response
          companiesList = data;
        } else {
          console.error('Unexpected company data format:', data);
          companiesList = [];
        }
        
        const sortedCompanies = companiesList.sort((a: any, b: any) => 
          a.name.localeCompare(b.name)
        );
        console.log('Sorted companies:', sortedCompanies);
        setCompanies(sortedCompanies);
        setFilteredCompanies(sortedCompanies);
      } else {
        console.error('Failed to load companies:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  };

  const createNewCompany = async () => {
    if (!newCompany.name.trim() || !newCompany.address.trim() || !newCompany.phone_number.trim() || !newCompany.email.trim()) {
      return;
    }
    
    setIsCreatingCompany(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/supervisors/companies/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newCompany),
      });

      if (response.ok) {
        const createdCompany = await response.json();
        console.log('Company created successfully:', createdCompany);
        
        // Add to local state
        const updatedCompanies = [...companies, createdCompany].sort((a, b) => 
          a.name.localeCompare(b.name)
        );
        setCompanies(updatedCompanies);
        setFilteredCompanies(updatedCompanies);
        
        // Select the new company
        if (user?.role === 'student') {
          setStudentFields(prev => ({ 
            ...prev, 
            company_id: createdCompany.id,
            company_name: createdCompany.name,
            company_address: createdCompany.address,
            company_phone: createdCompany.phone_number,
            company_email: createdCompany.email
          }));
        } else if (user?.role === 'supervisor') {
          setSupervisorFields(prev => ({ 
            ...prev, 
            company_id: createdCompany.id,
            company_name: createdCompany.name,
            company_address: createdCompany.address,
            company_phone: createdCompany.phone_number,
            company_email: createdCompany.email
          }));
        }
        
        // Reset form
        setNewCompany({ name: '', address: '', phone_number: '', email: '' });
        setShowCompanyForm(false);
        
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Company creation failed:', errorData);
        throw new Error(errorData.error || errorData.message || 'Failed to create company');
      }
    } catch (error) {
      console.error('Error creating company:', error);
    } finally {
      setIsCreatingCompany(false);
    }
  };

  const selectCompany = (company: any) => {
    if (user?.role === 'student') {
      setStudentFields(prev => ({ 
        ...prev, 
        company_id: company.id,
        company_name: company.name,
        company_address: company.address,
        company_phone: company.phone_number,
        company_email: company.email
      }));
    } else if (user?.role === 'supervisor') {
      setSupervisorFields(prev => ({ 
        ...prev, 
        company_id: company.id,
        company_name: company.name,
        company_address: company.address,
        company_phone: company.phone_number,
        company_email: company.email
      }));
    }
  };

  const handleStudentFieldChange = (field: string, value: string) => {
    setStudentFields(prev => ({ ...prev, [field]: value }));
  };

  const handleLecturerFieldChange = (field: string, value: string) => {
    setLecturerFields(prev => ({ ...prev, [field]: value }));
  };

  const handleSupervisorFieldChange = (field: string, value: string) => {
    setSupervisorFields(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    // Role-specific validation
    switch (user?.role) {
      case 'student':
        if (!studentFields.registration_no.trim()) throw new Error('Registration number is required');
        if (!studentFields.academic_year.trim()) throw new Error('Academic year is required');
        if (!studentFields.course.trim()) throw new Error('Course is required');
        if (!studentFields.year_of_study.trim()) throw new Error('Year of study is required');
        if (!studentFields.company_id) throw new Error('Please select or create a company');
        if (!studentFields.duration_in_weeks) throw new Error('Duration in weeks is required');
        if (!studentFields.start_date) throw new Error('Start date is required');
        if (!studentFields.completion_date) throw new Error('Completion date is required');
        break;

      case 'lecturer':
        if (!lecturerFields.department.trim()) throw new Error('Department is required');
        if (!lecturerFields.title.trim()) throw new Error('Title is required');
        break;

      case 'supervisor':
        if (!supervisorFields.company_id) throw new Error('Please select or create a company');
        if (!supervisorFields.position.trim()) throw new Error('Position is required');
        if (!supervisorFields.phone_number.trim()) throw new Error('Phone number is required');
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionStatus(null);
    setErrorMessage('');

    try {
      validateForm();

      let profileData: any = {};

      // Add role-specific data
      switch (user?.role) {
        case 'student':
          profileData = {
            ...studentFields,
            duration_in_weeks: parseInt(studentFields.duration_in_weeks),
            company: studentFields.company_id, // Send company ID for backend relationship
          };
          break;

        case 'lecturer':
          profileData = {
            ...lecturerFields,
          };
          break;

        case 'supervisor':
          profileData = {
            ...supervisorFields,
            company: supervisorFields.company_id, // Send company ID for backend relationship
          };
          break;
      }

      // Submit profile data
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/${user?.role}s/profile/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Failed to create profile');
      }

      setSubmissionStatus('success');
      
      // Refresh auth context to get updated user data
      await checkAuth();
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error: any) {
      console.error('Error creating profile:', error);
      setSubmissionStatus('error');
      setErrorMessage(error.message || 'Error creating profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'student':
        return <GraduationCap className="h-6 w-6" />;
      case 'lecturer':
        return <User className="h-6 w-6" />;
      case 'supervisor':
        return <Briefcase className="h-6 w-6" />;
      default:
        return <User className="h-6 w-6" />;
    }
  };

  const getRoleTitle = () => {
    switch (user?.role) {
      case 'student':
        return 'Student Profile Setup';
      case 'lecturer':
        return 'Lecturer Profile Setup';
      case 'supervisor':
        return 'Supervisor Profile Setup';
      default:
        return 'Profile Setup';
    }
  };

  const getRoleDescription = () => {
    switch (user?.role) {
      case 'student':
        return 'Complete your student profile to access internship features and submit daily reports.';
      case 'lecturer':
        return 'Complete your lecturer profile to access student management and evaluation features.';
      case 'supervisor':
        return 'Complete your supervisor profile to access intern management and feedback features.';
      default:
        return 'Complete your profile to access all features.';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            {getRoleIcon()}
            <h1 className="text-3xl font-bold text-gray-900">{getRoleTitle()}</h1>
          </div>
          <p className="text-gray-600 text-lg">{getRoleDescription()}</p>
        </div>

        {/* Submission Status */}
        {submissionStatus && (
          <Card className={`mb-6 ${submissionStatus === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                {submissionStatus === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <div className="h-5 w-5 text-red-600">⚠</div>
                )}
                <span className={`${submissionStatus === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                  {submissionStatus === 'success' 
                    ? 'Profile created successfully! Redirecting to dashboard...' 
                    : errorMessage
                  }
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student-specific fields */}
          {user.role === 'student' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <GraduationCap className="h-5 w-5" />
                    <span>Academic Information</span>
                  </CardTitle>
                  <CardDescription>
                    Your academic and course details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="registration_no" className="text-sm font-medium">Registration Number *</Label>
                      <Input
                        id="registration_no"
                        type="text"
                        className="w-full"
                        value={studentFields.registration_no}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleStudentFieldChange('registration_no', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="academic_year" className="text-sm font-medium">Academic Year *</Label>
                      <Input
                        id="academic_year"
                        type="text"
                        className="w-full"
                        value={studentFields.academic_year}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleStudentFieldChange('academic_year', e.target.value)}
                        placeholder="e.g., 2024/2025"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="course" className="text-sm font-medium">Course *</Label>
                      <Input
                        id="course"
                        type="text"
                        className="w-full"
                        value={studentFields.course}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleStudentFieldChange('course', e.target.value)}
                        placeholder="e.g., Computer Science"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="year_of_study" className="text-sm font-medium">Year of Study *</Label>
                      <Select value={studentFields.year_of_study} onValueChange={(value) => handleStudentFieldChange('year_of_study', value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Year 1</SelectItem>
                          <SelectItem value="2">Year 2</SelectItem>
                          <SelectItem value="3">Year 3</SelectItem>
                          <SelectItem value="4">Year 4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="h-5 w-5" />
                    <span>Company Selection</span>
                  </CardTitle>
                  <CardDescription>
                    Select your internship company or create a new one
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Company Search */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Search className="h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search companies..."
                        value={companySearch}
                        onChange={(e) => setCompanySearch(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCompanyForm(true)}
                        className="h-8"
                      >
                        <Plus className="h-4 w-4" />
                        New Company
                      </Button>
                    </div>

                    {/* Company List */}
                    <div className="max-h-48 overflow-y-auto border rounded-lg">
                      {filteredCompanies.length > 0 ? (
                        <div className="divide-y">
                          {filteredCompanies.map((company) => (
                            <div
                              key={company.id}
                              className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                                studentFields.company_id === company.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                              }`}
                              onClick={() => selectCompany(company)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">{company.name}</h4>
                                  <p className="text-sm text-gray-600">{company.address}</p>
                                </div>
                                {studentFields.company_id === company.id && (
                                  <CheckCircle className="h-5 w-5 text-blue-600 ml-2" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          {companySearch ? 'No companies found matching your search.' : 'No companies available.'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Create New Company Form */}
                  {showCompanyForm && (
                    <Card className="border-2 border-blue-200 bg-blue-50">
                      <CardHeader>
                        <CardTitle className="text-lg">Create New Company</CardTitle>
                        <CardDescription>
                          Add a new company if it doesn't exist in the system
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="new_company_name" className="text-sm font-medium">Company Name *</Label>
                            <Input
                              id="new_company_name"
                              type="text"
                              className="w-full"
                              value={newCompany.name}
                              onChange={(e) => setNewCompany(prev => ({ ...prev, name: e.target.value }))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="new_company_phone" className="text-sm font-medium">Phone Number *</Label>
                            <Input
                              id="new_company_phone"
                              type="tel"
                              className="w-full"
                              value={newCompany.phone_number}
                              onChange={(e) => setNewCompany(prev => ({ ...prev, phone_number: e.target.value }))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="new_company_email" className="text-sm font-medium">Email *</Label>
                            <Input
                              id="new_company_email"
                              type="email"
                              className="w-full"
                              value={newCompany.email}
                              onChange={(e) => setNewCompany(prev => ({ ...prev, email: e.target.value }))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="new_company_address" className="text-sm font-medium">Company Address *</Label>
                            <Textarea
                              id="new_company_address"
                              className="w-full"
                              value={newCompany.address}
                              onChange={(e) => setNewCompany(prev => ({ ...prev, address: e.target.value }))}
                              placeholder="Full company address"
                              required
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-end space-x-2 pt-2">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              setShowCompanyForm(false);
                              setNewCompany({ name: '', address: '', phone_number: '', email: '' });
                            }}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            onClick={createNewCompany}
                            disabled={isCreatingCompany || !newCompany.name.trim() || !newCompany.address.trim() || !newCompany.phone_number.trim() || !newCompany.email.trim()}
                          >
                            {isCreatingCompany ? 'Creating...' : 'Create Company'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Selected Company Display */}
                  {studentFields.company_id && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <h4 className="font-medium text-green-900">Selected Company</h4>
                          <p className="text-sm text-green-700">{studentFields.company_name}</p>
                          <p className="text-sm text-green-600">{studentFields.company_address}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Internship Details</span>
                  </CardTitle>
                  <CardDescription>
                    Information about your internship placement
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="duration_in_weeks" className="text-sm font-medium">Duration (Weeks) *</Label>
                      <Input
                        id="duration_in_weeks"
                        type="number"
                        min="1"
                        max="52"
                        className="w-full"
                        value={studentFields.duration_in_weeks}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleStudentFieldChange('duration_in_weeks', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="start_date" className="text-sm font-medium">Start Date *</Label>
                      <Input
                        id="start_date"
                        type="date"
                        className="w-full"
                        value={studentFields.start_date}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleStudentFieldChange('start_date', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="completion_date" className="text-sm font-medium">Completion Date *</Label>
                      <Input
                        id="completion_date"
                        type="date"
                        className="w-full"
                        value={studentFields.completion_date}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleStudentFieldChange('completion_date', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Lecturer-specific fields */}
          {user.role === 'lecturer' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Academic Position</span>
                </CardTitle>
                <CardDescription>
                  Your academic role and department
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="department" className="text-sm font-medium">Department *</Label>
                    <Input
                      id="department"
                      type="text"
                      className="w-full"
                      value={lecturerFields.department}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleLecturerFieldChange('department', e.target.value)}
                      placeholder="e.g., Computer Science"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="title" className="text-sm font-medium">Academic Title *</Label>
                    <Select value={lecturerFields.title} onValueChange={(value) => handleLecturerFieldChange('title', value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select title" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lecturer">Lecturer</SelectItem>
                        <SelectItem value="Senior Lecturer">Senior Lecturer</SelectItem>
                        <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                        <SelectItem value="Professor">Professor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Supervisor-specific fields */}
          {user.role === 'supervisor' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="h-5 w-5" />
                    <span>Company Selection</span>
                  </CardTitle>
                  <CardDescription>
                    Select your company or create a new one
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Company Search */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Search className="h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search companies..."
                        value={companySearch}
                        onChange={(e) => setCompanySearch(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCompanyForm(true)}
                        className="h-8"
                      >
                        <Plus className="h-4 w-4" />
                        New Company
                      </Button>
                    </div>

                    {/* Company List */}
                    <div className="max-h-48 overflow-y-auto border rounded-lg">
                      {filteredCompanies.length > 0 ? (
                        <div className="divide-y">
                          {filteredCompanies.map((company) => (
                            <div
                              key={company.id}
                              className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                                supervisorFields.company_id === company.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                              }`}
                              onClick={() => selectCompany(company)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">{company.name}</h4>
                                  <p className="text-sm text-gray-600">{company.address}</p>
                                </div>
                                {supervisorFields.company_id === company.id && (
                                  <CheckCircle className="h-5 w-5 text-blue-600 ml-2" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          {companySearch ? 'No companies found matching your search.' : 'No companies available.'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Create New Company Form */}
                  {showCompanyForm && (
                    <Card className="border-2 border-blue-200 bg-blue-50">
                      <CardHeader>
                        <CardTitle className="text-lg">Create New Company</CardTitle>
                        <CardDescription>
                          Add a new company if it doesn't exist in the system
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="new_company_name" className="text-sm font-medium">Company Name *</Label>
                            <Input
                              id="new_company_name"
                              type="text"
                              className="w-full"
                              value={newCompany.name}
                              onChange={(e) => setNewCompany(prev => ({ ...prev, name: e.target.value }))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="new_company_phone" className="text-sm font-medium">Phone Number *</Label>
                            <Input
                              id="new_company_phone"
                              type="tel"
                              className="w-full"
                              value={newCompany.phone_number}
                              onChange={(e) => setNewCompany(prev => ({ ...prev, phone_number: e.target.value }))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="new_company_email" className="text-sm font-medium">Email *</Label>
                            <Input
                              id="new_company_email"
                              type="email"
                              className="w-full"
                              value={newCompany.email}
                              onChange={(e) => setNewCompany(prev => ({ ...prev, email: e.target.value }))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="new_company_address" className="text-sm font-medium">Company Address *</Label>
                            <Textarea
                              id="new_company_address"
                              className="w-full"
                              value={newCompany.address}
                              onChange={(e) => setNewCompany(prev => ({ ...prev, address: e.target.value }))}
                              placeholder="Full company address"
                              required
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-end space-x-2 pt-2">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              setShowCompanyForm(false);
                              setNewCompany({ name: '', address: '', phone_number: '', email: '' });
                            }}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            onClick={createNewCompany}
                            disabled={isCreatingCompany || !newCompany.name.trim() || !newCompany.address.trim() || !newCompany.phone_number.trim() || !newCompany.email.trim()}
                          >
                            {isCreatingCompany ? 'Creating...' : 'Create Company'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Selected Company Display */}
                  {supervisorFields.company_id && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <h4 className="font-medium text-green-900">Selected Company</h4>
                          <p className="text-sm text-green-700">{supervisorFields.company_name}</p>
                          <p className="text-sm text-green-600">{supervisorFields.company_address}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Your Position</span>
                  </CardTitle>
                  <CardDescription>
                    Your role and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="position" className="text-sm font-medium">Position *</Label>
                      <Input
                        id="position"
                        type="text"
                        className="w-full"
                        value={supervisorFields.position}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSupervisorFieldChange('position', e.target.value)}
                        placeholder="e.g., Senior Developer"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="supervisor_phone" className="text-sm font-medium">Phone Number *</Label>
                      <Input
                        id="supervisor_phone"
                        type="tel"
                        className="w-full"
                        value={supervisorFields.phone_number}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSupervisorFieldChange('phone_number', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Submit Button */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-end space-x-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? 'Creating...' : 'Complete Profile'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
