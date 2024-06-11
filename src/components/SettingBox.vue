<template>
  <div class="setting">
    <img class="settingImg" @click="toggleSettingBox" src="../assets/icons/setting.svg" alt="设置">
    <div class="settingBox" v-if="showSettingBox">
      <li>
        <ol>
          <!-- <van-cell-group>
            <van-cell title="单元格" value="内容" />
            <van-cell title="单元格" value="内容" label="描述信息" />
          </van-cell-group> -->
          <div class="option">
            <div class="optionText">必应壁纸</div>
            <el-switch v-model="savedBack" @change="changeBackground" @click="refreshPage" size="large" />
          </div>
        </ol>
        <ol>
          <div class="option">
            <div class="optionText">背景颜色</div>
            <el-color-picker v-model="backColor" />
          </div>
        </ol>
        <ol>
          <div class="optionName">搜索引擎</div>
          <el-select class="selectEngine" v-model="selectedEngine" placeholder="选择搜索引擎" size="large">
            <el-option v-for="item in options" :key="item.name" :label="item.name" :value="item.url" />
          </el-select>
        </ol>
        <ol>
          <div class="optionName">APIKEY</div>
          <el-input class="selectEngine" v-model="apiKey" placeholder="sk-" />
        </ol>
        <ol>
          <div class="optionName">API网站</div>
          <el-input class="selectEngine" v-model="apiWebsite" placeholder="https://" />
        </ol>
        <ol>
          <div class="optionName">API模型</div>
          <el-input class="selectEngine" v-model="apiModel" placeholder="gpt-3.5-turbo" />
        </ol>
        <ol>
          <div class="optionName">Polar Dimension 0.1.0</div>
        </ol>
        <ol>
          <!-- <van-button class="saveButton" plain type="primary" v-on:click="saveButtonApi"
            @click="showMessage">保存</van-button> -->
          <el-button class="saveButton" type="primary" v-on:click="saveButtonApi" @click="showMessage"
            plain>保存</el-button>
        </ol>
      </li>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
export default {
  data() {
    return {
      showSettingBox: false,
      searchUrl: '',
      apiKey: '',
      apiWebsite: '',
      apiModel: 'gpt-3.5-turbo',
      savedBack: false,
      backColor: '#f9f9f9',
      selectedEngine: ref(null),// 添加到 data 函数中
      options: [
        { name: 'Google', url: 'https://www.google.com/search?q=' },
        { name: 'Bing', url: 'https://www.bing.com/search?q=' },
        { name: 'Baidu', url: 'https://www.baidu.com/s?wd=' },
        { name: 'Polar AI', url: 'https://s.videolist.cn/ai?q=' },
        { name: 'bilibili', url: 'https://search.bilibili.com/all?keyword=' },
        // 添加更多搜索引擎选项
      ],
    };
  },

  methods: {
    //设置页面显示与隐藏
    toggleSettingBox() {
      this.showSettingBox = !this.showSettingBox;
    },
    //保存设置的数据
    saveButtonApi() {
      localStorage.setItem("apiKey", this.apiKey);
      localStorage.setItem("apiWebsite", this.apiWebsite);
      localStorage.setItem("apiModel", this.apiModel);
      localStorage.setItem("searchEngine", this.selectedEngine);
      localStorage.setItem("backColor", this.backColor);
      // this.refreshPage()
      // alert("保存成功!");
    },
    //切换背景
    changeBackground(value) {
      if (value) {
        // this.$refs.bgBox.style.backgroundImage = `url("https://bing.ee123.net/img/")`;
        document.body.style.backgroundImage = `url("https://bing.ee123.net/img/")`;
        // document.body.backgroundSize = 'cover';
        // document.body.backgroundPosition = 'center';
      } else {
        document.body.backgroundColor = this.backColor;
      }
      localStorage.setItem('switchBack', JSON.stringify(value));
      // location.reload();
    },
    //刷新页面
    refreshPage() {
      location.reload();
    },
    showMessage() {
      this.$message({
        message: '保存成功！',
        type: 'success'
      });
    },
  },
  mounted() {
    this.apiKey = localStorage.getItem("apiKey") || '';
    this.apiWebsite = localStorage.getItem("apiWebsite") || '';
    this.apiModel = localStorage.getItem("apiModel") || 'gpt-3.5-turbo';
    this.backColor = localStorage.getItem("backColor") || '#f9f9f9';

    // 从 localStorage 中获取保存的选定的搜索引擎的 URL
    const searchEngine = localStorage.getItem("searchEngine");
    if (searchEngine) {
      this.selectedEngine = searchEngine
    } else {
      // 如果没有保存的值，则默认选中第一个搜索引擎
      this.selectedEngine = this.options[4];
    }

    const savedBack = localStorage.getItem('switchBack');
    if (savedBack !== null) {
      this.savedBack = JSON.parse(savedBack);
      this.changeBackground(this.savedBack);
    }
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
  background-color: white;
  border-radius: 12px;
  padding: 3px;
  /* border: 1px solid black; */
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

.option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 38px;
  width: 280px;
}

.selectEngine {
  width: 280px;
  /* border-radius: 16px; */
  height: 30px;
}

.optionText {
  font-size: 16px;
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

.saveButton {
  height: 38px;
  width: 280px;
  border-radius: 6px;
  font-size: 18px;
}
</style>