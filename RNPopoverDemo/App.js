import React, { Component } from 'react';
import { Text, View } from 'react-native';
import Popover from 'rn-popover';

export default class App extends Component {

  state = {
    justifyContent: 'flex-start',
  }

  _onRenderHorizontalPopoverItem = (item) => {
    return <Text style={{ width: 25, textAlign: 'center' }}>{item}</Text>
  }

  _onRenderVorizontalPopoverItem = (item) => {
    return <Text style={{ height: 30, textAlign: 'center' }}>{item}</Text>
  }

  _changeJustifyContent = () => {
    const { justifyContent } = this.state;
    if (justifyContent === 'flex-start') {
      this.setState({
        justifyContent: 'flex-end',
      });
    } else {
      this.setState({
        justifyContent: 'flex-start',
      });
    }
  }

  render() {
    const { justifyContent } = this.state;
    return (
      <View style={{flex: 1, margin: 10, marginTop: 100 }}>
        <Text
          style={{ width: 180, height: 20, backgroundColor: 'gray', textAlign: 'center' }}
          onPress={this._changeJustifyContent}
        >
          Change JustifyContent
        </Text>
        <View style={{ flex: 1, marginTop: 20, justifyContent }}>
          <Popover
            style={{ width: 100, height: 20, backgroundColor: 'gray' }}
            popoverSize={{ width: 100, height: 30 }}
            anchorView={<Text style={{textAlign: 'center'}}>Horizontal</Text>}
            popoverItems={[1, 2, 3, 4, 5]}
            popoverItemKeyExtractor={item => `${item}`}
            onRenderPopoverItem={this._onRenderHorizontalPopoverItem}
          />
          <Popover
            style={{ width: 100, height: 20, marginTop: 20, backgroundColor: 'gray' }}
            popoverSize={{ width: 100, height: 30 }}
            popoverOrientation='vertical'
            anchorView={<Text style={{textAlign: 'center'}}>Vertical</Text>}
            popoverItems={[1, 2, 3, 4, 5]}
            popoverItemKeyExtractor={item => `${item}`}
            onRenderPopoverItem={this._onRenderVorizontalPopoverItem}
          />
        </View>
      </View>
    );
  }
}