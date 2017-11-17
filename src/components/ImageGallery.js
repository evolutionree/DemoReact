import React from 'react';
import { Modal, Carousel, Icon } from 'antd';
// import SlickCarousel from 'react-slick';
import { connect } from 'dva';
import _ from 'lodash';
import styles from './ImageGallery.less';

function ImageGallery({
    images,
    cancel
  }) {
  function renderArrow(dir) {
    return <span><Icon type={dir} /></span>;
  }
  function getInitialSlide() {
    if (images && images.length > 1) {
      const activeIndex = _.findIndex(images, ['active', true]);
      if (activeIndex !== -1) {
        return activeIndex;
      }
    }
    return 0;
  }
  return (
    <Modal
      className={styles.wrapper}
      title="查看图片"
      visible={!!(images && images.length)}
      footer={null}
      onCancel={cancel}
      width={560}
      key={new Date().getTime()}
    >
      <div className={styles.content}>
        {(images && images.length) ? (
          <Carousel
            adaptiveHeight
            dots={false}
            arrows={images.length > 1}
            prevArrow={renderArrow('left')}
            nextArrow={renderArrow('right')}
            infinite={false}
            initialSlide={getInitialSlide()}
          >
            {images.map(img => (
              <div className={styles.imgholder} key={img.src}>
                <img src={img.src} alt="" />
              </div>
            ))}
          </Carousel>
        ) : 'loading...'}
      </div>
    </Modal>
  );
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

