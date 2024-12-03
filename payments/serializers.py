from rest_framework import serializers
from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'amount', 'status', 'reference', 'date']
        read_only_fields = ['id', 'date']  # Ne permet pas de modifier ces champs via l'API
