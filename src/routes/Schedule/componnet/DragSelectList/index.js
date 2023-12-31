/**
 * Created by 0291 on 2017/12/22.
 */
import React, { Component } from 'react';
import { getTimeStamp } from '../../../../utils/index';
import _ from 'lodash';
import { connect } from 'dva';
import Styles from './index.less';

const data = [
  {
    "id":"1214787",
    "name":"2",
    "address":"",
    "description":"",
    "startDate":"1521063000000",
    "endDate":"1521088200000",
    "isAllDay":"0",
    "isRecur":"0",
    "frequency":"0",
    "interval":"0",
    "recurStopCondition":"1",
    "recurStopValue":"0",
    "finalFinishTime":"1521088200000",
    "belongId":"",
    "objectId":"",
    "isPrivate":"0",
    "accessible":true,
    "status":3,
    "createdAt":"1521100184247",
    "updatedAt":"1521100184247",
    "createdBy":"934513",
    "updatedBy":"934513",
    "rules":"",
    "reminder":-1,
    "colorType":{
      "id":0,
      "name":"其他",
      "color":"schedule_none",
      "dummyType":""
    }
  },
  {
    "id":"1214789",
    "name":"54",
    "address":"",
    "description":"",
    "startDate":"1521077400000",
    "endDate":"1521081000000",
    "isAllDay":"0",
    "isRecur":"0",
    "frequency":"0",
    "interval":"0",
    "recurStopCondition":"1",
    "recurStopValue":"0",
    "finalFinishTime":"1521081000000",
    "belongId":"",
    "objectId":"",
    "isPrivate":"0",
    "accessible":true,
    "status":3,
    "createdAt":"1521100225130",
    "updatedAt":"1521104306972",
    "createdBy":"934513",
    "updatedBy":"934513",
    "rules":"",
    "reminder":-1,
    "colorType":{
      "id":0,
      "name":"其他",
      "color":"schedule_none",
      "dummyType":""
    }
  },
  {
    "id":"1214790",
    "name":"45",
    "address":"",
    "description":"",
    "startDate":"1521097200000",
    "endDate":"1521129600000",
    "isAllDay":"0",
    "isRecur":"0",
    "frequency":"0",
    "interval":"0",
    "recurStopCondition":"1",
    "recurStopValue":"0",
    "finalFinishTime":"1521129600000",
    "belongId":"",
    "objectId":"",
    "isPrivate":"0",
    "accessible":true,
    "status":3,
    "createdAt":"1521100235298",
    "updatedAt":"1521100235298",
    "createdBy":"934513",
    "updatedBy":"934513",
    "rules":"",
    "reminder":-1,
    "colorType":{
      "id":0,
      "name":"其他",
      "color":"schedule_none",
      "dummyType":""
    }
  },
  {
    "id":"1214845",
    "name":"11",
    "address":"",
    "description":"",
    "startDate":"1521061200000",
    "endDate":"1521072000000",
    "isAllDay":"0",
    "isRecur":"0",
    "frequency":"0",
    "interval":"0",
    "recurStopCondition":"1",
    "recurStopValue":"0",
    "finalFinishTime":"1521072000000",
    "belongId":"",
    "objectId":"",
    "isPrivate":"0",
    "accessible":true,
    "status":3,
    "createdAt":"1521100172084",
    "updatedAt":"1521100172084",
    "createdBy":"934513",
    "updatedBy":"934513",
    "rules":"",
    "reminder":-1,
    "colorType":{
      "id":0,
      "name":"其他",
      "color":"schedule_none",
      "dummyType":""
    }
  },
  {
    "id":"1214847",
    "name":"4",
    "address":"",
    "description":"",
    "startDate":"1521075600000",
    "endDate":"1521120600000",
    "isAllDay":"0",
    "isRecur":"0",
    "frequency":"0",
    "interval":"0",
    "recurStopCondition":"1",
    "recurStopValue":"0",
    "finalFinishTime":"1521120600000",
    "belongId":"",
    "objectId":"",
    "isPrivate":"0",
    "accessible":true,
    "status":3,
    "createdAt":"1521100209972",
    "updatedAt":"1521100209972",
    "createdBy":"934513",
    "updatedBy":"934513",
    "rules":"",
    "reminder":-1,
    "colorType":{
      "id":0,
      "name":"其他",
      "color":"schedule_none",
      "dummyType":""
    }
  },
  {
    "id":"1214888",
    "name":"1",
    "address":"",
    "description":"",
    "startDate":"1521124200000",
    "endDate":"1521126000000",
    "isAllDay":"0",
    "isRecur":"0",
    "frequency":"0",
    "interval":"0",
    "recurStopCondition":"1",
    "recurStopValue":"0",
    "finalFinishTime":"1521126000000",
    "belongId":"",
    "objectId":"",
    "isPrivate":"0",
    "accessible":true,
    "status":3,
    "createdAt":"1521103466556",
    "updatedAt":"1521103466556",
    "createdBy":"934513",
    "updatedBy":"934513",
    "rules":"",
    "reminder":-1,
    "colorType":{
      "id":0,
      "name":"其他",
      "color":"schedule_none",
      "dummyType":""
    }
  },
  {
    "id":"1214899",
    "name":"121",
    "address":"",
    "description":"",
    "startDate":"1521091800000",
    "endDate":"1521115200000",
    "isAllDay":"0",
    "isRecur":"0",
    "frequency":"0",
    "interval":"0",
    "recurStopCondition":"1",
    "recurStopValue":"0",
    "finalFinishTime":"1521115200000",
    "belongId":"",
    "objectId":"",
    "isPrivate":"0",
    "accessible":true,
    "status":3,
    "createdAt":"1521104291874",
    "updatedAt":"1521104459306",
    "createdBy":"934513",
    "updatedBy":"934513",
    "rules":"",
    "reminder":-1,
    "colorType":{
      "id":0,
      "name":"其他",
      "color":"schedule_none",
      "dummyType":""
    }
  },
  {
    "id":"1214952",
    "name":"12",
    "address":"",
    "description":"",
    "startDate":"1521099000000",
    "endDate":"1521108000000",
    "isAllDay":"0",
    "isRecur":"0",
    "frequency":"0",
    "interval":"0",
    "recurStopCondition":"1",
    "recurStopValue":"0",
    "finalFinishTime":"1521108000000",
    "belongId":"",
    "objectId":"",
    "isPrivate":"0",
    "accessible":true,
    "status":3,
    "createdAt":"1521104319390",
    "updatedAt":"1521104319390",
    "createdBy":"934513",
    "updatedBy":"934513",
    "rules":"",
    "reminder":-1,
    "colorType":{
      "id":0,
      "name":"其他",
      "color":"schedule_none",
      "dummyType":""
    }
  },
  {
    "id":"1215001",
    "name":"23",
    "address":"",
    "description":"",
    "startDate":"1521082800000",
    "endDate":"1521093600000",
    "isAllDay":"0",
    "isRecur":"0",
    "frequency":"0",
    "interval":"0",
    "recurStopCondition":"1",
    "recurStopValue":"0",
    "finalFinishTime":"1521093600000",
    "belongId":"",
    "objectId":"",
    "isPrivate":"0",
    "accessible":true,
    "status":3,
    "createdAt":"1521104339272",
    "updatedAt":"1521104339272",
    "createdBy":"934513",
    "updatedBy":"934513",
    "rules":"",
    "reminder":-1,
    "colorType":{
      "id":0,
      "name":"其他",
      "color":"schedule_none",
      "dummyType":""
    }
  }
];


