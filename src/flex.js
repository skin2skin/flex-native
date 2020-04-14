//内联元素
import {
    createTransform, getOffset, getPrefixAndProp, getTransform
} from "./utils";

const inlineArr = ['a',
    'abbr',
    'acronym',
    'b',
    'bdo',
    'big',
    'br',
    'cite',
    'code',
    'dfn',
    'em',
    'font',
    'i',
    'kbd',
    'label',
    'q',
    's',
    'samp',
    'small',
    'span',
    'strike',
    'strong',
    'sub',
    'sup',
    'tt',
    'u'];

const JUSTIFY_CONTENT = {
    FLEX_START: 'flex-start',
    FLEX_END: 'flex-end',
    CENTER: 'center',
    SPACE_BETWEEN: 'space-between',
    SPACE_AROUND: 'space-around'
};

const ALIGN_ITEMS = {
    FLEX_START: 'flex-start',
    FLEX_END: 'flex-end',
    CENTER: 'center',
    BASELINE: 'baseline',
    STRETCH: 'stretch'
};
//决定主轴的方向（即项目的排列方向）
const FLEX_DIRECTION = {
    ROW: 'row',//主轴为水平方向，起点在左端
    ROW_REVERSE: 'row-reverse', //主轴为水平方向，起点在右端
    COLUMN: 'column',//主轴为垂直方向，起点在上沿
    COLUMN_REVERSE: 'column-reverse'//主轴为垂直方向，起点在下沿
};
//如果一条轴线排不下，如何换行
const FLEX_WRAP = {
    NOWRAP: 'nowrap',//不换行
    WRAP: 'wrap',//换行，第一行在上方
    WRAP_REVERSE: 'wrap-reverse'//换行，第一行在下方
};
//定义了多根轴线的对齐方式。如果项目只有一根轴线，该属性不起作用
const ALIGN_CONTENT = {
    FLEX_START: 'flex-start',//与交叉轴的起点对齐
    FLEX_END: 'flex-end',//与交叉轴的终点对齐
    CENTER: 'center',//与交叉轴的中点对齐
    SPACE_BETWEEN: 'space-between',//与交叉轴两端对齐，轴线之间的间隔平均分布
    SPACE_AROUND: 'space-around',//每根轴线两侧的间隔都相等。所以，轴线之间的间隔比轴线与边框的间隔大一倍。
    STRETCH: 'stretch',//轴线占满整个交叉轴
};
const FLEX_SHRINK = 1;//定义了项目的缩小比例，默认为1，即如果空间不足，该项目将缩小
const FLEX_GROW = 0;//定义项目的放大比例，默认为0，即如果存在剩余空间，也不放大

class Flex {
    constructor(params) {
        this.init(params);
        this.initState()
    }

    static defaultProps = {
        flexDirection: FLEX_DIRECTION.ROW,
        flexWrap: FLEX_WRAP.NOWRAP, //默认不换行
        flexFlow: `${FLEX_DIRECTION.ROW} ${FLEX_WRAP.NOWRAP}`,
        alignItems: ALIGN_ITEMS.FLEX_START,
        alignSelf: ALIGN_ITEMS.FLEX_START,
        alignContent: ALIGN_CONTENT.STRETCH,
        justifyContent: JUSTIFY_CONTENT.FLEX_START, //默认左对齐
        order: 0,//属性定义项目的排列顺序。数值越小，排列越靠前，默认为0
        flexGrow: FLEX_GROW,//属性定义项目的放大比例，默认为0，即如果存在剩余空间，也不放大
        flexShrink: FLEX_SHRINK //属性定义了项目的缩小比例，默认为1，即如果空间不足，该项目将缩小
    };

    init({element, props, classList, style, offsetLeft, offsetTop, computedStyle, children}) {
        this.props = props;
        this.element = element;
        this.classList = classList;
        this.computedStyle = computedStyle;
        this.children = children;
        const {flexDirection, flexWrap} = props;
        let wrapperRect = element.getBoundingClientRect();
        wrapperRect = {
            width: wrapperRect.width - parseInt(computedStyle.paddingLeft) - parseInt(computedStyle.paddingRight) - parseInt(computedStyle.borderLeftWidth) - parseInt(computedStyle.borderRightWidth),
            height: wrapperRect.height - parseInt(computedStyle.paddingTop) - parseInt(computedStyle.paddingBottom) - parseInt(computedStyle.borderTopWidth) - parseInt(computedStyle.borderBottomWidth)
        };
        this.left =offsetLeft;
        this.top = offsetTop;
        this.height = wrapperRect.height;
        this.width = wrapperRect.width;

        this.style = style;
        let W = 'width';
        let H = 'height';
        let X = 'x';
        let Y = 'y';
        let FLEX_START = 'FLEX_START';
        let FLEX_END = 'FLEX_END';
        if (flexDirection.includes(FLEX_DIRECTION.COLUMN)) {
            W = 'height';
            H = 'width';
            X = 'y';
            Y = 'x';
        }
        if (flexWrap === FLEX_WRAP.WRAP_REVERSE) {
            FLEX_START = 'FLEX_END';
            FLEX_END = 'FLEX_START'
        }
        this.W = W;
        this.H = H;
        this.X = X;
        this.Y = Y;
        this.FLEX_START = FLEX_START;
        this.FLEX_END = FLEX_END;

    }

