import {getCss, getDefaultProp, getStyle} from "./utils";

let displayFlexMatch = /(^|;)\s*display\s*:\s*(inline-)?flex\s*(;|$)/i;
let flexMatch = /^(inline-)?flex$/i;

function isFlexBox(element) {
    // whether the element is an element
    let isElement = element instanceof Element;

    // whether the element has a data flex attribute
    let dataFlexStyle = isElement && element.getAttribute('style');

    // whether the element has a current style and -js-display declaration
    let currentStyleJsDisplay = isElement && (getStyle(element)['-js-display']||getStyle(element)['display']);

    // whether flex is detected by the data flex attribute or the current style
    return displayFlexMatch.test(dataFlexStyle) || flexMatch.test(currentStyleJsDisplay);
}

/**
 * 查询所有flexbox
 */
export default function readAll(element) {
    // whether the element has a display flex style
    let isDisplayFlex = isFlexBox(element);

    // children of the element
    let children = [];

    let index = -1;
    let childNode;

    if (isDisplayFlex) {
        let alignSelf;
        if(isFlexBox(element.parentNode)){
            const _props = getStyle(element.parentNode);
            alignSelf=getCss(element.parentNode).alignSelf || getDefaultProp(_props, 'alignSelf')
        }else{
            alignSelf='stretch'
        }
        children.push({
            element,
            props: {
                flexDirection: getCss(element).flexDirection ,
                flexWrap: getCss(element).flexWrap, //默认不换行
                alignItems:getCss(element).alignItems,
                alignSelf:getCss(element).alignSelf || alignSelf,
                alignContent: getCss(element).alignContent ,
                justifyContent:getCss(element).justifyContent, //默认左对齐
                order: getCss(element).order,
                flexShrink: getCss(element).flexShrink,
                flexGrow: getCss(element).flexGrow
            }
        })
    }
    // for each child node of the element
    while (childNode = element.childNodes[++index]) {
        //console.log(childNode)
        // whether the child is an element
        let isElement = childNode instanceof Element;
        if (isElement) {
            // push the child details to children
            let childDetails = readAll(childNode);
            children.push(...childDetails);
        }
    }
    return children
}

