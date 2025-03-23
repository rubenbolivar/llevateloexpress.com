from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import PointTransaction, UserPointsSummary, PointsConfig
from payments.serializers import PaymentSerializer

User = get_user_model()

class UserMinimalSerializer(serializers.ModelSerializer):
    """Minimal user serializer for nesting in other serializers"""
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name']
    
    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class PointsConfigSerializer(serializers.ModelSerializer):
    """Serializer for points system configuration"""
    class Meta:
        model = PointsConfig
        fields = '__all__'


class PointTransactionSerializer(serializers.ModelSerializer):
    """Serializer for point transactions"""
    user = UserMinimalSerializer(read_only=True)
    created_by = UserMinimalSerializer(read_only=True)
    transaction_type_display = serializers.SerializerMethodField()
    payment = PaymentSerializer(read_only=True)
    
    class Meta:
        model = PointTransaction
        fields = [
            'id', 'user', 'transaction_type', 'transaction_type_display',
            'points_amount', 'payment', 'reason', 'created_by', 'created_at'
        ]
    
    def get_transaction_type_display(self, obj):
        return obj.get_transaction_type_display()


class UserPointsSummarySerializer(serializers.ModelSerializer):
    """Serializer for user points summary"""
    user = UserMinimalSerializer(read_only=True)
    status = serializers.SerializerMethodField()
    waiting_days = serializers.SerializerMethodField()
    
    class Meta:
        model = UserPointsSummary
        fields = [
            'id', 'user', 'current_points', 'lifetime_points', 
            'status', 'waiting_days', 'last_updated'
        ]
    
    def get_status(self, obj):
        return obj.get_status_label()
    
    def get_waiting_days(self, obj):
        return obj.get_waiting_days()


class PointsStatusSerializer(serializers.Serializer):
    """Serializer for points status information"""
    current_points = serializers.IntegerField()
    waiting_days = serializers.IntegerField()
    status = serializers.CharField()
    next_level = serializers.CharField(allow_null=True)
    points_needed = serializers.IntegerField()
    lifetime_points = serializers.IntegerField()


class ManualPointsAdjustmentSerializer(serializers.Serializer):
    """Serializer for manual points adjustment"""
    points = serializers.IntegerField(required=True)
    reason = serializers.CharField(required=False, allow_blank=True)


class EducationalCoursePointsSerializer(serializers.Serializer):
    """Serializer for educational course points"""
    course_name = serializers.CharField(required=False, allow_blank=True) 