
import {debounce, getInner, observerDocument, setInner} from './utils'
import readAll from "./readAll";
import parseCss, {setCssSelector} from "./parseCss";
import Flex from "./flex";

const fn = debounce(main, 50);

const update = debounce(() => {
    const isChangedFromInner=getInner();
    if(!isChangedFromInner){
        main();
    }
    setInner(false);
}, 30);

fn();
//监听dom变化
observerDocument(document,update);

function main() {
    const time = new Date().getTime();
    parseCss(document).then((css) => {
        setCssSelector(css, document);
        const flexBox = [readAll(document, css)];
        //开始设置位置
        render(flexBox);
        document.body.style.opacity = 1;
    })

}

/**
 * 循环设置位置
 * @param flexBox
 */
const render = (flexBox) => {
    flexBox.forEach(item => {
        //说明是flexBox
        if (item.props) {
            new Flex(item);
        } else {
            render(item.children)
        }
    })
};
