# users/urls.py
from django.urls import path

from . import views
from .views import RegisterView, LoginView, UserProfileView, UpdateProfileView, ChangePasswordView, PaymentListView, \
    SessionListView, ReservationView, ReservationDetail, ReservationList
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('user/', UserProfileView.as_view(), name='user_profile'),
    path('update-profile/', UpdateProfileView.as_view(), name='update-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # Endpoint pour obtenir les tokens
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('payments/', PaymentListView.as_view(), name='payment-list'),
    path('sessions/', SessionListView.as_view(), name='session-list'),
    path('reservations/', ReservationList.as_view(), name='reservation-list'),  # GET/POST
    path('reservations/<int:pk>/', ReservationDetail.as_view(), name='reservation-detail'),  # GET/PUT/DELETE
    path('reservation/<int:session_id>/', ReservationView.as_view(), name='reservation'),
]
