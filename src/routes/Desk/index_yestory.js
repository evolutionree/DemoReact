/**
 * Created by 0291 on 2018/7/31.
 */
import React from 'react';
import _ from "lodash";
import { Button } from 'antd';
import { connect } from 'dva';
import classnames from 'classnames';
import RightLayout from './RightLayout.js';
import LeftLayout from './LeftLayout.js';
import mainstyles from './main.less';
import Packery from 'packery';
import Draggabilly from 'draggabilly';
import styles from './index.less';
import Dnd from './Dn/Dnd';

Packery.prototype.getShiftPositions = function(attrName = 'id') {
  const _this = this;
  return this.items.map(function(item) {
    return {
      attr: item.element.getAttribute(attrName),
      x: item.rect.x / _this.packer.width
    };
  });
};

Packery.prototype.initShiftLayout = function(positions, attr = 'id') {
  console.log(positions)
  if (!positions) {
    // if no initial positions, run packery layout
    this.layout();
    return;
  }
  // parse string to JSON
  if (typeof positions === 'string') {
    try {
      positions = JSON.parse(positions);
    } catch (error) {
      console.error('JSON parse error: ' + error);
      this.layout();
      return;
    }
  }

  this._resetLayout();
  // set item order and horizontal position from saved positions
  this.items = positions.map(function(itemPosition) {
    const selector = '[' + attr + '="' + itemPosition.attr + '"]'
    const itemElem = this.element.querySelector(selector);
    const item = this.getItem(itemElem);
    console.log(item)
    if (item) {
      item.rect.x = itemPosition.x * this.packer.width;
      return item;
    }
  }, this).filter(item => item);
  console.log(this.items)
  this.shiftLayout();
};

class Desk extends React.PureComponent {
  static defaultProps = {

  };

  constructor(props) {
    super(props);
    this.state = {
      pckry: null
    };
  }

  componentDidMount() {
    // const pckry = new Packery('#grid1', {
    //   itemSelector: '.grid-item',
    //   columnWidth: '.grid-sizer',
    //   percentPosition: true,
    //   initLayout: true // disable initial layout
    // });

    // get saved dragged positions
    const initPositions = localStorage.getItem('dragPositions');
    // init layout with saved positions
   // pckry.initShiftLayout(initPositions, 'data-item-id');

    // make draggable
    // console.log(pckry.getItemElements())
    // pckry.getItemElements().forEach(function(itemElem) {
    //   const draggie = new Draggabilly(itemElem);
    //   pckry.bindDraggabillyEvents(draggie);
    // });

    // save drag positions on event
    // pckry.on('dragItemPositioned', function() {
    //   // save drag positions
    //   const positions = pckry.getShiftPositions('data-item-id');
    //   localStorage.setItem('dragPositions', JSON.stringify(positions));
    // });

    // const draggiedragEle = new Draggabilly('.dragEle');
    // const stampElem = document.querySelector('.stamp');
    // let bool = true;
    // console.log(pckry)
    // draggiedragEle.on('pointerMove', (event, pointer, moveVector) => {
    //   if ((moveVector.x + pointer.target.offsetWidth) > 300) {
    //     bool && pckry.stamp(stampElem);
    //     // let position = this.getItemPosition(itemPotions, moveVector.x + pointer.target.offsetWidth - 300, moveVector.y + 100, pointer.target.offsetWidth);
    //     stampElem.style.left = 0 + 'px';
    //     stampElem.style.top = 0 + 'px';
    //     bool = false;
    //     pckry.layout();
    //   }
    // });

    // draggiedragEle.on('pointerUp', function (event, pointer, moveVector) {
    //   // let positions = pckry.getShiftPositions('data-item-id');
    //   // positions = positions.splice(3, 0, {
    //   //   attr: '10',
    //   //   x: 0
    //   // });
    //   pckry.unstamp(stampElem);
    //   pckry.layout();
    //   const items = [
    //     getItemElement()
    //   ];
    //   //append elements to container
    //   const fragment = document.createDocumentFragment();
    //   fragment.appendChild(items[0]);
    //   document.getElementById('grid1').appendChild(fragment);
    //   // add and lay out newly appended elements
    //   pckry.appended(items);
    //   pckry.fit(items[0], 0, 0);
    //
    //   //pckry.initShiftLayout(positions, 'data-item-id');
    //   // console.log(pckry.items);
    //   // pckry.items = pckry.items.map(function(item) {
    //   //   console.log(item.element.dataset.itemId)
    //   //   if (item.element.dataset.itemId == 10) {
    //   //     item.rect.x = 0;
    //   //     item.rect.y = 100;
    //   //   }
    //   //   return item;
    //   // }, pckry);
    //   // pckry.shiftLayout();
    // });

    function getItemElement(position) {
      const item = document.createElement('div');
      // add width and height class
      item.className = 'grid-item ';
      item.dataset.itemId = '10';
      return item;
    }
  }

