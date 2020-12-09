 <!-- 灯具状态 -->
 <template>
  <div class="containersty">
    <div class="contents">
      <div class="table-title">
          <div class="buttons">
            <div>
              <span class="spansty">SN</span>
              <el-input v-model="lightId" placeholder="SN搜索" size="small" class="inputsty" clearable  onkeyup="this.value=this.value.replace(/\s+/g,'')" />
            </div>  
            <div>
              <span class="spansty">状态</span>
              <el-select v-model="status" placeholder="状态搜索关键字" size="small" class="inputsty" clearable>
                <el-option v-for="(item, index) in companyOptions" :key="index" :label="item.label" :value="item.value" />
              </el-select>
            </div>
              <span class="spansty">时间段</span>
              <div style="text-align:left">
              <el-date-picker v-model="startTime" :editable="false" :picker-options="startpickerOptions" size="small" type="date" placeholder="开始日期" />
              <span> 至 </span>
              <el-date-picker v-model="endTime" :editable="false" :picker-options="endpickerOptions" size="small" type="date" placeholder="结束日期" />
              <el-button class="flt" size="mini" type="primary" icon="el-icon-search" @click="searchInfo">搜索</el-button>
              <el-button  class="flt" icon="el-icon-refresh-left"  size="mini" type="primary" @click="resetFrom">重置</el-button>
            </div>
          </div>
      </div>
      <div class="tabsty">
        <el-table ref="multipleTable" :data="tableList" tooltip-effect="dark" height="calc(100vh - 264px)" show-overflow-tooltip>
          <el-table-column  type="index" label='序号'/>
          <el-table-column prop="sn" align="center" label="SN" show-overflow-tooltip />
          <el-table-column prop="status" align="center" label="状态" show-overflow-tooltip />
          <el-table-column prop="createTime" align="center" label="记录时间" show-overflow-tooltip>
            <!--<template slot-scope="scope">
              {{ scope.row.createTime !== null ? scope.row.createTime.substring(0, scope.row.createTime.length - 3) : '' }}
            </template>-->
          </el-table-column>
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
  name:"FaultMonitoring",
    components: {
    },
    data() {
        return {
            status: '', // 状态
            datavalue: [],
            startTime: '', //搜索开始时间
            endTime: '', //搜索结束时间
            lightId: '',
            companyOptions: [  // 0代表上线，-1代表下线
              {label:'上线',value:'0'},
              {label:'下线',value:'-1'},
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
                startDate = this.$moment(this.startTime).format("yyyy-MM-DD") + ' 00:00:00'
            }
            if (this.endTime !== null && this.endTime.length !== 0) {
                endDate = this.$moment(this.endTime).format("yyyy-MM-DD") + ' 23:59:59' 
            }
            this.fetchDate(startDate,endDate)
        },
        fetchDate(startDate,endDate) {
            this.$axios.leansite({
              method: 'GET',
              url: this.API.leansite.seachDataByNeeds,
              params: {
                sn:this.lightId,
                startime:startDate,
                endtime:endDate, 
                status:this.status,
                pageNum:this.currentPage,
                pageSize:this.pageSize
              }
            }).then((res) => {
              var resData = res.data;
              if(resData.code == 0) {
                this.tableList = resData.data.list;
                this.tableList.forEach((item,index)=>{
                  if(item.status==0){
                    item.status = '上线'
                  }else if(item.status==-1){
                    item.status = '下线'
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
  min-width:1176px;
  overflow:auto;
  border-radius: 10px;
  .contents {
    min-width:1176px;
    overflow: auto;
    padding-top: 0px;
    .table-title {
      height: 40px;
      margin: 24px 40px;
      margin-bottom: 0px;
      padding-top: 2px;
    /deep/ .el-date-editor.el-input {
        height: 36px;
        width: 13% !important;
      }
    }
    .tabsty {
      margin: 10px 40px;
      margin-top: 17px;
      border: 1px solid #bebebe;
      padding: 0px 10px;
      padding-bottom: 10px;
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
    .inputsty {
      margin-right: 15px;
      float: left;
      width: 200px;
    }
    /deep/ .el-input--small .el-input__inner {
          height: 32px;
          line-height: 32px;
          border-color: #969696;
        }
        /deep/ .el-input__inner:hover{
          border-color: #323232;
        }
  }
  /deep/ .el-pagination {
      margin-top: 30px;
      text-align: right;
  }
}
</style>