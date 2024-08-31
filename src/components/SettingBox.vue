<template>
  <div class="setting">
    <!-- 设置图标 -->
    <img class="settingImg" @click="toggleSettingBox" src="../assets/icons/setting.svg" alt="设置">
    <!-- 设置面板 -->
    <div class="settingBox" v-if="showSettingBox">
      <ul>
        <!-- 必应壁纸开关 -->
        <li class="option">
          <span class="optionText">必应壁纸</span>
          <el-switch v-model="savedBack" @change="changeBackground" size="large" />
        </li>
        <!-- 网站捷径开关 -->
        <li class="option">
          <span class="optionText">网站捷径</span>
          <el-switch v-model="savedCollect" @change="changeCollect" size="large" />
        </li>
        <!-- 背景颜色选择器 -->
        <li class="option">
          <span class="optionText">背景颜色</span>
          <el-color-picker v-model="backColor" @change="updateBackgroundColor" />
        </li>
        <!-- 默认搜索引擎选择 -->
        <li>
          <div class="optionName">默认搜索</div>
          <el-select class="selectEngine" v-model="selectedEngine" placeholder="选择搜索引擎" size="large">
            <el-option v-for="item in options" :key="item.name" :label="item.name" :value="item.url" />
          </el-select>
        </li>
        <!-- API设置 -->
        <li>
          <div class="optionName">APIKEY</div>
          <el-input class="selectEngine" v-model="apiKey" placeholder="sk-" />
        </li>
        <li>
          <div class="optionName">API网站</div>
          <el-input class="selectEngine" v-model="apiWebsite" placeholder="https://" />
        </li>
        <li>
          <div class="optionName">API模型</div>
          <el-input class="selectEngine" v-model="apiModel" placeholder="gpt-3.5-turbo" />
        </li>
        <!-- 版本信息 -->
        <li>
          <div class="optionName">©️极点维度 V0.4.1</div>
        </li>
        <!-- 保存按钮 -->
        <li>
          <el-button class="saveButton" type="primary" @click="saveSettings" plain>保存</el-button>
        </li>
      </ul>
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
      apiModel: 'gpt-3.5-turbo',
      savedBack: false,
      savedCollect: false,
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

      this.showMessage();
      this.refreshPage();
    },

    // 切换背景
    changeBackground(value) {
      if (value) {
        document.body.style.backgroundImage = `url("https://bing.ee123.net/img/")`;
        document.body.style.backgroundColor = '';
      } else {
        this.updateBackgroundColor(this.backColor);
      }
      // 更新本地存储的值
      localStorage.setItem('switchBack', JSON.stringify(value));
    },

    // 更新背景颜色
    updateBackgroundColor(color) {
      if (!this.savedBack) {
        document.body.style.backgroundImage = '';
        document.body.style.backgroundColor = color;
      }
    },

    // 切换网站捷径
    changeCollect(value) {
      if (value) {
        this.savedCollect = true;
      } else {
        this.savedCollect = false;
      }
      // 更新本地存储的值
      localStorage.setItem('switchCollect', JSON.stringify(value));
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
    this.apiWebsite = localStorage.getItem("apiWebsite") || '';
    this.apiModel = localStorage.getItem("apiModel") || 'gpt-3.5-turbo';
    this.backColor = localStorage.getItem("backColor") || '#f9f9f9';
    this.selectedEngine = localStorage.getItem("searchEngine") || this.options[6].url;

    // 检查并设置必应壁纸和网站捷径的初始值
    const savedBack = localStorage.getItem('switchBack');
    if (savedBack !== null) {
      this.savedBack = JSON.parse(savedBack);
    } else {
      this.savedBack = true; // 第一次设置为 true
      localStorage.setItem('switchBack', JSON.stringify(this.savedBack));
    }

    const savedCollect = localStorage.getItem('switchCollect');
    if (savedCollect !== null) {
      this.savedCollect = JSON.parse(savedCollect);
    } else {
      this.savedCollect = true; // 第一次设置为 true
      localStorage.setItem('switchCollect', JSON.stringify(this.savedCollect));
    }

    this.changeBackground(this.savedBack);
    this.updateBackgroundColor(this.backColor);
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
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 10px;
  color: var(--text-color);
}

.option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 38px;
  width: 280px;
  margin-bottom: 10px;
}

.selectEngine {
  width: 280px;
  height: 30px;
  margin-bottom: 10px;
}

.optionText {
  font-size: 16px;
  color: #343a40;
  user-select: none;
}

.optionName {
  font-size: 14px;
  font-weight: 500;
  color: #495057;
  margin: 5px 0;
}

.saveButton {
  height: 38px;
  width: 100%;
  border-radius: 6px;
  font-size: 16px;
  background-color: #007bff;
  color: #ffffff;
  border: none;
  transition: background-color 0.3s ease;
}

.saveButton:hover {
  background-color: #0056b3;
}

:root {
  --primary-color: #007bff;
  --text-color: #343a40;
  --background-color: #f8f9fa;
}

.el-select,
.el-input {
  margin-bottom: 10px;
}

.el-switch__core {
  background-color: #ced4da !important;
}

.el-switch.is-checked .el-switch__core {
  background-color: var(--primary-color) !important;
}
</style>