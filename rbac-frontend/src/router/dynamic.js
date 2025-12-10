import router from './index'
import { apiGetMenus } from '../apis/permission'

function safeImportView(folderName) {
  return import(`@/views/${folderName}/index.vue`).catch(err => {
    console.warn(`⚠️ 页面 "@/views/${folderName}/index.vue" 加载失败:`, err);
    // 返回一个空组件，防止白屏
    return { template: '<div></div>' };
  });
}
function normalizeHref(href) {
  if (!href) return '';
  // 去掉开头和结尾多余的 /
  return href.replace(/^\/+|\/+$/g, '');
}
/**
 * 递归注册菜单为动态路由
 */
function addRoutesFromMenus(menus, parentName = 'Home') {
  menus.forEach(menu => {
    const folderName = normalizeHref(menu.href); 

    if (folderName) { // 过滤掉 href 是 '/' 或空的情况
      router.addRoute(parentName, {
        path: '/' + folderName, 
        name: folderName,
        component: () => safeImportView(folderName),
        meta: { title: menu.name, icon: menu.icon }
      });
    }

    if (menu.children && menu.children.length > 0) {
      addRoutesFromMenus(menu.children, parentName);
    }
  });
}

/**
 * 登录后加载动态路由
 */
export async function loadDynamicRoutes() {
    try {
        const res = await apiGetMenus()
        const menus = res.data || []

        addRoutesFromMenus(menus)

        // 缓存菜单树以便刷新恢复
        sessionStorage.setItem('menus', JSON.stringify(menus))
        console.log('✅ 动态路由加载完成')
    } catch (e) {
        console.error('❌ 加载动态菜单失败:', e)
    }
}