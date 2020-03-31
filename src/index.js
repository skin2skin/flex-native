import { debounce } from './utils'
const fn=debounce(()=>{
console.log(1)
})
document.addEventListener('DOMNodeInserted',fn)
