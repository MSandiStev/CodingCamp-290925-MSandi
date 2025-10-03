// Initialize an empty array to store todo items
let todos = JSON.parse(localStorage.getItem("todos")) || [];
let currentFilter = "ALL";

// Function to add new todo
function addTodo() {
  /// Get input values
  const todoInput = document.getElementById("todo-input");
  const dateInput = document.getElementById("date-input");

  /// Validate input
  if (validateInput(todoInput.value, dateInput.value)) {
    /// Add new todo to the array
    let todo = {
      id: Date.now(), // Unique ID
      task: todoInput.value,
      date: dateInput.value,
      completed: false,
      status: "PENDING",
    };
    todos.push(todo);

    // Save to localStorage
    saveToLocalStorage();

    /// Render the updated todo list
    renderTodo();

    // Clear input fields
    todoInput.value = "";
    dateInput.value = "";

    // Show success message
    showAlert("Task added successfully!", "success");
  }
}

function renderTodo() {
  /// Get the todo list container
  const todoList = document.getElementById("todo-list");

  /// Clear existing list
  todoList.innerHTML = "";

  // Filter todos based on current filter
  let filteredTodos = todos;
  if (currentFilter === "PENDING") {
    filteredTodos = todos.filter((todo) => !todo.completed);
  } else if (currentFilter === "COMPLETED") {
    filteredTodos = todos.filter((todo) => todo.completed);
  }

  // If no todos, show empty message
  if (filteredTodos.length === 0) {
    todoList.innerHTML = `
            <tr>
                <td colspan="4" class="empty">
                    ${todos.length === 0 ? "No task found" : `No ${currentFilter.toLowerCase()} tasks found`}
                </td>
            </tr>
        `;
    return;
  }

  /// Render each todo item
  filteredTodos.forEach((todo, index) => {
    const originalIndex = todos.findIndex((t) => t.id === todo.id);
    const taskClass = todo.completed ? "completed-task" : "";

    const row = document.createElement("tr");
    row.innerHTML = `
            <td class="${taskClass}">${escapeHtml(todo.task)}</td>
            <td>${formatDate(todo.date)}</td>
            <td>
                <span class="status-badge ${todo.completed ? "status-completed" : "status-pending"}">
                    ${todo.status}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    ${!todo.completed ? `<button class="btn-complete" onclick="completeTodo(${todo.id})">Complete</button>` : ""}
                    <button class="btn-delete" onclick="deleteTodo(${todo.id})">Delete</button>
                </div>
            </td>
        `;

    todoList.appendChild(row);
  });
}

// Function to delete a todo
function deleteTodo(id) {
  if (confirm("Are you sure you want to delete this task?")) {
    todos = todos.filter((todo) => todo.id !== id);
    saveToLocalStorage();
    renderTodo();
    showAlert("Task deleted successfully!", "success");
  }
}

// Function to complete a todo
function completeTodo(id) {
  const todoIndex = todos.findIndex((todo) => todo.id === id);
  if (todoIndex !== -1) {
    todos[todoIndex].completed = true;
    todos[todoIndex].status = "COMPLETED";
    saveToLocalStorage();
    renderTodo();
    showAlert("Task completed!", "success");
  }
}

// Function to delete all todos
function deleteAll() {
  if (todos.length === 0) {
    showAlert("No tasks to delete!", "info");
    return;
  }

  if (confirm("Are you sure you want to delete ALL tasks? This action cannot be undone!")) {
    todos = [];
    saveToLocalStorage();
    renderTodo();
    showAlert("All tasks deleted successfully!", "success");
  }
}

// Function to filter todos
function filterTodo() {
  // Toggle between filter states
  if (currentFilter === "ALL") {
    currentFilter = "PENDING";
  } else if (currentFilter === "PENDING") {
    currentFilter = "COMPLETED";
  } else {
    currentFilter = "ALL";
  }

  // Update filter button text
  document.querySelector(".filter").textContent = `FILTER: ${currentFilter}`;

  // Re-render todos with current filter
  renderTodo();
}

/// Validate input fields
function validateInput(todo, date) {
  /// Check if fields are empty
  if (todo.trim() === "") {
    showAlert("Please enter a task!", "error");
    document.getElementById("todo-input").focus();
    return false;
  }

  if (date === "") {
    showAlert("Please select a due date!", "error");
    document.getElementById("date-input").focus();
    return false;
  }

  // Check if date is not in the past
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to beginning of day

  if (selectedDate < today) {
    showAlert("Due date cannot be in the past!", "error");
    document.getElementById("date-input").focus();
    return false;
  }

  /// Input is valid
  return true;
}

// Function to save todos to localStorage
function saveToLocalStorage() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

// Function to format date
function formatDate(dateString) {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
}

// Function to show alert messages
function showAlert(message, type) {
  // Remove existing alerts
  const existingAlert = document.querySelector(".custom-alert");
  if (existingAlert) {
    existingAlert.remove();
  }

  // Create alert element
  const alert = document.createElement("div");
  alert.className = `custom-alert alert-${type}`;
  alert.textContent = message;

  // Style the alert - POSISI DIUBAH KE ATAS
  alert.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        animation: slideDown 0.3s ease-out;
        max-width: 400px;
        text-align: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;

  // Set background color based on type
  if (type === "success") {
    alert.style.background = "#48bb78";
  } else if (type === "error") {
    alert.style.background = "#f56565";
  } else if (type === "info") {
    alert.style.background = "#667eea";
  }

  document.body.appendChild(alert);

  // Remove alert after 3 seconds
  setTimeout(() => {
    if (alert.parentNode) {
      alert.remove();
    }
  }, 3000);
}

// Function to escape HTML (prevent XSS)
function escapeHtml(unsafe) {
  return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// Initialize the app when page loads
document.addEventListener("DOMContentLoaded", function () {
  // Set minimum date to today
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("date-input").min = today;

  // Load todos from localStorage
  const savedTodos = localStorage.getItem("todos");
  if (savedTodos) {
    todos = JSON.parse(savedTodos);
  }

  // Render initial todos
  renderTodo();

  // Add event listener for Enter key in todo input
  document.getElementById("todo-input").addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      addTodo();
    }
  });
});

// ANIMASI DIUBAH UNTUK POSISI ATAS
const style = document.createElement("style");
style.textContent = `
    @keyframes slideDown {
        from {
            transform: translateX(-50%) translateY(-100%);
            opacity: 0;
        }
        to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
    }
    
    .custom-alert {
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        font-size: 14px;
    }
`;
document.head.appendChild(style);
