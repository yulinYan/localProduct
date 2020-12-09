<template>
  <el-container class="lightControl">
    <div class="contents">
      <div class="buttons">
        <el-select v-model="areaValue" placeholder="选择区域" size="small" @change="changeArea()">
          <el-option v-for="(item, index) in areaOptions" :key="item.id" :label="item.area" :value="index">
          </el-option>
        </el-select>

        <el-select v-model="lightOptType" placeholder="选择操作方式" size="small" @change="changeOptType()" style="width: 140px">
          <el-option v-for="(item, index) in optTypeList" :key="index" :label="item.name" :value="item.val">
          </el-option>
        </el-select>
        <!--操作方式等于2(批量控制)时才可以选择分组-->
        <el-select v-show="lightOptType == '2'" v-model="switchValue" placeholder="选择分组" size="small" style="width: 140px" filterable clearable @change="switchChange()">
          <el-option v-for="(item, index) in switchOptions" :key="index" :label="item.name" :value="index"></el-option>
        </el-select>
        <el-button v-if="clearFlag" icon="el-icon-s-release" size="mini" @click="clearSet()" style="background-color: #006fe6;color:#fff;height:30px;border: 1px solid #006FE6;"> 清除选择</el-button>
        <el-checkbox :disabled='isAbleCheck' v-model="checkAll" class="flt setcheck" size="mini" border @change="checkedAlls(0)">全选</el-checkbox>
        <el-checkbox :disabled='isAbleCheck' v-model="checkNoAll" class="flt setcheck" size="mini" border @change="checkedAlls(1)">反选</el-checkbox>
        <div class="imgposi">
          <img src="../../assets/img/LightCtrl/state.png" alt="灯状态介绍图">
        </div>
      </div>
      <div class="mapsty">
        <div id="mapLight">
          <!-- @mouseup="up"  -->
          <div id="mouseTouch" class="movese">
            &nbsp;
          </div>
          <div v-show="mouseAreashow" :style="{width: (mouseAreashow ? mouseselectX+'px' : '0px'),height: (mouseAreashow ? mouseselectY+'px' : '0px'),top:mouseselectTop+'px',left:mouseselectLeft+'px'}" class="mosecla">
            &nbsp;
          </div>
          <img id="mapimg" :src="backImg" alt="区域地图">
          <div v-for="(item, index) of lightList" :key="index" class="lightArea" :style="{left:'calc('+item.xaxis * 100+'% - '+seSize+'px)',top:'calc('+item.yaxis * 100+'% - '+seSize+'px)',width:lightSize + 'px',zIndex:(999 - (parseInt(item.xaxis * 100)+parseInt(item.yaxis * 100)))}" style="z-index:8;">
            <el-tooltip :content="!item.alias ? item.sn : item.alias" effect="light" placement="top">
              <div :style="{width:lightSize + 'px',height:lightSize + 'px'}" class="tol" @click="setChecked(item, index)">&nbsp;</div>
            </el-tooltip>
            <img v-if="item.peopleStatus === '0' || item.peopleStatus === '1'" :src="item.peopleStatus === '0' ? rgoff : rgon" alt="" :style="{left:(lightSize*0.85)+'px',width:(lightSize*0.34) + 'px',height:(lightSize*0.34) + 'px'}" class="rgImg">
            <img v-if="item.linghtStatus === '0' || item.linghtStatus === '1'" :src="item.linghtStatus === '0' ? ggoff : ggon" alt="" :style="{width:(lightSize*0.34) + 'px',height:(lightSize*0.34) + 'px'}" class="ggImg">
            <!--离线-->
            <img v-if="item.indStatus === -1" :id="`lightsImg${item.areaId}`" :style="{width:lightSize+'px'}" :src="lightImg2" alt="" click='false' :ref="index" :index="index" class="lightsImg" @click="setChecked(item, index)">
            <!--关灯-->
            <img v-if="item.indStatus === 0" :id="`lightsImg${item.areaId}`" :style="{width:lightSize+'px'}" :src="lightImg0" alt="" click='false' :ref="index" :index="index" class="lightsImg" @click="setChecked(item, index)">
            <!--开灯-->
            <img v-if="item.indStatus === 1" :id="`lightsImg${item.areaId}`" :style="{width:lightSize+'px'}" :src="lightImg1" alt="" click='false' :ref="index" :index="index" class="lightsImg" @click="setChecked(item, index)">
            <img :style="{display: item.checked ? 'inline-block' : 'none'}" src="../../assets/img/LightCtrl/choose.png" class="chooseImg" alt="">
          </div>
        </div>
      </div>
    </div>
    <!--切换右侧图表显示与隐藏-->
    <div :class="rightBarRightClass" @click="changeChartsShow">
      <img v-if="isShowChart" src="../../assets/img/LightCtrl/shouhui.png" alt="">
      <img v-if="!isShowChart" src="../../assets/img/LightCtrl/fangchu.png" alt="">
    </div>
    <!--右侧图表控制区-->
    <el-aside width="360px" v-show="isShowChart">
      <h3>基本控制</h3>
      <el-form label-position="left" label-width="60px" :model="setLightForm" style="color: #fff;">
        <el-form-item label="开关">
          <el-button :class="setLightForm.switchStatus === 1 ? 'el-buttonact' : 'el-buttons'" size="small" style="margin-right: 20px;" @click="statusChange(1)">开灯</el-button>
          <el-button :class="setLightForm.switchStatus === 0 ? 'el-buttonact' : 'el-buttons'" size="small" @click="statusChange(0)">关灯</el-button>
        </el-form-item>
        <el-form-item label="亮度">
          <el-col :span="15">
            <el-input-number v-model="setLightForm.lighting" size="small" :min="1" :step="1" :max="100" step-strictly>
            </el-input-number>&nbsp;%&nbsp;
          </el-col>
          <el-col :span="6">
            <el-button type="primary" style="background-color: #006FE6;border-color: #006FE6;" size="mini" @click="setBrightness" class="el-icon-setting">&nbsp;设置</el-button>
          </el-col>
        </el-form-item>
      </el-form>
      <h4 v-show="isAbleCheck" style="color: #fff;font-weight: 600;text-align: center;">
        当前灯SN：{{!currLed.sn?'暂无数据':currLed.sn}}</h4>
      <div v-show="isAbleCheck" class="realTimeCharts">
        <div class="RightCon" id="chart1"></div>
        <div class="RightCon" id="chart2"></div>
        <div class="RightCon" id="chart3"></div>
      </div>
    </el-aside>
  </el-container>
