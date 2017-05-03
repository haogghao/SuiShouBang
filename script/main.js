var queryId = null;
var query = null;
var model = null;
var num = null;
var size = null;

apiready = function() {
	size = 0;
	var header = $api.byId('header');
	$api.fixIos7Bar(header);
	login();
	getNum();
	showlist();
	//发布监听
	api.addEventListener({
	    name:'fabu_done'
    },function(ret,err){
    	api.showProgress({
			title : '加载中...',
			modal : false
		});
		alert("发布成功");
		//未完成
		//showlist();
		down_load_more();
		api.hideProgress();
		api.refreshHeaderLoadDone();
    });
	api.setRefreshHeaderInfo({
		visible : true,
		// loadingImgae: 'wgt://image/refresh-white.png',
		bgColor : '#f2f2f2',
		textColor : '#4d4d4d',
		textDown : '下拉刷新...',
		textUp : '松开刷新...',
		showTime : true
	}, function(ret, err) {
		api.showProgress({
			title : '加载中...',
			modal : false
		});
		//未完成
		//showlist();
		down_load_more();
		api.hideProgress();
		api.refreshHeaderLoadDone();
	});
	api.addEventListener({
		name : 'help'
	}, function(ret, err) {
		alert("状态改变");
		var hon = document.getElementById("help_or_not");
		hon.innerHTML = "已有人帮他/她";
	});

	//上拉加载更多
	api.addEventListener({
		name : 'scrolltobottom',
		extra : {
			threshold : 50 //设置距离底部多少距离时触发，默认值为0，数字类型
		}
	}, function(ret, err) {
		if (size < num) {
			api.showProgress({
				title : '加载中...',
				modal : false
			});
			showlist();
			api.hideProgress();
		} else {
			//$("#descms").text("暂无更多数据..");
			api.toast({
				msg : '暂无更多数据',
				duration : 1000
			});
		}
	});
};
//格式化时间
Date.prototype.Format = function(fmt) {//author: meizz
	var o = {
		"M+" : this.getMonth() + 1, //月份
		"d+" : this.getDate(), //日
		"h+" : this.getHours(), //小时
		"m+" : this.getMinutes(), //分
		"s+" : this.getSeconds(), //秒
		"q+" : Math.floor((this.getMonth() + 3) / 3), //季度
		"S" : this.getMilliseconds() //毫秒
	};
	if (/(y+)/.test(fmt))
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (var k in o)
	if (new RegExp("(" + k + ")").test(fmt))
		fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
}
//登录
function login() {
	var client = new Resource("A6925272779799", "EE17CFF5-1080-F645-51E8-7CCEA5301B8C");
	var User = client.Factory("user");
	User.login({
		"username" : "biaobiao",
		"password" : "123"
	}, function(ret, err) {
		if (ret) {
			$api.setStorage("userId", ret.userId);
		} else {
			alert('error');
		}
	})
}

function showlist() {
	query.limit({
		qid : queryId,
		value : 10
	});
	query.skip({
		qid : queryId,
		value : size
	});
	//	query.justFields({
	//		qid : queryId,
	//		value : ["id", "content","state", "title", "createdAt"]
	//	});
	query.desc({
		qid : queryId,
		column : "createdAt"
	});
	size = size + 10;
	model.findAll({
		class : "information",
		qid : queryId
	}, function(ret, err) {
		if (ret) {
			//alert(JSON.stringify(ret));
			var tpl = $api.byId('list_tpl').innerHTML;
			//var tpl=document.getElementById('list_tpl').innerHTML;
			//获取模板内容
			var tplFun = doT.template(tpl);
			//编译模板
			var data = tplFun(ret);
			//数据的赋值
			var list = $api.byId('list');
			$api.append(list, data);
			//list.innerHTML = data;
			//alert('showlist成功');
		} else
			alert("连接数据库失败");
	});
};

//下拉加载刷新
function down_load_more() {
	var temp_size = null;
	query = api.require("query");
	model = api.require("model");
	model.config({
		appKey : 'EE17CFF5-1080-F645-51E8-7CCEA5301B8C',
		host : 'https://d.apicloud.com'
	});
	query.createQuery({
	}, function(ret, err) {
		//coding...
		if (ret && ret.qid) {
			queryId = ret.qid;
			model.count({
				class : "information",
				qid : queryId
			}, function(ret, err) {
				if (ret) {
					var temp_num = JSON.stringify(ret.count);
					//alert("down_load_more 数据总条数：" + JSON.stringify(ret.count));
					if (temp_num > num) {

						temp_size = temp_num - num;
						alert("新加载条数：" + temp_size);
						//queryId = ret.qid;
						query.limit({
							qid : queryId,
							value : temp_size
						});
						query.skip({
							qid : queryId,
							value : num
						});
						query.justFields({
							qid : queryId,
							value : ["id", "content", "title", "createdAt"]
						});

						model.findAll({
							class : "information",
							qid : queryId
						}, function(ret, err) {
							if (ret) {
								var tpl = $api.byId('list_tpl').innerHTML;
								//var tpl=document.getElementById('list_tpl').innerHTML;
								//获取模板内容
								var tplFun = doT.template(tpl);
								//编译模板
								var data = tplFun(ret);
								//数据的赋值
								$api.prepend(list, data);
							} else
								alert("连接数据库失败");
						});

						num = temp_num;
					}

				} else {
					alert(JSON.stringify(err));
				}
			});
		}
	});
}

