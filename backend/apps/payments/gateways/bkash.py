"""
bKash Payment Gateway Integration
Tokenized Checkout API
"""
import requests
from django.conf import settings


class BkashGateway:
    def __init__(self):
        self.base_url = settings.BKASH_BASE_URL
        self.app_key = settings.BKASH_APP_KEY
        self.app_secret = settings.BKASH_APP_SECRET
        self.username = settings.BKASH_USERNAME
        self.password = settings.BKASH_PASSWORD
        self._token = None

    def _get_token(self):
        url = f"{self.base_url}/checkout/token/grant"
        headers = {
            'Content-Type': 'application/json',
            'username': self.username,
            'password': self.password,
        }
        payload = {
            'app_key': self.app_key,
            'app_secret': self.app_secret,
        }
        response = requests.post(url, json=payload, headers=headers)
        data = response.json()
        if 'id_token' in data:
            self._token = data['id_token']
            return self._token
        raise Exception(f"bKash token error: {data}")

    def _get_headers(self):
        token = self._get_token()
        return {
            'Content-Type': 'application/json',
            'Authorization': token,
            'X-App-Key': self.app_key,
        }

    def create_payment(self, order, callback_url):
        url = f"{self.base_url}/checkout/payment/create"
        payload = {
            'mode': '0011',
            'payerReference': str(order.user.id),
            'callbackURL': callback_url,
            'amount': str(order.total),
            'currency': 'BDT',
            'intent': 'sale',
            'merchantInvoiceNumber': f'INV-{order.id}',
        }
        response = requests.post(url, json=payload, headers=self._get_headers())
        return response.json()

    def execute_payment(self, payment_id):
        url = f"{self.base_url}/checkout/payment/execute/{payment_id}"
        response = requests.post(url, headers=self._get_headers())
        return response.json()

    def query_payment(self, payment_id):
        url = f"{self.base_url}/checkout/payment/query/{payment_id}"
        response = requests.get(url, headers=self._get_headers())
        return response.json()
