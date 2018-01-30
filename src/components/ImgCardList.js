/**
 * Created by 0291 on 2017/9/18.
 */
import React, { PropTypes } from 'react';
import { Icon } from 'antd';
import Styles from './ImgCardList.less';

class ImgCardList extends React.Component {
  static propTypes = {
    dataSouce: PropTypes.array,
    value: PropTypes.any,
    addClick: PropTypes.func
  };
  static defaultProps = {

  };

  constructor(props) {
    super(props);
    this.state = {
      isShowDel: false
    };
  }

  componentWillReceiveProps(nextProps) {

  }

  showDelUserIcon() {
    if (this.props.isReadOnly) {
      return false;
    }
    this.setState({
      isShowDel: true
    });
  }

  delUser(allSelectUser, delUser) {
    if (this.props.isReadOnly) {
      return false;
    }
    const currentSelectUser = allSelectUser.filter(item => item.userid !== delUser.userid);
    this.props.delUser && this.props.delUser(currentSelectUser.map((item) => {
      return {
        name: item.username,
        id: item.userid,
        deptname: item.deptname
      };
    }));
  }

  addUser() {
    if (this.props.isReadOnly) {
       return false;
    }
    this.setState({
      isShowDel: false
    });
    this.props.addClick && this.props.addClick();
  }
  render() {
    const selectUser = this.props.dataSouce.filter((item) => {
      if ((',' + this.props.value + ',').indexOf(',' + item.userid + ',') > -1) {
        return item;
      }
    });

    let operateHtml = [];
    operateHtml.push(
      <div key='add' className={Styles.operateBtnWrap} onClick={this.addUser.bind(this)} style={{ opacity: this.props.isReadOnly ? 0.4 : 1, cursor: this.props.isReadOnly ? 'auto' : 'pointer' }}>
        <span className={Styles.operateBtn}>+</span>
      </div>
    );

    operateHtml.push(
      <div key='reducer' className={Styles.operateBtnWrap} onClick={this.showDelUserIcon.bind(this)} style={{ opacity: this.props.isReadOnly ? 0.4 : 1, cursor: this.props.isReadOnly ? 'auto' : 'pointer'  }}>
        <span className={Styles.operateBtn}>-</span>
      </div>
    );

    return (
      <div>
        {
          selectUser && selectUser.map((item, index) => {
            return (
              <div className={Styles.imgCardList} key={index}>
                <img src={'/api/fileservice/read?fileid=' + item.usericon + '&filetype=1'}
                     alt="图片"
                     onError={e => e.target.src = '/img_img_card.png'} />
                <span title={item.username}>{item.username}</span>
                <span className={Styles.dot} style={{ opacity: this.state.isShowDel ? 1 : 0 }} onClick={this.delUser.bind(this, selectUser, item)}><Icon type="close" /></span>
              </div>
            );
          })
        }
        {
          this.props.view ? null : operateHtml
        }
      </div>
    );
  }
}


ImgCardList.View = ({ dataSouce, value }) => {
  return (
    <ImgCardList dataSouce={dataSouce} value={value} view={true} />
  );
};

export default ImgCardList;
