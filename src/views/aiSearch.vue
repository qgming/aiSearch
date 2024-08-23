<template>
  <div class="chatContainer">
    <main class="chatBox" ref="chatBox">
      <!-- 遍历所有消息 -->
      <div v-for="message in messages" :key="message.id" class="messageWrapper">
        <!-- 根据消息角色设置不同的样式 -->
        <div class="message" :class="{
          'userMessage': message.role === 'You',
          'aiMessage': message.role !== 'You'
        }">
          <!-- 显示消息内容 -->
          <div class="messageContent" v-html="parsedContent(message.content)"></div>
        </div>
      </div>
      <div v-if="waiting" class="typingIndicator">
        <span></span><span></span><span></span>
      </div>
    </main>
    <footer class="inputArea">
      <button class="iconButton refreshBtn" @click="refreshPage" title="刷新对话">
        <i class="fas fa-sync-alt"></i>
      </button>
      <input class="textInput" type="text" v-model="inputText" @keyup.enter="sendMessage" placeholder="输入您的问题..."
        :disabled="waiting">
      <button class="iconButton sendButton" @click="sendMessage" :disabled="!inputText.trim() || waiting">
        <i class="fas fa-paper-plane"></i>
      </button>
    </footer>
  </div>
</template>

<script>
import axios from 'axios';
import { marked } from 'marked';
import hljs from 'highlight.js';

export default {
  data() {
    return {
      messages: [],
      chatMessages: [],
      sendChat: [],
      inputText: '',
      waiting: false,
      APIKEY: localStorage.getItem("apiKey"),
      APIWEB: localStorage.getItem("apiWebsite"),
      MODEL: localStorage.getItem('apiModel'),
      PROMPT: '../prompt/search.txt',
    };
  },
  methods: {
    async sendMessageToAi() {
      try {
        this.waiting = true;
        const response = await this.fetchAiResponse();
        await this.handleStreamResponse(response);
      } catch (error) {
        console.error('发送消息失败:', error);
        this.showMessage('发送消息失败。请重试。', 'error');
      } finally {
        this.waiting = false;
      }
    },

    async fetchAiResponse() {
      const response = await fetch(this.APIWEB, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.APIKEY}`
        },
        body: JSON.stringify({
          model: this.MODEL,
          stream: true,
          messages: this.sendChat
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP 错误！状态: ${response.status}`);
      }

      return response;
    },

    // 处理流式响应
    async handleStreamResponse(response) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (line.startsWith('data: ')) {
            const jsonData = line.slice(5);
            if (jsonData === '[DONE]') return;

            try {
              const parsedData = JSON.parse(jsonData);
              const content = parsedData.choices[0]?.delta?.content || '';
              this.handleReceivedMessage(content);
            } catch (e) {
              console.error('JSON 解析错误:', e);
            }
          }
        }
        buffer = lines[lines.length - 1];
      }
    },

    // 处理接收到的消息
    handleReceivedMessage(content) {
      const lastMessage = this.messages[this.messages.length - 1];
      const lastChatMessage = this.chatMessages[this.chatMessages.length - 1];

      if (lastMessage && lastMessage.role === '极点AI') {
        lastMessage.content += content;
      } else {
        this.messages.push({ role: '极点AI', content });
      }

      if (lastChatMessage && lastChatMessage.role === 'assistant') {
        lastChatMessage.content += content;
      } else {
        this.chatMessages.push({ role: 'assistant', content });
      }
    },

    async sendMessage() {
      if (this.isInputInvalid()) return;

      const message = this.inputText.trim();
      this.addMessageToChat(message);
      this.prepareMessageForAi();
      this.clearInput();

      try {
        await this.sendMessageToAi();
      } catch (error) {
        console.error('发送消息失败:', error);
      }
    },

    isInputInvalid() {
      if (this.waiting) {
        this.showMessage('AI 正在思考中...', 'info');
        return true;
      }

      if (!this.inputText.trim()) {
        this.showMessage('请输入问题！', 'warning');
        return true;
      }

      return false;
    },

    addMessageToChat(message) {
      this.messages.push({ role: 'You', content: message });
      this.chatMessages.push({ role: 'user', content: message });
    },

    prepareMessageForAi() {
      this.sendChat = this.chatMessages.length > 6 ?
        [this.chatMessages[0], ...this.chatMessages.slice(-5)] :
        [...this.chatMessages];
    },

    clearInput() {
      this.inputText = '';
    },

    // 读取提示词文件
    async readPromptFile() {
      try {
        const response = await axios.get(this.PROMPT, { responseType: 'text' });
        return response.data;
      } catch (error) {
        console.error('读取提示词失败:', error);
        this.showMessage('读取提示词失败，请检查文件路径', 'error');
        return null;
      }
    },

    // 刷新页面，重新开始对话
    async refreshPage() {
      this.messages = [];
      this.chatMessages = [];
      this.sendChat = [];
      const prompt = await this.readPromptFile();
      if (prompt) {
        this.chatMessages.push({ role: 'system', content: prompt });
        this.sendChat = [...this.chatMessages];
        await this.sendMessageToAi();
      }
      this.showMessage('AI 正在重新启动...', 'success');
    },

    // 解析markdown内容
    parsedContent(content) {
      marked.setOptions({
        highlight: (code) => hljs.highlightAuto(code).value
      });
      return marked(content);
    },

    // 显示消息提示
    showMessage(message, type = 'warning') {
      this.$message({
        message,
        type
      });
    },

    // 获取当前时间
    getCurrentTime() {
      return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
    },
  },

  async mounted() {
    if (this.$route.query.message) {
      const prompt = await this.readPromptFile();
      if (prompt) {
        this.chatMessages.push({ role: 'system', content: prompt });
        this.chatMessages.push({ role: 'user', content: this.$route.query.message });
        this.sendChat = [...this.chatMessages];
        await this.sendMessageToAi();
        this.showMessage('AI 正在初始化并处理您的问题...', 'info');
      }
    }
  },
};
</script>

