
// =====================================================
// 1. GET THE HTML ELEMENTS
// =====================================================

// Get the form used to add new tasks.
const taskForm = document.getElementById("task-form");

// Get the text input where the user types a task.
const taskInput = document.getElementById("task-input");

// Get the list where tasks will be displayed.
const taskList = document.getElementById("task-list");

// Get the element that displays the remaining task count.
const taskSummary = document.getElementById("task-summary");

// Get the message shown when the list is empty.
const emptyMessage = document.getElementById("empty-message");


// =====================================================
// 2. LOAD SAVED TASKS FROM LOCAL STORAGE
// =====================================================

// localStorage saves information in the browser.
// JSON.parse converts the saved JSON text back into JavaScript data.
// If no saved tasks exist, use an empty array instead.
let tasks = [];

try {
    const savedTasks = localStorage.getItem("todoTasks");

    if (savedTasks !== null) {
        const parsedTasks = JSON.parse(savedTasks);

        // Only accept an array containing valid task objects.
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
    // If saved data cannot be read, start with an empty list.
    console.error("Could not load saved tasks:", error);
}


// =====================================================
// 3. SAVE TASKS TO LOCAL STORAGE
// =====================================================

// Convert the tasks array into JSON text and save it.
// This function is called whenever a task changes.
function saveTasks() {
    try {
        localStorage.setItem("todoTasks", JSON.stringify(tasks));
    } catch (error) {
        // Inform the developer if the browser cannot save the data.
        console.error("Could not save tasks:", error);
        alert("Your tasks could not be saved in this browser.");
    }
}


// =====================================================
// 4. ADD A NEW TASK
// =====================================================

// Listen for the user submitting the task form.
taskForm.addEventListener("submit", function (event) {

    // Stop the browser from refreshing the page.
    event.preventDefault();

    // Get the task name and remove extra spaces.
    const taskName = taskInput.value.trim();

    // Do not add a task if the input is empty.
    if (taskName === "") {
        return;
    }

    // Create a new task with a unique ID and completion status.
    const newTask = {
        id: Date.now(),
        name: taskName,
        completed: false
    };

    // Add the new task to the array.
    tasks.push(newTask);

    // Save the updated array in the browser.
    saveTasks();

    // Refresh the task list displayed on the webpage.
    renderTasks();

    // Clear the input for the next task.
    taskInput.value = "";
    taskInput.focus();
});


// =====================================================
// 5. DISPLAY THE TASKS
// =====================================================

function renderTasks() {

    // Remove the old displayed list before rebuilding it.
    taskList.innerHTML = "";

    // Count tasks that are not completed.
    const remainingTasks = tasks.filter(function (task) {
        return !task.completed;
    }).length;

    // Display the correct remaining-task count.
    taskSummary.textContent =
        remainingTasks +
        (remainingTasks === 1
            ? " task remaining"
            : " tasks remaining");

    // Hide the empty message when tasks exist.
    emptyMessage.hidden = tasks.length > 0;

    // Loop through every task and create its HTML elements.
    tasks.forEach(function (task) {

        // Create the container for one task.
        const listItem = document.createElement("li");
        listItem.className = "task-item";

        // Apply the completed style when appropriate.
        if (task.completed) {
            listItem.classList.add("completed");
        }

        // Create the checkbox for marking a task complete.
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;

        checkbox.setAttribute(
            "aria-label",
            "Mark " + task.name + " as completed"
        );

        // Update and save the task when the checkbox changes.
        checkbox.addEventListener("change", function () {

            // Store the new completion status.
            task.completed = checkbox.checked;

            // Save the updated tasks.
            saveTasks();

            // Refresh the display.
            renderTasks();
        });

        // Create the text displaying the task name.
        const taskText = document.createElement("span");
        taskText.className = "task-text";
        taskText.textContent = task.name;

        // Create the Delete button.
        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";
        deleteButton.type = "button";

        // Remove the selected task when clicked.
        deleteButton.addEventListener("click", function () {

            // Keep all tasks except the one being deleted.
            tasks = tasks.filter(function (item) {
                return item.id !== task.id;
            });

            // Save the updated array after deletion.
            saveTasks();

            // Display the remaining tasks.
            renderTasks();
        });

        // Put the checkbox, text, and Delete button in the item.
        listItem.appendChild(checkbox);
        listItem.appendChild(taskText);
        listItem.appendChild(deleteButton);

        // Add the item to the webpage.
        taskList.appendChild(listItem);
    });
}


// =====================================================
// 6. DISPLAY SAVED TASKS WHEN THE PAGE OPENS
// =====================================================

// Load and display the current tasks immediately.
// Because tasks were loaded from localStorage above,
// previously saved tasks appear after a page refresh.
renderTasks();
