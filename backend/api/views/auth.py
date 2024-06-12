from rest_framework import status
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework_simplejwt.views import TokenObtainPairView

from api import serializers
from api import models
from api.models import User


class RegisterView(CreateAPIView):
    serializer_class = serializers.RegistrationSerializer
    permission_classes = (AllowAny,)

    def create(self, request, *args, **kwargs):
        try:
            User.objects.get(username=request.data.get("username"))
            return Response({"error_message": "user already exists"}, 400)
        except:
            return super().create(request, *args, **kwargs)


class LoginView(TokenObtainPairView):
    serializer_class = serializers.CustomTokenObtainPairSerializer
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs) -> Response:
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        access_token = serializer.validated_data['access']
        user = serializer.validated_data['user']

        models.IssuedToken.objects.create(user=user, token=access_token)

        return Response(
            {
                'token': access_token,
                "user_data": serializers.MyProfileSerializer(user, context={'request': request}).data
            },
            status=status.HTTP_200_OK
        )
