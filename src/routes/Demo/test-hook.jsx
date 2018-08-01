import React, { Component } from 'react';
import ReactDOM from "react-dom";
typeof window !== "undefined" && (window.React = React); // for devtools

const simpleHoc = WrappedComponent => {
  return class ExampleLayout extends Component {
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

  document.addEventListener('DOMContentLoaded', function() {
    const contentDiv = document.getElementById('content');
    const gridProps = window.gridProps || {};
    console.log('DOMContentLoaded');
  });
}


export default simpleHoc;
