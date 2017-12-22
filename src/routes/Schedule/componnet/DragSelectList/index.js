/**
 * Created by 0291 on 2017/12/22.
 */
import React, { Component } from 'react';
import Styles from './index.less';

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

  componentDidMount() {
    this.listRef.addEventListener('mousedown', this.onDocumentMouseDown.bind(this));
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
