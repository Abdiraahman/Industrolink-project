from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

User = get_user_model()

class Command(BaseCommand):
    help = 'Create an initial admin user'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, required=True, help='Admin email')
        parser.add_argument('--first-name', type=str, required=True, help='Admin first name')
        parser.add_argument('--last-name', type=str, required=True, help='Admin last name')
        parser.add_argument('--password', type=str, required=True, help='Admin password')

    def handle(self, *args, **options):
        email = options['email']
        first_name = options['first_name']
        last_name = options['last_name']
        password = options['password']

        try:
            # Check if admin already exists
            if User.objects.filter(role='admin').exists():
                self.stdout.write(
                    self.style.WARNING('Admin user already exists. Skipping creation.')
                )
                return

            # Create admin user
            user = User.objects.create_user(
                email=email,
                username=email,  # Use email as username
                first_name=first_name,
                last_name=last_name,
                password=password,
                role='admin',
                is_active=True,
                profile_completed=True,
                email_verified=True
            )

            self.stdout.write(
                self.style.SUCCESS(f'Successfully created admin user: {user.email}')
            )

        except ValidationError as e:
            self.stdout.write(
                self.style.ERROR(f'Validation error: {e}')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating admin user: {e}')
            )
