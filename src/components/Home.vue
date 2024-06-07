<template>
  <div class="home">
    <SearchBox />
    <SettingBox />
  </div>
</template>

<script>
import SearchBox from './SearchBox.vue';
import SettingBox from './SettingBox.vue';

export default {
  components: {
    SearchBox,
    SettingBox
  }
};
</script>

<style scoped>
/* 在这里添加主页的样式 */
</style>