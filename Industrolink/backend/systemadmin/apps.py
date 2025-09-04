from django.apps import AppConfig


class SystemAdminConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'systemadmin'
    verbose_name = 'System Admin'

    def ready(self):
        import systemadmin.signals
