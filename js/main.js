const BASE_URL = 'https://file.gttlab.com:9000';

// 电脑端轮播图
const slides = document.querySelectorAll(".banner-img");
let counter = 0;
if (document.getElementById('swiper-pc') != null) {
    setInterval(() => {
        slides[counter].classList.remove("active");
        counter++;
        if (counter === slides.length) {
            counter = 0;
        }
        slides[counter].classList.add("active");
    }, 5000);
}

// 电脑端轮播图下一张图
function lastImg() {
    slides[counter].classList.remove("active");
    counter--;
    if (counter === -1) {
        counter = slides.length - 1;
    }
    slides[counter].classList.add("active");
}

// 电脑端轮播图上一张图
function nextImg() {
    slides[counter].classList.remove("active");
    counter++;
    if (counter === slides.length) {
        counter = 0;
    }
    slides[counter].classList.add("active");
}

// 移动端轮播图
if (document.getElementById('swiper-mobile') != null) {
    var swiper = new Swiper(".mySwiper", {
        pagination: {
            el: ".swiper-pagination",
            bulletActiveClass: 'my-bullet-active',
        },
        autoplay: { delay: 3000, stopOnLastSlide: false, disableOnInteraction: true },
    });
}

// 高德地图（移动端没有地图）
if (document.getElementById('map-container') != null) {
    var marker, map = new AMap.Map("map-container", {
        resizeEnable: true,
        center: [120.531987, 31.258135],
        zoom: 18
    });
    map.setMapStyle('amap://styles/whitesmoke');
    marker = new AMap.Marker({
        icon: "https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
        position: [120.531987, 31.258135]
    });
    marker.setMap(map);
}

// 报告查询公共常量
const reportId = document.getElementById('reportId');
const inputName = document.getElementById('name');
const inputPhoneOrEmail = document.getElementById('phoneOrEmail');
const inputCode = document.getElementById('verifyCode');
const btnCode = document.getElementById('btnGetCode');
const btnQuery = document.getElementById('queryReport');
const warning = document.getElementById('warning');
// 查询编号格式校验
const validReportId = /^[A-Z0-9]{4}-[A-Z0-9]{3}-[A-Z0-9]{2}$/;
// 查询码格式校验
const validCode = /^\d{6}$/;

// 监听查询编号输入
reportId.addEventListener('input', (event) => {
    const value = event.target.value;
    // 限制只允许输入数字、字母和-
    const pattern = /[^a-zA-Z0-9-]+/g;
    const newValue = value.replace(pattern, '').toUpperCase();
    if (newValue !== value) {
        // 输入的内容发生了改变，更新输入框的值
        event.target.value = newValue;
    }
    if (validReportId.test(value)) {
        // 查询编号合法
        getQueryOrder(value);
    } else {
        clearData();
        hideError();
    }
});

function getQueryOrder(value) {
    let param = {
        reportId: value,
    };
    axios.request({
        url: BASE_URL + "/order/queryOrder",
        method: "post",
        data: param,
        withCredentials: true
    }).then(res => {
        if (res.status === 200) {
            // 查询项目信息接口调用成功
            if (res.data.code === 1001) {
                if (res.data.data.linkman != null && res.data.data.mobile != null) {
                    inputName.value = res.data.data.linkman;
                    inputPhoneOrEmail.value = res.data.data.phoneOrEmail;
                    // 正确获取信息后允许点击获取查询码按钮
                    if (validReportId.test(value) && inputName.value != null && inputPhoneOrEmail.value != null) {
                        if (!isCounting) {
                            btnCode.disabled = false;
                        }
                        // 如果查询码内容符合要求，允许点击查询按钮
                        if (validCode.test(inputCode.value)) {
                            btnQuery.disabled = false;
                        }
                    }
                    hideError();
                } else {
                    clearData();
                    showError("没有查询到报告联系人", "#FF0000");
                }
            } else if (res.data.code === 1011) {
                clearData();
                showError("查询编号不存在，请检查", "#FF0000");
            } else if (res.data.code === 1012) {
                clearData();
                showError("检测项目不存在，请检查", "#FF0000");
            } else {
                clearData();
                showError("查询报告联系人失败", "#FF0000");
            }
        } else {
            // 未获取到项目信息，禁止点击按钮
            clearData();
            showError("查询报告联系人失败", "#FF0000");
        }
    }).catch(error => {
        clearData();
        showError(error, "#FF0000");
    });
}

