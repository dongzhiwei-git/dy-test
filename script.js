// 全局变量
let currentUser = 'right'; // 当前用户位置（left/right）
let voiceRecording = false;
let voiceStartTime = 0;
let voiceTimer = null;
let mediaRecorder = null;
let audioChunks = [];

// 默认头像（使用渐变色作为默认头像）
const defaultAvatars = {
    left: generateDefaultAvatar('#4A90E2'),
    right: generateDefaultAvatar('#95EC69')
};

// 生成默认头像
function generateDefaultAvatar(color) {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    
    // 创建渐变
    const gradient = ctx.createLinearGradient(0, 0, 100, 100);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, adjustColor(color, -30));
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 100, 100);
    
    return canvas.toDataURL();
}

// 调整颜色亮度
function adjustColor(color, amount) {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeAvatars();
    initializeEmojiPicker();
    initializeEventListeners();
    scrollToBottom();
});

// 初始化头像
function initializeAvatars() {
    document.getElementById('chatAvatar').src = defaultAvatars.left;
    document.querySelectorAll('.message-avatar').forEach(avatar => {
        const user = avatar.getAttribute('data-user');
        avatar.src = defaultAvatars[user];
    });
}

// 初始化表情选择器
function initializeEmojiPicker() {
    const emojis = [
        '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆',
        '😉', '😊', '😋', '😎', '😍', '😘', '🥰', '😗',
        '😙', '😚', '🙂', '🤗', '🤩', '🤔', '🤨', '😐',
        '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐',
        '😯', '😪', '😫', '😴', '😌', '😛', '😜', '😝',
        '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑', '😲',
        '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙',
        '👈', '👉', '👆', '👇', '☝️', '👋', '🤚', '🖐',
        '✋', '🖖', '👏', '🙌', '👐', '🤲', '🤝', '🙏',
        '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '💔',
        '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝',
        '🌹', '🌺', '🌻', '🌷', '🌸', '💐', '🏵️', '🌼',
    ];
    
    const emojiGrid = document.querySelector('.emoji-grid');
    emojis.forEach(emoji => {
        const btn = document.createElement('button');
        btn.textContent = emoji;
        btn.onclick = () => insertEmoji(emoji);
        emojiGrid.appendChild(btn);
    });
}

// 初始化事件监听器
function initializeEventListeners() {
    // 发送消息
    const messageInput = document.getElementById('messageInput');
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // 表情快捷按钮
    document.querySelectorAll('.emoji-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const emoji = this.getAttribute('data-emoji');
            sendMessage(emoji + ' ' + this.textContent.replace(emoji, '').trim());
        });
    });

    // 更多功能按钮
    document.getElementById('plusBtn').addEventListener('click', toggleMorePanel);

    // 语音按钮
    document.getElementById('voiceBtn').addEventListener('click', toggleVoiceRecording);
    document.getElementById('voiceCancelBtn').addEventListener('click', cancelVoiceRecording);
    document.getElementById('voiceSendBtn').addEventListener('click', sendVoiceMessage);

    // 表情选择器按钮
    document.querySelector('.emoji-picker-btn').addEventListener('click', toggleEmojiPanel);

    // 照片按钮
    document.getElementById('photoBtn').addEventListener('click', () => {
        document.getElementById('imageInput').click();
    });

    document.getElementById('imageInput').addEventListener('change', handleImageUpload);

    // 头像按钮
    document.getElementById('avatarBtn').addEventListener('click', () => {
        document.getElementById('avatarInput').click();
    });

    document.getElementById('avatarInput').addEventListener('change', handleAvatarChange);

    // 头像点击切换用户
    document.querySelectorAll('.message-avatar').forEach(avatar => {
        avatar.addEventListener('click', function() {
            const user = this.getAttribute('data-user');
            currentUser = user === 'left' ? 'right' : 'left';
            showNotification(`已切换到${currentUser === 'right' ? '右侧' : '左侧'}用户`);
        });
    });

    // 顶部头像点击
    document.getElementById('chatAvatar').addEventListener('click', function() {
        document.getElementById('avatarInput').setAttribute('data-target', 'chat');
        document.getElementById('avatarInput').click();
    });
}

