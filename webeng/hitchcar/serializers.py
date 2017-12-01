from django.contrib.auth.models import User, Group
from rest_framework import serializers
from webeng.hitchcar.models import Waypoint, PickUpRequest, Location


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ('url', 'username', 'email', 'groups')


class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ('url', 'name')


class RideSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ('url', 'id', 'user', 'startTime', 'start', 'destination', 'active')


class WaypointSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Waypoint
        fields = ('url', 'id', 'timestamp', 'location', 'ride')


class PickUpRequestSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = PickUpRequest
        fields = ('url', 'id', 'user', 'ride', 'location', 'destination', 'answered', 'answered')


class LocationSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Location
        fields = ('url', 'id', 'title', 'latitude', 'longitude')
