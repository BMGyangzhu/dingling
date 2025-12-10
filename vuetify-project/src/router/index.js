import { createWebHistory, createRouter } from "vue-router";
import Home from "@/view/home/index.vue";
const routes = [
  {
    path: "/test",
    component: () => import("@/components/test/index.vue"),
  },
  {
    path: "/message-center",
    component: () => import("@/view/message-center/index.vue"),
    props: (route) => ({
      toUserId: Number(route.query.toUserId),
      toUserAvatar: Number(route.query.toUserAvatar),
    }),
  },
  {
    path: "/",
    name: "Home",
    component: () => import("@/view/home/index.vue"),
  },
  {
    path: "/video",
    component: () => import("@/components/video/index.vue"),
  },
  {
    path: "/video/:classify",
    component: () => import("@/view/home/index.vue"),
    meta: {
      isClassify: true,
    },
  },
  {
    path: "/followVideo",
    component: () => import("@/view/followVideo/index.vue"),
  },
  {
    path: "/pushVideo",
    component: () => import("@/view/pushVideo/index.vue"),
  },
  {
    path: "/video/search/:key",
    component: Home,
    meta: {
      isSearch: true,
    },
  },
  {
    path: "/user",
    component: () => import("@/view/user/index.vue"),
    redirect: "/user/home",
    children: [
      {
        path: "home",
        component: () => import("@/view/user/home/index.vue"),
      },
      {
        path: "classify",
        component: () => import("@/view/user/classify/index.vue"),
      },
      {
        path: "video",
        component: () => import("@/view/user/creative-center/index.vue"),
      },
      {
        path: "favorites",
        component: () => import("@/view/user/favorites/index.vue"),
      },
      {
        path: "history",
        component: () => import("@/view/user/history/index.vue"),
      },
      {
        path: "like",
        component: () => import("@/view/user/follow-fans/index.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
});

export default router;
