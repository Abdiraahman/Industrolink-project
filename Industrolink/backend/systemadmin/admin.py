from django.contrib import admin
from .models import AdminInvite, AdminAction, AdminSettings

@admin.register(AdminInvite)
class AdminInviteAdmin(admin.ModelAdmin):
    list_display = ['email', 'created_by', 'created_at', 'expires_at', 'used', 'status']
    list_filter = ['used', 'created_at', 'expires_at']
    search_fields = ['email', 'created_by__email']
    readonly_fields = ['id', 'token', 'created_at', 'used_at']
    ordering = ['-created_at']
    
    def status(self, obj):
        if obj.used:
            return 'Used'
        elif obj.is_expired:
            return 'Expired'
        else:
            return 'Active'
    status.short_description = 'Status'

@admin.register(AdminAction)
class AdminActionAdmin(admin.ModelAdmin):
    list_display = ['admin', 'action_type', 'target_user', 'created_at']
    list_filter = ['action_type', 'created_at']
    search_fields = ['admin__email', 'target_user__email', 'description']
    readonly_fields = ['id', 'created_at']
    ordering = ['-created_at']

@admin.register(AdminSettings)
class AdminSettingsAdmin(admin.ModelAdmin):
    list_display = ['key', 'value', 'updated_at']
    search_fields = ['key', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']