const newData = data.map((item) => {
  item.timeLength = (parseInt(item.endDate) - parseInt(item.startDate));
  return item;
});

// let dataSort = data.sort(function (a, b) { //少了长的排序在前 优化
//   return (parseInt(b.endDate) - parseInt(b.startDate)) - (parseInt(a.endDate) - parseInt(a.startDate));
// })

const dataSort = _.sortBy(newData, ['startDate', function(item) { return -item.timeLength; }]);
// dataSort = dataSort.sort(function (a, b) { //少了长的排序在前 优化
//   return parseInt(a.startDate) - parseInt(b.startDate);
// })

class DragSelectList extends Component {
  static propTypes = {

  }

  static defaultProps = {

  }

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentDidUpdate() {
    console.log(this.listRef.offsetWidth)
    const totalHeight = 22 * 48;
    const totalWidth = this.listRef.offsetWidth;
    const dayTimeStamp = 86400; //每一天的总时间长度（时间戳）

    let columnMaxHeights = {};
    let columnMinWidth = {};
    let divs = {};

    for (let i = 0; i < dataSort.length; i++) {
      let selDiv = document.createElement('div');
      selDiv.style.cssText = 'position:absolute;margin:0px;padding:0px;border:1px dashed #0099FF;background-color:red;z-index:10;filter:alpha(opacity:60);opacity:0.6;display:block;';
      const top = ((dataSort[i].startDate / 1000 - getTimeStamp('2018-03-15 00:00:00')) / dayTimeStamp) * totalHeight;
      selDiv.style.top = top + 'px';
      const height = ((dataSort[i].endDate / 1000 - dataSort[i].startDate / 1000) / dayTimeStamp) * totalHeight;
      selDiv.style.height = height + 'px';

      let findColumn = 1;
      let other = false;
      for (let key in columnMaxHeights) {
        if (top >= columnMaxHeights[key]) {
          findColumn = parseInt(key);
          break;
        }
        findColumn = parseInt(key) + 1;
        other = true;
      }
      selDiv.column = findColumn;
      divs['selDiv' + i] = selDiv;
      columnMaxHeights[findColumn] = top + height;
    }

    let maxColumn = 1;
    for (let key in divs) {
      maxColumn = Math.max(divs[key].column, maxColumn);
    }

    const w = totalWidth / maxColumn;
    for (let key in divs) {
      divs[key].style.width = w + 'px';
      divs[key].style.left = (divs[key].column - 1) * w + 'px';
      //this.listRef.appendChild(divs[key]);
    }
  }

