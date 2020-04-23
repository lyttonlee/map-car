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
        path: '/vq',
        name: '系统看板',
        component: () => import(/* webpackChunkName: "about" */ '../views/VQ.vue'),
        meta: {
          auth: true,
          icon: 'zx-vq',
          role: ['SuperAdmin', 'VQ', 'PC']
        }
      },
      {
        path: '/home',
        name: '车辆列表',
        component: Home,
        meta: {
          auth: true,
          icon: 'zx-map',
          role: ['SuperAdmin', 'VQ', 'PC', 'PA', 'WE', 'AF', 'PQ']
        }
      },
      {
        path: '/workshop',
        name: '维修科室',
        component: () => import(/* webpackChunkName: "workshop" */ '../views/WorkShop.vue'),
        meta: {
          auth: true,
          icon: 'zx-gongyejichulingjian',
          role: ['PA', 'WE', 'AF', 'PQ']
        }
      },
      {
        path: '/alarm',
        name: '告警管理',
        component: () => import(/* webpackChunkName: "alarm" */ '../views/alarm/Alarm.vue'),
        redirect: '/alarm/list',
        meta: {
          auth: true,
          icon: 'zx-alarm',
          role: ['SuperAdmin', 'VQ', 'PC']
        },
        children: [
          {
            path: '/alarm/list',
            name: '告警列表',
            component: () => import(/* webpackChunkName: "alarm" */ '../views/alarm/AlarmList.vue'),
            meta: {
              auth: true,
              icon: 'zx-alarm',
              role: ['SuperAdmin', 'VQ', 'PC', 'VQ-PDA', 'PA', 'WE', 'AF', 'PQ']
            },
          },
          {
            path: '/alarm/config',
            name: '告警配置',
            component: () => import(/* webpackChunkName: "alarm" */ '../views/alarm/AlarmConfig.vue'),
            meta: {
              auth: true,
              icon: 'zx-tongji1',
              role: ['SuperAdmin', 'VQ', 'PC', 'VQ-PDA', 'PA', 'WE', 'AF', 'PQ']
            },
          },
        ],
      },
      {
        path: '/statement',
        name: '系统报表',
        redirect: '/statement/statistics',
        component: () => import(/* webpackChunkName: "statement" */ '../views/statement/Statement.vue'),
        meta: {
          auth: true,
          icon: 'zx-tongji1',
          role: ['SuperAdmin', 'VQ', 'PC', 'VQ-PDA']
        },
        children: [
          {
            path: '/statement/statistics',
            name: '报表统计',
            component: () => import(/* webpackChunkName: "statement" */ '../views/statement/cars/Statistics.vue'),
            meta: {
              auth: true,
              icon: 'zx-tongji1',
              role: ['SuperAdmin', 'VQ', 'PC', 'VQ-PDA']
            }
          },
          {
            path: '/statement/cars',
            name: '车辆记录',
            component: () => import(/* webpackChunkName: "cars" */ '../views/statement/cars/Cars.vue'),
            meta: {
              auth: true,
              icon: 'zx-cheliang',
              role: ['SuperAdmin', 'VQ', 'PC', 'VQ-PDA']
            }
          },
        ]
      },
      {
        path: '/system',
        name: '系统管理',
        redirect: '/system/user',
        component: () => import(/* webpackChunkName: "system" */ '../views/system/System.vue'),
        meta: {
          auth: true,
          icon: 'zx-xitongguanli-',
          role: ['SuperAdmin', 'VQ', 'PC', 'VQ-PDA', 'PA', 'WE', 'AF', 'PQ']
        },
        children: [
          {
            path: '/system/user',
            name: '用户管理',
            component: () => import(/* webpackChunkName: "system" */ '../views/system/user/User.vue'),
            meta: {
              auth: true,
              icon: 'zx-renyuanguanli',
              role: ['SuperAdmin', 'VQ', 'PC', 'PA', 'WE', 'AF', 'PQ']
            }
          },
          {
            path: '/system/device',
            name: '标签管理',
            component: () => import(/* webpackChunkName: "system" */ '../views/system/device/Device.vue'),
            meta: {
              auth: true,
              icon: 'zx-biaoqianguanli',
              role: ['SuperAdmin', 'VQ', 'PC', 'VQ-PDA']
            }
          },
          {
            path: '/system/baseStation',
            name: '基站管理',
            component: () => import(/* webpackChunkName: "system" */ '../views/system/baseStation/BaseStation.vue'),
            meta: {
              auth: true,
              icon: 'zx-jizhanguanli',
              role: ['SuperAdmin', 'VQ', 'PC', 'VQ-PDA']
            }
          },
          {
            path: '/system/logs',
            name: '系统日志',
            component: () => import(/* webpackChunkName: "system" */ '../views/system/logs/Logs.vue'),
            meta: {
              auth: true,
              icon: 'zx-xitongrizhi',
              role: ['SuperAdmin', 'VQ', 'PC', 'VQ-PDA']
            }
          },
          // {
          //   path: '/system/option',
          //   name: '系统设置',
          //   component: () => import(/* webpackChunkName: "system" */ '../views/system/option/Option.vue'),
          //   meta: {
          //     auth: true,
          //     icon: 'zx-tongji1',
          //     role: ['SuperAdmin', 'VQ', 'PC']
          //   }
          // },
        ]
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
