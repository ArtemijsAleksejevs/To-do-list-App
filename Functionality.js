document.addEventListener('DOMContentLoaded', loadTasks);

const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const dueDateInput = document.getElementById('due-date');
const prioritySelect = document.getElementById('priority');
const taskList = document.getElementById('task-list');
const sortDateButton = document.getElementById('sort-date');
const sortPriorityButton = document.getElementById('sort-priority');

taskForm.addEventListener('submit', addTask);
sortDateButton.addEventListener('click', sortTasksByDate);
sortPriorityButton.addEventListener('click', sortTasksByPriority);

function addTask(e) {
    e.preventDefault();

    const taskText = taskInput.value;
    const dueDate = dueDateInput.value;
    const priority = prioritySelect.value;

    if (taskText === '' || dueDate === '' || priority === '') return;

    const task = {
        text: taskText,
        dueDate: dueDate,
        priority: priority,
        completed: false
    };

    createTaskElement(task);

    saveTaskToLocalStorage(task);

    taskInput.value = '';
    dueDateInput.value = '';
    prioritySelect.value = 'low';
}

function createTaskElement(task) {
    const li = document.createElement('li');
    li.classList.add(`priority-${task.priority}`);
    if (task.completed) li.classList.add('completed');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => {
        task.completed = checkbox.checked;
        li.classList.toggle('completed', task.completed);
        updateTaskInLocalStorage(task);
    });

    const textSpan = document.createElement('span');
    textSpan.textContent = task.text;

    const dateSpan = document.createElement('span');
    dateSpan.textContent = task.dueDate;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = function () {
        taskList.removeChild(li);
        removeTaskFromLocalStorage(task);
    };

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.onclick = function () {
        editTask(li, task);
    };

    li.appendChild(checkbox);
    li.appendChild(textSpan);
    li.appendChild(dateSpan);
    li.appendChild(editButton);
    li.appendChild(deleteButton);
    taskList.appendChild(li);
}

function saveTaskToLocalStorage(task) {
    let tasks = getTasksFromLocalStorage();
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function getTasksFromLocalStorage() {
    let tasks;
    if (localStorage.getItem('tasks') === null) {
        tasks = [];
    } else {
        tasks = JSON.parse(localStorage.getItem('tasks'));
    }
    return tasks;
}

function loadTasks() {
    let tasks = getTasksFromLocalStorage();
    tasks.forEach(function (task) {
        createTaskElement(task);
    });
}

function removeTaskFromLocalStorage(task) {
    let tasks = getTasksFromLocalStorage();
    tasks = tasks.filter(t => t.text !== task.text || t.dueDate !== task.dueDate || t.priority !== task.priority || t.completed !== task.completed);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function updateTaskInLocalStorage(updatedTask) {
    let tasks = getTasksFromLocalStorage();
    tasks = tasks.map(task => (task.text === updatedTask.text && task.dueDate === updatedTask.dueDate && task.priority === updatedTask.priority) ? updatedTask : task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function editTask(li, oldTask) {
    const newTaskText = prompt("Edit task:", oldTask.text);
    const newDueDate = prompt("Edit due date:", oldTask.dueDate);
    const newPriority = prompt("Edit priority (low, medium, high):", oldTask.priority);

    if (newTaskText === null || newTaskText.trim() === "" ||
        newDueDate === null || newDueDate.trim() === "" ||
        newPriority === null || (newPriority !== 'low' && newPriority !== 'medium' && newPriority !== 'high')) return;

    const newTask = {
        text: newTaskText,
        dueDate: newDueDate,
        priority: newPriority,
        completed: oldTask.completed
    };

    li.classList.remove(`priority-${oldTask.priority}`);
    li.classList.add(`priority-${newTask.priority}`);
    li.classList.toggle('completed', newTask.completed);
    li.innerHTML = `
        <input type="checkbox" ${newTask.completed ? 'checked' : ''}>
        <span>${newTask.text}</span>
        <span>${newTask.dueDate}</span>
    `;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = function () {
        taskList.removeChild(li);
        removeTaskFromLocalStorage(newTask);
    };

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.onclick = function () {
        editTask(li, newTask);
    };

    const checkbox = li.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', () => {
        newTask.completed = checkbox.checked;
        li.classList.toggle('completed', newTask.completed);
        updateTaskInLocalStorage(newTask);
    });

    li.appendChild(editButton);
    li.appendChild(deleteButton);

    let tasks = getTasksFromLocalStorage();
    tasks = tasks.map(task => (task.text === oldTask.text && task.dueDate === oldTask.dueDate && task.priority === oldTask.priority) ? newTask : task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function sortTasksByDate() {
    let tasks = getTasksFromLocalStorage();
    tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    localStorage.setItem('tasks', JSON.stringify(tasks));
    reloadTasks();
}

function sortTasksByPriority() {
    let tasks = getTasksFromLocalStorage();
    const priorityOrder = { low: 1, medium: 2, high: 3 };
    tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    reloadTasks();
}

function reloadTasks() {
    taskList.innerHTML = '';
    loadTasks();
}
