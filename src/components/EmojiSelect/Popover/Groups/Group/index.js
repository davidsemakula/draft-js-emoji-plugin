import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Entry from '../../Entry';

export default class Group extends Component {
  static propTypes = {
    cacheBustParam: PropTypes.string.isRequired,
    imagePath: PropTypes.string.isRequired,
    imageType: PropTypes.string.isRequired,
    theme: PropTypes.object.isRequired,
    group: PropTypes.object.isRequired,
    emojis: PropTypes.object.isRequired,
    checkMouseDown: PropTypes.func.isRequired,
    onEmojiSelect: PropTypes.func.isRequired,
    onEmojiMouseDown: PropTypes.func.isRequired,
    useNativeArt: PropTypes.bool,
    isActive: PropTypes.bool,
  };

  state = {
    hasRenderedEmoji: false,
  };

  shouldComponentUpdate = nextProps => {
    if(this.props.query !== nextProps.query || this.props.isActive !== nextProps.isActive) {
      return true;
    }

    if (this.state.hasRenderedEmoji) {
      return false;
    }

    return nextProps.isActive || nextProps.query;
  };

  componentDidUpdate() {
    if(this.props.isActive && !this.props.query) {
      this.setState({ hasRenderedEmoji: true }); // eslint-disable-line
    }
  }

  renderCategory = category => {
    const {
      cacheBustParam,
      imagePath,
      imageType,
      theme = {},
      emojis,
      query,
      checkMouseDown,
      onEmojiSelect,
      onEmojiMouseDown,
      useNativeArt,
      isActive,
      customEmojis,
    } = this.props;

    const categoryEmojis = emojis[category] || {};

    return Object.keys(categoryEmojis).map(key => (
      <li
        key={categoryEmojis[key][0]}
        className={theme.emojiSelectPopoverGroupItem}
      >
        {(isActive || query) && (
          <Entry
            emoji={categoryEmojis[key][0]}
            theme={theme}
            imagePath={imagePath}
            imageType={imageType}
            cacheBustParam={cacheBustParam}
            toneSet={
              categoryEmojis[key].length > 1 ? categoryEmojis[key] : null
            }
            checkMouseDown={checkMouseDown}
            onEmojiSelect={onEmojiSelect}
            onEmojiMouseDown={onEmojiMouseDown}
            useNativeArt={useNativeArt}
            customEmojis={customEmojis}
          />
        )}
      </li>
    ));
  };

  render() {
    const { theme = {}, group, emojis, query } = this.props;

    if(query) {
      let groupEmojis = {};
      for (let category of group.categories) {
        if(emojis[category]) {
          groupEmojis = {...groupEmojis, ...emojis[category]};
        }
      }

      if(!Object.keys(groupEmojis).length) {
        return null;
      }
    }

    return (
      <section
        className={theme.emojiSelectPopoverGroup}
        ref={element => {
          this.container = element;
        }}
      >
        <h3 className={theme.emojiSelectPopoverGroupTitle}>{group.title}</h3>
        <ul
          className={theme.emojiSelectPopoverGroupList}
          ref={element => {
            this.list = element;
          }}
        >
          {group.categories.map(category => this.renderCategory(category))}
        </ul>
      </section>
    );
  }
}