// 发送消息
function sendMessage(text) {
    const input = document.getElementById('messageInput');
    const message = text || input.value.trim();
    
    if (!message) return;
    
    const chatContainer = document.getElementById('chatContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${currentUser}`;
    
    const avatar = document.createElement('img');
    avatar.className = 'message-avatar';
    avatar.src = defaultAvatars[currentUser];
    avatar.setAttribute('data-user', currentUser);
    avatar.onclick = function() {
        currentUser = currentUser === 'left' ? 'right' : 'left';
        showNotification(`已切换到${currentUser === 'right' ? '右侧' : '左侧'}用户`);
    };
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = message;
    
    content.appendChild(bubble);
    
    if (currentUser === 'right') {
        messageDiv.appendChild(content);
        messageDiv.appendChild(avatar);
    } else {
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
    }
    
    chatContainer.appendChild(messageDiv);
    
    input.value = '';
    scrollToBottom();
    
    // 添加时间戳（每10条消息）
    if (chatContainer.children.length % 10 === 0) {
        addTimeStamp();
    }
}

// 插入表情
function insertEmoji(emoji) {
    const input = document.getElementById('messageInput');
    input.value += emoji;
    input.focus();
}

// 切换更多面板
function toggleMorePanel() {
    const morePanel = document.getElementById('morePanel');
    const emojiPanel = document.getElementById('emojiPanel');
    
    emojiPanel.classList.remove('active');
    morePanel.classList.toggle('active');
}

// 切换表情面板
function toggleEmojiPanel() {
    const emojiPanel = document.getElementById('emojiPanel');
    const morePanel = document.getElementById('morePanel');
    
    morePanel.classList.remove('active');
    emojiPanel.classList.toggle('active');
}

// 开始/停止语音录制
async function toggleVoiceRecording() {
    if (!voiceRecording) {
        startVoiceRecording();
    } else {
        stopVoiceRecording();
    }
}

// 开始录音
async function startVoiceRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };
        
        mediaRecorder.start();
        voiceRecording = true;
        voiceStartTime = Date.now();
        
        document.getElementById('voicePanel').classList.add('active');
        
        voiceTimer = setInterval(() => {
            const duration = Math.floor((Date.now() - voiceStartTime) / 1000);
            const minutes = Math.floor(duration / 60).toString().padStart(2, '0');
            const seconds = (duration % 60).toString().padStart(2, '0');
            document.querySelector('#voicePanel .voice-duration').textContent = `${minutes}:${seconds}`;
        }, 1000);
        
    } catch (error) {
        console.error('无法访问麦克风:', error);
        alert('无法访问麦克风，请检查权限设置');
    }
}

// 停止录音
function stopVoiceRecording() {
    if (mediaRecorder && voiceRecording) {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        voiceRecording = false;
        clearInterval(voiceTimer);
    }
}

// 取消语音录制
function cancelVoiceRecording() {
    stopVoiceRecording();
    document.getElementById('voicePanel').classList.remove('active');
    audioChunks = [];
}

