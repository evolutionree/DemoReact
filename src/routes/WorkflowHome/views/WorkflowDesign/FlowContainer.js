import React, { PropTypes, Component } from 'react';
import styles from './styles.less';

class FlowContainer extends Component {
  // shouldComponentUpdate() {
  //   return false;
  // }
  constructor(props) {
    super(props);
    this.state = {
      zoom: 1
    };
  }

  componentDidMount() {
    window.jsPlumb.setZoom(0.75);
    // IE9, Chrome, Safari, Opera
    window.addEventListener('mousewheel', this.onMouseWheelHandler, false);
    // Firefox
    window.addEventListener('DOMMouseScroll', this.onMouseWheelHandler, false);
  }

  componentWillUnmount() {
    window.removeEventListener('mousewheel', this.onMouseWheelHandler);
    window.removeEventListener('DOMMouseScroll', this.onMouseWheelHandler);
  }

  onMouseWheelHandler = (e) => {
    let newZoom = this.state.zoom;
    if (e.wheelDelta > 0) {
      newZoom = newZoom + 0.1;
    } else {
      newZoom = newZoom - 0.1;
    }
    this.setState({
      zoom: newZoom
    }, this.zoom);
    return false;
  }

  zoom = (scale = this.state.zoom) => {
    // $(`#jsp-container-${this.props.scope}`).css({
    //   '-webkit-transform': `scale(${scale})`,
    //   '-moz-transform': `scale(${scale})`,
    //   '-ms-transform': `scale(${scale})`,
    //   '-o-transform': `scale(${scale})`,
    //   'transform': `scale(${scale})`
    // });
  }

  render() {
    return (
      <div
        className={styles.flowcontainer}
        id={`jsp-container-${this.props.scope}`}
        ref={this.props.onDomReady}
      >
        {this.props.children}
      </div>
    );
  }
}

export default FlowContainer;
