/**
 * 这儿是csspath选择器,这个时一个注入页面的脚本
 * 当鼠标经过某一个元素时，这个元素就会高亮，其子元素也会随之高亮，并且颜色叠加
 */
// import { injectSendMessage } from './message';
// eslint-disable-next-line no-unused-vars
class Selector {
  constructor() {
    this.VISITENCLASSNAME = 'viewc-extention-hx-visited';
    this.SELECTEDCLASSNAME = 'select-viewc-extention-class';
    this.CSSMESSAGECLASSNAME = 'viewc-extention-csspath';
    this.CSSMESSAGESHOW = 'viewc-extention-csspath-show';
    this.CLICKBUTTONCLASS = 'viewc-extention-click-button';
    this.NOSELECTCLASS = 'viewc-extention-no-select'; // 这个用来占位

    this.SHOWCSSDIV = document.createElement('div');
    this.style = document.createElement('style');
    this.style.innerHTML = `
              .${this.VISITENCLASSNAME} * {
                background: rgba(0, 213, 0, 0.2) !important;
              }
              .${this.VISITENCLASSNAME} {
                background: rgba(0, 213, 0, 0.2) !important;
                outline: rgb(0, 199, 0) solid 2px !important;
                }

              .${this.SELECTEDCLASSNAME} * {
                  background: rgba(177, 0, 0, 0.2) !important;
                }
              .${this.SELECTEDCLASSNAME} {
                background: rgba(177,0,0,0.2) !important;
                outline: rgb(140, 0, 0) solid 2px !important;
                }


              .${this.CSSMESSAGECLASSNAME} {
                position: fixed;
                left: 10px;
                bottom: 10px;
                box-shadow: 0 2px 3px 0 rgba(0, 0, 0, 0.25);
                padding: 0px 10px;
                display: true;
                background-color: #fff !important;
                z-index: 999999;
            }
            
              .${this.CSSMESSAGECLASSNAME}.${this.CSSMESSAGESHOW} {
                  display: inline-block;
              }

              .${this.CLICKBUTTONCLASS} {
                background-color: #4CAF50; /* Green */
                border: none;
                color: white;
                text-align: center;
                text-decoration: none;
                display: inline-block;
                -webkit-transition-duration: 0.4s; /* Safari */
                transition-duration: 0.4s;
                cursor: pointer;
                background-color: white; 
                color: black; 
                border: 2px solid #008CBA;
                width: 30px;
              }
              .${this.CLICKBUTTONCLASS}:hover {
                background-color: #008CBA;
                color: white;
              }

            `;
    document.head.appendChild(this.style);
    document.body.appendChild(this.SHOWCSSDIV);

    this.checkButton = document.createElement('button');
    this.checkButton.innerText = 'ok';

    this.addVisitedFunc = this.addVisitedClass.bind(this);
    this.removeVisitedFunc = this.removeVisitedClass.bind(this);
    this.elementClickFunc = this.elementClickHandle.bind(this);

    this.checkButton.onclick = this.overSelect.bind(this);
  }

  startSelect() {
    this.SHOWCSSDIV.className = this.CSSMESSAGECLASSNAME;
    this.SHOWCSSDIV.innerText = '点击元素选择';
    this.checkButton.classList.toggle(this.CLICKBUTTONCLASS, true);
    this.SHOWCSSDIV.classList.toggle(this.CSSMESSAGESHOW, true);
    document.addEventListener('mouseover', this.addVisitedFunc);
    document.addEventListener('mouseout', this.removeVisitedFunc);
    document.addEventListener('click', this.elementClickFunc);
  }

  overSelect() {
    this.SHOWCSSDIV.className = '';
    this.removeChildClass(document.body, this.SELECTEDCLASSNAME);
    this.removeChildClass(document.body, this.VISITENCLASSNAME);
    document.removeEventListener('mouseover', this.addVisitedFunc);
    document.removeEventListener('mouseout', this.removeVisitedFunc);
    document.removeEventListener('click', this.elementClickFunc);
  }

  addVisitedClass(e) {
    const target = e.target;
    if (this.isSelectorInjectElement(target)) return;
    this.addClassName(target, this.VISITENCLASSNAME);
  }

  removeVisitedClass(e) {
    if (this.isSelectorInjectElement(e.target)) return;
    this.removeClassName(e.target, this.VISITENCLASSNAME);
  }

  isSelectorInjectElement(el) {
    const className = el.className;
    if (className.includes(this.CSSMESSAGESHOW)) return true;
    if (className.includes(this.CLICKBUTTONCLASS)) return true;
    if (className.includes(this.CSSMESSAGECLASSNAME)) return true;
    if (className.includes(this.NOSELECTCLASS)) return true;
  }

  elementClickHandle(e) {
    if (this.isSelectorInjectElement(e.target)) return;
    if (e.target.className.includes(this.SELECTEDCLASSNAME)) {
      this.removeClassName(e.target, this.SELECTEDCLASSNAME);
      return;
    }
    this.removePrenteClass(e.target, this.SELECTEDCLASSNAME);
    this.removeChildClass(e.target, this.SELECTEDCLASSNAME);
    this.removeClassName(e.target, this.VISITENCLASSNAME);
    this.addClassName(e.target, this.SELECTEDCLASSNAME);
    const _csspath = this.getCssPath(e.target);
    this.SHOWCSSDIV.innerHTML = `获取的CSSPATH为: <b class='${this.NOSELECTCLASS}'>${_csspath}</b>   `;
    this.SHOWCSSDIV.appendChild(this.checkButton);
    console.log(_csspath);
  }

  getCssPath(el) {
    if (!(el instanceof Element)) return;
    const path = [];
    while (el.nodeType === Node.ELEMENT_NODE) {
      let selector = el.nodeName.toLowerCase();
      if (el.id) {
        selector += '#' + el.id;
        path.unshift(selector);
        break;
      } else {
        let sib = el;
        let nth = 1;
        while ((sib = sib.previousElementSibling)) {
          if (sib.nodeName.toLowerCase() === selector) nth++;
        }
        if (nth !== 1) selector += ':nth-of-type(' + nth + ')';
      }
      path.unshift(selector);
      el = el.parentNode;
    }
    return path.join(' > ');
  }

  removeClassName(el, name) {
    if (!el) return;
    let cls;
    try {
      cls = (el.className || '').trim();
    } catch {
      // debugger;
    }
    if (cls) {
      el.className = cls.replace(name, '');
    }
  }

  addClassName(el, name) {
    if (!el) return;
    if (el !== document.documentElement) {
      const cls = el.className || '';
      if (!cls.includes(name)) {
        el.className = name + ' ' + cls || '';
      }
    }
  }

  removePrenteClass(el, name) {
    if (!el) return;
    const _el = el.parentNode;
    this.removeClassName(_el, name);
    if (_el !== document.body) {
      this.removePrenteClass(_el, name);
    }
  }

  removeChildClass(el, name) {
    if (!el) return;
    for (const subEl of el.children) {
      this.removeClassName(subEl, name);
      this.removeChildClass(subEl, name);
    }
  }
}

const _c = new Selector();
_c.startSelect();