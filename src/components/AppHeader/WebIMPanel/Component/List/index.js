/**
 * Created by 0291 on 2018/6/1.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Dropdown, Menu, Modal, Icon, Badge } from 'antd';
import classnames from 'classnames';
import Avatar from '../../../../Avatar';
import styles from './index.less';


class List extends Component {
  static propTypes = {
    onClick: PropTypes.func,
    dataSource: PropTypes.array,
    spotMsg: PropTypes.array,
    spotLayout: PropTypes.string
  };
  static defaultProps = {
    spotMsg: []
  };
  constructor(props) {
    super(props);
    this.state = {

    };
  }
  componentWillReceiveProps(nextProps) {

  }

  contextMenuHandler = (data, event) => {
    event.preventDefault();
    let pageX = event.pageX ? event.pageX : (event.clientX + (document.body.scrollLeft || document.documentElement.scrollLeft));
    let pageY = event.pageY ? event.pageY : (event.clientY + (document.body.scrollTop || document.documentElement.scrollTop));

    if (pageX + 160 > document.documentElement.clientWidth) {
      pageX = document.documentElement.clientWidth - 180;
    }

    this.props.onContextMenu && this.props.onContextMenu(pageX, pageY, data);
  }

  listClickHandler = (data) => {
    this.props.onClick && this.props.onClick(data);
  }

  render() {
    const { dataSource, spotLayout, spotNewMsgList } = this.props;
    console.log(dataSource)
    return (
      <div>
        <ul className={styles.listWrap}>
          {
            dataSource instanceof Array && dataSource.map((item, index) => {
              const spotMsgCount = spotNewMsgList && spotNewMsgList[item.chatid]
              return (
                <li onContextMenu={this.contextMenuHandler.bind(this, item)} onClick={this.listClickHandler.bind(this, item)} key={index}>
                  <div className={styles.contactAvatar}>
                    {
                      spotLayout === 'start' ? <Badge count={spotMsgCount}>
                        <Avatar image={`/api/fileservice/read?fileid=${item.chaticon}`} width={30} />
                      </Badge> : <Avatar image={`/api/fileservice/read?fileid=${item.chaticon}`} width={30} />
                    }
                  </div>
                  <div className={styles.fl}>
                    <div>{item.chatname}</div>
                    <div>{item.recentlydate}</div>
                  </div>
                  <div className={styles.fr}>
                    {
                      item.msglist instanceof Array && item.msglist.map((mesItem, mesIndex) => {
                        return <div key={mesIndex}>{mesItem.reccreator_name}：{mesItem.chatcon}</div>;
                      })
                    }
                  </div>
                  <div className={styles.badgeWrap} style={{ display: spotLayout === 'end' ? 'block' : 'none' }}>
                    <Badge count={spotMsgCount} />
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
