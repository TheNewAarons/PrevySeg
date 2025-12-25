import logging
from django.shortcuts import get_object_or_404, redirect
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.utils import timezone
from transbank.webpay.webpay_plus.transaction import Transaction
from transbank.common.options import WebpayOptions
from transbank.common.integration_commerce_codes import IntegrationCommerceCodes
from transbank.common.integration_api_keys import IntegrationApiKeys
from transbank.common.integration_type import IntegrationType
from transbank.error.transbank_error import TransbankError
from .models import Curso, InscripcionCurso, Usuario

# Configure logger
logger = logging.getLogger(__name__)

class IniciarPagoView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, curso_id):
        user = request.user
        
        # 1. Validate Course and Enrollment
        try:
            curso = Curso.objects.get(id=curso_id)
        except Curso.DoesNotExist:
            return Response({"error": "Curso no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        # Check if user is already enrolled
        try:
            inscripcion = InscripcionCurso.objects.get(usuario=user, curso=curso)
        except InscripcionCurso.DoesNotExist:
            return Response({"error": "No estás inscrito en este curso."}, status=status.HTTP_400_BAD_REQUEST)

        if inscripcion.pagado:
            return Response({"error": "Ya has pagado este curso."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check document approval status (Double check)
        # Assuming documents must be approved before payment
        
        # 2. Prepare Transaction
        buy_order = f"ORDER-{inscripcion.id}-{int(timezone.now().timestamp())}"
        session_id = f"SESSION-{user.id_usuario}-{int(timezone.now().timestamp())}"
        amount = curso.valor
        return_url = f"{settings.FRONTEND_URL}/webpay-return"
        
        # Ensure 'monto' is saved to enrollment to verify later
        inscripcion.monto = amount
        inscripcion.save()

        # 3. Init Transaction
        tx = Transaction(WebpayOptions(
            commerce_code=IntegrationCommerceCodes.WEBPAY_PLUS, 
            api_key=IntegrationApiKeys.WEBPAY, 
            integration_type=IntegrationType.TEST
        ))
        try:
            response = tx.create(buy_order, session_id, amount, return_url)
            # response contain 'url' and 'token'
            
            # Save token to verify later
            inscripcion.token_ws = response['token']
            inscripcion.save()
            
            return Response({
                "url": response['url'],
                "token": response['token'],
                "amount": amount
            })
            
        except TransbankError as e:
            logger.error(f"Transbank Error: {e}")
            return Response({"error": "Error al iniciar transacción con Webpay"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ConfirmarPagoView(APIView):
    permission_classes = [permissions.AllowAny] # Must be public if called directly by Webpay, or Auth if called by Frontend with token

    def post(self, request):
        # Frontend sends the token_ws here
        token = request.data.get('token_ws')
        
        if not token:
            return Response({"error": "Token no proporcionado"}, status=status.HTTP_400_BAD_REQUEST)

        # Find enrollment by token
        try:
            inscripcion = InscripcionCurso.objects.get(token_ws=token)
        except InscripcionCurso.DoesNotExist:
            return Response({"error": "Transacción no encontrada"}, status=status.HTTP_404_NOT_FOUND)

        if inscripcion.pagado:
             return Response({
                "message": "Pago ya confirmado",
                "status": "AUTHORIZED",
                "details": {}
            })

        # Commit Transaction
        tx = Transaction(WebpayOptions(
            commerce_code=IntegrationCommerceCodes.WEBPAY_PLUS, 
            api_key=IntegrationApiKeys.WEBPAY, 
            integration_type=IntegrationType.TEST
        ))
        try:
            response = tx.commit(token)
            # response checks
            status_txn = response.get('status')
            
            if status_txn == 'AUTHORIZED' and response.get('response_code') == 0:
                inscripcion.pagado = True
                inscripcion.fecha_pago = timezone.now()
                inscripcion.estado = 'INSCRITO'
                inscripcion.save()
                
                return Response({
                    "message": "Pago exitoso",
                    "status": status_txn,
                    "details": response
                })
            else:
                 return Response({
                    "message": "El pago fue rechazado o anulado",
                    "status": status_txn,
                    "details": response
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except TransbankError as e:
            logger.error(f"Transbank Commit Error: {e}")
            # If token is invalid or expired, it throws error
            return Response({"error": "Error al confirmar transacción"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
