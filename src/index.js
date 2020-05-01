import {debounce} from './utils'
import readAll from "./readAll";
import Flex from "./flex";

let isUpdateInner = true;
const update = (e) => {
    if (!isUpdateInner) {
        main();
    }
};
const updateGoogle = debounce((list) => {

    if(Array.isArray(list)){
        const set = new Set(list.map(item => item.target));

        Array.from(set).forEach(node => {
           main();
        });
    }else{
        main();
    }
}, 50);

//设置监听dom变化
let MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
let observer;
const config = {attributes: true, childList: true, subtree: true};
if (MutationObserver) {
    observer = new MutationObserver(function (mutationsList, ob) {
        updateGoogle(mutationsList)
    });
    observer.observe(document, config);
} else {
    document.addEventListener('DOMSubtreeModified', update);
}
//监听窗口变化
if (window.attachEvent) {
    window.attachEvent('onresize', updateGoogle);
} else {
    window.addEventListener('resize', updateGoogle);
}


/**
 * 循环设置位置
 * @param flexBox
 */
const render = (flexBox) => {
    flexBox.forEach(item => {
        //说明是flexBox
        if (item.isFlex) {
            new Flex(item);//设置每个flexBox的位置
        } else {
            render(item.children)
        }
    })
};

/**
 * 入口函数
 */
function main(ele = document) {
    isUpdateInner = true;
    observer && observer.disconnect();
    //let time = new Date().getTime();
    const flexBox = [readAll(ele)];
    //console.log(flexBox)
    //开始设置位置
    render(flexBox);
    //console.log('time',new Date().getTime()-time);
    setTimeout(() => {
        isUpdateInner = false;
        observer && observer.observe(document, config);
    }, 0)

}

main();
