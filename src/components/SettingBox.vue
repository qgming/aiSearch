<template>
  <div class="setting">
    <!-- 设置图标 -->
    <img class="settingImg" @click="toggleSettingBox" src="../assets/icons/setting.svg" alt="设置">
    <!-- 设置面板 -->
    <div class="settingBox" v-if="showSettingBox">
      <div>
        <!-- 必应壁纸开关 -->
        <div class="option">
          <span class="optionText">必应壁纸</span>
          <el-switch v-model="savedBack" @change="changeBackground" size="large" />
        </div>
        <!-- 精选壁纸开关 -->
        <div class="option">
          <span class="optionText">本地壁纸</span>
          <el-switch v-model="localBackground" @change="changeLocalBackground" size="large" />
        </div>
        <!-- 本地壁纸选择 -->
        <div class="localBackground" v-if="localBackground">
          <div class="allPhoto" v-for="item in localPhoto" @click="changeLocalPhoto(item.url)">
            <img class="photoList" :src="item.url" alt="background" />
          </div>
          <div class="allPhoto" @click="selectLocalPhoto">
            <div class="photoList">+</div>
          </div>
        </div>
        <!-- 网站捷径开关 -->
        <div class="option">
          <span class="optionText">网站捷径</span>
          <el-switch v-model="savedCollect" @change="changeCollect" size="large" />
        </div>
        <!-- 背景颜色选择器 -->
        <div class="option">
          <span class="optionText">背景颜色</span>
          <el-color-picker v-model="backColor" @change="updateBackgroundColor" />
        </div>
        <!-- 默认搜索引擎选择 -->
        <div>
          <div class="optionText">默认引擎</div>
          <el-select class="selectEngine" v-model="selectedEngine" placeholder="选择搜索引擎" size="large">
            <el-option v-for="item in options" :key="item.name" :label="item.name" :value="item.url" />
          </el-select>
        </div>
        <!-- API设置 -->
        <div class="option">
          <span class="optionText">自定义大模型</span>
          <el-switch v-model="customApi" @change="changeApi" size="large" />
        </div>
        <div class="customApi" v-if="customApi">
          <div>
            <div class="optionName">APIKEY</div>
            <el-input class="customApiOption" v-model="apiKey" placeholder="sk-" />
          </div>
          <div>
            <div class="optionName">API网站</div>
            <el-input class="customApiOption" v-model="apiWebsite"
              placeholder="https://api.openai.com/v1/chat/completions" />
          </div>
          <div>
            <div class="optionName">API模型</div>
            <el-input class="customApiOption" v-model="apiModel" placeholder="gpt-3.5-turbo" />
          </div>
        </div>

        <!-- 保存按钮 -->
        <div>
          <el-button class="saveButton" type="primary" @click="saveSettings" plain>保存</el-button>
        </div>
        <div>
          <div class="otherName">由<a href="https://siliconflow.cn/zh-cn/"
              target="_blank">硅基流动</a>提供默认大模型支持<br>通义千问（Qwen2-7B-Instruct）</div>
        </div>
        <!-- 版本信息 -->
        <div>
          <div class="optionName">©️极点维度 V0.6.0(6)</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showSettingBox: false,
      apiKey: '',
      apiWebsite: '',
      apiModel: '',
      savedBack: false,
      localBackground: false,
      savedCollect: false,
      customApi: false,
      backColor: '#f9f9f9',
      selectedEngine: '',
      options: [
        { name: 'Google', url: 'https://www.google.com/search?q=' },
        { name: '百度', url: 'https://www.baidu.com/s?wd=' },
        { name: '哔哩哔哩', url: 'https://search.bilibili.com/all?keyword=' },
        { name: '秘塔AI', url: 'https://metaso.cn/?q=' },
        { name: '360AI', url: 'https://www.sou.com/search/?q=' },
        { name: 'perplexity', url: 'https://www.perplexity.ai/?s=o&q=' },
        { name: 'Bing', url: 'https://www.bing.com/search?q=' },
      ],
      localPhoto: [
        { name: '图片1', id: 1, url: '../background/background1.jpg' },
        { name: '图片2', id: 2, url: '../background/background2.jpg' },
        { name: '图片3', id: 3, url: '../background/background3.jpg' },
        { name: '图片4', id: 4, url: '../background/background4.jpg' },
        { name: '图片5', id: 5, url: '../background/background5.jpg' },
      ],
      aLocalPhoto: '../background/background1.jpg',
    };
  },

  methods: {
    // 切换设置面板的显示状态
    toggleSettingBox() {
      this.showSettingBox = !this.showSettingBox;
    },

    // 保存设置
    saveSettings() {
      localStorage.setItem("apiKey", this.apiKey);
      localStorage.setItem("apiWebsite", this.apiWebsite);
      localStorage.setItem("apiModel", this.apiModel);
      localStorage.setItem("searchEngine", this.selectedEngine);
      localStorage.setItem("backColor", this.backColor);
      localStorage.setItem('switchBack', JSON.stringify(this.savedBack));
      localStorage.setItem('switchCollect', JSON.stringify(this.savedCollect));
      localStorage.setItem('switchApi', JSON.stringify(this.customApi));
      localStorage.setItem('switchLocalBackground', JSON.stringify(this.localBackground));

      this.showMessage();
      this.refreshPage();
    },

    // 开关必应壁纸
    changeBackground(value) {
      if (value) {
        document.body.style.backgroundImage = `url("https://bing.ee123.net/img/")`;
        document.body.style.backgroundColor = '';
        this.localBackground = false; // 关闭本地壁纸
      } else {
        this.updateBackgroundColor(this.backColor);
      }
      // 更新本地存储的值
      localStorage.setItem('switchBack', JSON.stringify(value));
    },


    // 开关本地壁纸
    changeLocalBackground(value) {
      if (value) {
        document.body.style.backgroundImage = `url(${this.aLocalPhoto})`;
        document.body.style.backgroundColor = '';
        this.savedBack = false; // 关闭必应壁纸
      } else {
        this.updateBackgroundColor(this.backColor);
      }
      // 更新本地存储的值
      localStorage.setItem('switchLocalBackground', JSON.stringify(value));
    },

    // 更改本地壁纸
    changeLocalPhoto(photo) {
      // 更新本地存储的值
      localStorage.setItem('localPhoto', JSON.stringify(photo));
      if (this.localBackground) {
        document.body.style.backgroundImage = `url(${photo})`;
      }
    },
    //选择电脑本地图片
    selectLocalPhoto() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            this.changeLocalPhoto(e.target.result);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    },

    // 更新背景颜色
    updateBackgroundColor(color) {
      if (!this.savedBack) {
        document.body.style.backgroundImage = '';
        document.body.style.backgroundColor = color;
      }
    },

    // 开关网站捷径
    changeCollect(value) {
      if (value) {
        this.savedCollect = true;
      } else {
        this.savedCollect = false;
      }
      // 更新本地存储的值
      localStorage.setItem('switchCollect', JSON.stringify(value));
    },

    //自定义API界面
    changeApi(value) {
      this.customApi = !!value;
      // 更新本地存储的值
      localStorage.setItem('switchApi', JSON.stringify(value));
    },

    // 刷新页面
    refreshPage() {
      location.reload();
    },

    // 显示保存成功消息
    showMessage() {
      this.$message({
        message: '保存成功！',
        type: 'success'
      });
    },
  },

  mounted() {
    // 从本地存储加载设置
    this.apiKey = localStorage.getItem("apiKey") || '';
    this.apiWebsite = localStorage.getItem("apiWebsite") || 'https://api.openai.com/v1/chat/completions';
    this.apiModel = localStorage.getItem("apiModel") || 'gpt-4o';
    this.backColor = localStorage.getItem("backColor") || '#f9f9f9';
    this.selectedEngine = localStorage.getItem("searchEngine") || this.options[6].url;

    //自定义API开关
    const customApi = localStorage.getItem("switchApi")
    if (customApi !== null) {
      this.customApi = JSON.parse(customApi);
    } else {
      this.customApi = false; // 第一次设置为 false
      localStorage.setItem('switchApi', JSON.stringify(this.customApi));
    }
    // 检查并设置必应壁纸的初始值
    const savedBack = localStorage.getItem('switchBack');
    if (savedBack !== null) {
      this.savedBack = JSON.parse(savedBack);
    } else {
      this.savedBack = true; // 第一次设置为 true
      localStorage.setItem('switchBack', JSON.stringify(this.savedBack));
    }

    // 检查并设置网站捷径的初始值
    const savedCollect = localStorage.getItem('switchCollect');
    if (savedCollect !== null) {
      this.savedCollect = JSON.parse(savedCollect);
    } else {
      this.savedCollect = true; // 第一次设置为 true
      localStorage.setItem('switchCollect', JSON.stringify(this.savedCollect));
    }

    // 检查并设置本地壁纸的初始值
    const localBackground = localStorage.getItem('switchLocalBackground');
    if (localBackground !== null) {
      this.localBackground = JSON.parse(localBackground);
    } else {
      this.localBackground = false; // 第一次设置为 false
      localStorage.setItem('switchLocalBackground', JSON.stringify(this.localBackground));
    }

    // 从本地存储加载本地壁纸
    const localPhoto = localStorage.getItem('localPhoto');
    if (localPhoto !== null) {
      this.aLocalPhoto = JSON.parse(localPhoto);
    }

    // 确保本地壁纸和必应壁纸不同时开启
    if (this.localBackground) {
      this.changeLocalBackground(this.localBackground);
    } else {
      this.changeBackground(this.savedBack);
    }


    this.changeApi(this.customApi);
    this.changeBackground(this.savedBack);
    this.updateBackgroundColor(this.backColor);
    this.changeLocalBackground(this.localBackground);
  }
};
</script>