// 清除输入框内容并禁止点击按钮
function clearData() {
    // 清空姓名、电话和查询码
    inputName.value = '';
    inputPhoneOrEmail.value = '';
    inputCode.value = '';
    // 禁止获取查询码和查询按钮的点击
    btnCode.disabled = true;
    btnQuery.disabled = true;
}

// 获取报告查询码
function getQueryCode() {
    const value = reportId.value;
    if (validReportId.test(value)) {
        // 开始按钮倒计时
        startCountdown();
        // 调接口获取查询码
        let param = {
            reportId: value,
        };
        axios.request({
            url: BASE_URL + "/queryCode/getQueryCode",
            method: "post",
            data: param,
            withCredentials: true
        }).then(res => {
            if (res.status === 200) {
                // 获取查询码接口调用成功
                if (res.data.code === 1001) {
                    if (res.data.data === 3) {
                        showError("查询码获取成功，请通过手机号或邮箱联系报告联系人", "#29A243");
                    } else if (res.data.data === 2) {
                        showError("查询码获取成功，请通过邮箱联系报告联系人", "#29A243");
                    } else if (res.data.data === 1) {
                        showError("查询码获取成功，请通过手机号联系报告联系人", "#29A243");
                    }
                } else if (res.data.code === 1011) {
                    showError("查询编号不存在，请检查", "#FF0000");
                } else if (res.data.code === 1012) {
                    showError("检测项目不存在，请检查", "#FF0000");
                } else if (res.data.code === 1015) {
                    showError("查询码仍有效，请勿重新发送", "#FF0000");
                } else {
                    showError("查询码获取失败，请重试", "#FF0000");
                }
            } else {
                showError("查询码获取失败，请重试", "#FF0000");
            }
        }).catch(error => {
            showError(error, "#FF0000");
        });
    } else {
        showError("请输入正确的查询编号", "#FF0000");
    }
}

// 查询码按钮倒计时
let count = 30;
let timer;
var isCounting = false;
function startCountdown() {
    if (isCounting) {
        return;
    }
    btnCode.disabled = true;
    var originText = btnCode.innerText;
    timer = setInterval(function () {
        if (count > 0) {
            isCounting = true;
            btnCode.innerText = `${count} s`;
            count--;
        } else {
            clearInterval(timer);
            btnCode.disabled = false;
            btnCode.innerText = originText;
            count = 30;
            isCounting = false;
        }
    }, 1000);
}

// 监听查询码输入
// 判断是否符合查询编号格式
inputCode.addEventListener('input', (event) => {
    const value = event.target.value;
    // 限制只允许输入数字
    const pattern = /[^0-9]+/g;
    const newValue = value.replace(pattern, '');
    if (newValue !== value) {
        // 输入的内容发生了改变，更新输入框的值
        event.target.value = newValue;
    }
    if (validCode.test(value)) {
        // 查询码合法
        // 判断查询编号、用户名、手机号（或邮箱）是否都存在
        if (validReportId.test(reportId.value) && inputName.value != null && inputPhoneOrEmail.value != null) {
            // 输入框内容均合法，允许查询按钮的点击
            btnQuery.disabled = false;
        } else {
            // 输入框内容存在不合法，禁止查询按钮的点击
            btnQuery.disabled = true;
        }
    } else {
        // 查询码不合法，禁止查询按钮的点击
        btnQuery.disabled = true;
        hideError();
    }
});

