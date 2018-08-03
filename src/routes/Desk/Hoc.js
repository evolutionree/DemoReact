import React, { Component } from 'react';

const simpleHoc = WrappedComponent => {
  return class extends Component {
    state = { layout: [] };

    onLayoutChange = layout => {
      this.setState({ layout: layout });
    };

    stringifyLayout() {
      return this.state.layout.map(function(l) {
        return (
          <div className="layoutItem" key={l.i}>
            <b>{l.i}</b>: [{l.x}, {l.y}, {l.w}, {l.h}]
          </div>
        );
      });
    }

    render() {
      return (
        <div>
          <div className="layoutJSON">
            Displayed as <code>[x, y, w, h]</code>:
            <div className="columns">{this.stringifyLayout()}</div>
          </div>
          <WrappedComponent onLayoutChange={this.onLayoutChange} {...this.props} />
        </div>
      );
    }
  }
}

export default simpleHoc;
