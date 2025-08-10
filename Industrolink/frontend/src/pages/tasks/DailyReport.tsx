import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, Tag, Wrench, Award, CheckCircle, XCircle, Plus, X } from 'lucide-react';
import { DailyTaskFormData, TASK_CATEGORIES, COMMON_TOOLS, COMMON_SKILLS } from '@/types/task';
import { dailyTasksAPI } from '@/services/api/dailyTasks';

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
  const [todayDate] = useState(new Date().toLocaleDateString());

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
    setIsSubmitting(true);
    
    try {
      // Validate required fields
      if (!formData.description.trim()) {
        throw new Error('Task description is required');
      }
      if (!formData.task_category) {
        throw new Error('Task category is required');
      }
      if (formData.hours_spent <= 0 || formData.hours_spent > 24) {
        throw new Error('Hours spent must be between 0.1 and 24');
      }

      // Submit the daily task via API
      console.log('Submitting daily task:', formData);
      
      const submittedTask = await dailyTasksAPI.submitDailyTask(formData);
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
      
    } catch (error) {
      console.error('Error submitting daily task:', error);
      setSubmissionStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get selected category details
  const selectedCategory = TASK_CATEGORIES.find(cat => cat.id === formData.task_category);

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
                  : 'Error submitting daily task. Please try again.'
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
              <Select value={formData.task_category} onValueChange={(value: string) => handleInputChange('task_category', value)}>
                <SelectTrigger className="">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="">
                  {TASK_CATEGORIES.map((category) => (
                    <SelectItem key={category.id} value={category.id} className="">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                className=""
              />
              <Button type="button" onClick={() => addTool(toolInput)} variant="outline" size="md" className="">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Common Tools Suggestions */}
            <div>
              <Label className="text-sm text-gray-600">Common tools:</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {COMMON_TOOLS.slice(0, 10).map((tool) => (
                  <Badge
                    key={tool}
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => addTool(tool)}
                  >
                    {tool}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Selected Tools */}
            {formData.tools_used.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Selected tools:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tools_used.map((tool) => (
                    <Badge key={tool} variant="outline" className="flex items-center space-x-1">
                      <span>{tool}</span>
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-red-500" 
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
                className=""
              />
              <Button type="button" onClick={() => addSkill(skillInput)} variant="outline" size="md" className="">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Common Skills Suggestions */}
            <div>
              <Label className="text-sm text-gray-600">Common skills:</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {COMMON_SKILLS.slice(0, 10).map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => addSkill(skill)}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Selected Skills */}
            {formData.skills_applied.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Applied skills:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.skills_applied.map((skill) => (
                    <Badge key={skill} variant="secondary" className="flex items-center space-x-1">
                      <span>{skill}</span>
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-red-500" 
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
              <Button type="submit" variant="default" disabled={isSubmitting} size="md" className="">
                {isSubmitting ? 'Submitting...' : 'Submit Daily Report'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default DailyReport;