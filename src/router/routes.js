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
          icon: 'zx-VQ',
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
        path: '/alarm',
        name: '告警管理',
        component: () => import(/* webpackChunkName: "alarm" */ '../views/alarm/Alarm.vue'),
        redirect: '/alarm/list',
        meta: {
          auth: true,
          icon: 'zx-alarm',
          role: ['SuperAdmin', 'VQ', 'PC', 'VQ-PDA', 'PA', 'WE', 'AF', 'PQ']
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
        redirect: '/statement/cars',
        component: () => import(/* webpackChunkName: "statement" */ '../views/statement/Statement.vue'),
        meta: {
          auth: true,
          icon: 'zx-tongji1',
          role: ['SuperAdmin', 'VQ', 'PC', 'VQ-PDA', 'PA', 'WE', 'AF', 'PQ']
        },
        children: [
          {
            path: '/statement/cars',
            name: '车辆记录',
            component: () => import(/* webpackChunkName: "cars" */ '../views/statement/cars/Cars.vue'),
            meta: {
              auth: true,
              icon: 'zx-tongji1',
              role: ['SuperAdmin', 'VQ', 'PC', 'VQ-PDA', 'PA', 'WE', 'AF', 'PQ']
            }
          },
        ]
      },
      {
        path: '/system',
        name: '系统管理',
        redirect: '/system/device',
        component: () => import(/* webpackChunkName: "system" */ '../views/system/System.vue'),
        meta: {
          auth: true,
          icon: 'zx-xitongguanli-',
          role: ['SuperAdmin', 'VQ', 'PC', 'VQ-PDA', 'PA', 'WE', 'AF', 'PQ']
        },
        children: [
          {
            path: '/system/device',
            name: '标签管理',
            component: () => import(/* webpackChunkName: "system" */ '../views/system/device/Device.vue'),
            meta: {
              auth: true,
              icon: 'zx-tongji1',
              role: ['SuperAdmin', 'VQ', 'PC', 'VQ-PDA', 'PA', 'WE', 'AF', 'PQ']
            }
          },
          {
            path: '/system/baseStation',
            name: '基站管理',
            component: () => import(/* webpackChunkName: "system" */ '../views/system/baseStation/BaseStation.vue'),
            meta: {
              auth: true,
              icon: 'zx-tongji1',
              role: ['SuperAdmin', 'VQ', 'PC', 'VQ-PDA', 'PA', 'WE', 'AF', 'PQ']
            }
          },
          {
            path: '/system/user',
            name: '用户管理',
            component: () => import(/* webpackChunkName: "system" */ '../views/system/user/User.vue'),
            meta: {
              auth: true,
              icon: 'zx-renyuanguanli',
              role: ['SuperAdmin', 'VQ', 'PC']
            }
          },
          {
            path: '/system/logs',
            name: '系统日志',
            component: () => import(/* webpackChunkName: "system" */ '../views/system/logs/Logs.vue'),
            meta: {
              auth: true,
              icon: 'zx-tongji1',
              role: ['SuperAdmin', 'VQ', 'PC', 'VQ-PDA', 'PA', 'WE', 'AF', 'PQ']
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
