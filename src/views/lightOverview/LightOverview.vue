<template>
  <div class="fill" style="height: calc(100vh - 46px); overflow: auto;">
  <div class="LightOverview">
    <!-- 头部 -->
    <ul class="msg">
      <li v-for="(item,index) in msg" :key="index">
        <p v-if="index==0" >
          <span class="iconfont leansite-dian" style="color:#A781FF;margin-left:-20px" alt=""></span> {{item.name}}
        </p>
        <p v-if="index==1">
          <i class="iconfont leansite-dian" style="color: #A781FF;margin-left:-20px" alt=""></i> {{item.name}}
        </p>
        <p v-if="index==2">
          <i class="iconfont leansite-zongnenghao" style="color: #FFC800;margin-left:-20px" alt=""></i> {{item.name}}
        </p>
        <p v-if="index==3">
          <i class="iconfont leansite-jiesheng" style="color: #A781FF;margin-left:-20px" alt=""></i> {{item.name}}
        </p>
        <p v-if="index==4">
          <i class="iconfont leansite-shouye-deng" style="color: #3D59C4;margin-left:-20px" alt=""></i> {{item.name}}
        </p>
        <p v-if="index==5">
          <i class="iconfont leansite-2-dingshi" style="color: #323232;margin-left:-20px" alt=""></i> {{item.name}}
        </p>
        <p style="color: #969696;">{{item.englishName}}</p>
        <div v-if="index==4">
          {{item.num}}<i>/</i><span>{{item.unit}}</span>
        </div>
        <div v-else-if="index!=5" >
          {{item.num}}<span>{{item.unit}}</span>
        </div>
        <div v-if="index==5">
          {{item.num[0]}}<span>天</span>{{item.num[1]}}<span>时</span>{{item.num[2]}}<span>分</span>
        </div>
        <!-- <div v-else>
          {{item.num}}
        </div> -->
      </li>
    </ul>
    <div>
      <!-- 中间节能对比 -->
      <div class="overview">
        <p class="header"><span>节能对比</span></p>
        <div id="energyCompared" class="energyCompared"></div>
      </div>
      <!-- 底部当月能耗 -->
      <div class="overview">
        <p class="header"> <span>当月能耗</span>
          <div class="block">{{chooseMonth}}</div>
          <div class="block" v-show="false">
              <el-date-picker
                v-model="chooseMonth"
                type="month"
                @change='handleMonth'
                value-format="yyyy-MM"
                placeholder="选择月"
                :picker-options="pickerOptions">
              </el-date-picker>
            </div>
        </p>
        <div id="energyDay" class="energyDay"></div>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
  import echarts from 'echarts';
  export default {
    name: "LightOverview",
    data() {
      return {
        chooseMonth: '',//日期选择器 
        todayEnergy: 0.038,  //今日能耗
        yesterdayEnergy: 0.414,//昨日能耗
        lightEnergyTotal: 2413.702,//总能耗
        lightTotal: 75, //设备总数
        lightOnlineCount: 5,//在线设备数
        websock: null,
        elapsedTime: {
          elapsedDay: '0',
          elapsedHour: '0',
          elapsedMin: '0',
        },
        msg: [{
          'name': "今日能耗",
          'englishName':"Today's energy consumption" ,
          'num': 0,
          'unit': 'kW·h',
          'detailed': '',
          'arrow': 'down',
          'img': 'gonglv'
        }, {
          'name': "昨日能耗",
          'englishName':"Energy consumption yesterday" ,
          'num': 0,
          'unit': 'kW·h',
          'detailed': '',
          'arrow': 'down',
          'img': 'gonglv'
        }, {
          'name': "总能耗",
          'englishName':"Total energy consumption" ,
          'num': 0,
          'unit': 'kW·h',
          'detailed': '',
          'arrow': 'down',
          'img': 'nenghao'
        }, {
          'name': "累计节省",
          'englishName':"Cumulative energy saving" ,
          'num': 0,
          'unit': '度电',
          'detailed': '',
          'arrow': 'down',
          'img': 'gonglv'
        }, {
          'name': "开灯/总数",
          'englishName':"Lights on / Total" ,
          'num': '0',
          'unit': '0',
          'detailed': '',
          'img': 'shebei'
        },{
          'name': "运行时间",
          'englishName':"Running time" ,
          'num': [0,0,0],
          'unit': '',
          'detailed': '',
          'img': 'time'
        }],
        option: {
          color: ['#3c70d7', '#7ea6f2', '#b6d2f3', '#7DE5D2', '#FEAE7B', '#003399', '#3366cc', '#0087cb', '#3399ff', '#017890', '#587498', '#74828f', '#666633', '#99cccc', '#a1bad0', '#c25b56', '#ff9933', '#d0a727', '#f9ca79', '#d9ccb9'],
          tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(240, 244, 251, 0.8)',
            textStyle: {
              color: '#505050',
              fontFamily: 'Microsoft YaHei',
              align: 'left'
            },
            axisPointer: {
              type: 'line'
            }
          },
          legend: {
            type: 'scroll',
            width: '70%',
            data: [],
            icon: 'line',
            textStyle: {
              fontSize: '14px',
              fontFamily: 'Microsoft YaHei',
            },
            itemGap: 30,
            x:"center",
            y:"93.6%",
          },
          grid: {
            left: '40px',
            right: '26px',
            bottom: '40px',
            top: '50px'
          },
          dataset: {
            // 提供一份数据。
            source: []
          },
          xAxis: {
            type: 'category',
            nameGap: 10,
            // data: [],
            boundaryGap: false,
            axisLabel: {
              color: '#505050'
            },
            axisTick: {
              show: false,
              alignWithLabel: false
            },
            name: ''
          },
          yAxis: {
            name: 'kW·h',
            nameTextStyle: {
              // align: 'left',
              fontFamily: 'Microsoft YaHei',
              align: 'right'
            },
            type: 'value',
            nameGap: 20,
            axisLine: {
              show: false
            },
            axisLabel: {
              color: '#505050',
              margin: 40,
              align: 'left'
            },
            splitLine: {
              lineStyle: {
                color: '#eee'
              }
            },
            axisTick: {
              show: true,
              lineStyle: {
                color: '#eee'
              }
            }
          },
          series: [],
        },
        optionWeek: {
          color: ['#3c70d7', '#7ea6f2', '#b6d2f3', '#7DE5D2', '#FEAE7B', '#003399', '#3366cc', '#0087cb', '#3399ff', '#017890', '#587498', '#74828f', '#666633', '#99cccc', '#a1bad0', '#c25b56', '#ff9933', '#d0a727', '#f9ca79', '#d9ccb9'],
          tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(240, 244, 251, 0.8)',
            textStyle: {
              color: '#505050',
              fontFamily: 'Microsoft YaHei',
              align: 'left'
            },
            axisPointer: {
              type: 'line'
            }
          },
          legend: {
            type: 'scroll',
            width: '70%',
            data: [],
            icon: 'pin',
            textStyle: {
              fontSize: '14px',
              fontFamily: 'Microsoft YaHei',
            },
            itemGap: 30,
            right: 10,
            top: '10px',
          },
          grid: {
            left: '40px',
            right: '26px',
            bottom: '40px',
            top: '50px'
          },
          dataset: {
            // 提供一份数据。
            source: []
          },
          xAxis: {
            type: 'category',
            nameGap: 10,
            data: null,
            boundaryGap: true,
            axisLabel: {
              color: '#505050'
            },
            axisTick: {
              show: false,
              alignWithLabel: false
            },
            name: ''
          },
          yAxis: {
            name: 'kW·h',
            nameTextStyle: {
              // align: 'left',
              fontFamily: 'Microsoft YaHei',
              align: 'right'
            },
            type: 'value',
            nameGap: 20,
            axisLine: {
              show: false
            },
            axisLabel: {
              color: '#505050',
              margin: 40,
              align: 'left'
            },
            splitLine: {
              lineStyle: {
                color: '#eee'
              }
            },
            axisTick: {
              show: true,
              lineStyle: {
                color: '#eee'
              }
            }
          },
          series: [],
        },
        destroyFlag: false, //切换页面清除定时器
        energyCompared: null, //节能对比
        get24HourCharts: null,
        destroyFlag24Hour: false, //当天能耗清除定时器
        // energyAllWeek: '',
        energyWeek: null,
        destroyFlagStrategy: false, //当天能耗清除定时器
        strategyArr: [],
        tableHeight: 0,
        pickerOptions: {  //设置本月之后的不能选
          disabledDate(date) {
            function myMonth(year, month) {
              let d = new Date(year, month, 0);
              return d.getDate();
            };
            //a 是举例的，大家可以尝试一下
            let time;
            let dateNow = new Date();
            if (dateNow.getMonth() != 0) {
              time = dateNow.getFullYear() + '-' + (dateNow.getMonth() + 1) + '-' + myMonth(dateNow.getFullYear(), dateNow.getMonth());
            } else {
              time = dateNow.getFullYear() - 1 + '-' + 12 + '-' + myMonth(dateNow.getFullYear(), 12);
            }
            let newDate = new Date(time).getTime();
            return date && date.valueOf() > newDate;
          }
        },
      };
    },
    methods: {
      handleMonth(val) {
        this.get24Hour()
      },

      /**
			 * 设备数及在线数  头部
			 */
      getLightIsOnLIne() {
        this.$axios.leansite({
          url: this.API.leansite.getLightIsOnLIne,
          method: 'get',
        }).then((res) => {
          var resData = res.data;
          if (resData.code == 0) {
            this.msg[4].num = resData.data.lightOnLineCount; //在线设备
            this.msg[4].unit = resData.data.lightTotal;//总设备
          } else if (resData.code == 1000) {
            this.$message({
              type: 'error',
              message: '信息获取失败：' + resData.msg
            });
          }
        })
      },
      /**
			 * 总能耗  头部
			 */
      getEnergyTotal() {
        this.$axios.leansite({
          url: this.API.leansite.getEnergyTotal,
          method: 'get',
        }).then((res) => {
          var resData = res.data;
          if (resData.code == 0) {
            if(resData.data.energyTotal<100){
              this.msg[2].num = resData.data.energyTotal.toFixed(2)
            }else{
              this.msg[2].num = Math.round(resData.data.energyTotal);  //总能耗  
            }
          } else if (resData.code == 1000) {
            this.$message({
              type: 'error',
              message: '信息获取失败：' + resData.msg
            });
          }
        })
      },
      /**
			 * 昨天以及今日能耗  头部
			 */
      getTodayEnergyAndYesdayEnergy() {
        this.$axios.leansite({
          url: this.API.leansite.getTodayEnergyAndYesdayEnergy,
          method: 'get',
        }).then((res) => {
          var resData = res.data;
          if (resData.code == 0) {
            if (resData.data.todayEnergy == null) {
              resData.data.todayEnergy = 0
            }
            if (resData.data.yesterdayEnergy == null) {
              resData.data.yesterdayEnergy = 0
            }
            this.msg[0].num = resData.data.todayEnergy.toFixed(2);  //今日能耗
            this.msg[1].num = resData.data.yesterdayEnergy.toFixed(2);
          } else if (resData.code == 1000) {
            this.$message({
              type: 'error',
              message: '信息获取失败：' + resData.msg
            });
          }
        })
      },
      //运行时间
      getTime() {
        this.$axios.leansite({
          url: this.API.leansite.runTime,
          method: 'get',
        }).then((res) => {
          var resData = res.data;
          if (resData.code == 0) {
            var day = 0;
            var minute = 0;
            var hour = 0;
            this.msg[5].num=[]
            if(resData.data.split("天").length>1){
              this.msg[5].num=[]
              day = resData.data.split("天")[0]
              hour = resData.data.split("天")[1].split("时")[0]
              minute = resData.data.split("天")[1].split("时")[1].split("分")[0]
              
            }else{
              day = 0
              if(resData.data.split("时").length>1){
                hour = resData.data.split("时")[0]
                minute = resData.data.split("时")[1].split("分")[0]
              }else{
                hour = 0
                if(resData.data.split("分").length>1){
                  minute = resData.data.split("分")[0]
                }else{
                  minute = 0
                }
              }
            }
              this.msg[5].num.push(day)
              this.msg[5].num.push(hour)
              this.msg[5].num.push(minute)
            // this.msg[5].num = day+hour+minute
          } else if (resData.code == 1000) {
            this.$message({
              type: 'error',
              message: '查询失败：' + resData.msg
            });
          }
        })
      },
      getEnerySaveing(){
        this.$axios.leansite({
          url: this.API.leansite.getEnerySaveing,
          method: 'get',
        }).then((res) => {
          var resData = res.data;
          if (resData.code == 0) {
            this.msg[3].num = resData.data.toFixed(2) 
            if(resData.data>9999){
              this.msg[3].num = (resData.data/10000).toFixed(2) 
            this.msg[3].unit = "万度电";
           }
          } else if (resData.code == 1000) {
            this.$message({
              type: 'error',
              message: '查询失败：' + resData.msg
            });
          }
        })
      },
      getElapsedTime() {
        let _this = this
        if (!_this.destroyFlag) {
          _this.time = setTimeout(() => {
            // _this.getTopInfo()
            _this.getLightIsOnLIne()
            _this.getTodayEnergyAndYesdayEnergy()
            _this.getEnergyTotal()
            _this.getTime()
            _this.getEnerySaveing()
          }, 60000)
        }
      },
      // 节能对比
      getEnergyCompared() {
        let yesTodayObj = {};
        let todayObj = {};
        let yesTodayNum = 0;
        let todayNum = 0;
        let yesTodayArr = [];
        let todayArr = [];
        if (!this.destroyFlag) {
          this.$axios.leansite({
            method: 'GET',
            url: this.API.leansite.compNowAndBefore
          }).then((res) => {
            var resData = res.data;
            if (resData.code == 0) {
              if (!this.destroyFlag) {
                setTimeout(() => {
                  this.getEnergyCompared();
                }, 60000)
              }
              //循环处理拿回来的数据 没有返回的
              for (var i = 0; i < 24; i++) {
                yesTodayNum = 0;
                todayNum = 0;
                if (i < 10) {
                  i = '0' + i
                }
                yesTodayNum = resData.data.yesterdayEnergy.findIndex((itemyes, index) => {
                  return itemyes.hours == i;
                })
                todayNum = resData.data.todayEnergy.findIndex((itemtorday, index) => {
                  return itemtorday.hours == i
                })
                if (yesTodayNum != -1) {
                  yesTodayArr.push(resData.data.yesterdayEnergy[yesTodayNum].totalEnergy)
                } else {
                  yesTodayArr.push("0.0");
                }
                if (todayNum != -1) {
                  todayArr.push(resData.data.todayEnergy[todayNum].totalEnergy)
                } else {
                  todayArr.push("0.0");
                }
              }
                yesTodayObj = { ...yesTodayArr };  //将数组转换成key为下标的对象
              todayObj = { ...todayArr }
              this.energyCompared && this.energyCompared.clear();
              this.option.xAxis.boundaryGap = false;
              this.option.dataset = {};
              this.option.xAxis.name = 'h';
              this.option.xAxis.data = Object.keys(yesTodayObj);
              this.option.yAxis.max = null;
              this.option.yAxis.name = 'kW·h';
              this.option.legend.data = ['基线', '今天', '昨天'];
              // this.option.legend.selectedMode= 'multiple';
              this.option.tooltip.formatter = null;
              this.option.series = [ {
                name: '昨天',
                type: 'line',
                smooth: true,
                // areaStyle: {
                //   color: '#d8e5f7'
                // },
                symbol: 'none',
                itemStyle: {
                  normal: {
                    color: '#FFDE69' 
                  }
                },
                // lineStyle: {
                //   width: 0
                // },
                data: Object.values(yesTodayObj)
              },{
                name: '今天',
                type: 'line',
                smooth: true,
                // areaStyle: {
                //   color: 'rgba(60,126,215,0.6)'
                // },
                symbol: 'none',
                itemStyle: {
                  normal: {
                    color: '#46acac'
                  }
                },
                data: Object.values(todayObj)
              },
              ];

              this.energyCompared && this.energyCompared.setOption(this.option);
              this.resizegetEnergyCompared();
              window.addEventListener("resize", this.resizegetEnergyCompared);
            
              
              
            } else if (resData.code == 1000) {

            }
          })
        }
      },
      // 当月能耗
      get24Hour() {
        var myDate = new Date()
        var month = myDate.getMonth() + 1;
        if (month.toString().length < 2) {
          month = '0' + month
        }
        this.chooseMonth = myDate.getFullYear() + '-' + (month)
        let monthNum = 0;
        let monthArr = [];
        let monthObj = {};
        let xAxisData = [];//
        if (!this.destroyFlag24Hour) {
          // 基于准备好的dom，初始化echarts实例
          this.$axios.leansite({
            method: 'GET',
            url: this.API.leansite.monthEnergy,
            params: { 'date': this.chooseMonth }
          }).then((res) => {
            var resData = res.data;
            if (resData.code == 0) {
              if (!this.destroyFlag) {
                setTimeout(() => {
                  this.get24Hour();
                }, 60000)
              }
              var day = new Date(this.chooseMonth.split('-')[0], this.chooseMonth.split('-')[1], 0);
              var daycount = day.getDate(); //获取当月天数
              for (var i = 1; i <= daycount; i++) {
                if (i < 10) {
                  i = '0' + i
                }
                monthNum = 0;
                monthNum = resData.data.findIndex((itemyes, index) => {
                  return itemyes.day == i;
                })
                if (monthNum != -1) {
                  monthArr.push(resData.data[monthNum].totalEnergy)
                } else {
                  monthArr.push("0.0");
                }
              }
              monthObj = { ...monthArr }
              Object.keys(monthObj).forEach(item => {
                xAxisData.push(item * 1 + 1)
              })
              this.get24HourCharts && this.get24HourCharts.clear();
              this.option.xAxis.boundaryGap = false;
              this.option.dataset = {};
              this.option.xAxis.name = '日';
              this.option.xAxis.data = xAxisData;
              this.option.yAxis.max = null;
              this.option.yAxis.name = 'kW·h';
              // this.option.legend.data = ['基线', '今天', '昨天'];
              this.option.tooltip.formatter = null;
              this.option.series = [{
                // name: '今天',
                smooth: true,
                // showSymbol: false,
                animationDuration: 2000,
                animationDelayUpdate: function (idx) {
                  return idx * 5;
                },
                type: 'line',
                itemStyle: {
                  normal: {
                    color: '#277bd4' 
                  }
                },
                data: Object.values(monthObj)
              },
              ];
              this.get24HourCharts.resize();
              this.get24HourCharts.setOption(this.option);
              window.addEventListener("resize", this.resizeGet24HourCharts);
            } else {
              this.option.xAxis.data = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
              this.option.legend.data = [];
              this.option.series = [];
              this.get24HourCharts.setOption(this.option);
            }
          })
        }
      },
      // 适配
      resizeGet24HourCharts() {
        setTimeout(() => {
          if (this.get24HourCharts) {
            this.get24HourCharts.resize();
          }
        }, 0)
      },
      resizegetEnergyCompared() {
        setTimeout(() => {
          if (this.energyCompared) {
            this.energyCompared.resize();
          }
        }, 0)
      },
      resizeGetenergyWeek() {
        setTimeout(() => {
          this.energyWeek.resize();
        }, 0)
      },
    },
    mounted() {
      // this.getTopInfo()
      this.getLightIsOnLIne()
      this.getTodayEnergyAndYesdayEnergy()
      this.getEnergyTotal()
      this.getTime()
      this.getEnerySaveing()
      this.getElapsedTime();
      this.get24HourCharts = echarts.init(document.getElementById('energyDay'));
      this.energyCompared = echarts.init(document.getElementById('energyCompared'));
      this.get24Hour();
      this.getEnergyCompared();
    },
    destroyed() {
      window.removeEventListener("resize", this.resizegetEnergyCompared);
      window.removeEventListener("resize", this.resizeGet24HourCharts);
      window.removeEventListener("resize", this.resizeGetenergyWeek);
      this.energyCompared.clear();
      this.energyCompared = null;
      this.get24HourCharts.clear();
      this.get24HourCharts = null;
      this.destroyFlag = true;
      this.destroyFlag24Hour = true;
      this.destroyFlagStrategy = true;
    }
  };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->

