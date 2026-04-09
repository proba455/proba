// Состояние приложения
let currentUser = null;
const API_URL = '/api';

// Проверка авторизации при загрузке
window.onload = () => {
    const token = localStorage.getItem('token');
    if (token) {
        currentUser = {
            token: token,
            userId: localStorage.getItem('userId'),
            email: localStorage.getItem('userEmail')
        };
        showMainSection();
        loadPosts();
    } else {
        showAuthSection();
    }
};

// Показать форму авторизации
function showAuthSection() {
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('main-section').style.display = 'none';
}

// Показать главную страницу
function showMainSection() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('main-section').style.display = 'block';
    document.getElementById('user-email').textContent = currentUser.email;
}

// Авторизация
async function auth(action) {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const response = await fetch(`${API_URL}/auth.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
        currentUser = {
            token: data.token,
            userId: data.userId,
            email: data.email
        };
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('userEmail', data.email);
        
        showMainSection();
        loadPosts();
    } else {
        document.getElementById('auth-error').textContent = data.error;
    }
}

// Выход
function logout() {
    localStorage.clear();
    currentUser = null;
    showAuthSection();
}

// Загрузка постов
async function loadPosts() {
    const response = await fetch(`${API_URL}/posts.php`);
    const data = await response.json();
    
    const feed = document.getElementById('posts-feed');
    feed.innerHTML = '';
    
    if (data.posts && data.posts.length > 0) {
        data.posts.forEach(post => {
            feed.appendChild(createPostElement(post));
        });
    } else {
        feed.innerHTML = '<p>Лента пуста. Создайте первый пост!</p>';
    }
}

// Создание элемента поста
function createPostElement(post) {
    const div = document.createElement('div');
    div.className = 'post';
    
    div.innerHTML = `
        <p>${escapeHtml(post.text)}</p>
        ${post.media_type !== 'none' ? `
            <div class="post-media">
                ${post.media_type === 'photo' 
                    ? `<img src="${API_URL}/stream.php?post_id=${post.id}" loading="lazy">`
                    : `<video controls><source src="${API_URL}/stream.php?post_id=${post.id}" type="video/mp4"></video>`
                }
            </div>
        ` : ''}
        <div class="post-actions">
            <button onclick="likePost('${post.id}')">❤️ ${post.likes_count}</button>
            <button onclick="dislikePost('${post.id}')">👎 ${post.dislikes_count}</button>
            ${post.author_id !== currentUser.userId 
                ? `<button onclick="subscribe('${post.author_id}')">➕ Подписаться</button>` 
                : ''
            }
        </div>
        <small>${new Date(post.created_at).toLocaleString('ru')}</small>
    `;
    
    return div;
}

// Экранирование HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Создание поста
async function createPost() {
    const text = document.getElementById('post-text').value;
    const fileInput = document.getElementById('media-file');
    
    if (!text) return;
    
    let mediaBase64 = null;
    if (fileInput.files.length > 0) {
        mediaBase64 = await fileToBase64(fileInput.files[0]);
    }
    
    const response = await fetch(`${API_URL}/posts.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: currentUser.userId,
            text: text,
            media: mediaBase64
        })
    });
    
    const data = await response.json();
    if (data.success) {
        document.getElementById('post-text').value = '';
        fileInput.value = '';
        loadPosts();
    }
}

// Конвертация файла в Base64
function fileToBase64(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
    });
}

// Лайк поста
async function likePost(postId) {
    await fetch(`${API_URL}/like.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, userId: currentUser.userId })
    });
    loadPosts();
}

// Дизлайк поста
async function dislikePost(postId) {
    await fetch(`${API_URL}/dislike.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, userId: currentUser.userId })
    });
    loadPosts();
}

// Подписка
async function subscribe(userId) {
    const response = await fetch(`${API_URL}/subscribe.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            subscriberId: currentUser.userId, 
            targetUserId: userId 
        })
    });
    
    const data = await response.json();
    alert(data.message || 'Подписка оформлена!');
}
