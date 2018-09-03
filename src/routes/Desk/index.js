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
  }

  componentDidMount() {
    var pckry = new Packery( '#grid1', {
      itemSelector: '.grid-item',
      columnWidth: '.grid-sizer',
      percentPosition: true
    });

    pckry.getItemElements().forEach( function( itemElem ) {
      var draggie = new Draggabilly( itemElem );
      pckry.bindDraggabillyEvents( draggie );
    });

    var pckry2 = new Packery( '#grid2', {
      itemSelector: '.grid-item',
      columnWidth: 1,
      percentPosition: true
    });

    pckry2.getItemElements().forEach( function( itemElem ) {
      var draggie = new Draggabilly( itemElem );
      pckry2.bindDraggabillyEvents( draggie );
    });
  }


  render() {
    return (
      <div className={styles.deskWrap}>
        <div className={styles.leftWrap}>
          <div className="grid" id="grid1">
            <div className="grid-item grid-item--width2"></div>
            <div className="grid-item grid-sizer"></div>
            <div className="grid-item"></div>
            <div className="grid-item"></div>
            <div className="grid-item"></div>
            <div className="grid-item"></div>
          </div>
        </div>
        <div className={styles.rightWrap}>
          <div className="grid" id="grid2">
            <div className="grid-item"></div>
            <div className="grid-item"></div>
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
