# 🎓 Student Management System

A full-stack CRUD web application built as an academic SOP project.
It manages student records (Create, Read, Update, Delete) through a REST API,
with a database-backed backend and a responsive web frontend.

> Replace this line once you've pushed the repo: **Live repo:** `https://github.com/<your-username>/student-management-system`

---

## 1. Problem Statement

Colleges need a simple way to add, view, update, and remove student records
(name, roll number, department, year, email, phone) instead of tracking them
in spreadsheets. This project implements that as a small full-stack app.

## 2. Objectives

- Implement all four CRUD operations end to end.
- Expose the operations as a documented REST API.
- Validate input on both the client and the server.
- Cover the API with automated tests.
- Ship a responsive UI that talks to the API.

## 3. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, vanilla JavaScript (fetch API) |
| Backend | Django + Django REST Framework |
| Database | SQLite (dev) — swappable for MySQL/PostgreSQL |
| API testing | Django's `APITestCase` (+ Postman collection optional) |
| Version control | Git / GitHub |

## 4. System Architecture

```
Browser (HTML/CSS/JS)
        │  fetch() → JSON
        ▼
Django REST Framework API  (/api/students/)
        │  ORM
        ▼
SQLite Database
```

## 5. Project Structure

```
student-management-system/
├── backend/
│   ├── requirements.txt
│   └── studentms/
│       ├── manage.py
│       ├── studentms/          # project settings, urls, wsgi/asgi
│       │   ├── settings.py
│       │   ├── urls.py
│       │   ├── wsgi.py
│       │   └── asgi.py
│       └── students/           # the CRUD app
│           ├── models.py       # Student model
│           ├── serializers.py  # validation rules
│           ├── views.py        # ModelViewSet (CRUD + search/filter)
│           ├── urls.py         # DRF router
│           ├── admin.py
│           ├── tests.py        # 10 automated API tests
│           └── migrations/
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── docs/
│   └── api.md                  # endpoint reference
├── .gitignore
└── README.md
```

## 6. Database Design

**Student** table:

| Field | Type | Constraints |
|---|---|---|
| id | AutoField | Primary key |
| name | CharField(100) | required |
| roll_number | CharField(20) | required, unique |
| department | CharField(100) | required |
| year | SmallInteger | required, choices 1–4 |
| email | EmailField | required, unique, valid email format |
| phone | CharField(13) | required, 10–13 digits |
| created_at | DateTime | auto |
| updated_at | DateTime | auto |

## 7. Setup Instructions

### Backend (Django REST API)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cd studentms
python manage.py migrate
python manage.py createsuperuser   # optional, for /admin/
python manage.py runserver
```

The API is now live at `http://127.0.0.1:8000/api/students/`
and the Django admin at `http://127.0.0.1:8000/admin/`.

### Frontend (HTML/CSS/JS)

No build step required — it's plain static files.

```bash
cd frontend
python -m http.server 5500
```

Open `http://127.0.0.1:5500` in your browser. Make sure the Django server
from the previous step is still running — the frontend calls it at
`http://127.0.0.1:8000/api/students/` (see `API_BASE` in `script.js`).

> If you deploy the backend elsewhere, update `API_BASE` in `frontend/script.js`.

## 8. API Endpoints

| Operation | Method | Endpoint | Description |
|---|---|---|---|
| Create | POST | `/api/students/` | Add a new student |
| Read all | GET | `/api/students/` | List students (supports `?search=`, `?department=`, `?year=`) |
| Read one | GET | `/api/students/{id}/` | Get a single student |
| Update | PATCH/PUT | `/api/students/{id}/` | Update a student |
| Delete | DELETE | `/api/students/{id}/` | Remove a student |

Full request/response examples are in [`docs/api.md`](docs/api.md).

## 9. Validation

- **Client-side:** required-field checks, email format regex, phone format regex — shown inline under each field.
- **Server-side (always enforced, even if the client is bypassed):** required fields, unique `roll_number` and `email`, valid email format, phone pattern via `RegexValidator`.
- Duplicate `roll_number`/`email` and missing fields return `400 Bad Request` with a field-level error message.

## 10. Testing

Automated tests live in `backend/studentms/students/tests.py` and cover:
create (valid/missing/duplicate data), list, retrieve, update (valid/invalid id),
delete (valid/invalid id), and search.

```bash
cd backend/studentms
python manage.py test students
```

Expected result: `Ran 10 tests ... OK`.

For manual API testing, import the endpoints into Postman and try each
operation with valid, missing, and invalid data as described in `docs/api.md`.

## 11. Security Notes

- `SECRET_KEY` and `DEBUG` in `settings.py` are for **local development only** — set them from environment variables and turn `DEBUG` off before any real deployment.
- CORS is fully open (`CORS_ALLOW_ALL_ORIGINS = True`) for ease of local demoing; restrict it to your actual frontend origin in production.
- All database access goes through the Django ORM (parameterized queries, no raw SQL).

## 12. Future Enhancements

- Add authentication (JWT) so only logged-in staff can edit records.
- Add pagination controls and CSV export in the UI.
- Swap SQLite for PostgreSQL/MySQL for a production deployment.
- Rebuild the frontend in React for component-based state management.

## 13. Author

Built by Nivashini as part of a full-stack CRUD SOP assignment.
