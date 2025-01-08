from datetime import datetime

from django.utils import timezone
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.views import TokenObtainPairView
from . import serializers
from django.core.exceptions import ValidationError
from .serializers import UserRegistrationSerializer, PaymentSerializer
from django.contrib.auth import authenticate, update_session_auth_hash
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework import permissions
from rest_framework.exceptions import ValidationError
import re
from rest_framework.decorators import api_view
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import Payment
from .models import Session
from .serializers import SessionSerializer
from .models import Reservation
from .serializers import ReservationSerializer
from rest_framework import generics
from django.views.decorators.csrf import csrf_exempt
import json
from django.views.decorators.http import require_http_methods
import logging
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views import View
from .forms import ReservationForm
from .models import Reservation
import stripe
from django.conf import settings

logger = logging.getLogger(__name__)


class RegisterView(APIView):
    def post(self, request):
        print("Received data:", request.data)  # Débug : affiche les données envoyées
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save()
                return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
            except Exception as e:
                print("Error during save:", e)  # Débug : affiche l'erreur
                return Response({"detail": f"Internal server error: {str(e)}"},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        # Validation des champs requis
        if not email or not password:
            return Response(
                {'error': 'Email et mot de passe sont requis.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = authenticate(request, username=email, password=password)

            if user:
                if not user.is_active:
                    return Response(
                        {'error': 'Votre compte est désactivé. Contactez l\'administrateur.'},
                        status=status.HTTP_403_FORBIDDEN
                    )

                # Générer un token JWT
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }, status=status.HTTP_200_OK)

            # Message générique pour éviter de révéler des informations sur le compte
            return Response(
                {'error': 'Email ou mot de passe incorrect.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            logger.error(f"Erreur lors de la tentative de connexion : {str(e)}")
            return Response(
                {'error': 'Une erreur est survenue. Veuillez réessayer plus tard.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            return Response({
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            })
        except (TokenError, InvalidToken):
            return Response({"detail": "token invalide ou expirer."}, status=401)


class UpdateProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        user = request.user
        username = request.data.get("username")
        email = request.data.get("email")
        first_name = request.data.get("first_name")
        last_name = request.data.get("last_name")
        password = request.data.get("password")

        if username:
            user.username = username
        if email:
            user.email = email
        if first_name:
            user.first_name = first_name
        if last_name:
            user.last_name = last_name

        user.save()
        return Response({"message": "Le profile à été mis à jour ."}, status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")

        if not current_password or not new_password:
            raise ValidationError("Les mots de passe actuels et nouveaux sont requis.")

        if not user.check_password(current_password):
            raise ValidationError("Le mot de passe actuel est incorrect.")

        # Validation de la force du mot de passe
        if not self.is_strong_password(new_password):
            raise ValidationError({
                "new_password": (
                    "Le mot de passe doit contenir au moins 8 caractères, "
                    "une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial."
                )
            })

        # Mise à jour du mot de passe
        user.set_password(new_password)
        user.save()

        # Met à jour l'authentification pour éviter la déconnexion
        update_session_auth_hash(request, user)

        return Response({"message": "Mot de passe modifié avec succès."}, status=200)

    @staticmethod
    def is_strong_password(password):
        """
        Vérifie si le mot de passe respecte les critères suivants :
        - Au moins 8 caractères
        - Contient au moins une lettre majuscule
        - Contient au moins une lettre minuscule
        - Contient au moins un chiffre
        - Contient au moins un caractère spécial
        """
        regex = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$'
        return re.match(regex, password) is not None


class LogoutView(APIView):
    def post(self, request):
        response = Response({"detail": "Successfully logged out."})
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        return response


class TokenObtainPairCookieView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        tokens = response.data

        # Définir le token dans un cookie sécurisé
        response.set_cookie(
            'access_token',
            tokens['access'],
            httponly=True,
            secure=True,  # Assure que le site utilise HTTPS
            samesite='Lax'
        )
        response.set_cookie(
            'refresh_token',
            tokens['refresh'],
            httponly=True,
            secure=True,
            samesite='Lax'
        )
        return response


class PaymentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Récupérer les paiements de l'utilisateur authentifié
        user = request.user
        payments = Payment.objects.filter(user=user)

        # Sérialiser les paiements
        serializer = PaymentSerializer(payments, many=True)

        # Retourner les paiements sous forme de JSON
        return Response({"payments": serializer.data}, status=status.HTTP_200_OK)


class SessionListView(APIView):
    def get(self, request):
        sessions = Session.objects.all()
        serializer = SessionSerializer(sessions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ReservationList(generics.ListCreateAPIView):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


def create(self, request, *args, **kwargs):
    try:
        # Log incoming request data
        logger.info(f"Reservation request data: {request.data}")

        # Récupérer et valider la date du rendez-vous
        rdv = request.data.get('rdv')
        if rdv is None:
            return Response({'error': 'Paramètre "rdv" manquant.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            rdv_datetime = datetime.fromisoformat(rdv)
        except ValueError:
            return Response({'error': 'Format de date/heure invalide. Utilisez ISO 8601.'}, status=status.HTTP_400_BAD_REQUEST)

        # Vérifier les horaires
        if rdv_datetime.hour < 8 or rdv_datetime.hour >= 18:
            return Response(
                {'error': 'Les rendez-vous ne peuvent être pris qu\'entre 8h et 18h.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Use the serializer with the request context
        serializer = self.get_serializer(data=request.data)

        # Validate the data
        serializer.is_valid(raise_exception=True)

        # Create the reservation
        self.perform_create(serializer)

        # Return success response
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    except serializers.ValidationError as e:
        # Log validation errors
        logger.error(f"Validation Error: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        # Log unexpected errors
        logger.error(f"Unexpected error in reservation creation: {str(e)}")
        return Response(
            {'detail': 'An unexpected error occurred'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# Détails d'une réservation
class ReservationDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer


class ReservationView(View):
    def post(self, request, *args, **kwargs):
        # Gérer la soumission du formulaire de réservation
        form = ReservationForm(request.POST)
        if form.is_valid():
            # Enregistrer la réservation dans la base de données
            name = form.cleaned_data['name']
            email = form.cleaned_data['email']
            session_id = request.POST.get('session_id')  # Assurez-vous que `session_id` est passé via le POST

            # Créer l'objet réservation
            reservation = Reservation.objects.create(
                name=name,
                email=email,
                session_id=session_id
            )

            # Réponse JSON si nécessaire
            return JsonResponse({'message': 'Réservation réussie'}, status=200)

        else:
            # Si le formulaire est invalide, retourner une erreur
            return JsonResponse({'error': 'Formulaire invalide', 'details': form.errors}, status=400)


@api_view(['GET'])
def check_availability(request):
    rdv = request.query_params.get('rdv')  # Get the date and time from query parameters
    if rdv is None:
        return Response({'error': 'Paramètre "rdv" manquant.'}, status=400)

    try:
        # Convertir le paramètre en objet datetime
        rdv_datetime = datetime.fromisoformat(rdv)
    except ValueError:
        return Response({'error': 'Format de date/heure invalide. Utilisez ISO 8601.'}, status=400)

    # Vérifier les horaires
    if rdv_datetime.hour < 8 or rdv_datetime.hour >= 18:
        return Response({'error': 'Les rendez-vous ne peuvent être pris qu\'entre 8h et 18h.'}, status=400)

    # Check if there's an existing reservation
    exists = Reservation.objects.filter(rdv=rdv_datetime).exists()
    if exists:
        return Response({'available': False}, status=200)  # If it exists, return False

    return Response({'available': True}, status=200)


class CreatePaymentIntentView(View):
    """Vue pour créer un PaymentIntent Stripe"""

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def post(self, request):
        stripe.api_key = settings.STRIPE_SECRET_KEY

        try:
            data = json.loads(request.body)
            amount = data.get('amount')
            currency = data.get('currency', 'eur')
            session_id = data.get('session_id')

            # Validation des données
            if not amount or not session_id:
                return JsonResponse({'error': 'Paramètres manquants'}, status=400)

            # Vérification de la session
            try:
                session = Session.objects.get(id=session_id)
            except Session.DoesNotExist:
                return JsonResponse({'error': 'Session non trouvée'}, status=404)


            # Création du PaymentIntent
            payment_intent = stripe.PaymentIntent.create(
                amount=amount,
                currency=currency,
                payment_method_types=['card'],
                metadata={
                    'session_id': session_id,
                }
            )

            return JsonResponse({
                'client_secret': payment_intent.client_secret
            })

        except stripe.error.StripeError as e:
            return JsonResponse({'error': str(e)}, status=400)
        except Exception as e:
            return JsonResponse({'error': 'Erreur serveur'}, status=500)


class ConfirmPaymentView(View):
    """Vue pour confirmer un paiement Stripe"""

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def post(self, request):
        stripe.api_key = settings.STRIPE_SECRET_KEY

        try:
            data = json.loads(request.body)
            payment_intent_id = data.get('payment_intent_id')
            session_id = data.get('session_id')

            # Vérification du paiement
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)

            if payment_intent.status == 'succeeded':
                # Mise à jour de la session
                session = Session.objects.get(id=session_id)
                session.is_paid = True
                session.payment_intent_id = payment_intent_id
                session.save()

                return JsonResponse({
                    'status': 'success',
                    'message': 'Paiement confirmé'
                })
            else:
                return JsonResponse({
                    'status': 'error',
                    'message': 'Paiement non confirmé'
                }, status=400)

        except stripe.error.StripeError as e:
            return JsonResponse({'error': str(e)}, status=400)
        except Exception as e:
            return JsonResponse({'error': 'Erreur serveur'}, status=500)
