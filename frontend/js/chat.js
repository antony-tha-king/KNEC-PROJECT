// Chat functionality
class ChatManager {
	constructor() {
		this.currentUser = null;
		this.currentChat = null;
		this.init();
	}

	init() {
		// Initialize event listeners
		this.initializeEventListeners();
		this.loadUserData();
	}

	initializeEventListeners() {
		// Search functionality
		const searchInput = document.querySelector('.search-input');
		if (searchInput) {
			searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
		}

		// Recipient search
		const recipientInput = document.querySelector('.recipient-input input');
		const findButton = document.querySelector('.recipient-input button');
		if (recipientInput && findButton) {
			findButton.addEventListener('click', () => this.findRecipient(recipientInput.value));
		}

		// Message input
		const messageInput = document.querySelector('.chat-input input');
		const sendButton = document.querySelector('.chat-input button');
		if (messageInput && sendButton) {
			sendButton.addEventListener('click', () => this.sendMessage(messageInput.value));
			messageInput.addEventListener('keypress', (e) => {
				if (e.key === 'Enter') {
					this.sendMessage(messageInput.value);
				}
			});
		}
	}

	async loadUserData() {
		try {
			const response = await fetch('/api/user/current');
			const userData = await response.json();
			this.currentUser = userData;
			this.updateUserInterface();
		} catch (error) {
			console.error('Error loading user data:', error);
		}
	}

	async findRecipient(idNumber) {
		try {
			const response = await fetch(`/api/users/find/${idNumber}`);
			const user = await response.json();
			if (user) {
				this.startPrivateChat(user);
			} else {
				this.showNotification('User not found', 'error');
			}
		} catch (error) {
			console.error('Error finding recipient:', error);
			this.showNotification('Error finding user', 'error');
		}
	}

	async handleSearch(query) {
		const chatList = document.querySelector('.chat-list');
		const items = chatList.querySelectorAll('.chat-item');
		
		items.forEach(item => {
			const title = item.querySelector('h6').textContent.toLowerCase();
			if (title.includes(query.toLowerCase())) {
				item.style.display = 'block';
			} else {
				item.style.display = 'none';
			}
		});
	}

	async sendMessage(content) {
		if (!content.trim() || !this.currentChat) return;

		try {
			const messageData = {
				content,
				chatId: this.currentChat.id,
				senderId: this.currentUser.id,
				timestamp: new Date().toISOString()
			};

			const response = await fetch('/api/messages', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(messageData)
			});

			if (response.ok) {
				this.addMessageToChat(messageData);
				document.querySelector('.chat-input input').value = '';
			}
		} catch (error) {
			console.error('Error sending message:', error);
			this.showNotification('Error sending message', 'error');
		}
	}

	addMessageToChat(message) {
		const chatMessages = document.querySelector('.chat-messages');
		const messageElement = document.createElement('div');
		messageElement.className = `message ${message.senderId === this.currentUser.id ? 'message-sent' : 'message-received'}`;
		
		const content = document.createElement('p');
		content.className = 'mb-0';
		content.textContent = message.content;
		
		const timestamp = document.createElement('small');
		timestamp.className = message.senderId === this.currentUser.id ? 'text-white-50' : 'text-muted';
		timestamp.textContent = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
		
		messageElement.appendChild(content);
		messageElement.appendChild(timestamp);
		chatMessages.appendChild(messageElement);
		chatMessages.scrollTop = chatMessages.scrollHeight;
	}

	showNotification(message, type = 'info') {
		// Implement notification system (can use bootstrap toasts or custom notifications)
		alert(message); // Temporary basic implementation
	}

	startPrivateChat(user) {
		// Update chat header
		const chatHeader = document.querySelector('.chat-header');
		chatHeader.innerHTML = `
			<div class="d-flex align-items-center">
				<div class="flex-shrink-0">
					<i class="fas fa-user fa-2x text-primary"></i>
				</div>
				<div class="flex-grow-1 ms-3">
					<h5 class="mb-0">${user.name}</h5>
					<small class="text-muted">${user.role} - ${user.idNumber}</small>
				</div>
			</div>
		`;

		// Clear messages
		document.querySelector('.chat-messages').innerHTML = '';
		
		// Set current chat
		this.currentChat = {
			id: `private_${user.id}`,
			type: 'private',
			participant: user
		};

		// Load chat history
		this.loadChatHistory();
	}

	async loadChatHistory() {
		try {
			const response = await fetch(`/api/messages/${this.currentChat.id}`);
			const messages = await response.json();
			messages.forEach(message => this.addMessageToChat(message));
		} catch (error) {
			console.error('Error loading chat history:', error);
		}
	}
}

// Initialize chat manager when document is ready
document.addEventListener('DOMContentLoaded', () => {
	window.chatManager = new ChatManager();
});