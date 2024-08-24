<template>
  <transition name="fade">
    <div class="searchBox" ref="searchBox" :class="{ 'expanded': isFocused }">
      <!-- 搜索输入框 -->
      <input class="searchInput" v-model="searchText" @keyup="enterSearch" type="text" placeholder="输入你想搜索的问题"
        ref="searchInput" @focus="onFocus">
      <!-- 搜索选项 -->
      <transition name="slide-fade">
        <div class="searchOption" v-if="isFocused">
          <!-- 默认搜索 -->
          <div class="aSearch" @click="search">
            <img src="../assets/icons/search.svg" alt="普通搜索"><span>搜索</span>
          </div>
          <!-- AI搜索 -->
          <div class="aSearch" @click="searchAI">
            <img src="../assets/icons/searchai.svg" alt="AI"><span>极点AI</span>
          </div>
          <!-- 秘塔AI搜索 -->
          <div class="aSearch" @click="searchMetaso">
            <img src="../assets/icons/searchai.svg" alt="秘塔AI"><span>秘塔AI</span>
          </div>
          <!-- 必应搜索 -->
          <div class="aSearch" @click="searchBing">
            <img src="../assets/icons/search.svg" alt="必应"><span>必应</span>
          </div>
          <!-- 谷歌搜索 -->
          <div class="aSearch" @click="searchGoogle">
            <img src="../assets/icons/search.svg" alt="谷歌"><span>谷歌</span>
          </div>
          <!-- 百度搜索 -->
          <div class="aSearch" @click="searchBaidu">
            <img src="../assets/icons/search.svg" alt="百度"><span>百度</span>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script>
export default {
  data() {
    return {
      searchText: '',
      url: '',
      isFocused: false,
    };
  },
  methods: {
    // 处理回车键搜索
    enterSearch(event) {
      if (event.key === 'Enter') {
        this.search()
      }
    },
    // 默认搜索方法
    search() {
      if (this.searchText === '') {
        this.showMessage();
      } else {
        window.open(this.url + this.searchText);
      }
    },
    // 极点AI
    searchAI() {
      this.$router.push({ path: '/ai', query: { q: this.searchText } });
    },
    // 必应搜索
    searchBing() {
      this.performSearch('https://www.bing.com/search?q=');
    },
    // 谷歌搜索
    searchGoogle() {
      this.performSearch('https://www.google.com/search?q=');
    },
    // 百度搜索
    searchBaidu() {
      this.performSearch('https://www.baidu.com/s?wd=');
    },
    // 秘塔AI搜索
    searchMetaso() {
      this.performSearch('https://metaso.cn/?q=');
    },
    // 通用搜索方法
    performSearch(searchUrl) {
      if (this.searchText === '') {
        this.showMessage();
      } else {
        window.open(searchUrl + this.searchText);
      }
    },
    // 显示警告消息
    showMessage() {
      this.$message({
        message: '请先输入内容！',
        type: 'warning'
      });
    },
    // 处理输入框聚焦
    handleFocus() {
      document.body.classList.add('focused');
    },
    // 处理输入框失焦
    handleBlur() {
      document.body.classList.remove('focused');
    },
    // 处理文档点击事件
    handleDocumentClick(event) {
      if (!this.$refs.searchBox.contains(event.target)) {
        this.isFocused = false;
      }
    },
    // 处理输入框聚焦
    onFocus() {
      this.isFocused = true;
    },
  },
  mounted() {
    // 从本地存储获取默认搜索引擎，如果没有则使用必应
    this.url = localStorage.getItem("searchEngine") || 'https://www.bing.com/search?q=';

    // 添加事件监听器
    this.$refs.searchInput.addEventListener('focus', this.handleFocus);
    this.$refs.searchInput.addEventListener('blur', this.handleBlur);
    document.addEventListener('click', this.handleDocumentClick);
  },
  beforeUnmount() {
    // 在组件卸载时移除事件监听器
    this.$refs.searchInput.removeEventListener('focus', this.handleFocus);
    this.$refs.searchInput.removeEventListener('blur', this.handleBlur);
    document.removeEventListener('click', this.handleDocumentClick);
  },
};
</script>

<style scoped>
.searchBox {
  margin-top: 250px;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.98);
  padding: 8px;
  border: 1px solid rgba(200, 200, 200, 0.3);
  box-shadow: rgba(0, 0, 0, 0.05) 0px 4px 12px 0px;
  transition: all 0.3s ease;
  height: 40px;
  overflow: hidden;
}

.searchBox.expanded {
  height: 70px;
}

.searchBox:hover {
  border: 1px solid rgba(180, 180, 180, 0.5);
  box-shadow: rgba(0, 0, 0, 0.1) 0px 6px 16px 0px;
  transform: translateY(-2px);
}

.searchInput {
  width: 550px;
  height: 40px;
  border: 0px;
  font-size: 16px;
  line-height: 40px;
  background: none;
  outline: none;
  color: black;
  transition: all 0.3s ease;
  padding: 0 10px;
}

.searchInput:focus {
  transform: scale(1.02);
}

.expanded .searchInput {
  padding-bottom: 0;
}

.searchOption {
  display: flex;
  flex-direction: row-reverse;
  /* padding: 1px; */
}

.aSearch {
  display: flex;
  align-items: center;
  padding: 1px;
  margin-left: 8px;
  border: 1px solid #e0e0e0;
  background-color: #f5f5f5;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.aSearch:hover {
  background-color: #ffffff;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 8px 0px;
  transform: translateY(-1px);
}

.aSearch img {
  width: 15px;
  height: 15px;
  margin: 3px 0px 3px 3px;
  transition: transform 0.2s ease;
}

.aSearch:hover img {
  transform: scale(1.1);
}

.aSearch span {
  font-size: 14px;
  margin: 3px;
  transition: color 0.2s ease;
}

.aSearch:hover span {
  color: #4a90e2;
}

@media screen and (max-width: 768px) {
  .searchInput {
    width: 350px;
    height: 40px;
    transition: all 0.3s ease;
  }

  .searchBox.expanded {
    height: 70px;
  }


  .aSearch {
    padding: 1px;
  }

  .aSearch img {
    width: 12px;
    height: 12px;
    margin: 1px 0px 1px 1px;
  }

  .aSearch span {
    margin: 1px;
  }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>