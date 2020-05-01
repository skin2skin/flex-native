import {
    getClassList, getDataSet, getDefaultProp, getDefaultStyle, getOffset, getStyle,
    getStyleFromCssText, getTransform, supportsFlexBox,
} from "./utils";

let displayFlexMatch = /(^|;)\s*(-js-)?display\s*:\s*(inline-)?flex\s*(;|$)/i;
let flexMatch = /^(inline-)?flex/i;

/**
 * 是否是flex布局
 * @param element
 * @returns {boolean}
 */
export function isFlexBox(element) {
    // whether the element is an element
    let isElement = element instanceof Element;
    // whether the element has a data flex attribute
    let dataFlexStyle = isElement && element.getAttribute('style');
    // whether the element has a current style and -js-display declaration
    let currentStyleJsDisplay = isElement && (element.currentStyle && element.currentStyle['-js-display'] || getComputedStyle(element, null)['display']);
    // whether flex is detected by the data flex attribute or the current style
    return displayFlexMatch.test(dataFlexStyle) || flexMatch.test(currentStyleJsDisplay);
}

/**
 * 处理inline-flex的情况
 */
function dealInlineFlex(element) {
    let currentStyleJsDisplay = (element.currentStyle && element.currentStyle['-js-display']);
    const isInlineFlex = currentStyleJsDisplay && currentStyleJsDisplay.includes('inline-flex');
    if (isInlineFlex) {
        let text = element.getAttribute('style') || '';
        if (!text.includes('display')) {
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
        text += '; vertical-align: middle;';
        element.setAttribute('style', text)

    }
    return isInlineFlex
}

/**
 * 重置上一次的渲染
 */
function resetStyle(element) {
    element.style.opacity = 0;
    const oriStyleText = getDataSet(element, 'origin');
    if (oriStyleText) {
        const nowStyleText = element.getAttribute('style');
        const preStyleText = getDataSet(element, 'style');
        if (nowStyleText === preStyleText) {
            element.setAttribute('style', oriStyleText)
        } else {
            const nowStyle = getStyleFromCssText(nowStyleText);
            const preStyle = getStyleFromCssText(preStyleText);
            const oriStyle = getStyleFromCssText(oriStyleText);
            Object.entries(nowStyle).forEach(([key, value]) => {
                if (value !== preStyle[key]) {
                    oriStyle[key] = value;
                }
            });
            let _oriStyleText = '';
            Object.entries(oriStyle).forEach(([key, value]) => {
                _oriStyleText += `${key}:${value};`
            });
            element.setAttribute('style', _oriStyleText)
        }

    } else {
        // element.setAttribute('style','')
    }
}

/**
 * 判断是否是原始的inline-block元素
 */
function judgeIsNativeInline(element) {
    const list = ['input', 'textarea', 'img', 'button', 'select'];
    return list.includes(element.localName)
}

/**
 * 查询所有flexbox
 */
export default function readAll(element) {

    // whether the element has a display flex style
    let isDisplayFlex = isFlexBox(element);
    let _ele = {
        element,
        classList: [],
        style: '',
        offsetLeft: 0,
        offsetTop: 0,
        computedStyle: {},
        tag: element.localName,
        children: []
    };
    // children of the element
    let index = -1;
    let _index = -1;
    let _childNode;
    let childNode;

    if (isDisplayFlex) {
        element instanceof Element && resetStyle(element);
        let alignSelf = 'stretch';
        if (isFlexBox(element.parentNode)) {
            const _props = getStyle(element.parentNode);
            alignSelf = _props['align-items'] || getDefaultProp('alignItems')
        }
        const props = getStyle(element);
        //如果是inline-flex的情况
        const isInlineFlex = dealInlineFlex(element);
        _ele = {
            element,
            isFlex: true,
            isNativeInline: judgeIsNativeInline(element),
            isInlineFlex: isInlineFlex,
            tag: element.localName,
            classList: getClassList(element),
            style: element.getAttribute('style') || '',
            computedStyle: props,
            boxSizing: props.boxSizing,
            children: [],
            props: {
                flexDirection: getDefaultStyle(props, 'flex-direction', 'flexDirection') || getDefaultProp('flexDirection', props) || getDefaultProp('flexDirection'),
                flexWrap: getDefaultStyle(props, 'flex-wrap', 'flexWrap') || getDefaultProp('flexWrap', props) || getDefaultProp('flexWrap'), //默认不换行
                alignItems: getDefaultStyle(props, 'align-items', 'alignItems') || getDefaultProp('alignItems'),
                alignSelf: getDefaultStyle(props, 'align-self') || alignSelf,
                alignContent: getDefaultStyle(props, 'align-content', 'alignContent') || getDefaultProp('alignContent'),
                justifyContent: getDefaultStyle(props, 'justify-content', 'justifyContent') || getDefaultProp('justifyContent'), //默认左对齐
                order: getDefaultStyle(props, 'order', 'order') || getDefaultProp('order'),
                flexShrink: getDefaultStyle(props, 'flex-shrink', 'flexShrink') || getDefaultProp('flexShrink', props) || getDefaultProp('flexShrink'),
                flexGrow: getDefaultStyle(props, 'flex-grow', 'flexGrow') || getDefaultProp('flexGrow', props) || getDefaultProp('flexGrow')
            }
        };


    }
    while (_childNode = element.childNodes[++_index]) {
        if (!(_childNode instanceof Element)) {
            //ie 的button后面的换行符会留下空格
            if (_childNode.textContent === ' ') {
                _childNode.parentNode.removeChild(_childNode);
            }
        }
    }
    // for each child node of the element
    while (childNode = element.childNodes[++index]) {
        // whether the child is an element
        let isElement = childNode instanceof Element;
        if (isElement) {
            // push the child details to children
            let childDetails = readAll(childNode);
            if (isDisplayFlex) {
                element instanceof Element && resetStyle(element);
                //如果父类为flex且自己不是flex的时候
                if (!isFlexBox(childNode)) {
                    const _style = getStyle(childNode);
                    childDetails.computedStyle = _style;
                    childDetails.style = childNode.getAttribute('style') || '';
                    childDetails.isNativeInline = judgeIsNativeInline(childNode);
                    childDetails.classList = getClassList(childNode);
                    childDetails.boxSizing = _style.boxSizing;
                    childDetails.props = {
                        alignSelf: getDefaultStyle(_style, 'align-self') || _ele.props.alignItems,
                        order: getDefaultStyle(_style, 'order', 'order') || getDefaultProp('order'),
                        flexShrink: getDefaultStyle(_style, 'flex-shrink', 'flexShrink') || getDefaultProp('flexShrink', _style) || getDefaultProp('flexShrink'),
                        flexGrow: getDefaultStyle(_style, 'flex-grow', 'flexGrow') || getDefaultProp('flexGrow', _style) || getDefaultProp('flexGrow')
                    }
                }
                //判断是否支持flex，设置inline-block
                if (!supportsFlexBox()) {
                    childNode.style.display = 'inline-block';
                    childNode.style.verticalAlign = 'middle';
                }
            }

            _ele.children.push(childDetails);
        }
    }

    return _ele;
}

