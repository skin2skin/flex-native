import { getClassList, getComputedStyleByCss, getDefaultProp, getStyleFromCssText } from "./utils";

let displayFlexMatch = /(^|;)\s*display\s*:\s*(inline-)?flex\s*(;|$)/i;
let flexMatch = /^(inline-)?flex/i;

export function isFlexBox(element, style) {
    // whether the element is an element
    let isElement = element instanceof Element;

    // whether the element has a current style and -js-display declaration
    let currentStyleJsDisplay = isElement && (style['-js-display'] || style['display']);
    if (flexMatch.test(currentStyleJsDisplay)) {
        //inline-flex的处理
        if (currentStyleJsDisplay && currentStyleJsDisplay.includes('inline-flex')) {
            let text = element.getAttribute('style') || '';
            if(!text.includes('display')){
                text += `display: ${currentStyleJsDisplay};`;
            }
            if (!text.endsWith(';')) {
                text += ';'
            }
            if (!text.includes('-js-display')) {
                text += `-js-display: ${currentStyleJsDisplay};`;
            } else {
                text = text.replace(getStyleFromCssText(text)['-js-display'], currentStyleJsDisplay);
            }
            if (currentStyleJsDisplay.includes('!important')) {
                text = text.replace(getStyleFromCssText(text).display, 'inline-block !important')
            } else {
                text = text.replace(getStyleFromCssText(text).display, 'inline-block')
            }
            element.setAttribute('style', text)

        }
    }
    // whether flex is detected by the data flex attribute or the current style
    return flexMatch.test(currentStyleJsDisplay);
}

/**
 * 查询所有flexbox
 */
export default function readAll(element, css) {
    const computedStyle = getComputedStyleByCss(element, css);
    // whether the element has a display flex style
    let isDisplayFlex = isFlexBox(element, computedStyle);

    let _ele = {
        element,
        computedStyle: computedStyle,
        tag: element.localName,
        children: []
    };
    // children of the element
    let index = -1;
    let childNode;

    if (isDisplayFlex) {
        let alignSelf = 'stretch';
        if (isFlexBox(element.parentNode, css)) {
            const _props = getComputedStyleByCss(element.parentNode, css);
            alignSelf = _props['align-items'] || getDefaultProp('alignItems')
        }
        const props = getComputedStyleByCss(element, css);

        _ele = {
            element,
            tag: element.localName,
            classList: getClassList(element),
            computedStyle: computedStyle,
            children: [],
            props: {
                flexDirection: props['flex-direction'] || getDefaultProp('flexDirection', props) || getDefaultProp('flexDirection'),
                flexWrap: props['flex-wrap'] || getDefaultProp('flexWrap', props) || getDefaultProp('flexWrap'), //默认不换行
                alignItems: props['align-items'] || getDefaultProp('alignItems'),
                alignSelf: props['align-self'] || alignSelf,
                alignContent: props['align-content'] || getDefaultProp('alignContent'),
                justifyContent: props['justify-content'] || getDefaultProp('justifyContent'), //默认左对齐
                order: props['order'] || getDefaultProp('order'),
                flexShrink: props['flex-shrink'] || getDefaultProp('flexShrink', props) || getDefaultProp('flexShrink'),
                flexGrow: props['flex-grow'] || getDefaultProp('flexGrow', props) || getDefaultProp('flexGrow')
            }
        };
    }
    // for each child node of the element
    while (childNode = element.childNodes[++index]) {
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

