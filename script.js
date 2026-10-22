
// =====================================================
// 1. GET THE HTML ELEMENTS
// =====================================================

const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const taskSummary = document.getElementById("task-summary");
const emptyMessage = document.getElementById("empty-message");

// Get the new search input and filter buttons.
const searchInput = document.getElementById("search-input");
const filterButtons = document.querySelectorAll(".filter-button");


// =====================================================
// 2. SET UP TASKS AND FILTER SETTINGS
// =====================================================

// Load previously saved tasks from the browser.
let tasks = [];

try {
    const savedTasks = localStorage.getItem("todoTasks");

    if (savedTasks !== null) {
        const parsedTasks = JSON.parse(savedTasks);

        // Check that saved data has the expected task structure.
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

// "all" means display both active and completed tasks.
let currentFilter = "all";


// =====================================================
// 3. SAVE TASKS TO LOCAL STORAGE
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
// 4. ADD A NEW TASK
// =====================================================

taskForm.addEventListener("submit", function (event) {

    // Prevent the page from refreshing when the form is submitted.
    event.preventDefault();

    // Get the task name and remove unnecessary spaces.
    const taskName = taskInput.value.trim();

    // Do not add an empty task.
    if (taskName === "") {
        return;
    }

    // Create a new task object.
    const newTask = {
        id: Date.now(),
        name: taskName,
        completed: false
    };

    // Store the task in the array.
    tasks.push(newTask);

    // Save the updated tasks.
    saveTasks();

    // Clear the search so the new task is visible.
    searchInput.value = "";

    // Switch to All so a new task is not hidden by a filter.
    currentFilter = "all";
    updateActiveFilterButton();

    // Display the updated task list.
    renderTasks();

    // Clear the input for the next task.
    taskInput.value = "";
    taskInput.focus();
});


// =====================================================
// 5. SEARCH TASKS
// =====================================================

// Update the displayed list whenever the search text changes.
searchInput.addEventListener("input", function () {
    renderTasks();
});


// =====================================================
// 6. FILTER TASKS
// =====================================================

// Attach a click event to each filter button.
filterButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        // Read the filter name from the clicked button.
        currentFilter = button.dataset.filter;

        // Highlight the selected filter button.
        updateActiveFilterButton();

        // Display tasks matching the selected filter.
        renderTasks();
    });
});


// =====================================================
// 7. UPDATE THE ACTIVE FILTER BUTTON
// =====================================================

function updateActiveFilterButton() {

    filterButtons.forEach(function (button) {

        // Compare the button's filter with the current filter.
        const isActive = button.dataset.filter === currentFilter;

        // Apply the active CSS class to the selected button.
        button.classList.toggle("active", isActive);

        // Tell assistive technology which filter is selected.
        button.setAttribute("aria-pressed", String(isActive));
    });
}


// =====================================================
// 8. DISPLAY TASKS USING SEARCH AND FILTERS
// =====================================================

function renderTasks() {

    // Remove the previous task display.
    taskList.innerHTML = "";

    // Count all unfinished tasks, not just visible tasks.
    const remainingTasks = tasks.filter(function (task) {
        return !task.completed;
    }).length;

    // Update the remaining-task counter.
    taskSummary.textContent =
        remainingTasks +
        (remainingTasks === 1
            ? " task remaining"
            : " tasks remaining");

    // Get the current search text and ignore letter case.
    const searchText = searchInput.value.trim().toLowerCase();

    // Select tasks that match both the search and the filter.
    const visibleTasks = tasks.filter(function (task) {

        // Check whether the task name contains the search text.
        const matchesSearch = task.name
            .toLowerCase()
            .includes(searchText);

        // Determine whether the task matches the chosen filter.
        const matchesFilter =
            currentFilter === "all" ||
            (currentFilter === "active" && !task.completed) ||
            (currentFilter === "completed" && task.completed);

        // Display the task only if both conditions are satisfied.
        return matchesSearch && matchesFilter;
    });

    // Show an appropriate message if no tasks match.
    if (visibleTasks.length === 0) {

        if (tasks.length === 0) {
            emptyMessage.textContent =
                "No tasks yet. Add your first task!";
        } else {
            emptyMessage.textContent =
                "No tasks match your search or filter.";
        }

        emptyMessage.hidden = false;

    } else {
        emptyMessage.hidden = true;
    }

    // Display each task that matches the search and filter.
    visibleTasks.forEach(function (task) {

        const listItem = document.createElement("li");
        listItem.className = "task-item";

        // Mark completed tasks with the completed CSS class.
        if (task.completed) {
            listItem.classList.add("completed");
        }

        // Create the completion checkbox.
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;

        checkbox.setAttribute(
            "aria-label",
            "Mark " + task.name + " as completed"
        );

        // Update and save the completion status.
        checkbox.addEventListener("change", function () {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        // Create the task name.
        const taskText = document.createElement("span");
        taskText.className = "task-text";
        taskText.textContent = task.name;

        // Create the Delete button.
        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";
        deleteButton.type = "button";

        // Delete the task from the array and save the change.
        deleteButton.addEventListener("click", function () {

            tasks = tasks.filter(function (item) {
                return item.id !== task.id;
            });

            saveTasks();
            renderTasks();
        });

        // Assemble the task item.
        listItem.appendChild(checkbox);
        listItem.appendChild(taskText);
        listItem.appendChild(deleteButton);

        // Add the task item to the webpage.
        taskList.appendChild(listItem);
    });
}


// =====================================================
// 9. INITIALIZE THE PAGE
// =====================================================

// Mark All as the initially selected filter.
updateActiveFilterButton();

// Load saved tasks and display them.
renderTasks();
