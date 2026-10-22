
// =====================================================
// 1. GET THE HTML ELEMENTS
// =====================================================

const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const taskSummary = document.getElementById("task-summary");
const emptyMessage = document.getElementById("empty-message");

const searchInput = document.getElementById("search-input");
const filterButtons = document.querySelectorAll(".filter-button");


// =====================================================
// 2. LOAD SAVED TASKS
// =====================================================

let tasks = [];

try {
    const savedTasks = localStorage.getItem("todoTasks");

    if (savedTasks !== null) {
        const parsedTasks = JSON.parse(savedTasks);

        // Check that saved tasks have the required properties.
        if (
            Array.isArray(parsedTasks) &&
            parsedTasks.every(function (task) {
                return (
                    task !== null &&
                    typeof task === "object" &&
                    Number.isFinite(task.id) &&
                    typeof task.name === "string" &&
                    typeof task.completed === "boolean"
                );
            })
        ) {
            tasks = parsedTasks;
        }
    }
} catch (error) {
    console.error("Could not load saved tasks:", error);
}


// =====================================================
// 3. SET THE CURRENT FILTER AND EDITING TASK
// =====================================================

// Show all tasks by default.
let currentFilter = "all";

// Store the ID of the task currently being edited.
// null means no task is currently being edited.
let editingTaskId = null;


// =====================================================
// 4. SAVE TASKS TO LOCAL STORAGE
// =====================================================

function saveTasks() {
    try {
        localStorage.setItem("todoTasks", JSON.stringify(tasks));
    } catch (error) {
        console.error("Could not save tasks:", error);
        alert("Your tasks could not be saved in this browser.");
    }
}


// =====================================================
// 5. ADD A NEW TASK
// =====================================================

taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const taskName = taskInput.value.trim();

    if (taskName === "") {
        return;
    }

    const newTask = {
        id: Date.now(),
        name: taskName,
        completed: false
    };

    tasks.push(newTask);

    saveTasks();

    // Clear search and show all tasks after adding a task.
    searchInput.value = "";
    currentFilter = "all";
    updateActiveFilterButton();

    renderTasks();

    taskInput.value = "";
    taskInput.focus();
});


// =====================================================
// 6. SEARCH TASKS
// =====================================================

searchInput.addEventListener("input", function () {
    renderTasks();
});


// =====================================================
// 7. FILTER TASKS
// =====================================================

filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        currentFilter = button.dataset.filter;

        updateActiveFilterButton();
        renderTasks();
    });
});


// =====================================================
// 8. UPDATE THE SELECTED FILTER BUTTON
// =====================================================

function updateActiveFilterButton() {
    filterButtons.forEach(function (button) {
        const isActive = button.dataset.filter === currentFilter;

        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });
}


// =====================================================
// 9. EDIT A TASK
// =====================================================

// Save the edited task name.
function saveEditedTask(task, editInput) {
    const updatedName = editInput.value.trim();

    // Do not save empty task names.
    if (updatedName === "") {
        alert("Task name cannot be empty.");
        editInput.focus();
        return;
    }

    // Do not allow task names longer than the input limit.
    if (updatedName.length > 150) {
        alert("Task name cannot exceed 150 characters.");
        editInput.focus();
        return;
    }

    // Update the existing task rather than creating a new one.
    task.name = updatedName;

    // Save the edited name to local storage.
    saveTasks();

    // Leave editing mode.
    editingTaskId = null;

    // Refresh the list to show the updated task.
    renderTasks();
}


// =====================================================
// 10. DISPLAY TASKS
// =====================================================

