/**
 * 解析css
 */
import {getDataSet} from "./utils";

export default function parseCss(document) {
    return getAllStyle(document).then(res=>{
        const all=[];
        res.map(item=>{
            item.cssText.split('}').filter(item=>item.trim()!=='').forEach(item=>{
                const _item=item+'}';
                const selectorText=_item.match(/([^{]*){([^}]*)}/)[1].trim();
                all.push({
                    cssText:_item.trim(),
                    selector:selectorText,
                    [selectorText]:getDetailRule({cssText:_item.trim(), selectorText})
                })
            });
        });
        return Promise.resolve(all)
    });
}

/**
 * http get
 * @param url
 */
function httpGet(url) {
    return new Promise((resolve, reject)=>{
        const http=new XMLHttpRequest();
        http.open("GET",url,true);
        http.send();
        //异步接受响应
        http.onreadystatechange = (e)=>{
            if(http.readyState === 4){
                if(http.status === 200){
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
function  getAllStyle(document) {
    const res=[];
    let task=[];
    Array.from(document.querySelectorAll('link,style')).forEach((ele,index)=>{
        if(ele.nodeName==='LINK'){
            task.push(new Promise((resolve)=>{
                httpGet(ele.href).then(result=>{
                    const comment=result.match(/(\/\*)\/?(([^\*]\/)|[^\/])*(\*\/)/g);
                    comment && comment.forEach(item => {
                        result = result.replace(item, '')
                    });
                    res[index]={
                        cssText:result
                    };
                    resolve()
                })
            }))
        }else{
            if(ele.outerText.includes('@import url')){
                console.warn('不支持@import url导入方式')
            }
            let result=ele.outerText||'';
            const comment=result.match(/(\/\*)\/?(([^\*]\/)|[^\/])*(\*\/)/g);
            comment && comment.forEach(item => {
                result = result.replace(item, '')
            });
            res[index]={
                cssText:result
            };
        }
    });
   return Promise.all(task).then(()=>Promise.resolve(res));
}

function getDetailRule(rule) {
    const {cssText,selectorText} = rule;
    const res = {};
    if (selectorText) {
        let reg;
        if(/[\*\.\[\+]+/.test(selectorText)){
            reg=new RegExp(`^\\${selectorText}[^{]*{([^}]*)}`)
        }else{
            reg=new RegExp(`^${selectorText}[^{]*{([^}]*)}`)
        }
        const text = cssText.match(reg)[1];
        text.split(';').filter(item => item.trim() !== '').map(item => {
            const arr = item.split(':');
            res[arr[0].trim()] = arr[1].trim()
        });
    }


    return res;
}
const ignoreTags=['html','style','head','meta','title','script','link']
/**
 *
 */
export function setCssSelector(css =[], document) {
    const ownerDocument=document.ownerDocument?document.ownerDocument:document
    css.forEach(item => {
        const {selector}=item;
        if(selector.includes('@')){
            return
        }
        const elements=ownerDocument.querySelectorAll(selector)||[];
        Array.from(elements).map(element=>{
            if(!ignoreTags.includes(element.localName)){
                const classListJson=getDataSet(element,'class');
                let selectors=[];
                if(classListJson){
                    selectors.push(...JSON.parse(classListJson))
                }
                if(!selectors.includes(selector)){
                    selectors.push(selector)
                }
                element.setAttribute('data-class',JSON.stringify(selectors));
            }
        })
    })
}