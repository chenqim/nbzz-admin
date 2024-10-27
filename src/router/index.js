import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: '总览', icon: 'dashboard' }
    }]
  },

  {
    path: '/production',
    component: Layout,
    // redirect: '/production/list',
    name: 'Production',
    meta: { title: '生产管理', icon: 'iconfont icon-shengchanguanli' },
    redirect: 'noRedirect',
    children: [
      {
        path: 'workOrder',
        name: 'WorkOrder',
        component: () => import('@/views/workOrder/index'),
        redirect: '/production/workOrder/list',
        children: [
          {
            path: 'list',
            name: 'WorkOrderList',
            component: () => import('@/views/workOrder/list'),
            meta: { title: '工单管理', icon: 'iconfont icon-gongdan' }
          },
          {
            path: 'detail/:id',
            name: 'WorkOrderDetail',
            component: () => import('@/views/workOrder/detail'),
            hidden: true,
            meta: {
              title: '工单详情',
              activeMenu: '/production/workOrder/list'
            }
          }
        ]
      },
      {
        path: 'manufacturing',
        name: 'Manufacturing',
        component: () => import('@/views/manufacturing/index'),
        children: [
          {
            path: 'list',
            name: 'ManufacturingList',
            component: () => import('@/views/manufacturing/list'),
            meta: { title: '制造执行', icon: 'iconfont icon-zhizaozhixing' }
          }
        ]
      }
    ]
  },

  {
    path: '/factory',
    component: Layout,
    redirect: '/factory/product',
    name: 'Factory',
    meta: { title: '工厂建模', icon: 'iconfont icon-shujujianmo' },
    children: [
      {
        path: 'category',
        name: 'Category',
        component: () => import('@/views/category/index'),
        children: [
          {
            path: 'list',
            name: 'CategoryList',
            component: () => import('@/views/category/list'),
            meta: { title: '产品类别管理', icon: 'iconfont icon-chanpinliebie' }
          }
        ]
      },
      {
        path: 'product',
        name: 'Product',
        component: () => import('@/views/product/index'),
        children: [
          {
            path: 'list',
            name: 'ProductList',
            component: () => import('@/views/product/list'),
            meta: { title: '产品管理', icon: 'iconfont icon-chanpin' }
          }
        ]
      },
      {
        path: 'process',
        name: 'Process',
        component: () => import('@/views/process/index'),
        children: [
          {
            path: 'list',
            name: 'ProcessList',
            component: () => import('@/views/process/list'),
            meta: { title: '工序管理', icon: 'iconfont icon-gongxu' }
          }
        ]
      },
      {
        path: 'stage',
        name: 'Stage',
        component: () => import('@/views/stage/index'),
        children: [
          {
            path: 'list',
            name: 'StageList',
            component: () => import('@/views/stage/list'),
            meta: { title: '中转区管理', icon: 'iconfont icon-zhongzhuanqu' }
          }
        ]
      }
    ]
  },

  {
    path: '/system',
    component: Layout,
    redirect: '/system/staff',
    name: 'System',
    meta: { title: '系统管理', icon: 'el-icon-s-tools' },
    children: [
      {
        path: 'staff',
        name: 'Staff',
        component: () => import('@/views/staff/index'),
        // meta: { title: '员工管理', icon: 'user' },
        children: [
          {
            path: 'list',
            name: 'StaffList',
            component: () => import('@/views/staff/list'),
            meta: { title: '员工管理', icon: 'el-icon-user-solid' }
          }
        ]
      }
    ]
  },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