  componentWillReceiveProps(nextProps) {

  }

  componentWillUnmount() {

  }

  onDocumentMouseDown(e) {
    let selList = this.listRef.children;

    let event = e || window.event;
    const _this = this;

    let startX = (event.x || event.clientX);
    let startY = (event.y || event.clientY);

    let firstIndex = '';
    for (let i = 0; i < selList.length; i++) {
      let clientLeft = selList[i].getBoundingClientRect().left;
      let clientRight = selList[i].getBoundingClientRect().right;
      let clientTop = selList[i].getBoundingClientRect().top;
      let clientBottom = selList[i].getBoundingClientRect().bottom;
      if (startX > clientLeft && startX < clientRight && startY > clientTop && startY < clientBottom) {
        firstIndex = i;
      }
    }

    let _x = null;
    let _y = null;
    let finnalIndex = '';
    let selDiv = null;
    document.onmousemove = function(moveE) {
      event = moveE || window.event;
      _x = (event.x || event.clientX);
      _y = (event.y || event.clientY);

      for (let i = 0; i < selList.length; i++) {
        let clientLeft = selList[i].getBoundingClientRect().left;
        let clientRight = selList[i].getBoundingClientRect().right;
        let clientTop = selList[i].getBoundingClientRect().top;
        let clientBottom = selList[i].getBoundingClientRect().bottom;

        if (_x > clientLeft && _x < clientRight && _y > clientTop && _y < clientBottom) {
          finnalIndex = i;
          break;
        }
      }


      if (firstIndex !== '' && finnalIndex !== '') {
        console.log(firstIndex, finnalIndex);
        if (document.getElementById('addForm')) {
          _this.listRef.removeChild(document.getElementById('addForm'));
        }
        selDiv = document.createElement('div');
        selDiv.id='addForm';
        selDiv.style.cssText = 'position:absolute;margin:0px;padding:0px;border:1px dashed #0099FF;background-color:red;z-index:10;filter:alpha(opacity:60);opacity:0.6;display:block;';
        selDiv.style.top = Math.min(firstIndex, finnalIndex) * 22 + 'px';
        selDiv.style.width = '100%';
        selDiv.style.height = (Math.max(firstIndex, finnalIndex) - Math.min(firstIndex, finnalIndex)) * 22 + 'px';
        _this.listRef.appendChild(selDiv);
      } else {
        selDiv ?  _this.listRef.removeChild(selDiv) : true;
      }

      _this.clearEventBubble(event);
    }

    document.onmouseup = () => {
      _this.props.openFormModal();
      _this.listRef.removeChild(selDiv)
      document.onmousemove = document.onmouseup = null;
      event = null;
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


  getHtml() {
    let html = [];
    for (let i = 0; i < 48; i++) {
      html.push(<li key={i}></li>);
    }
    return html;
  }

  render() {
    return (
      <ul className={Styles.DragSelectList} ref={(ref) => { this.listRef = ref }} onMouseDown={this.onDocumentMouseDown.bind(this)}>
        {
          this.getHtml()
        }
      </ul>
    );
  }
}


export default connect(
  state => state.schedule,
  dispatch => {
    return {
      openFormModal() {
        dispatch({ type: 'schedule/putState', payload: { showModals: 'formModal' } });
      }
    };
  }
)(DragSelectList);