</template>
<script>
import lightImg1 from '../../assets/img/LightCtrl/light.png'
import lightImg0 from '../../assets/img/LightCtrl/light-off.png'
import lightImg2 from '../../assets/img/LightCtrl/light-lx.png'
import lightImgYRLX0 from '../../assets/img/LightCtrl/rengan-lx.png'
import lightImgYRLX1 from '../../assets/img/LightCtrl/youren-lx.png'
import lightImgYROFF0 from '../../assets/img/LightCtrl/rengan-off.png'
import lightImgYROFF1 from '../../assets/img/LightCtrl/youren-off.png'
import lightImgYRON0 from '../../assets/img/LightCtrl/rengan-on.png'
import lightImgYRON1 from '../../assets/img/LightCtrl/youren-on.png'
import factoryImg from '../../assets/img/LightCtrl/factory.png'
import factoryImg1 from '../../assets/img/LightCtrl/factory1.png'
import rgoff from '../../assets/img/LightCtrl/rgoff.png'
import rgon from '../../assets/img/LightCtrl/rgon.png'
import ggoff from '../../assets/img/LightCtrl/ggoff.png'
import ggon from '../../assets/img/LightCtrl/ggon.png'
import map from '../../assets/img/LightCtrl/map.png'
import hideSide from '../../assets/img/LightCtrl/hideSide.png'
import downGif from '../../assets/img/LightCtrl/5bdd8ac97daceralctbivsf.gif'
import Highcharts from 'highcharts'
export default {
  name: 'LightControl',
  components: {},
  data() {
    return {
      lightImg1: lightImg1,
      lightImg2: lightImg2,
      lightImg0: lightImg0,
      factoryImg: factoryImg,
      factoryImg1: factoryImg1,
      lightSize: 60, // 默认灯大小60
      seSize: 0,
      lightList: [],
      areaValue: '', // 区域值
      areaOptions: [], // 区域列表
      checkAll: false, // 全选
      checkNoAll: false, // 全选
      drawer: false, // 打开抽屉
      company: null,
      activeName: '0', // 切换
      sendWsTime: null,
      websock: null,
      // backImg: require('../../assets/img/denglu-beijing.png'),
      backImg: '',
      lights: [],
      chart1: null,
      chart2: null,
      chart3: null,
      rgoff: rgoff,
      rgon: rgon,
      ggoff: ggoff,
      ggon: ggon,
      intervalTime: [null, null, null],
      setLightForm: {
        switchStatus: null,
        lighting: 50
      },
      optTypeList: [
        { name: '单灯控制', val: '1' },
        { name: '批量控制', val: '2' }
      ],
      lightOptType: '2',
      isAbleCheck: true, //不允许选中
      isShowChart: false,
      rightBarRightClass: 'rightBarControlHide',
      arrowName: '@/assets/img/LightCtrl/shiouhui.png',
      startinfo: null,
      mouseselectX: 0,
      mouseselectY: 0,
      mouseselectTop: 0,
      mouseselectLeft: 0,
      clearFlag: false,
      mouseAreashow: false,
      currLed: {}, //当前需要查询统计图的灯
      switchValue: '', // 分组value
      switchOptions: [] // 分组列表
    }
  },
  mounted() {
    this.$axios
      .leansite({
        method: 'get',
        url: this.API.leansite.showIconSize
      })
      .then(res => {
        if (res.data.code === 0) {
          if (res.data.data) {
            this.lightSize = parseInt(res.data.data + '')
            this.seSize = (this.lightSize - 30) / 2
          }
          this.getAreaLists()
          this.initChart()
          this.setMouseEvent()
        }
      })
  },
  // watch:{
  //         lightList:{//深度监听，可监听到对象、数组的变化
  //           handler(val, oldVal){
  //               console.log(val)
  //               console.log(oldVal)
  //               var o = val.findIndex(item=>{
  //                 if( item.checked ){
  //                   return ;
  //                 }
  //               })
  //               console.log(o)
  //           },

  //           deep:true
  //       }
  //   },
  methods: {
    // handleLight(){
    //   console.log(this.lightList)
    //   var o = this.lightList.findIndex((item)=>{
    //     if(item.checked&&item.checked ==true){
    //       this.clearFlag = true
    //     }else{
    //       this.clearFlag = false
    //     }
    //   })
    //             console.log(o)
    // },
    /**
     * 监听 选择分组 select下拉框change事件
     */
    switchChange() {
      if (this.switchValue === null || this.switchValue === '') {
        this.switchListValue = ''
        this.clearSet()
        return
      }
      const self = this
      this.lightList.forEach((item, index) => {
        item.checked = false
      })
      this.checkAll = false
      this.checkNoAll = false
      this.lightList.forEach((item, index) => {
        let keyItem = self.switchOptions[self.switchValue].leds.find(function (elem) {
          return item.id === elem.id
        })
        if (keyItem !== undefined) {
          item.checked = true
        } else {
          item.checked = false
        }
      })
      //this.clearSet();
    },
    /**
     * 清除设置
     */
    clearSet() {
      this.clearFlag = false
      this.checkAll = false
      this.checkNoAll = false
      this.lightList.forEach((item, index) => {
        item.checked = false
      })
    },

    /*
          鼠标拖动
          */
    setMouseEvent() {
      var mouseTouchht = document.getElementById('mouseTouch')
      var self = this
      mouseTouchht.onmousedown = function (e) {
        mouseTouchht.style.zIndex = 5
        if (self.lightOptType !== '1') {
          self.startinfo = e
          self.mouseselectX = 0
          self.mouseselectY = 0
          self.mouseAreashow = true
          mouseTouchht.onmousemove = function (e) {
            const x = e.layerX - self.startinfo.layerX
            const y = e.layerY - self.startinfo.layerY
            if (x < 0) {
              self.mouseselectLeft = e.offsetX
            } else {
              self.mouseselectLeft = self.startinfo.layerX
            }
            self.mouseselectX = Math.abs(x)
            if (y < 0) {
              self.mouseselectTop = e.offsetY
            } else {
              self.mouseselectTop = self.startinfo.layerY
            }
            self.mouseselectY = Math.abs(y)

            if (self.mouseselectX > 0 && self.mouseselectY > 0) {
              const mapLight = document.getElementById('mapimg')
              const chartsWidth = mapLight.width
              const chartsHeight = mapLight.height
              self.setChecket(
                self.mouseselectLeft / chartsWidth,
                self.mouseselectTop / chartsHeight,
                (self.mouseselectLeft + self.mouseselectX) / chartsWidth,
                (self.mouseselectTop + self.mouseselectY) / chartsHeight
              )
            }
          }
          document.onmouseup = function (e) {
            self.mouseAreashow = false
            mouseTouchht.style.zIndex = 2

            mouseTouchht.onmousemove = null
            document.onmouseup = null
            e.preventDefault()
            self.autoShowCharts()
            self.initChart()
          }
        }
      }
    },
    setChecket(minx, miny, maxx, maxy) {
      this.clearFlag = false
      var self = this
      this.lightList.forEach((item, index) => {
        var olightArea = document.getElementsByClassName('lightArea')
        var oWidth = olightArea[0].offsetWidth / 2
        var oHeight = olightArea[0].offsetHeight / 2
        const mapLight = document.getElementById('mapimg')
        const chartsWidth = mapLight.width
        const chartsHeight = mapLight.height
        var x = item.xaxis * 1 + oWidth / chartsWidth
        var y = item.yaxis * 1 + oHeight / chartsHeight
        if (x >= minx && x <= maxx && y >= miny && y <= maxy) {
          item.checked = true
          this.clearFlag = true
        } else {
          item.checked = false
        }
      })
      this.checkAll = null
      const list = this.getLightChecks()
      if (list.length > 0) {
        this.currLed = list[0]
      } else {
        this.currLed = {}
      }
    },
    // 获取区域列表
    getAreaLists() {
      this.$axios
        .leansite({
          method: 'get',
          url: this.API.leansite.getAreaList
        })
        .then(res => {
          if (res.data.code === 0) {
            this.areaOptions = res.data.data
            if (this.areaOptions.length > 0) {
              this.areaValue = 0
              this.lightList = []
              let imagePath = this.areaOptions[0].imagePath
              this.backImg = this.API.leansite.baseURL + imagePath.substr(1, imagePath.length)
              this.$axios
                .leansite({
                  method: 'get',
                  url: this.API.leansite.findLedsByArea,
                  params: {
                    areaId: this.areaOptions[this.areaValue].id
                  }
                })
                .then(res => {
                  for (const item of res.data.data) {
                    this.lightList.push({
                      areaId: item.areaId,
                      brightness: item.brightness,
                      createTime: item.createTime,
                      id: item.id,
                      indBright: item.indBright,
                      indStatus: item.status,
                      indTime: item.indTime,
                      ip: item.ip,
                      sn: item.sn,
                      alias: item.alias,
                      tenantId: item.tenantId,
                      unindBright: item.unindBright,
                      xaxis: item.xaxis,
                      yaxis: item.yaxis,
                      peopleStatus: null,
                      linghtStatus: null,
                      checked: false
                    })
                  }
                  this.initWebpack()
                  if (this.lightOptType * 1 == 2) {
                    //批量控制
                    this.isAbleCheck = false
                    this.cancelLightChecks() //取消所有选中的灯
                    this.autoShowCharts()
                    this.getGroupList() //获取分组列表
                  }
                })
            }
          }
        })
    },
    /**
     * 监听 "区域"下拉框change事件
     */
    changeArea() {
      this.lightList = []
      let imagePath = this.areaOptions[this.areaValue].imagePath
      this.backImg = this.API.leansite.baseURL + imagePath.substr(1, imagePath.length)

      if (this.lightOptType * 1 == 1) {
        //单灯控制
        this.isAbleCheck = true
      } else {
        //批量控制
        this.isAbleCheck = false
      }
      this.checkNoAll = false
      this.checkAll = false
      this.clearFlag = false
      this.$axios
        .leansite({
          method: 'get',
          url: this.API.leansite.findLedsByArea,
          params: {
            areaId: this.areaOptions[this.areaValue].id
          }
        })
        .then(res => {
          for (const item of res.data.data) {
            this.lightList.push({
              areaId: item.areaId,
              brightness: item.brightness,
              createTime: item.createTime,
              id: item.id,
              indBright: item.indBright,
              indStatus: item.status,
              indTime: item.indTime,
              ip: item.ip,
              sn: item.sn,
              alias: item.alias,
              tenantId: item.tenantId,
              unindBright: item.unindBright,
              xaxis: item.xaxis,
              yaxis: item.yaxis,
              peopleStatus: null,
              linghtStatus: null,
              checked: false
            })
          }
          this.websocketopen()
          if (this.lightOptType * 1 == 2) {
            //批量控制
            this.getGroupList()
          }
        })
    },
    /**
     * 监听 "灯操作方式"下拉框change事件
     */
    changeOptType() {
      this.checkNoAll = false
      this.checkAll = false
      this.clearFlag = false
      this.clearSet() //清除选择
      if (this.lightOptType * 1 == 1) {
        //单灯控制
        this.isAbleCheck = true
        this.cancelLightChecks() //取消所有选中的灯
        this.autoShowCharts()
      } else {
        //批量控制
        this.isAbleCheck = false
        this.cancelLightChecks() //取消所有选中的灯
        this.autoShowCharts()
        this.getGroupList() //获取分组列表
      }
    },
    /**
     * 监听灯 click事件
     */
    setChecked(item, index) {
      this.clearFlag = false
      if (this.lightOptType * 1 == 1) {
        //单灯控制
        let list = this.getLightChecks()
        if (list.length >= 1 && !item.checked) {
          this.lightList.forEach((item, index) => {
            if (item.checked) {
              item.checked = false
            }
          })
          list = []
          list.push(item)
        }
        this.setLightForm.switchStatus = null
      }
      this.lightList[index].checked = !item.checked
      if (!this.lightList[index].checked) {
        this.checkAll = false
        this.checkNoAll = false
      }
      const list = this.getLightChecks()
      if (list.length > 0) {
        this.currLed = list[0]
      } else {
        this.currLed = {}
      }
      this.lightList.forEach(item => {
        if (item.checked == true) {
          this.clearFlag = true
        }
      })
      this.autoShowCharts()
      this.initChart()
    },
    /**
     * 自动控制统计图表区域显示/隐藏自动控制统计图表区域显示/隐藏
     */
    autoShowCharts() {
      let checkedCount = 0
      this.lightList.forEach((item, index) => {
        if (item.checked) {
          checkedCount++
        }
      })
      const list = this.getLightChecks()
      if (list.length > 0) {
        this.currLed = list[0]
      } else {
        this.currLed = {}
      }
      if (checkedCount == 0) {
        this.isShowChart = true
        this.changeChartsShow() //控制统计图表显示与隐藏
      } else if (checkedCount >= 1) {
        this.isShowChart = false
        this.changeChartsShow() //控制统计图表显示与隐藏
      }
    },
    /**
     * 监听 “开启和关闭”单选框change事件
     */
    statusChange(type) {
      const list = this.getLightChecks()
      if (list.length === 0) {
        this.$message({
          type: 'error',
          message: '请选择需要设置开关状态的灯!'
        })
        return
      }
      this.setLightForm.switchStatus = type
      const leds = []
      for (const item of list) {
        leds.push(item.sn)
      }
      this.$axios
        .leansite({
          method: 'post',
          url: this.API.leansite.setLedsStatus,
          data: {
            sns: leds.join(','),
            // status: this.setLightForm.switchStatus
            t: this.setLightForm.switchStatus
          }
        })
        .then(res => {
          if (res.data.code === 0) {
            this.$message({
              type: 'success',
              message: '指令发送成功!'
            })
          } else if (res.data.code === 1000) {
            this.$message({
              type: 'error',
              message: '指令发送失败：' + res.data.msg
            })
          }
        })
    },
    /**
     * 监听 “设置”按钮click事件
     */
    setBrightness() {
      const list = this.getLightChecks()
      if (list.length === 0) {
        this.$message({
          type: 'error',
          message: '请选择需要调节亮度的灯!'
        })
        return
      }
      const leds = []
      for (const item of list) {
        leds.push(item.sn)
      }
      this.$axios
        .leansite({
          method: 'post',
          url: this.API.leansite.setLedsBrightness,
          data: {
            sns: leds.join(','),
            // brightness: this.setLightForm.lighting
            t: this.setLightForm.lighting
          }
        })
        .then(res => {
          if (res.data.code === 0) {
            this.$message({
              type: 'success',
              message: '指令发送成功!'
            })
          } else if (res.data.code === 1000) {
            this.$message({
              type: 'error',
              message: '指令发送失败：' + res.data.msg
            })
          }
        })
    },
    /**
     * 监听 "全选/反选"checkbox change事件
     */
    checkedAlls(type) {
      this.clearFlag = false
      this.setLightForm.switchStatus = null
      if (type === 0) {
        this.checkNoAll = false
        this.lightList.forEach((item, index) => {
          item.checked = this.checkAll
        })
      } else {
        this.checkAll = false
        this.lightList.forEach((item, index) => {
          item.checked = !item.checked
        })
      }
      this.lightList.forEach(item => {
        if (item.checked == true) {
          this.clearFlag = true
        }
      })

      this.autoShowCharts()
    },
    /**
     * 获取所有选中的灯
     */
    getLightChecks() {
      const list = []
      this.lightList.forEach((item, index) => {
        if (item.checked) {
          list.push(item)
        }
      })
      return list
    },

    /**
     * 取消所有选中的灯
     */
    cancelLightChecks() {
      let allLight = [...this.lightList]
      allLight.forEach((item, index) => {
        item.checked = false
      })
      this.lightList = allLight
    },
    /**
     * 初始化webpack
     */
    initWebpack() {
      let websocketUrl = this.API.leansite.baseURL.replace('http', 'ws')
      this.websock = websocketUrl + 'websocket/' + this.$store.getters['userCenter/getToken']
      this.websock = new WebSocket(this.websock) //这里面的this都指向vue
      this.websock.onopen = this.websocketopen
      this.websock.onmessage = this.websocketonmessage
      this.websock.onclose = this.websocketclose
      this.websock.onerror = this.websocketerror
    },
    /**
     * websocket 打开通道s
     */
    websocketopen() {
      //打开
      console.log('WebSocket连接成功')
      this.websocketonsend()
    },
    /**
     * websocket 接收后台数据
     */
    websocketonmessage(e) {
      //数据接收
      let aReturnData = JSON.parse(e.data)
      let nFindIndex = this.lightList.findIndex(item2 => {
        return item2.sn == aReturnData[0].ledSn
      })
      //判断本次websocket返回的数据是上一次请求返回的还是本次请求返回的,若nFindIndex=-1就是上一次请求返回的数据，就不做处理
      if (nFindIndex != -1) {
        aReturnData.forEach((item, index) => {
          this.lightList[index].indStatus = item.status * 1
          this.lightList[index].peopleStatus = item.peopleStatus !== null ? item.peopleStatus + '' : null
          this.lightList[index].linghtStatus = item.linghtStatus !== null ? item.linghtStatus + '' : null
        })
        let choceLeds = this.getLightChecks()
        if (choceLeds.length > 0 && this.lightOptType == '1') {
          let nFindIndex = aReturnData.findIndex((item, index) => {
            return item.ledSn == choceLeds[0].sn
          })
          if (nFindIndex != -1) {
            let currDate = new Date(aReturnData[nFindIndex].createTime)
            this.chart1.series[0].addPoint({ x: new Date().getTime(), y: aReturnData[nFindIndex].electric == null ? 0 : aReturnData[nFindIndex].electric }, true, true)
            this.chart2.series[0].addPoint({ x: new Date().getTime(), y: aReturnData[nFindIndex].voltage == null ? 0 : aReturnData[nFindIndex].voltage }, true, true)
            this.chart3.series[0].addPoint({ x: new Date().getTime(), y: aReturnData[nFindIndex].power == null ? 0 : aReturnData[nFindIndex].power }, true, true)
          }
        }
      }
    },
    /**
     * websocket 发送数据
     */
    websocketonsend(e) {
      if (this.websock) {
        let aSN = []
        this.lightList.forEach((item, index) => {
          //if (item.checked) {
          aSN.push(item.sn)
          //}
        })
        if (aSN.length > 0) {
          this.websock.send(aSN.toString())
        }
        aSN = []
      }
    },
    /**
     * websocket 关闭通道
     */
    websocketclose() {
      //关闭
      if (this.websock) {
        console.log('WebSocket关闭')
        this.websock.close()
        this.websock = null
        clearInterval(this.sendWsTime)
        this.sendWsTime = null
      }
      let _this = this
      if (window.ActiveXObject || 'ActiveXObject' in window) {
        setTimeout(() => {
          _this.initWebpack()
          _this = null
        }, 15000)
      }
    },
    /**
     * websocket 捕捉异常
     */
    websocketerror() {
      //失败
      console.log('WebSocket连接失败')
    },
    /*
     * 清除能耗定时器
     */
    clearChartsTimer() {
      if (this.intervalTime[0] != null) {
        clearInterval(this.intervalTime[0])
        clearInterval(this.intervalTime[1])
        clearInterval(this.intervalTime[2])
        this.intervalTime = [null, null, null]
      }
    },
    //实时能耗  初始化图表
    initChart() {
      let _this = this
      let y = 0
      function activeLastPointToolip(chart) {
        if (Object.getOwnPropertyNames(chart).length != 0) {
          var points = chart.series[0].points
          chart.tooltip.refresh(points[points.length - 1])
        }
      }
      this.chart1 = Highcharts.chart('chart1', {
        colors: ['#006fe6'],
        credits: {
          enabled: false
        },
        time: {
          useUTC: false
        },
        chart: {
          height: 185,
          backgroundColor: 'transparent',
          margin: [35, 5, 20, 0],
          type: 'spline',
          marginLeft: 54,
          events: {
            load: function () {
              var series = this.series[0],
                chart1 = this
              activeLastPointToolip(chart1)
              _this.intervalTime[0] = setInterval(() => {
                let chartObj1 = { ...chart1 }
                activeLastPointToolip(chartObj1)
              }, 5000)
            }
          }
        },
        title: {
          text: '电流实时数据', //主标题文本，'\n'指定换行
          y: 2,
          x: 0,
          align: 'center',
          style: {
            fontSize: '14px', //字体大小
            color: '#fff',
            fontStyle: 'normal',
            fontWeight: 'normal'
          }
        },
        xAxis: [
          {
            gridLineDashStyle: 'ShortDash',
            lineColor: '#bebebe',
            type: 'datetime',
            tickPixelInterval: 150,
            labels: {
              style: {
                color: '#fff'
              }
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: '#fff',
                width: 1,
                type: 'solid'
              }
            }
          }
        ],
        yAxis: [
          {
            title: {
              align: 'high',
              rotation: '360',
              text: '(A)',
              x: 40,
              y: -10,
              style: {
                color: '#fff'
              }
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: '#fff',
                width: 1,
                type: 'solid'
              }
            },
            gridLineDashStyle: 'longdash',
            minorGridLineColor: '#bebebe',
            labels: {
              formatter: function () {
                return Math.round(this.value * 1000) / 1000
              },
              style: {
                color: '#fff'
              }
            },
            plotLines: [
              {
                value: 0,
                width: 1,
                color: '#eeeeee'
              }
            ]
          }
        ],
        tooltip: {
          backgroundColor: '#006fe6',
          borderRadius: 3,
          style: {
            color: '#fff'
          },
          shadow: false,
          borderRadius: 8,
          valueDecimals: 2,
          formatter: function () {
            var t = this.y
            return (
              "<b style='font-size: 14px;margin-bottom: 12px;display: inline-block;'>" +
              this.series.name +
              "</b><br/><span style='font-size: 14px;margin-bottom: 12px;display: inline-block;'>" +
              _this.$moment(this.x).format('YYYY-MM-DD HH:mm:ss') +
              "</span><br/><span style='font-size: 14px;'>" +
              Math.round(t * 1000) / 1000 +
              '</span>'
            )
          }
        },
        legend: {
          enabled: false
        },
        series: [
          {
            name: '电流',
            data: (function () {
              // 生成随机值
              var data = []
              var time = new Date().getTime()
              for (var i = -10; i <= 0; i += 1) {
                data.push({
                  x: time + i * 1000,
                  y: 0
                })
              }
              return data
            })()
          }
        ]
      })
      this.chart2 = Highcharts.chart('chart2', {
        colors: ['#72c8ff'],
        credits: {
          enabled: false
        },
        time: {
          useUTC: false
        },
        chart: {
          height: 185,
          backgroundColor: 'transparent',
          margin: [35, 5, 20, 0],
          type: 'spline',
          marginLeft: 54,
          events: {
            load: function () {
              var series = this.series[0],
                chart2 = this
              activeLastPointToolip(chart2)
              _this.intervalTime[1] = setInterval(() => {
                let chartObj2 = { ...chart2 }
                activeLastPointToolip(chartObj2)
              }, 5000)
            }
          }
        },
        title: {
          text: '电压实时数据', //主标题文本，'\n'指定换行
          x: 0,
          y: 2,
          align: 'center',
          style: {
            //主标题文本样式{"fontSize": 18,"fontWeight": "bolder","color": "#333"}
            fontSize: '14px', //字体大小
            color: '#fff',
            fontStyle: 'normal',
            fontWeight: 'normal'
          }
        },
        xAxis: {
          gridLineDashStyle: 'ShortDash',
          lineColor: '#bebebe',
          type: 'datetime',
          tickPixelInterval: 150,
          labels: {
            style: {
              color: '#fff'
            }
          }
        },
        yAxis: {
          title: {
            align: 'high',
            rotation: '360',
            text: '(V)',
            x: 40,
            y: -10,
            style: {
              color: '#fff'
            }
          },
          gridLineDashStyle: 'longdash',
          minorGridLineColor: '#bebebe',
          labels: {
            formatter: function () {
              return Math.round(this.value * 1000) / 1000
            },
            style: {
              color: '#fff'
            }
          },
          plotLines: [
            {
              value: 0,
              width: 1,
              color: '#eeeeee'
            }
          ]
        },
        tooltip: {
          backgroundColor: '#72c8ff',
          borderRadius: 3,
          shadow: false,
          style: {
            color: '#fff'
          },
          shadow: false,
          valueDecimals: 2,
          borderRadius: 8,
          formatter: function () {
            var t = this.y
            return (
              "<b style='font-size: 14px;margin-bottom: 12px;display: inline-block;'>" +
              this.series.name +
              "</b><br/><span style='font-size: 14px;margin-bottom: 12px;display: inline-block;'>" +
              _this.$moment(this.x).format('YYYY-MM-DD HH:mm:ss') +
              "</span><br/><span style='font-size: 14px;'>" +
              Math.round(t * 1000) / 1000 +
              '</span>'
            )
          }
        },
        legend: {
          enabled: false
        },
        series: [
          {
            name: '电压',
            data: (function () {
              // 生成随机值
              var data = []
              var time = new Date().getTime()
              for (var i = -10; i <= 0; i += 1) {
                data.push({
                  x: time + i * 1000,
                  y: 0
                })
              }
              return data
            })()
          }
        ]
      })
      this.chart3 = Highcharts.chart('chart3', {
        colors: ['#0b16a0'],
        credits: {
          enabled: false
        },
        time: {
          useUTC: false
        },
        chart: {
          height: 185,
          backgroundColor: 'transparent',
          margin: [35, 5, 20, 0],
          type: 'spline',
          marginLeft: 54,
          events: {
            load: function () {
              var series = this.series[0],
                chart3 = this
              activeLastPointToolip(chart3)
              _this.intervalTime[2] = setInterval(() => {
                let chartObj3 = { ...chart3 }
                activeLastPointToolip(chartObj3)
              }, 5000)
            }
          }
        },
        title: {
          text: '功率实时数据', //主标题文本，'\n'指定换行
          y: 2,
          x: 0,
          style: {
            //主标题文本样式{"fontSize": 18,"fontWeight": "bolder","color": "#333"}
            fontSize: '14px', //字体大小
            color: '#fff',
            fontStyle: 'normal',
            fontWeight: 'normal'
          }
        },
        xAxis: {
          gridLineDashStyle: 'ShortDash',
          lineColor: '#bebebe',
          type: 'datetime',
          tickPixelInterval: 150,
          labels: {
            style: {
              color: '#fff'
            }
          }
        },
        yAxis: {
          title: {
            align: 'high',
            rotation: '360',
            text: '(W)',
            x: 40,
            y: -10,
            style: {
              color: '#fff'
            }
          },
          gridLineDashStyle: 'longdash',
          minorGridLineColor: '#bebebe',
          labels: {
            formatter: function () {
              return Math.round(this.value * 1000) / 1000
            },
            style: {
              color: '#fff'
            }
          },
          plotLines: [
            {
              value: 0,
              width: 1,
              color: '#eeeeee'
            }
          ]
        },
        tooltip: {
          // hideDelay: 500000,
          backgroundColor: '#0b16a0',
          borderRadius: 3,
          shadow: false,
          valueDecimals: 2,
          style: {
            color: '#fff'
          },
          formatter: function () {
            var t = this.y
            return (
              "<b style='font-size: 14px;margin-bottom: 24px;display: inline-block;'>" +
              this.series.name +
              "</b><br/><span style='font-size: 14px;margin-bottom: 12px;display: inline-block;'>" +
              _this.$moment(this.x).format('YYYY-MM-DD HH:mm:ss') +
              "</span><br/><span style='font-size: 14px;'>" +
              Math.round(t * 1000) / 1000 +
              '</span>'
            )
          }
        },
        legend: {
          enabled: false
        },
        exporting: {
          enabled: false
        },
        series: [
          {
            name: '功率',
            data: (function () {
              // generate an array of random data
              var data = []
              var time = new Date().getTime()
              for (var i = -10; i <= 0; i += 1) {
                data.push({
                  x: time + i * 1000,
                  y: 0
                })
              }
              return data
            })()
          }
        ]
      })
    },
    /**
     * 切换右侧图表区域显示与隐藏
     */
    changeChartsShow() {
      if (this.isShowChart) {
        this.isShowChart = false
        // this.arrowName = '@/assets/img/LightCtrl/shouhui.png'
        this.rightBarRightClass = 'rightBarControlHide'
      } else {
        this.isShowChart = true
        // this.arrowName = '@/assets/img/LightCtrl/fangchu.png'
        this.rightBarRightClass = 'rightBarControlShow'
        this.setLightForm.lighting = 1
        this.$axios
          .leansite({
            method: 'get',
            url: this.API.leansite.brightnessShow
          })
          .then(res => {
            if (res.data.code === 0) {
              this.setLightForm.lighting = res.data.data
            }
          })
      }
    },
    /*
     * 获取分组列表
     *
     */
    getGroupList() {
      this.$axios
        .leansite({
          method: 'get',
          url: this.API.leansite.groupList,
          params: {
            areaId: this.areaOptions[this.areaValue].id
          }
        })
        .then(res => {
          if (res.data.code === 0) {
            this.switchOptions = res.data.data
            this.switchChange()
          }
        })
    }
  },
  destroyed() {
    if (this.websock) {
      this.websock.close()
      this.websock = null
    }
    if (this.sendWsTime) {
      clearInterval(this.sendWsTime)
      this.sendWsTime = null
    }
    this.clearChartsTimer() //清除统计图表定时器
  }
}
</script>
<style lang="scss" scoped>
.lightControl {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  position: relative;

  /deep/ .el-drawer {
    width: 400px !important;
    height: 250px;
    top: 20vh;
  }

  .hidebtn {
    position: relative;
    top: 100px;
    left: 5px;
  }

  .contry {
    margin-top: -80px;
    text-align: center;

    .conts {
      padding-left: 10px;
      padding-right: 10px;
    }

    .default-brightness {
      padding-top: 10px;
      text-align: center;
      padding-left: 0px;

      .sespan {
        margin-bottom: 5px;
        font-size: 16px;
      }

      .linesty {
        padding-top: 10px;
        padding-bottom: 10px;
        padding-left: 50px;

        .setpros {
          height: 20px;
          cursor: pointer;
        }
      }
    }

    .opencla {
      padding: 10px;
      border-bottom: 2px solid #e5e5e5;

      .tis {
        margin-left: 20px;
        font-size: 16px;
      }

      .flt {
        margin-right: 20px;
      }
    }

    .namepos {
      padding-top: 10px;
      font-size: 25px;
      border-bottom: 2px solid #e5e5e5;
      padding-bottom: 10px;
    }
  }
}

