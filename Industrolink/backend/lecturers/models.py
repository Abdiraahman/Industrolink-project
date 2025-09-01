import uuid
from django.db import models
from django.conf import settings
from students.models import Student


class Lecturer(models.Model):
    lecturer_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='lecturer_profile'
    )
    department = models.CharField(max_length=100)
    title = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} {self.user.first_name} {self.user.last_name}"
    
    class Meta:
        db_table = 'lecturer'


class LecturerStudentAssignment(models.Model):
    assignment_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lecturer = models.ForeignKey(
        Lecturer,
        on_delete=models.CASCADE,
        related_name='student_assignments'
    )
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='lecturer_assignments'
    )
    assigned_by = models.ForeignKey(
        'supervisors.Supervisor',
        on_delete=models.CASCADE,
        related_name='lecturer_assignments_made'
    )
    assigned_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'lecturer_student_assignments'
        unique_together = ['lecturer', 'student']
        verbose_name = 'Lecturer Student Assignment'
        verbose_name_plural = 'Lecturer Student Assignments'
    
    def __str__(self):
        return f"{self.lecturer} - {self.student}"