    initState() {
        const { style, computedStyle, left, top, element, children,W} = this;
        const {flexDirection} = this.props;
        let _children = children.sort((a, b) => {
            const aOrder = a.props.order;
            const bOrder = b.props.order;
            return Number(aOrder) - Number(bOrder);
        });
        const remakePos = _children.map((item,index) => {
            const obj = item.element.getBoundingClientRect();
            const nativeStyle=item.style;
            const style = item.computedStyle;
            //console.log(style.width,obj.width)

            //排除掉fixed等影响布局的
            const isFixed = (style.position === 'absolute' || style.position === 'fixed');
            if (isFixed) {
                return {
                    isFixed,
                    props: {},
                    borderLeftWidth: 0,
                    borderRightWidth: 0,
                    marginLeft: 0,
                    marginRight: 0,
                    width: 0,
                    height: 0,
                    x: 0,
                    y: 0,
                }
            }
            console.log(obj.width)
            let width =obj.width + parseInt(style.marginLeft) + parseInt(style.marginRight) +parseInt(style.borderLeftWidth)+parseInt(style.borderRightWidth) ;
            let height =obj.height + parseInt(style.marginTop) + parseInt(style.marginBottom) +parseInt(style.borderTopWidth)+parseInt(style.borderBottomWidth);
            let _x= - (item.offsetLeft - parseInt(style.marginLeft) - parseInt(computedStyle.borderLeftWidth)-parseInt(computedStyle.paddingLeft) - left);
            let _y= - (item.offsetTop - parseInt(style.marginTop) - parseInt(computedStyle.borderLeftWidth) -parseInt(computedStyle.paddingTop)- top);

            return {
                element: item.element,
                computedStyle:item.computedStyle,
                style:nativeStyle,
                isNativeInline:item.isNativeInline,
                isFixed,
                props: item.props,
                borderLeftWidth: parseInt(style.borderLeftWidth),
                borderRightWidth: parseInt(style.borderRightWidth),
                marginLeft: parseInt(style.marginLeft),
                marginRight: parseInt(style.marginRight),
                paddingLeft: parseInt(style.paddingLeft),
                paddingRight: parseInt(style.paddingRight),
                height,
                width,
                x: _x,
                y: _y,
            }
        }).filter((item) => !item.isFixed);
        //创建流动布局
        const flowBox = this.createFlowBox(remakePos);

        this.height = this.computedStyle.height ? this.height : flowBox.reduce((al, b) => {
            if (flexDirection.includes(FLEX_DIRECTION.COLUMN)) {
                return al + b.lineArrayWidth
            } else {
                return al + b.max
            }
        }, 0);
        //console.log('flowbox',flowBox)
        //开始布局
        const array = this.startLayout(flowBox);
        element.style['height'] = this.height.toFixed(6) + 'px';
        element.setAttribute('data-origin', style);
        element.setAttribute('data-style', element.getAttribute('style'));
        this.flowLayoutBox = array;
        remakePos.forEach((it, index) => {
            const item = Flex.findByIndex(array, index);
            const {element} = item;
            element.style[getPrefixAndProp('transform')] = createTransform(item);
            const itemPrams = this.children[index];
            if (itemPrams.isFlex) {
                new Flex(this.children[index])
            }
            element.setAttribute('data-origin', it.style);
            element.setAttribute('data-style', element.getAttribute('style'));
        });
    }

    /**
     *得到每一行的最高值
     * @param {} item
     */
    getStretchMax(item) {
        const {H} = this;

        return Math.max(...item.filter(item => !item.isFixed).map(a => a[H]))
    }

