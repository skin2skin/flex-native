//内联元素
import {getStyle} from "./utils";

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

    state = {
        wrapperRect: {},
        childRect: null,
        flowBoxArr: []
    };

    constructor(node) {
        this.initState(node)
    }

    static defaultProps = {
        flexDirection: FLEX_DIRECTION.ROW,
        flexWrap: FLEX_WRAP.NOWRAP, //默认不换行
        alignItems: ALIGN_ITEMS.FLEX_START,
        alignContent: ALIGN_CONTENT.STRETCH,
        justifyContent: JUSTIFY_CONTENT.FLEX_START, //默认左对齐
        order: 1,
    };

    getProps(style, props) {
        return style[props] || this.defaultProps[props]
    }

    initState(wrapperNode) {
        let wrapperRect = wrapperNode.getBoundingClientRect();
        const wrapperStyle = getStyle(wrapperNode);
        wrapperRect = {
            left: wrapperRect.left + parseInt(wrapperStyle.paddingLeft),
            top: wrapperRect.top + parseInt(wrapperStyle.paddingTop),
            width: wrapperRect.width - parseInt(wrapperStyle.paddingLeft) - parseInt(wrapperStyle.paddingRight) - parseInt(wrapperStyle.borderLeftWidth) - parseInt(wrapperStyle.borderRightWidth),
            height: wrapperRect.height - parseInt(wrapperStyle.paddingTop) - parseInt(wrapperStyle.paddingBottom) - parseInt(wrapperStyle.borderTopWidth) - parseInt(wrapperStyle.borderBottomWidth)
        };
        const childNodes = wrapperNode.childNodes;
        const oriNodes = childNodes[0].childNodes;
        const ast = this.getChildren(wrapperNode, this.getProps(wrapperStyle, 'flexWrap'));

        {
            const remakePos = Array.from(oriNodes).map((node, index) => {
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
                        oriHeight: 0,
                        oriWidth: 0,
                        width: 0,
                        height: 0,
                        x: 0,
                        y: 0,
                    }
                }
                return {
                    isFixed,
                    props: ast[index].props,
                    borderLeftWidth: parseInt(style.borderLeftWidth),
                    borderRightWidth: parseInt(style.borderRightWidth),
                    marginLeft: parseInt(style.marginLeft),
                    marginRight: parseInt(style.marginRight),
                    oriHeight: obj.height - parseInt(style.borderTopWidth) - parseInt(style.borderBottomWidth),
                    oriWidth: obj.width - parseInt(style.borderLeftWidth) - parseInt(style.borderRightWidth),
                    width: obj.width + parseInt(style.marginLeft) + parseInt(style.marginRight),
                    height: obj.height + parseInt(style.marginTop) + parseInt(style.marginBottom),
                    x: -(obj.left - parseInt(style.marginLeft) - parseInt(wrapperStyle.borderLeftWidth) - wrapperRect.left),
                    y: -(obj.top - parseInt(style.marginTop) - parseInt(wrapperStyle.borderLeftWidth) - wrapperRect.top),
                }
            });

            console.log('init---pos', wrapperStyle.height)
            const box = this.createFlowBox(remakePos, wrapperRect, wrapperStyle);
            wrapperRect.height = box.height;
            console.log('init---', box)
        }
    }

    getStretchMax(item, arr, wrapperRect, wrapperStyle) {
        const {flexDirection, alignContent} = this.props;
        let H = 'height';
        if (flexDirection.includes(FLEX_DIRECTION.COLUMN)) {
            H = 'width'
        }
        console.log('wrapperStyle.height', wrapperStyle.height)
        if (alignContent === ALIGN_CONTENT.STRETCH) {
            if (parseInt(wrapperStyle.height) === 0) {
                return Math.max(...item.filter(item => !item.isFixed).map(a => a[H]))
            }
            return wrapperRect[H] / arr.length
        } else {
            return Math.max(...item.filter(item => !item.isFixed).map(a => a[H]))
        }

    }

    getFlowArr(remakePos, wrapperRect, wrapperStyle) {
        const {flexDirection, flexWrap} = this.props;
        let W = 'width';
        let X = 'x';
        let Y = 'y';
        if (flexDirection.includes(FLEX_DIRECTION.COLUMN)) {
            W = 'height';
            X = 'y';
            Y = 'x'
        }
        const arr = [];
        if (flexWrap === FLEX_WRAP.NOWRAP) {
            arr.push(remakePos)
        } else {
            let sliceIndex = 0;
            let line = 1;
            remakePos.reduce((al, item, it) => {
                let res = al + item[W];
                if (it !== 0) {
                    if (al && (al + item[W]) > (wrapperRect[W]) * line) {
                        res = wrapperRect[W] * line + item[W];
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

        if (parseInt(wrapperStyle.height) === 0) {
            wrapperRect.height = arr.reduce((al, b) => {
                return al + this.getStretchMax(b, arr, wrapperRect, wrapperStyle)
            }, 0);
        }


        return arr.map((item) => {
            const res = {
                rect: item,
                max: this.getStretchMax(item, arr, wrapperRect, wrapperStyle),
                rectPos: item.map((_item, _index) => {
                    if (flexDirection.includes('reverse')) {
                        const behindWidth = item.filter((a, b) => b >= _index).reduce((a, b) => a + b[W], 0);
                        _item[X] += wrapperRect[W] - behindWidth
                    } else {
                        _item[X] += item.filter((a, b) => b < _index).reduce((a, b) => a + b[W], 0);
                    }
                    return _item
                })
            };
            res.rectPos = this.setShrinkAndGrow(res.rectPos, wrapperRect)
            return res;
        });
    }

    /**
     * 根据flex—shrink 和flex-grow 设置 高度和位置
     * @param arr
     * @param wrapperRect
     * @returns {*}
     */
    setShrinkAndGrow(arr, wrapperRect) {
        const {flexDirection} = this.props;
        let W = 'width';
        let OW = 'oriWidth';
        if (flexDirection.includes(FLEX_DIRECTION.COLUMN)) {
            W = 'height';
            OW = 'oriHeight';
        }
        let flexShrinkArr = arr.map(item => {
            if (item.props) {
                if (item.props['flexShrink'] !== undefined) {
                    return Number(item.props['flexShrink'])
                } else if (item.props['flex-shrink'] !== undefined) {
                    return Number(item.props['flex-shrink'])
                } else if (item.props.style && item.props.style['flex-shrink'] !== undefined) {
                    return Number(item.props.style['flex-shrink'])
                } else {
                    return FLEX_SHRINK
                }
            } else {
                return FLEX_SHRINK
            }
        });
        let flexShrinkWidth = arr.reduce((al, item) => {
            let itemShrink;
            if (item.props) {
                if (item.props['flexShrink'] !== undefined) {
                    itemShrink = Number(item.props['flexShrink'])
                } else if (item.props['flex-shrink'] !== undefined) {
                    itemShrink = Number(item.props['flex-shrink'])
                } else if (item.props.style && item.props.style['flexShrink'] !== undefined) {
                    itemShrink = Number(item.props.style['flexShrink'])
                } else {
                    itemShrink = FLEX_SHRINK
                }
            } else {
                itemShrink = FLEX_SHRINK
            }
            return al + item[W] * itemShrink
        }, 0);
        console.log(flexShrinkWidth)
        let flexGrowArr = arr.map(item => {
            if (item.props) {
                if (item.props['flexGrow'] !== undefined) {
                    return Number(item.props['flexGrow'])
                } else if (item.props['flex-grow'] !== undefined) {
                    return Number(item.props['flex-grow'])
                } else if (item.props.style && item.props.style['flexGrow'] !== undefined) {
                    return Number(item.props.style['flexGrow'])
                } else {
                    return FLEX_GROW
                }
            } else {
                return FLEX_GROW
            }
        });
        const allRate = flexShrinkArr.reduce((a, b) => a + b, 0);
        const allRateGrow = flexGrowArr.reduce((a, b) => a + b, 0);

        const allWidth = arr.reduce((al, item) => {
            return al + item[W]
        }, 0);

        //一行剩下的宽度
        const restWidth = (wrapperRect[W] - allWidth) || 0;
        arr = arr.map((item, index) => {
            console.log(restWidth, allWidth)
            const preArr = arr.filter((item, ind) => ind <= index);
            const allNeedAdd = preArr.reduce((al, item, it) => {
                if (it > 0) {
                    const preItem = preArr[it - 1];
                    const preAdd = this.getNeedAddWidth(preItem, restWidth, allWidth, wrapperRect, allRate, allRateGrow, flexShrinkWidth);
                    return al + preAdd
                } else {
                    return al;
                }
            }, 0);

            let needAdd = this.getNeedAddWidth(item, restWidth, allWidth, wrapperRect, allRate, allRateGrow, flexShrinkWidth);
            return {
                ...item,
                needAdd: needAdd,
                x: item.x + allNeedAdd
            }
        });

        return arr;

    }

    /**
     * 每个div需要添加的宽度
     * @param item
     * @param restWidth
     * @param allWidth
     * @param wrapperRect
     * @param allRate
     * @param allRateGrow
     * @param flexShrinkWidth
     * @returns {*}
     */
    getNeedAddWidth(item, restWidth, allWidth, wrapperRect, allRate, allRateGrow, flexShrinkWidth) {
        const {flexDirection} = this.props;
        let W = 'width';
        if (flexDirection.includes(FLEX_DIRECTION.COLUMN)) {
            W = 'height';
        }
        let grow;
        if (item.props) {
            if (item.props['flexGrow'] !== undefined) {
                grow = Number(item.props['flexGrow'])
            } else if (item.props['flex-grow'] !== undefined) {
                grow = Number(item.props['flex-grow'])
            } else if (item.props.style && item.props.style['flexGrow'] !== undefined) {
                grow = Number(item.props.style['flexGrow'])
            } else {
                grow = FLEX_GROW
            }
        } else {
            return FLEX_GROW
        }

        let res;
        //缩小
        if (allWidth > wrapperRect[W]) {
            res = (item[W] / flexShrinkWidth) * restWidth
            // 放大
        } else if (allWidth < wrapperRect[W] && grow) {
            res = restWidth * (grow / allRateGrow)
        } else {
            res = 0;
        }
        return res;
    }

    createFlowBox(remakePos, wrapperRect, wrapperStyle) {
        let posArr = this.getFlowArr(remakePos, wrapperRect, wrapperStyle);
        posArr = posArr.map((item, it) => {
            const getTop = (posArr.filter((a, b) => b <= it - 1).reduce((a, b) => a + b.max, 0));
            item.rectPos = item.rectPos.map(item => {
                item.y = item.y + (it === 0 ? 0 : getTop);
                return item;
            });
            return {
                ...item,
                top: it === 0 ? 0 : getTop,
            }
        }).map((item, it) => {
            item.rectPos = this.setLocation(wrapperRect, item, posArr, it)
            return item
        });
        console.log(wrapperRect.height)

        return {
            height: wrapperRect.height,
            array: posArr
        }
    }

    findByIndex = (arr, index) => {
        let res = {};
        let ind = 0;
        outer:for (let i = 0; i < arr.length; i++) {
            let item = arr[i];
            for (let j = 0; j < item.rectPos.length; j++) {
                if (ind === index) {
                    res = item.rectPos[j];
                    break outer
                }
                ind = ind + 1;
            }
        }
        return res
    };

    /**
     *
     * @param wrapperRect
     * @param item
     * @param arr
     * @param index
     * @returns {*}
     */
    setLocation(wrapperRect, item, arr = [], index) {
        const {flexDirection, justifyContent, alignItems, alignContent} = this.props
        let W = 'width';
        let H = 'height';
        let X = 'x';
        let Y = 'y';
        if (flexDirection.includes(FLEX_DIRECTION.COLUMN)) {
            W = 'height';
            H = 'width';
            X = 'y';
            Y = 'x'
        }
        const allLength = item.rectPos.reduce((al, b) => al + b[W], 0);
        let restLength = (wrapperRect[W] - allLength) || 0;
        if (restLength < 0) restLength = 0; //如果是不换行的情况下超出了
        const allHeight = arr.reduce((al, item) => {
            return al + Math.max(...item.rectPos.map(item => item[H]))
        }, 0);
        //主轴居中
        switch (justifyContent) {
            case JUSTIFY_CONTENT.FLEX_START:
                break;
            case JUSTIFY_CONTENT.FLEX_END:
                //todo
                item.rectPos = item.rectPos.map((rect, index) => {
                    let res = rect;
                    item.rectPos.filter((a, b) => b <= index).reduce((a, b) => {
                        res[X] += wrapperRect[W] - (a + b[W]);
                        return a + b[W]
                    }, 0);
                    return res
                }).reverse();
                break;
            case JUSTIFY_CONTENT.CENTER:
                //console.log(restLength, index)
                item.rectPos = item.rectPos.map(rect => ({
                    ...rect,
                    [X]: rect[X] + restLength / 2
                }));
                break;
            case JUSTIFY_CONTENT.SPACE_AROUND:
                item.rectPos = item.rectPos.map((rect, index) => {
                    const gapWidth = restLength / (item.rectPos.length * 2);
                    rect[X] += (index * 2 + 1) * gapWidth;
                    return rect
                });
                break;
            case JUSTIFY_CONTENT.SPACE_BETWEEN:
                item.rectPos = item.rectPos.map((rect, index) => {
                    if (index === 0) {
                        rect[X] = 0;
                    } else if (index === item.rectPos.length - 1) {
                        rect[X] += restLength;
                    } else {
                        if (item.rectPos.length !== 0) {
                            let reduceWidth = 0;
                            for (let i = 1; i < item.rectPos.length - 1; i++) {
                                reduceWidth += item.rectPos[i][W]
                            }
                            const gapWidth = (wrapperRect[W] - item.rectPos[0][W] - item.rectPos[item.rectPos.length - 1][W] - reduceWidth) / (item.rectPos.length - 1);
                            rect[X] = gapWidth * (index)
                        }
                    }
                    return rect
                });
                break;
        }
        switch (alignContent) {
            case ALIGN_CONTENT.STRETCH:
                break;
            case ALIGN_CONTENT.FLEX_START:
                break;
            case ALIGN_CONTENT.FLEX_END:
                item.rectPos = item.rectPos.map(rect => ({
                    ...rect,
                    [Y]: rect[Y] + wrapperRect[H] - allHeight
                }));
                //item.y += wrapperRect[H] - allHeight;
                break;
            case ALIGN_CONTENT.CENTER:
                item.rectPos = item.rectPos.map(rect => ({
                    ...rect,
                    [Y]: rect[Y] + (wrapperRect[H] - allHeight) / 2
                }));
                //item.y += (wrapperRect[H] - allHeight) / 2
                break;
            case ALIGN_CONTENT.SPACE_AROUND:
                const gapWidth = allHeight / (arr.length * 2);
                item.rectPos = item.rectPos.map(rect => ({
                    ...rect,
                    [Y]: rect[Y] + (index * 2 + 1) * gapWidth
                }));
                //item.y += (index * 2 + 1) * gapWidth;
                break;
            case ALIGN_CONTENT.SPACE_BETWEEN:
                if (index === 0) {
                    item.y += 0;
                } else if (index === arr.length - 1) {
                    item.rectPos = item.rectPos.map(rect => ({
                        ...rect,
                        [Y]: rect[Y] + wrapperRect[H] - allHeight
                    }));
                    //item.y += wrapperRect[H] - allHeight;
                } else {
                    const gapWidth = (wrapperRect[H] - allHeight) / (arr.length - 1);
                    item.rectPos = item.rectPos.map(rect => ({
                        ...rect,
                        [Y]: rect[Y] + gapWidth * index
                    }));
                    //item.y += gapWidth * index
                }
                break;

        }
        switch (alignItems) {
            case ALIGN_ITEMS.FLEX_START:
                item.rectPos = item.rectPos.map((rect) => {
                    const props = rect.props || {};
                    if (props['align-self']) {
                        if (props['align-self'] === ALIGN_ITEMS.FLEX_START) {
                        } else if (props['align-self'] === ALIGN_ITEMS.FLEX_END) {
                            rect[Y] += ((item.max || 0) - rect[H])
                        } else if (props['align-self'] === ALIGN_ITEMS.CENTER) {
                            rect[Y] += ((item.max || 0) - rect[H]) / 2
                        } else if (props['align-self'] === ALIGN_ITEMS.STRETCH) {
                            //todo
                        } else if (props['align-self'] === ALIGN_ITEMS.BASELINE) {
                            //todo
                        }
                    } else {
                        rect[Y] += 0;
                    }

                    return rect
                });
                break;
            case ALIGN_ITEMS.FLEX_END:
                item.rectPos = item.rectPos.map((rect) => {
                    const props = rect.props || {};
                    if (props['align-self']) {
                        if (props['align-self'] === ALIGN_ITEMS.FLEX_START) {
                        } else if (props['align-self'] === ALIGN_ITEMS.FLEX_END) {
                            rect[Y] += ((item.max || 0) - rect[H])
                        } else if (props['align-self'] === ALIGN_ITEMS.CENTER) {
                            rect[Y] += ((item.max || 0) - rect[H]) / 2
                        } else if (props['align-self'] === ALIGN_ITEMS.STRETCH) {
                            //todo
                        } else if (props['align-self'] === ALIGN_ITEMS.BASELINE) {
                            //todo
                        }
                    } else {
                        rect[Y] += ((item.max || 0) - rect[H])
                    }
                    return rect
                });
                break;
            case ALIGN_ITEMS.CENTER:
                item.rectPos = item.rectPos.map((rect) => {
                    const props = rect.props || {};
                    if (props['align-self']) {
                        if (props['align-self'] === ALIGN_ITEMS.FLEX_START) {
                        } else if (props['align-self'] === ALIGN_ITEMS.FLEX_END) {
                            rect[Y] += ((item.max || 0) - rect[H])
                        } else if (props['align-self'] === ALIGN_ITEMS.CENTER) {
                            rect[Y] += ((item.max || 0) - rect[H]) / 2
                        } else if (props['align-self'] === ALIGN_ITEMS.STRETCH) {
                            //todo
                        } else if (props['align-self'] === ALIGN_ITEMS.BASELINE) {
                            //todo
                        }
                    } else {
                        rect[Y] += ((item.max || 0) - rect[H]) / 2
                    }
                    return rect
                });
                break;
            case ALIGN_ITEMS.STRETCH:

                break;
            case ALIGN_ITEMS.BASELINE:
                break;
        }


        return item.rectPos
    }

    createTransform(flowBoxItem) {
        if (flowBoxItem.x !== undefined) {
            return `translate(${flowBoxItem.x}px,${flowBoxItem.y}px)`;
        } else {
            return undefined
        }

    }

    getChildren(wrapperNode, flexWrap) {
        console.log(flexWrap)
        let childNodes = Array.from(wrapperNode.childNodes);
        childNodes.forEach(item => {
            getStyle(item)
        })
        childNodes = childNodes.sort((a, b) => {
            const aOrder = this.getProps(a, 'order');
            const bOrder = this.getProps(b, 'order');
            return Number(aOrder) - Number(bOrder);
        });
        if (flexWrap === FLEX_WRAP.WRAP_REVERSE) {
            childNodes.reverse();
        }
        return childNodes
    }

}

export default Flex
