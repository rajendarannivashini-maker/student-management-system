from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Student


class StudentCRUDTests(APITestCase):
    def setUp(self):
        self.student = Student.objects.create(
            name="Nivashini",
            roll_number="AIDS001",
            department="AI & Data Science",
            year=2,
            email="niva@example.com",
            phone="9876543210",
        )
        self.list_url = "/api/students/"

    def test_create_student(self):
        payload = {
            "name": "New Student",
            "roll_number": "AIDS002",
            "department": "AI & Data Science",
            "year": 1,
            "email": "new@example.com",
            "phone": "9876500000",
        }
        response = self.client.post(self.list_url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Student.objects.count(), 2)

    def test_create_student_missing_field_fails(self):
        payload = {"name": "Incomplete"}
        response = self.client.post(self.list_url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_duplicate_roll_number_fails(self):
        payload = {
            "name": "Duplicate",
            "roll_number": "AIDS001",  # already used in setUp
            "department": "AI & Data Science",
            "year": 1,
            "email": "duplicate@example.com",
            "phone": "9876500001",
        }
        response = self.client.post(self.list_url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_students(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_retrieve_student(self):
        response = self.client.get(f"{self.list_url}{self.student.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["roll_number"], "AIDS001")

    def test_update_student(self):
        response = self.client.patch(
            f"{self.list_url}{self.student.id}/", {"department": "Data Science"}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.student.refresh_from_db()
        self.assertEqual(self.student.department, "Data Science")

    def test_update_invalid_id_fails(self):
        response = self.client.patch(f"{self.list_url}9999/", {"department": "X"})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_student(self):
        response = self.client.delete(f"{self.list_url}{self.student.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Student.objects.count(), 0)

    def test_delete_invalid_id_fails(self):
        response = self.client.delete(f"{self.list_url}9999/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_search_students(self):
        response = self.client.get(f"{self.list_url}?search=Niva")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
