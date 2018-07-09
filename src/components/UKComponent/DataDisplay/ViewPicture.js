/**
 * Created by 0291 on 2018/7/9.
 */
import React, { PropTypes, Component } from 'react';
import { Badge, Button, Icon } from 'antd';
import styles from './ViewPicture.less';

let originalWidth = 0;
let originalHeight = 0;
class ViewPicture extends Component {
  static propTypes = {

  };
  static defaultProps = {

  };
  constructor(props) {
    super(props);
    this.state = {
      visible: this.props.visible,
      zoomInBtnDisabled: false,
      zoomOutBtnDisabled: false
    };
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      visible: nextProps.visible
    });
  }

  imgLoad = () => {
    this.initial();
  }

  initial = () => {
    const currentWidth = this.imgRef.width;
    const currentHeight = this.imgRef.height;
    originalWidth = currentWidth;
    originalHeight = currentHeight;
    this.update(currentWidth, currentHeight);
  }

  zoomIn = () => {
    this.update(this.state.width * 1.2, this.state.height * 1.2);
  }

  zoomOut = () => {
    this.update(this.state.width / 1.2, this.state.height / 1.2);
  }

  resetImage = () => {
    this.update(originalWidth, originalHeight);
  }

  update = (width, height) => {
    let newWidth = width;
    let newHeight = height;
    const clientWidth = document.body.clientWidth;
    const clientHeight = document.body.clientHeight;
    if (width > clientWidth || height > clientHeight) {
      if (width > clientWidth) {
        newWidth = clientWidth;
      } else if (height > clientHeight) {
        newHeight = clientHeight;
      }
      this.setState({
        zoomInBtnDisabled: true,
        zoomOutBtnDisabled: false
      });
    } else if (width < 100 || height < 100) {
      if (width < 100) {
        newWidth = 100;
      } else if (height < 100) {
        newHeight = 100;
      }
      this.setState({
        zoomInBtnDisabled: false,
        zoomOutBtnDisabled: true
      });
    } else {
      this.setState({
        zoomInBtnDisabled: false,
        zoomOutBtnDisabled: false
      });
    }

    this.setState({
      width: newWidth,
      height: newHeight
    });
  }

  close = () => {
    this.props.onClose && this.props.onClose();
    this.setState({
      visible: false
    });
  }

  render() {
    const imgProps = {
      width: this.state.width,
      height: this.state.height
    }
    return (
      <div className={styles.viewPictureWrap} style={{ display: this.state.visible ? 'block' : 'none' }}>
        <div className={styles.infoWrap}>
          <Icon type="close" onClick={this.close} />
        </div>
        <div className={styles.imgWrap}>
          <img src={this.props.imgInfo && this.props.imgInfo.src} id="pic_1" ref={ref => this.imgRef = ref} onLoad={this.imgLoad} {...imgProps} />
        </div>
        <div className={styles.btnWrap}>
          <Button onClick={this.zoomIn} disabled={this.state.zoomInBtnDisabled}>放大</Button>
          <Button onClick={this.zoomOut} disabled={this.state.zoomOutBtnDisabled}>缩小</Button>
          <Button onClick={this.resetImage}>重置</Button>
        </div>
      </div>
    );
  }
}

export default ViewPicture;
