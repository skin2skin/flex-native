
import { debounce, getInner,observerDocument, setInner } from './utils'
import readAll from "./readAll";
import parseCss, {setCssSelector} from "./parseCss";
import Flex from "./flex";

const fn = debounce(main, 50);
document.body.style.opacity = 0;

const update = debounce((e) => {
    const isChangedFromInner=getInner();
    if(!isChangedFromInner){
        main();
    }
    setInner(false);
}, 50);

fn();
//监听dom变化
observerDocument(document,update);

function main() {
    parseCss(document).then((css) => {
        const _css = [...css].sort((a, b) => a.weights.int - b.weights.int);
        setCssSelector(_css, document);
        const flexBox = [readAll(document.body, _css)];
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