//从服务器中找到后台数据
function find_data() {
	model.findAll({
		class : "information",
		qid : queryId
	}, function(ret, err) {
		if (ret) {
			insert_data_into_list(ret);

		} else
			alert("连接数据库失败");
	});
};

//获取帮助消息的条数
function getNum() {
	query = api.require("query");
	model = api.require("model");
	model.config({
		appKey : 'EE17CFF5-1080-F645-51E8-7CCEA5301B8C',
		host : 'https://d.apicloud.com'
	});
	query.createQuery({
	}, function(ret, err) {
		//coding...
		if (ret && ret.qid) {
			queryId = ret.qid;
			model.count({
				class : "information",
				qid : queryId
			}, function(ret, err) {
				if (ret) {
					num = JSON.stringify(ret.count);
					//alert(JSON.stringify(ret.count));

				} else {
					alert(JSON.stringify(err));
				}
			});
		}
	});
};

function add() {
	api.openWin({
		name : 'fabu',
		url : './html/fabu.html'
	});
}

//插入数据到列表
function insert_data_into_list(ret) {
	var tpl = $api.byId('list_tpl').innerHTML;
	var tplFun = doT.template(tpl);
	var data = tplFun(ret);
	var list = $api.byId('list');
	$api.prepend(list, data);

};

//分享模块
function share() {
	api.actionSheet({
		title : '分享收藏',
		cancelTitle : '取消',
		//itemPressColor:'#E6E6E6',不知是不是这样写
		//destructiveTitle: '红色警告按钮',
		buttons : ['分享微信朋友圈', '分享微信好友', '分享QQ好友', '分享QQ空间', '分享微博', '添加到收藏']
	}, function(ret, err) {
		if (ret) {
			if (ret.buttonIndex == 1) {
				wxShare('timeline');
			}
			if (ret.buttonIndex == 2) {
				wxShare('session');
			}
			if (ret.buttonIndex == 3) {
				qqShare('QFriend');
			}
			if (ret.buttonIndex == 4) {
				qqShare('QZone');
			}
		}
	});
}

//微信分享
function wxShare(Vscene) {
	//session（会话）
	//timeline（朋友圈）
	//favorite（收藏）
	var wx = api.require('wx');
	wx.isInstalled(function(ret, err) {//检测是否安装了微信客户端
		if (ret.installed) {
			wx.shareWebpage({
				apiKey : 'wx67090157bcbba2a9',
				scene : Vscene,
				title : '测试标题',
				description : '分享内容的描述',
				thumb : 'widget://touxiang.png', //这个无法识别
				contentUrl : 'http://apicloud.com'
				//contentUrl可以用来写安装包的地址
			}, function(ret, err) {
				if (ret.status) {
					alert('分享网页成功');
				} else {
					alert(err.code);
				}
			});
		} else {
			alert('当前设备未安装微信客户端');
		}
	});
}

function reply(dataId) {
	api.openWin({
		name : 'pinglun',
		url : '../html/restaurant.html',
		pageParam : {
			dataId : dataId
		}
	});
}

//发布帮助请求
function fabu() {
	//var title = document.getElementById("title").valueOf;
	var title = $api.byId('title').value;
	//var tt = $api.text(t, value);
	var content = $api.byId('content').value;

	var tel = $api.byId('tel').value;
	//var tt = $api.text(t, value);
	var time = $api.byId('time').value;
	var addr = $api.byId('addr').value;
	
	model = api.require('model');
	model.insert({
		class : 'information',
		value : {
			userId : $api.getStorage("userId"),
			title : title,
			content : content,
			state : "暂无人帮",
			tel : tel,
			time : time,
			addr : addr
		}
	}, function(ret, err) {
		if (ret) {
			alert("发布成功：congratulations");
			//alert("返回信息：" + JSON.stringify(ret));
			api.sendEvent({
				name : 'fabu_done'
			});
            
			api.closeToWin({
				name : 'root'
			});
//			api.closeWin();
//            var tpl = $api.byId('add_tpl').innerHTML;
//				var tplFun = doT.template(tpl);
//				var data = tplFun(ret);
//				var list = $api.byId('list');
//				$api.prepend(list, data);
				
	

		} else {
			alert("发布失败");
		}
	});
}

function setback() {
	api.closeToWin({
		name : 'root',
		animation : {
			type : 'flip',
			reload : true,
			subType : 'from_bottom',
			duration : 500
		}
	});
}

function help() {
	var liuyan = $api.byId("liuyan");
	alert(liuyan.value);
	api.sendEvent({
		name : 'help'
	});
	api.closeToWin({
		name : 'root'
	});
}

function setback() {
	api.closeToWin({
		name : 'root',
		animation : {
			type : 'flip',
			reload : true,
			subType : 'from_bottom',
			duration : 500
		}
	});
}
