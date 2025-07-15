import uuid
from django.db import models
from django.conf import settings


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
    #company_name = models.CharField(max_length=100)
    #company_address = models.TextField()
    duration_in_weeks = models.IntegerField()
    start_date = models.DateField()
    completion_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} - {self.registration_no}"
    
    class Meta:
        db_table = 'students'
