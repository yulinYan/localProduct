<template>
  <div class="containersty">
    <div class="contents">
      <div class="table-title">
          <div class="buttons">
              <div>
                <span class="spansty">操作人:</span>
                <el-input v-model="lightId" placeholder="SN搜索" size="small" class="inputsty1" clearable  onkeyup="this.value=this.value.replace(/\s+/g,'')" />
              </div>
            <div>
              <span class="spansty">发送命令:</span>
              <el-input v-model="commond" placeholder="命令搜索" size="small" class="inputsty1" clearable  onkeyup="this.value=this.value.replace(/\s+/g,'')" />
            </div>   
            <div v-if="false">
              <span class="spansty" >操作结果:</span></span>
              <el-select v-model="sendResult" placeholder="请选择" size="small" class="inputsty2" clearable>
                <el-option v-for="(item, index) in companyOptions" :key="index" :label="item.label" :value="item.value" />
              </el-select>
            </div>
            <div v-if="false">
              <span class="spansty">返回结果:</span>
              <el-select v-model="backResult" placeholder="请选择" size="small" class="inputsty2" clearable>
                <el-option v-for="(item, index) in companyOptions" :key="index" :label="item.label" :value="item.value" />
              </el-select>
            </div>
             
            <span class="spansty">时间段:</span>
            <div style="text-align:left">
              <el-date-picker v-model="startTime" :editable="false" :picker-options="startpickerOptions" size="small" type="date" placeholder="开始日期" />
              <span> 至 </span>
              <el-date-picker v-model="endTime" :editable="false" :picker-options="endpickerOptions" size="small" type="date" placeholder="结束日期" />
              <el-button class="flt" size="mini" type="primary" icon="el-icon-search" @click="searchInfo">搜索</el-button>
              <el-button  class="flt" icon="el-icon-refresh-left"  size="mini" type="primary" @click="resetFrom">重置</el-button>
            </div>
           </el-col> 
          </div>
      </div>
      <div class="tabsty">
        <el-table ref="multipleTable" :data="tableList" tooltip-effect="dark" height="calc(100vh - 220px)" show-overflow-tooltip>
          <el-table-column  type="index" label='序号'/>
          <el-table-column prop="ledSn" align="center" label="操作人" show-overflow-tooltip />
          <el-table-column prop="operateTime" align="center" label="发送时间" show-overflow-tooltip />
          <el-table-column width='680' prop="commandInfo" align="center" label="发送命令" show-overflow-tooltip />
          <el-table-column prop="operateResult" align="center" label="操作结果" show-overflow-tooltip />
          <el-table-column prop="backTime" align="center" label="返回时间" show-overflow-tooltip />
          <el-table-column prop="backResult" align="center" label="返回结果" show-overflow-tooltip/>
        </el-table>
        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="pageSizes"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
        </el-pagination>
      </div>
    </div>
    
  </div>
</template>
<script>