// 发送语音消息
function sendVoiceMessage() {
    stopVoiceRecording();
    
    const duration = Math.floor((Date.now() - voiceStartTime) / 1000);
    
    const chatContainer = document.getElementById('chatContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${currentUser}`;
    
    const avatar = document.createElement('img');
    avatar.className = 'message-avatar';
    avatar.src = defaultAvatars[currentUser];
    avatar.setAttribute('data-user', currentUser);
    avatar.onclick = function() {
        currentUser = currentUser === 'left' ? 'right' : 'left';
        showNotification(`已切换到${currentUser === 'right' ? '右侧' : '左侧'}用户`);
    };
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    
    const voiceMsg = document.createElement('div');
    voiceMsg.className = 'voice-message';
    voiceMsg.innerHTML = `
        <span class="voice-icon">🎤</span>
        <span class="voice-duration">${duration}"</span>
    `;
    
    bubble.appendChild(voiceMsg);
    content.appendChild(bubble);
    
    if (currentUser === 'right') {
        messageDiv.appendChild(content);
        messageDiv.appendChild(avatar);
    } else {
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
    }
    
    chatContainer.appendChild(messageDiv);
    
    document.getElementById('voicePanel').classList.remove('active');
    scrollToBottom();
}

// 处理图片上传
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const chatContainer = document.getElementById('chatContainer');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${currentUser}`;
        
        const avatar = document.createElement('img');
        avatar.className = 'message-avatar';
        avatar.src = defaultAvatars[currentUser];
        avatar.setAttribute('data-user', currentUser);
        avatar.onclick = function() {
            currentUser = currentUser === 'left' ? 'right' : 'left';
            showNotification(`已切换到${currentUser === 'right' ? '右侧' : '左侧'}用户`);
        };
        
        const content = document.createElement('div');
        content.className = 'message-content';
        
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        
        const img = document.createElement('img');
        img.src = event.target.result;
        img.className = 'image-message';
        img.onclick = () => {
            window.open(event.target.result, '_blank');
        };
        
        bubble.appendChild(img);
        content.appendChild(bubble);
        
        if (currentUser === 'right') {
            messageDiv.appendChild(content);
            messageDiv.appendChild(avatar);
        } else {
            messageDiv.appendChild(avatar);
            messageDiv.appendChild(content);
        }
        
        chatContainer.appendChild(messageDiv);
        scrollToBottom();
        
        document.getElementById('morePanel').classList.remove('active');
    };
    
    reader.readAsDataURL(file);
    e.target.value = '';
}

// 处理头像更换
function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const target = e.target.getAttribute('data-target');
        
        if (target === 'chat') {
            // 更换聊天对象头像
            document.getElementById('chatAvatar').src = event.target.result;
            defaultAvatars.left = event.target.result;
            document.querySelectorAll('.message-avatar[data-user="left"]').forEach(avatar => {
                avatar.src = event.target.result;
            });
            showNotification('聊天对象头像已更换');
        } else {
            // 更换当前用户头像
            defaultAvatars[currentUser] = event.target.result;
            document.querySelectorAll(`.message-avatar[data-user="${currentUser}"]`).forEach(avatar => {
                avatar.src = event.target.result;
            });
            showNotification('你的头像已更换');
        }
        
        document.getElementById('morePanel').classList.remove('active');
        e.target.removeAttribute('data-target');
    };
    
    reader.readAsDataURL(file);
    e.target.value = '';
}

// 添加时间戳
function addTimeStamp() {
    const chatContainer = document.getElementById('chatContainer');
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'time-divider';
    timeDiv.textContent = time;
    
    chatContainer.appendChild(timeDiv);
}

// 滚动到底部
function scrollToBottom() {
    const chatContainer = document.getElementById('chatContainer');
    setTimeout(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 100);
}

// 显示通知
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'system-text';
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '80px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.zIndex = '1000';
    notification.style.padding = '10px 20px';
    notification.style.background = 'rgba(0, 0, 0, 0.7)';
    notification.style.color = '#fff';
    notification.style.borderRadius = '20px';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

// 点击外部关闭面板
document.addEventListener('click', function(e) {
    const morePanel = document.getElementById('morePanel');
    const emojiPanel = document.getElementById('emojiPanel');
    const plusBtn = document.getElementById('plusBtn');
    const emojiBtn = document.querySelector('.emoji-picker-btn');
    
    if (!morePanel.contains(e.target) && e.target !== plusBtn && !plusBtn.contains(e.target)) {
        morePanel.classList.remove('active');
    }
    
    if (!emojiPanel.contains(e.target) && e.target !== emojiBtn && !emojiBtn.contains(e.target)) {
        emojiPanel.classList.remove('active');
    }
});
