const authContainer = document.getElementById('auth-container');
const todoSection = document.getElementById('todo-section');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterButton = document.getElementById('show-register');
const cancelRegisterButton = document.getElementById('cancel-register');
const authMessage = document.getElementById('auth-message');
const userEmailEl = document.getElementById('user-email');
const saveInfoEl = document.getElementById('save-info');
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const logoutButton = document.getElementById('logout-button');

const localTasks = [];
let nextLocalTaskId = 1;

const getAuthToken = () => localStorage.getItem('accessToken');
const getCurrentUserEmail = () => localStorage.getItem('userEmail');
const isLoggedIn = () => Boolean(getAuthToken());

const updateSaveInfo = () => {
    if (isLoggedIn()) {
        saveInfoEl.textContent = 'このタスクはサーバーに保存されます。';
        saveInfoEl.className = 'message success';
    } else {
        saveInfoEl.textContent = '未ログイン時のタスクはブラウザ上のローカルデータです。ページを再読み込みすると消えます。';
        saveInfoEl.className = 'message error';
    }
};

const updateUI = () => {
    if (isLoggedIn()) {
        authContainer.classList.add('hidden');
        logoutButton.classList.remove('hidden');
        userEmailEl.textContent = `ログイン中: ${getCurrentUserEmail() ?? ''}`;
    } else {
        authContainer.classList.remove('hidden');
        logoutButton.classList.add('hidden');
        userEmailEl.textContent = '未ログイン（ローカルのみ）';
    }
    updateSaveInfo();
    fetchTasks();
};

const showMessage = (message, isError = true) => {
    authMessage.textContent = message;
    authMessage.className = `message ${isError ? 'error' : 'success'}`;
};

const clearMessage = () => {
    authMessage.textContent = '';
    authMessage.className = 'message';
};

const authHeaders = () => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const authFetch = async (path, options = {}) => {
    const headers = { ...options.headers, ...authHeaders() };
    const response = await fetch(path, { ...options, headers });
    if (response.status === 401) {
        logout();
        throw new Error('認証が必要です。もう一度ログインしてください。');
    }
    return response;
};

const handleAuthResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.detail || '認証に失敗しました。');
    }
    localStorage.setItem('accessToken', data.access_token);
    localStorage.setItem('userEmail', data.user.email);
    updateUI();
};

const login = async (email, password) => {
    const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    await handleAuthResponse(response);
};

const register = async (email, password) => {
    const response = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    await handleAuthResponse(response);
};

const createLocalTask = (title) => {
    const task = { id: nextLocalTaskId++, title, done: false };
    localTasks.push(task);
    return task;
};

const updateLocalTask = (taskId, done) => {
    const task = localTasks.find((item) => item.id === taskId);
    if (task) task.done = done;
};

const deleteLocalTask = (taskId) => {
    const index = localTasks.findIndex((item) => item.id === taskId);
    if (index !== -1) localTasks.splice(index, 1);
};

const fetchTasks = async () => {
    if (!isLoggedIn()) {
        renderTasks(localTasks);
        return;
    }

    try {
        const response = await authFetch('/tasks');
        const tasks = await response.json();
        renderTasks(tasks);
    } catch (error) {
        console.error('タスク取得エラー:', error);
        showMessage(error.message);
    }
};

const addTask = async (title) => {
    if (!isLoggedIn()) {
        createLocalTask(title);
        renderTasks(localTasks);
        return;
    }

    try {
        const response = await authFetch('/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title }),
        });
        if (response.ok) {
            fetchTasks();
        }
    } catch (error) {
        console.error('タスク追加エラー:', error);
        showMessage(error.message);
    }
};

const markTaskAsDone = async (taskId) => {
    if (!isLoggedIn()) {
        updateLocalTask(taskId, true);
        renderTasks(localTasks);
        return;
    }

    try {
        const response = await authFetch(`/tasks/${taskId}/done`, { method: 'PUT' });
        if (response.ok) fetchTasks();
    } catch (error) {
        console.error('完了フラグ更新エラー:', error);
        showMessage(error.message);
    }
};

const unmarkTaskAsDone = async (taskId) => {
    if (!isLoggedIn()) {
        updateLocalTask(taskId, false);
        renderTasks(localTasks);
        return;
    }

    try {
        const response = await authFetch(`/tasks/${taskId}/done`, { method: 'DELETE' });
        if (response.ok) fetchTasks();
    } catch (error) {
        console.error('完了フラグ解除エラー:', error);
        showMessage(error.message);
    }
};

const deleteTask = async (taskId) => {
    if (!isLoggedIn()) {
        deleteLocalTask(taskId);
        renderTasks(localTasks);
        return;
    }

    try {
        const response = await authFetch(`/tasks/${taskId}`, { method: 'DELETE' });
        if (response.ok) fetchTasks();
    } catch (error) {
        console.error('タスク削除エラー:', error);
        showMessage(error.message);
    }
};

const renderTasks = (tasks) => {
    taskList.innerHTML = '';

    tasks.forEach((task) => {
        const li = document.createElement('li');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.done;
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                markTaskAsDone(task.id);
            } else {
                unmarkTaskAsDone(task.id);
            }
        });

        const title = document.createElement('span');
        title.textContent = task.title;
        if (task.done) {
            title.classList.add('done');
        }

        const deleteButton = document.createElement('button');
        deleteButton.className = 'button';
        deleteButton.type = 'button';
        deleteButton.textContent = '削除';
        deleteButton.addEventListener('click', () => deleteTask(task.id));

        li.appendChild(checkbox);
        li.appendChild(title);
        li.appendChild(deleteButton);
        taskList.appendChild(li);
    });
};

const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userEmail');
    clearMessage();
    updateUI();
};

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearMessage();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    try {
        await login(email, password);
    } catch (error) {
        showMessage(error.message);
    }
});

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearMessage();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    try {
        await register(email, password);
    } catch (error) {
        showMessage(error.message);
    }
});

showRegisterButton.addEventListener('click', () => {
    registerForm.classList.remove('hidden');
    showRegisterButton.closest('.switch-area').classList.add('hidden');
});

cancelRegisterButton.addEventListener('click', () => {
    registerForm.classList.add('hidden');
    showRegisterButton.closest('.switch-area').classList.remove('hidden');
    clearMessage();
});

logoutButton.addEventListener('click', logout);

taskForm.addEventListener('submit', (event) => {
    event.preventDefault();
    clearMessage();
    if (taskInput.value.trim()) {
        addTask(taskInput.value.trim());
        taskInput.value = '';
    }
});

updateUI();