export default {
  name:"InstructionLog",
    components: {
    },
    data() {
        return {
            startTime: '', //搜索开始时间
            endTime: '', //搜索结束时间
            lightId: '',
            commond:'',
            backResult:'',
            sendResult:'',
            companyOptions: [  // 0代表上线，-1代表下线
              {label:'成功',value:'true'},
              {label:'失败',value:'false'},
            ],
            tableList: [],
            currentPage:1,//当前第几页
            pageSize:20,//
            pageSizes:[20,60,200],
            total:0,//总共几条
            loading:false,
            startpickerOptions:{
                disabledDate:(time) => {
                    if (this.endTime !== "" && this.endTime !== null) {
                        return time.getTime() > this.endTime
                    } else {
                        return false
                    }
                }
            }, //开始日期配置
             endpickerOptions:{
                disabledDate:(time) => {
                    if (this.startTime != '' && this.startTime != null) {
                        return time.getTime() < this.startTime
                    } else {
                        return false
                    }
                }
            }, //结束日期配置
        }
    },
    mounted() {
        this.searchInfo()
    },
    methods: {
        searchInfo() {
            let startDate = ''
            let endDate = ''
            if (this.startTime !== null && this.startTime.length !== 0) {
                startDate = this.$moment(this.startTime).format("yyyy-MM-DD") 
            }
            if (this.endTime !== null && this.endTime.length !== 0) {
                endDate = this.$moment(this.endTime).format("yyyy-MM-DD")
            }
            console.log(startDate.toString())
            this.fetchDate(startDate,endDate)
        },
        fetchDate(startDate,endDate) {
            this.$axios.leansite({
              method: 'GET',
              url: this.API.leansite.instructionLog,
              params: {
                sn:this.lightId,
                commond:this.commond,
                sendResult:this.sendResult,
                backResult:this.backResult,
                startTime:startDate,
                endTime:endDate, 
                pageNum:this.currentPage,
                pageSize:this.pageSize
              }
            }).then((res) => {
              var resData = res.data;
              if(resData.code == 0) {
                this.tableList = resData.data.list;
                this.tableList.forEach((item,index)=>{
                  if(item.operateResult=='true'){
                    item.operateResult = '成功'
                  }else if(item.operateResult=='false'){
                    item.operateResult = '失败'
                  }else if(item.backResult=='true'){
                    item.backResult = '成功'
                  }else if(item.backResult=='false'){
                    item.backResult = '失败'
                  }
                })
                if(res.data.list!=null&&res.data.list.length==0){
                    this.$message({
                    type: 'info',
                    message: "暂无数据"
                  });
                }
                this.total = resData.data.total;
              } else if(resData.code == 1000) {
                this.$message({
                  type: 'error',
                  message: resData.msg
                })
              }
            })
        },
        /**
         *重置
         */
        resetFrom() {
            this.lightId=''
            this.status=''
            this.startTime='' //搜索开始时间
            this.endTime=''
            this.commond=''
            this.backResult=''
            this.sendResult=''
            this.currentPage=1,//当前第几页
            this.pageSize=20,
            this.searchInfo()
        },
        /**
         *分页    每页显示条目个数 变化时触发
         */
        handleSizeChange(val) {
          this.pageSize = val
          this.searchInfo()
        },
        /**
         *分页  当前页数 变化时触发
         */
        handleCurrentChange(val) {
          this.currentPage = val
          this.searchInfo()
        },
    }
}
</script>

<style lang="scss" scoped>
.containersty {
  height: calc(100vh - 55px);
  background: #fff;
  min-width:1700px;
  overflow:auto;
  border-radius: 10px;
  .contents {
    /* min-width:1176px;
    overflow: auto; */
    padding-top: 0px;
    .table-title {
      height: 40px;
      margin: 24px 40px;
      margin-bottom: 0px;
      padding-top: 2px;
    /deep/ .el-date-editor.el-input {
        height: 36px;
        width: 10% !important;
      }
    }
    .tabsty {
      margin: 10px 40px;
      margin-top: 17px;
      border: 1px solid #bebebe;
      padding: 0px 10px;
      /* padding-bottom: 10px; */
      .el-table td,
      .el-table th.is-leaf,
      .el-table--border,
      .el-table--group {
        border-color: #bebebe;
      }
      .el-table--border::after,
      .el-table--group::after {
        background-color: #bebebe;
      }
      .el-table::before {
        background-color: #EBEEF5 !important;
      }
      /deep/ .is-leaf {
        border-bottom: 1px solid #bebebe;
        color: #323232;
      }
      /deep/ .el-table__row td {
        border-bottom: 1px solid #bebebe;
        // border-right: 1px solid #bebebe;
      }
    }
  }
  .buttons {
    margin-right: 15px;
    /deep/ .el-button--mini {
      padding: 7px 20px;
      background-color: #006fe6;
      border-color: #006fe6;
    }
    /deep/ .el-button--text {
      color: #006fe6;
    }
    .flt {
      margin-left: 15px;
    }
    .spansty {
      margin-right: 15px;
      float: left;
      display: block;
      padding-top: 8px;
      font-size: 14px;
    }
    .inputsty1 {
      margin-right: 15px;
      float: left;
      width: 180px;
    }
    .inputsty2 {
      margin-right: 15px;
      float: left;
      width: 120px;
    }
  }
  /deep/ .el-pagination {
      margin: 25px 0 5px 0;
      text-align: right;
  }
  /deep/ .el-input__inner{
    color: #2c5ac2 !important;
    border: 1px solid #969696 !important;
    border-radius:4px;
  }
  /deep/ .el-input__inner:hover{
    border: 1px solid #323232 !important;
  }
  /deep/ .el-date-editor .el-input__inner {
      padding-left: 30px !important;
  }
}
</style>