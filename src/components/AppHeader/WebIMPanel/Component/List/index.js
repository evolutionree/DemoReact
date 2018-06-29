/**
 * Created by 0291 on 2018/6/1.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Dropdown, Menu, Modal, Icon } from 'antd';
import classnames from 'classnames';
import Avatar from '../../../../Avatar';
import styles from './index.less';


class List extends Component {
  static propTypes = {
    onClick: PropTypes.func,
    dataSource: PropTypes.array
  };
  static defaultProps = {

  };
  constructor(props) {
    super(props);
    this.state = {

    };
  }
  componentWillReceiveProps(nextProps) {

  }

  contextMenuHandler = (event) => {
    event.preventDefault();
    let pageX = event.pageX ? event.pageX : (event.clientX + (document.body.scrollLeft || document.documentElement.scrollLeft));
    let pageY = event.pageY ? event.pageY : (event.clientY + (document.body.scrollTop || document.documentElement.scrollTop));

    if (pageX + 160 > document.documentElement.clientWidth) {
      pageX = document.documentElement.clientWidth - 180;
    }

    this.props.onContextMenu && this.props.onContextMenu(pageX, pageY, );
  }

  listClickHandler = () => {
    this.props.onClick && this.props.onClick();
  }

  render() {
    const { dataSource } = this.props;
    return (
      <div>
        <ul className={styles.listWrap}>
          {
            dataSource instanceof Array && dataSource.map(item => {
              return (
                <li onContextMenu={this.contextMenuHandler} onClick={this.listClickHandler}>
                  <div className={styles.contactAvatar}>
                    <Avatar image={`/api/fileservice/read?fileid=${item.chaticon}`} width={30} />
                  </div>
                  <div className={styles.fl}>
                    <div>{item.chatname}</div>
                    <div>{item.recentlydate}</div>
                  </div>
                  <div className={styles.fr}>
                    {
                      item.msglist instanceof Array && item.msglist.map(mesItem => {
                        return <div>陈晓明：明天有时间吗？我准备和你去拜访一</div>;
                      })
                    }
                  </div>
                </li>
              );
            })
          }
        </ul>
      </div>
    );
  }
}

export default List;
