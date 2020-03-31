import {getPropsFromCssText, getStyle} from "./utils";

let displayFlexMatch = /(^|;)\s*display\s*:\s*(inline-)?flex\s*(;|$)/i;
let flexMatch = /^(inline-)?flex$/i;

function isFlexBox(element) {
    // whether the element is an element
    let isElement = element instanceof Element;

    // whether the element has a data flex attribute
    let dataFlexStyle = isElement && element.getAttribute('style');

    // whether the element has a current style and -js-display declaration
    let currentStyleJsDisplay = isElement && element.currentStyle && element.currentStyle['-js-display'];

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
        const props=getStyle(element);

        children.push({
            element,
            props:{
                flexDirection:  getPropsFromCssText(element.style.cssText,'flex-direction') || props.flexDirection,
                flexWrap: getPropsFromCssText(element.style.cssText,'flex-wrap') ||props.flexWrap, //默认不换行
                alignItems: getPropsFromCssText(element.style.cssText,'align-items') ||props.alignItems,
                alignContent: getPropsFromCssText(element.style.cssText,'align-content') ||props.alignContent,
                justifyContent: getPropsFromCssText(element.style.cssText,'justify-content') ||props.justifyContent, //默认左对齐
                order: getPropsFromCssText(element.style.cssText,'order') ||props.order,
                flexShrink:getPropsFromCssText(element.style.cssText,'flex-shrink') ||props.flexShrink,
                flexGrow:getPropsFromCssText(element.style.cssText,'flex-grow')||props.flexGrow
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

