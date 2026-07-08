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
  }

  // 404 page must be placed at the end !!!
  // { path: '*', redirect: '/404', hidden: true }
]

export const asyncRoutes = [
  {
    path: '/production',
    component: Layout,
    // redirect: '/production/list',
    name: 'Production',
    meta: { title: '生产管理', icon: 'iconfont icon-shengchanguanli', roles: ['Admin', 'Boss', 'Leader', 'Clerk', 'Sales', 'Drafter'] },
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
            meta: { title: '工单', icon: 'iconfont icon-gongdan', roles: ['Admin', 'Boss', 'Leader', 'Clerk', 'Sales', 'Drafter'] }
          },
          {
            path: 'detail/:id',
            name: 'WorkOrderDetail',
            component: () => import('@/views/workOrder/detail'),
            hidden: true,
            meta: {
              title: '工单详情',
              activeMenu: '/production/workOrder/list',
              roles: ['Admin', 'Boss', 'Leader', 'Clerk', 'Sales', 'Drafter']
            }
          }
        ]
      },
      {
        path: 'product',
        name: 'Product',
        component: () => import('@/views/product/index'),
        redirect: '/production/product/list',
        children: [
          {
            path: 'list',
            name: 'ProductList',
            component: () => import('@/views/product/list'),
            meta: { title: '产品', icon: 'iconfont icon-chanpin', roles: ['Admin', 'Boss', 'Clerk', 'Sales', 'Drafter'] }
          },
          {
            path: 'detail/:id',
            name: 'ProductDetail',
            component: () => import('@/views/product/detail'),
            hidden: true,
            meta: {
              title: '产品详情',
              activeMenu: '/production/product/list',
              roles: ['Admin', 'Boss', 'Clerk', 'Sales', 'Drafter']
            }
          }
        ]
      }
    ]
  },

  {
    path: '/client',
    component: Layout,
    // redirect: '/client/customer',
    name: 'Client',
    meta: { title: '客户管理', icon: 'el-icon-s-custom', roles: ['Admin', 'Boss', 'Clerk', 'Sales', 'Drafter'] },
    redirect: 'noRedirect',
    children: [
      {
        path: 'customer',
        name: 'Customer',
        component: () => import('@/views/customer/index'),
        redirect: '/client/customer/list',
        children: [
          {
            path: 'list',
            name: 'CustomerList',
            component: () => import('@/views/customer/list'),
            meta: { title: '客户信息', icon: 'iconfont icon-customer', roles: ['Admin', 'Boss', 'Clerk', 'Sales', 'Drafter'] }
          },
          {
            path: 'detail/:id',
            name: 'CustomerDetail',
            component: () => import('@/views/customer/detail'),
            hidden: true,
            meta: {
              title: '客户详情',
              activeMenu: '/client/customer/list',
              roles: ['Admin', 'Boss']
            }
          }
        ]
      }
    ]
  },

  {
    path: '/factory',
    component: Layout,
    // redirect: '/factory/product',
    name: 'Factory',
    meta: { title: '工厂管理', icon: 'iconfont icon-shujujianmo', roles: ['Admin', 'Boss'] },
    redirect: 'noRedirect',
    children: [
      {
        path: 'staff',
        name: 'Staff',
        component: () => import('@/views/staff/index'),
        redirect: '/factory/staff/list',
        children: [
          {
            path: 'list',
            name: 'StaffList',
            component: () => import('@/views/staff/list'),
            meta: { title: '员工管理', icon: 'el-icon-user-solid', roles: ['Admin', 'Boss'] }
          }
        ]
      },
      {
        path: 'category',
        name: 'Category',
        component: () => import('@/views/category/index'),
        redirect: '/factory/category/list',
        children: [
          {
            path: 'list',
            name: 'CategoryList',
            component: () => import('@/views/category/list'),
            meta: { title: '产品类别管理', icon: 'iconfont icon-chanpinliebie', roles: ['Admin', 'Boss'] }
          }
        ]
      },
      {
        path: 'process',
        name: 'Process',
        component: () => import('@/views/process/index'),
        redirect: '/factory/process/list',
        children: [
          {
            path: 'list',
            name: 'ProcessList',
            component: () => import('@/views/process/list'),
            meta: { title: '工序管理', icon: 'iconfont icon-gongxu', roles: ['Admin', 'Boss'] }
          }
        ]
      },
      {
        path: 'stage',
        name: 'Stage',
        component: () => import('@/views/stage/index'),
        redirect: '/factory/stage/list',
        children: [
          {
            path: 'list',
            name: 'StageList',
            component: () => import('@/views/stage/list'),
            meta: { title: '中转区管理', icon: 'iconfont icon-zhongzhuanqu', roles: ['Admin', 'Boss'] }
          }
        ]
      }
    ]
  },

  {
    path: '/report',
    component: Layout,
    name: 'Report',
    meta: { title: '报表管理', icon: 'iconfont icon-baobiao', roles: ['Admin', 'Boss'] },
    children: [
      {
        path: 'workDetails',
        name: 'workDetails',
        component: () => import('@/views/workOrder/index'),
        redirect: '/production/workOrder/list',
        children: [
          {
            path: 'list',
            name: 'WorkDetailsList',
            component: () => import('@/views/workOrder/work-details'),
            meta: { title: '明细管理', icon: 'iconfont icon-mingxi', roles: ['Admin', 'Boss'] }
          }
        ]
      }
    ]
  },

  {
    path: '/memo',
    component: Layout,
    name: 'Memo',
    meta: { title: '备忘录', icon: 'el-icon-notebook-2', roles: ['Admin', 'Boss', 'Leader', 'Clerk', 'Sales', 'Drafter'] },
    redirect: '/memo/list',
    children: [
      {
        path: 'list',
        name: 'MemoList',
        component: () => import('@/views/memo/index'),
        redirect: '/memo/list',
        children: [
          {
            path: '',
            name: 'MemoListPage',
            component: () => import('@/views/memo/list'),
            meta: { title: '备忘列表', icon: 'el-icon-notebook-2', roles: ['Admin', 'Boss', 'Leader', 'Clerk', 'Sales', 'Drafter'] }
          },
          {
            path: 'detail/:id',
            name: 'MemoDetail',
            component: () => import('@/views/memo/detail'),
            hidden: true,
            meta: {
              title: '备忘详情',
              activeMenu: '/memo/list',
              roles: ['Admin', 'Boss', 'Leader', 'Clerk', 'Sales', 'Drafter']
            }
          }
        ]
      }
    ]
  },

  {
    path: '/system',
    component: Layout,
    name: 'System',
    meta: { title: '系统设置', icon: 'el-icon-s-tools', roles: ['Admin'] },
    redirect: 'noRedirect',
    children: [
      {
        path: 'accessLog',
        name: 'AccessLog',
        component: () => import('@/views/system/index'),
        redirect: '/system/accessLog/list',
        children: [
          {
            path: 'list',
            name: 'AccessLogList',
            component: () => import('@/views/system/accessLog/list'),
            meta: { title: '操作日志', icon: 'el-icon-document', roles: ['Admin'] }
          },
          {
            path: 'detail',
            name: 'AccessLogDetail',
            component: () => import('@/views/system/accessLog/detail'),
            hidden: true,
            meta: {
              title: '日志详情',
              activeMenu: '/system/accessLog/list',
              roles: ['Admin']
            }
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
