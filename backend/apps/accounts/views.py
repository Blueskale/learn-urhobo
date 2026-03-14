from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .serializers import MeSerializer, OnboardingSerializer, RegisterSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": MeSerializer(user).data,
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]


class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = MeSerializer

    def get_object(self):
        return self.request.user


class OnboardingView(APIView):
    def post(self, request):
        serializer = OnboardingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        profile = request.user.profile
        profile.motivation = serializer.validated_data["motivation"]
        profile.current_level = serializer.validated_data["current_level"]
        profile.learning_goal = serializer.validated_data["learning_goal"]
        profile.onboarding_complete = True
        profile.save(
            update_fields=[
                "motivation",
                "current_level",
                "learning_goal",
                "onboarding_complete",
            ]
        )
        return Response(MeSerializer(request.user).data)
