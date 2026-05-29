# myapp/management/commands/setup_groups.py
from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group

from cir.constants import UserRole

class Command(BaseCommand):
    help = 'Creates standard user groups'

    def handle(self, *args, **kwargs):
        groups = [role.value for role in UserRole]
        for group in groups:
            Group.objects.get_or_create(name=group)
            
        self.stdout.write(self.style.SUCCESS('Successfully scaffolded user groups!'))