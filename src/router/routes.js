import Home from '../views/Home.vue'
import Layout from '@/layout/Layout'
export const routes = [
  {
    path: '/login',
    name: '登录',
    component: () => import(/* webpackChunkName: "about" */ '../views/Login.vue'),
    meta: {
      auth: false
    }
  },
  {
    path: '/',
    name: 'pages',
    component: Layout,
    redirect: '/home',
    children: [
      {
        path: '/home',
        name: '车辆列表',
        component: Home,
        meta: {
          auth: true,
          icon: 'zx-map',
          role: ['SuperAdmin', 'VQ', 'PC', 'VQ-PDA', 'PA', 'WE', 'AF', 'PQ']
        }
      },
      {
        path: '/vq',
        name: '系统看板',
        component: () => import(/* webpackChunkName: "about" */ '../views/VQ.vue'),
        meta: {
          auth: true,
          icon: 'zx-pinzhibaozhengQuality',
          role: ['SuperAdmin', 'VQ', 'PC', 'VQ-PDA']
        }
      },
      // {
      //   path: '/pq',
      //   name: 'PQ总装品质科',
      //   component: () => import(/* webpackChunkName: "about" */ '../views/PA.vue'),
      //   meta: {
      //     auth: true,
      //     icon: 'zx-zuhejiekou',
      //     role: ['admin']
      //   }
      // },
      // {
      //   path: '/af',
      //   name: 'AF涂装品质科',
      //   component: () => import(/* webpackChunkName: "about" */ '../views/PA.vue'),
      //   meta: {
      //     auth: true,
      //     icon: 'zx-tongji',
      //     role: ['admin']
      //   }
      // },
      // {
      //   path: '/we',
      //   name: 'WE焊装品质科',
      //   component: () => import(/* webpackChunkName: "about" */ '../views/PA.vue'),
      //   meta: {
      //     auth: true,
      //     icon: 'zx-weldingmask',
      //     role: ['admin']
      //   }
      // },
      // {
      //   path: '/pa',
      //   name: 'PA零件品质科',
      //   component: () => import(/* webpackChunkName: "about" */ '../views/PA.vue'),
      //   meta: {
      //     auth: true,
      //     icon: 'zx-gongyejichulingjian',
      //     role: ['admin']
      //   }
      // },
      // {
      //   path: '/stat',
      //   name: '报表统计',
      //   component: () => import(/* webpackChunkName: "about" */ '../views/Stat.vue'),
      //   meta: {
      //     auth: true,
      //     icon: 'zx-tongji1',
      //     role: ['admin']
      //   }
      // },
      {
        path: '/device',
        name: '标签管理',
        component: () => import(/* webpackChunkName: "about" */ '../views/device/Device.vue'),
        meta: {
          auth: true,
          icon: 'zx-tongji1',
          role: ['SuperAdmin', 'VQ', 'PC', 'VQ-PDA', 'PA', 'WE', 'AF', 'PQ']
        }
      },
      {
        path: '/cars',
        name: '车辆管理',
        component: () => import(/* webpackChunkName: "cars" */ '../views/cars/Cars.vue'),
        meta: {
          auth: true,
          icon: 'zx-tongji1',
          role: ['SuperAdmin', 'VQ', 'PC', 'VQ-PDA', 'PA', 'WE', 'AF', 'PQ']
        }
      },
      {
        path: '/alarm',
        name: '告警管理',
        component: () => import(/* webpackChunkName: "about" */ '../views/alarm/Alarm.vue'),
        meta: {
          auth: true,
          icon: 'zx-tongji1',
          role: ['SuperAdmin', 'VQ', 'PC', 'VQ-PDA', 'PA', 'WE', 'AF', 'PQ']
        }
      },
      {
        path: '/user',
        name: '用户管理',
        component: () => import(/* webpackChunkName: "about" */ '../views/user/User.vue'),
        meta: {
          auth: true,
          icon: 'zx-tongji1',
          role: ['SuperAdmin', 'VQ', 'PC']
        }
      },
      {
        path: '/system',
        name: '系统管理',
        component: () => import(/* webpackChunkName: "system" */ '../views/system/System.vue'),
        meta: {
          auth: true,
          icon: 'zx-tongji1',
          role: ['SuperAdmin', 'VQ', 'PC', 'VQ-PDA', 'PA', 'WE', 'AF', 'PQ']
        }
      },
      {
        path: '/fence',
        name: '围栏管理',
        component: () => import(/* webpackChunkName: "fence" */ '../views/fence/Fence.vue'),
        meta: {
          auth: true,
          icon: 'zx-tongji1',
          role: ['SuperAdmin']
        }
      },
      // {
      //   path: '/car',
      //   name: '车辆列表',
      //   component: () => import(/* webpackChunkName: "about" */ '../views/Car.vue'),
      //   meta: {
      //     auth: true,
      //     icon: 'zx-tongji1',
      //     role: ['admin']
      //   }
      // }
    ]
  },
  {
    path: '/unauth',
    name: '访问权限',
    component: () => import(/* webpackChunkName: "about" */ '../views/UnAuth.vue'),
    meta: {
      auth: false
    }
  }
]

export const asyncRoutes = [
  {
    path: '/user',
    name: '用户管理',
    component: () => import(/* webpackChunkName: "about" */ '../views/user/User.vue'),
    meta: {
      auth: true,
      icon: 'zx-tongji1',
      role: ['SuperAdmin', 'PC', 'VQ']
    }
  }
]
