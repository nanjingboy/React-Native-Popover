import React from 'react';
import PropTypes from 'prop-types';
import {
  View, FlatList, Modal, Platform, Dimensions, StatusBar, TouchableOpacity,
} from 'react-native';
import styles from './styles';

const ARROW_UP = 'upArrow';
const ARROW_DOWN = 'downArrow';

export default class Popover extends React.PureComponent {
  static propTypes = {
    style: PropTypes.object,
    arrowSize: PropTypes.number,
    popoverBgColor: PropTypes.string,
    popoverOrientation: PropTypes.oneOf([
      'horizontal', 'vertical',
    ]),
    popoverMargin: PropTypes.shape({
      top: PropTypes.number.isRequired,
      right: PropTypes.number.isRequired,
      bottom: PropTypes.number.isRequired,
      left: PropTypes.number.isRequired,
    }),
    popoverSize: PropTypes.shape({
      width: PropTypes.number.isRequired,
      height: PropTypes.number.isRequired,
    }),
    popoverItems: PropTypes.array.isRequired,
    onRenderPopoverItem: PropTypes.func.isRequired,
    popoverItemKeyExtractor: PropTypes.func.isRequired,
    anchorView: PropTypes.element.isRequired,
  }

  static defaultProps = {
    style: null,
    arrowSize: 6,
    popoverBgColor: 'white',
    popoverOrientation: 'horizontal',
    popoverMargin: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    popoverSize: {
      width: 0,
      height: 0,
    },
  }

  constructor() {
    super(...arguments);
    this.state = {
      isPopoverShowing: false,
      popoverLayout: null,
      anchorLayout: null,
      windowSize: this.getWindowSize(),
    };
  }

  getWindowSize() {
    const { width, height } = Dimensions.get('window');
    return {
      width,
      height: Platform.OS === 'android' ? height - StatusBar.currentHeight : height,
    };
  }

  _onAnchorLayout = () => {
  }

  _showPopover = () => {
    this.anchorViewRef.measureInWindow((x, y, width, height) => {
      if (this._isAnchorLayoutChanged(x, y, width, height)) {
        this.setState({
          isPopoverShowing: true,
          anchorLayout: {
            x, y, width, height,
          },
          popoverLayout: this._parsePopoverLayout({
            x, y, width, height,
          }),
        });
      } else {
        this.setState({
          isPopoverShowing: true,
        });
      }
    });
  }

  _hidePopover = () => {
    this.setState({
      isPopoverShowing: false,
    });
  }

  _isAnchorLayoutChanged(x, y, width, height) {
    const { anchorLayout } = this.state;
    if (anchorLayout === null) {
      return true;
    }
    const {
      x: currentX, y: currentY, width: currentWidth, height: currentHeight,
    } = anchorLayout;
    return currentX !== x || currentY !== y || currentWidth !== width || currentHeight !== height;
  }

  _parseArrowType(anchorLayout) {
    const { windowSize } = this.state;
    const { popoverSize, arrowSize, popoverMargin } = this.props;
    const anchorBottom = anchorLayout.y + anchorLayout.height;
    const maxPopoverTop = anchorBottom + arrowSize * 2 + popoverSize.height + popoverMargin.bottom;
    if (maxPopoverTop > windowSize.height) {
      const maxWindowSpace = windowSize.height - anchorBottom;
      return anchorLayout.y > maxWindowSpace ? ARROW_DOWN : ARROW_UP;
    }
    return ARROW_UP;
  }

  _parsePopoverSize(arrowType, anchorLayout) {
    const { windowSize } = this.state;
    const { arrowSize, popoverSize, popoverMargin } = this.props;
    const maxWidth = windowSize.width - popoverMargin.left - popoverMargin.right;
    let { width, height } = popoverSize;
    if (width <= 0 || width > maxWidth) {
      width = maxWidth;
    }
    let maxHeight;
    if (arrowType === ARROW_DOWN) {
      maxHeight = anchorLayout.y - popoverMargin.top - arrowSize * 2;
    } else {
      maxHeight = windowSize.height
                  - anchorLayout.y
                  - anchorLayout.height
                  - arrowSize * 2
                  - popoverMargin.bottom;
    }
    if (height >= maxHeight) {
      height = maxHeight;
    }
    return {
      width,
      height,
    };
  }

  _parsePopoverLayout(anchorLayout) {
    const arrowType = this._parseArrowType(anchorLayout);
    const popoverSize = this._parsePopoverSize(arrowType, anchorLayout);
    const { windowSize } = this.state;
    const { popoverMargin, arrowSize } = this.props;
    let arrowTop;
    let popoverTop;
    if (arrowType === ARROW_DOWN) {
      arrowTop = anchorLayout.y - arrowSize * 2;
      popoverTop = arrowTop - popoverSize.height;
    } else {
      arrowTop = anchorLayout.y + anchorLayout.height;
      popoverTop = arrowTop + arrowSize * 2;
    }

    let popoverLeft = anchorLayout.x + (anchorLayout.width - popoverSize.width) / 2;
    const maxPopoverLeft = windowSize.width - popoverSize.width - popoverMargin.right;
    if (popoverLeft < popoverMargin.left) {
      popoverLeft = popoverMargin.left;
    } else if (popoverLeft > maxPopoverLeft) {
      popoverLeft = maxPopoverLeft;
    }
    let arrowLeft = anchorLayout.x + anchorLayout.width / 2 - arrowSize;
    const maxArrowLeft = popoverLeft + popoverSize.width - arrowSize * 2;
    if (arrowLeft < popoverLeft) {
      arrowLeft = popoverLeft;
    } else if (arrowLeft > maxArrowLeft) {
      arrowLeft = maxArrowLeft;
    }
    return {
      arrowType,
      arrowTop,
      arrowLeft,
      popoverTop,
      popoverLeft,
      popoverSize,
    };
  }

  _renderPopover() {
    const { isPopoverShowing } = this.state;
    if (!isPopoverShowing) {
      return null;
    }

    const { arrowSize } = this.props;
    const {
      popoverLayout: {
        arrowType, arrowTop, arrowLeft, popoverLeft, popoverTop, popoverSize,
      },
    } = this.state;

    const popoverFrameStyle = {
      top: popoverTop,
      left: popoverLeft,
      ...{ ...popoverSize, height: popoverSize.height > 0 ? popoverSize.height : null },
    };
    const arrowStyle = {
      ...styles[arrowType],
      borderWidth: arrowSize,
      left: arrowLeft,
      top: arrowTop,
    };

    const { popoverBgColor } = this.props;
    if (arrowType === ARROW_DOWN) {
      arrowStyle.borderTopColor = popoverBgColor;
    } else {
      arrowStyle.borderBottomColor = popoverBgColor;
    }
    const {
      popoverItems, popoverItemKeyExtractor, onRenderPopoverItem, popoverOrientation,
    } = this.props;
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
          style={[styles.popover, popoverFrameStyle]}
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
