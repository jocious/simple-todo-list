
// Get the HTML elements that JavaScript needs to control.
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const taskSummary = document.getElementById("task-summary");
const emptyMessage = document.getElementById("empty-message");

// Store the tasks created during this browser session.
let tasks = [];

// Listen for the user submitting the add-task form.
taskForm.addEventListener("submit", function (event) {
    // Stop the browser from refreshing the page.
    event.preventDefault();

    // Remove unnecessary spaces from the entered task.
    const taskName = taskInput.value.trim();

    // Do not add a task if the input is empty.
    if (taskName === "") {
        return;
    }

    // Create a task object with a unique ID and completion status.
    const newTask = {
        id: Date.now(),
        name: taskName,
        completed: false
    };

    // Add the new task to the tasks array.
    tasks.push(newTask);

    // Update the visible task list.
    renderTasks();

    // Clear the input after adding the task.
    taskInput.value = "";
    taskInput.focus();
});

// Display all tasks on the webpage.
function renderTasks() {
    // Clear the old display before rebuilding the list.
    taskList.innerHTML = "";

    // Count only tasks that are not completed.
    const remainingTasks = tasks.filter(function (task) {
        return !task.completed;
    }).length;

    // Update the task counter.
    taskSummary.textContent =
        remainingTasks + (remainingTasks === 1
            ? " task remaining"
            : " tasks remaining");

    // Show a message when there are no tasks.
    emptyMessage.hidden = tasks.length > 0;

    // Create an HTML list item for every task.
    tasks.forEach(function (task) {
        const listItem = document.createElement("li");
        listItem.className = "task-item";

        // Add a CSS class when the task is completed.
        if (task.completed) {
            listItem.classList.add("completed");
        }

        // Create a checkbox to toggle task completion.
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute(
            "aria-label",
            "Mark " + task.name + " as completed"
        );

        // Update the task when the checkbox changes.
        checkbox.addEventListener("change", function () {
            task.completed = checkbox.checked;
            renderTasks();
        });

        // Create a text element for the task name.
        const taskText = document.createElement("span");
        taskText.className = "task-text";
        taskText.textContent = task.name;

        // Create a button for deleting the task.
        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";
        deleteButton.type = "button";

        // Remove the selected task when Delete is clicked.
        deleteButton.addEventListener("click", function () {
            tasks = tasks.filter(function (item) {
                return item.id !== task.id;
            });

            renderTasks();
        });

        // Place all controls inside the task list item.
        listItem.appendChild(checkbox);
        listItem.appendChild(taskText);
        listItem.appendChild(deleteButton);

        // Add the finished item to the visible task list.
        taskList.appendChild(listItem);
    });
}

// Display the initial empty state.
renderTasks();
