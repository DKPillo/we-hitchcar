from django.contrib.auth.models import User, Group
from rest_framework import viewsets
from webeng.hitchcar.models import Ride, Waypoint, PickUpRequest, Location
from webeng.hitchcar.serializers import UserSerializer, GroupSerializer, RideSerializer, WaypointSerializer, \
    PickUpRequestSerializer, LocationSerializer


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer


class RideViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows rides to be viewed or edited.
    """
    queryset = Ride.objects.all()
    serializer_class = RideSerializer


class WaypointViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows rides to be viewed or edited.
    """
    queryset = Waypoint.objects.all()
    serializer_class = WaypointSerializer


class PickUpRequestViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows rides to be viewed or edited.
    """
    queryset = PickUpRequest.objects.all()
    serializer_class = PickUpRequestSerializer


class LocationViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows rides to be viewed or edited.
    """
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
