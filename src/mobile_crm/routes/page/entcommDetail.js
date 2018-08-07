import React from 'react';
import { connect } from 'dva';
import { Collapse } from 'antd';
import styles from './entcommDetail.less';

const Panel = Collapse.Panel;
class DetailInfo extends React.Component {
  static propTypes = {

  };
  static defaultProps = {

  };

  constructor(props) {
    super(props);
    this.state = {

    };
  }
  componentDidMount() {
    this.openLaunchApp(this.props.launchAppUUid);
  }

  componentWillReceiveProps(nextProps) {
    this.openLaunchApp(nextProps.launchAppUUid);
  }

  openLaunchApp = (launchAppUUid) => {
    if (dd && dd.ios) { //ios
      dd.biz.navigation.setRight({
        show: true,//控制按钮显示， true 显示， false 隐藏， 默认true
        control: true,//是否控制点击事件，true 控制，false 不控制， 默认false
        text: '打开APP',//控制显示文本，空字符串表示显示默认文本
        onSuccess : (result) => {
          dd.device.launcher.launchApp({
            app: `uk100://?parameter=${launchAppUUid}`, //iOS:应用scheme;Android:应用包名 uk100://?parameter=xxxx net.xtion.crm.uk100.rq
            onSuccess : function(data) {
              alert(JSON.stringify(data));
            },
            onFail : function(err) {
              alert(JSON.stringify(err));
            }
          });
        },
        onFail : function(err) {}
      });
    }
  }

  callback = (name) => {
    console.log(name);
  }

  render() {
    const { recordDetail, detailProtocol } = this.props;

    const visibleField = [24, 30, 22, 15];
    const protocol = detailProtocol instanceof Array && detailProtocol.filter(item => visibleField.indexOf(item.controltype) === -1);
    // 处理分组
    const noGroupFields = [];
    const groups = [];
    let lastGroup = null;
    protocol instanceof Array && protocol.forEach((field, index) => {
      if (field.controltype === 20) {
        lastGroup = {
          title: field.displayname,
          foldable: field.fieldconfig.foldable === 1,
          fields: []
        };
        groups.push(lastGroup);
        return;
      }
      if (lastGroup) {
        lastGroup.fields.push(field);
      } else {
        noGroupFields.push(field);
      }
    });

    return (
      <div className={styles.detailPage}>
        <ul className={styles.ulWrap}>
          {
            noGroupFields.map(item => {
              return (
                <li key={item.fieldid}>
                  <div>{item.displayname}</div>
                  <div>{recordDetail[item.fieldname + '_name'] || recordDetail[item.fieldname] }</div>
                </li>
              );
            })
          }
        </ul>
        <Collapse defaultActiveKey={['0']} onChange={this.callback}>
          {groups.map((group, groupIndex) => (
            <Panel header={group.title} key={groupIndex}>
              <ul className={styles.ulWrap}>
                {
                  group.fields.map(fieldItem => {
                    return (
                      <li key={fieldItem.fieldid}>
                        <div>{fieldItem.displayname}</div>
                        <div>{recordDetail[fieldItem.fieldname + '_name'] || recordDetail[fieldItem.fieldname] || '(空)' }</div>
                      </li>
                    );
                  })
                }
              </ul>
            </Panel>
          ))}
        </Collapse>
      </div>
    );
  }
}

export default connect(
  state => state.entcommdetail,
)(DetailInfo);
