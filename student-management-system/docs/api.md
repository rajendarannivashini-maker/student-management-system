# API Reference — Student Management System

Base URL: `http://127.0.0.1:8000/api/students/`

All request/response bodies are JSON.

---

## Create a student

`POST /api/students/`

Request body:
```json
{
  "name": "Nivashini",
  "roll_number": "AIDS001",
  "department": "AI & Data Science",
  "year": 2,
  "email": "niva@example.com",
  "phone": "9876543210"
}
```

Success — `201 Created`:
```json
{
  "id": 1,
  "name": "Nivashini",
  "roll_number": "AIDS001",
  "department": "AI & Data Science",
  "year": 2,
  "email": "niva@example.com",
  "phone": "9876543210",
  "created_at": "2026-09-17T10:00:00Z",
  "updated_at": "2026-09-17T10:00:00Z"
}
```

Validation error — `400 Bad Request` (e.g. duplicate roll number):
```json
{
  "roll_number": ["student with this roll number already exists."]
}
```

---

## List / search / filter students

`GET /api/students/`
`GET /api/students/?search=niva`
`GET /api/students/?department=AI&year=2`

Success — `200 OK`: array of student objects (same shape as above).

---

## Retrieve one student

`GET /api/students/{id}/`

Success — `200 OK`: a single student object.
Not found — `404 Not Found`.

---

## Update a student

`PATCH /api/students/{id}/` (partial update) or `PUT` (full update)

Request body (PATCH example):
```json
{ "department": "Data Science" }
```

Success — `200 OK`: the updated student object.
Invalid id — `404 Not Found`.

---

## Delete a student

`DELETE /api/students/{id}/`

Success — `204 No Content`.
Invalid id — `404 Not Found`.

---

## Suggested Postman test matrix

| Case | Method | Expected |
|---|---|---|
| Create with valid data | POST | 201 |
| Create with missing required field | POST | 400 |
| Create with duplicate roll_number/email | POST | 400 |
| List with empty database | GET | 200, `[]` |
| List with populated database | GET | 200, array |
| Update with valid id | PATCH | 200 |
| Update with invalid id | PATCH | 404 |
| Delete with valid id | DELETE | 204 |
| Delete with invalid id | DELETE | 404 |
