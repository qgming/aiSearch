<template>
  <div class="setting">
    <img class="settingImg" @click="toggleSettingBox" src="../assets/icons/setting.svg" alt="设置">
    <div class="settingBox" v-if="showSettingBox">
      <li>
        <ol>
          <div class="optionName">必应壁纸</div>
        </ol>
        <ol>
          <div class="optionName">搜索引擎</div><input v-model="searchUrl" type="text"
            placeholder="https://www.bing.com/search?q=">
        </ol>
        <ol>
          <div class="optionName">APIKEY</div><input v-model="apiKey" type="text" placeholder="sk-">
        </ol>
        <ol>
          <div class="optionName">API网站</div><input v-model="apiWebsite" type="text" placeholder="https://">
        </ol>
        <ol>
          <div class="optionName">API模型</div><input v-model="apiModel" type="text" placeholder="gpt-3.5-turbo">
        </ol>
        <ol>
          <div class="optionName">Polar Dimension 0.0.3</div>
        </ol>
        <ol><button class="saveButton" v-on:click="saveButtonApi">保存</button></ol>
      </li>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showSettingBox: false,
      searchUrl: 'https://www.bing.com/search?q=',
      apiKey: '',
      apiWebsite: '',
      apiModel: 'gpt-3.5-turbo',
    };
  },
  methods: {
    toggleSettingBox() {
      this.showSettingBox = !this.showSettingBox;
    },
    saveButtonApi() {
      localStorage.setItem("apiKey", this.apiKey);
      localStorage.setItem("apiWebsite", this.apiWebsite);
      localStorage.setItem("apiModel", this.apiModel);
      localStorage.setItem("searchUrl", this.searchUrl);
      alert("保存成功!");
    },
  },
  mounted() {
    this.apiKey = localStorage.getItem("apiKey") || '';
    this.apiWebsite = localStorage.getItem("apiWebsite") || '';
    this.apiModel = localStorage.getItem("apiModel") || 'gpt-3.5-turbo';
    this.searchUrl = localStorage.getItem("searchUrl") || 'https://www.bing.com/search?q=';
  }
};
</script>

<style scoped>
/* 在这里添加你的样式 */
/* 设置区域 */
.setting {
  position: absolute;
  display: flex;
  flex-direction: column;
  left: 10px;
  top: 10px;
  background-color: white;
  border-radius: 12px;
  padding: 3px;
  border: 1px solid black;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
}

.settingImg {
  margin: 3px;
  width: 30px;
  height: 30px;
}

.settingBox {
  border-radius: 12px;
}

ol {
  padding: 5px;
  margin: 3px;
  border-radius: 6px;
}

.optionName {
  font-size: 14px;
  font-weight: 400;
  margin-bottom: 5px;
}

ol input {
  height: 30px;
  width: 300px;
  padding: 2px;
  border-radius: 6px;
  border: 1px solid #f5f6f7;
  background-color: white;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
}

.saveButton {
  height: 38px;
  width: 308px;
  border: 1px solid #f5f6f7;
  background-color: #f1f2f3;
  border-radius: 6px;
  font-size: 15px;
}

.saveButton:hover {
  background-color: #f9f9f9;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
}
</style>