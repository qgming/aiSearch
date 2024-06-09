<template>
  <div class="aiprompt" ref="aiprompt">
    <div class="promptList" ref="promptList">
      <div class="promptCard" v-for="prompt in prompts" :key="prompt.id" @click="changePrompt(prompt)">
        <p class="promptName">{{ prompt.name }}</p>
        <p class="promptAny">{{ prompt.any }}</p>
      </div>
    </div>
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
      backColor: localStorage.getItem("backColor") || '#F9F9F9',
      PROMPT: '../prompt/search.txt',
      prompts: [
        { name: '极点搜索', any: '专业AI搜索模式', location: '../prompt/search.txt' },
        { name: '开发者模式', any: '解开AI部分限制', location: '../prompt/developer.txt' },
        { name: '写作助理', any: '优化句子、文章的语法、清晰度和简洁度，提高可读性。', location: '../prompt/Writingassistant.txt' },
        { name: '小红书风格', any: '将文本改写成类似小红书的 Emoji 风格。', location: '../prompt/xiaohongshu.txt' },
        { name: 'AI画图提示词生成器', any: '描述图片详情，AI帮你补充详细信息', location: '../prompt/midjourney.txt' },
        { name: 'Nature风格润色', any: '将按照 Nature 风格润色，或者可以提供想要模仿的写作风格。', location: '../prompt/nature.txt' },
        { name: '论文专家', any: '根据主题撰写内容翔实、有信服力的论文。', location: '../prompt/lunwen1.txt' },

        { name: '英语翻译/修改', any: '将其他语言翻译成英文，或改进你提供的英文句子。', location: '../prompt/english.txt' },
        { name: 'IT编程问题', any: '模拟编程社区来回答你的问题，并提供解决代码。', location: '../prompt/bianchengwenti.txt' },
        { name: '总结内容', any: '将文本内容总结为 100 字。', location: '../prompt/zongjie.txt' },
        { name: '周报生成器', any: '根据日常工作内容，提取要点并适当扩充，以生成周报。', location: '../prompt/zhoubao.txt' },
        { name: '新闻记者', any: '引用已有数据资料，用新闻的写作风格输出主题文章。', location: '../prompt/xinwenjizhe.txt' },
        { name: '解梦', any: '对你描述的梦境进行解读。', location: '../prompt/jiemeng.txt' },
        { name: '辩手', any: ' 从正反两面分析话题。', location: '../prompt/bianshou.txt' },
        { name: '正则生成器', any: '根据要求生成正则表达式。', location: '../prompt/zhengze.txt' },
        { name: '文字冒险游戏', any: '。', location: '../prompt/wenzimaoxian.txt' },
        { name: '表情符号翻译器', any: '将输入文字翻译为表情符号。', location: '../prompt/biaoqingfuhao.txt' },
        { name: '五子棋', any: '', location: '../prompt/wuziqi.txt' },
        { name: 'Excel生成器', any: '', location: '../prompt/excel.txt' },
        { name: '女性对话生成器', any: '根据自己和对方的一段对话，来继续对话，用于扩展话题避免冷场。', location: '../prompt/yixingduihua.txt' },
        { name: '空白提示词', any: '选择此项即可取消所有提示词', location: '../prompt/111.txt' },
        // { name: '开发者模式', any: '解开AI部分限制', location: '../prompt/developer.txt' },
        // 添加更多搜索引擎选项
      ],
    };
  },
  methods: {
    // 发送消息给AI
    async sendMessageToAi() {
      try {
        const response = await axios.post(this.APIWEB, {
          model: this.MODEL,
          messages: this.sendChat
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
      console.log(this.chatMessages);
      console.log(this.sendChat);

      try {
        const responseMessage = await this.sendMessageToAi();
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
      this.$refs.chatBox.style.height = `${screenHeight - 10}px`;
      this.$refs.aiprompt.style.height = `${screenHeight - 20}px`;
      this.$refs.promptList.style.height = `${screenHeight - 200}px`;
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
    //改变初始Prompt
    changePrompt(prompt) {
      console.log(prompt.location);
      // 在这里执行你的逻辑
      this.PROMPT = prompt.location;
      this.refreshPage();
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
    //换取传递信息并发送
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
.aiprompt {
  display: flex;
  flex-direction: row;
  margin: 10px;
  background-color: #f9f9f9;
  border-radius: 12px;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
}

.promptList {
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  margin-top: 5px;
}

.promptCard {
  width: 150px;
  /* height: 40px; */
  margin: 5px;
  background-color: white;
  border-radius: 9px;
  padding: 8px;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
}

.promptCard:hover {
  background-color: #f1f2f3;
}

.promptName {
  font-size: 16px;
  font-weight: 500;
}

.promptAny {
  font-size: 12px;
  color: gray;
}

.chatContainer {
  display: flex;
  flex-direction: column;
  justify-content: center;
  /* margin: 10px; */
  border: 1px solid #f1f2f3;
  border-radius: 14px;
  padding: 20px 20px 5px 20px;
  background-color: white;
  margin: 5px;
  /* box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px; */
}

.chatBox {
  overflow-y: scroll;
  /* padding-bottom: 20px; */
}

/* 伪元素隐藏滑动条 */
.promptList::-webkit-scrollbar,
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
  border-radius: 12px;
  background-color: white;
  padding: 6px;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
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
  .aiprompt {
    margin: 0;
    border-radius: 6px;
  }

  .promptCard {
    width: 50px;
    margin: 3px;
    padding: 5px;
  }

  .promptName {
    font-size: 14px;
    font-weight: 500;
  }

  .promptAny {
    font-size: 12px;
    color: gray;
  }

  .chatContainer {
    width: 300px;
    padding: 5px;
    margin: 5px;
  }

  .inputBox {
    width: 290px;
    padding: 5px;
  }

  .message {
    width: 270px;
  }

  .footerText {
    height: 12px;
    line-height: 12px;
    font-size: 10px;
  }

}
</style>