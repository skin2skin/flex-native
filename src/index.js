
import {debounce, Observer} from './utils'
import readAll from "./readAll";
import Flex from "./flex";
document.body.style.opacity = 0;
let isUpdateInner=true;
const update=(e)=>{
    if(!isUpdateInner){
        //console.log('update',new Date().getTime())
        main();
    }
};

const updateGoogle=debounce(()=>{
    main();
},50);

let MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
let observer;
const config = {attributes: true, childList: true, subtree: true};
if(MutationObserver){
    observer = new MutationObserver(function (mutationsList, observer) {
        updateGoogle()
    });
    observer.observe(document, config);
}else{
    document.addEventListener('DOMSubtreeModified', update);
}
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
            new Flex(item);
        } else {
            render(item.children)
        }
    })
};

function main() {
    isUpdateInner=true;
    observer&&observer.disconnect();
     let time=new Date().getTime();
    const flexBox = [readAll(document)];
    //开始设置位置
    render(flexBox);
    document.body.style.opacity = 1;
    console.log('renderTime---',new Date().getTime()-time)
    setTimeout(()=>{
        isUpdateInner=false;
        observer&&observer.observe(document,config);
    },0)

}
main();