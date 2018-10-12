import React from 'react';
import PropTypes from 'prop-types';
import {
  View, FlatList, Modal, Dimensions, TouchableOpacity,
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
      'horizontal', 'vertical'
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

  _parseArrowType() {
    const { anchorLayout, windowSize } = this.state;
    const { popoverSize, arrowSize, popoverMargin } = this.props;
    const maxPopoverTop = anchorLayout.y
                          + anchorLayout.height
                          + arrowSize * 2
                          + popoverSize.height
                          + popoverMargin.bottom;
    if (maxPopoverTop > windowSize.height) {
      const maxWindowSpace = windowSize.height - anchorLayout.y - anchorLayout.height;
      return anchorLayout.y > maxWindowSpace ? ARROW_DOWN : ARROW_UP;
    }
    return ARROW_UP;
  }

  _parsePopoverSize(arrowType) {
    const { anchorLayout, windowSize } = this.state;
    let { arrowSize, popoverSize: { width, height }, popoverMargin } = this.props;
    let maxWidth = windowSize.width - popoverMargin.left - popoverMargin.right;
    if (width <= 0 || width >= maxWidth) {
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
    }
  }

  _renderPopover() {
    const { isPopoverShowing } = this.state;
    if (!isPopoverShowing) {
      return null;
    }

    const arrowType = this._parseArrowType();
    const popoverSize = this._parsePopoverSize(arrowType);
    const { popoverMargin, arrowSize } = this.props;
    const { anchorLayout, windowSize } = this.state;

    let arrowTop;
    let popoverTop;
    if (arrowType === ARROW_DOWN) {
      arrowTop = anchorLayout.y - arrowSize * 2;
      popoverTop = arrowTop - popoverSize.height;
    } else {
      arrowTop = anchorLayout.y + anchorLayout.height;
      popoverTop = arrowTop + arrowSize * 2;
    }

    let popoverLeft;
    const maxPopoverLeft = windowSize.width - popoverSize.width - popoverMargin.right;
    popoverLeft = anchorLayout.x + (anchorLayout.width - popoverSize.width) / 2;
    if (popoverLeft < popoverMargin.left) {
      popoverLeft = popoverMargin.left;
    } else if (popoverLeft > maxPopoverLeft) {
      popoverLeft = maxPopoverLeft;
    }
    const maxArrowLeft = popoverLeft + popoverSize.width - arrowSize * 2;
    let arrowLeft = anchorLayout.x + anchorLayout.width / 2 - arrowSize;
    if (arrowLeft < popoverLeft) {
      arrowLeft = popoverLeft;
    } else if (arrowLeft > maxArrowLeft) {
      arrowLeft = maxArrowLeft;
    }
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
