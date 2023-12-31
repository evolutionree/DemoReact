/**
 * Created by 0291 on 2018/6/1.
 */
import React, { PropTypes, Component } from 'react';
import { Badge } from 'antd';
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
                    <div>{item.date}</div>
                  </div>
                  <div className={styles.fr}>
                    {
                      item.msglist instanceof Array && item.msglist.map((mesItem, mesIndex) => {
                        return <div key={mesIndex}><span>{mesItem.reccreator_name}：</span><span>
                          { ////聊天内容类型 ： 1文字  2图片  3录音 4位置 5文件
                            mesItem.contype === 1 ? mesItem.chatcon : ['发送一张图片', '发送一条录音', '发送了一个位置', '发送了一个文件'][mesItem.contype - 2]
                          }
                        </span></div>;
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
