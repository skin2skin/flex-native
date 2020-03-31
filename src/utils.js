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