<style scoped>
/* 设置区域 */
.setting {
  position: absolute;
  display: flex;
  flex-direction: column;
  left: 10px;
  top: 10px;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 3px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
}


.settingImg {
  margin: 3px;
  width: 30px;
  height: 30px;
  transition: transform 0.2s ease;
  user-select: none;
}

.settingImg:hover {
  transform: scale(1.03);
}

.settingBox {
  border-radius: 12px;
  padding: 0 0 0 10px;
  color: var(--text-color);
}

.option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 290px;
}

.selectEngine {
  width: 290px;
  height: 30px;
  margin: 10px 0;
}

.optionText {
  font-size: 16px;
  color: #343a40;
  user-select: none;
}

.optionName {
  width: 290px;
  font-size: 13px;
  font-weight: 500;
  color: #343a40;
  margin: 5px;
  user-select: none;
}

.localBackground {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  border-radius: 12px;
  padding: 10px;
  background-color: #eee;
  width: 270px;
}

.allPhoto {
  display: flex;
  padding: 3px;

}

.photoList {
  width: 80px;
  height: 45px;
  border-radius: 9px;
  border: 2px solid white;
  transition: all 0.3s;
  text-align: center;
  line-height: 45px;
  font-size: 40px;
  color: white;
}

.photoList:hover {
  transform: scale(1.08);
}

.customApi {
  border-radius: 12px;
  padding: 10px;
  width: 270px;
  background-color: #eeeeee;
}

.customApiOption {
  width: 270px;
  height: 25px;
  margin-bottom: 2px;
}

.saveButton {
  height: 36px;
  width: 290px;
  border-radius: 6px;
  font-size: 16px;
  margin-top: 10px;
  background-color: #409efe;
  color: #ffffff;
  border: none;
  transition: background-color 0.3s ease;
}

.saveButton:hover {
  background-color: #1d82ed;
}

.otherName {
  width: 270px;
  margin-top: 10px;
  font-size: 13px;
  font-weight: 400;
  color: #495057;
  user-select: none;
  border-radius: 12px;
  padding: 10px;
  background-color: #eee;
}

:root {
  --primary-color: #007bff;
  --text-color: #343a40;
  --background-color: #f8f9fa;
}
</style>