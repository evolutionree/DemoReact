import React from 'react';
import { Carousel, Icon } from 'antd';
import classnames from 'classnames';
// import SlickCarousel from 'react-slick';
import { connect } from 'dva';
import _ from 'lodash';
import styles from './ImageGallery.less';

const initImgStyle = {
  scale: 1,
  rotate: 0,
  top: 0,
  left: 0,
  mouseX: 0,
  mouseY: 0
};

class ImageGallery extends React.Component {
  imgRef = [];
  constructor(props) {
    super(props);
    this.state = {
      imgStyle: initImgStyle,
      isDragging: false
    };
  }

  componentDidMount() {
    this.wrap.addEventListener('mousemove', this.handleMouseMove, false);
    this.wrap.addEventListener('mouseup', this.handleMouseUp, false);
    this.wrap.addEventListener('mousewheel', this.scrollHanler, false);
  }

  componentWillUnmount() {
    this.wrap.removeEventListener('mousemove', this.handleMouseMove, false);
    this.wrap.removeEventListener('mouseup', this.handleMouseUp, false);
    this.wrap.removeEventListener(' mousewheel', this.scrollHanler, false);
  }

  getElementLeft = (element) => {
    let actualLeft = element.offsetLeft;
    let current = element.offsetParent;

    while (current !== null) {
      actualLeft += current.offsetLeft;
      current = current.offsetParent;
    }
    return actualLeft;
  }

  handleMouseDown = (imgIndex, e) => {
    e.preventDefault();
    const offsetLeft = this.imgRef[imgIndex].offsetLeft;
    const offsetTop = this.imgRef[imgIndex].offsetTop;
    this.setState({
      isDragging: true,
      imgStyle: {
        ...this.state.imgStyle,
        mouseX: e.clientX - offsetLeft,
        mouseY: e.clientY - offsetTop
      }
    });
  }

  handleMouseMove = (e) => {
    e.preventDefault();
    const { mouseX, mouseY } = this.state.imgStyle;
    if (this.state.isDragging) {
      let movedX = e.clientX - mouseX;
      let movedY = e.clientY - mouseY;
      this.setState({
        imgStyle: {
          ...this.state.imgStyle,
          top: movedY,
          left: movedX
        }
      });
    }
  }

  handleMouseUp = () => {
    this.setState({
      isDragging: false
    });
  }

  scrollHanler = (ev) => {
    ev.preventDefault();
    const e = ev || window.event
    const v = e.wheelDelta || e.detail;
    if (v > 0) { //这里主要明白是像上滚动还是下滚动
      this.changeScale();
      return false;
    } else {
      this.changeScale('del');
      return false;
    }
  }

  changeScale = (type) => {
    let scaleNum = 0.5;
    if (type === 'del') {
      scaleNum = -0.5;
    }
    const newScale = this.state.imgStyle.scale + scaleNum;
    this.setState({
      imgStyle: {
        ...this.state.imgStyle,
        scale: newScale < 0 ? 0.1 : newScale
      }
    });
  }

  roateHandler = () => {
    const { rotate } = this.state.imgStyle;
    this.setState({
      imgStyle: {
        ...this.state.imgStyle,
        rotate: rotate + 90
      }
    });
  }

  carouselAfterChange = () => {
    this.setState({
      imgStyle: initImgStyle
    });
  }

  renderArrow = (dir) => {
    return <span><Icon type={dir} /></span>;
  }

  getInitialSlide = () => {
    const { images } = this.props;
    if (images && images.length > 1) {
      const activeIndex = _.findIndex(images, ['active', true]);
      if (activeIndex !== -1) {
        return activeIndex;
      }
    }
    return 0;
  }

  closeModal = () => {
    this.carouselAfterChange();
    this.props.cancel && this.props.cancel();
  }

