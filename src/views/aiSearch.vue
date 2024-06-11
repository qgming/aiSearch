<template>
  <div class="chatContainer">
    <div class="chatBox" ref="chatBox">
      <!-- 对话历史 -->
      <div v-for="message in messages" :key="message.id">
        <div class="message">
          <p class="sender">{{ message.role }}:</p>
          <div v-html="parsedContent(message.content)"></div>
        </div>
      </div>
      <div v-if="waiting" class="thinkAi"><img class="loading" src="../assets/icons/loading.gif" alt=""></div>
    </div>

    <div class="inputBox">
      <img class="refreshWeb" src="../assets/icons/shuaxin.svg" alt="刷新网站" @click="refreshPage">
      <!-- <img class="anyModel" src="../assets/icons/searchai.svg" alt="更多模式" @click="anyModel"> -->
      <!-- <el-input class="textInput" v-model="inputText" @keyup.enter="sendMessage" placeholder="输入问题..." /> -->
      <input class="textInput" type="text" v-model="inputText" @keyup.enter="sendMessage" placeholder="输入问题...">
      <button class="sendButton" @click="sendMessage">发送</button>
    </div>
    <div class="footerText">内容由 AI 大模型生成，请仔细甄别</div>
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
      backColor: localStorage.getItem("backColor") || '#F9F9F9',
    };
  },
  methods: {
    // // 发送消息给AI
    // async sendMessageToAi() {
    //   try {
    //     const response = await axios.post(this.APIWEB, {
    //       model: this.MODEL,
    //       stream: true,
    //       messages: this.sendChat
    //       // messages: [{ role: 'user', content: message }],
    //     }, {
    //       headers: {
    //         'Authorization': `Bearer ${this.APIKEY}`,
    //         'Content-Type': 'application/json',
    //       },
    //     });
    //     console.log(response);
    //     return response.data;
    //     // return response.data.choices[0].message;
    //   } catch (error) {
    //     console.error('消息发送失败:', error);
    //     throw error;
    //   }
    // },

    async sendMessageToAi() {
      try {
        // 发送请求到 ChatGPT API
        const response = await fetch(this.APIWEB, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.APIKEY}` // 使用 Bearer 认证方式，APIKEY 是你的 OpenAI API 密钥
          },
          body: JSON.stringify({
            model: this.MODEL, // 使用的模型，例如 'gpt-3.5-turbo'
            stream: true, // 启用流式响应
            messages: this.sendChat // 发送的消息数组
          })
        });

        // 检查响应状态是否成功
        if (!response.ok) {
          throw new Error(`HTTP 错误! 状态码: ${response.status}`);
        }

        // 创建一个读取器来读取响应流
        const reader = response.body.getReader();
        // 创建一个解码器来将二进制数据解码为字符串
        let decoder = new TextDecoder();
        // 存储解码后的数据
        let resultData = '';
        // 标志，用于在找到 [DONE] 后停止读取
        let doneReading = false;

        // 持续读取响应流直到结束
        while (!doneReading) {
          // 读取响应流的下一块数据
          const { done, value } = await reader.read();
          // 如果已经读取完毕，则退出循环
          if (done) break;
          // 将读取到的数据解码并追加到 resultData 中
          resultData += decoder.decode(value);
          // 检查 resultData 中是否包含完整的 JSON 消息
          while (resultData.includes('\n')) {
            // 找到 JSON 消息的结束位置
            const messageIndex = resultData.indexOf('\n');
            // 提取完整的 JSON 消息
            const message = resultData.slice(0, messageIndex);
            // 更新 resultData 以移除已处理的消息
            resultData = resultData.slice(messageIndex + 1);
            // 检查消息是否以 'data: ' 开头
            if (message.startsWith('data: ')) {
              // 解析 JSON 消息
              const jsonMessage = JSON.parse(message.substring(5));
              // console.log(jsonMessage);
              // 检查是否接收到结束消息
              if (resultData.includes('[DONE]')) {
                doneReading = true; // 设置标志为 true 以停止读取
                break;
              }
              // 处理接收到的消息
              const content = jsonMessage.choices[0]?.delta?.content || '';
              // console.log(content);
              // return content; // 返回接收到的消息内容
              this.handleReceivedMessage({ content });
            }
          }
        }
      } catch (error) {
        // 处理错误
        console.error('消息发送失败:', error);
        throw error;
      }
    },


    //处理消息,接收的消息传入对话纪录数组
    handleReceivedMessage(message) {
      console.log(message);
      // 检查最后一个消息的角色
      if (this.messages.length > 0) {
        if (this.messages[this.messages.length - 1].role === '极点AI') {
          // 如果最后一条消息是AI的，则将新消息追加到现有消息中
          this.messages[this.messages.length - 1].content += message.content;
        } else {
          // 否则，创建一个新的消息
          this.messages.push({ role: '极点AI', content: message.content });
        }
      }

      // 将消息同时添加到chatMessages中
      if (this.chatMessages.length > 0 && this.chatMessages[this.chatMessages.length - 1].role === 'assistant') {
        // 如果最后一条消息是assistant的，则将新消息追加到现有消息中
        this.chatMessages[this.chatMessages.length - 1].content += message.content;
      } else {
        // 否则，创建一个新的消息
        this.chatMessages.push({ role: 'assistant', content: message.content });
      }
    },

    //用户发送消息
    async sendMessage() {
      if (this.waiting) {
        //AI正在思考中
        this.showAiMessage()
        return;
      }
      this.waiting = true;

      let message = this.inputText.trim();
      if (!message) {
        //请输入内容
        this.showMessage()
        this.waiting = false;
        return;
      }
      //把消息加载到遍历数组
      this.messages.push({ role: 'You', content: message });
      //把消息加载到历史纪录
      this.chatMessages.push({ role: 'user', content: message });
      //把历史纪录转化为对话数组
      this.sendChat = this.chatMessages.length > 6 ? [this.chatMessages[0]].concat(this.chatMessages.slice(-5)) : [...this.chatMessages];
      this.inputText = '';

      console.log('历史记录');
      console.log(this.chatMessages);

      try {

        //不再等待完整的响应
        await this.sendMessageToAi();
        // const responseMessage = await this.sendMessageToAi();
        // console.log(responseMessage);
        // this.handleReceivedMessage({ responseMessage });
      } catch (error) {
        console.error('消息发送失败！:', error);
      } finally {
        this.waiting = false;
      }
    },
    //读取本地Prompt
    async readPromptFile() {
      try {
        //根据变量变化初始提示词
        const response = await axios.get(this.PROMPT, {
          responseType: 'text' // 指定响应类型为文本
        });
        // const response = await axios.get('../prompt/search.txt', {
        //   responseType: 'text' // 指定响应类型为文本
        // });
        return response.data;
      } catch (error) {
        console.error('prompt读取失败！:', error);
        return null;
      }
    },
    //刷新页面
    refreshPage() {
      this.messages = [];
      this.chatMessages = [];
      this.sendChat = [];
      //发送prompt
      this.readPromptFile().then(prompt => {
        this.chatMessages.push({ role: 'system', content: prompt });
        this.sendChat = this.chatMessages.length > 6 ? [this.chatMessages[0]].concat(this.chatMessages.slice(-5)) : [...this.chatMessages];
        this.sendMessageToAi();
      });
      this.showRefershMessage()
      // window.location.reload();
    },
    //修改高度
    setChatBoxHeight() {
      let screenHeight = window.innerHeight;
      this.$refs.chatBox.style.height = `${screenHeight - 130}px`;
    },
    //让消息支持markdown
    parsedContent(content) {
      marked.setOptions({
        highlight: function (code) {
          return hljs.highlightAuto(code).value;
        }
      });
      return marked(content);
    },
    //弹出消息
    showMessage() {
      this.$message({
        message: '请先输入问题！',
        type: 'warning'
      });
    },
    showAiMessage() {
      this.$message({
        message: 'AI正在思考中...',
        // type: 'warning'
      });
    },
    showRefershMessage() {
      this.$message({
        message: '新对话已启用',
        type: 'success'
      });
    },
    //去其他页面（临时
    anyModel() {
      window.open(`/any`, '_blank');
    },
  },

  mounted() {
    //发送prompt
    this.readPromptFile().then(prompt => {
      this.chatMessages.push({ role: 'system', content: prompt });
      this.sendChat = this.chatMessages.length > 6 ? [this.chatMessages[0]].concat(this.chatMessages.slice(-5)) : [...this.chatMessages];
      this.sendMessageToAi();
    });
    // 设置聊天框高度
    this.setChatBoxHeight();
    // 添加窗口大小改变事件监听器
    window.addEventListener('resize', this.setChatBoxHeight);
    //页面背景
    const savedBack = localStorage.getItem('switchBack');
    if (savedBack === null) {
      document.body.style.backgroundColor = this.backColor;
    } else {
      if (savedBack === 'true') {
        document.body.style.backgroundImage = `url("https://bing.ee123.net/img/")`;
        document.body.style.backgroundSize = 'cover';
      } else {
        document.body.style.backgroundColor = this.backColor;
      }
    };
    if (this.$route.query.q) {
      this.inputText = this.$route.query.q
      this.sendMessage()
    };

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
  border: 1px solid #f1f2f3;
  border-radius: 16px;
  padding: 20px 20px 5px 20px;
  background-color: white;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
}

.chatBox {
  overflow-y: scroll;
  /* padding-bottom: 20px; */
}

/* 伪元素隐藏滑动条 */
.chatBox::-webkit-scrollbar {
  display: none;
}

.thinkAi {
  text-align: center;
}

.loading {
  width: 50px;
}

/* 问题输入框 */
.inputBox {
  width: 600px;
  height: 42px;
  display: flex;
  flex-direction: row;
  align-items: center;
  border: 1px solid #cccccc;
  border-radius: 12px;
  background-color: white;
  padding: 6px;
  /* box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px; */
}

.refreshWeb {
  width: 26px;
  height: 26px;
  padding: 6px;
  border: 1px solid #f5f6f7;
  background-color: #f1f2f3;
  border-radius: 9px;
}

.refreshWeb:hover {
  background-color: #f9f9f9;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
}

.anyModel {
  width: 26px;
  height: 26px;
  padding: 6px;
  margin-left: 5px;
  border: 1px solid #f5f6f7;
  background-color: #f1f2f3;
  border-radius: 9px;
}

.anyModel:hover {
  background-color: #f9f9f9;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
}


.textInput {
  width: 500px;
  height: 40px;
  padding: 8px;
  border-radius: 9px;
  border: 1px solid #f5f6f7;
  margin: 0px 6px 0px 6px;
  outline: none;
}

.textInput:hover {
  border: 1px solid #f9f9f9;
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

.footerText {
  height: 15px;
  line-height: 15px;
  text-align: center;
  color: #c1c2c3;
  font-size: 12px;
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
    width: 370px;
    padding: 5px;
    margin: 5px;
  }

  .inputBox {
    width: 350px;
    padding: 5px;
  }

  .message {
    width: 300px;
  }

  .footerText {
    height: 12px;
    line-height: 12px;
    font-size: 10px;
  }

}
</style>