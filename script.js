
// =====================================================
// 1. GET HTML ELEMENTS
// =====================================================

const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const taskSummary = document.getElementById("task-summary");
const emptyMessage = document.getElementById("empty-message");

const searchInput = document.getElementById("search-input");
const filterButtons = document.querySelectorAll(".filter-button");

// Dashboard statistic elements.
const totalCount = document.getElementById("total-count");
const activeCount = document.getElementById("active-count");
const completedCount = document.getElementById("completed-count");

// Progress bar elements.
const progressPercentage =
    document.getElementById("progress-percentage");

const progressFill = document.getElementById("progress-fill");
const progressTrack = document.getElementById("progress-track");
const progressMessage = document.getElementById("progress-message");

// Button for removing all completed tasks.
const clearCompletedButton =
    document.getElementById("clear-completed-button");


// =====================================================
// 2. LOAD TASKS FROM LOCAL STORAGE
// =====================================================

// Try to load the tasks previously saved in the browser.
let tasks = [];

try {
    const savedTasks = localStorage.getItem("todoTasks");

    if (savedTasks !== null) {
        const parsedTasks = JSON.parse(savedTasks);

        // Confirm that every saved item has the correct structure.
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

// Show all tasks when the page first opens.
let currentFilter = "all";

// Store the ID of the task currently being edited.
let editingTaskId = null;


// =====================================================
// 3. SAVE TASKS
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
// 4. UPDATE THE DASHBOARD STATISTICS
// =====================================================

function updateDashboard() {

    // Total number of tasks, including completed tasks.
    const total = tasks.length;

    // Count unfinished tasks.
    const active = tasks.filter(function (task) {
        return !task.completed;
    }).length;

    // Count finished tasks.
    const completed = tasks.filter(function (task) {
        return task.completed;
    }).length;

    // Update the three statistic cards.
    totalCount.textContent = total;
    activeCount.textContent = active;
    completedCount.textContent = completed;

    // Calculate the completion percentage.
    // Avoid dividing by zero when the list is empty.
    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    // Update the visible percentage.
    progressPercentage.textContent = percentage + "%";

    // Update the progress bar width.
    progressFill.style.width = percentage + "%";

    // Update progress bar accessibility information.
    progressTrack.setAttribute("aria-valuenow", percentage);

    // Display a message appropriate to the current progress.
    if (total === 0) {
        progressMessage.textContent =
            "Let's complete your first task!";
    } else if (percentage === 100) {
        progressMessage.textContent =
            "Amazing! All tasks are completed!";
    } else if (percentage >= 50) {
        progressMessage.textContent =
            "Great progress! Keep going!";
    } else {
        progressMessage.textContent =
            "Every completed task moves you forward.";
    }

    // Enable cleanup only when completed tasks exist.
    clearCompletedButton.disabled = completed === 0;
}


// =====================================================
// 5. ADD A NEW TASK
// =====================================================

taskForm.addEventListener("submit", function (event) {

    // Prevent the form from reloading the webpage.
    event.preventDefault();

    // Read the input and remove unnecessary spaces.
    const taskName = taskInput.value.trim();

    // Do not create an empty task.
    if (taskName === "") {
        return;
    }

    // Create the task object.
    const newTask = {
        id: Date.now(),
        name: taskName,
        completed: false
    };

    // Add the task to the array.
    tasks.push(newTask);

    // Save the updated list.
    saveTasks();

    // Clear the search and show the new task.
    searchInput.value = "";
    currentFilter = "all";
    editingTaskId = null;

    updateActiveFilterButton();
    renderTasks();

    // Clear the input for the next task.
    taskInput.value = "";
    taskInput.focus();
});


// =====================================================
// 6. SEARCH TASKS
// =====================================================

// Refresh the list whenever the search text changes.
searchInput.addEventListener("input", function () {
    renderTasks();
});


// =====================================================
// 7. FILTER TASKS
// =====================================================

// Listen for clicks on All, Active, and Completed.
filterButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        // Remember which filter was selected.
        currentFilter = button.dataset.filter;

        // Exit editing mode when changing filters.
        editingTaskId = null;

        updateActiveFilterButton();
        renderTasks();
    });
});


// =====================================================
// 8. UPDATE THE SELECTED FILTER
// =====================================================

function updateActiveFilterButton() {

    filterButtons.forEach(function (button) {

        const isActive =
            button.dataset.filter === currentFilter;

        // Add the CSS class to the selected button.
        button.classList.toggle("active", isActive);

        // Tell assistive technology which button is selected.
        button.setAttribute("aria-pressed", String(isActive));
    });
}


// =====================================================
// 9. EDIT AND SAVE A TASK
// =====================================================

function saveEditedTask(task, editInput) {

    // Read the updated task name.
    const updatedName = editInput.value.trim();

    // Reject empty task names.
    if (updatedName === "") {
        alert("Task name cannot be empty.");
        editInput.focus();
        return;
    }

    // Enforce the same 150-character limit as the add form.
    if (updatedName.length > 150) {
        alert("Task name cannot exceed 150 characters.");
        editInput.focus();
        return;
    }

    // Change the existing task instead of creating a new one.
    task.name = updatedName;

    // Save the edited task.
    saveTasks();

    // Exit editing mode.
    editingTaskId = null;

    // Refresh the list and dashboard.
    renderTasks();
}


