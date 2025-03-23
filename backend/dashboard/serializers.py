from rest_framework import serializers
from .models import DashboardSavedView

class DashboardSavedViewSerializer(serializers.ModelSerializer):
    """Serializer for saved dashboard views"""
    class Meta:
        model = DashboardSavedView
        fields = ['id', 'name', 'view_type', 'configuration', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def create(self, validated_data):
        # Set the user from the request
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class DateRangeSerializer(serializers.Serializer):
    """Serializer for date range input in analytics requests"""
    date_from = serializers.DateField(required=False)
    date_to = serializers.DateField(required=False)
    
    def validate(self, data):
        date_from = data.get('date_from')
        date_to = data.get('date_to')
        
        if date_from and date_to and date_from > date_to:
            raise serializers.ValidationError({"date_from": "Start date cannot be after end date."})
        
        return data 