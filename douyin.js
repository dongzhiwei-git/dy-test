// 全局状态
let isRecording = false;
let recordingStartTime = 0;
let recordingInterval = null;
let contactName = '快乐的烤红薯';
let contactAvatar = 'https://via.placeholder.com/40/FF6B9D/ffffff?text=TA';
let selfAvatar = 'https://via.placeholder.com/40/00D9FF/ffffff?text=我';

// DOM 元素
const messagesArea = document.getElementById('messagesArea');
const messageInput = document.getElementById('messageInput');
const emojiBtn = document.getElementById('emojiBtn');
const plusBtn = document.getElementById('plusBtn');
const voiceBtn = document.getElementById('voiceBtn');
const overlay = document.getElementById('overlay');
const emojiPanel = document.getElementById('emojiPanel');
const plusPanel = document.getElementById('plusPanel');
const voicePanel = document.getElementById('voicePanel');
const recordingTime = document.getElementById('recordingTime');
const cancelRecording = document.getElementById('cancelRecording');
const sendRecording = document.getElementById('sendRecording');
const photoInput = document.getElementById('photoInput');
const avatarInput = document.getElementById('avatarInput');
const contactNameEl = document.getElementById('contactName');
const contactAvatarEl = document.getElementById('contactAvatar');

// 初始化
function init() {
    setupEventListeners();
    updateTime();
}

// 设置事件监听
function setupEventListeners() {
    // 发送消息
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // 快捷回复
    document.querySelectorAll('.quick-reply-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const emoji = btn.getAttribute('data-emoji');
            addMessage(emoji, 'sent', 'emoji');
            simulateReply();
        });
    });

    // 表情按钮
    emojiBtn.addEventListener('click', toggleEmojiPanel);

    // 表情选择
    document.querySelectorAll('.emoji-btn-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const emoji = btn.textContent;
            messageInput.value += emoji;
            messageInput.focus();
        });
    });

    // 加号按钮
    plusBtn.addEventListener('click', togglePlusPanel);

    // 语音按钮
    voiceBtn.addEventListener('click', startRecording);
    cancelRecording.addEventListener('click', stopRecording);
    sendRecording.addEventListener('click', sendVoice);

    // 照片上传
    document.getElementById('photoUploadBtn').addEventListener('click', () => {
        photoInput.click();
    });

    photoInput.addEventListener('change', (e) => {
        handlePhotoUpload(e.target.files[0]);
    });

    // 修改头像
    document.getElementById('changeAvatarBtn').addEventListener('click', () => {
        avatarInput.click();
    });

    avatarInput.addEventListener('change', (e) => {
        handleAvatarChange(e.target.files[0]);
    });

    // 修改名字
    document.getElementById('changeNameBtn').addEventListener('click', () => {
        const newName = prompt('请输入新名字:', contactName);
        if (newName && newName.trim()) {
            contactName = newName.trim();
            contactNameEl.textContent = contactName;
            closePlusPanel();
        }
    });

    // 遮罩层
    overlay.addEventListener('click', () => {
        closeAllPanels();
    });

    // 返回按钮
    document.querySelector('.back-btn').addEventListener('click', () => {
        if (confirm('确定要退出聊天吗？')) {
            alert('这是一个演示项目');
        }
    });

    // ESC 键关闭面板
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllPanels();
        }
    });
}

// 发送消息
function sendMessage() {
    const text = messageInput.value.trim();
    if (text) {
        addMessage(text, 'sent', 'text');
        messageInput.value = '';
        simulateReply();
    }
}

// 添加消息
function addMessage(content, type, messageType = 'text') {
    const wrapper = document.createElement('div');
    wrapper.className = `message-wrapper message-${type}`;

    const avatar = document.createElement('img');
    avatar.className = 'msg-avatar';
    avatar.src = type === 'sent' ? selfAvatar : contactAvatar;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    if (messageType === 'emoji') {
        const emojiDiv = document.createElement('div');
        emojiDiv.className = 'message-emoji-large';
        emojiDiv.textContent = content;
        contentDiv.appendChild(emojiDiv);
    } else if (messageType === 'text') {
        const bubble = document.createElement('div');
        bubble.className = `message-bubble ${type === 'sent' ? 'message-sent-bubble' : ''}`;
        bubble.textContent = content;
        contentDiv.appendChild(bubble);
    } else if (messageType === 'image') {
        const img = document.createElement('img');
        img.className = 'message-image';
        img.src = content;
        img.onclick = () => window.open(content, '_blank');
        contentDiv.appendChild(img);
    } else if (messageType === 'voice') {
        const voiceDiv = document.createElement('div');
        voiceDiv.className = 'voice-message';
        voiceDiv.innerHTML = `
            <svg class="voice-icon-play" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6 4L16 10L6 16V4Z"/>
            </svg>
            <span class="voice-duration">${content}"</span>
        `;
        voiceDiv.onclick = () => alert(`播放 ${content} 秒语音`);
        contentDiv.appendChild(voiceDiv);
    }

    if (type === 'sent') {
        wrapper.appendChild(contentDiv);
        wrapper.appendChild(avatar);
    } else {
        wrapper.appendChild(avatar);
        wrapper.appendChild(contentDiv);
    }

    messagesArea.appendChild(wrapper);
    scrollToBottom();
}

