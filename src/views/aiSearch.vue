<template>
  <div class="chatContainer">
    <main class="chatBox" ref="chatBox">
      <!-- 遍历消息列表，显示每条消息 -->
      <div v-for="message in messages" :key="message.id" class="messageWrapper">
        <div class="message" :class="{
          'userMessage': message.role === 'You',
          'aiMessage': message.role !== 'You'
        }">
          <!-- 使用 MdPreview 组件渲染消息内容，支持 Markdown 格式 -->
          <MdPreview class="messageContent" :modelValue="message.content"
            :class="{ 'userMessageContent': message.role === 'You' }" />
        </div>
      </div>
      <!-- 等待 AI 回复时显示的加载指示器 -->
      <div v-if="waiting" class="typingIndicator">
        <span></span><span></span><span></span>
      </div>
    </main>
    <!-- 用户输入区域 -->
    <p class="warnText">内容由AI生成，请注意甄别</p>
    <footer class="inputArea">
      <!-- 刷新对话按钮 -->
      <button class="iconButton refreshBtn" @click="refreshPage" title="刷新对话">
        <i class="fas fa-sync-alt"></i>
      </button>
      <!-- 文本输入框 -->
      <input class="textInput" type="text" v-model="inputText" @keyup.enter="sendMessage" placeholder="输入您的问题..."
        :disabled="waiting">
      <!-- 发送消息按钮 -->
      <button class="iconButton sendButton" @click="sendMessage" :disabled="!inputText.trim() || waiting">
        <i class="fas fa-paper-plane"></i>
      </button>
    </footer>
  </div>
</template>

<script>
import axios from 'axios';
import { MdPreview } from 'md-editor-v3';
import 'md-editor-v3/lib/preview.css';

