import sys
from django.contrib.auth.models import User, Group
from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from webeng.hitchcar.models import Ride, Waypoint, PickUpRequest, Location, Profile
from webeng.hitchcar.serializers import UserSerializer, GroupSerializer, RideSerializer, WaypointSerializer, \
    PickUpRequestSerializer, LocationSerializer, ProfileSerializer


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer


class ProfileViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer


class CurrentUserViewSet(APIView):
    def get(self, request, *args, **kwargs):
        user = request.user
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'profile': user.profile.id,
        })

    def put(self, request, *args, **kwargs):
        user = request.user
        user.email = request.data["email"]
        if "password" in request.data and request.data["password"] != '':
            if "repassword" in request.data and request.data["password"] == request.data["repassword"]:
                user.set_password(request.data["password"])
            else:
                return Response({'success':False}, status=status.HTTP_400_BAD_REQUEST)
        user.save()
        return Response({'success':True})


current_user_view = CurrentUserViewSet.as_view()


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
    filter_backends = (DjangoFilterBackend,)
    filter_fields = ('active', 'user')


class WaypointViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows rides to be viewed or edited.
    """
    queryset = Waypoint.objects.all()
    serializer_class = WaypointSerializer
    filter_backends = (DjangoFilterBackend,)
    filter_fields = ('ride',)


class PickUpRequestViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows rides to be viewed or edited.
    """
    queryset = PickUpRequest.objects.all()
    serializer_class = PickUpRequestSerializer
    filter_backends = (DjangoFilterBackend,)
    filter_fields = ('ride', 'user')


class LocationViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows rides to be viewed or edited.
    """
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