// 切换表情面板
function toggleEmojiPanel() {
    if (emojiPanel.classList.contains('show')) {
        closeEmojiPanel();
    } else {
        closePlusPanel();
        emojiPanel.classList.add('show');
        overlay.classList.add('show');
    }
}

// 关闭表情面板
function closeEmojiPanel() {
    emojiPanel.classList.remove('show');
    overlay.classList.remove('show');
}

// 切换加号面板
function togglePlusPanel() {
    if (plusPanel.classList.contains('show')) {
        closePlusPanel();
    } else {
        closeEmojiPanel();
        plusPanel.classList.add('show');
        overlay.classList.add('show');
    }
}

// 关闭加号面板
function closePlusPanel() {
    plusPanel.classList.remove('show');
    overlay.classList.remove('show');
}

// 关闭所有面板
function closeAllPanels() {
    closeEmojiPanel();
    closePlusPanel();
    if (isRecording) {
        stopRecording();
    }
}

// 开始录音
function startRecording() {
    if (isRecording) return;

    isRecording = true;
    recordingStartTime = Date.now();
    voicePanel.classList.add('show');
    overlay.classList.add('show');

    recordingInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        recordingTime.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 100);
}

// 停止录音
function stopRecording() {
    isRecording = false;
    clearInterval(recordingInterval);
    voicePanel.classList.remove('show');
    overlay.classList.remove('show');
    recordingTime.textContent = '00:00';
}

// 发送语音
function sendVoice() {
    if (!isRecording) return;

    const duration = Math.floor((Date.now() - recordingStartTime) / 1000);
    stopRecording();

    if (duration < 1) {
        alert('录音时间太短');
        return;
    }

    addMessage(duration.toString(), 'sent', 'voice');
    simulateReply();
}

// 处理照片上传
function handlePhotoUpload(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        addMessage(e.target.result, 'sent', 'image');
        closePlusPanel();
        simulateReply();
    };
    reader.readAsDataURL(file);
}

// 处理头像修改
function handleAvatarChange(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        contactAvatar = e.target.result;
        contactAvatarEl.src = contactAvatar;

        // 更新所有对方消息的头像
        document.querySelectorAll('.message-received .msg-avatar').forEach(avatar => {
            avatar.src = contactAvatar;
        });

        closePlusPanel();
        alert('头像修改成功！');
    };
    reader.readAsDataURL(file);
}

// 模拟对方回复
function simulateReply() {
    const replies = [
        { type: 'text', content: '收到！' },
        { type: 'text', content: '好的呀' },
        { type: 'text', content: '哈哈哈' },
        { type: 'text', content: '明白了' },
        { type: 'emoji', content: '👍' },
        { type: 'emoji', content: '😊' },
        { type: 'emoji', content: '🤗' },
        { type: 'text', content: '没问题' },
    ];

    showTyping();

    setTimeout(() => {
        hideTyping();
        const reply = replies[Math.floor(Math.random() * replies.length)];
        addMessage(reply.content, 'received', reply.type);
    }, 1000 + Math.random() * 2000);
}

// 显示输入中
function showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message-wrapper message-received';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
        <img src="${contactAvatar}" class="msg-avatar">
        <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    messagesArea.appendChild(typingDiv);
    scrollToBottom();
}

// 隐藏输入中
function hideTyping() {
    const typing = document.getElementById('typing-indicator');
    if (typing) {
        typing.remove();
    }
}

// 滚动到底部
function scrollToBottom() {
    setTimeout(() => {
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }, 100);
}

// 更新时间
function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.querySelector('.status-left .time').textContent = `${hours}:${minutes}`;
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    init();
    // 每分钟更新时间
    setInterval(updateTime, 60000);
});

// 长按消息撤回
let longPressTimer = null;

messagesArea.addEventListener('mousedown', handleLongPressStart);
messagesArea.addEventListener('mouseup', handleLongPressEnd);
messagesArea.addEventListener('mouseleave', handleLongPressEnd);
messagesArea.addEventListener('touchstart', handleLongPressStart);
messagesArea.addEventListener('touchend', handleLongPressEnd);
messagesArea.addEventListener('touchcancel', handleLongPressEnd);

function handleLongPressStart(e) {
    const messageBubble = e.target.closest('.message-bubble');
    if (messageBubble) {
        longPressTimer = setTimeout(() => {
            const messageWrapper = messageBubble.closest('.message-wrapper');
            if (messageWrapper && messageWrapper.classList.contains('message-sent')) {
                if (confirm('确定要撤回这条消息吗？')) {
                    messageWrapper.remove();
                    addSystemMessage('你撤回了一条消息');
                }
            } else {
                alert('无法撤回对方的消息');
            }
        }, 1000);
    }
}

function handleLongPressEnd() {
    clearTimeout(longPressTimer);
}

// 添加系统消息
function addSystemMessage(text) {
    const systemDiv = document.createElement('div');
    systemDiv.className = 'system-tip';
    systemDiv.textContent = text;
    messagesArea.appendChild(systemDiv);
    scrollToBottom();
}

// 防止拖拽
document.addEventListener('dragstart', (e) => {
    e.preventDefault();
});
