/**
 * Created by 0291 on 2018/7/31.
 */
import React from 'react';
import _ from "lodash";
import { Icon, Button } from 'antd';
import { connect } from 'dva';
import Packery from 'packery';
import Draggabilly from 'draggabilly';
import styles from './index.less';

Packery.prototype.getShiftPositions = function(attrName = 'id') {
  const _this = this;
  return this.items.map(function(item) {
    return {
      attr: item.element.getAttribute(attrName),
      X: item.rect.x / _this.packer.width,
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
      item.rect.x = itemPosition.postion.X_Proportion * this.packer.width || 0;
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
      reload: false,
      documentHeight: document.body.clientHeight
    };
  }

  componentDidMount() {
    this.setState({
      width: this.layoutWrapRef.offsetWidth
    })
    window.addEventListener('resize', this.onWindowResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
  }

  onWindowResize = (e) => {
    this.setState({
      width: this.layoutWrapRef.offsetWidth,
      documentHeight: document.body.clientHeight
    });
  }

  componentWillReceiveProps() {
    this.setState({
      reload: false
    });
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
          this.position = _this.getItemPosition(itemPotions, moveVector.x - 40, moveVector.y + 10, pointer.target.offsetWidth, pointer.target);
          stampElem.style.display = 'block';
          stampElem.style.left = this.position.L + 'px';
          stampElem.style.top = this.position.T + 'px';
          stampElem.style.width = parseInt(pointer.target.dataset.widthType) === 2 ? '66.6666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666%' : '33.3333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333%';
          //stampElem.style.height = pointer.target.dataset.componentHeight + 'px';
          bool = false;
          window.pckry.shiftLayout();
        } else {
          this.enter = false;
        }
      });

      draggie.on('dragEnd', function (event, pointer) {
        if (this.enter) { //TODO: 进入拖拽区域
          console.log('dragEnd')
          this.enter = false;
          this.destroy();
          //TODO:  记录拖拽后的定位  每个组件的顺序  别忘了  宽度不能设置成固定值
          window.pckry = null;
          draggie = null;
          draggies = [];
          _this.reloadDragComponent();
          _this.props.addLayout(pointer.target.dataset.componentId, this.position, itemPotions);
        } else {
          this.setPosition(0, 0);
        }
        stampElem.style.display = 'none';
        window.pckry.unstamp(stampElem);
        window.pckry.shiftLayout();
      });
      draggies.push(draggie);
    }

    // document.querySelector('.grid').addEventListener('click', function(event) {
    //   // filter grid-item clicks
    //   if (!event.target.classList.contains('grid-item')) {
    //     return;
    //   }
    //   // remove clicked element
    //   window.pckry.remove(event.target);
    //   // shiftLayout remaining item elements
    //   window.pckry.shiftLayout();
    // });


    window.pckry.on('layoutComplete', getCurrentItemPosition);

    window.pckry.on('dragItemPositioned', getCurrentItemPosition);

    function getCurrentItemPosition() {
      itemPotions = window.pckry.getShiftPositions('data-item-id');
      // const { layoutComponents } = _this.props;
      // console.log(itemPotions)
      // const newLayoutComponents = itemPotions.map(newItemComponentPosition => {
      //   const currentItem = _.find(layoutComponents, oldItemCompomemt => oldItemCompomemt.dscomponetid === newItemComponentPosition.componentId);
      //   currentItem.postion = JSON.stringify({
      //     X_Proportion: newItemComponentPosition.X
      //   });
      //   return currentItem;
      // });
      // console.log(newLayoutComponents);
      // _this.reloadDragComponent();
      // _this.props.updateComponent(layoutComponents);
    }
  }


  getItemPosition = (itemPotions, L, T, W, dragTarget) => {
    if (dragTarget.dataset.widthType === undefined) {
      return {
        L: 0,
        X: 0,
        T: 0,
        insetComponentId: ''
      };
    }
    const fixedLeft = parseInt(dragTarget.dataset.widthType) === 2;
    const itemWidth = this.state.width / 3;
    let layout;
    let Layout_L = 0;
    if (fixedLeft) {
      layout = itemPotions.filter(item => {
        return item.L === 0;
      });
      Layout_L = 0;
    } else if (L < itemWidth / 2) {
      layout = itemPotions.filter(item => {
        return item.L === 0;
      });
      Layout_L = 0;
    } else if (L >= (itemWidth + itemWidth / 2)) {
      layout = itemPotions.filter(item => {
        return Math.abs(item.L - itemWidth * 2) < 5;
      });
      Layout_L = itemWidth * 2;
    } else {
      layout = itemPotions.filter(item => {
        return Math.abs((item.L + item.W) - itemWidth * 2) < 5;
      });
      Layout_L = itemWidth;
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
        X: Layout_L / this.state.width,
        T: 0,
        insetComponentId: ''
      };
    } else {
      return {
        L: Layout_L,
        X: Layout_L / this.state.width,
        T: layout[insertIndex - 1].T + layout[insertIndex - 1].H,
        insetComponentId: layout[insertIndex - 1].componentId
      };
    }
  }

  reloadDragComponent = () => {
    this.setState({
      reload: true
    });
  }

  saveDeskTops = () => {
    const { layoutComponents } = this.props;
    const currentItemPosition = window.pckry.getShiftPositions('data-item-id');
    const newLayoutComponents = currentItemPosition.map(newItemComponentPosition => {
      const currentItem = _.find(layoutComponents, oldItemCompomemt => oldItemCompomemt.dscomponetid === newItemComponentPosition.componentId);
      currentItem.postion = JSON.stringify({
        X_Proportion: newItemComponentPosition.X
      });
      return currentItem;
    });
    this.props.saveDeskTops(newLayoutComponents);
  }

  removeComponent = (dscomponetid) => {
    const { layoutComponents } = this.props;
    const itemPotions = window.pckry.getShiftPositions('data-item-id');
    const newLayoutComponents = itemPotions.map(newItemComponentPosition => {
      const currentItem = _.find(layoutComponents, oldItemCompomemt => oldItemCompomemt.dscomponetid === newItemComponentPosition.componentId);
      currentItem.postion = JSON.stringify({
        X_Proportion: newItemComponentPosition.X
      });
      return currentItem;
    }).filter(item => item.dscomponetid !== dscomponetid);
    this.reloadDragComponent();
    console.log(newLayoutComponents)
    this.props.updateComponent(newLayoutComponents);
  }

  render() {
    const layoutComponent = this.props.layoutComponents.map(item => item.dscomponetid);
    const showComponentList = this.props.componentList.filter(item => {
      return layoutComponent.indexOf(item.dscomponetid) === -1;
    });

    console.log(layoutComponent)
    return (
      <div className={styles.deskWrap} style={{ height: this.state.documentHeight - 60 }}>
        <div className={styles.toolBar}>
          <Button onClick={this.saveDeskTops}>保存</Button>
        </div>
        <div className={styles.content}>
          <div className={styles.componentsWrap} id='componentsWrap'>
            {
              !this.state.reload ? this.props.componentList.map((item, index) => {
                return (
                  <div key={item.dscomponetid}
                       className='component'
                       data-component-id={item.dscomponetid}
                       data-component-height={item.maxcomheight}
                       data-width-type={item.comwidth}>
                    {
                      item.comname + '||' + item.dscomponetid
                    }
                  </div>
                );
              }) : null
            }
          </div>
          <div className={styles.layoutWrap} ref={ref => this.layoutWrapRef = ref}>
            <div className="grid" id="grid1">
              {
                !this.state.reload ? this.props.layoutComponents.map((item, index) => {
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
      </div>
    );
  }
}
//<Icon type="close" onClick={this.removeComponent.bind(this, item.dscomponetid)} />
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
      updateComponent: (newLayoutComponents) => {
        dispatch({ type: 'desk/putState', payload: { layoutComponents: newLayoutComponents } });
      }
    };
  }
)(Desk);
