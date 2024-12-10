from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from django.core.exceptions import ValidationError
from .models import Payment
from .models import Session
from .models import Reservation

import re

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'username', 'email', 'password', 'confirm_password']

    def validate(self, data):
        # Vérification que les mots de passe correspondent
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"password": "Passwords do not match."})

        # Validation de la complexité du mot de passe (au moins 8 caractères, incluant un chiffre, une lettre majuscule et un caractère spécial)
        password = data['password']
        if len(password) < 8:
            raise serializers.ValidationError({"password": "Le mot de passe doit contenir au moins 8 caractères."})

        if not re.search(r'[A-Z]', password):  # Vérifie une majuscule
            raise serializers.ValidationError(
                {"password": "Le mot de passe doit contenir au moins une lettre majuscule."})

        if not re.search(r'[0-9]', password):  # Vérifie un chiffre
            raise serializers.ValidationError({"password": "Le mot de passe doit contenir au moins un chiffre."})

        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):  # Vérifie un caractère spécial
            raise serializers.ValidationError(
                {"password": "Le mot de passe doit contenir au moins un caractère spécial."})

        return data

    def create(self, validated_data):
        # Enlève confirm_password avant de créer l'utilisateur
        validated_data.pop('confirm_password')

        # Crypte le mot de passe
        validated_data['password'] = make_password(validated_data['password'])

        # Crée et retourne l'utilisateur
        return super().create(validated_data)


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'amount', 'date', 'status', 'reference']
        read_only_fields = ['id', 'date']  # Ne pas permettre à l'utilisateur de modifier l'ID ou la date

class SessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = '__all__'


class ReservationSerializer(serializers.ModelSerializer):
    sessionId = serializers.IntegerField(write_only=True)
    session = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Reservation
        fields = [
            'id',
            'user',
            'session',
            'sessionId',
            'reservation_date',
            'status',
            'price',
            'first_name',
            'email',
            'address',
            'phone',
            'rdv'
        ]
        read_only_fields = ['user', 'reservation_date', 'price', 'status']

    def create(self, validated_data):
        # Extraire les champs supplémentaires
        first_name = validated_data.pop('first_name', None)
        email = validated_data.pop('email', None)
        address = validated_data.pop('address', None)
        phone = validated_data.pop('phone', None)
        rdv = validated_data.pop('rdv', None)

        # Extraire et valider le sessionId
        session_id = validated_data.pop('sessionId')

        try:
            session = Session.objects.get(id=session_id)
        except Session.DoesNotExist:
            raise serializers.ValidationError({
                'sessionId': 'Session invalide'
            })

        # Récupérer l'utilisateur à partir du contexte
        user = self.context['request'].user

        # Créer la réservation
        reservation = Reservation.objects.create(
            user=user,
            session=session,
            price=session.price,
            status='Pending',
            first_name=first_name,
            email=email,
            address=address,
            phone=phone,
            rdv=rdv,
            **validated_data
        )

        return reservation

    def get_session(self, obj):
        """Retrieve serialized session details."""
        return {
            "id": obj.session.id,
            "title": obj.session.title,
            "price": str(obj.session.price),
        }
