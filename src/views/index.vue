<template>
    <el-container class="indexCenterHome">
        <el-header>
            <img src="../assets/img/daohang-logo.png" alt="平台logo">
            <span>智慧照明管理平台</span>
            <div style="float:right" class="headerRight">
                <span style="color:rgb(31, 127, 231);cursor:pointer; " @click="toCloud">访问云端</span>
                <span>{{name}}</span>
                <span>{{time1}}</span>
                <span style="cursor: context-menu;" @click='logIsShowCLick'>{{time2}}</span>
                <span><img src="../assets/img/tuichu.png" @click='outLoginClick' alt="退出登录图标"> </span>
            </div>
        </el-header>
        <el-container class="platformContainer">
            <el-tabs type="border-card" tab-position="left" :before-leave="beforeLeave">
                <el-tab-pane v-for="(aside,index) in asideList" :key="aside.name+index">
                    <div slot="label">
                        <img :src="activeIndex == index ? aside.icon[1] : aside.icon[0]" alt="菜单图标">
                        <label style="color: #1F7FE7;"
                            :class="[activeIndex == index ? 'type1':'' ]">{{aside.name}}</label>
                    </div>
                    <el-row v-if="activeIndex == index">
                        <el-col :span="24">
                            <currMenu :key="aside.name+index"></currMenu>
                        </el-col>
                    </el-row>
                </el-tab-pane>
            </el-tabs>

        </el-container>
    </el-container>
</template>

<script>
	import Bus from '../common/bus.js'
    import Vue from 'vue'
    export default {
        name: 'index', //首页
        components: {

        },
        data() {
            return {
                cloudUrl:'',
                asideList: [//侧边栏菜单
                    {
                        icon: [
                            require('../assets/img/index/zhilingzonglan-wxz.png'),
                            require('../assets/img/index/zhilingzonglan-xz.png')
                        ],
                        name: '指标总览',
                        links: '/lightOverview',
                        powerName: 'tenant/view'
                    }, {
                        icon: [
                            require('../assets/img/index/zhaoming-wxz.png'),
                            require('../assets/img/index/zhaoming-xz.png')
                        ],
                        name: '照明控制',
                        links: '/lightControl',
                        powerName: 'tenant/view'
                    },
                    {
                        icon: [
                            require('../assets/img/index/dingshi-wxz.png'),
                            require('../assets/img/index/dingshi-xz.png')
                        ],
                        name: '定时控制',
                        links: '/timingControlList',
                        powerName: 'tenant/view'
                    },
                    {
                        icon: [
                            require('../assets/img/index/dengjuzhuangtai-wxz.png'),
                            require('../assets/img/index/dengjuzhuangtai-xz.png')
                        ],
                        name: '灯具状态',
                        links: '/runningLogs',
                        powerName: 'org/view'
                    },
                    {
                        icon: [
                            require('../assets/img/index/shujugengxin-wxz.png'),
                            require('../assets/img/index/shujugengxin-xz.png')
                        ],
                        name: '数据更新',
                        links: '/dataSync',
                        powerName: 'org/view'
                    },
                ],
                name: null,//登陆后显示用户名
                time1: null,
                time2: null,
                timer: null,//定时器
                activeIndex: 0,//点击当前元素的index
                userName: '',//导航栏中右侧用户名赋值
                LightConfigNum: 1,
                LightConfigTime: [],
            }
        },
        created() {
            this.loadComponent(this.asideList[0].links);//加载组件
        },
        mounted() {
            this.name = this.$store.getters['userCenter/getUser'].name;
            this.getCurrTimer();
            this.cloudUrl = this.API.leansite.cloudUrl
        },
        destroyed() {
            clearInterval(this.timer);
        },
        methods: {
            /**
             * 定时获取当前时间
             */
            getCurrTimer() {
                this.timer = setInterval(() => {
                    this.time1 = this.$moment(new Date()).format("YYYY.MM.DD");
                    this.time2 = this.$moment(new Date()).format("HH:mm:ss");
                }, 1000);
            },
            /**
             * 点击退出登录
             */
            outLoginClick() {
                this.$axios.leansite({
                    url: this.API.leansite.logout, //不需要再添加ip和端口
                    method: 'get', //提交方式：get和post，同 params 和 data配合使用
                }).then((res) => {
                    var resData = res.data;
                    let resCode = parseInt(resData.code);
                    if (resCode == 0) {
                        this.commonFun.againLogin();
                        this.$message({
                            type: 'info',
                            message: '已退出登录'
                        });
                    } else if (resData.code == 1000) {
                        this.$message({
                            type: 'error',
                            message: '用户编码获取失败：' + resData.msg
                        });
                    }
                })
            },
            headerRight() {

            },
            /**
             * 点击侧边栏
             */
            asideClick(index, links) {
                this.isActive = index;
                this.$router.push({
                    name: links
                });
            },
            /**
             *	tabs点击切换前
             */
            beforeLeave(activeName, oldActiveName) {
                this.activeIndex = activeName * 1;
                this.loadComponent(this.asideList[this.activeIndex].links);//加载组件
            },
            /**
             * 加载组件
             */
            loadComponent(componentPath) {
                let routers = this.$router.options.routes;
                let currComponent = '';
                for (let i = 0; i < routers.length; i++) {
                    if (componentPath == routers[i].path) {
                        currComponent = routers[i].component;
                        break;
                    }
                }
                Vue.component('currMenu', currComponent);
            },
            /**
             *连续点击出现隐藏页面
             */
            logIsShowCLick() {
                this.LightConfigTime.push(new Date().getTime());
                if (this.LightConfigTime.length >= 2 && this.LightConfigTime.length <= 5) {
                    if (this.LightConfigTime[this.LightConfigTime.length - 1] - this.LightConfigTime[this.LightConfigTime.length - 2] <= 500) {
                        this.LightConfigNum++;
                    } else {
                        this.LightConfigNum = 1;
                        this.LightConfigTime = [
                            this.LightConfigTime[this.LightConfigTime.length - 1]
                        ];
                    }
                } else if (this.LightConfigTime.length > 5) {
                    this.LightConfigNum = 1;
                    this.LightConfigTime = [];
                }
                if (this.LightConfigNum == 5&&this.asideList.length==5) {
                    var obj = {
                        icon: [
                            require('../assets/img/index/huodongrizhi-wxz.png'),
                            require('../assets/img/index/huodongrizhi-xz.png')
                        ],
                        name: '日         志',
                        links: '/instructionLog',
                        powerName: 'org/view'
                    }
                    this.asideList.push(obj)
                    this.$store.dispatch('userCenter/setShowCleanBtn', {
		              data: true
		            })
                    Bus.$emit("controlCleanBtn");
                }
            },
            /**
             * 点击访问云端 
            */
            toCloud(){
                window.open(this.cloudUrl) 
            }
        }
    }
