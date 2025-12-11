// 全局状态
let messageCount = 0;
let isRecording = false;
let recordingStartTime = 0;
let recordingInterval = null;
let currentUser = 'self'; // 'self' 或 'other'
let chatPartnerName = '快乐的烤红薯';
let selfAvatar = 'https://via.placeholder.com/40/95ec69/ffffff?text=我';
let partnerAvatar = 'https://via.placeholder.com/40/ff9800/ffffff?text=TA';

// DOM 元素
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const voiceBtn = document.getElementById('voiceBtn');
const emojiBtn = document.getElementById('emojiBtn');
const plusBtn = document.getElementById('plusBtn');
const overlay = document.getElementById('overlay');
const plusMenu = document.getElementById('plusMenu');
const emojiPanel = document.getElementById('emojiPanel');
const voicePanel = document.getElementById('voicePanel');
const voiceTime = document.getElementById('voiceTime');
const voiceCancel = document.getElementById('voiceCancel');
const voiceSend = document.getElementById('voiceSend');
const photoInput = document.getElementById('photoInput');
const avatarInput = document.getElementById('avatarInput');
const photoBtn = document.getElementById('photoBtn');
const changeAvatarBtn = document.getElementById('changeAvatarBtn');
const changeNameBtn = document.getElementById('changeNameBtn');
const headerAvatar = document.getElementById('headerAvatar');
const chatName = document.getElementById('chatName');

// 初始化
function init() {
    // 设置初始头像
    headerAvatar.src = partnerAvatar;
    chatName.textContent = chatPartnerName;
    
    // 添加初始消息
    addWelcomeMessages();
    
    // 绑定事件
    bindEvents();
}

// 添加欢迎消息
function addWelcomeMessages() {
    // 添加挥手表情
    setTimeout(() => {
        addMessage('👋', 'other', 'emoji');
    }, 500);
    
    // 添加文字消息
    setTimeout(() => {
        addMessage('我们已互相关注，可以开始聊天了', 'other', 'text', true);
    }, 1000);
    
    // 添加另一条消息
    setTimeout(() => {
        addMessage('头像，名字，语音，页面', 'other', 'text', true);
    }, 1500);
    
    // 添加撤回消息
    setTimeout(() => {
        addRecalledMessage();
    }, 2000);
}

// 绑定事件
function bindEvents() {
    // 发送消息 - 回车键
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendTextMessage();
        }
    });
    
    // 快捷表情反应
    document.querySelectorAll('.reaction-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const emoji = btn.getAttribute('data-emoji');
            addMessage(emoji, 'self', 'emoji');
        });
    });
    
    // 语音按钮
    voiceBtn.addEventListener('click', startRecording);
    voiceCancel.addEventListener('click', cancelRecording);
    voiceSend.addEventListener('click', sendVoiceMessage);
    
    // 表情按钮
    emojiBtn.addEventListener('click', toggleEmojiPanel);
    
    // 表情选择
    document.querySelectorAll('.emoji-item').forEach(item => {
        item.addEventListener('click', () => {
            const emoji = item.textContent;
            messageInput.value += emoji;
            messageInput.focus();
        });
    });
    
    // 加号按钮
    plusBtn.addEventListener('click', togglePlusMenu);
    
    // 照片按钮
    photoBtn.addEventListener('click', () => {
        photoInput.click();
    });
    
    photoInput.addEventListener('change', (e) => {
        handlePhotoUpload(e.target.files[0]);
    });
    
    // 修改头像
    changeAvatarBtn.addEventListener('click', () => {
        avatarInput.click();
    });
    
    avatarInput.addEventListener('change', (e) => {
        handleAvatarChange(e.target.files[0]);
    });
    
    // 修改名字
    changeNameBtn.addEventListener('click', () => {
        const newName = prompt('请输入新名字:', chatPartnerName);
        if (newName && newName.trim()) {
            chatPartnerName = newName.trim();
            chatName.textContent = chatPartnerName;
            closePlusMenu();
        }
    });
    
    // 遮罩层点击关闭
    overlay.addEventListener('click', () => {
        closePlusMenu();
        closeEmojiPanel();
    });
    
    // 返回按钮
    document.querySelector('.back-btn').addEventListener('click', () => {
        if (confirm('确定要退出聊天吗？')) {
            alert('这是一个演示页面，无法真正退出');
        }
    });
}

