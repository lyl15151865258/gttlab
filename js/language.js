var LANGUAGE_CODE = "zh_CN"; //标识语言

/**
 * 获取之前保存的语言或浏览器语言
 */
$(document).ready(function () {
	LANGUAGE_CODE = window.localStorage.getItem('language');
	if (LANGUAGE_CODE == null) {
		LANGUAGE_CODE = jQuery.i18n.normaliseLanguageCode({});
	}
	switchLang(LANGUAGE_CODE);
})

/**
 * 获取浏览器语言类型
 */
var getNavLanguage = function () {
	return jQuery.i18n.normaliseLanguageCode({});
}

/**
 * 语言切换方法
 */
function switchLang(type) {
	/* 需要引入 i18n 文件*/
	if (jQuery.i18n == undefined) {
		return false;
	};
	type = (type == 'zh_CN' ? 'zh_CN' : 'en_US');
	// 持久化保存
	window.localStorage.setItem('language', type);
	jQuery.i18n.properties({
		name: "lang", //资源文件名称
		path: '/lang/', //资源文件路径
		mode: 'map', //用Map的方式使用资源文件中的值
		language: type,
		callback: function () { //加载成功后设置显示内容
			var insertEle = $(".i18n");
			insertEle.each(function () {
				var contrastName = $(this).attr('contrastName');
				// 根据i18n元素的 contrastName 获取内容写入
				if (contrastName) {
					$(this).html($.i18n.prop(contrastName));
				};
			});
			var insertInputEle = $(".i18n-input");
			insertInputEle.each(function () {
				var selectAttr = $(this).attr('selectattr');
				if (!selectAttr) {
					selectAttr = "value";
				};
				$(this).attr(selectAttr, $.i18n.prop($(this).attr('contrastName')));
			});
			var oPlaceholder = $('input[placeholder], textarea[placeholder]');
			oPlaceholder.each(function () {
				var inputPlaceholder = $(this).attr('inputPlaceholder');
				if (inputPlaceholder) {
					$(this).attr('placeholder', $.i18n.prop(inputPlaceholder));
				};
			});
		}
	});
};

/**
 * 单独获取prop
 * @return
 */
var execI18nProp = function (contrastName) {
	var contrastValue = "";
	/* 需要引入 i18n 文件*/
	if ($.i18n == undefined) {
		return false;
	};
	if (contrastName) {
		contrastValue = $.i18n.prop(contrastName);
	};
	return contrastValue
}