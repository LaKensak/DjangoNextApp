# forms.py
from django import forms

class ReservationForm(forms.Form):
    name = forms.CharField(max_length=255, required=True)
    email = forms.EmailField(required=True)
    gdpr_consent = forms.BooleanField(required=True, label="J'accepte la politique de confidentialité et les conditions d'utilisation.")

    def clean_gdpr_consent(self):
        consent = self.cleaned_data.get('gdpr_consent')
        if not consent:
            raise forms.ValidationError('Vous devez accepter les conditions RGPD.')
        return consent
