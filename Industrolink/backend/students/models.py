import uuid
from django.db import models
from django.conf import settings
from supervisors.models import Supervisor, Company
from django.core.validators import MinValueValidator, MaxValueValidator
from datetime import date
from django.core.exceptions import ValidationError


class Student(models.Model):
    student_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='student_profile'
    )
    registration_no = models.CharField(max_length=50, unique=True)
    academic_year = models.CharField(max_length=20)
    course = models.CharField(max_length=100)
    year_of_study = models.CharField(max_length=20)
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='students'
    )   
    duration_in_weeks = models.IntegerField()
    start_date = models.DateField()
    completion_date = models.DateField()
    lecturer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_students',
        limit_choices_to={'role': 'lecturer'}
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} - {self.registration_no}"
    
    class Meta:
        db_table = 'students'




class TaskCategory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_user_created = models.BooleanField(default=False, help_text="Whether this category was created by a user")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_categories'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'task_categories'
        verbose_name_plural = 'Task Categories'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class DailyTask(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        'students.Student', 
        on_delete=models.CASCADE, 
        related_name='daily_tasks'
    )
    date = models.DateField(auto_now_add=True)
    description = models.TextField()
    task_category = models.ForeignKey(
        TaskCategory,
        on_delete=models.CASCADE,
        related_name='tasks'
    )
    tools_used = models.JSONField(default=list, blank=True)
    skills_applied = models.JSONField(default=list, blank=True)
    hours_spent = models.FloatField(
        validators=[MinValueValidator(0.1), MaxValueValidator(24)]
    )
    approved = models.BooleanField(default=False)
    # Supervisor approval fields
    supervisor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_tasks',
        limit_choices_to={'role': 'supervisor'}
    )
    supervisor_comments = models.TextField(blank=True, null=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Auto-calculated fields
    week_number = models.PositiveIntegerField(editable=False)
    iso_year = models.PositiveIntegerField(editable=False)
    
    class Meta:
        db_table = 'daily_tasks'
        ordering = ['-date', '-created_at']
        # unique_together = ['student', 'date']  # One task entry per student per day (auto-generated date) - COMMENTED OUT FOR DEVELOPMENT
        indexes = [
            models.Index(fields=['student', 'date']),
            models.Index(fields=['week_number', 'iso_year']),
        ]
    
    def clean(self):
        """Custom validation"""
        # Remove date validation since it's auto-generated
        if self.student and self.student.user.role != 'student':
            raise ValidationError("Tasks can only be assigned to student users")
    
    def save(self, *args, **kwargs):
        # Always use current date for calculations
        from datetime import date
        current_date = date.today()
        
        # Set the date if not already set
        if not self.date:
            self.date = current_date
        
        # Calculate week_number and iso_year from current date
        iso_year, iso_week, _ = current_date.isocalendar()
        self.week_number = iso_week
        self.iso_year = iso_year
        
        self.full_clean()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.student.user.get_full_name()} - {self.date}"

