import uuid

from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
from django.conf import settings
from django.db import models


# This code is triggered whenever a new user has been created and saved to the database
@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)


# Create your models here.
class Ride(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    startTime = models.DateTimeField(auto_now_add=True)
    start = models.ForeignKey('Location', on_delete=models.SET_NULL, null=True)
    destination = models.ForeignKey('Location', on_delete=models.SET_NULL, null=True)
    active = models.BooleanField(default=True)

    def __str__(self):
        return "Ride from " + self.start.__str__() + " to " + self.destination.__str__()\
               + " (" + self.startTime.strftime('%d.%m.%Y %H:%M') + ")."


class Waypoint(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    timestamp = models.DateTimeField(auto_now_add=True)
    location = models.ForeignKey('Location', on_delete=models.SET_NULL, null=True)
    ride = models.ForeignKey('Ride', on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return "Waypoint " + self.location.__str__() + "(" + self.timestamp.strftime('%d.%m.%Y %H:%M') + ")."


class PickUpRequest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    ride = models.ForeignKey('Ride', on_delete=models.SET_NULL, null=True)
    location = models.ForeignKey('Location', on_delete=models.SET_NULL, null=True)
    destination = models.ForeignKey('Location', on_delete=models.SET_NULL, null=True)
    answered = models.BooleanField(default=False)
    accepted = models.BooleanField(default=False)

    def __str__(self):
        return "PickUpRequest from " + self.location.__str__() + " to " + self.destination.__str__() + "("\
               + self.user.username + ")."


class Location(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    title = models.CharField(max_length=200, null=True, blank=True)
    latitude = models.FloatField(null=False, blank=False)
    longitude = models.FloatField(null=False, blank=False)

    def __str__(self):
        return "Location (" + self.title + ") - Lat: " + self.latitude.__str__() + ", Long: " + self.longitude.__str__()