<style lang='scss'>
  @import "@/assets/css/common.scss";

  .LightOverview {
    /* height: calc(100vh - 60px); */
    padding: 30px;
    overflow: auto;
    min-width: 1390px;
    overflow: auto;

    .el-table td {
      padding: 2px 0;
    }

    .msg {
      height:150px !important;
      line-height: 1.3;
      text-align: center;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #fff;
      border: solid 1px #bebebe;
      border-radius: 3px;
      @include media($m1366) {
        margin-bottom: 15px;
      }

      height: 300px;

      @include media($h720) {
        height: 250px;
      }

      position: relative;

      li {
        border-left: 1px solid #d0d0d0;
        height:80px;
        width: calc(100% / 6);
        text-align:left;
        padding-left:3.4%;
        position: relative;
        opacity: 0;
        animation: liShow 0.2s ease-in-out forwards;
        &:nth-of-type(1) {
          border:none !important;
          @include media($m1366) {
            margin: 0 7.5px 0 15px;
          }
        }
        .arror {
          @include position(absolute, 23px, 42px, none, none);
        }

        p {
          font-size: 14px;
          color: #323232;
          z-index: 2;
          @include media($h720) {
            /* margin: 28px 0 26px; */
          }
        }

        div {
          font-size: 40px;

          @include media($h720) {
            font-size: 36px;
          }

          @include media($m1440) {
            font-size: 36px;
          }

          font-family: OBJECTIVITY-REGULAR !important;

          span {
            font-size: 14px;
            margin: 0 8px;
            color: #323232;
          }
        }

        >span {
          font-size: 14px;
          color: #747f8b;
          white-space: nowrap;
          @include position(absolute, none, none, 30px, 50%);
          transform: translateX(-50%);
        }
      }
    }

    .overview {
      /* width: 95%; */
      background-color: #fff;
      border-radius: 3px;
      margin: 24px auto 0;
      padding: 0 40px;
      position: relative;
      border: 1px solid #bebebe;

      .energyCompared {
        width: 100%;
        height: 277px;
        padding-bottom: 20px;
        @include media($h720) {
          height: 207px;
        }
      }

      .energyDay {
        width: 100%;
        height: 257px;
        @include media($h720) {
          height: 207px;
        }

      }
      .header {
        text-align: left;
        height: 48px;
        line-height: 48px;
        /* border-bottom: 1px solid #d9e3f3; */
	      background-color: #f4f4f4;
        padding: 0 40px;
        margin: 0 -40px;
        position: relative;
        border-radius: 3px 3px 0 0;
        font-size: 14px;
        color: #323232;
        position: relative;

      }

      .block {
        position: absolute;
        right: 55px;
        top: 20px;
      }
    }

    #strategy {
      text-align: left;
      overflow: auto;
      padding: 15px 0;
    }

    .el-table__body-wrapper {
      overflow-x: hidden;

      .cell {
        padding: 0;
      }

      tr:nth-of-type(2) .cell span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    @keyframes liShow {
      0% {
        opacity: 0.2;
      }

      100% {
        opacity: 1;
      }
    }
  }
</style>