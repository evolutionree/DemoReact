import React, { PropTypes, Component } from 'react'
import { connect } from 'dva'
import { Button, Modal } from 'antd'
import ActivityBoard from '../../components/ActivityBoard'
import RecordDetailModal from './RecordDetailModal'

class DynamicDetailModal extends React.Component {
  static propTypes = {
    visible: React.PropTypes.bool,
    onCancel: React.PropTypes.func
  }
  static defaultProps = {
    visible: false
  }

  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    const { data: item } = this.props
    const user = {
      id: item.reccreator,
      name: item.reccreator_name,
      icon: item.usericon
    }

    const comments = item.commentlist
      ? item.commentlist.map(comm => ({
        id: comm.commentsid,
        user: {
          id: +comm.reccreator,
          name: comm.reccreator_name,
          icon: comm.reccreator_icon
        },
        time: comm.reccreated,
        content: comm.comments
      }))
      : []

    return (
      <div>
        <Modal
          title={item.entityname}
          width={600}
          visible={this.props.visible}
          onCancel={this.props.onCancel}
          footer={null}
        >
          {Object.keys(item).length ? (
            <ActivityBoard
              title={item.entityname}
              time={item.reccreated}
              user={user}
              template={item.tempcontent}
              templateData={item.tempdata}
              likes={item.praiseusers}
              comments={comments}
              onLike={this.props.like.bind(null, item.dynamicid)}
              onComment={this.props.comment.bind(null, item.dynamicid)}
              onShowDetail={this.props.showDynamicDetail.bind(null, item)}
            />
          ) : null}
        </Modal>
        <RecordDetailModal />
      </div>
    )
  }
}

export default connect(
  state => {
    const { showModals, detailData } = state.entcommDynamic
    return {
      visible: /detail/.test(showModals),
      data: detailData
    }
  },
  dispatch => {
    return {
      onCancel () {
        dispatch({ type: 'entcommDynamic/showModals', payload: '' })
      },
      like (id) {
        dispatch({ type: 'entcommDynamic/like', payload: id })
      },
      comment (id, content) {
        dispatch({ type: 'entcommDynamic/comment', payload: { id, content } })
      },
      showDynamicDetail (item) {
        dispatch({ type: 'entcommDynamic/showDynamicDetail', payload: item })
      }
    }
  }
)(DynamicDetailModal)
