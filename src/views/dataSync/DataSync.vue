<template>
	<div class="outputBox">
		<div class="event_body">
			<h1>数据更新</h1>
			<div class="container_header">
				<el-button type="primary" @click="dataSync" style="background-color: #006fe6; border: none;height: 32px;">同步数据</el-button>
				<el-button v-show="showCleanBtn" type="primary" @click="dataClean" style="background-color: #006fe6; border: none;height: 32px;">清除数据</el-button>
			</div>
			<div class="table-title" style="overflow: hidden;"><span>-</span> 更新数据</div>
			<div class="container">
				<div class="logBox">
					<el-table ref="multipleTable" :data="tableData" tooltip-effect="dark" min-height='500' :show-header="false">
						<el-table-column prop="time" width="180">
						</el-table-column>
						<el-table-column prop="content" show-overflow-tooltip>
						</el-table-column>
					</el-table>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import Bus from '../../common/bus.js'
	export default {
		name: 'DataSync',//数据更新
		components: {},
		props: {},
		data() {
			return {
				tableData: [], //表格数据
				showCleanBtn:false
			}
		},
		mounted() {
			let storeCleanBtn = this.$store.getters['userCenter/getShowCleanBtn'];
			this.showCleanBtn = storeCleanBtn;
			this.listenerEvent();
		},
		methods: {
			/**
			 * 监听主线程事件
			 */
			listenerEvent(){
			    Bus.$on('controlCleanBtn', msg => {
			        this.showCleanBtn =  true;
			    })
			},
			/**
			 *同步文件
			 */
			dataSync() {
				this.dataSyncRequest()
			},
			/**
			 *清除数据
			 */
			dataClean() {
				this.$confirm('此操作将清除数据库数据, 是否继续?', '提示', {
		          confirmButtonText: '确定',
		          cancelButtonText: '取消',
		          type: 'warning'
		        }).then(() => {
		        	this.dataCleanRequest()
		        })
			},
			/**
			 * 同步数据接口
			 */
			dataSyncRequest() {
				this.$axios.leansite({
					method: 'get',
					url: this.API.leansite.dataSync,
					params: {
						code: this.$store.getters['userCenter/getTenantCode']
					}
				}).then((res) => {
					var resData = res.data;
					if(resData.code == 0) {
						this.tableData = [];
						for(let d in resData.data){
							if(d != 'time'){
								this.tableData.push({
									time:resData.data.time,
									content: resData.data[d]
								})
							}
						}
					} else if(resData.code == 1000) {
						this.$message({
							type: 'error',
							message: resData.msg
						})
					}
				})
			},
			/**
			 * 清除数据接口
			 */
			dataCleanRequest() {
				this.$axios.leansite({
					method: 'get',
					url: this.API.leansite.dataClean
				}).then((res) => {
					var resData = res.data;
					if(resData.code == 0) {
						this.$message({
							type: 'success',
							message: "操作成功"
						})
					} else if(resData.code == 1000) {
						this.$message({
							type: 'error',
							message: resData.msg
						})
					}
				})
			}
		}

	}
</script>

<style lang="scss" scoped type="text/css">
	.outputBox {
		background: #fff;
		width: 100%;
		/* height: calc(100vh - 171px); */
		height: -webkit-calc(100vh - 171px);
		height: -moz-calc(100vh - 171px);
		overflow: hidden;
		.event_body {
			width: 95%;
			margin: 20px auto;
			h1 {
				font-size: 30px;
				color: #323232;
				margin-bottom: 20px;
			}
			div.table-title {
				margin-top: 24px;
				height: 48px;
				line-height: 48px;
				border-radius: 3px 3px 0 0;
				/*margin: 24px 40px 0;*/
				padding: 0 16px;
				background-color: #FFFFFF;
				border: solid 1px #bebebe;
				/*border-bottom:none;*/
				span {
					font-weight: bold;
					font-size: 18px;
					margin-right: 10px;
				}
			}
			.container {
				border: 1px solid #bebebe;
				border-top: none;
				border-radius: 0 0 3px 3px;
				overflow: hidden;
				/*min-height: 787px;*/
			}
			.logBox {
				width: 99%;
				margin: 0 auto;
				/deep/ .el-table {
					max-height: 680px;
					overflow: auto;
					height: 680px;
					/deep/ .is-leaf {
						border-bottom: none !important;
					}
					td {
						border-bottom: none !important;
					}
					/deep/ .el-pagination {
						margin-top: 30px!important;
						text-align: center;
					}
				}
				/deep/ .el-table__empty-block{
					height: 670px !important;
				}
			}
			.bottom {
				width: 100%;
				padding: 24px 0;
			}
		}
	}
</style>