  componentDidUpdate() {
    const pckry = new Packery('#grid1', {
      itemSelector: '.grid-item',
      columnWidth: '.grid-sizer',
      percentPosition: true,
      initLayout: true // disable initial layout
    });
    console.log('componentDidUpdate')

    // get saved dragged positions
    let initPositions = localStorage.getItem('dragPositions');
    console.log(initPositions)
    // init layout with saved positions
   // pckry.initShiftLayout(initPositions, 'data-item-id');

    // make draggable
    document.querySelectorAll('.grid-item').forEach(function(itemElem) {
      const option = /grid-item-width2/.test(itemElem.getAttribute('class')) ? {
        axis: 'y'
      } : {};
      const draggie = new Draggabilly(itemElem, option);
      pckry.bindDraggabillyEvents(draggie);
    });

    let _this = this;
    const draggableElems = document.querySelectorAll('.component');
    let draggies = [];
    for (let i = 0; i < draggableElems.length; i++) {
      let draggableElem = draggableElems[i];
      let draggie = new Draggabilly(draggableElem);

      const stampElem = document.querySelector('.stamp');
      let bool = true;
      draggie.enter = false;
      draggie.on('dragMove', function (event, pointer, moveVector) {
        console.log(pointer)
        if ((moveVector.x + pointer.target.offsetWidth) > 192) {
          this.enter = true;
          bool && pckry.stamp(stampElem);
          //let position = this.getItemPosition(itemPotions, moveVector.x + pointer.target.offsetWidth - 300, moveVector.y + 100, pointer.target.offsetWidth);
          stampElem.style.left = 0 + 'px';
          stampElem.style.top = 0 + 'px';
          bool = false;
          pckry.shiftLayout();
        } else {
          this.enter = false;
        }
      });

      draggie.on('dragEnd', function (event, pointer) {
        if (this.enter) { //TODO: 进入拖拽区域
          // console.log(2222222)
          // const newInitPositions = _.cloneDeep(newInitPositions);
          // newInitPositions.splice(0, 0, {
          //   attr: pointer.target.dataset.componentId,
          //   x: 0
          // });
          // localStorage.setItem('dragPositions', JSON.stringify(newInitPositions));


          // const items = [
          //   getItemElement()
          // ];
          // //append elements to container
          // const fragment = document.createDocumentFragment();
          // fragment.appendChild(items[0]);
          // document.getElementById('grid1').appendChild(fragment);
          // // add and lay out newly appended elements
          // pckry.appended(items);
          // pckry.fit(items[0], 0, 0);


          _this.props.addLayout(pointer.target.dataset.componentId);
        }
        pckry.unstamp(stampElem);
        pckry.shiftLayout();
      });
      draggies.push(draggie);
    }


    pckry.on('layoutComplete', function() {
      // save drag positions
      const positions = pckry.getShiftPositions('data-item-id');
      localStorage.setItem('dragPositions', JSON.stringify(positions));
    });


    function getItemElement(position) {
      const item = document.createElement('div');
      // add width and height class
      item.className = 'grid-item ';
      item.dataset.itemId = '10';
      return item;
    }
  }

  saveDeskTops = () => {
    this.props.saveDeskTops();
  }

  render() {
    return (
      <div className={styles.deskWrap}>
        <div className={styles.toolBar}>
          <Button onClick={this.saveDeskTops}>保存</Button>
        </div>
        <div className={styles.componentsWrap} id='componentsWrap'>
          {
            this.props.componentList.map((item, index) => {
              return (
                <div className='component' key={item.dscomponetid} data-component-id={item.dscomponetid}>
                  {
                    item.comname
                  }
                </div>
              );
            })
          }
        </div>
        <div className={styles.layoutWrap}>
          <div className="grid" id="grid1">
            {
              this.props.leftComponent.map((item, index) => {
                return <div key={index} className={item.comwidth === 2 ? 'grid-item grid-item-width2' : 'grid-item'} data-item-id={item.dscomponetid}>{item.comname}</div>;
              })
            }
            <div className="grid-sizer"></div>
            <div className="stamp"></div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  state => state.desk,
  dispatch => {
    return {
      addLayout: (componentid) => {
        dispatch({ type: 'desk/addLayout', payload: componentid });
      },
      saveDeskTops: () => {
        console.log(111111)
        dispatch({ type: 'desk/saveDeskTops' });
      }
    };
  }
)(Desk);


/*
<div className="grid-item grid-item--width2" data-item-id="1">1</div>
<div className="grid-item grid-sizer" data-item-id="2">2</div>
<div className="grid-item" data-item-id="3">3</div>
<div className="grid-item" data-item-id="4">4</div>
<div className="grid-item" data-item-id="5">5</div>
<div className="grid-item" data-item-id="6">6</div>
<div className="grid-item" data-item-id="7">7</div>
<div className="grid-item" data-item-id="8">8</div>
<div className="grid-item" data-item-id="9">9</div>
<div className="stamp"></div>
 */
