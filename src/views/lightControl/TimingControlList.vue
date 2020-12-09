<template>
  <div>
    <div class="timingBox">
      <div class="listArea" v-if="!isTimingExecuteResult">
        <div class="top">
            <h1>定时控制</h1>
        </div>
        <el-form :inline="true" ref="formData" class="demo-form-inline2">
          <el-form-item label="任务名称">
            <el-input v-model="timingName" placeholder="请输入任务名称" onkeyup="this.value=this.value.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g,'')"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" class="el-icon-search" @click="handleSearch" style="background-color: #006fe6; border: none;height: 32px;">&nbsp;搜索</el-button>
          </el-form-item>
        </el-form>
        <div class="tebleBox">
        <el-table :data="tableData" max-height="680" border empty-text="暂无数据" style="width: 100%">
          <el-table-column type="index" align="center" width="80" label="序号"></el-table-column>
          <el-table-column prop="name" align="center" label="任务名称" ></el-table-column>
          <el-table-column prop="switchName" align="center" label="分组名称" ></el-table-column>
          <el-table-column prop="scheduleCycleWeek" align="center" label="任务周期" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column prop="status" align="center" label="任务状态"  >
            <template slot-scope="scope">
              <el-switch style="display: block;cursor: pointer;" v-model="scope.row.status" active-color="#13ce66" inactive-color="#ff4949" :active-value="0" :inactive-value="1" @change="(newValue)=>changeStatus(newValue,scope.row.id)">
              </el-switch>
            </template>
          </el-table-column>
          <el-table-column align="center" label="操作" min-width="80">
            <template slot-scope="scope">
              <el-button size="mini"  type="text" title="执行结果"  @click.prevent.stop="handleExecuteResult(scope.$index, scope.row)">
                <!-- <i class="el-icon-search iconStyle"></i> -->
                查看记录
              </el-button>

            </template>
          </el-table-column>
        </el-table>
        <Pagination :pageIndex="pageObj.pageIndex" :total="pageObj.total" :pageSize="pageObj.pageSize" @PageTurning="PageTurning"></Pagination>
      </div>
      </div>
      <TimingExecuteResult v-if="isTimingExecuteResult" :timingObj=oTiming @TimingExecuteResultCallBack=TimingExecuteResultCallBack></TimingExecuteResult>
    </div>
  </div>
</template>

<script>
import Pagination from '../../components/Pagination.vue'
import TimingExecuteResult from './TimingExecuteResult'
export default {
  name: 'TimingControlList', //定时控制列表
  components: {
    Pagination,
    TimingExecuteResult
  },
  data() {
    return {
      pageObj: {
        pageIndex: this.API.leansite.constObj.pageIndex, //当前页码
        total: 0, //数据总数
        pageSize: this.API.leansite.constObj.pageSize //页大小
      },
      timingName: '', //
      tableData: [],
      isTimingExecuteResult: false, //是否显示执行结果界面
      oTiming: {}, //选中的定时控制对象
      isOpting: true
    }
  },
  created() {
    this.getTimingData()
  },
  mounted() {},
  methods: {
    /*
     * 分页组件回调方法--子组件回传数据的方法
     * @page_obj {Object} 分页信息
     * page_obj.page_index 当前页下标
     * page_obj.page_size 页大小
     */
    PageTurning(page_obj) {
      this.pageObj.pageIndex = page_obj.page_index
      this.pageObj.pageSize = page_obj.page_size
      this.getTimingData()
    },
    /*
     * 执行结果组件回调方法--子组件回调数据的方法
     */
    TimingExecuteResultCallBack() {
      this.isTimingExecuteResult = false
    },
    /**
     * 监听table search事件
     */
    handleSearch() {
      this.pageObj.pageIndex = this.API.leansite.constObj.pageIndex
      this.getTimingData()
    },
    /**
     * 监听table中"switch"按钮click事件
     */
    changeStatus(newValue, id) {
      if (this.isOpting) {
        this.isOpting = false
        this.changeTaskStatusRequest(newValue, id)
      }
    },
    /**
     * 监听table中"执行结果"按钮click事件
     */
    handleExecuteResult(index, row) {
      this.oTiming = row
      this.isTimingExecuteResult = true
    },
    /*
     * 日期格式化
     */
    dateFormat(row, column, cellValue, index) {
      return this.commonFun.dateFormat(cellValue, 'yyyy-MM-dd HH:mm')
    },
    /**
     * 切换任务状态请求
     * @param {Number} statusVal 改变后的status值
     * @param {Number} taskId 任务id
     */
    changeTaskStatusRequest(statusVal, taskId) {
      let submitUrl = this.API.leansite.startTask
      if (statusVal === 1) {
        submitUrl = this.API.leansite.stopTask
      }
      this.$axios
        .leansite({
          method: 'get',
          url: submitUrl,
          params: {
            taskSchedulerId: taskId
          }
        })
        .then(res => {
          this.isOpting = true
          var resData = res.data
          if (resData.code == 0) {
            this.$message({
              type: 'success',
              message: '操作成功！'
            })
            // this.pageObj.pageIndex = this.API.leansite.constObj.pageIndex
            // this.timingName = '' //重置查询条件表单
            this.getTimingData()
          } else if (resData.code == 1000) {
            this.$message({
              type: 'error',
              message: '操作失败：' + resData.msg
            })
            let findIndex = this.tableData.findIndex(item => {
              return item.id == taskId
            })
            if (findIndex != -1) {
              let beforeChange = statusVal == 0 ? 1 : 0
              this.tableData[findIndex].status = beforeChange
            }
          }
        })
    },
    /**
     * 多条件分页查询获取定时控制列表请求
     */
    getTimingData() {
      this.$axios
        .leansite({
          method: 'get',
          url: this.API.leansite.getTaskByPage,
          params: {
            name: this.timingName.trim(),
            pageNum: this.pageObj.pageIndex,
            pageSize: this.pageObj.pageSize
          }
        })
        .then(res => {
          var resData = res.data
          if (resData.code == 0) {
            this.tableData = resData.data.list
            this.pageObj.total = resData.data.total
          }
        })
    }
  }
}
</script>

