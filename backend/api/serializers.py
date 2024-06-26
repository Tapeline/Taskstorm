# pylint: disable=missing-class-docstring
# pylint: disable=missing-function-docstring
"""
Provides various serializers.
If serializer is named "unwrapped",then it
"unwraps" foreign keys to corresponding objects
"""

from typing import Dict, Any

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from api import models


class RegistrationSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = models.User
        fields = ["username", "password", "id"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        return models.User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.User
        fields = ["id", "username", "profile_pic"]


class MyProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.User
        fields = ["id", "username", "settings", "profile_pic"]


class UserProfilePicSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.User
        fields = ["id", "profile_pic"]


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    # pylint: disable=abstract-method
    def validate(self, attrs: Dict[str, Any]) -> Dict[str, str]:
        data = super().validate(attrs)
        data["user"] = self.user
        return data


class WorkspaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Workspace
        fields = "__all__"


class WorkspaceUnwrappedSerializer(serializers.ModelSerializer):
    owner = UserSerializer()
    members = UserSerializer(many=True)

    class Meta:
        model = models.Workspace
        fields = "__all__"
        depth = 1


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Task
        fields = "__all__"


class TaskUnwrappedSerializer(serializers.ModelSerializer):
    creator = UserSerializer()

    class Meta:
        model = models.Task
        fields = "__all__"
        depth = 1


class WorkflowStageSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.WorkflowStage
        fields = "__all__"


class NotificationRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.NotificationRule
        fields = "__all__"


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Notification
        fields = "__all__"


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Comment
        fields = "__all__"


class CommentUnwrappedSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = models.Comment
        depth = 1
        fields = "__all__"


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Document
        fields = "__all__"


class WorkflowPushSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = models.WorkflowPushAction
        fields = "__all__"
        depth = 1


class AssigneeChangeSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    new_assignee = UserSerializer()

    class Meta:
        model = models.AssigneeChangeAction
        fields = "__all__"
        depth = 1


class OpenStateChangeSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = models.OpenStateChangeAction
        fields = "__all__"
        depth = 1
