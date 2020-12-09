import axios from 'axios'
/**
 * Leansite Paas平台和用户中心接口api
 */
const interface_s = {
    baseURL: 'http://192.168.2.163:10051/', //非生产环境
    cloudUrl: 'http://192.168.2.161/cloud/#/', //云端链接
    // prodBaseURL: window.configs.leansiteAPI,//生产环境nop  cloudUrl
    // prodCloudUrl: window.configs.cloudUrl,
    //登录模块
    getTenantCode: 'getTenantCode', //获取租户编号
    login: "login", //登录
    logout: 'logout', //退出登录
    //信息总览
    compNowAndBefore: 'graphicStatistics/getTodayEnergyPKYesterdayEnergy', //节能对比
    monthEnergy: 'graphicStatistics/getEveryDayEnergyByCurrentMonth', //当月能耗
    getInfo: 'graphicStatistics/getLightEnergyAndlightCount', //获取今日能耗、昨日能耗、总能耗、灯在线数、离线数
    runTime: 'graphicStatistics/getSystemRunTime', //运行时长
    getLightIsOnLIne: 'graphicStatistics/getLightTotalAndOnlineCount', //获取在线设备及总设备
    getTodayEnergyAndYesdayEnergy: 'graphicStatistics/getTodayEnergyAndYesdayEnergy', //获取昨日及今日能耗
    getEnergyTotal: 'graphicStatistics/getEnergyTotal',

    setLedsStatus: 'led/openOrCloseLed', // 批量设置灯状态
    setLedsBrightness: 'led/setLedBrightness', // 批量设置灯亮度
    dataSync: 'dataSync/sync', //同步数据
    dataClean: 'initDB/cleanData', //清除数据
    getAreaList: 'led/findAreasByLed', // 获取区域列表
    seachDataByNeeds: 'monitoringLog/findPageList', //活动日志
    instructionLog: 'led/findLedRecord', //指令日志
    brightnessShow: '/led/brightnessShow',
    getEnerySaveing: 'graphicStatistics/lightEconomyTotal', //累计节省能耗
    showIconSize: '/led/showIconSize',// 修改灯设备
    //定时控制
    getTaskByPage: 'scheduler/findTaskSchedulerList', //获取定时任务数据
    startTask: 'scheduler/startTask', //启用任务
    stopTask: 'scheduler/stopTask', //禁用任务
    getTaskLogByPage: 'scheduler/selectTaskSchedulerLogList', //获取定时任务执行结果
    findLedsByArea: '/led/findLedsByArea',
    groupList: '/group/findGroupList',
    //常量对象
    constObj: {
        pageIndex: 1,
        pageSize: 10,
        requestFilter: [ //拦截器不拦截的请求集合
            'getTenantCode', //获取租户编号
            'login' //登录
        ],
        vueFilter: [ //拦截器不拦截的vue界面集合
        ],
        projectName: 'localControl-', //用户本地存储添加前缀
    }
}
//配置生产环境和非生产环境之间的切换
if (process.env.NODE_ENV == 'development') { //非生产环境
    interface_s.baseURL = interface_s.baseURL;
    interface_s.cloudUrl = interface_s.cloudUrl;

} else if (process.env.NODE_ENV == 'production') { //生产环境
    interface_s.baseURL = interface_s.prodBaseURL;
    interface_s.cloudUrl = interface_s.prodCloudUrl;
}
export default interface_s;