  render() {
    const { images } = this.props;
    const { imgStyle: { scale, rotate, top, left, mouseX } } = this.state;
    const imagesLength = images && images.length;
    return (
      <div
        className={classnames(styles.modal, { [styles.visible]: !!imagesLength })}
        ref={ref => this.wrap = ref}
      >
        <div className={styles.content}>
          <Icon type="close" onClick={this.closeModal} />
          {
            imagesLength ? <Carousel
              adaptiveHeight
              dots={false}
              arrows={images.length > 1}
              prevArrow={this.renderArrow('left')}
              nextArrow={this.renderArrow('right')}
              infinite={false}
              initialSlide={this.getInitialSlide()}
              afterChange={this.carouselAfterChange}
            >
              {Array.isArray(images) && images.map((img, imgIndex) => (
                <div className={styles.imgholder} key={img.src}>
                  <img src={img.src} alt=""
                       ref={ref => this.imgRef[imgIndex] = ref}
                       style={{ margin: mouseX !== 0 ? 0 : 'auto',
                         top: top + 'px',
                         left: left + 'px',
                         transform: `scale(${scale}) rotate(${(rotate) % 360}deg)`
                       }}
                       onMouseDown={this.handleMouseDown.bind(this, imgIndex)}
                  />
                </div>
              ))}
            </Carousel> : 'loading'
          }
          <div className={styles.toolbar}>
            <i onClick={this.changeScale}>
              <svg viewBox="64 64 896 896" className="" data-icon="zoom-in" width="1em" height="1em" fill="currentColor" aria-hidden="true">
                <path d="M637 443H519V309c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v134H325c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h118v134c0 4.4 3.6 8 8 8h60c4.4 0 8-3.6 8-8V519h118c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8zm284 424L775 721c122.1-148.9 113.6-369.5-26-509-148-148.1-388.4-148.1-537 0-148.1 148.6-148.1 389 0 537 139.5 139.6 360.1 148.1 509 26l146 146c3.2 2.8 8.3 2.8 11 0l43-43c2.8-2.7 2.8-7.8 0-11zM696 696c-118.8 118.7-311.2 118.7-430 0-118.7-118.8-118.7-311.2 0-430 118.8-118.7 311.2-118.7 430 0 118.7 118.8 118.7 311.2 0 430z"></path>
              </svg>
            </i>
            <i onClick={this.changeScale.bind(this, 'del')}>
              <svg viewBox="64 64 896 896" className="" data-icon="zoom-out" width="1em" height="1em" fill="currentColor" aria-hidden="true">
                <path d="M637 443H325c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h312c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8zm284 424L775 721c122.1-148.9 113.6-369.5-26-509-148-148.1-388.4-148.1-537 0-148.1 148.6-148.1 389 0 537 139.5 139.6 360.1 148.1 509 26l146 146c3.2 2.8 8.3 2.8 11 0l43-43c2.8-2.7 2.8-7.8 0-11zM696 696c-118.8 118.7-311.2 118.7-430 0-118.7-118.8-118.7-311.2 0-430 118.8-118.7 311.2-118.7 430 0 118.7 118.8 118.7 311.2 0 430z"></path>
              </svg>
            </i>
            <i onClick={this.roateHandler}>
              <svg viewBox="64 64 896 896" className="" data-icon="reload" width="1em" height="1em" fill="currentColor" aria-hidden="true">
                <path d="M909.1 209.3l-56.4 44.1C775.8 155.1 656.2 92 521.9 92 290 92 102.3 279.5 102 511.5 101.7 743.7 289.8 932 521.9 932c181.3 0 335.8-115 394.6-276.1 1.5-4.2-.7-8.9-4.9-10.3l-56.7-19.5a8 8 0 0 0-10.1 4.8c-1.8 5-3.8 10-5.9 14.9-17.3 41-42.1 77.8-73.7 109.4A344.77 344.77 0 0 1 655.9 829c-42.3 17.9-87.4 27-133.8 27-46.5 0-91.5-9.1-133.8-27A341.5 341.5 0 0 1 279 755.2a342.16 342.16 0 0 1-73.7-109.4c-17.9-42.4-27-87.4-27-133.9s9.1-91.5 27-133.9c17.3-41 42.1-77.8 73.7-109.4 31.6-31.6 68.4-56.4 109.3-73.8 42.3-17.9 87.4-27 133.8-27 46.5 0 91.5 9.1 133.8 27a341.5 341.5 0 0 1 109.3 73.8c9.9 9.9 19.2 20.4 27.8 31.4l-60.2 47a8 8 0 0 0 3 14.1l175.6 43c5 1.2 9.9-2.6 9.9-7.7l.8-180.9c-.1-6.6-7.8-10.3-13-6.2z"></path>
              </svg>
            </i>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  state => state.app.imageGallery,
  dispatch => {
    return {
      cancel: () => {
        dispatch({ type: 'app/viewImages', payload: [] });
      }
    };
  }
)(ImageGallery);

