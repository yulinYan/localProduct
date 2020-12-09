import Vue from 'vue'
import VueRouter from 'vue-router'
const routerPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
    return routerPush.call(this, location).catch(error => error)
}
import api from "../common/api.js"
import store from '../store/index.js';
Vue.use(VueRouter);
const login = () => import('@/views/login.vue');
const index = () => import('@/views/index.vue');
const error404 = () => import('@/views/404.vue');
const lightOverview =() => import('@/views/lightOverview/LightOverview.vue');
const lightControl = () => import('@/views/lightControl/LightControl.vue');
const timingControlList = () => import('@/views/lightControl/TimingControlList.vue');
const dataSync = () => import('@/views/dataSync/DataSync.vue')
const runningLogs = () => import('@/views/RunningLogs/RunningLogs.vue')
const instructionLog = ()=> import('@/views/InstructionLog/InstructionLog.vue')

// end
const routes = [
	{
        name: 'login',
        path: "/login",
        component: login,
        meta: {
            title: '登录',
            requiresAuth: false //是否登录验证
        }
    },
    {
        name: 'index',
        path: '/',
        component: index,
        meta: {
            title: '首页',
            requiresAuth: true
        }
    },
    //智慧照明模块
    {
        name: 'lightOverview',
        path: '/lightOverview',
        component: lightOverview,
        meta: {
            title: '指标总览',
            requiresAuth: true
        },
    }, {
        name: 'lightControl',
        path: '/lightControl',
        component: lightControl,
        meta: {
            title: '照明控制',
            requiresAuth: true
        },
    },
    {
        name: 'timingControlList',
        path: '/timingControlList',
        component: timingControlList,
        meta: {
            title: '定时控制',
            requiresAuth: true
        },
    },
    {
        name: 'dataSync',
        path: '/dataSync',
        component: dataSync,
        meta: {
            title: '数据更新',
            requiresAuth: true
        },
    },
    {
        name: 'runningLogs',
        path: '/runningLogs',
        component: runningLogs,
        meta: {
            title: '灯具状态',
            requiresAuth: true  
        },
    },{
        name: 'instructionLog',
        path: '/instructionLog',
        component: instructionLog,
        meta: {
            title: '指令日志',
            requiresAuth: true   
        },
    },
    {
        path: '/404',
        component: error404
    },
    {
        path: '*',
        redirect: {
            path: '/403'
        }
    }
]

// 实例化
let router = new VueRouter({
    mode: 'hash', //hash模式
    routes // （缩写）相当于 routes: routes
});
// 路由拦截
router.beforeEach((to, from, next) => {
    if (to.name === 'index' && from.name === "login") {
        next();
    } else {
        next();
    }
});
export default router
