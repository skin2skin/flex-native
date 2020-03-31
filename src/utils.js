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
export function getPropsFromCssText(cssText,prop){
    const reg1=new RegExp(`${prop}:(.*)`);
    const reg2=new RegExp(`${prop}:(.*);`)
    const res1=cssText.match(reg1)
    const res2=cssText.match(reg2);
    if(res1){
        if(res2){
            return res2[1].trim()
        }else{
            return res1[1].trim()
        }
    }else{
        return undefined
    }

}