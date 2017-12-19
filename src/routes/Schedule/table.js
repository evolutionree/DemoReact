/**
 * Created by 0291 on 2017/12/19.
 */
import React, { Component } from 'react';
import { Input } from 'antd';
import Styles from './table.less';

class Table extends Component {
  static propTypes = {

  };
  static defaultProps = {

  };

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.onDocumentMouseDown.bind(this));
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.onDocumentMouseDown);
  }

  onDocumentMouseDown(e) {
    let selList = [];

    const fileNodes = document.getElementsByTagName('div');

    for (let i = 0; i < fileNodes.length; i++) {
      if (fileNodes[i].className.indexOf('fileDiv') !== -1) {
        fileNodes[i].className = 'fileDiv';
        selList.push(fileNodes[i]);
      }
    }

    let isSelect = true;

    let evt = window.event || e;

    let startX = (evt.x || evt.clientX);

    let startY = (evt.y || evt.clientY);

    let selDiv = document.createElement('div');

    selDiv.style.cssText = 'position:absolute;width:0px;height:0px;font-size:0px;margin:0px;padding:0px;border:1px dashed #0099FF;background-color:red;z-index:1000;filter:alpha(opacity:60);opacity:0.6;display:none;';

    selDiv.id = 'selectDiv';

    document.body.appendChild(selDiv);

    selDiv.style.left = startX + 'px';

    selDiv.style.top = startY + 'px';

    let _x = null;

    let _y = null;

    this.clearEventBubble(evt);

    const _this = this;
    document.onmousemove = function(moveE) {
      evt = window.event || moveE;
      if (isSelect) {
        if (selDiv.style.display === 'none') {
          selDiv.style.display = '';
        }

        _x = (evt.x || evt.clientX);

        _y = (evt.y || evt.clientY);

        selDiv.style.left = Math.min(_x, startX) + 'px';

        selDiv.style.top = Math.min(_y, startY) + 'px';

        selDiv.style.width = Math.abs(_x - startX) + 'px';

        selDiv.style.height = Math.abs(_y - startY) + 'px';

        // ---------------- 关键算法 ---------------------

        let _l = selDiv.offsetLeft; let _t = selDiv.offsetTop;

        let _w = selDiv.offsetWidth; let _h = selDiv.offsetHeight;

        for (let i = 0; i < selList.length; i++) {

          let sl = selList[i].offsetWidth + selList[i].offsetLeft;

          let st = selList[i].offsetHeight + selList[i].offsetTop;

          if (sl > _l && st > _t && selList[i].offsetLeft < _l + _w && selList[i].offsetTop < _t + _h) {

            if (selList[i].className.indexOf('seled') === -1) {
              selList[i].className = selList[i].className + ' seled';
            }
          } else {
            if (selList[i].className.indexOf('seled') !== -1) {
              selList[i].className = 'fileDiv';
            }
          }
        }
      }

      _this.clearEventBubble(evt);
    }

    document.onmouseup = () => {
      isSelect = false;
      if (selDiv) {
        document.body.removeChild(selDiv);
        this.showSelDiv(selList);
      }
      selList = null, _x = null, _y = null, selDiv = null, startX = null, startY = null, evt = null;
    };
  }

  clearEventBubble(evt) {
    if (evt.stopPropagation)
      evt.stopPropagation();
    else
      evt.cancelBubble = true;
    if (evt.preventDefault)
      evt.preventDefault();
    else
      evt.returnValue = false;
  }

  showSelDiv(arr) {
    let count = 0;
    let selInfo = '';
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].className.indexOf('seled') !== -1) {
        count++;
        selInfo += arr[i].innerHTML + '\n';
      }
    }
    //alert("共选择 " + count + " 个文件，分别是：\n" + selInfo);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({

    });

    if (nextProps.value !== this.state.value) {

    }
  }


  render() {
    return (
      <div className={Styles.Wrap}>
        <div id="fileDiv1" className="fileDiv">file1</div>
        <div id="fileDiv2" className="fileDiv">file2</div>
        <div id="fileDiv3" className="fileDiv">file3</div>
        <div id="fileDiv4" className="fileDiv">file4</div>
        <div id="fileDiv5" className="fileDiv">file5</div>
        <div id="fileDiv6" className="fileDiv">file6</div>
        <div id="fileDiv7" className="fileDiv">file7</div>
        <div id="fileDiv8" className="fileDiv">file8</div>
        <div id="fileDiv9" className="fileDiv">file9</div>
        <div id="fileDiv10" className="fileDiv">file10</div>
        <div id="fileDiv11" className="fileDiv">file11</div>
        <div id="fileDiv12" className="fileDiv">file12</div>
        <div id="fileDiv13" className="fileDiv">file13</div>
        <div id="fileDiv14" className="fileDiv">file14</div>
        <div id="fileDiv15" className="fileDiv">file15</div>
      </div>
    );
  }
}


export default Table;
