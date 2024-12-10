# users/models.py
from django.contrib.auth.models import AbstractUser, User
from django.db import models
from django.conf import settings
from django.utils import timezone


class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)

    def __str__(self):
        return self.username

class Payment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="payments")  # Utilisation de AUTH_USER_MODEL
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, choices=[("pending", "Pending"), ("success", "Success"), ("failed", "Failed")])
    reference = models.CharField(max_length=100)

    def __str__(self):
        return f"Payment {self.id} - {self.amount} €"

class Session(models.Model):
    title = models.CharField(max_length=255)
    duration = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    description = models.TextField()
    type = models.CharField(max_length=100)
    icon = models.CharField(max_length=255)  # Pour simplifier, stockez le nom de l'icône en tant que chaîne
    available = models.BooleanField(default=True)

    def __str__(self):
        return self.title

class Reservation(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # Utilisez AUTH_USER_MODEL au lieu de User directement
        on_delete=models.CASCADE
    )
    session = models.ForeignKey('Session', on_delete=models.CASCADE)
    reservation_date = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=20, choices=[
        ('Pending', 'Pending'),
        ('Confirmed', 'Confirmed'),
        ('Cancelled', 'Cancelled')
    ], default='Pending')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    first_name = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=10, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    rdv = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Reservation for {self.first_name or 'Unknown'} - {self.session}"

class CreateReservations(models.Model):
    session_id = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    email = models.EmailField()
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Reservation for {self.name} - {self.session_id}"