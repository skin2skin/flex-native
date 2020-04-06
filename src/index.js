import 'core-js'
import {debounce} from './utils'
import readAll from "./readAll";
import parseCss, {setCssSelector} from "./parseCss";
import Flex from "./flex";

/*window.addEventListener('load',()=>{

});*/
main(document);

const fn = debounce(main, 50);

//document.addEventListener('DOMNodeInserted', fn);

function main() {
    console.log('DOMNodeInserted--', document);
    const time = new Date().getTime();
    parseCss(document).then((css) => {

        setCssSelector(css, document);
        const flexBox = [readAll(document, css)];
        //开始设置位置
        render(flexBox);
        document.body.style.opacity = 1;
        console.log('parseCssEnd--', new Date().getTime() - time)
        console.log(flexBox);
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
            console.log('newFlex---', new Flex(item))
        } else {
            render(item.children)
        }
    })
};

setTimeout(() => {
    // document.querySelector('.wrapper').setAttribute('style','width:600px')
    // document.body.appendChild(document.createElement('div'))
}, 2000)