import { createRouter, createWebHashHistory } from "vue-router";
import { loadDynamicRoutes } from "./dynamic"

const routes = [
    {
        path: "/login",
        component: () => import('@/views/login/index.vue')
    },
    {
        path: "/",
        name: "Home",
        component: () => import('@/views/layout/index.vue'),
        redirect: "/welcome",
        children: [
            {
            path: "welcome",
            component: () => import('@/views/home/index.vue')
            }
        ] 
    },
   
   
   
   
]
const router = createRouter({
     history: createWebHashHistory(),
  routes: routes,
});

let dynamicRoutesLoaded = false; // 是否已加载过动态路由

router.beforeEach(async (to, from, next) => {
  const whiteList = ['/login'];
  const isLoggedIn = !!sessionStorage.getItem('user');

  // ✅ 如果是白名单页面，直接放行
  if (whiteList.includes(to.path)) {
    return next();
  }

  // ✅ 如果已登录
  if (isLoggedIn) {
    // 如果动态路由还没加载，则加载一次
    if (!dynamicRoutesLoaded) {
      try {
        await loadDynamicRoutes();
        dynamicRoutesLoaded = true;
        console.log('✅ 动态路由首次加载成功');

        // 保证当前跳转路径能匹配上新添加的路由
        return next({ ...to, replace: true });
      } catch (err) {
        console.error('❌ 动态路由加载失败:', err);
      }
    }

    return next(); // 已加载过，正常进入
  }

  // 未登录则跳转登录页
  next('/login');
});


export default router;