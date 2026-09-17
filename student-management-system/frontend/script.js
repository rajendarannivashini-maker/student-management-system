// ---- Configuration ----
const API_BASE = "http://127.0.0.1:8000/api/students/";

// ---- Element references ----
const tableBody = document.getElementById("studentTableBody");
const emptyState = document.getElementById("emptyState");
const messageBox = document.getElementById("message");

const searchInput = document.getElementById("searchInput");
const yearFilter = document.getElementById("yearFilter");
const refreshBtn = document.getElementById("refreshBtn");
const addBtn = document.getElementById("addBtn");

const studentModal = document.getElementById("studentModal");
const studentForm = document.getElementById("studentForm");
const modalTitle = document.getElementById("modalTitle");
const cancelBtn = document.getElementById("cancelBtn");

const deleteModal = document.getElementById("deleteModal");
const deleteMessage = document.getElementById("deleteMessage");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

let studentToDelete = null;
let debounceTimer = null;

// ---- Helpers ----
function showMessage(text, type = "success") {
  messageBox.textContent = text;
  messageBox.className = `message ${type}`;
  messageBox.hidden = false;
  setTimeout(() => { messageBox.hidden = true; }, 3500);
}

function clearFieldErrors() {
  document.querySelectorAll(".error").forEach((el) => (el.textContent = ""));
}

function yearLabel(year) {
  const labels = { 1: "1st Year", 2: "2nd Year", 3: "3rd Year", 4: "4th Year" };
  return labels[year] || year;
}

function buildQuery() {
  const params = new URLSearchParams();
  if (searchInput.value.trim()) params.append("search", searchInput.value.trim());
  if (yearFilter.value) params.append("year", yearFilter.value);
  const qs = params.toString();
  return qs ? `${API_BASE}?${qs}` : API_BASE;
}

// ---- API calls ----
async function fetchStudents() {
  try {
    const response = await fetch(buildQuery());
    if (!response.ok) throw new Error("Failed to load students.");
    const data = await response.json();
    renderTable(data);
  } catch (err) {
    showMessage(err.message || "Could not reach the server. Is the backend running?", "error");
    renderTable([]);
  }
}

async function saveStudent(id, payload) {
  const url = id ? `${API_BASE}${id}/` : API_BASE;
  const method = id ? "PATCH" : "POST";

  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    // data is a dict of field -> [error messages]
    Object.entries(data).forEach(([field, errors]) => {
      const el = document.getElementById(`${toCamel(field)}Error`);
      if (el) el.textContent = Array.isArray(errors) ? errors[0] : errors;
    });
    throw new Error("Please fix the highlighted fields.");
  }

  return data;
}

async function deleteStudent(id) {
  const response = await fetch(`${API_BASE}${id}/`, { method: "DELETE" });
  if (!response.ok && response.status !== 204) {
    throw new Error("Failed to delete student.");
  }
}

function toCamel(field) {
  // roll_number -> rollNumber
  return field.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

// ---- Rendering ----
function renderTable(students) {
  tableBody.innerHTML = "";

  if (!students || students.length === 0) {
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;

  students.forEach((student) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(student.name)}</td>
      <td>${escapeHtml(student.roll_number)}</td>
      <td>${escapeHtml(student.department)}</td>
      <td>${yearLabel(student.year)}</td>
      <td>${escapeHtml(student.email)}</td>
      <td>${escapeHtml(student.phone)}</td>
      <td class="actions-cell">
        <button class="edit-btn" data-id="${student.id}">Edit</button>
        <button class="danger delete-btn" data-id="${student.id}" data-name="${escapeHtml(student.name)}">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  document.querySelectorAll(".edit-btn").forEach((btn) =>
    btn.addEventListener("click", () => openEditModal(btn.dataset.id, students))
  );
  document.querySelectorAll(".delete-btn").forEach((btn) =>
    btn.addEventListener("click", () => openDeleteModal(btn.dataset.id, btn.dataset.name))
  );
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

// ---- Modal control ----
function openAddModal() {
  clearFieldErrors();
  modalTitle.textContent = "Add Student";
  studentForm.reset();
  document.getElementById("studentId").value = "";
  studentModal.hidden = false;
}

function openEditModal(id, students) {
  clearFieldErrors();
  const student = students.find((s) => String(s.id) === String(id));
  if (!student) return;

  modalTitle.textContent = "Edit Student";
  document.getElementById("studentId").value = student.id;
  document.getElementById("name").value = student.name;
  document.getElementById("rollNumber").value = student.roll_number;
  document.getElementById("department").value = student.department;
  document.getElementById("year").value = student.year;
  document.getElementById("email").value = student.email;
  document.getElementById("phone").value = student.phone;

  studentModal.hidden = false;
}

function closeStudentModal() {
  studentModal.hidden = true;
}

function openDeleteModal(id, name) {
  studentToDelete = id;
  deleteMessage.textContent = `Are you sure you want to delete "${name}"? This cannot be undone.`;
  deleteModal.hidden = false;
}

function closeDeleteModal() {
  studentToDelete = null;
  deleteModal.hidden = true;
}

// ---- Client-side validation ----
function validateForm(payload) {
  let valid = true;
  clearFieldErrors();

  if (!payload.name.trim()) {
    document.getElementById("nameError").textContent = "Name is required.";
    valid = false;
  }
  if (!payload.roll_number.trim()) {
    document.getElementById("rollNumberError").textContent = "Roll number is required.";
    valid = false;
  }
  if (!payload.department.trim()) {
    document.getElementById("departmentError").textContent = "Department is required.";
    valid = false;
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(payload.email)) {
    document.getElementById("emailError").textContent = "Enter a valid email address.";
    valid = false;
  }
  const phonePattern = /^\+?\d{10,13}$/;
  if (!phonePattern.test(payload.phone)) {
    document.getElementById("phoneError").textContent = "Enter a valid 10-13 digit phone number.";
    valid = false;
  }

  return valid;
}

// ---- Event listeners ----
addBtn.addEventListener("click", openAddModal);
cancelBtn.addEventListener("click", closeStudentModal);
cancelDeleteBtn.addEventListener("click", closeDeleteModal);
refreshBtn.addEventListener("click", fetchStudents);

searchInput.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(fetchStudents, 350);
});
yearFilter.addEventListener("change", fetchStudents);

studentForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("studentId").value;
  const payload = {
    name: document.getElementById("name").value,
    roll_number: document.getElementById("rollNumber").value,
    department: document.getElementById("department").value,
    year: Number(document.getElementById("year").value),
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
  };

  if (!validateForm(payload)) return;

  try {
    await saveStudent(id || null, payload);
    closeStudentModal();
    showMessage(id ? "Student updated successfully." : "Student added successfully.", "success");
    fetchStudents();
  } catch (err) {
    showMessage(err.message || "Something went wrong.", "error");
  }
});

confirmDeleteBtn.addEventListener("click", async () => {
  if (!studentToDelete) return;
  try {
    await deleteStudent(studentToDelete);
    showMessage("Student deleted.", "success");
    closeDeleteModal();
    fetchStudents();
  } catch (err) {
    showMessage(err.message || "Failed to delete student.", "error");
    closeDeleteModal();
  }
});

// Close modals when clicking outside the content box
[studentModal, deleteModal].forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.hidden = true;
  });
});

// ---- Init ----
fetchStudents();
