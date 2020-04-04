import Flex from "./position";

/**
 * 防抖函数
 * @param fn
 * @param delay
 * @returns {Function}
 */
export function debounce(fn, delay) {
    // 定时器，用来 setTimeout
    let timer;
    // 返回一个函数，这个函数会在一个时间区间结束后的 delay 毫秒时执行 fn 函数
    return (...args) => {
        // 每次这个返回的函数被调用，就清除定时器，以保证不执行 fn
        clearTimeout(timer);
        // 当返回的函数被最后一次调用后（也就是用户停止了某个连续的操作），
        // 再过 delay 毫秒就执行 fn
        timer = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    };
}

/**
 * 获取样式
 * @param ele
 * @returns {*}
 */
export function getStyle(ele) {
    if (window.getComputedStyle) {
        return window.getComputedStyle(ele, null);
    }
    return ele.currentStyle;
}

/**
 * 从style中的cssText中获取实际值
 */
export function getPropsFromStyleText(cssText, prop) {
    if (!cssText) {
        return undefined
    }
    const strArr = cssText.split(';');
    let res = undefined;
    const reg1 = new RegExp(`${prop}:(.*)`);
    for (let i = 0; i < strArr.length; i++) {
        const item = strArr[i];
        const res1 = item.match(reg1);
        if (res1) {
            res = res1[1].trim();
            break;
        }
    }
    return res;
}

/**
 * 创建偏移
 * @param flowBoxItem
 * @returns {*}
 */
export function createTransform(flowBoxItem) {
    if (flowBoxItem.x !== undefined) {
        return `translate(${flowBoxItem.x}px,${flowBoxItem.y}px)`;
    } else {
        return undefined
    }

}

/**
 * 得到偏移
 * @returns {*}
 * @param element
 */
export function getTransform(element) {
    const res = {
        x: 0,
        y: 0
    };
    const translates = element.style[getPrefixAndProp('transform')];
    if (translates) {
        const matches = translates.match(/^translate\((.*)px,(.*)px\)$/);
        res.x = Number(matches[1]);
        res.y = Number(matches[2]);
    }
    return res;
}

/**
 * 得到默认属性
 */
export function getDefaultProp(props, key, spare) {
    if (!props[key] || props[key] === 'normal' || props[key] === 'auto') {
        if (key === 'alignSelf') {
            return null
        }
        if(spare){
            return spare
        }
        return Flex.defaultProps[key]
    }
    return props[key]
}

const prefixes = ['Moz', 'Webkit', 'O', 'ms'];

export function getPrefixAndProp(prop = 'transform') {
    if (typeof window === 'undefined' || typeof window.document === 'undefined') return '';

    const style = window.document.documentElement.style;

    if (prop in style) return prop;

    for (let i = 0; i < prefixes.length; i++) {
        if (browserPrefixToKey(prop, prefixes[i]) in style) return `${prefixes[i]}${kebabToTitleCase(prop)}`;
    }

    function browserPrefixToKey(prop, prefix) {
        return prefix ? `${prefix}${kebabToTitleCase(prop)}` : prop;
    }

    return prop;
}

function kebabToTitleCase(str) {
    let out = '';
    let shouldCapitalize = true;
    for (let i = 0; i < str.length; i++) {
        if (shouldCapitalize) {
            out += str[i].toUpperCase();
            shouldCapitalize = false;
        } else if (str[i] === '-') {
            shouldCapitalize = true;
        } else {
            out += str[i];
        }
    }
    return out;
}

/**
 * 是否支持flex布局
 * @returns {boolean}
 */
export function supportsFlexBox() {
    let test = document.createElement('test');

    test.style.display = 'flex';

    return test.style.display === 'flex';
}

export function getCss(element) {
    let cssText = element.getAttribute('style');
    let style = getStyle(element);
    const flexFlow=getPropsFromStyleText(cssText, 'flex-flow') || style['flex-flow']||'';
    const _flexFlow=flexFlow.trim().match(/([^ ]*)\s*([^ ]*)/);
    const _flexDirection=_flexFlow[1].trim();
    const _flexWrap=_flexFlow[2].trim();
    let flex=getPropsFromStyleText(cssText, 'flex') || style['flex']||'';
    if(flex==='auto'){
        flex='1 1 auto';
    }
    if(flex==='none'){
        flex='0 0 auto';
    }
    const _flex=flex.trim().match(/([^ ]*)\s*([^ ]*)\s*([^ ]*)/);
    let _flexGrow=_flex[1];
    let _flexShrink=_flex[2];



    let styleProps = {
        flexDirection: getPropsFromStyleText(cssText, 'flex-direction') || style['flex-direction'],
        flexWrap: getPropsFromStyleText(cssText, 'flex-wrap') || style['flex-wrap'], //默认不换行
        alignItems: getPropsFromStyleText(cssText, 'align-items') || style['align-items'],
        alignSelf: getPropsFromStyleText(cssText, 'align-self') || style['align-self'],
        alignContent: getPropsFromStyleText(cssText, 'align-content') || style['align-content'],
        justifyContent: getPropsFromStyleText(cssText, 'justify-content') || style['justify-content'], //默认左对齐
        order: getPropsFromStyleText(cssText, 'order') || style['order'],
        flexShrink: getPropsFromStyleText(cssText, 'flex-shrink') || style['flex-shrink'],
        flexGrow: getPropsFromStyleText(cssText, 'flex-grow') || style['flex-grow']
    };
    styleProps = {
        flexDirection: getDefaultProp(styleProps, 'flexDirection',_flexDirection),
        flexWrap: getDefaultProp(styleProps, 'flexWrap',_flexWrap), //默认不换行
        alignItems: getDefaultProp(styleProps, 'alignItems'),
        alignSelf: getDefaultProp(styleProps, 'alignSelf'),
        alignContent: getDefaultProp(styleProps, 'alignContent'),
        justifyContent: getDefaultProp(styleProps, 'justifyContent'), //默认左对齐
        order: getDefaultProp(styleProps, 'order'),
        flexShrink: getDefaultProp(styleProps, 'flexShrink',_flexShrink),
        flexGrow: getDefaultProp(styleProps, 'flexGrow',_flexGrow)
    };


    return styleProps
}