// 报告查询
function getReport() {
    // 检查查询编号、查询码是否合法，联系人、电话是否存在
    if (validReportId.test(reportId.value) && inputName.value != null && inputPhoneOrEmail.value != null && inputCode.value != null) {
        // 调接口获取查询码
        let param = {
            reportId: reportId.value,
            code: inputCode.value,
        };
        hideError();
        axios.request({
            url: BASE_URL + "/report/queryReport",
            method: "post",
            data: param,
            withCredentials: true
        }).then(res => {
            if (res.status === 200) {
                // 获取查询码接口调用成功
                if (res.data.code === 1001) {
                    // 查询到文件名，拿到文件名后再次请求文件
                    var file = res.data.data.filename;
                    // let param = {
                    //     filename: file,
                    // };
                    // axios.request({
                    //     url: BASE_URL + "/report/getReport",
                    //     method: "post",
                    //     responseType: "blob",
                    //     data: param,
                    //     withCredentials: true
                    // }).then(res => {
                    //     hideError();
                    //     const blob = new Blob([res.data], { type: 'application/pdf' });
                    //     const fileURL = window.URL.createObjectURL(blob);
                    //     window.open(fileURL, '_blank');
                    //     // const link = document.createElement('a');
                    //     // link.href = fileURL;
                    //     // // 设置下载的文件名
                    //     // // link.setAttribute('download', file);
                    //     // // 在新标签页中打开
                    //     // link.target = '_blank';
                    //     // // document.body.appendChild(link);
                    //     // link.click();
                    // }).catch(error => {
                    //     showError(error, "#FF0000");
                    // });

                    // 使用PDFJS加载文件
                    var filename = BASE_URL + "/files/" + file.substr(0, 8) + "/" + file;
                    var url = '../js/pdfjs/web/viewer.html?file=' + filename;
                    if (isApple()) {
                        window.location = url;
                    } else {
                        const link = document.createElement('a');
                        link.href = url;
                        // 在新标签页中打开
                        link.target = '_blank';
                        link.click();
                    }

                    // window.open('../js/pdfjs/normal/web/viewer.html?file=' + filename);
                } else if (res.data.code === 1014) {
                    showError("查询码错误，请重试", "#FF0000");
                } else if (res.data.code === 1013) {
                    showError("查询码已失效，请重新获取", "#FF0000");
                } else if (res.data.code === 1016) {
                    showError("查询码错误已达3次，请重新获取", "#FF0000");
                } else {
                    showError("查询码校验出错", "#FF0000");
                }
            } else {
                showError("查询报告失败，请重试", "#FF0000");
            }
        }).catch(error => {
            showError(error, "#FF0000");
        });
    }

}

function showError(errMsg, color) {
    warning.innerHTML = errMsg;
    warning.style.color = color;
    warning.style.display = 'block';
}

function hideError() {
    warning.innerHTML = "";
    warning.style.display = 'none';
}

function isApple() {
    if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
        return true;
    } else {
        return false;
    }
}

// 移动端二维码扫描
function scanQrCode() {
    window.open('//996315.com/api/scan/?redirect_uri=' + encodeURIComponent(location.href));
}

// 获取二维码字符串
function GetQueryString(name) {
    var reg = new RegExp("\\b" + name + "=([^&]*)");
    var r = decodeURIComponent(location.href).match(reg);
    if (r != null) return r[1];
}

$(document).ready(function () {
    var qr = GetQueryString("qrresult");
    if (qr != null) {
        // 页面由用户点击扫码完成后跳转回来，获取的二维码带有链接，先截取最后的报告号
        var startIndex = qr.indexOf("id=");
        // 如果找到了 "id="，则截取其后面的子字符串
        if (startIndex !== -1) {
            // 加上 3 是因为 "id=" 的长度为 3
            var id = qr.substring(startIndex + 3);
            // 校验查询编号是否合法
            if (validReportId.test(id)) {
                $("#reportId").val(id);
                getQueryOrder(id);
            } else {
                alert("报告编号不合法")
            }
        }
    } else {
        // 页面由用户直接扫报告封面二维码跳转而来或手动输入网址而来
        var params = new URLSearchParams(window.location.search);
        // 获取链接中的参数并设置到输入框
        var reportId = params.get("id");
        if (validReportId.test(reportId)) {
            // 如果报告编号合法
            $("#reportId").val(reportId);
            getQueryOrder(reportId);
        }
    }
});