</script>

<style lang="scss" scoped type="text/css">
    .indexCenterHome {
        /*height: 100vh;
        width: 100vw;*/
	    height: 1080px;
	    width: 1920px;
        overflow-y: auto;
        overflow-x: auto;

        .type1 {
            color: #323232 !important;
        }

        /deep/ .el-header {
            height: 48px !important;
            line-height: 48px !important;
            background-color: #323232;

            >img {
                /* max-width: 107px; */
                height:20px;
            }

            >span {
                margin-left: 31px;
                font-family: MicrosoftYaHei;
                font-size: 16px;
                font-weight: normal;
                font-stretch: normal;
                letter-spacing: 0px;
                color: #ffffff;

            }

            .headerRight {
                span {
                    margin: 0 10px;
                    color: #fff;

                    &:nth-child(2) {
                        margin-right: 5px;
                    }

                    &:nth-child(3) {
                        margin-left: 0;
                    }

                    &:last-child {
                        cursor: pointer;
                    }
                }
            }
        }

        .platformContainer {
            background-color: #fff;
            height: calc(100% - 60px);

            .el-tabs {
                width: 100%;
                overflow: hidden;

                .el-tabs__header {
                    width: 80px;
                }

                .el-tabs-pane {
                    background-color: #f0f0f0;
                }
            }
        }

        /deep/ .el-tabs--border-card {
            border: none;
            -webkit-box-shadow: none;
            box-shadow: none;
        }

        /deep/ .el-tabs--left .el-tabs__header {}

        /deep/ .el-tabs--left .el-tabs__header.is-left {
            margin-right: 0;
            width: 78px;
            background-color: #f0f0f0;
            border: none;
            border-right: solid 1px #b4b4b4;
        }

        /deep/ .el-tabs--left.el-tabs--border-card .el-tabs__item.is-left {
            height: 74px;
            line-height: 74px;
            color: #101010;
            padding: 0;
            display: flex;
            justify-content: center;

        }

        /deep/ .el-tabs--border-card>.el-tabs__content {
            background-color: #fff;
            padding: 0;
            min-height: calc(100% - 60px);
        }

        /deep/ .el-tabs--border-card>.el-tabs__header .el-tabs__item {
            border-left: solid 3px #f0f0f0;
            background-color: #f0f0f0;
            line-height: none;
            width: 78px;
            height: 74px;
        }

        /deep/ .el-tabs--border-card>.el-tabs__header .el-tabs__item div {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        /deep/ .el-tabs--border-card>.el-tabs__header .el-tabs__item div image {
            width: 20px;
            height: 20px;
        }

        /deep/ .el-tabs--border-card>.el-tabs__header .el-tabs__item div label {
            font-size: 12px;
            height: 30px;
            line-height: 38px;
            color: #595959;
        }

        /deep/ .el-tabs--border-card>.el-tabs__header .el-tabs__item.is-active {
            border-color: transparent transparent;
            border-left: solid 3px #006fe6;
            background-color: #ffffff;
            color: #006fe6;
        }
    }
</style>