<style scoped>
.chatContainer {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background-color: #f4f5fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

.chatBox {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  margin: 0 auto;
  max-width: 100vw;
  width: 50%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.message {
  max-width: 70%;
  padding: 1rem 1.5rem;
  border-radius: 1rem;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  word-wrap: break-word;
  overflow-wrap: break-word;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.userMessage {
  align-self: flex-end;
  background-color: #3498db;
  color: white;
  margin-left: 30%;
}

.aiMessage {
  align-self: flex-start;
  background-color: #ffffff;
  color: #333;
  margin-right: 30%;
}

.typingIndicator {
  align-self: flex-start;
  display: flex;
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.typingIndicator span {
  height: 0.5rem;
  width: 0.5rem;
  margin: 0 0.1rem;
  background-color: #3498db;
  display: block;
  border-radius: 50%;
  opacity: 0.4;
  animation: typing 1s infinite;
}

@keyframes typing {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-0.5rem);
  }
}

.inputArea {
  display: flex;
  align-items: center;
  padding: 1rem;
  margin: 0 auto;
  max-width: 50rem;
  width: 100%;
  background-color: #ffffff;
  margin-bottom: 1rem;
  border-radius: 1rem;
  position: sticky;
  bottom: 0;
  box-sizing: border-box;
}

.iconButton {
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  color: #3498db;
  transition: opacity 0.3s, transform 0.3s;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.iconButton:hover {
  opacity: 0.8;
  transform: scale(1.1);
}

.iconButton:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.textInput {
  flex-grow: 1;
  margin: 0 1rem;
  padding: 1rem 1.5rem;
  border: 2px solid #e5e5e5;
  border-radius: 2rem;
  font-size: 1rem;
  background-color: #ffffff;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.textInput:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.textInput:disabled {
  background-color: #f5f7fa;
  cursor: not-allowed;
}

@media screen and (max-width: 768px) {

  .chatContainer {
    height: 100vh;
  }

  .chatBox {
    padding: 1rem;
    width: 100%;
  }

  .message {
    max-width: 85%;
    padding: 0.75rem 1rem;
  }

  .userMessage {
    margin-left: 15%;
  }

  .aiMessage {
    margin-right: 15%;
  }

  .inputArea {
    max-width: 100%;
    padding: 0.75rem;
    margin-bottom: 0;
    border-radius: 0;
  }

  .textInput {
    margin: 0 0.5rem;
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }

  .iconButton {
    font-size: 1rem;
    padding: 0.5rem;
  }


  .typingIndicator {
    padding: 1rem;
  }
}
</style>