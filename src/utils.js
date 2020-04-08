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
        const _res={};
        const flexFlow = props[ 'flex-flow']||'';
        _res.flexFlow = flexFlow.trim().match(/([^ ]*)\s*([^ ]*)/);
        _res.flexDirection = _res.flexFlow[1].trim();
        _res.flexWrap = _res.flexFlow[2].trim();
        let flex = props[ 'flex'] || '';
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
export function getStyleFromCssText(styleText){
    let style = {};
    styleText.split(';').map(item => {
        if (item.trim() !== '') {
            const [key, value] = item.split(':');
            style[key.trim()] = value.trim();
        }
    });
    return style;
}

/**
 * 获取真实的style
 */
function getRealStyle(element,excludeStyle){
    const preWithText=getDataSet(element,'width')||'';
    if(!preWithText){
        return getStyleFromCssText(element.getAttribute('style') || '');
    }else{
        const preHeightText=getDataSet(element,'height')||'';
        const styleText=element.getAttribute('style')||'';
        const style=getStyleFromCssText(styleText);
        const oriStyleText=getDataSet(element,'origin')||'';
        const oriStyle=getStyleFromCssText(oriStyleText);
        if(excludeStyle.width&&(excludeStyle.width.includes('%')||excludeStyle.width.includes('vw')||excludeStyle.width.includes('vw')||excludeStyle.width.includes('rem')||excludeStyle.width.includes('em'))){
            element.style.width=excludeStyle.width
        }else{
            //todo 有可能设的宽度或者高度和我之前计算出来的高度一致 就有bug
            if(style.width===preWithText){
                element.style.width=oriStyle.width
            }else{
                element.style.width=style.width
            }
        }
        if(excludeStyle.height&&(excludeStyle.height.includes('%')||excludeStyle.height.includes('vw')||excludeStyle.height.includes('vw')||excludeStyle.height.includes('rem')||excludeStyle.height.includes('em'))){
            element.style.height=excludeStyle.height
        }else{
            if(style.height===preHeightText){
                element.style.height=oriStyle.height
            }else{
                element.style.height=style.height
            }
        }


    }

}

/**
 * 获取计算后的css
 */
export function getComputedStyleByCss(element, css) {
    let isElement = element instanceof Element;
    if (!isElement) {
        return {}
    }
    const dataSetText=getDataSet(element, 'class');
    if (!dataSetText) {
        return {}
    }
    const selectors = JSON.parse(dataSetText);
    css = css.map(item => {
        const weights = getWeights(item.selector);
        item.weights = {
            arr: weights,
            int: ipToInt(weights)
        };
        return item
    });
    let res = {};
    const importantSelector = (obj, selector) => {
        Object.keys(obj).map(key => {
            if (res[key] !== undefined && res[key].endsWith('!important')) {
                res['//' + key + '--' + selector] = obj[key];
            } else {
                if (res[key] !== undefined) {
                    res['//' + key + '--' + selector] = obj[key];
                }
                res[key] = obj[key];
            }
        });
        return obj
    };

    const _css = [...css].sort((a, b) => b.weights.int - a.weights.int);
    _css.forEach(item => {
        if (selectors.includes(item.selector)) {
            importantSelector(item[item.selector], item.selector)
        }
    });
    const style =getRealStyle(element,res) ;
    return {
        ...res,
        ...style
    };

}

/**
 * 获取权重
 *  * 权重信息参考地址 https://www.cnblogs.com/wangmeijian/p/4207433.html
 */
function getWeights(selector) {
    const arr = selector.split('');
    let stack = [];
    let weights = [0, 0, 0, 0];
    arr.map((item, index) => {
        stack.push(item);
        if (index !== 0 && '. [#>+~:'.includes(item) || index === arr.length - 1) {
            let pop = '';
            if (index !== arr.length - 1) {
                pop = stack.pop();
            }
            const itemSelector = stack.join('').trim();
            //id
            if (itemSelector.startsWith('#')) {
                weights[1] = weights[1] + 1;
                //类选择器、属性选择器或伪类
            } else if (itemSelector.startsWith('.') || itemSelector.startsWith(':') || itemSelector.startsWith('[')) {
                weights[2] = weights[2] + 1;
                //通配选择器
            } else if (itemSelector.startsWith('>') || itemSelector.startsWith('~') || itemSelector.startsWith('+') || itemSelector.startsWith('*')) {
                //元素和伪元素
            } else {
                weights[3] = weights[3] + 1;
            }
            stack = [];
            stack.push(pop)
        }
    });
    return weights

}

/**
 * ip转为数字
 * @param ip
 * @returns {number}
 */
function ipToInt(ip = [0, 0, 0, 0]) {
    return ip[3] + ip[2] * 256 + ip[1] * 256 * 256 + ip[0] * 256 * 256 * 256
}

/**
 * 监听dom变化
 */
export function observerDocument(targetNode,callback) {
//统一兼容问题
    let MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    //判断浏览器是或否支持MutationObserver;
    if(!!MutationObserver){
        const config = { attributes: true, childList: true, subtree: true };
        const observer = new MutationObserver(function(mutationsList, observer) {
            // Use traditional 'for loops' for IE 11
            for(let mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    //A child node has been added or removed.
                    callback()
                }
                else if (mutation.type === 'attributes') {
                    //'The ' + mutation.attributeName + ' attribute was modified.'
                    callback()
                }
            }
        });
        // Start observing the target node for configured mutations
        observer.observe(targetNode, config);
    }else {
        targetNode.addEventListener('DOMSubtreeModified', callback);
    }
    if(window.attachEvent){
        window.attachEvent('onresize', callback);
    }else{
        window.addEventListener('resize', callback);
    }
}





let  inner=false;
export function getInner() {
   return inner;
}
export function setInner(boo) {
    inner=boo
}
