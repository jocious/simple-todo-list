let tasks = [];

function addTask() {

    let taskInput = document.getElementById("taskInput");
    let task = taskInput.value;

    if (task == "") {

        alert("Please enter a task.");

    } else {

        tasks.push(task);

        displayTasks();

        taskInput.value = "";
    }
}

function displayTasks() {

    let taskList = document.getElementById("taskList");

    taskList.innerHTML = "";

    for (let i = 0; i < tasks.length; i++) {

        let listItem = document.createElement("li");

        listItem.textContent = tasks[i];

        let deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";

        deleteButton.onclick = function() {
            deleteTask(i);
        };

        listItem.appendChild(deleteButton);

        taskList.appendChild(listItem);
    }
}

function deleteTask(index) {

    tasks.splice(index, 1);

    displayTasks();
}