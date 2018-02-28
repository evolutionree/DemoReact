/**
 * Created by 0291 on 2017/12/22.
 */
import React, { Component } from 'react';
import { getTimeStamp } from '../../../../utils/index';
import _ from 'lodash';
import Styles from './index.less';

const data = [
  {
    "id":"1122269",
    "name":"6",
    "address":"",
    "description":"",
    "startDate":"1512363600000",
    "endDate":"1512378000000",
    "isAllDay":"0",
    "isRecur":"0",
    "frequency":"0",
    "interval":"0",
    "recurStopCondition":"1",
    "recurStopValue":"0",
    "finalFinishTime":"1512378000000",
    "belongId":"",
    "objectId":"",
    "isPrivate":"0",
    "accessible":true,
    "status":3,
    "createdAt":"1514130865480",
    "updatedAt":"1514167576356",
    "createdBy":"880058",
    "updatedBy":"880058",
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
    "id":"1122311",
    "name":"8",
    "address":"",
    "description":"",
    "startDate":"1512363600000",
    "endDate":"1512370800000",
    "isAllDay":"0",
    "isRecur":"0",
    "frequency":"0",
    "interval":"0",
    "recurStopCondition":"1",
    "recurStopValue":"0",
    "finalFinishTime":"1512370800000",
    "belongId":"",
    "objectId":"",
    "isPrivate":"0",
    "accessible":true,
    "status":3,
    "createdAt":"1514130151299",
    "updatedAt":"1514167586756",
    "createdBy":"880058",
    "updatedBy":"880058",
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
    "id":"1122268",
    "name":"1",
    "address":"",
    "description":"",
    "startDate":"1512347400000",
    "endDate":"1512349200000",
    "isAllDay":"0",
    "isRecur":"0",
    "frequency":"0",
    "interval":"0",
    "recurStopCondition":"1",
    "recurStopValue":"0",
    "finalFinishTime":"1512349200000",
    "belongId":"",
    "objectId":"",
    "isPrivate":"0",
    "accessible":true,
    "status":3,
    "createdAt":"1514130495930",
    "updatedAt":"1514167558319",
    "createdBy":"880058",
    "updatedBy":"880058",
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
    "id":"1122312",
    "name":"5",
    "address":"",
    "description":"",
    "startDate":"1512352800000",
    "endDate":"1512354600000",
    "isAllDay":"0",
    "isRecur":"0",
    "frequency":"0",
    "interval":"0",
    "recurStopCondition":"1",
    "recurStopValue":"0",
    "finalFinishTime":"1512354600000",
    "belongId":"",
    "objectId":"",
    "isPrivate":"0",
    "accessible":true,
    "status":3,
    "createdAt":"1514130307479",
    "updatedAt":"1514167648884",
    "createdBy":"880058",
    "updatedBy":"880058",
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
    "id":"1122265",
    "name":"3",
    "address":"",
    "description":"",
    "startDate":"1512351000000",
    "endDate":"1512397800000",
    "isAllDay":"0",
    "isRecur":"0",
    "frequency":"0",
    "interval":"0",
    "recurStopCondition":"1",
    "recurStopValue":"0",
    "finalFinishTime":"1512397800000",
    "belongId":"",
    "objectId":"",
    "isPrivate":"0",
    "accessible":true,
    "status":3,
    "createdAt":"1514130124164",
    "updatedAt":"1514167636617",
    "createdBy":"880058",
    "updatedBy":"880058",
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
    "id":"1122266",
    "name":"4",
    "address":"",
    "description":"",
    "startDate":"1512351000000",
    "endDate":"1512363600000",
    "isAllDay":"0",
    "isRecur":"0",
    "frequency":"0",
    "interval":"0",
    "recurStopCondition":"1",
    "recurStopValue":"0",
    "finalFinishTime":"1512363600000",
    "belongId":"",
    "objectId":"",
    "isPrivate":"0",
    "accessible":true,
    "status":3,
    "createdAt":"1514130176182",
    "updatedAt":"1514167606082",
    "createdBy":"880058",
    "updatedBy":"880058",
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
    "id":"1122270",
    "name":"7",
    "address":"",
    "description":"",
    "startDate":"1512363600000",
    "endDate":"1512378000000",
    "isAllDay":"0",
    "isRecur":"0",
    "frequency":"0",
    "interval":"0",
    "recurStopCondition":"1",
    "recurStopValue":"0",
    "finalFinishTime":"1512378000000",
    "belongId":"",
    "objectId":"",
    "isPrivate":"0",
    "accessible":true,
    "status":3,
    "createdAt":"1514130884843",
    "updatedAt":"1514167615083",
    "createdBy":"880058",
    "updatedBy":"880058",
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
    "id":"1123499",
    "name":"34344",
    "address":"",
    "description":"",
    "startDate":"1512349200000",
    "endDate":"1512379800000",
    "isAllDay":"0",
    "isRecur":"0",
    "frequency":"0",
    "interval":"0",
    "recurStopCondition":"1",
    "recurStopValue":"0",
    "finalFinishTime":"1512379800000",
    "belongId":"",
    "objectId":"",
    "isPrivate":"0",
    "accessible":true,
    "status":3,
    "createdAt":"1514182902293",
    "updatedAt":"1514182902293",
    "createdBy":"880058",
    "updatedBy":"880058",
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
    "id":"1123498",
    "name":"3223",
    "address":"",
    "description":"",
    "startDate":"1512365400000",
    "endDate":"1512388800000",
    "isAllDay":"0",
    "isRecur":"0",
    "frequency":"0",
    "interval":"0",
    "recurStopCondition":"1",
    "recurStopValue":"0",
    "finalFinishTime":"1512388800000",
    "belongId":"",
    "objectId":"",
    "isPrivate":"0",
    "accessible":true,
    "status":3,
    "createdAt":"1514182877843",
    "updatedAt":"1514182877843",
    "createdBy":"880058",
    "updatedBy":"880058",
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
    "id":"1123539",
    "name":"343443",
    "address":"",
    "description":"",
    "startDate":"1512367200000",
    "endDate":"1512394200000",
    "isAllDay":"0",
    "isRecur":"0",
    "frequency":"0",
    "interval":"0",
    "recurStopCondition":"1",
    "recurStopValue":"0",
    "finalFinishTime":"1512394200000",
    "belongId":"",
    "objectId":"",
    "isPrivate":"0",
    "accessible":true,
    "status":3,
    "createdAt":"1514182886548",
    "updatedAt":"1514182886548",
    "createdBy":"880058",
    "updatedBy":"880058",
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
    "id":"1123500",
    "name":"3443",
    "address":"",
    "description":"",
    "startDate":"1512381600000",
    "endDate":"1512383400000",
    "isAllDay":"0",
    "isRecur":"0",
    "frequency":"0",
    "interval":"0",
    "recurStopCondition":"1",
    "recurStopValue":"0",
    "finalFinishTime":"1512383400000",
    "belongId":"",
    "objectId":"",
    "isPrivate":"0",
    "accessible":true,
    "status":3,
    "createdAt":"1514182913102",
    "updatedAt":"1514182913102",
    "createdBy":"880058",
    "updatedBy":"880058",
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
    "id":"1123579",
    "name":"2323",
    "address":"",
    "description":"",
    "startDate":"1512381600000",
    "endDate":"1512397800000",
    "isAllDay":"0",
    "isRecur":"0",
    "frequency":"0",
    "interval":"0",
    "recurStopCondition":"1",
    "recurStopValue":"0",
    "finalFinishTime":"1512397800000",
    "belongId":"",
    "objectId":"",
    "isPrivate":"0",
    "accessible":true,
    "status":3,
    "createdAt":"1514184076642",
    "updatedAt":"1514184076642",
    "createdBy":"880058",
    "updatedBy":"880058",
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
    "id":"1123580",
    "name":"23",
    "address":"",
    "description":"",
    "startDate":"1512381600000",
    "endDate":"1512390600000",
    "isAllDay":"0",
    "isRecur":"0",
    "frequency":"0",
    "interval":"0",
    "recurStopCondition":"1",
    "recurStopValue":"0",
    "finalFinishTime":"1512390600000",
    "belongId":"",
    "objectId":"",
    "isPrivate":"0",
    "accessible":true,
    "status":3,
    "createdAt":"1514184085929",
    "updatedAt":"1514184085929",
    "createdBy":"880058",
    "updatedBy":"880058",
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
    "id":"1123583",
    "name":"2323",
    "address":"",
    "description":"",
    "startDate":"1512381600000",
    "endDate":"1512385200000",
    "isAllDay":"0",
    "isRecur":"0",
    "frequency":"0",
    "interval":"0",
    "recurStopCondition":"1",
    "recurStopValue":"0",
    "finalFinishTime":"1512385200000",
    "belongId":"",
    "objectId":"",
    "isPrivate":"0",
    "accessible":true,
    "status":3,
    "createdAt":"1514184133262",
    "updatedAt":"1514184133262",
    "createdBy":"880058",
    "updatedBy":"880058",
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
    this.listRef.addEventListener('mousedown', this.onDocumentMouseDown.bind(this));
    const totalHeight = 22 * 48;
    const totalWidth = this.listRef.offsetWidth;
    const dayTimeStamp = 86400; //每一天的总时间长度（时间戳）

    let columnMaxHeights = {};
    let columnMinWidth = {};
    let divs = {};

    for (let i = 0; i < dataSort.length; i++) {
      let selDiv = document.createElement('div');
      selDiv.style.cssText = 'position:absolute;margin:0px;padding:0px;border:1px dashed #0099FF;background-color:red;z-index:10;filter:alpha(opacity:60);opacity:0.6;display:block;';
      const top = ((dataSort[i].startDate / 1000 - getTimeStamp('2017-12-4 00:00:00')) / dayTimeStamp) * totalHeight;
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

      // if (other) {
      //   for (let key in columnMinWidth) {
      //     if (key < findColumn) {
      //
      //     }
      //   }
      // } else {
      //   columnMinWidth[findColumn] = columnMinWidth[findColumn] ? totalWidth : columnMinWidth[findColumn] + 'px';
      //   let w = 0;
      //   for (let key in columnMinWidth) {
      //     if (key < findColumn) {
      //       w += columnMinWidth[key] ? totalWidth : columnMinWidth[key];
      //     }
      //     break;
      //   }
      //   selDiv.style.left = w + 'px';
      //   columnMinWidth[findColumn] = w;
      // }



      // selDiv.style.width = 100 + 'px';
      // selDiv.style.left = (findColumn - 1) * 100 + 'px';
      selDiv.column = findColumn;

      divs['selDiv' + i] = selDiv;


     // this.listRef.appendChild(selDiv);

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
      this.listRef.appendChild(divs[key]);
    }
  }

  componentWillReceiveProps(nextProps) {

  }

  componentWillUnmount() {
    //document.removeEventListener('mousedown', this.onDocumentMouseDown);
  }

  onDocumentMouseDown(e) {
    let event = e || window.event;
    console.log(event.offsetX + '-' + event.offsetY);
    const _this = this;
    document.onmousemove = function(moveE) {
      event = moveE || window.event;
      console.log(event.offsetX + '-' + event.offsetY);
      _this.clearEventBubble(event);
    }

    this.listRef.onmouseup = () => {
      document.onmousemove = null;
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
      <ul className={Styles.DragSelectList} ref={(ref) => { this.listRef = ref }}>
        {
          this.getHtml()
        }
      </ul>
    );
  }
}


export default DragSelectList;