// 发送文字消息
function sendTextMessage() {
    const text = messageInput.value.trim();
    if (text) {
        addMessage(text, 'self', 'text', true);
        messageInput.value = '';
        
        // 模拟对方回复
        setTimeout(() => {
            simulateReply();
        }, 1000 + Math.random() * 2000);
    }
}

// 添加消息
function addMessage(content, sender, type = 'text', showNumber = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const avatar = document.createElement('img');
    avatar.className = 'message-avatar';
    avatar.src = sender === 'self' ? selfAvatar : partnerAvatar;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    if (type === 'emoji') {
        const emojiDiv = document.createElement('div');
        emojiDiv.className = 'message-emoji';
        emojiDiv.textContent = content;
        contentDiv.appendChild(emojiDiv);
    } else if (type === 'text') {
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = content;
        contentDiv.appendChild(bubble);
        
        if (showNumber) {
            messageCount++;
            const numberDiv = document.createElement('div');
            numberDiv.className = 'message-number';
            numberDiv.textContent = messageCount;
            bubble.appendChild(numberDiv);
        }
    } else if (type === 'image') {
        const img = document.createElement('img');
        img.className = 'message-image';
        img.src = content;
        img.onclick = () => {
            window.open(content, '_blank');
        };
        contentDiv.appendChild(img);
    } else if (type === 'voice') {
        const voiceDiv = document.createElement('div');
        voiceDiv.className = 'message-voice';
        voiceDiv.innerHTML = `
            <svg class="voice-icon" viewBox="0 0 24 24" fill="none">
                <path d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z" stroke="currentColor" stroke-width="2"/>
                <path d="M19 10V12C19 15.87 15.87 19 12 19C8.13 19 5 15.87 5 12V10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span class="voice-duration">${content}"</span>
        `;
        voiceDiv.onclick = () => {
            alert(`播放 ${content} 秒语音`);
        };
        contentDiv.appendChild(voiceDiv);
    }
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);
    
    // 滚动到底部
    scrollToBottom();
}

// 添加撤回消息
function addRecalledMessage() {
    const recalledDiv = document.createElement('div');
    recalledDiv.className = 'message-recalled';
    recalledDiv.textContent = `"${chatPartnerName}" 撤回了一条消息`;
    messagesContainer.appendChild(recalledDiv);
    scrollToBottom();
}

// 开始录音
function startRecording() {
    if (isRecording) return;
    
    isRecording = true;
    recordingStartTime = Date.now();
    voicePanel.classList.add('show');
    overlay.classList.add('show');
    
    // 更新录音时间
    recordingInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        voiceTime.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 100);
}

// 取消录音
function cancelRecording() {
    isRecording = false;
    clearInterval(recordingInterval);
    voicePanel.classList.remove('show');
    overlay.classList.remove('show');
    voiceTime.textContent = '00:00';
}

// 发送语音消息
function sendVoiceMessage() {
    if (!isRecording) return;
    
    const duration = Math.floor((Date.now() - recordingStartTime) / 1000);
    cancelRecording();
    
    if (duration < 1) {
        alert('录音时间太短');
        return;
    }
    
    addMessage(duration.toString(), 'self', 'voice');
    
    // 模拟对方回复
    setTimeout(() => {
        simulateReply();
    }, 1000 + Math.random() * 2000);
}

// 切换表情面板
function toggleEmojiPanel() {
    const isShow = emojiPanel.classList.contains('show');
    if (isShow) {
        closeEmojiPanel();
    } else {
        closePlusMenu();
        emojiPanel.classList.add('show');
        overlay.classList.add('show');
    }
}

// 关闭表情面板
function closeEmojiPanel() {
    emojiPanel.classList.remove('show');
    overlay.classList.remove('show');
}

// 切换加号菜单
function togglePlusMenu() {
    const isShow = plusMenu.classList.contains('show');
    if (isShow) {
        closePlusMenu();
    } else {
        closeEmojiPanel();
        plusMenu.classList.add('show');
        overlay.classList.add('show');
    }
}

// 关闭加号菜单
function closePlusMenu() {
    plusMenu.classList.remove('show');
    overlay.classList.remove('show');
}

// 处理照片上传
function handlePhotoUpload(file) {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        addMessage(e.target.result, 'self', 'image');
        closePlusMenu();
        
        // 模拟对方回复
        setTimeout(() => {
            simulateReply();
        }, 1000 + Math.random() * 2000);
    };
    reader.readAsDataURL(file);
}