    /**
     *根据flexGrow和FlexShrink重新定义宽度或者高度
     */
    resetWidthByShrinkAndGrow(arr) {
        const {W} = this;
        return arr.map(array => {
            const lineArrayWidth = array.reduce((al, item) => al + item[W], 0);
            const restWidth = this[W] - lineArrayWidth;
            let flexGrowArr = array.map(item => Number(item.props.flexGrow));
            const allRateGrow = flexGrowArr.reduce((a, b) => a + b, 0);
            const allFlexShrink = array.map(item => Number(item.props.flexShrink)).reduce((a, b) => a + b, 0);
            array = array.map(item => {
                let needAdd = this.getNeedAddWidth(item, restWidth, lineArrayWidth, allRateGrow, allFlexShrink);
                const offset= -item.borderLeftWidth - item.borderRightWidth - item.marginLeft - item.marginRight - item.paddingLeft - item.paddingRight;
                //console.log('offset',offset)
                item.withOffset =(item.isNativeInline)?- item.marginLeft - item.marginRight:offset;
                item.withOffset2 = needAdd;
                return item;
            });
            const {computedStyle} = this;
            array = array.map((item) => {
                item[W] = item[W] + item.withOffset2;
                const acWidth = item[this.W] + item.withOffset;
                //console.log('acWidth---',acWidth)
                item.element.style[this.W] = (acWidth < 0 ? 0.000000 : acWidth.toFixed(6)) + 'px';
                return item;
            });
            //为什么不放在上面是因为 上面那个遍历在设置宽度 如果在本身就支持flex的浏览器中 会导致 设置的item的后面会宽度会自动变化
            array=array.map((item) => {
                item.x=- (getOffset(item.element).left  - parseInt(item.computedStyle.marginLeft) - parseInt(computedStyle.borderLeftWidth)-parseInt(computedStyle.paddingLeft) - getOffset(item.element.parentNode).left );
                item.y=- (getOffset(item.element).top - parseInt(item.computedStyle.marginTop) - parseInt(computedStyle.borderTopWidth) -parseInt(computedStyle.paddingTop)- getOffset(item.element.parentNode).top);
                return item;
            });
            return array;
        })
    }

    /**
     * 先设置流动盒子的X轴
     * @param remakePos
     * @param wrapperStyle
     * @returns {any[]}
     */
    getFlatArray(remakePos, wrapperStyle) {
        const {flexDirection, flexWrap} = this.props;
        const {W, X} = this;
        let arr = [];
        if (flexWrap === FLEX_WRAP.NOWRAP) {
            arr.push(remakePos)
        } else {
            let sliceIndex = 0;
            let line = 1;
            remakePos.reduce((al, item, it) => {
                let res = al + item[W];
                if (it !== 0) {
                    if (al && (al + item[W]) > (this[W]) * line) {
                        res = this[W] * line + item[W];
                        arr.push(remakePos.slice(sliceIndex, it))
                        sliceIndex = it;
                        line = line + 1;
                    }
                    if (it === remakePos.length - 1) {
                        arr.push(remakePos.slice(sliceIndex, it + 1))
                    }
                }
                return res
            }, 0);
        }

        //根据flexGrow和FlexShrink重新定义宽度或者高度
        arr = this.resetWidthByShrinkAndGrow(arr);
        if (flexWrap === FLEX_WRAP.WRAP_REVERSE) {
            arr = arr.reverse()
        }

        return arr.map((item) => {
            const lineArrayWidth = item.reduce((al, item) => al + item[W], 0);
            return {
                max: this.getStretchMax(item),
                lineArray: item.map((_item, _index) => {

                    if (flexDirection.includes('reverse')) {
                        _item[X] += this[W] - item.filter((a, b) => b <= _index).reduce((a, b) => a + b[W], 0);
                    } else {
                        _item[X] += item.filter((a, b) => b < _index).reduce((a, b) => a + b[W], 0);
                    }
                    return _item
                }),
                lineArrayWidth,
                restWidth: this[W] - lineArrayWidth
            };
        });
    }

    /**
     * 每个div需要添加的宽度
     * @param item
     * @param restWidth
     * @param allWidth
     * @param allRateGrow
     * @param allFlexShrink
     * @returns {*}
     */
    getNeedAddWidth(item, restWidth, allWidth, allRateGrow, allFlexShrink) {
        const {W} = this;
        let grow = Number(item.props['flexGrow']);
        let res;
        //缩小
        if (allWidth > this[W]) {
            res = restWidth * (Number(item.props['flexShrink'])) / allFlexShrink;
            // 放大
        } else if (allWidth < this[W] && grow) {
            res = restWidth * (grow / allRateGrow)
        } else {
            res = 0;
        }
        return res;
    }

