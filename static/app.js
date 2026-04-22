// ─── API ───────────────────────────────────────────

const fetchTasks = async () => {
    try {
        const response = await fetch('/tasks');
        const tasks = await response.json();
        renderTasks(tasks);
    } catch (error) {
        console.error('タスク取得エラー:', error);
    }
};

const addTask = async (title) => {
    try {
        const response = await fetch('/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title })
        });
        if (response.ok) fetchTasks();
    } catch (error) {
        console.error('タスク追加エラー:', error);
    }
};

const markTaskAsDone = async (taskId) => {
    try {
        const response = await fetch(`/tasks/${taskId}/done`, { method: 'PUT' });
        if (response.ok) fetchTasks();
    } catch (error) {
        console.error('完了フラグ更新エラー:', error);
    }
};

const unmarkTaskAsDone = async (taskId) => {
    try {
        const response = await fetch(`/tasks/${taskId}/done`, { method: 'DELETE' });
        if (response.ok) fetchTasks();
    } catch (error) {
        console.error('完了フラグ解除エラー:', error);
    }
};

const deleteTask = async (taskId) => {
    try {
        const response = await fetch(`/tasks/${taskId}`, { method: 'DELETE' });
        if (response.ok) fetchTasks();
    } catch (error) {
        console.error('タスク削除エラー:', error);
    }
};

// ─── DOM ───────────────────────────────────────────

const renderTasks = (tasks) => {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `
            <input type="checkbox" ${task.done ? 'checked' : ''}
                onchange="${task.done ? 'unmarkTaskAsDone' : 'markTaskAsDone'}(${task.id})">
            <span class="${task.done ? 'done' : ''}">${task.title}</span>
            <button onclick="deleteTask(${task.id})" class="button">削除</button>
        `;
        taskList.appendChild(li);
    });
};

// ─── イベント ──────────────────────────────────────

document.getElementById('task-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const input = document.getElementById('task-input');
    if (input.value.trim()) {
        addTask(input.value.trim());
        input.value = '';
    }
});

// 初回読み込み
fetchTasks();
