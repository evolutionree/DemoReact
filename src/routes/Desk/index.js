/**
 * Created by 0291 on 2018/7/31.
 */
import React from 'react';
import _ from "lodash";
import { Button } from 'antd';
import { connect } from 'dva';
import Packery from 'packery';
import Draggabilly from 'draggabilly';
import styles from './index.less';

Packery.prototype.getShiftPositions = function(attrName = 'id') {
  const _this = this;
  return this.items.map(function(item) {
    return {
      attr: item.element.getAttribute(attrName),
      x: item.rect.x / _this.packer.width,
      L: item.element.offsetLeft,
      T: item.element.offsetTop,
      W: item.element.offsetWidth,
      H: item.element.offsetHeight,
      componentId: item.element.dataset.itemId
    };
  });
};

Packery.prototype.initShiftLayout = function(positions, attr = 'id') {
  if (!positions) {
    // if no initial positions, run packery layout
    this.layout();
    return;
  }

  this._resetLayout();
  // set item order and horizontal position from saved positions
  this.items = positions.map(function(itemPosition) {
    const selector = '[' + attr + '="' + itemPosition.dscomponetid + '"]'
    const itemElem = this.element.querySelector(selector);
    const item = this.getItem(itemElem);
    if (item) {
      item.rect.x = itemPosition.postion.X_Proportion || 0;
      return item;
    }
  }, this).filter(item => item);
  this.shiftLayout();
};

class Desk extends React.PureComponent {
  static defaultProps = {

  };

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentDidMount() {

  }

  componentDidUpdate() {
    window.pckry = new Packery('#grid1', {
      itemSelector: '.grid-item',
      columnWidth: '.grid-sizer',
      percentPosition: true,
      initLayout: false // disable initial layout
    });

    // init layout with saved positions
    window.pckry.initShiftLayout(this.props.layoutComponents, 'data-item-id');

    // make draggable
    let layoutComponents = document.querySelectorAll('.grid-item');
    layoutComponents.forEach(function(itemElem) {
      const option = /grid-item-width2/.test(itemElem.getAttribute('class')) ? {
        axis: 'y'
      } : {};
      const draggie = new Draggabilly(itemElem, option);
      window.pckry.bindDraggabillyEvents(draggie);
    });

    let itemPotions = window.pckry.getShiftPositions('data-item-id');

    let _this = this;
    const stampElem = document.querySelector('.stamp');

    let draggableElems = document.querySelectorAll('.component');
    let draggies = [];
    let bool = true;

    for (let i = 0; i < draggableElems.length; i++) {
      let draggableElem = draggableElems[i];
      let draggie = new Draggabilly(draggableElem);

      draggie.enter = false;
      draggie.on('dragMove', function (event, pointer, moveVector) {
        if (moveVector.x > 40) {
          this.enter = true;
          bool && window.pckry.stamp(stampElem);
          this.position = _this.getItemPosition(itemPotions, moveVector.x - 40, moveVector.y + 10, pointer.target.offsetWidth);
          stampElem.style.left = this.position.L + 'px';
          stampElem.style.top = this.position.T + 'px';
          stampElem.style.width = 350 + 'px';
          //stampElem.style.height = pointer.target.dataset.componentHeight + 'px';
          bool = false;
          window.pckry.shiftLayout();
        } else {
          this.enter = false;
        }
      });

      draggie.on('dragEnd', function (event, pointer) {
        if (this.enter) { //TODO: 进入拖拽区域
          draggableElems = null;
          layoutComponents = null;
          draggie = [];
          _this.props.reload();
          //TODO:  记录拖拽后的定位  每个组件的顺序  别忘了  宽度不能设置成固定值
          _this.props.addLayout(pointer.target.dataset.componentId, this.position, itemPotions);
        }
        window.pckry.unstamp(stampElem);
        window.pckry.shiftLayout();
      });
      draggies.push(draggie);
    }


    window.pckry.on('layoutComplete', getCurrentItemPosition);

    window.pckry.on('dragItemPositioned', getCurrentItemPosition);

    function getCurrentItemPosition() {
      itemPotions = window.pckry.getShiftPositions('data-item-id');
    }


    function getItemElement(position) {
      const item = document.createElement('div');
      // add width and height class
      item.className = 'grid-item ';
      item.dataset.itemId = '10';
      item.style.width = '350px';
      item.style.height = '100px';
      return item;
    }
  }