    /**
     * 创建流动布局的盒子
     * @param remakePos
     */
    createFlowBox(remakePos) {
        const {Y, style} = this;
        let posArr = this.getFlatArray(remakePos, style);
        return posArr.map((item, it) => {
            const getTop = (posArr.filter((a, b) => b <= it - 1).reduce((a, b) => a + b.max, 0));
            item.lineArray = item.lineArray.map(item => {
                item[Y] = item[Y] + (it === 0 ? 0 : getTop);
                return item;
            });
            return {
                ...item,
                top: it === 0 ? 0 : getTop,
            }
        })

    }

    /**
     * 开始布局
     */
    startLayout(arr) {
        arr = this.setLineLocation(arr);
        arr = arr.map((item, it) => {
            item.lineArray = this.setLineItemLocation(item, arr, it);
            return item
        });
        return arr
    }

    static findByIndex(arr, index) {
        let res = {};
        let ind = 0;
        outer:for (let i = 0; i < arr.length; i++) {
            let item = arr[i];
            for (let j = 0; j < item.lineArray.length; j++) {
                if (ind === index) {
                    res = item.lineArray[j];
                    break outer
                }
                ind = ind + 1;
            }
        }
        return res
    };

    /**
     * 设置一行的位置
     * @param arr
     * @returns {*}
     */
    setLineLocation(arr) {

        const {H, Y, FLEX_START, FLEX_END} = this;
        let {alignContent, flexWrap} = this.props;
        //alignContent属性定义了多根轴线的对齐方式。如果项目只有一根轴线，该属性不起作用
        if (flexWrap === FLEX_WRAP.NOWRAP) {
            alignContent = ALIGN_CONTENT.STRETCH
        }
        //每一行的最大值加起来
        const allHeight = arr.reduce((al, item) => {
            return al + item.max
        }, 0);

        //定义多根轴线的对齐方式
        switch (alignContent) {
            case ALIGN_CONTENT.STRETCH:
                arr = arr.map((item, index) => {

                    const restHeight = this[H] - allHeight;
                    const marginTop = restHeight / arr.length;
                    item.axisHeight = item.max + marginTop;
                    //得到前面的总的行高度
                    const marginZero = marginTop * index;
                    item.lineArray = item.lineArray.map(rect => ({
                        ...rect,
                        [Y]: rect[Y] + marginZero
                    }));
                    return item
                });
                break;
            case ALIGN_CONTENT[FLEX_START]:
                arr = arr.map((item, index) => {
                    item.axisHeight = item.max;
                    return item;
                });
                break;
            case ALIGN_CONTENT[FLEX_END]:
                arr = arr.map((item, index) => {
                    item.axisHeight = item.max;
                    item.lineArray = item.lineArray.map(rect => ({
                        ...rect,
                        [Y]: rect[Y] + this[H] - allHeight
                    }));
                    return item;
                });

                break;
            case ALIGN_CONTENT.CENTER:
                arr = arr.map((item, index) => {
                    item.axisHeight = item.max;
                    item.lineArray = item.lineArray.map(rect => ({
                        ...rect,
                        [Y]: rect[Y] + (this[H] - allHeight) / 2
                    }));
                    return item;
                });
                break;
            case ALIGN_CONTENT.SPACE_AROUND:
                const gapWidth = (this[H] - allHeight) / (arr.length * 2);
                arr = arr.map((item, index) => {
                    item.axisHeight = item.max;
                    item.lineArray = item.lineArray.map(rect => ({
                        ...rect,
                        [Y]: rect[Y] + (index * 2 + 1) * gapWidth
                    }));
                    return item;
                });
                break;
            case ALIGN_CONTENT.SPACE_BETWEEN:
                arr = arr.map((item, index) => {
                    item.axisHeight = item.max;
                    if (index === 0) {
                        item[Y] += 0;
                    } else if (index === arr.length - 1) {
                        item.lineArray = item.lineArray.map(rect => ({
                            ...rect,
                            [Y]: rect[Y] + this[H] - allHeight
                        }));
                    } else {
                        const gapWidth = (this[H] - allHeight) / (arr.length - 1);
                        item.lineArray = item.lineArray.map(rect => ({
                            ...rect,
                            [Y]: rect[Y] + gapWidth * index
                        }));
                    }
                    return item;
                });
                break;

        }
        return arr;
    }

