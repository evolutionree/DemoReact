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


  }


  render() {
    return (
      <div className={styles.deskWrap}>
        <div className="grid" id="grid1">
          <div className="grid-item grid-item--width2"></div>
          <div className="grid-item grid-sizer"></div>
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
