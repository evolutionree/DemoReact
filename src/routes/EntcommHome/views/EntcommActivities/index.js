import React from 'react';
import { connect } from 'dva';
import { Icon } from 'antd';
import ActivityBoard from '../../../../components/ActivityBoard';
import FoldBox from '../../../../components/FoldBox';
import ImgCard from '../../../../components/ImgCard';
import PluginAddModal from './PluginAddModal';
import DynamicDetailModal from './DynamicDetailModal';
import styles from './styles.less';

function getItemDay(item) {
  if (!item) return '';
  if (!item.reccreated) return '';
  return item.reccreated.slice(0, 10);
}

function EntcommActivities({
    list,
    total,
    comment,
    like,
    showDynamicDetail,
    plugins,
    pluginAdd,
    loadMoreHandler
  }) {
  return (
    <div className={styles.container}>
      <PluginAddModal />
      {!!(plugins && plugins.length) && <FoldBox showToggle style={{ marginBottom: '15px', zIndex: 2 }}>
        {plugins && plugins.map((plugin, index) => {
          return (
            <ImgCard
              key={plugin.name}
              img={`/api/fileservice/read?fileid=${plugin.icon}&filetype=1`}
              onClick={pluginAdd.bind(null, index)}
              label={plugin.name}
            />
          );
        })}
      </FoldBox>}
      {list.map((item, index) => {
        const currDay = getItemDay(item);
        const prevDay = getItemDay(list[index - 1]);
        const renderNewDay = () => currDay && currDay !== prevDay && (
          <div className={styles.newday}>
            <span>{currDay}</span>
          </div>
        );

        if (item.dynamictype === 2) {
          const user = {
            id: item.reccreator,
            name: item.reccreator_name,
            icon: item.usericon
          };
          const comments = item.commentlist && item.commentlist.map(comm => ({
            id: comm.commentsid,
            user: {
              id: +comm.reccreator,
              name: comm.reccreator_name,
              icon: comm.reccreator_icon
            },
            time: comm.reccreated,
            content: comm.comments
          }));
          if (!item.tempcontent) {
            return null;
          }
          return (
            <div className={styles.actbox} key={item.dynamicid}>
              {renderNewDay()}
              <ActivityBoard
                title={item.entityname}
                time={item.reccreated}
                user={user}
                template={item.tempcontent}
                templateData={item.tempdata}
                likes={item.praiseusers}
                comments={comments || []}
                onLike={like.bind(null, item.dynamicid)}
                onComment={comment.bind(null, item.dynamicid)}
                onShowDetail={showDynamicDetail.bind(null, item)}
              />
            </div>
          );
        }
        return (
          <div className={styles.actbox} key={item.dynamicid}>
            {renderNewDay()}
            <div className={styles.acttip}>
              <Icon className={styles.icon} type="info-circle" />
              <p className={styles.title}>
                <span>{item.reccreator_name}</span>
              </p>
              <p className={styles.content}>{item.content} </p>
              <time className={styles.time}>{item.reccreated}</time>
            </div>
          </div>
        );
      })}
      {
        list.length === 0
          ? null
          : list.length === total
            ? <div className={styles.loadInfo}>没有更多数据加载了哦</div>
            : <div className={styles.loadMore} onClick={loadMoreHandler}>点击加载更多...</div>
      }
      <DynamicDetailModal />
    </div>
  );
}

export default connect(
  state => state.entcommActivities,
  dispatch => {
    return {
      like(id) {
        dispatch({ type: 'entcommActivities/like', payload: id });
      },
      comment(id, content) {
        dispatch({ type: 'entcommActivities/comment', payload: { id, content } });
      },
      pluginAdd(pluginIndex) {
        dispatch({ type: 'entcommActivities/pluginAdd', payload: pluginIndex });
      },
      showDynamicDetail(item) {
        dispatch({ type: 'entcommActivities/showDynamicDetail', payload: item });
      },
      loadMoreHandler() {
        dispatch({ type: 'entcommActivities/loadMore__' });
      }
    };
  }
)(EntcommActivities);
