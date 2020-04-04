import 'core-js'
import { debounce } from './utils'
import readAll from "./readAll";
import Flex from "./position";
const fn=debounce(main,50);
main();
document.addEventListener('DOMNodeInserted',fn);

function main() {
    const flexBox=readAll(document);
    console.log(flexBox)
    flexBox.forEach(item=>{
        console.log('newFlex---',new Flex(item))
    });
    console.dir(flexBox)
}