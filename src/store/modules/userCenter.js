import vue from 'vue';
import api from "../../common/api.js" //引入接口 

/**
 * 用户中心模块
 */
const state ={
	user: null, //存储用户信息
    token: null, //请求令牌
    tenantCode: null, //租户编号
    showCleanBtn:null,//显示清除按钮
};
//修改state中的值
const mutations = {
	/**
	 * 操作 user
	 * @params {Object} oOptData
	 * @params {Number} oOptData.data
	 * @params {Number} oOptData.optType ：save/del 
	 */
	set_user(state,oOptData){
		if(oOptData.optType == 'save'){
			localStorage.setItem(api.constObj.projectName+"user",JSON.stringify(oOptData.data));
			if(state.user){//判断state中的该属性是否已存在
				state.user = oOptData.data;	
			}else{
				//state中的该属性不存在时，新增属性并赋值
				vue.set(state,'user',oOptData.data);	
			}
		}else{
			localStorage.removeItem(api.constObj.projectName+"user");
			vue.delete(state,'user');
		}
	},
	/**
	 * 操作 token
	 * @params {Object} oOptData
	 * @params {Number} oOptData.data
	 * @params {Number} oOptData.optType ：save/del 
	 */
	set_token(state,oOptData){
		if(oOptData.optType == 'save'){
			localStorage.setItem(api.constObj.projectName+"token",oOptData.data);
			if(state.token){//判断state中的该属性是否已存在
				state.token = oOptData.data;	
			}else{
				//state中的该属性不存在时，新增属性并赋值
				vue.set(state,'token',oOptData.data);	
			}
		}else{
			localStorage.removeItem(api.constObj.projectName+"token");
			vue.delete(state,'token');
		}
	},
	/**
	 * 操作 tenantCode
	 * @params {Object} oOptData
	 * @params {Number} oOptData.data
	 * @params {Number} oOptData.optType ：save/del 
	 */
	set_tenantCode(state,oOptData){
		if(oOptData.optType == 'save'){
			localStorage.setItem(api.constObj.projectName+"tenantCode",oOptData.data);
			if(state.tenantCode){//判断state中的该属性是否已存在
				state.tenantCode = oOptData.data;	
			}else{
				//state中的该属性不存在时，新增属性并赋值
				vue.set(state,'tenantCode',oOptData.data);	
			}
		}else{
			localStorage.removeItem(api.constObj.projectName+"tenantCode");
			vue.delete(state,'tenantCode');
		}
	},
	/**
	 * 操作 showCleanBtn
	 * @params {Object} oOptData
	 * @params {Number} oOptData.data
	 * @params {Number} oOptData.optType ：save/del 
	 */
	set_showCleanBtn(state,oOptData){
		if(oOptData.optType == 'save'){
			if(state.showCleanBtn){//判断state中的该属性是否已存在
				state.showCleanBtn = oOptData.data;	
			}else{
				//state中的该属性不存在时，新增属性并赋值
				vue.set(state,'showCleanBtn',oOptData.data);	
			}
		}else{
			vue.delete(state,'showCleanBtn');
		}
	},
	/**
	 * 清空该模块下所有数据
	 * 该方法各个模块下建议添加上
	 */
	clear_moduleStore(state){
		let oState = {...state};
		for (let k in oState) {
			localStorage.removeItem(api.constObj.projectName+k);
			vue.delete(state,k);
		}	
	}
};
// 接收组件的发送过来的请求，提交给mutations处理 
const actions = {
	/**
	 * 设置user数据
	 * @params {Object} options 参数对象
	 * @params {Object} options.data 参数数据
	 * @params {Object} options.optType 操作类型 save/delete
	 * @return {Object} 响应数据
	 */
	 setUser:(store, options) =>{
	 	if(!options.optType){
			options.optType = "save";
		}
    	let oNewObj = {
    		data:{},
    		optType:options.optType
    	};
	 	var dataValue = options.data;
	 	if(oNewObj.optType == "save" && typeof dataValue !="string"){
	 		oNewObj.data = dataValue;
	 	}
    	store.commit('set_user',oNewObj);  
   },
    /**
	 * 设置token数据
	 * @params {Object} options 参数对象
	 * @params {Object} options.data 参数数据
	 * @params {Object} options.optType 操作类型 save/delete
	 * @return {Object} 响应数据
	 */
	 setToken:(store, options) =>{
		if(!options.optType){
			options.optType = "save";
		}
    	let oNewObj = {
    		data:'',
    		optType:options.optType
    	};
	 	var dataValue = options.data;
	 	if(oNewObj.optType == "save"){
	 		oNewObj.data = dataValue;
	 	}
    	store.commit('set_token',oNewObj);  
   },
    /**
	 * 设置tenantCode数据
	 * @params {Object} options 参数对象
	 * @params {Object} options.data 参数数据
	 * @params {Object} options.optType 操作类型 save/delete
	 * @return {Object} 响应数据
	 */
	 setTenantCode:(store, options) =>{
		if(!options.optType){
			options.optType = "save";
		}
    	let oNewObj = {
    		data:'',
    		optType:options.optType
    	};
	 	var dataValue = options.data;
	 	if(oNewObj.optType == "save"){
	 		oNewObj.data = dataValue;
	 	}
    	store.commit('set_tenantCode',oNewObj);  
   },
    /**
	 * 设置showCleanBtn数据
	 * @params {Object} options 参数对象
	 * @params {Object} options.data 参数数据
	 * @params {Object} options.optType 操作类型 save/delete
	 * @return {Object} 响应数据
	 */
	 setShowCleanBtn:(store, options) =>{
		if(!options.optType){
			options.optType = "save";
		}
    	let oNewObj = {
    		data:'',
    		optType:options.optType
    	};
	 	var dataValue = options.data;
	 	if(oNewObj.optType == "save"){
	 		oNewObj.data = dataValue;
	 	}
    	store.commit('set_showCleanBtn',oNewObj);  
   },
    /**
	 * 清空该模块下所有数据
	 * 该方法各个模块下建议添加上
	 */
   	clearModuleStore:(store)=>{
   		store.commit('clear_moduleStore');
   	}
};
/**
 * 用来获取更新后的数据
 */
const getters={
	/**
	 * 获取user数据
	 */
	getUser: (state) => {
		let aNewVal = state.user; 
		if(!state.user){
			let aLocalStorage =localStorage.getItem(api.constObj.projectName+'user');
			aNewVal =aLocalStorage!=null?JSON.parse(aLocalStorage):{};
		}
		return aNewVal;
	},
	/**
	 * 获取token数据
	 */
	getToken: (state) => {
		let aNewVal = state.token; 
		if(!state.token){
			let aLocalStorage =localStorage.getItem(api.constObj.projectName+'token');
			aNewVal =aLocalStorage!=null?aLocalStorage:"";
		}
		return aNewVal;
	},
	/**
	 * 获取tenantCode数据
	 */
	getTenantCode: (state) => {
		let aNewVal = state.tenantCode; 
		if(!state.tenantCode){
			let aLocalStorage =localStorage.getItem(api.constObj.projectName+'tenantCode');
			aNewVal =aLocalStorage!=null?aLocalStorage:"";
		}
		return aNewVal;
	},
	/**
	 * 获取showCleanBtn数据
	 */
	getShowCleanBtn: (state) => {
		let aNewVal = state.showCleanBtn; 
		if(!state.showCleanBtn){
			aNewVal =aNewVal!=null?aNewVal:false;
		}
		return aNewVal;
	}
};
export default {
	namespaced:true,//启用命名控件模式
	state,
	mutations,
	actions,
	getters
};