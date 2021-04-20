import React, { Component } from 'react';
import { Button, Menu, Tooltip, Modal } from 'antd';
import PropTypes from 'prop-types';
import i18n from 'i18next';

import { Flex } from '../components/flex';
import Icon from '../components/icon/Icon';
import { ShortcutHelp } from '../components/help';

class Title extends Component {
  static propTypes = {
    currentMenu: PropTypes.string,
    onChangeMenu: PropTypes.func,
  };

  state = {
    visible: false,
  };

  componentDidMount() {
    if (window) {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    }
  }

  handlers = {
    goGithub: () => {
      window.open('https://github.com/salgum1114/react-design-editor');
    },
    goDocs: () => {
      window.open('https://salgum1114.github.io/react-design-editor/docs');
    },
    showHelp: () => {
      this.setState({
        visible: true,
      });
    },
  };

  render() {
    const { visible } = this.state;
    return (
      <Flex
        style={{
          height: '48px !important',
          background: 'linear-gradient(141deg,#23303e,#404040 51%,#23303e 75%)',
        }}
        flexWrap="wrap"
        flex="1"
        alignItems="center"
        height="48px"
      >
        <Flex style={{ marginLeft: 8 }} flex="0 1 auto">
          <span style={{ color: '#fff', fontSize: 20, fontWeight: 500 }}>Husble</span>
        </Flex>
      </Flex>
    );
  }
}

export default Title;