// =====================================================
// 10. CLEAR COMPLETED TASKS
// =====================================================

clearCompletedButton.addEventListener("click", function () {

    // Find out how many completed tasks will be removed.
    const completedTotal = tasks.filter(function (task) {
        return task.completed;
    }).length;

    // Do nothing if there are no completed tasks.
    if (completedTotal === 0) {
        return;
    }

    // Ask for confirmation before permanently removing tasks.
    const confirmed = confirm(
        "Delete all " + completedTotal +
        " completed task(s)? This action cannot be undone."
    );

    // Keep all unfinished tasks if the user confirms.
    if (confirmed) {

        tasks = tasks.filter(function (task) {
            return !task.completed;
        });

        // Exit editing mode if necessary.
        editingTaskId = null;

        // Save the updated list.
        saveTasks();

        // Refresh the dashboard and task list.
        renderTasks();
    }
});


// =====================================================
// 11. DISPLAY TASKS
// =====================================================

function renderTasks() {

    // Clear the existing HTML task items.
    taskList.innerHTML = "";

    // Update the dashboard every time the list changes.
    updateDashboard();

    // Count unfinished tasks in the entire list.
    const remainingTasks = tasks.filter(function (task) {
        return !task.completed;
    }).length;

    // Update the remaining-task message.
    taskSummary.textContent =
        remainingTasks +
        (remainingTasks === 1
            ? " task remaining"
            : " tasks remaining");

    // Prepare the search text.
    const searchText = searchInput.value.trim().toLowerCase();

    // Select tasks matching both search and filter.
    const visibleTasks = tasks.filter(function (task) {

        // Search without considering uppercase or lowercase letters.
        const matchesSearch = task.name
            .toLowerCase()
            .includes(searchText);

        // Determine whether the task matches the status filter.
        const matchesFilter =
            currentFilter === "all" ||
            (currentFilter === "active" && !task.completed) ||
            (currentFilter === "completed" && task.completed);

        return matchesSearch && matchesFilter;
    });

    // Display the correct empty-state message.
    if (visibleTasks.length === 0) {

        emptyMessage.textContent = tasks.length === 0
            ? "No tasks yet. Add your first task!"
            : "No tasks match your search or filter.";

        emptyMessage.hidden = false;
    } else {
        emptyMessage.hidden = true;
    }

    // Create an HTML item for every visible task.
    visibleTasks.forEach(function (task) {

        const listItem = document.createElement("li");
        listItem.className = "task-item";

        // Apply the completed appearance when needed.
        if (task.completed) {
            listItem.classList.add("completed");
        }

        // Create the checkbox.
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;

        checkbox.setAttribute(
            "aria-label",
            "Mark " + task.name + " as completed"
        );

        // Update completion and save the change.
        checkbox.addEventListener("change", function () {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        listItem.appendChild(checkbox);

        // Show the editing controls for the selected task.
        if (editingTaskId === task.id) {

            const editInput = document.createElement("input");
            editInput.type = "text";
            editInput.className = "edit-input";
            editInput.value = task.name;
            editInput.maxLength = 150;
            editInput.setAttribute("aria-label", "Edit task name");

            const taskActions = document.createElement("div");
            taskActions.className = "task-actions";

            const saveButton = document.createElement("button");
            saveButton.type = "button";
            saveButton.className = "save-button";
            saveButton.textContent = "Save";

            const cancelButton = document.createElement("button");
            cancelButton.type = "button";
            cancelButton.className = "cancel-button";
            cancelButton.textContent = "Cancel";

            // Save with the Save button.
            saveButton.addEventListener("click", function () {
                saveEditedTask(task, editInput);
            });

            // Enter saves; Escape cancels.
            editInput.addEventListener("keydown", function (event) {

                if (event.key === "Enter") {
                    event.preventDefault();
                    saveEditedTask(task, editInput);
                }

                if (event.key === "Escape") {
                    editingTaskId = null;
                    renderTasks();
                }
            });

            // Cancel editing without changing the original name.
            cancelButton.addEventListener("click", function () {
                editingTaskId = null;
                renderTasks();
            });

            taskActions.appendChild(saveButton);
            taskActions.appendChild(cancelButton);

            listItem.appendChild(editInput);
            listItem.appendChild(taskActions);
            taskList.appendChild(listItem);

            editInput.focus();

            // Avoid adding the normal Edit/Delete buttons too.
            return;
        }

        // Display the task name.
        const taskText = document.createElement("span");
        taskText.className = "task-text";
        taskText.textContent = task.name;

        listItem.appendChild(taskText);

        // Group the Edit and Delete buttons.
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

            // Remove only the selected task.
            tasks = tasks.filter(function (item) {
                return item.id !== task.id;
            });

            // Exit editing mode if this task was being edited.
            if (editingTaskId === task.id) {
                editingTaskId = null;
            }

            saveTasks();
            renderTasks();
        });

        // Place both buttons in the action group.
        taskActions.appendChild(editButton);
        taskActions.appendChild(deleteButton);

        listItem.appendChild(taskActions);
        taskList.appendChild(listItem);
    });
}


// =====================================================
// 12. INITIALIZE THE APPLICATION
// =====================================================

// Select All as the initial filter.
updateActiveFilterButton();

// Load saved tasks, statistics, and progress on page load.
renderTasks();
