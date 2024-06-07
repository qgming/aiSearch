import { createRouter, createWebHistory } from "vue-router";
import aiSearch from "../views/aiSearch.vue";
import ai from "../views/ai.vue";
import Home from "../components/Home.vue";
import SearchBox from "../components/SearchBox.vue";
import SettingBox from "../components/SettingBox.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: Home,
    // meta: {
    //   showSearchBox: true,
    //   showSettingBox: true,
    // },
    children: {
      component: SearchBox, // 子路由对应的组件
      component: SettingBox,
    },
  },
  {
    path: "/ai",
    name: "AI搜索",
    component: aiSearch,
  },
  {
    path: "/anyai",
    name: "AI",
    component: ai,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
