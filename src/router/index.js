import { createRouter, createWebHistory } from "vue-router";
import aiSearch from "../views/aiSearch.vue";
import AiPrompt from "../components/AiPrompt.vue";
import Ai from "../components/Ai.vue";
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
      component: SearchBox,
      component: SettingBox,
    },
  },
  {
    path: "/ai",
    name: "aiSearch",
    component: aiSearch,
  },
  {
    path: "/any",
    name: "AI",
    component: Ai,
    children: {
      component: AiPrompt,
      component: SettingBox,
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
