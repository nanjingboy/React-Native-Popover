import React from 'react';
import PropTypes from 'prop-types';
import {
  View, FlatList, Modal, Dimensions, TouchableOpacity,
} from 'react-native';
import styles from './styles';

export default class Popover extends React.PureComponent {
  static propTypes = {
    style: PropTypes.object,
    arrowSize: PropTypes.number,
    popoverStyle: PropTypes.object,
    popoverOrientation: PropTypes.oneOf([
      'horizontal', 'vertical'
    ]),
    popoverMargin: PropTypes.shape({
      left: PropTypes.number,
      right: PropTypes.number,
    }),
    popoverSize: PropTypes.shape({
      width: PropTypes.number.isRequired,
      height: PropTypes.number.isRequired,
    }).isRequired,
    popoverItems: PropTypes.array.isRequired,
    onRenderPopoverItem: PropTypes.func.isRequired,
    popoverItemKeyExtractor: PropTypes.func.isRequired,
    anchorView: PropTypes.element.isRequired,
  }

  static defaultProps = {
    style: null,
    arrowSize: 6,
    popoverStyle: null,
    popoverOrientation: 'horizontal',
    popoverMargin: {
      left: 0,
      right: 0,
    }
  }

  state = {
    isPopoverShowing: false,
    anchorLayout: null,
    windowSize: null,
  }

  componentWillMount() {
    this.setState({
      windowSize: Dimensions.get('window'),
    });
  }

  _onAnchorLayout = () => {
  }

  _showPopover = () => {
    this.anchorViewRef.measureInWindow((x, y, width, height) => {
      this.setState({
        isPopoverShowing: true,
        anchorLayout: {
          x, y, width, height,
        },
      });
    });
  }

  _hidePopover = () => {
    this.setState({
      isPopoverShowing: false,
    });
  }

  _renderPopover() {
    const { isPopoverShowing } = this.state;
    if (!isPopoverShowing) {
      return null;
    }
    const { popoverSize, popoverStyle, arrowSize } = this.props;
    const { anchorLayout, windowSize } = this.state;
    let arrowType;
    let arrowTop;
    let popoverTop;
    const maxPopoverTop = anchorLayout.y + anchorLayout.height
                          + popoverSize.height + arrowSize * 2;
    if (maxPopoverTop > windowSize.height) {
      arrowType = 'downArrow';
      arrowTop = anchorLayout.y - arrowSize * 2;
      popoverTop = arrowTop - popoverSize.height;
    } else {
      arrowType = 'upArrow';
      arrowTop = anchorLayout.y + anchorLayout.height;
      popoverTop = arrowTop + arrowSize * 2;
    }
    let popoverLeft;
    let { width: popoverWidth } = popoverSize;
    if (popoverWidth >= windowSize.width) {
      popoverLeft = 0;
      popoverWidth = windowSize.width;
    } else {
      const { popoverMargin } = this.props;
      const maxPopoverLeft = windowSize.width - popoverWidth - popoverMargin.right;
      popoverLeft = anchorLayout.x + (anchorLayout.width - popoverWidth) / 2;
      if (popoverLeft < popoverMargin.left) {
        popoverLeft = popoverMargin.left;
      } else if (popoverLeft > maxPopoverLeft) {
        popoverLeft = maxPopoverLeft;
      }
    }
    const maxArrowLeft = popoverLeft + popoverWidth - arrowSize * 2;
    let arrowLeft = anchorLayout.x + anchorLayout.width / 2 - arrowSize;
    if (arrowLeft < popoverLeft) {
      arrowLeft = popoverLeft;
    } else if (arrowLeft > maxArrowLeft) {
      arrowLeft = maxArrowLeft;
    }
    const popoverFrameStyle = {
      ...{ ...popoverSize, width: popoverWidth },
      left: popoverLeft,
      top: popoverTop,
    };
    const arrowStyle = {
      ...styles[arrowType],
      borderWidth: arrowSize,
      left: arrowLeft,
      top: arrowTop,
    };
    if (popoverStyle !== null) {
      if (arrowType === "downArrow") {
        arrowStyle.borderTopColor = popoverStyle.backgroundColor || 'white';
      } else {
        arrowStyle.borderBottomColor = popoverStyle.backgroundColor || 'white';
      }
    }
    const { popoverItems, popoverItemKeyExtractor, onRenderPopoverItem, popoverOrientation } = this.props;
    return (
      <Modal
        transparent
        isVisible={isPopoverShowing}
        onRequestClose={this._hidePopover}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.overlay}
          onPress={this._hidePopover}
        >
          <View />
        </TouchableOpacity>
        <FlatList
          style={[styles.popover, popoverStyle, popoverFrameStyle]}
          horizontal={popoverOrientation === 'horizontal'}
          data={popoverItems}
          renderItem={({ item }) => onRenderPopoverItem(item, this._hidePopover)}
          keyExtractor={popoverItemKeyExtractor}
        />
        <View style={arrowStyle} />
      </Modal>
    );
  }

  render() {
    const { style, anchorView } = this.props;
    return (
      <View style={style}>
        <TouchableOpacity onPress={this._showPopover}>
          <View
            ref={(ref) => { this.anchorViewRef = ref; }}
            onLayout={this._onAnchorLayout}
          >
            {anchorView}
          </View>
        </TouchableOpacity>
        {this._renderPopover()}
      </View>
    );
  }
}