.lightControl {
  height: calc(100vh - 60px);
  position: relative;

  .contents {
    /*width: calc(100vw - 79px - 360px);*/
    width: 100%;
    height: calc(100vh - 60px);
    overflow: auto;

    .buttons {
      padding: 20px 40px;
      margin-bottom: 15px;

      .el-select {
        margin-right: 15px;
      }

      /*.el-radio-group {
        .el-radio {
          height: 32px;

          &:first-child {
            margin-right: 0px;
          }
        }
      }*/

      .imgposi {
        float: right;
      }

      .flt {
        margin-left: 15px;
        /deep/ .is-checked {
          /deep/ .el-checkbox__inner {
            border-color: #006fe6;
            background-color: #006fe6;
          }
        }
      }
      .el-checkbox-group {
        width: 198px;
        display: inline-block;
      }
      .setcheck {
        height: 30px;
        padding-top: 4px;
        margin-right: 0px;
      }
      /deep/ .el-input--small .el-input__inner {
        height: 32px;
        line-height: 32px;
        border-color: #969696;
      }

      /deep/ .el-input__inner:hover {
        border-color: #323232;
      }
    }

    .mapsty {
      overflow: auto;
      overflow-x: hidden;
      text-align: center;
      padding: 0px 30px;

      > .el-tabs {
        padding-left: 10px;
        padding-right: 10px;
      }

      #mapLight {
        position: relative;
        overflow: hidden;
        height: auto;
        display: inline-block;

        .movese {
          width: 100%;
          height: 100%;
          position: absolute;
          z-index: 2;
        }

        .mosecla {
          position: absolute;
          background: #006fe6;
          border: 2px solid #006fe6;
          opacity: 0.5;
          z-index: 1;
        }
        .rgImg {
          // left: 40px;
          position: absolute;
        }

        .ggImg {
          left: 0px;
          position: absolute;
        }

        .tol {
          position: absolute;
          // border: 1px solid #e5e5e5;
          // border-radius: 30px;
          top: 4px;
          left: 4px;
        }

        > img {
          max-width: 100%;
          min-width: 800px;
          height: auto;
          filter: blur(0px);
          min-height: 400px;
        }

        .chooseImg {
          position: relative;
        }

        > div {
          position: absolute;
          cursor: pointer;
        }
      }
    }
  }
  .rightBarControlHide {
    z-index: 20;
    cursor: pointer;
    position: absolute;
    top: 45%;
    right: 15px;
    /* width: 12px;
      height: 64px; */
    line-height: 64px;
    text-align: center;
    /* background-color: #d2d2d2; */
  }

  .rightBarControlShow {
    z-index: 20;
    cursor: pointer;
    position: absolute;
    top: 45%;
    right: 360px;
    /* width: 12px;
      height: 64px; */
    line-height: 64px;
    text-align: center;
    /* background-color: #d2d2d2; */
  }

  .ctrlBox {
    position: absolute;
    right: 20px;
    top: 47%;

    /deep/ .el-button {
      transform: scale(1);
      background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAAAwCAYAAADuFn/PAAAM7klEQVR4Xu1ceVBURxr/9VwICMqlXHKjIvEggoLmQlBxYxljhLgebIJXYpItXU2ylbtM5U5FdpOYxChuNGqCV8qNIQFGjIkKCioaRSMDKogIKKeizLzprX7DIOe8g0HYKvsfZd73ff3r/vp1f1c/Aiu0Kc8UDuIMiCYgkZSS4QD1B+AGwL5Z/A0AlQApJoSepaDZShWy0r8MqrBC990XsevgIBgU0SAkEqDDAeIP0Hb4SSVAiwFyFpRmQ2XMwqyJ3cZP5KKPSSxwIWpNIgXmAhgLQKosCiCPAFupvmmTdlPINblYZPHtynGB0ZgISucCRCZ+mgdCtkKh2IRZ42XhlzppmLrkgoeB41YBWNpqhcuag1ZMNwloCqGa9zJSfMq6K8wi/85cD1D9KlDr4gdBCvTce/jrA5Lwi1bAI29lqVSXhqyghLwBoH8PTVIDoXR1taomOW9duN6qfWRlqVBpswI9jB+Urka1JhlLxeEXpYDJT+mCjUryPUDDrDopXQs7AaNxnnZj8Bmr9LcjOxiUfg/gLuEnJ0AxDwmRgvgFFRC76PxjlCo2AXC0ymSIF9IA0AXaDUE/iGfphHJ79mMA7R38hC7A7AkW8VtUQOyiwiWUkrUAlN2aBPnMHCF0Web6oHWyRKRmLwGhvYoflCxDQmSX+LtUQOwi3bOUgoHv9UYIlmWuD/xCEpDUw8+C9A38oFiGhKhO8XeqgOikohkKQnf14spvP9eckZJZWSkBe0QpIfXwDBD0KfygmIWEqA74OyggdtGFEEq5Iz1o6Yiaw06IGghRjstc71dgUcB3h0OgRJ/EDw7jMCeqDf42Chi7JFc9kHM6CmC03FnqYb78GmV1RJcm6le5ajjpj4L0UfwU+ahWR7Q2UdsoIDap8EVKyIc9PIndFE9f1m4I6hxj6qEX0efx42XER7Xgb1HA5KRLnkaiP9cHt572CmtQUPWwDh7ztt89oVLKxh/t5ojngtwR6dwfjmolapo4aCtqkXz+CvJrb3Zz0bRhb4CBG2b2mFsUEJOk+wwEz0ntacxwW4wdYYtrtRzSfqvD7SYW4unxtla7IbAt1u2HPgOIZPwaBUHmQyPwoKtDl6DfLriMN06XWHNQaxEfxWPlFfDIknOuSqPqEihspfSyeLYznowb2MJSVW3A4rdKUX/DKEWMdFqCRk5h8Nm/blgVz7w11xVq/SVAGn7GujNqKGZ5OQtieOHEBXxWWC5IJ5KgEXq1D+aGV/EKmJSkW04I1ggxB/nYwMNNxZMNdlHhmQQXnNHdwr++rULgEBu8lOSG04W3sCOjVkhUl8+v1XC8TKFGKVbsSwlM5um2H1oOEEH87WXO9HTG7glDhbpqeR788wkUNghjEyeQrkD8hGReAbELdbnUFFK22Pau9YeNpq3l+sK7l1FQdJvn++pNbwQO0QiJEXweu6hIkAZArnZDYIRJAYdzm0PiYvhaaP6YMhqhjuJf+i+LruLZY8Wd9qEkBByVsv3SXMRPiCB8MkVP2LslGBeaGGaPMcP7wWgE3F1VYH//crAeH/+nEkPc1Uh5ewgqqw04kMvyL9KbUklQWt6EH/bViWGmCqr2zpheYgCnEIW/tVAXjQpVM8LF9NNCs7+yDtG/doyvPR/kjrdDvbE4rwg7Sq+LlUlh4LxJzMLCOQDZJparNd3a170w1NemDevfXi3B5avWjSR3iY1ivnZaJQdQyfiHO9iiYKo0d+f3qno8uP90BziTBw9A+oMh/O9kR7aUqZxPYhfp1lCK5VK4zLRKBcG86QMRNdoOZZUGbN5TjQtlTXJEyeIhBMmZUysBUMn4HVRK1DwWAYXge38HWsbVWkz5zeTIutqYzsKq2wb+30RfN3wTEYgtl6ow/0ihyPGQZBKzsCgNoHEiOfoaWZo2roJNoSz8/504DNM9nESPaeXJi/jkzys8fcZDIZjo4gD3H/NQp+f438wWVYT2FHKrRW3DaSR2oe48BYJEo+hDhAQozIzj8+Ky8IcNtMex2JGiRtRkpLDZldNCuzp0CF4P8cKBqjo8vN90Lpi3tcyKWkw+YDlk1SyokMQs1LETr2svRBQ8aUTMUnpujitGDesHXUkTUnZfR85JWd5mvdakANn4Vw71wMejfC0OwEiBsMyTYJZOlEt/rNVd5ekPRYciysUBYzJOtnjL12aEw1mj4t+Mq7cEz8J6pgAptpO0me6E2tVJhW0f+oAQ4GJZE3w9TWbrq/8ul6WEZgV0C9czAYPxaZgfVAxUu3bp5m2MSM/HDYMR344LwjwfV0w/eBZ7r9QgxNEWZ6aMxrqiCiw9ZjKdv7jfH0xe4tFCbL5o8hMtNUkK+Ps8VwR4a8BWhJxGKYWPhwZOjko8/85lnC2+zStgw2pvGDjK+xNFpU34dIsw8Ob+m7RxFd1yPNgZ8ISXM57yY2VAHZuBUrxbcBlrzpfzB+/5uDG8Mpz2HIXeSHFl+li42aig2mnanuK9XZAaGYz3zl7GK38Ihi+aJG1Bez71g52tQs7ct+Fh/srkxXecrV/W+YNZVKy1fyawfq5p464yBcjagjZFBGGBryvfxa7L1/HjlWoU1DWCrS8vWw0fH3rabxAGqJUITc/HmbpGmA/u2AMFfLBuY3ggrzyPH/NQfkuPcCd7HI0ZCUtOW6sxXZN0CDMveJCzyfyS2yJH2WFpggvyzzUi43ADpj3ggNCgftj2Uw3SD9Wjpp4THUvqziGcM+k+jHPuD3Zgrsq/2GXE006pwFAHW5yoMVk1Lw3zxAcjffgth2097P/st/vS83G6rhH3Odrh1JRR2HihEkm5OqFpYofw3TdDVyS64tGH7hRZ7MqsxdrvZBWWyTJDWfyHxYE+OFeGf55iMTzxzfzWPPr7WfxUXoN1YwOw2H8Qhuw9htLGJqlvQFq3HDHxsDtS+nlq4DlIhbIKg2znTY4jZg7ApZZew5PZ5yUNgYWuG2aOg1pBYLf7CBo5I4qmhcHf3gaKHdn81vW4lzN2RQ0VqVzeEZMfipCEvieICVmgnVphEBuKYKeM4YlI3vuVGDLgeY7HjsKoAXZYkleEr4srEGBvA920MGwrqcLcHJP3u2a0L5YHe7RsURaHTcgCErOoaDAoZe6dBKe8a7HjRtphTtxAeLurcfD4DWzZWwOWJ+iBZgrGxZZxUIvDP819IH56YDi/dbAtREpjCrj5+DikX63FjIMs8QZeFpPJ4kMsTsQas4rc+6kRkHYcxTdMUeIumikYxx6KDUcLAQ4PtcX7Kzx4shuNRtjbKlDXwGH2Py7yEVRrNgLkZW4INIUzRYajzXa8ef+Wiqd1yHlZ4GB8HuaPc/WNGP5LPi/K184GF/4ShrzqGwjXnhISn4f4qHBJCZnZUwZgRGA/XnCH0DcFIkfbQakEFr9ZipJyPZ6a6YT50514b7ekvAmkE0enNUq2ygqKbyP15xoh8ADFSm1K4CcmBYhLyJyeMhojHG1bTEbhTjqnYPnjfQ+P4B+2XunmA3rSr2eQVSkQUqdYiYSoTySlJNO+9IdaZXmnYhP/9GsmB8TsZEkdqGBCRmZKkpmd7MD8vkSWxdUyDLbtrAj2wCt/XGoJupkP318r6/BIJzmDdnPQNiXJHsYs1H0OYJmlyXIeoISHm9pE0s4bNlKKpMedERZii+/SanDqz1tgOWM/Lw2SN1dBV3IbCktvQLNeq2s5lFUKxlA6ScofFsQvdSGIpR/mYIuzzbkF+91HcJMT3G/bJuVZR9YoS+lvp8Calzzh730nOsCUsX6n6CyRmDH3SFmKmI47oxnq0I+PB7HzQWTivvOyFCb8XmGWdDWwMAQLRzx/vBifN0dJBaR0XpjFmEylic45d/EihsQRk+M1yuvjLZYmOutZVOwuXcSQCB84juvq8V2WJvJbEX8bBqzK4G5fyBAaTT0UCNd+HfinRULTbZi+iZ9ThGPO+Db475WnC6ndOs850eXp5v7uXdCwzsw3W4zSLmjcUcK9K0rdVAMn+4qSueOYhYUzAfJNL5wJDZTSxH0pQbu7NQk7Ds0E7R38oDQRCRMs4hcVgOuFa6r5MBrn/t9eU2UXMUDmWuWaqnn1xcef1lx3sF0FBX1NahW16BVM0EhB3nGpbfxo+/ZQ61Z4pZ7WgNSxG/6vyamiFjkGls98B3D8CAni8It6A1p3PinxnBfUqpUEWGLNTxWAYiOnML6/f31wqcjByiNLPeQFQlbC2vhBN0KheB9PRErCL1kB5lGzOwUqTrUAwDwK3C8jn0AJcAzAFoPSsLml1l/etErnYncKNPoF/I12mfjB8BNsQZN6M6v1lw7CSkkYU1LHGE0IGU+NNASE+BPAjTZ/U4IADZR9robSYqIgBZTSHBBFlnZ9gKnCqbfb1uzBUCMawHhQhEBB/UH5z+2Yv4nRAIJKGEkxCFjJWw70yMLcyG7j/x8ytDivXGAFzgAAAABJRU5ErkJggg==)
        no-repeat 0 0;
      width: 48px;
      height: 48px;
      border: 0px;
    }
  }

  .el-aside {
    position: absolute;
    right: 0;
    background-color: rgba(0, 0, 0, 0.8);
    z-index: 20;
    height: 100%;
    box-shadow: 0 8px 10px -5px rgba(0, 0, 0, 0.3), 0 16px 24px 2px rgba(0, 0, 0, 0.3), 0 6px 30px 5px rgba(0, 0, 0, 0.3);

    h3 {
      height: 67px;
      line-height: 67px;
      text-align: center;
      border-bottom: solid 1px #595959;
      font-size: 16px;
      font-weight: 600;
      font-stretch: normal;
      letter-spacing: 0px;
      color: #fff;
    }

    .el-form {
      padding: 0 14px;
      margin-bottom: 30px;

      .el-form-item {
        margin-bottom: 0;
        padding: 12px 0;
        border-bottom: solid 1px #595959;
      }

      /deep/ .el-form-item--medium .el-form-item__label {
        color: #fff;
      }

      /deep/ .el-buttonact {
        border-radius: 4px !important;
        background-color: #006fe6;
        color: #fff;
        border-color: #006fe6;
      }

      /deep/ .el-buttons {
        border-radius: 4px;
        background-color: #fff;
        color: #006fe6;
        border-color: #006fe6;
      }

      /deep/ .el-input-number--small .el-input-number__decrease {
        display: none;
      }

      /deep/ .el-input-number--small .el-input-number__increase {
        display: none;
      }

      /deep/ .el-input--small .el-input__inner {
        padding: 0;
        background-color: #000000;
        border-color: #969696;
        color: #fff;
      }
    }

    .realTimeCharts {
      width: calc(100% - 28px);
      padding: 0 14px;

      .RightCon {
        width: 100%;
        margin-bottom: 20px;
      }
    }

    h4 {
      margin: 0 14px 20px;
      font-size: 16px;
      font-weight: normal;
      font-stretch: normal;
      letter-spacing: 0px;
      color: #006fe6;
      text-align: left;
    }
  }
}
/deep/ .el-radio__input.is-disabled .el-radio__inner {
  margin-top: -1px;
}
</style>