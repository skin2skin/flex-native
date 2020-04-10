/**
 * 解析css
 */
import { getDataSet, getWeights, ipToInt } from "./utils";
let styleList=[];
let cacheStyles=[];
export default function parseCss(document) {
    return getAllStyle(document).then(res => {
        if(styleList.length===res.length){
            return Promise.resolve(cacheStyles)
        }
        styleList=res;
        const all = [];
        res.forEach(item => {
            item.cssText.split('}').filter(item => item.trim() !== '').forEach(item => {
                const _item = item + '}';
                const selectorText = _item.match(/([^{]*){([^}]*)}/)[1].trim();
                console.log(selectorText)
                const weights = getWeights(selectorText);
                all.push({
                    cssText: _item.trim(),
                    selector: selectorText,
                    weights :{
                        arr: weights,
                        int: ipToInt(weights)
                    },
                    [selectorText]: getDetailRule({ cssText: _item.trim(), selectorText })
                })
            });
        });
        cacheStyles=all;
        return Promise.resolve(all)
    });
}

/**
 * http get
 * @param url
 */
function httpGet(url) {
    return new Promise((resolve, reject) => {
        const http = new XMLHttpRequest();
        http.open("GET", url, true);
        http.send();
        //异步接受响应
        http.onreadystatechange = (e) => {
            if (http.readyState === 4) {
                if (http.status === 200) {
                    resolve(http.responseText)
                }
                reject(e)
            }

        }
    })

}

/**
 *
 * @param document
 */
function getAllStyle(document) {
    const res = [];
    let task = [];
    let styles= Array.from(document.querySelectorAll('link,style'));

    styles.forEach((ele, index) => {
        if (ele.nodeName === 'LINK') {
            if (ele.rel && ele.rel.includes('stylesheet')) {
                task.push(new Promise((resolve) => {
                    httpGet(ele.href).then(result => {
                        const comment = result.match(/(\/\*)\/?(([^\*]\/)|[^\/])*(\*\/)/g);
                        comment && comment.forEach(item => {
                            result = result.replace(item, '')
                        });
                        res[index] = {
                            cssText: result,
                        };
                        resolve()
                    })
                }))
            }
        } else {
            if (ele.outerText && ele.outerText.includes('@import url')) {
                console.warn('不支持@import url导入方式')
            }
            let result = ele.outerText || '';
            const comment = result.match(/(\/\*)\/?(([^\*]\/)|[^\/])*(\*\/)/g);
            comment && comment.forEach(item => {
                result = result.replace(item, '')
            });
            res[index] = {
                cssText: result,
            };
        }
    });
    return Promise.all(task).then(() => Promise.resolve(res));
}

function getDetailRule(rule) {
    let { cssText, selectorText } = rule;
    const res = {};
    if (selectorText) {
        cssText = cssText.trim();
        if (cssText[0]==='@') {
            return {}
        }
        let reg;
        reg = new RegExp(`[^{]*{([^}]*)}`);
        const match = cssText.match(reg);
        const text = match[1];
        text.split(';').filter(item => item.trim() !== '').forEach(item => {
            const i = item.indexOf(':');
            let key = item.slice(0, i).trim()
            let value = item.slice(i + 1) || '';
            res[key] = value.trim()
        });
    }


    return res;
}

const ignoreTags = ['html', 'style', 'head', 'meta', 'title', 'script', 'link']

/**
 *
 */
export function setCssSelector(css = [], document) {
    const ownerDocument = document.ownerDocument ? document.ownerDocument : document
    css.forEach(item => {
        const { selector } = item;
        if (selector.includes('@')||selector.includes('::')) {
            return
        }
        let elements ;
        try {
            elements = ownerDocument.querySelectorAll(selector) || [];
        }catch (e) {
            return;
        }

        Array.from(elements).map(element => {
            if (!ignoreTags.includes(element.localName)) {
                const classListJson = getDataSet(element, 'class');
                let selectors = [];
                if (classListJson) {
                    selectors.push(...JSON.parse(classListJson))
                }
                if (!selectors.includes(selector)) {
                    selectors.push(selector)
                }
                element.setAttribute('data-class', JSON.stringify(selectors));
            }
        })
    })
}
