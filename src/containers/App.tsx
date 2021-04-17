import React, { Component } from 'react';
import { Helmet } from 'react-helmet';

import ImageMapEditor from '../components/imagemap/ImageMapEditor';
import Title from './Title';
import FlowContainer from './FlowContainer';

type EditorType = 'imagemap' | 'workflow' | 'flow' | 'hexgrid';

interface IState {
  activeEditor?: EditorType;
}

class App extends Component<any, IState> {
  state: IState = {
    activeEditor: 'imagemap',
  };

  onChangeMenu = ({ key }) => {
    this.setState({
      activeEditor: key,
    });
  };

  renderEditor = (activeEditor: EditorType) => {
    switch (activeEditor) {
      case 'imagemap':
        console.log('imagemap');
        return <ImageMapEditor />;
    }
  };

  render() {
    const { activeEditor } = this.state;
    return (
      <div className="rde-main">
        <div className="rde-title">
          <Title onChangeMenu={this.onChangeMenu} current={activeEditor} />
        </div>
        <FlowContainer>
          <div className="rde-content">{this.renderEditor(activeEditor)}</div>
        </FlowContainer>
      </div>
    );
  }
}

export default App;
