import React, { Component } from 'react';
import PropTypes from 'prop-types';
import strategy from 'emojione/emoji.json';
import createEmojisFromStrategy from '../../utils/createEmojisFromStrategy';
import defaultEmojiGroups from '../../constants/defaultEmojiGroups';
import Popover from './Popover';

export default class EmojiSelect extends Component {
  static propTypes = {
    cacheBustParam: PropTypes.string.isRequired,
    imagePath: PropTypes.string.isRequired,
    imageType: PropTypes.string.isRequired,
    theme: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired,
    selectGroups: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string.isRequired,
        icon: PropTypes.oneOfType([PropTypes.element, PropTypes.string])
          .isRequired,
        categories: PropTypes.array // PropTypes.arrayOf(PropTypes.oneOf(Object.keys(emojis)))
          .isRequired,
      })
    ),
    selectButtonContent: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.string,
    ]),
    toneSelectOpenDelay: PropTypes.number,
    useNativeArt: PropTypes.bool,
  };

  static defaultProps = {
    selectButtonContent: '☺',
    selectGroups: defaultEmojiGroups,
    toneSelectOpenDelay: 500,
    emojiMap: strategy,
    emojis: createEmojisFromStrategy(strategy),
  };

  // Start the selector closed
  state = {
    isOpen: false,
    openUp: false,
    openRight: false,
  };

  selectorRef = null;
  popoverRef = null;

  // When the selector is open and users click anywhere on the page,
  // the selector should close
  componentDidMount() {
    document.addEventListener('click', this.onOutsideClick);
    this.evaluatePosition();

    const { open } = this.props,
      { isOpen } = this.state;
    if(open && !isOpen) {
      this.setState({isOpen: open});
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { isOpen } = this.state,
      hasOpenChanged = isOpen !== prevState.isOpen,
      { open } = this.props;

    if(isOpen && hasOpenChanged) {
      this.evaluatePosition();
    }

    if(open && open !== prevProps.open && !isOpen) {
      this.setState({isOpen: open});
    }
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.onOutsideClick);
  }

  // Toggle the popover
  togglePopover = () => {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  };

  // Close the popover
  closePopover = () => {
    if (this.state.isOpen) {
      this.setState({
        isOpen: false,
      });
    }
  };

  onOutsideClick = (e) => {
    if (this.popoverRef && !this.popoverRef.contains(e.target) &&
      this.selectorRef && !this.selectorRef.contains(e.target)) {
      // Ignore clicks inside popover or on selector
      this.closePopover();
    }
  };

  evaluatePosition = () => {
    if(this.selectorRef) {
      const viewportOffset = this.selectorRef.getBoundingClientRect();

      const topOffset = viewportOffset.top,
        bottomOffset = window.innerHeight - viewportOffset.bottom,
        leftOffset = viewportOffset.left,
        rightOffset = window.innerWidth - viewportOffset.right;

      this.setState({
        openUp: topOffset > bottomOffset,
        openRight: rightOffset > leftOffset,
      })
    }
  }

  render() {
    const {
      cacheBustParam,
      imagePath,
      imageType,
      theme = {},
      store,
      selectGroups,
      selectButtonContent,
      toneSelectOpenDelay,
      useNativeArt,
      emojiMap,
      emojis,
      customEmojis,
      onEmojiSelect,
    } = this.props;
    const buttonClassName = this.state.isOpen
      ? theme.emojiSelectButtonPressed
      : theme.emojiSelectButton;

    return (
      <div className={theme.emojiSelect}>
        <button
          className={buttonClassName}
          onMouseUp={this.togglePopover}
          type="button"
          ref={node => (this.selectorRef = node)}
        >
          {selectButtonContent}
        </button>
        <div ref={node => (this.popoverRef = node)}>
          {this.state.isOpen && (
            <Popover
              cacheBustParam={cacheBustParam}
              imagePath={imagePath}
              imageType={imageType}
              theme={theme}
              store={store}
              groups={selectGroups}
              emojiMap={emojiMap}
              emojis={emojis}
              toneSelectOpenDelay={toneSelectOpenDelay}
              isOpen={this.state.isOpen}
              openUp={this.state.openUp}
              openRight={this.state.openRight}
              onClose={this.closePopover}
              useNativeArt={useNativeArt}
              customEmojis={customEmojis}
              onEmojiSelect={onEmojiSelect}
            />
          )}
        </div>
      </div>
    );
  }
}
