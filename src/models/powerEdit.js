export default {
  namespace: 'powerEdit',
  state: {
    modalVisible: false,
    initContent: '',
    callback: null
  },
  subscriptions: {},
  effects: {

  },
  reducers: {
    editJson(state, { payload }) {
      return {
        ...state,
        modalVisible: true,
        initContent: payload.content,
        callback: payload.callback
      };
    },
    editSubmit(state, { payload: content }) {
      if (state.callback) state.callback(content);
      return {
        ...state,
        modalVisible: false,
        initContent: '',
        callback: null
      };
    },
    editCancel(state) {
      return {
        ...state,
        modalVisible: false,
        initContent: '',
        callback: null
      };
    }
  }
};
