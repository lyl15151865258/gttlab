const BASE_URL = 'https://workreport.gttlab.com';
var year = 2023;
var month = 1;
var day = 1;
var date = document.getElementById("date");

window.onload = changeTheme();

function changeTheme(){
    $(document).ready(function(){$('body').attr('data-weui-theme', 'light');});
    date.innerText = getCurrentDate();
}

function getCurrentDate() {
    var now = new Date();
    year = now.getFullYear();
    month = now.getMonth() + 1;
    day = now.getDate();
    if (month < 10) {
        month = "0" + month;
    }
    if (day < 10) {
        day = "0" + day;
    }
    return year + "-" + month + "-" + day;
}

function selectDate() {
    weui.datePicker({
        start: 2023,
        end: 2100,
        defaultValue: [year, month, day],
        onConfirm: function (result) {
            console.log(result);
            year = result[0].value;
            month = result[1].value;
            day = result[2].value;
            if (month < 10) {
                month = "0" + month;
            }
            if (day < 10) {
                day = "0" + day;
            }
            date.innerText = year + "-" + month + "-" + day;
        },
        id: 'datePicker'
    });
}

function lastDay(){
    const result = new Date(date.innerText);
    result.setDate(result.getDate() - 1);
    year = result.getFullYear();
    month = result.getMonth() + 1;
    day = result.getDate();
    if (month < 10) {
        month = "0" + month;
    }
    if (day < 10) {
        day = "0" + day;
    }
    date.innerHTML = year + "-" + month + "-" + day;
}

function nextDay(){
    const result = new Date(date.innerText);
    result.setDate(result.getDate() + 1);
    year = result.getFullYear();
    month = result.getMonth() + 1;
    day = result.getDate();
    if (month < 10) {
        month = "0" + month;
    }
    if (day < 10) {
        day = "0" + day;
    }
    date.innerHTML = year + "-" + month + "-" + day;
}