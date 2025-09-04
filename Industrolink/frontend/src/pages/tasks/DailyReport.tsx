import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, Tag, Wrench, Award, CheckCircle, XCircle, Plus, X, Search, PlusCircle } from 'lucide-react';
import { DailyTaskFormData, COMMON_TOOLS, COMMON_SKILLS, TaskCategory } from '@/types/task';
import { dailyTasksAPI } from '@/services/api/dailyTasks';
import { useNavigate } from 'react-router-dom';

const DailyReport: React.FC = () => {
  const [formData, setFormData] = useState<DailyTaskFormData>({
    description: '',
    task_category: '',
    tools_used: [],
    skills_applied: [],
    hours_spent: 0
  });

  const [toolInput, setToolInput] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [todayDate] = useState(new Date().toLocaleDateString());

  // Task category state
  const [taskCategories, setTaskCategories] = useState<TaskCategory[]>([]);
  const [categorySearch, setCategorySearch] = useState('');
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState<TaskCategory[]>([]);

  // Load task categories on component mount
  useEffect(() => {
    loadTaskCategories();
  }, []);

  // Check if user has student profile
  const [hasStudentProfile, setHasStudentProfile] = useState<boolean | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkStudentProfile = async () => {
      try {
        // Try to fetch student profile to check if it exists
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/students/profile/`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          setHasStudentProfile(true);
        } else if (response.status === 404) {
          setHasStudentProfile(false);
          // Redirect to profile setup if no profile exists
          navigate('/profile/setup');
        } else {
          setHasStudentProfile(false);
          navigate('/profile/setup');
        }
      } catch (error) {
        console.error('Error checking student profile:', error);
        setHasStudentProfile(false);
        navigate('/profile/setup');
      } finally {
        setProfileLoading(false);
      }
    };

    checkStudentProfile();
  }, [navigate]);

  // Filter categories based on search
  useEffect(() => {
    if (categorySearch.trim() === '') {
      setFilteredCategories(taskCategories);
    } else {
      const filtered = taskCategories.filter(cat => 
        cat.name.toLowerCase().includes(categorySearch.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [categorySearch, taskCategories]);

  const loadTaskCategories = async () => {
    try {
      const categories = await dailyTasksAPI.getTaskCategories();
      setTaskCategories(categories);
      setFilteredCategories(categories);
    } catch (error) {
      console.error('Error loading task categories:', error);
    }
  };

  const createNewCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    setIsCreatingCategory(true);
    try {
      const newCategory = await dailyTasksAPI.createTaskCategory({
        name: newCategoryName.trim(),
        description: `User-created category: ${newCategoryName.trim()}`
      });
      
      // Add to local state
      setTaskCategories(prev => [...prev, newCategory]);
      
      // Select the new category
      setFormData(prev => ({ ...prev, task_category: newCategory.id }));
      
      // Reset form
      setNewCategoryName('');
      setShowCategoryInput(false);
      
    } catch (error) {
      console.error('Error creating category:', error);
    } finally {
      setIsCreatingCategory(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (field: keyof DailyTaskFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add tool to the list
  const addTool = (tool: string) => {
    if (tool.trim() && !formData.tools_used.includes(tool.trim())) {
      setFormData(prev => ({
        ...prev,
        tools_used: [...prev.tools_used, tool.trim()]
      }));
      setToolInput('');
    }
  };

  // Remove tool from the list
  const removeTool = (toolToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tools_used: prev.tools_used.filter(tool => tool !== toolToRemove)
    }));
  };

  // Add skill to the list
  const addSkill = (skill: string) => {
    if (skill.trim() && !formData.skills_applied.includes(skill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills_applied: [...prev.skills_applied, skill.trim()]
      }));
      setSkillInput('');
    }
  };

  // Remove skill from the list
  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills_applied: prev.skills_applied.filter(skill => skill !== skillToRemove)
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user has student profile
    if (!hasStudentProfile) {
      setErrorMessage('You need to complete your student profile first.');
      setSubmissionStatus('error');
      return;
    }
    
    setIsSubmitting(true);
    setSubmissionStatus(null);
    setErrorMessage(''); // Clear previous errors

    try {
      // Validate required fields
      if (!formData.description.trim()) {
        throw new Error('Task description is required');
      }

      if (!formData.task_category) {
        throw new Error('Please select a task category');
      }

      if (formData.hours_spent <= 0 || formData.hours_spent > 24) {
        throw new Error('Hours spent must be between 0.1 and 24');
      }

      // Ensure arrays are properly formatted
      const formattedData = {
        ...formData,
        tools_used: formData.tools_used.filter(tool => tool.trim() !== ''),
        skills_applied: formData.skills_applied.filter(skill => skill.trim() !== ''),
        hours_spent: parseFloat(formData.hours_spent.toString())
      };

      // Submit the daily task via API
      console.log('Submitting daily task:', formattedData);
      console.log('Form data type check:', {
        description: typeof formattedData.description,
        task_category: typeof formattedData.task_category,
        task_category_value: formattedData.task_category,
        tools_used: Array.isArray(formattedData.tools_used),
        skills_applied: Array.isArray(formattedData.skills_applied),
        hours_spent: typeof formattedData.hours_spent
      });
      
      // Additional debugging
      console.log('Task categories available:', taskCategories);
      console.log('Selected category ID:', formattedData.task_category);
      console.log('Selected category object:', taskCategories.find(cat => cat.id === formattedData.task_category));
      
      const submittedTask = await dailyTasksAPI.submitDailyTask(formattedData);
      console.log('Task submitted successfully:', submittedTask);
      
      setSubmissionStatus('success');
      
      // Reset form after successful submission
      setFormData({
        description: '',
        task_category: '',
        tools_used: [],
        skills_applied: [],
        hours_spent: 0
      });
      
    } catch (error: any) {
      console.error('Error submitting daily task:', error);
      setSubmissionStatus('error');
      setErrorMessage(error.message || 'Error submitting daily task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get selected category details
  const selectedCategory = taskCategories.find(cat => cat.id === formData.task_category);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Daily Task Report</h1>
          <p className="text-gray-600 mt-1">Record your daily internship activities</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>{todayDate}</span>
        </div>
      </div>

      {/* Profile Check */}
      {profileLoading ? (
        <Card className="border border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </CardContent>
        </Card>
      ) : !hasStudentProfile ? (
        <Card className="border border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Student Profile Required</h3>
              <p className="text-red-600 mb-4">
                You need to complete your student profile before you can submit daily tasks.
              </p>
              <Button 
                variant="outline" 
                size="default"
                onClick={() => window.location.href = '/profile/setup'}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                Complete Profile Setup
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Submission Status */}
          {submissionStatus && (
            <Card className={`${submissionStatus === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  {submissionStatus === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`${submissionStatus === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                    {submissionStatus === 'success' 
                      ? 'Daily task submitted successfully!' 
                      : errorMessage || 'Error submitting daily task. Please try again.'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
        {/* Task Description */}
        <Card className="">
          <CardHeader className="">
            <CardTitle className="flex items-center space-x-2">
              <Tag className="h-5 w-5" />
              <span>Task Description</span>
            </CardTitle>
            <CardDescription className="">
              Describe what you worked on today in detail
            </CardDescription>
          </CardHeader>
          <CardContent className="">
            <Textarea
              placeholder="Describe your daily tasks, activities, and accomplishments..."
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
              className="min-h-32"
              required
            />
          </CardContent>
        </Card>

        {/* Task Category and Hours */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Task Category */}
          <Card className="">
            <CardHeader className="">
              <CardTitle className="">Task Category</CardTitle>
              <CardDescription className="">Select the primary category for today's work</CardDescription>
            </CardHeader>
            <CardContent className="">
              <div className="space-y-3">
                {/* Search and Create */}
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    placeholder="Search categories..."
                    value={categorySearch}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCategorySearch(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCategoryInput(true)}
                    className="h-8"
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>

                {/* Create New Category Input */}
                {showCategoryInput && (
                  <div className="flex space-x-2 p-3 bg-gray-50 rounded-lg">
                    <Input
                      type="text"
                      placeholder="New category name..."
                      value={newCategoryName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCategoryName(e.target.value)}
                      onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && (e.preventDefault(), createNewCategory())}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={createNewCategory}
                      disabled={!newCategoryName.trim() || isCreatingCategory}
                      className="h-8"
                    >
                      {isCreatingCategory ? 'Creating...' : 'Create'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowCategoryInput(false);
                        setNewCategoryName('');
                      }}
                      className="h-8"
                    >
                      Cancel
                    </Button>
                  </div>
                )}

                {/* Category Selection */}
                <Select value={formData.task_category} onValueChange={(value: string) => handleInputChange('task_category', value)}>
                  <SelectTrigger className="">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {filteredCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id} className="">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color || '#6B7280' }}
                          />
                          <span>{category.name}</span>
                          {category.is_user_created && (
                            <Badge variant="outline" className="text-xs">Custom</Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                    {filteredCategories.length === 0 && (
                      <div className="p-2 text-sm text-gray-500 text-center">
                        No categories found. Create a new one above.
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedCategory && (
                <p className="text-sm text-gray-600 mt-2">{selectedCategory.description}</p>
              )}
            </CardContent>
          </Card>

          {/* Hours Spent */}
          <Card className="">
            <CardHeader className="">
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Hours Spent</span>
              </CardTitle>
              <CardDescription className="">How many hours did you spend on tasks today?</CardDescription>
            </CardHeader>
            <CardContent className="">
              <Input
                type="number"
                min="0.1"
                max="24"
                step="0.1"
                placeholder="e.g., 8.5"
                value={formData.hours_spent || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('hours_spent', parseFloat(e.target.value) || 0)}
                required
                className=""
              />
              <p className="text-sm text-gray-500 mt-2">Enter hours as decimal (e.g., 1.5 for 1 hour 30 minutes)</p>
            </CardContent>
          </Card>
        </div>

        {/* Tools Used */}
        <Card className="">
          <CardHeader className="">
            <CardTitle className="flex items-center space-x-2">
              <Wrench className="h-5 w-5" />
              <span>Tools & Technologies Used</span>
            </CardTitle>
            <CardDescription className="">
              Add the tools, software, and technologies you used today
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tool Input */}
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Enter a tool or technology..."
                value={toolInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setToolInput(e.target.value)}
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && (e.preventDefault(), addTool(toolInput))}
                className="flex-1"
              />
              <Button type="button" onClick={() => addTool(toolInput)} variant="outline" size="md" className="">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Common Tools Suggestions */}
            <div>
              <Label className="text-sm text-gray-600">Quick add common tools:</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {COMMON_TOOLS.slice(0, 12).map((tool) => (
                  <Badge
                    key={tool}
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => addTool(tool)}
                  >
                    {tool}
                  </Badge>
                ))}
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-blue-100 text-blue-600 border-blue-300 transition-colors"
                  onClick={() => setToolInput('Other')}
                >
                  + Other
                </Badge>
              </div>
            </div>

            {/* Selected Tools */}
            {formData.tools_used.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Selected tools ({formData.tools_used.length}):</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tools_used.map((tool) => (
                    <Badge key={tool} variant="secondary" className="flex items-center space-x-1">
                      <span>{tool}</span>
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-red-500 transition-colors" 
                        onClick={() => removeTool(tool)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skills Applied */}
        <Card className="">
          <CardHeader className="">
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Skills Applied</span>
            </CardTitle>
            <CardDescription className="">
              What skills did you use or develop today?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Skill Input */}
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Enter a skill..."
                value={skillInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSkillInput(e.target.value)}
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && (e.preventDefault(), addSkill(skillInput))}
                className="flex-1"
              />
              <Button type="button" onClick={() => addSkill(skillInput)} variant="outline" size="md" className="">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Common Skills Suggestions */}
            <div>
              <Label className="text-sm text-gray-600">Quick add common skills:</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {COMMON_SKILLS.slice(0, 12).map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => addSkill(skill)}
                  >
                    {skill}
                  </Badge>
                ))}
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-green-100 text-green-600 border-green-300 transition-colors"
                  onClick={() => setSkillInput('Other')}
                >
                  + Other
                </Badge>
              </div>
            </div>

            {/* Selected Skills */}
            {formData.skills_applied.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Applied skills ({formData.skills_applied.length}):</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.skills_applied.map((skill) => (
                    <Badge key={skill} variant="secondary" className="flex items-center space-x-1">
                      <span>{skill}</span>
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-red-500 transition-colors" 
                        onClick={() => removeSkill(skill)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Card className="">
          <CardContent className="pt-6">
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" size="md" className="" onClick={() => {
                setFormData({
                  description: '',
                  task_category: '',
                  tools_used: [],
                  skills_applied: [],
                  hours_spent: 0
                });
              }}>
                Clear Form
              </Button>
              <Button type="submit" variant="default" disabled={isSubmitting || !hasStudentProfile} size="md" className="">
                {isSubmitting ? 'Submitting...' : 'Submit Daily Report'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </>
      )}
    </div>
  );
};

export default DailyReport;