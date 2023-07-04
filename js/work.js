const BASE_URL = 'https://workreport.gttlab.com';
const fullscreenDiv = document.getElementById('fullscreen');
const initialHeight = window.innerHeight;

var workTime = document.getElementById("workTime");
var resultTime = document.getElementById("resultTime");
var workContent = document.getElementById("work_content");
var workResult = document.getElementById("work_result");
var btnSubmit = document.getElementById("submitWork");
var work;
var user_id;

window.addEventListener('resize', function () {
    fullscreenDiv.style.height = initialHeight + 'px';
});

function getCurrentDate() {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    if (month < 10) {
        month = "0" + month;
    }
    if (day < 10) {
        day = "0" + day;
    }
    return year + "-" + month + "-" + day;
}

function getGreetings() {
    var date = new Date();
    var hours = date.getHours();
    if (hours >= 4 && hours <= 6) {
        return "凌晨好";
    } else if (hours <= 8) {
        return "早上好";
    } else if (hours <= 11) {
        return "上午好";
    } else if (hours <= 13) {
        return "中午好";
    } else if (hours <= 17) {
        return "下午好";
    } else if (hours <= 19) {
        return "傍晚好";
    } else if (hours <= 22) {
        return "晚上好";
    } else {
        return "深夜好";
    }
}

window.onload = getWebAccessToken;

function getWebAccessToken() {
    let appid = "wxe2e8362877be88b8"; //微信APPid
    let code = this.getUrlCode().code; //是否存在code
    let local = window.location.href;
    if (isWechat) {
        if (code == null || code === "") {
            //不存在就打开下面的地址进行授权
            window.location.href =
                "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + appid +
                "&redirect_uri=" + encodeURIComponent(local) +
                "&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect";
        } else {
            this.code = code;
            console.log("当前用户code：" + code)
            axios.request({
                url: BASE_URL + "/wechat/getUserIdByWebCode?code=" + code,
                method: "post",
            }).then(res => {
                if (res.status === 200 && res.data != null && res.data != "") {
                    document.getElementById("username").innerText = getGreetings() + "，" + res.data.name;
                    user_id = res.data.id;
                    // 获取到用户信息后查询用户当日的工作汇报填写内容
                    let param = {
                        userId: user_id,
                        date: getCurrentDate(),
                    };
                    axios.request({
                        url: BASE_URL + "/work/getWorkById",
                        method: "post",
                        data: param
                    }).then(res => {
                        showWorkContent(res);
                    }).catch(error => {

                    });
                } else {
                    // 如果code重复使用，就打开下面的地址进行授权
                    console.log("code重复使用")
                    window.location.href =
                        "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + appid +
                        "&redirect_uri=" + encodeURIComponent(local) +
                        "&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect";
                }
            }).catch(error => {

            });
        }
    } else {
        console("当前非微信客户端")
        window.location.href =
            "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + appid +
            "&redirect_uri=" + encodeURIComponent(local) +
            "&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect";
    }
}

function showWorkContent(res) {
    console.log(res)
    if (res.status === 200 && res.data != null && res.data != "") {
        // 系统存在用户当日工作汇报内容
        work = res.data;
        workContent.innerText = res.data.content;
        workResult.innerText = res.data.result;
        workTime.innerText = "（提交时间：" + res.data.contentTime + "）";
        resultTime.innerText = "（提交时间：" + res.data.resultTime + "）";
        // 根据填写标记禁用输入框
        if (res.data.contentFlag === 1) {
            // 如果工作内容已填写，则禁用工作内容输入框
            workContent.disabled = true;
        } else {
            // 如果工作内容未填写，则禁用完成情况输入框，只允许输入工作内容
            workResult.disabled = true;
        }
        if (res.data.resultFlag === 1) {
            // 禁用完成情况输入框
            workResult.disabled = true;
        } else {
            workResult.disabled = false;
        }
        if (res.data.contentFlag === 0) {
            if (res.data.resultFlag === 0) {
                btnSubmit.textContent = "提交工作任务";
                btnSubmit.style.visibility = "visible";
            }
        } else {
            if (res.data.resultFlag === 0) {
                if (res.data.resultFlag === 0) {
                    btnSubmit.textContent = "提交完成情况";
                    btnSubmit.style.visibility = "visible";
                }
            } else {
                btnSubmit.style.visibility = "hidden";
            }
        }
    } else {
        // 如果工作内容未填写，则禁用完成情况输入框，只允许输入工作内容
        workResult.innerText = "请先填写工作任务内容";
        workResult.disabled = true;
        btnSubmit.textContent = "提交工作任务";
        btnSubmit.style.visibility = "visible";
    }
}

// 提交工作汇报内容
function submitWork() {
    var workContentText = workContent.value;
    var workResultText = workResult.value;
    console.log("工作内容：" + workContentText + "，完成情况：" + workResultText)
    if (work == null || work.contentFlag == 0) {
        // 如果用户当天没有提交过工作内容
        var param = {
            userId: user_id,
            content: workContentText,
        };
        axios.request({
            url: BASE_URL + "/work/addWorkByUserId",
            method: "post",
            data: param
        }).then(res => {
            showWorkContent(res);
            weui.toast("提交成功");
        }).catch(error => {

        });
    } else if (work != null && work.contentFlag == 1 && work.resultFlag == 0) {
        // 存在工作填报记录，且工作内容已经提交
        var param = {
            id: work.id,
            userId: user_id,
            result: workResultText,
        };
        axios.request({
            url: BASE_URL + "/work/addResultByWorkId",
            method: "post",
            data: param
        }).then(res => {
            showWorkContent(res);
            weui.toast("提交成功");
        }).catch(error => {

        });
    }
}

function getAllUserWork(){
    axios.request({
        url: BASE_URL + "/wechat/getUserIdByWebCode?code=" + code,
        method: "post",
    }).then(res => {
        if (res.status === 200 && res.data != null && res.data != "") {
            
        } else {
            
        }
    }).catch(error => {

    });
}

// 截取url中的code方法
function getUrlCode() {
    var url = location.search;
    console.log("当前url:" + url)
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substring(1);
        var strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
            theRequest[strs[i].split("=")[0]] = strs[i].split("=")[1];
        }
    }
    console.log(theRequest);
    return theRequest;
}

// 判断是否为公众号模拟器环境
const isWechat = () => {
    console("判断是否是微信客户端")
    return String(navigator.userAgent.toLowerCase().match(/MicroMessenger/i)) === "micromessenger";
}