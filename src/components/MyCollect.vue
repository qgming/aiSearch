<template>
  <div v-if="shouldShowCollect" class="collect-item" @click="hideContextMenu">
    <!-- 遍历收藏列表，生成每个收藏项 -->
    <div v-for="item in collectList" :key="item.id" class="collect-item-content" @click.stop="goToUrl(item.url)"
      @contextmenu.prevent="showContextMenu(item, $event)">
      <a :href="item.url" target="_blank" @click.prevent>
        <img :src="item.logo" alt="logo" />
        <span>{{ item.title }}</span>
      </a>
    </div>
    <!-- 添加收藏项按钮 -->
    <div class="add-collect-item" @click="showAddFormAtCursor($event)">+</div>
    <!-- 添加表单 -->
    <div v-if="showAddForm" class="add-form"
      :style="{ top: addFormPosition.top + 'px', left: addFormPosition.left + 'px' }">
      <span class="add-form-title">添加网站捷径</span>
      <input v-model="newItem.title" placeholder="名称" />
      <input v-model="newItem.url" placeholder="网址" />
      <button @click="addCollectItem">保存</button>
      <button @click="showAddForm = false">取消</button>
    </div>
    <!-- 上下文菜单 -->
    <div v-if="contextMenu.visible" class="context-menu"
      :style="{ top: contextMenu.top + 'px', left: contextMenu.left + 'px' }">
      <button @click="editCollectItem(contextMenu.item)">编辑</button>
      <button @click="showDeleteOption(contextMenu.item)">删除</button>
    </div>
    <!-- 编辑表单 -->
    <div v-if="showEditForm" class="edit-form" :style="{ top: contextMenu.top + 'px', left: contextMenu.left + 'px' }">
      <span class="edit-form-title">编辑网站捷径</span>
      <input v-model="editingItem.title" placeholder="名称" />
      <input v-model="editingItem.url" placeholder="网址" />
      <button @click="saveEditItem">保存</button>
      <button @click="cancelEditItem">取消</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MyCollect',
  data() {
    return {
      collectList: [], // 收藏列表
      showAddForm: false, // 是否显示添加表单
      newItem: { title: '', url: '', logo: '' }, // 新添加的收藏项
      contextMenu: {
        visible: false,
        top: 0,
        left: 0,
        item: null
      },
      editingItem: null, // 编辑中的收藏项
      showEditForm: false, // 是否显示编辑表单
      addFormPosition: {
        top: 0,
        left: 0
      }
    }
  },
  computed: {
    shouldShowCollect() {
      const switchCollect = JSON.parse(localStorage.getItem('switchCollect'));
      return switchCollect === null || switchCollect === true;
    }
  },
  methods: {
    // 获取初始收藏列表
    async getCollectList() {
      const initialList = [
        { id: 1, title: '热榜', url: 'https://rebang.today', logo: 'https://api.iowen.cn/favicon/rebang.today.png' },
        { id: 2, title: 'Google', url: 'https://www.google.com', logo: 'https://api.iowen.cn/favicon/www.google.com.png' },
        { id: 3, title: 'GitHub', url: 'https://www.github.com', logo: 'https://api.iowen.cn/favicon/www.github.com.png' },
        { id: 4, title: 'B站', url: 'https://www.bilibili.com', logo: 'https://api.iowen.cn/favicon/www.bilibili.com.png' },
        { id: 5, title: '智能体', url: 'https://www.jdwdai.com', logo: 'https://api.iowen.cn/favicon/www.jdwdai.com.png' },
        { id: 6, title: '影视', url: 'https://www.videolist.cn', logo: 'https://api.iowen.cn/favicon/www.videolist.cn.png' },
      ];
      this.collectList = initialList; // 将初始列表赋值给 collectList
      localStorage.setItem('collectList', JSON.stringify(initialList)); // 保存到本地存储
    },
    // 加载收藏列表
    loadCollectList() {
      const storedList = localStorage.getItem('collectList');
      if (storedList) {
        this.collectList = JSON.parse(storedList); // 从本地存储读取并赋值给 collectList
      } else {
        this.getCollectList(); // 如果没有本地存储，则获取初始列表
      }
    },
    // 跳转到指定URL
    goToUrl(url) {
      window.open(url, '_blank');
    },
    // 显示上下文菜单
    showContextMenu(item, event) {
      this.contextMenu.visible = true;
      this.contextMenu.top = event.clientY;
      this.contextMenu.left = event.clientX;
      this.contextMenu.item = item;
    },
    // 隐藏上下文菜单
    hideContextMenu() {
      this.contextMenu.visible = false;
    },
    // 编辑收藏项
    editCollectItem(item) {
      this.editingItem = { ...item }; // 确保编辑项包含所有属性
      this.contextMenu.visible = false; // 隐藏上下文菜单
      this.showEditForm = true; // 显示编辑表单
    },
    // 保存编辑项
    saveEditItem() {
      // 找到当前编辑项的索引
      const index = this.collectList.findIndex(item => item.id === this.editingItem.id);

      // 更新收藏列表中的项
      this.collectList[index] = {
        ...this.editingItem,
        logo: `https://api.iowen.cn/favicon/${this.editingItem.url.replace(/^https?:\/\//, '')}.png`
      };

      // 更新本地存储
      localStorage.setItem('collectList', JSON.stringify(this.collectList));

      // 重置编辑状态
      this.editingItem = null;
      this.showEditForm = false;
    },
    // 取消编辑
    cancelEditItem() {
      this.editingItem = null; // 隐藏编辑表单
      this.showEditForm = false; // 隐藏编辑表单
    },
    // 显示删除选项
    showDeleteOption(item) {
      const confirmDelete = confirm(`确定要删除 ${item.title} 吗？`);
      if (confirmDelete) {
        this.deleteCollectItem(item);
      }
    },
    // 删除收藏项
    deleteCollectItem(item) {
      this.collectList = this.collectList.filter(collectItem => collectItem.id !== item.id);
      localStorage.setItem('collectList', JSON.stringify(this.collectList)); // 更新本地存储
    },
    // 添加收藏项
    addCollectItem() {
      if (this.newItem.title && this.newItem.url) {
        // 检查并补充缺失的协议
        if (!/^https?:\/\//i.test(this.newItem.url)) {
          this.newItem.url = 'https://' + this.newItem.url;
        }
        const newId = this.collectList.length ? Math.max(...this.collectList.map(item => item.id)) + 1 : 1;
        this.newItem.id = newId;
        this.newItem.logo = `https://api.iowen.cn/favicon/${this.newItem.url.replace(/^https?:\/\//, '')}.png`;
        this.collectList.push({ ...this.newItem });
        localStorage.setItem('collectList', JSON.stringify(this.collectList)); // 更新本地存储
        this.showAddForm = false; // 隐藏表单
        this.newItem = { title: '', url: '', logo: '' }; // 重置新添加的收藏项
      }
    },
    // 在光标位置显示添加表单
    showAddFormAtCursor(event) {
      this.addFormPosition.top = event.clientY;
      this.addFormPosition.left = event.clientX;
      this.showAddForm = true;
    },
    hideForms(event) {
      if (!this.$el.contains(event.target)) {
        this.showAddForm = false;
        // this.showEditForm = false;
        this.contextMenu.visible = false;
      }
    }
  },
  mounted() {
    // 组件挂载时获取收藏列表
    this.loadCollectList();
    document.addEventListener('click', this.hideForms);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.hideForms);
  }
}
</script>