  getItemPosition = (itemPotions, L, T, W) => {
    console.log(new Date().getTime());
    console.log(JSON.stringify(itemPotions))
    let layout;
    let Layout_L = 0;
    if (L < 175) {
      layout = itemPotions.filter(item => {
        return item.L === 0;
      });
      Layout_L = 0;
    } else if (L >= 525) {
      layout = itemPotions.filter(item => {
        return item.L === 700;
      });
      Layout_L = 700;
    } else {
      layout = itemPotions.filter(item => {
        return item.L + item.W === 700;
      });
      Layout_L = 350;
    }


    let insertIndex;
    for (let i = 0; i < layout.length; i++) {
      if (T < (layout[i].T + layout[i].H / 2)) {
        insertIndex = i;
        break;
      } else {
        insertIndex = i + 1;
      }
    }

    if (!insertIndex) { //TODO: 共三列 当前插入列 插到最前面  或者当前列为空
      return {
        L: Layout_L,
        T: 0,
        insetComponentId: ''
      };
    } else {
      return {
        L: Layout_L,
        T: layout[insertIndex - 1].T + layout[insertIndex - 1].H,
        insetComponentId: layout[insertIndex - 1].componentId
      };
    }
  }

  saveDeskTops = () => {
    const { layoutComponents } = this.props;
    const currentItemPosition = window.pckry.getShiftPositions('data-item-id');
    const newLayoutComponents = currentItemPosition.map(newItemComponentPosition => {
      const currentItem = _.find(layoutComponents, oldItemCompomemt => oldItemCompomemt.dscomponetid === newItemComponentPosition.componentId);
      currentItem.postion = JSON.stringify({
        X_Proportion: newItemComponentPosition.L
      });
      return currentItem;
    });
    this.props.saveDeskTops(newLayoutComponents);
  }

  render() {
    console.log(this.props.layoutComponents)
    const layoutComponent = this.props.layoutComponents.map(item => item.dscomponetid);
    const showComponentList = this.props.componentList.filter(item => {
      return layoutComponent.indexOf(item.dscomponetid) === -1;
    });
    return (
      <div className={styles.deskWrap}>
        <div className={styles.toolBar}>
          <Button onClick={this.saveDeskTops}>保存</Button>
        </div>
        <div className={styles.componentsWrap} id='componentsWrap'>
          {
            !this.props.reloadStatus ? showComponentList.map((item, index) => {
              return (
                <div key={item.dscomponetid} className='component' data-component-id={item.dscomponetid} data-component-height={item.maxcomheight}>
                  {
                    item.comname + '||' + item.dscomponetid
                  }
                </div>
              );
            }) : null
          }
        </div>
        <div className={styles.layoutWrap}>
          <div className="grid" id="grid1">
            {
              !this.props.reloadStatus ? this.props.layoutComponents.map((item, index) => {
                return (
                  <div key={item.dscomponetid} style={{ height: item.maxcomheight }} className={item.comwidth === 2 ? 'grid-item grid-item-width2' : 'grid-item'} data-item-id={item.dscomponetid}>
                    {
                      item.comname + '||' + item.dscomponetid
                    }
                  </div>
                );
              }) : null
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
      addLayout: (componentid, position, AllItemPotions) => {
        dispatch({ type: 'desk/addLayout', payload: { componentid, position, AllItemPotions } });
      },
      saveDeskTops: (newLayoutComponents) => {
        dispatch({ type: 'desk/saveDeskTops', payload: newLayoutComponents });
      },
      reload: () => {
        dispatch({ type: 'desk/putState', payload: { reloadStatus: true } });
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
