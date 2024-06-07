<template>
  <div class="chatContainer">
    <div class="chatBox" ref="chatBox">
      <!-- 对话历史 -->
      <div v-for="message in messages" :key="message.id">
        <div class="message">
          <p class="sender">{{ message.role }}:</p>
          <p> {{ message.content }}</p>
        </div>
      </div>
    </div>
    <div class="inputBox">
      <img class="refreshWeb" src="../assets/icons/shuaxin.svg" alt="刷新网站" @click="refreshPage">
      <input class="textInput" type="text" v-model="inputText" @keyup.enter="sendMessage" placeholder="输入问题...">
      <button class="sendButton" @click="sendMessage">发送</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      messages: [],
      chatMessages: [],
      inputText: '',
      waiting: false,
      APIKEY: localStorage.getItem("apiKey"),
      APIWEB: localStorage.getItem("apiWebsite"),
      MODEL: localStorage.getItem('apiModel'),
      sendChat: [],
    };
  },
  methods: {
    // 发送消息给AI
    async sendMessageToAi(message) {
      try {
        const response = await axios.post(this.APIWEB, {
          model: this.MODEL,
          messages: this.chatMessages
          // messages: [{ role: 'user', content: message }],
        }, {
          headers: {
            'Authorization': `Bearer ${this.APIKEY}`,
            'Content-Type': 'application/json',
          },
        });
        return response.data.choices[0].message;
      } catch (error) {
        console.error('消息发送失败:', error);
        throw error;
      }
    },
    //处理消息,接收的消息传入对话纪录数组
    handleReceivedMessage(message) {
      this.messages.push({ role: '极点AI', content: message.content });
      this.chatMessages.push({ role: 'assistant', content: message.content });

    },

    //用户发送消息
    async sendMessage() {
      if (this.waiting) {
        alert('AI正在思考中...');
        return;
      }
      this.waiting = true;

      let message = this.inputText.trim();
      if (!message) {
        alert('请先输入问题！');
        this.waiting = false;
        return;
      }
      //把消息加载到遍历数组
      this.messages.push({ role: 'You', content: message });
      //把消息加载到历史纪录
      this.chatMessages.push({ role: 'user', content: message });
      //把消息加载到对话数组
      this.sendChat = [this.chatMessages[0]].concat(this.chatMessages.slice(-5));
      this.inputText = '';

      try {
        const responseMessage = await this.sendMessageToAi(message);
        this.handleReceivedMessage(responseMessage);
      } catch (error) {
        console.error('消息发送失败！:', error);
      } finally {
        this.waiting = false;
      }
    },
    //读取本地Prompt
    async readPromptFile() {
      try {
        const response = await axios.get('../public/prompt/search.txt', {
          responseType: 'text' // 指定响应类型为文本
        });
        return response.data;
      } catch (error) {
        console.error('prompt读取失败！:', error);
        return null;
      }
    },
    //刷新页面
    refreshPage() {
      window.location.reload();
    },
    //修改高度
    setChatBoxHeight() {
      let screenHeight = window.innerHeight;
      this.$refs.chatBox.style.height = `${screenHeight - 160}px`;
    },

  },

  mounted() {
    //发送prompt
    this.readPromptFile().then(prompt => {
      if (prompt) {
        this.chatMessages.push({ role: 'system', content: prompt });
        this.sendMessageToAi(prompt);
      }
    });
    // 设置聊天框高度
    this.setChatBoxHeight();

    // 添加窗口大小改变事件监听器
    window.addEventListener('resize', this.setChatBoxHeight);
  },

  beforeDestroy() {
    // 在组件销毁前移除事件监听器
    window.removeEventListener('resize', this.setChatBoxHeight);
  },



};
</script>

<style scoped>
.chatContainer {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 20px;
  width: 622px;
  border: 1px solid #ccc;
  border-radius: 12px;
  padding: 20px;
  background-color: white;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
}

.chatBox {
  overflow-y: scroll;
  padding-bottom: 20px;
  height: auto;
}

/* 伪元素隐藏滑动条 */
.chatBox::-webkit-scrollbar {
  display: none;
}

/* 问题输入框 */
.inputBox {
  width: 600px;
  height: 42px;
  display: flex;
  flex-direction: row;
  align-items: center;
  border: 1px solid #f1f2f3;
  border-radius: 12px;
  background-color: white;
  padding: 10px;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
}

.refreshWeb {
  width: 30px;
  height: 30px;
  padding: 5px;
  border: 1px solid #f5f6f7;
  background-color: #f1f2f3;
  border-radius: 9px;
}

.refreshWeb:hover {
  background-color: #f9f9f9;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
}

.textInput {
  width: 500px;
  height: 30px;
  padding: 5px;
  border-radius: 9px;
  border: 1px solid #f1f2f3;
  margin: 0px 10px 0px 10px;
  outline: none;
}

.textInput:hover {
  box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
}

.sendButton {
  width: 80px;
  height: 40px;
  padding: 5px;
  border-radius: 9px;
  border: 1px solid #f5f6f7;
  background-color: #f1f2f3;
  /* font-size: 16px; */
  font-weight: 500;
}

.sendButton:hover {
  background-color: #f9f9f9;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
}

/* 对话内容 */

.message {
  width: 500px;
  margin: 2px 0 10px 2px;
  border: 1px solid #f1f2f3;
  background-color: white;
  border-radius: 9px;
  padding: 10px;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
}

.sender {
  font-weight: bold;
}

@media screen and (max-width: 768px) {
  .chatContainer {
    width: 500px;
    padding: 10px;
  }

  .inputBox {
    width: 350px;
    padding: 5px;
  }

  .message {
    width: 300px;
  }

}
</style>