<style scoped>
.collect-item {
  width: 550px;
  padding: 10px;
  display: flex;
  flex-wrap: wrap;
  margin-top: 20px;
}

.collect-item-content {
  text-align: center;
  width: 50px;
  height: 50px;
  background-color: rgba(255, 255, 255, 0.5);
  padding: 10px;
  margin: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  user-select: none;
  backdrop-filter: blur(10px);
}

.collect-item-content:hover {
  transform: translateY(-2px);
  transition: all 0.3s ease;
}

.collect-item-content img {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background-color: #fff;
}

.collect-item-content span {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  color: #333;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.collect-item-content a {
  text-decoration: none;
}

.add-collect-item {
  text-align: center;
  line-height: 50px;
  color: #333;
  /* 修改字体颜色为不突兀的颜色 */
  width: 50px;
  height: 50px;
  font-size: 40px;
  background-color: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  padding: 10px;
  margin: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  user-select: none;
}

.add-collect-item:hover {
  transform: translateY(-2px);
  transition: all 0.3s ease;
}

.add-form-title {
  font-size: 15px;
  font-weight: bold;
  margin-bottom: 10px;
  user-select: none;
}

.add-form {
  display: flex;
  flex-direction: column;
  margin-top: 10px;
  background-color: #fff;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  /* 新增z-index */
  position: absolute;
  /* 确保绝对定位 */
  user-select: none;
}

.add-form input {
  margin-bottom: 10px;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  transition: border-color 0.3s ease-in-out;
  /* 增加动画 */
}

.add-form input:focus {
  border-color: skyblue !important;
  /* 焦点时边框颜色变为天蓝色，使用!important确保优先级 */
}

.add-form button {
  margin-bottom: 5px;
  padding: 5px;
  border: 0;
  border-radius: 4px;
  background-color: #409efe;
  /* 按钮背景色变为天蓝色 */
  color: #fff;
  /* 文字颜色变为白色 */
  transition: background-color 0.3s ease-in-out;
  /* 增加动画 */
  user-select: none;
}

.add-form button:hover {
  background-color: skyblue;
  /* 悬停时背景色变浅 */
}

.context-menu {
  position: absolute;
  background: white;
  width: 60px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.context-menu button {
  display: block;
  width: 100%;
  padding: 5px;
  text-align: left;
  border: none;
  background: none;
  cursor: pointer;
}

.context-menu button:hover {
  background-color: #f0f0f0;
}

.edit-form {
  position: absolute;
  display: flex;
  flex-direction: column;
  margin-top: 10px;
  background-color: #fff;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  /* 新增z-index */
}

.edit-form-title {
  font-size: 15px;
  font-weight: bold;
  margin-bottom: 10px;
  user-select: none;
}

.edit-form input {
  margin-bottom: 10px;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  transition: border-color 0.3s ease-in-out;
}

.edit-form input:focus {
  border-color: skyblue !important;
}

.edit-form button {
  margin-bottom: 5px;
  padding: 5px;
  border: 0;
  border-radius: 4px;
  background-color: #409efe;
  color: #fff;
  transition: background-color 0.3s ease-in-out;
  user-select: none;
}

.edit-form button:hover {
  background-color: skyblue;
}

@media screen and (max-width: 768px) {
  .collect-item {
    width: 350px;
  }

  .collect-item-content {
    width: 40px;
    height: 40px;
    margin: 5px;
  }

  .collect-item-content img {
    width: 24px;
    height: 24px;
  }

  .add-collect-item {
    width: 40px;
    height: 40px;
    margin: 5px;
    line-height: 40px;
    font-size: 30px;
  }
}
</style>