/**
 * Created by 0291 on 2018/7/31.
 */
import React from 'react';
import _ from "lodash";
import { connect } from 'dva';
import classnames from 'classnames';
import RightLayout from './RightLayout.js';
import LeftLayout from './LeftLayout.js';
import mainstyles from './main.less';
import Packery from 'packery';
import Draggabilly from 'draggabilly';
import styles from './index.less';
import Dnd from './Dn/Dnd';

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
    const pckry = new Packery('#grid1', {
      itemSelector: '.grid-item',
      columnWidth: '.grid-sizer',
      percentPosition: true
    });
    pckry.getItemElements().forEach((itemElem) => {
      const draggie = new Draggabilly(itemElem);
      draggie.on('dragMove', (event, pointer, moveVector) => {
        console.log(event);
        console.log(pointer)
        console.log(moveVector);

        console.log(moveVector.x);
        const placholderDiv = document.querySelector('.packery-drop-placeholder');
        if (moveVector.x > 130) {
          pointer.target.style.background = 'red';
          // console.log(placholderDiv);
          document.querySelector('#grid1').removeChild(placholderDiv);
          pckry.shiftLayout();
        } else {
          // const placholderDivdd = document.createElement('div');
          // placholderDivdd.className = 'packery-drop-placeholder';
          // document.getElementById('grid1').appendChild(placholderDivdd);
        }
      });
      draggie.on('dragEnd', (event, pointer) => {

      });
      pckry.bindDraggabillyEvents(draggie);
    });


    const draggiedragEle = new Draggabilly('.dragEle');
    const stampElem = document.querySelector('.stamp');
    let bool = true;
    const ItemEle = pckry.getItemElements();
    const itemPotions = ItemEle.map(ele => {
      return {
        L: ele.offsetLeft,
        T: ele.offsetTop,
        W: ele.offsetWidth,
        H: ele.offsetHeight
      };
    });
    draggiedragEle.on('pointerMove', (event, pointer, moveVector) => {
      if ((moveVector.x + pointer.target.offsetWidth) > 300) {
        bool && pckry.stamp(stampElem);
        bool = false;
        pckry.layout();
        let position = this.getItemPosition(itemPotions, moveVector.x + pointer.target.offsetWidth - 300, moveVector.y + 100, pointer.target.offsetWidth);
        stampElem.style.left = position.L + 'px';
        stampElem.style.top = position.T + 'px';
      }
    });

    draggiedragEle.on('pointerUp', (event, pointer, moveVector) => {
      console.log(stampElem.offsetLeft, stampElem.offsetTop);
      pckry.unstamp(stampElem);
      pckry.layout();
      //stampElem.style.display = 'none';
      const items = [
        getItemElement({ L: stampElem.offsetLeft, T: stampElem.offsetTop })
      ];
      //append elements to container
      const fragment = document.createDocumentFragment();
      fragment.appendChild(items[0]);
      document.getElementById('grid1').appendChild(fragment);
      // add and lay out newly appended elements
      pckry.appended(items);
      console.log(stampElem.offsetLeft, stampElem.offsetTop)
      pckry.fit(items[0], stampElem.offsetLeft, stampElem.offsetTop);

      // const draggie = new Draggabilly(items[0]);
      // pckry.bindDraggabillyEvents(draggie);

      // pckry.getItemElements().forEach((itemElem) => {
      //   const draggie = new Draggabilly(itemElem);
      //   pckry.bindDraggabillyEvents(draggie);
      // });
      // pckry.destroy()
      // const newpckry = new Packery('#grid1', {
      //   itemSelector: '.grid-item',
      //   columnWidth: '.grid-sizer',
      //   percentPosition: true
      // });
      // newpckry.getItemElements().forEach((itemElem) => {
      //   const draggie = new Draggabilly(itemElem);
      //   newpckry.bindDraggabillyEvents(draggie);
      // });
    });

    function getItemElement(position) {
      const item = document.createElement('div');
      // add width and height class
      const wRand = Math.random();
      const hRand = Math.random();
      const widthClass = wRand > 0.85 ? 'grid-item--width' : '';
      const heightClass = 'grid-item--height';
      item.className = 'grid-item ' + widthClass + ' ' + heightClass;
      item.innerHTML = position.L + ':' + position.T
      item.style.left = position.L;
      item.style.top = position.T;
      return item;
    }
  }

  getItemPosition = (itemPotions, L, T, W) => {

    console.log(itemPotions)

    let insertIndex;
    for (let i = 0; i < itemPotions.length; i++) {
      if (T < (itemPotions[i].T + itemPotions[i].H / 2)) {
        if (L > 130 + W) {
          insertIndex = i + 1;
        } else {
          insertIndex = i;
        }
        break;
      }
    }

    console.log(itemPotions);
    console.log(insertIndex)
    return insertIndex ? itemPotions[insertIndex] ? itemPotions[insertIndex] : {
      L: itemPotions[insertIndex - 1].W,
      T: itemPotions[insertIndex - 1].T
    } : {
      L: 0,
      T: insertIndex === 0 ? 0 : itemPotions[itemPotions.length - 1].T + itemPotions[itemPotions.length - 1].H
    };
  }

  render() {
    return (
      <div className={styles.deskWrap}>
        <div className={styles.componentsWrap}>
          <button className="toggle-stamp-button">322323</button>
          <div className="grid-item dragEle">1111</div>
        </div>
        <div className={styles.layoutWrap}>
          <div className={styles.leftWrap}>
            <div className="grid" id="grid1">
              <div className="grid-item grid-item--width2"></div>
              <div className="grid-item grid-sizer"></div>
              <div className="grid-item"></div>
              <div className="grid-item"></div>
              <div className="grid-item"></div>
              <div className="grid-item"></div>
              <div className="stamp"></div>
            </div>
          </div>
          <div className={styles.rightWrap}>
            <div className="grid" id="grid2">
              <div className="grid-item">2</div>
              <div className="grid-item">3</div>
              <div className="stamp2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  state => state.desk,
  dispatch => {

  }
)(Desk);
