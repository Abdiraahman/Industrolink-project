import uuid
from django.db import models
from django.conf import settings


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
