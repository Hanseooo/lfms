from rest_framework import viewsets, permissions, filters
from .models import User
from .serializers import UserSerializer
from .permissions import IsAdminUserType
from reports.models import ActivityLog

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'first_name', 'last_name', 'email']

    def get_permissions(self):
        if self.action in ['list', 'destroy']:
            return [IsAdminUserType()]
        elif self.action in ['retrieve', 'update', 'partial_update']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'admin':
            return User.objects.all()
        return User.objects.filter(id=user.id)

    def partial_update(self, request, *args, **kwargs):
        """
        Override patch to log admin changes to user_type
        """
        user_to_update = self.get_object()
        old_role = user_to_update.user_type
        response = super().partial_update(request, *args, **kwargs)
        new_role = response.data.get("user_type")

        if old_role != new_role and request.user.user_type == "admin":
            action_text = (
                f"{request.user.username} (admin) updated "
                f"{user_to_update.username}'s role to {new_role}"
            )
            ActivityLog.objects.create(
                user=request.user,
                role=new_role,
                report=None,
                action=action_text
            )

        return response
