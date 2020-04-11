import Flex from "./flex";

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

export function getDefaultStyle(props, key, key2) {
    if (!props[key] || props[key] === 'normal' || props[key] === 'auto') {
        if (!key2) {
            return null;
        }
        return Flex.defaultProps[key2]
    } else {
        return props[key]
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
export function getDefaultProp(key, props) {
    if (props) {
        const _res = {};
        const flexFlow = props['flex-flow'] || '';
        _res.flexFlow = flexFlow.trim().match(/([^ ]*)\s*([^ ]*)/);
        _res.flexDirection = _res.flexFlow[1].trim();
        _res.flexWrap = _res.flexFlow[2].trim();
        let flex = props['flex'] || '';
        if (flex === 'auto') {
            flex = '1 1 auto';
        }
        if (flex === 'none') {
            flex = '0 0 auto';
        }
        const _flex = flex.trim().match(/([^ ]*)\s*([^ ]*)\s*([^ ]*)/);
        _res.flexGrow = _flex[1];
        _res.flexShrink = _flex[2];
        return _res[key]
    }
    return Flex.defaultProps[key]
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

/**
 * 获取dataSet的兼容写法
 */
export function getDataSet(dom, params = '') {
    if (dom.dataset) {
        return dom.dataset[params.toLowerCase()]
    } else {
        return dom.getAttribute(`data-${params}`)
    }
}

/**
 *获取classist
 */
export function getClassList(element) {
    return element.className.match(/([^\s]*)/g).filter(item => item.trim() !== '')
}

/**
 * 从cssText转为style对象
 * @param styleText
 * @returns {{}}
 */
export function getStyleFromCssText(styleText) {
    let style = {};
    styleText.split(';').map(item => {
        if (item.trim() !== '') {
            const [key, value] = item.split(':');
            style[key.trim()] = value.trim();
        }
    });
    return style;
}