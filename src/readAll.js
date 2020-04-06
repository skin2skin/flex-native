import {getClassList, getComputedStyleByCss, getCss, getDataSet, getDefaultProp, getStyle} from "./utils";

let displayFlexMatch = /(^|;)\s*display\s*:\s*(inline-)?flex\s*(;|$)/i;
let flexMatch = /^(inline-)?flex$/i;

export function isFlexBox(element, style) {
    // whether the element is an element
    let isElement = element instanceof Element;

    // whether the element has a data flex attribute
    let dataFlexStyle = isElement && element.getAttribute('style');

    // whether the element has a current style and -js-display declaration
    let currentStyleJsDisplay = isElement && (style['display']);

    // whether flex is detected by the data flex attribute or the current style
    return displayFlexMatch.test(dataFlexStyle) || flexMatch.test(currentStyleJsDisplay);
}

/**
 * 查询所有flexbox
 */
export default function readAll(element, css) {
    const computedStyle = getComputedStyleByCss(element, css);
    //console.log(element, computedStyle)
    // whether the element has a display flex style
    let isDisplayFlex = isFlexBox(element, computedStyle);

    let _ele = {
        element,
        computedStyle: computedStyle,
        tag:element.localName,
        children: []
    };
    // children of the element
    let index = -1;
    let childNode;

    if (isDisplayFlex) {
        //const flexId = getDataSet(element.parentNode, 'flex') || 0;
        //element.setAttribute('data-flex', `${flexId}-${index}`);
        let alignSelf='stretch';
        if (isFlexBox(element.parentNode, css)) {
            const _props = getComputedStyleByCss(element.parentNode,css);
            alignSelf = _props['align-items'] || getDefaultProp('alignItems')
        }
        const props=getComputedStyleByCss(element,css);

        _ele = {
            element,
            tag:element.localName,
            classList: getClassList(element),
            computedStyle: computedStyle,
            children: [],
            props: {
                flexDirection: props['flex-direction'] || getDefaultProp('flexDirection',props)||getDefaultProp('flexDirection'),
                flexWrap:props['flex-wrap'] || getDefaultProp('flexWrap',props)||getDefaultProp('flexWrap'), //默认不换行
                alignItems: props['align-items'] || getDefaultProp('alignItems'),
                alignSelf: props['align-self'] || alignSelf,
                alignContent: props['align-content'] || getDefaultProp('alignContent'),
                justifyContent: props['justify-content'] || getDefaultProp('justifyContent'), //默认左对齐
                order: props['order'] || getDefaultProp('order'),
                flexShrink: props['flex-shrink'] || getDefaultProp('flexShrink',props)||getDefaultProp('flexShrink'),
                flexGrow: props['flex-grow'] || getDefaultProp('flexGrow',props)||getDefaultProp('flexGrow')
            }
        };
        //console.log(computedStyle);
    }
    // for each child node of the element
    while (childNode = element.childNodes[++index]) {
        //console.log(childNode)
        // whether the child is an element
        let isElement = childNode instanceof Element;
        if (isElement) {
            // push the child details to children
            let childDetails = readAll(childNode, css);
            _ele.children.push(childDetails);
        }
    }

    return _ele;
    //return children
}