function renderTasks() {
    taskList.innerHTML = "";

    // Count unfinished tasks across the entire task list.
    const remainingTasks = tasks.filter(function (task) {
        return !task.completed;
    }).length;

    taskSummary.textContent =
        remainingTasks +
        (remainingTasks === 1
            ? " task remaining"
            : " tasks remaining");

    // Read the search text without considering letter case.
    const searchText = searchInput.value.trim().toLowerCase();

    // Apply both search and status filtering.
    const visibleTasks = tasks.filter(function (task) {
        const matchesSearch = task.name
            .toLowerCase()
            .includes(searchText);

        const matchesFilter =
            currentFilter === "all" ||
            (currentFilter === "active" && !task.completed) ||
            (currentFilter === "completed" && task.completed);

        return matchesSearch && matchesFilter;
    });

    // Display an appropriate empty-state message.
    if (visibleTasks.length === 0) {
        emptyMessage.textContent = tasks.length === 0
            ? "No tasks yet. Add your first task!"
            : "No tasks match your search or filter.";

        emptyMessage.hidden = false;
    } else {
        emptyMessage.hidden = true;
    }

    // Build the visible task items.
    visibleTasks.forEach(function (task) {
        const listItem = document.createElement("li");
        listItem.className = "task-item";

        if (task.completed) {
            listItem.classList.add("completed");
        }

        // Create the task completion checkbox.
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute(
            "aria-label",
            "Mark " + task.name + " as completed"
        );

        checkbox.addEventListener("change", function () {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        listItem.appendChild(checkbox);

        // If this task is being edited, show an editing form.
        if (editingTaskId === task.id) {
            const editInput = document.createElement("input");
            editInput.type = "text";
            editInput.className = "edit-input";
            editInput.value = task.name;
            editInput.maxLength = 150;
            editInput.setAttribute("aria-label", "Edit task name");

            // Group the Save and Cancel buttons.
            const editActions = document.createElement("div");
            editActions.className = "task-actions";

            const saveButton = document.createElement("button");
            saveButton.type = "button";
            saveButton.className = "save-button";
            saveButton.textContent = "Save";

            const cancelButton = document.createElement("button");
            cancelButton.type = "button";
            cancelButton.className = "cancel-button";
            cancelButton.textContent = "Cancel";

            // Save when the Save button is clicked.
            saveButton.addEventListener("click", function () {
                saveEditedTask(task, editInput);
            });

            // Save when Enter is pressed.
            editInput.addEventListener("keydown", function (event) {
                if (event.key === "Enter") {
                    event.preventDefault();
                    saveEditedTask(task, editInput);
                }

                // Cancel editing when Escape is pressed.
                if (event.key === "Escape") {
                    editingTaskId = null;
                    renderTasks();
                }
            });

            // Cancel without changing the original task name.
            cancelButton.addEventListener("click", function () {
                editingTaskId = null;
                renderTasks();
            });

            editActions.appendChild(saveButton);
            editActions.appendChild(cancelButton);

            listItem.appendChild(editInput);
            listItem.appendChild(editActions);

            taskList.appendChild(listItem);

            // Focus the input so the user can start typing immediately.
            editInput.focus();

            return;
        }

        // Display the normal task name when not editing.
        const taskText = document.createElement("span");
        taskText.className = "task-text";
        taskText.textContent = task.name;

        listItem.appendChild(taskText);

        // Group Edit and Delete buttons.
        const taskActions = document.createElement("div");
        taskActions.className = "task-actions";

        // Create the Edit button.
        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "edit-button";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", function () {
            editingTaskId = task.id;
            renderTasks();
        });

        // Create the Delete button.
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function () {
            tasks = tasks.filter(function (item) {
                return item.id !== task.id;
            });

            // Exit editing mode if the deleted task was being edited.
            if (editingTaskId === task.id) {
                editingTaskId = null;
            }

            saveTasks();
            renderTasks();
        });

        taskActions.appendChild(editButton);
        taskActions.appendChild(deleteButton);

        listItem.appendChild(taskActions);
        taskList.appendChild(listItem);
    });
}


// =====================================================
// 11. INITIALIZE THE PAGE
// =====================================================

updateActiveFilterButton();
renderTasks();
