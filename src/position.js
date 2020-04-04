//内联元素
import {
    createTransform, debounce, getCss, getPrefixAndProp, getStyle,
    getTransform
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
        this.initState(params)
    }

    static defaultProps = {
        flexDirection: FLEX_DIRECTION.ROW,
        flexWrap: FLEX_WRAP.NOWRAP, //默认不换行
        flexFlow:`${FLEX_DIRECTION.ROW} ${FLEX_WRAP.NOWRAP}`,
        alignItems: ALIGN_ITEMS.FLEX_START,
        alignSelf: ALIGN_ITEMS.FLEX_START,
        alignContent: ALIGN_CONTENT.STRETCH,
        justifyContent: JUSTIFY_CONTENT.FLEX_START, //默认左对齐
        order: 0,//属性定义项目的排列顺序。数值越小，排列越靠前，默认为0
        flexGrow: 0,//属性定义项目的放大比例，默认为0，即如果存在剩余空间，也不放大
        flexShrink: 1 //属性定义了项目的缩小比例，默认为1，即如果空间不足，该项目将缩小
    };

    init({element, props}) {
        this.props = props;
        this.element = element;
        const {flexDirection,flexWrap} = props;
        let W = 'width';
        let H = 'height';
        let X = 'x';
        let Y = 'y';
        let FLEX_START = 'FLEX_START';
        let FLEX_END = 'FLEX_END'
        if (flexDirection.includes(FLEX_DIRECTION.COLUMN)) {
            W = 'height';
            H = 'width';
            X = 'y';
            Y = 'x';
        }
        if(flexWrap===FLEX_WRAP.WRAP_REVERSE){
            FLEX_START = 'FLEX_END';
            FLEX_END = 'FLEX_START'
        }
        this.W = W;
        this.H = H;
        this.X = X;
        this.Y = Y;
        this.FLEX_START = FLEX_START;
        this.FLEX_END = FLEX_END;
        const fn=debounce((e)=>{
            console.log('DOMSubtreeModified',e.target.innerHTML)
        },50);
        element.addEventListener('DOMSubtreeModified',fn);
    }

    initState({element, props}) {
        let wrapperRect = element.getBoundingClientRect();

        const wrapperStyle = getStyle(element);
        wrapperRect = {
            left: wrapperRect.left + parseInt(wrapperStyle.paddingLeft),
            top: wrapperRect.top + parseInt(wrapperStyle.paddingTop),
            width: wrapperRect.width - parseInt(wrapperStyle.paddingLeft) - parseInt(wrapperStyle.paddingRight) - parseInt(wrapperStyle.borderLeftWidth) - parseInt(wrapperStyle.borderRightWidth),
            height: wrapperRect.height - parseInt(wrapperStyle.paddingTop) - parseInt(wrapperStyle.paddingBottom) - parseInt(wrapperStyle.borderTopWidth) - parseInt(wrapperStyle.borderBottomWidth)
        };
        this.height = wrapperRect.height;
        this.width = wrapperRect.width;
        this.wrapperRect = wrapperRect;
        this.style = wrapperStyle;
        const childAst = this.getChildren();
        this.children = childAst;
        const remakePos = Array.from(childAst.map(item => item.element)).map((node, index) => {
            const obj = node.getBoundingClientRect();
            const style = getStyle(node);
            //排除掉fixed等影响布局的
            const isFixed = !!(style.position === 'absolute' || style.position === 'fixed');
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
            const _transform = getTransform(node);

            return {
                element: node,
                isFixed,
                props: childAst[index].props,
                borderLeftWidth: parseInt(style.borderLeftWidth),
                borderRightWidth: parseInt(style.borderRightWidth),
                marginLeft: parseInt(style.marginLeft),
                marginRight: parseInt(style.marginRight),
                width: obj.width + parseInt(style.marginLeft) + parseInt(style.marginRight),
                height: obj.height + parseInt(style.marginTop) + parseInt(style.marginBottom),
                x: _transform.x - (obj.left - parseInt(style.marginLeft) - parseInt(wrapperStyle.borderLeftWidth) - wrapperRect.left),
                y: _transform.y - (obj.top - parseInt(style.marginTop) - parseInt(wrapperStyle.borderLeftWidth) - wrapperRect.top),
            }
        }).filter((item) => !item.isFixed);
        const flowBox = this.createFlowBox(remakePos,wrapperStyle);
        console.log('flowBox', flowBox)
        const box = this.startLayout(flowBox);

        remakePos.forEach((it, index) => {
            const item = Flex.findByIndex(box.array, index);
            const {element} = item;
            element.style[getPrefixAndProp('transform')] = createTransform(item);
            element.style[this.W]=item[this.W]+item.withOffset+'px'
        });
    }

    getStretchMax(item) {
        const {H} = this;
        return Math.max(...item.filter(item => !item.isFixed).map(a => a[H]))

    }

    getFlowArr(remakePos, wrapperStyle) {
        const {flexDirection, flexWrap} = this.props;
        const {W, X} = this;
        let arr = [];
        if (flexWrap === FLEX_WRAP.NOWRAP) {
            const lineArrayWidth = remakePos.reduce((al, item) => al + item[W], 0);
            const restWidth = this[W]- lineArrayWidth;
            let flexGrowArr = remakePos.map(item =>Number(item.props.flexGrow));
            const allRateGrow = flexGrowArr.reduce((a, b) => a + b, 0);
            let flexShrinkWidth = remakePos.reduce((al, item) => {
                let itemShrink=Number(item.props.flexShrink);
                return al + item[W] * itemShrink
            }, 0);
            remakePos=remakePos.map(item=>{
                let needAdd = this.getNeedAddWidth(item, restWidth, lineArrayWidth,allRateGrow, flexShrinkWidth);
                item.withOffset=-item.borderLeftWidth-item.borderRightWidth-item.marginLeft-item.marginRight;
                item.withOffset2=needAdd;
                return item;
            });

            remakePos=remakePos.map((item,index)=>{
                item[W]=item[W]+item.withOffset2;
                //由于Y轴本身就是流动的 会影响布局 所以给加上之前的withOffset2
                if(flexDirection.includes('column')){
                    if(index!==0){
                        const pre=remakePos.filter((it,ind)=>ind<index).reduce((al,b)=>{
                            return al+b.withOffset2
                        },0);
                        item[X]=item[X]-pre;
                    }
                }
                return item;
            });
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

        if (flexWrap === FLEX_WRAP.WRAP_REVERSE) {
            arr = arr.reverse()
        }

        if (parseInt(wrapperStyle.height) === 0) {
            this.height = arr.reduce((al, b) => {
                return al + this.getStretchMax(b)
            }, 0);
        }


        return arr.map((item) => {
            const lineArrayWidth=item.reduce((al, item) => al + item[W], 0);
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
     * @param flexShrinkWidth
     * @returns {*}
     */
    getNeedAddWidth(item, restWidth, allWidth,allRateGrow, flexShrinkWidth) {

        const {W}=this;
        let grow=Number(item.props['flexGrow']);
        let res;
        //缩小
        if (allWidth > this[W]) {
            res = (item[W] / flexShrinkWidth) * restWidth
            // 放大
        } else if (allWidth < this[W] && grow) {
            res = restWidth * (grow / allRateGrow)
        } else {
            res = 0;
        }
        console.log(res)
        return res;
    }

    /**
     * 创建流动布局的盒子
     * @param remakePos
     * @param wrapperStyle
     * @returns {{height: number|*, array: *}}
     */
    createFlowBox(remakePos, wrapperStyle) {
        const {Y} = this;
        let posArr = this.getFlowArr(remakePos, wrapperStyle);
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
        return {
            height: this.height,
            array: arr
        }
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
        const {H, Y,FLEX_START,FLEX_END} = this;
        console.log('arr----', arr);
        let {alignContent,flexWrap} = this.props;
        //alignContent属性定义了多根轴线的对齐方式。如果项目只有一根轴线，该属性不起作用
        if(flexWrap===FLEX_WRAP.NOWRAP){
            alignContent=ALIGN_CONTENT.STRETCH
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
                    console.log(marginZero)
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
                    }))
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
        const {W,H,X, Y,FLEX_START,FLEX_END} = this;
        const {flexDirection, justifyContent, alignItems} = this.props;
        console.log('props---------', this.props);
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
                    console.log('ppppppppp---------', item.axisHeight)
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


    getChildren() {
        const {element} = this;
        const {flexWrap, flexDirection} = this.props;
        let childNodes = Array.from(element.childNodes);
        childNodes = childNodes.map(ele => {
            const alignItems = getCss(element).alignItems;
            return {
                element: ele,
                props: {
                    flexDirection: getCss(ele).flexDirection,
                    flexWrap: getCss(ele).flexWrap,
                    alignItems,
                    alignSelf: getCss(ele).alignSelf || alignItems,
                    alignContent: getCss(ele).alignContent,
                    justifyContent: getCss(ele).justifyContent,
                    order: getCss(ele).order,
                    flexShrink: getCss(ele).flexShrink,
                    flexGrow: getCss(ele).flexGrow
                }
            }
        });
        childNodes = childNodes.sort((a, b) => {
            const aOrder = a.props.order;
            const bOrder = b.props.order;
            return Number(aOrder) - Number(bOrder);
        });

        /*if (flexWrap === FLEX_WRAP.WRAP_REVERSE) {
            childNodes.reverse();
        }*/
        return childNodes
    }

}

export default Flex
