from django.db.models import Q
from rest_framework import viewsets
from rest_framework.response import Response

from .models import Student
from .serializers import StudentSerializer


class StudentViewSet(viewsets.ModelViewSet):
    """
    Provides full CRUD for Student records, plus search via ?search=<text>
    and filtering via ?department=<dept> and ?year=<year>.
    """

    queryset = Student.objects.all()
    serializer_class = StudentSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get("search")
        department = self.request.query_params.get("department")
        year = self.request.query_params.get("year")

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(roll_number__icontains=search)
                | Q(email__icontains=search)
            )
        if department:
            queryset = queryset.filter(department__icontains=department)
        if year:
            queryset = queryset.filter(year=year)

        return queryset

    def list(self, request, *args, **kwargs):
        # Return a plain list (no pagination wrapper) to keep the frontend simple.
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
