<template @keyup="enterSearch">
  <transition name="fade">
    <div class="searchBox" ref="searchBox">
      <input class="searchInput" v-model="searchText" @keyup="enterSearch" type="text" placeholder="输入你想搜索的问题"
        ref="searchInput" @focus="isFocused = true">
      <div class="searchOption" v-show="isFocused">
        <div class="aSearch" @click="search">
          <img src="../assets/icons/search.svg" alt="普通搜索"><span>搜索</span>
        </div>
        <!-- <div class="aSearch" @click="searchAi">
          <img src="../assets/icons/searchai.svg" alt="大模型搜索"><span>AI搜索</span>
        </div> -->
        <div class="aSearch" @click="searchMetaso">
          <img src="../assets/icons/searchai.svg" alt="秘塔AI"><span>秘塔AI</span>
        </div>
        <div class="aSearch" @click="searchBing">
          <img src="../assets/icons/search.svg" alt="必应"><span>必应</span>
        </div>
        <div class="aSearch" @click="searchGoogle">
          <img src="../assets/icons/search.svg" alt="谷歌"><span>谷歌</span>
        </div>
        <div class="aSearch" @click="searchBaidu">
          <img src="../assets/icons/search.svg" alt="百度"><span>百度</span>
        </div>

        <!-- <div class="aSearch" @click="anyModel">
          <img src="../assets/icons/searchai.svg" alt="大模型工具"><span>AI工具</span>
        </div> -->
      </div>
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
      // url: localStorage.getItem('searchUrl'),
    };
  },
  methods: {
    enterSearch(event) {
      if (event.key === 'Enter') {
        this.search()
      }
    },
    search() {
      if (this.searchText === '') {
        this.showMessage();
      } else {
        window.open(this.url + this.searchText);
      }
    },
    searchAi() {
      // if (this.searchText === '') {
      //   this.showMessage();
      // } else {
      // 打开一个新的窗口，并将搜索文本作为查询参数传递
      // window.open(`/ai?q=${encodeURIComponent(this.searchText)}`, '_blank');
      window.open(`/ai`, '_blank');
      // }
    },

    //必应搜索
    searchBing() {
      if (this.searchText === '') {
        this.showMessage();
      } else {
        window.open('https://www.bing.com/search?q=' + this.searchText);
      }
    },
    //谷歌搜索
    searchGoogle() {
      if (this.searchText === '') {
        this.showMessage();
      } else {
        window.open('https://www.google.com/search?q=' + this.searchText);
      }
    },
    //百度搜索
    searchBaidu() {
      if (this.searchText === '') {
        this.showMessage();
      } else {
        window.open('https://www.baidu.com/s?wd=' + this.searchText);
      }
    },
    //秘塔AI搜索
    searchMetaso() {
      if (this.searchText === '') {
        this.showMessage();
      } else {
        window.open("https://metaso.cn/?q=" + this.searchText);
      }
    },

    //去其他页面（临时
    anyModel() {
      window.open(`/any`, '_blank');
    },
    showMessage() {
      this.$message({
        message: '请先输入内容！',
        type: 'warning'
      });
    },
    handleFocus() {
      document.body.classList.add('focused');
    },
    handleBlur() {
      document.body.classList.remove('focused');
    },
    handleDocumentClick(event) {
      // 检查点击的目标是否是searchBox内部的元素
      if (!this.$refs.searchBox.contains(event.target)) {
        this.isFocused = false;
      }
    },

  },
  mounted() {
    this.url = localStorage.getItem("searchEngine") || 'https://www.bing.com/search?q=';

    // 添加事件监听器
    this.$refs.searchInput.addEventListener('focus', this.handleFocus);
    this.$refs.searchInput.addEventListener('blur', this.handleBlur);
    // 添加全局点击事件监听器
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
  background-color: rgba(255, 255, 255, 0.9);
  /* backdrop-filter: blur(10px); */
  padding: 8px;
  border: 1px solid rgba(245, 246, 247, 0.6);
  box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
}

.searchBox:hover {
  border: 1px solid #f5f6f7;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
}

.searchInput {
  width: 550px;
  height: 40px;
  border: 0px;
  font-size: 16px;
  background: none;
  outline: none;
  color: black;
}

.searchOption {
  display: flex;
  flex-direction: row-reverse;
  padding: 1px;
}

.aSearch {
  display: flex;
  align-items: center;
  padding: 1px;
  margin-left: 8px;
  border: 1px solid #cee1fc;
  background-color: #ecf4ff;
  border-radius: 8px;
}

.aSearch:hover {
  background-color: #f9f9f9;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
}

.aSearch img {
  width: 15px;
  height: 15px;
  margin: 3px 0px 3px 3px;
}

.aSearch span {
  font-size: 14px;
  margin: 3px;
}

@media screen and (max-width: 768px) {
  /* body {
    background-image: url("https://bing.ee123.net/img/?w=768x1280");
  } */

  .searchInput {
    width: 350px;
    height: 30px;
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
</style>