// 处理头像修改
function handleAvatarChange(file) {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        partnerAvatar = e.target.result;
        headerAvatar.src = partnerAvatar;
        
        // 更新所有对方的头像
        document.querySelectorAll('.message.other .message-avatar').forEach(avatar => {
            avatar.src = partnerAvatar;
        });
        
        closePlusMenu();
        alert('头像修改成功！');
    };
    reader.readAsDataURL(file);
}

// 模拟对方回复
function simulateReply() {
    const replies = [
        { type: 'text', content: '收到！' },
        { type: 'text', content: '好的' },
        { type: 'text', content: '哈哈哈' },
        { type: 'text', content: '👌' },
        { type: 'emoji', content: '👍' },
        { type: 'emoji', content: '😊' },
        { type: 'text', content: '明白了' },
        { type: 'text', content: '没问题' },
    ];
    
    // 显示输入中...
    showTypingIndicator();
    
    setTimeout(() => {
        hideTypingIndicator();
        const reply = replies[Math.floor(Math.random() * replies.length)];
        addMessage(reply.content, 'other', reply.type, reply.type === 'text');
    }, 1000 + Math.random() * 2000);
}

// 显示输入中指示器
function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'message other';
    indicator.id = 'typing-indicator';
    indicator.innerHTML = `
        <img class="message-avatar" src="${partnerAvatar}" alt="头像">
        <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    messagesContainer.appendChild(indicator);
    scrollToBottom();
}

// 隐藏输入中指示器
function hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

// 滚动到底部
function scrollToBottom() {
    setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);

// 添加键盘快捷键
document.addEventListener('keydown', (e) => {
    // ESC 键关闭所有弹出层
    if (e.key === 'Escape') {
        closePlusMenu();
        closeEmojiPanel();
        if (isRecording) {
            cancelRecording();
        }
    }
});

// 防止页面被拖拽
document.addEventListener('dragstart', (e) => {
    e.preventDefault();
});

// 添加长按消息撤回功能
let longPressTimer = null;
messagesContainer.addEventListener('mousedown', (e) => {
    const messageBubble = e.target.closest('.message-bubble');
    if (messageBubble) {
        longPressTimer = setTimeout(() => {
            if (confirm('确定要撤回这条消息吗？')) {
                const message = messageBubble.closest('.message');
                if (message.classList.contains('self')) {
                    message.remove();
                    addRecalledMessage();
                } else {
                    alert('无法撤回对方的消息');
                }
            }
        }, 1000);
    }
});

messagesContainer.addEventListener('mouseup', () => {
    clearTimeout(longPressTimer);
});

messagesContainer.addEventListener('mouseleave', () => {
    clearTimeout(longPressTimer);
});

// 移动端触摸支持
messagesContainer.addEventListener('touchstart', (e) => {
    const messageBubble = e.target.closest('.message-bubble');
    if (messageBubble) {
        longPressTimer = setTimeout(() => {
            if (confirm('确定要撤回这条消息吗？')) {
                const message = messageBubble.closest('.message');
                if (message.classList.contains('self')) {
                    message.remove();
                    const recalledDiv = document.createElement('div');
                    recalledDiv.className = 'message-recalled';
                    recalledDiv.textContent = '你撤回了一条消息';
                    messagesContainer.appendChild(recalledDiv);
                    scrollToBottom();
                } else {
                    alert('无法撤回对方的消息');
                }
            }
        }, 1000);
    }
});

messagesContainer.addEventListener('touchend', () => {
    clearTimeout(longPressTimer);
});

messagesContainer.addEventListener('touchcancel', () => {
    clearTimeout(longPressTimer);
});

// 添加时间戳更新
function updateTime() {
    const now = new Date();
    const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const timeElements = document.querySelectorAll('.message-time');
    if (timeElements.length > 0) {
        timeElements[timeElements.length - 1].textContent = timeString;
    }
}

// 每分钟更新一次时间
setInterval(updateTime, 60000);

// 添加网格按钮功能（可选）
document.querySelector('.grid-btn').addEventListener('click', () => {
    alert('网格功能：可以添加更多交互选项');
});

// 添加视频通话按钮功能
document.querySelector('.video-btn').addEventListener('click', () => {
    alert('视频通话功能：这是演示页面，实际需要集成视频通话SDK');
});

// 添加更多按钮功能
document.querySelector('.more-btn').addEventListener('click', () => {
    alert('更多功能：可以添加聊天设置、清空记录等选项');
});
