<template>
  <div class="home">
    <SearchBox />
    <MyCollect />
    <SettingBox />
  </div>
</template>

<script>
import SearchBox from './SearchBox.vue';
import SettingBox from './SettingBox.vue';
import MyCollect from './MyCollect.vue';

export default {
  components: {
    SearchBox,
    SettingBox,
    MyCollect
  }
};
</script>

<style scoped>
/* 在这里添加主页的样式 */
</style>