<style lang="scss" scoped type="text/css">
.timingBox {
  /* height: calc(100vh - 105px);
  height: -webkit-calc(100vh - 105px);
  height: -moz-calc(100vh - 105px); */
  overflow-y: auto;
  margin: 0 auto;
  padding: 0 40px;
  h2 {
    margin: 10px 0;
    font-size: 36px;
    color: #323232;
    font-weight: normal;
  }
  .el-row {
    margin-bottom: 20px;
    .el-col {
      &:last-child {
        text-align: right;
      }
    }
  }
	.listArea{
    .top{
      margin-top:20px;
      h1 {
				font-size: 30px;
				color: #323232;
				margin-bottom: 20px;
			}
        div{
            font-size: 14px;
            margin-top: 24px;
            .backMain{
            	cursor: pointer;
            }
            span{
                color: #006fe6;
                margin-right: 10px;
             }
            .el-icon-arrow-right{
                color: #969696;
            }
            &:last-child{
                 height: 36px;
                 font-family: MicrosoftYaHei-Bold;
                 font-size: 36px;
                 line-height: 36px;
                 color: #323232;
                 margin: 25px 0;
             }
        }
    }
  }
  .tebleBox {
    width: 100%;
    border:1px solid #bebebe;
    border-radius: 3px;
    /deep/ .el-table {
      width: 98% !important;
      margin:0 auto;
      border:none;
      max-height:646px;
      .iconStyle{
      	font-size: 16px;
      }
     
    }
  }
  /deep/ .el-table__body-wrapper{
    height:660px
  }
  /deep/ .el-table--border th{
    border-right: none;
    color: #323232;
    border-bottom: 1px solid #bebebe;
  }
  /deep/ .el-table--border td{
        border-right: none !important;
        border-bottom: 1px solid #bebebe !important;
      }
      /deep/ .el-table--border::after{
        width: 0 !important;
      }
      /* /deep/ .el-table::before{
        width: 0 !important;
      } */
      /deep/ .el-table__empty-block{
        height: 660px !important;
      }
  /deep/ .el-input--medium .el-input__inner {
    height: 32px;
    line-height: 32px;
    border-color: #969696;
  }
  /deep/ .el-input__inner:hover{
    border-color: #323232;
  }
  /deep/ .pagination-con .el-pagination{
    text-align: right;
  }
}
</style>