export default {
  components: {
    MdPreview,
  },
  data() {
    return {
      messages: [], // 用于显示的消息列表
      allMessages: [{ role: 'system', content: '' }], // 包含系统消息的完整消息列表
      inputText: '', // 用户输入的文本
      waiting: false, // 是否正在等待 AI 回复
      // API_KEY: localStorage.getItem("apiKey"),
      // ENDPOINT: localStorage.getItem("apiWebsite"),
      // MODEL_NAME: localStorage.getItem('apiModel'),

      // 硅基流动API
      API_KEY: 'sk-cknwcfvxfuaemvbgfpcjhececitxulqcjbderqufacsdlrqh',
      ENDPOINT: 'https://api.siliconflow.cn/v1/chat/completions',
      MODEL_NAME: 'Qwen/Qwen2-7B-Instruct',

      PROMPT: '../prompt/search.txt', // 系统提示词文件路径
    };
  },
  methods: {
    // 生成器函数，用于逐步获取 GPT 响应
    async * getGPT(input) {
      const response = await fetch(this.ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`
        },
        body: JSON.stringify({
          model: this.MODEL_NAME,
          stream: true,
          messages: input
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      let decoder = new TextDecoder();
      let resultData = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        resultData += decoder.decode(value);

        while (resultData.includes('\n')) {
          const messageIndex = resultData.indexOf('\n');
          const message = resultData.slice(0, messageIndex);
          resultData = resultData.slice(messageIndex + 1);

          if (message.startsWith('data: ')) {
            const jsonMessage = JSON.parse(message.substring(5));

            if (jsonMessage.choices[0]?.finish_reason == 'stop') {
              break;
            }

            const createdID = jsonMessage.created;
            yield {
              content: jsonMessage.choices[0]?.delta?.content || ' ',
              role: "assistant",
              id: createdID
            };
          }
        }
      }
    },

    // 发送消息方法
    async sendMessage() {
      if (this.waiting || !this.inputText.trim()) return;

      this.waiting = true;

      const userMessage = this.inputText.trim();
      this.messages.push({ role: 'You', content: userMessage, id: Date.now() });
      this.allMessages.push({ role: 'user', content: userMessage });

      this.scrollToBottom();

      try {
        // 创建一个临时的 AI 消息对象
        const tempAiMessage = { role: 'assistant', content: '', id: Date.now() + 1 };
        this.messages.push(tempAiMessage);

        // 逐步接收 AI 响应
        for await (const message of this.getGPT(this.allMessages)) {
          tempAiMessage.content += message.content; // 更新临时消息内容
          this.messages[this.messages.length - 1] = { ...tempAiMessage }; // 直接修改消息列表中的消息
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        }

        // 更新最终的 AI 消息到 allMessages
        this.allMessages.push({ role: 'assistant', content: tempAiMessage.content });
      } catch (error) {
        console.error('发送消息失败:', error);
        this.showMessage(`发送消息失败: ${error.message}。请重试。`, 'error');
      } finally {
        this.waiting = false;
        this.inputText = '';
        this.scrollToBottom();
      }
    },

    // 新增方法：滚动到最新消息
    scrollToBottom() {
      this.$nextTick(() => {
        const chatBox = this.$refs.chatBox;
        chatBox.scrollTop = chatBox.scrollHeight;
      });
    },

    // 刷新对话
    refreshPage() {
      this.messages = [];
      this.allMessages = [{ role: 'system', content: this.PROMPT }];
      this.showMessage('对话已刷新', 'success');
    },

    // 读取提示词文件
    async readPromptFile() {
      try {
        const response = await axios.get(this.PROMPT, { responseType: 'text' });
        this.PROMPT = response.data;
        this.allMessages[0].content = this.PROMPT;
      } catch (error) {
        console.error('读取提示词失败:', error);
        this.showMessage('读取提示词失败，请检查文件路径', 'error');
      }
    },

    // 检查 API 设置
    checkApiSwitch() {
      const switchApi = localStorage.getItem('switchApi');
      if (switchApi === 'true') {
        const userKey = localStorage.getItem('apiKey');
        const userUrl = localStorage.getItem('apiWebsite');
        const userModel = localStorage.getItem('apiModel');

        if (!userKey || !userUrl || !userModel) {
          this.showMessage('API自定义失败，已启用默认大模型', 'error');
        } else {
          this.API_KEY = userKey;
          this.ENDPOINT = userUrl;
          this.MODEL_NAME = userModel;
        }
      }
    },

    // 显示消息提示
    showMessage(message, type = 'warning') {
      this.$message({
        message,
        type
      });
    },

    // 检查 URL 参数
    checkUrlParams() {
      const urlParams = new URLSearchParams(window.location.search);
      const message = urlParams.get('q');
      if (message) {
        this.inputText = message;
        this.sendMessage();
      }
    },
  },

  created() {
    this.readPromptFile();
  },

  mounted() {
    this.checkApiSwitch();
    this.checkUrlParams();
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
  border-radius: 1rem;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  word-wrap: break-word;
  overflow-wrap: break-word;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  background-color: #ffffff;
  color: #333;
  padding: 0.5rem 0.75rem;
}

.userMessage {
  align-self: flex-end;
  margin-left: 30%;
  border: 1px solid #87CEEB;
}

.aiMessage {
  align-self: flex-start;
  margin-right: 30%;
  border: 1px solid #87CEEB;
}

.typingIndicator {
  display: flex;
  align-items: center;
  padding: 1rem;
  margin-top: 0.5rem;
  align-self: flex-start;
}

.typingIndicator span {
  height: 0.5rem;
  width: 0.5rem;
  margin: 0 0.1rem;
  background-color: #87CEEB;
  display: block;
  border-radius: 50%;
  opacity: 0.4;
  animation: typing 1s infinite;
}

.warnText {
  text-align: center;
  color: gray;
  font-size: 14px;
  font-weight: 500;
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
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  /* Add shadow */
}

.iconButton {
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  color: #87CEEB;
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
  border-color: #87CEEB;
  box-shadow: 0 0 0 3px rgba(135, 206, 235, 0.1);
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
    padding: 0.15rem 0.35rem;
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

:deep(.md-preview) {
  background: transparent;
  padding: 0;
}

:deep(.md-preview pre) {
  background-color: #f0f0f0;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
}
</style>