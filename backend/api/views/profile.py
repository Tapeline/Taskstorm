from rest_framework.generics import RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated

from api import serializers


class ProfileView(RetrieveUpdateDestroyAPIView):
    permission_classes = (IsAuthenticated, )
    serializer_class = serializers.UserSerializer

    def get_object(self):
        return self.request.user
