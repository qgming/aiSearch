<template>
  <div class="ai">
    <AiPrompt />
    <SettingBox />
  </div>
</template>

<script>
import AiPrompt from './AiPrompt.vue'
import SettingBox from './SettingBox.vue';

export default {
  components: {
    SettingBox,
    AiPrompt,
  }
};
</script>

<style scoped>
/* 在这里添加主页的样式 */
</style>