    /**
     *
     * @param item
     * @param arr
     * @param index
     * @returns {*}
     */
    setLineItemLocation(item, arr = [], index) {
        const {W, H, X, Y, FLEX_START, FLEX_END} = this;
        const {flexDirection, justifyContent, alignItems} = this.props;
        const allLength = item.lineArray.reduce((al, b) => al + b[W], 0);
        let restLength = (this[W] - allLength) || 0;
        //如果是不换行的情况下没有超出
        //主轴居中
        switch (justifyContent) {
            case JUSTIFY_CONTENT.FLEX_START:
                break;
            case JUSTIFY_CONTENT.FLEX_END:
                //一行盒子的宽度
                const lineAllWidth = item.lineArray.reduce((a, b) => {
                    return a + b[W]
                }, 0);
                let needAdd = this[W] - (lineAllWidth);
                if (flexDirection.includes('reverse')) {
                    needAdd = -needAdd
                }
                item.lineArray = item.lineArray.map(rect => {
                    let res = rect;
                    res[X] += needAdd;
                    return res
                }).reverse();
                break;
            case JUSTIFY_CONTENT.CENTER:
                if (flexDirection.includes('reverse')) {
                    restLength = -restLength
                }
                item.lineArray = item.lineArray.map(rect => ({
                    ...rect,
                    [X]: rect[X] + restLength / 2
                }));
                break;
            case JUSTIFY_CONTENT.SPACE_AROUND:
                if (flexDirection.includes('reverse')) {
                    restLength = -restLength
                }
                item.lineArray = item.lineArray.map((rect, index) => {
                    const gapWidth = restLength / (item.lineArray.length * 2);
                    rect[X] += (index * 2 + 1) * gapWidth;
                    return rect
                });
                break;
            case JUSTIFY_CONTENT.SPACE_BETWEEN:
                if (flexDirection.includes('reverse')) {
                    restLength = -restLength
                }
                item.lineArray = item.lineArray.map((rect, index) => {
                    if (index === 0) {
                        rect[X] = 0;
                    } else if (index === item.lineArray.length - 1) {
                        rect[X] += restLength;
                    } else {
                        if (item.lineArray.length !== 0) {
                            let reduceWidth = item.lineArray.reduce((al, b) => al + b[W], 0);
                            const gapWidth = (this[W] - reduceWidth) / (item.lineArray.length - 1);
                            rect[X] += gapWidth * (index)
                        }
                    }
                    return rect
                });
                break;
        }
        switch (alignItems) {
            case ALIGN_ITEMS[FLEX_START]:
                item.lineArray = item.lineArray.map((rect) => {
                    const props = rect.props || {};
                    if (props['alignSelf'] === ALIGN_ITEMS[FLEX_START]) {
                    } else if (props['alignSelf'] === ALIGN_ITEMS[FLEX_END]) {
                        rect[Y] += ((item.axisHeight || 0) - rect[H])
                    } else if (props['alignSelf'] === ALIGN_ITEMS.CENTER) {
                        rect[Y] += ((item.axisHeight || 0) - rect[H]) / 2
                    } else if (props['alignSelf'] === ALIGN_ITEMS.STRETCH) {
                        //todo
                    } else if (props['alignSelf'] === ALIGN_ITEMS.BASELINE) {
                        //todo
                    }
                    return rect
                });
                break;
            case ALIGN_ITEMS[FLEX_END]:
                item.lineArray = item.lineArray.map((rect) => {
                    const props = rect.props || {};
                    if (props['alignSelf'] === ALIGN_ITEMS[FLEX_START]) {
                    } else if (props['alignSelf'] === ALIGN_ITEMS[FLEX_END]) {
                        rect[Y] += ((item.axisHeight || 0) - rect[H])
                    } else if (props['alignSelf'] === ALIGN_ITEMS.CENTER) {
                        rect[Y] += ((item.axisHeight || 0) - rect[H]) / 2
                    } else if (props['alignSelf'] === ALIGN_ITEMS.STRETCH) {
                        //todo
                    } else if (props['alignSelf'] === ALIGN_ITEMS.BASELINE) {
                        //todo
                    }
                    return rect
                });
                break;
            case ALIGN_ITEMS.CENTER:
                item.lineArray = item.lineArray.map((rect) => {
                    const props = rect.props || {};
                    if (props['alignSelf'] === ALIGN_ITEMS[FLEX_START]) {
                    } else if (props['alignSelf'] === ALIGN_ITEMS[FLEX_END]) {
                        rect[Y] += ((item.axisHeight || 0) - rect[H])
                    } else if (props['alignSelf'] === ALIGN_ITEMS.CENTER) {
                        rect[Y] += ((item.axisHeight || 0) - rect[H]) / 2
                    } else if (props['alignSelf'] === ALIGN_ITEMS.STRETCH) {
                        //todo
                    } else if (props['alignSelf'] === ALIGN_ITEMS.BASELINE) {
                        //todo
                    }
                    return rect
                });
                break;
            case ALIGN_ITEMS.STRETCH:

                break;
            case ALIGN_ITEMS.BASELINE:
                break;
        }


        return item.lineArray
    }

}

export default Flex
