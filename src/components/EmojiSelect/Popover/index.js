import React, { Component } from 'react';
import PropTypes from 'prop-types';
import addEmoji from '../../../modifiers/addEmoji';
import Groups from './Groups';
import Nav from './Nav';
import ToneSelect from './ToneSelect';
import strategy from 'emojione/emoji.json';

export default class Popover extends Component {
  static propTypes = {
    cacheBustParam: PropTypes.string.isRequired,
    imagePath: PropTypes.string.isRequired,
    imageType: PropTypes.string.isRequired,
    theme: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired,
    groups: PropTypes.arrayOf(PropTypes.object).isRequired,
    emojis: PropTypes.object.isRequired,
    toneSelectOpenDelay: PropTypes.number.isRequired,
    isOpen: PropTypes.bool,
    useNativeArt: PropTypes.bool,
  };

  static defaultProps = {
    isOpen: false,
    emojiMap: strategy,
  };

  state = {
    activeGroup: 0,
    showToneSelect: false,
    query: '',
  };

  componentDidMount() {
    window.addEventListener('mouseup', this.onMouseUp);
  }

  componentWillUnmount() {
    window.removeEventListener('mouseup', this.onMouseUp);
  }

  onMouseDown = () => {
    this.mouseDown = true;
  };

  onMouseUp = () => {
    this.mouseDown = false;

    if (this.activeEmoji) {
      this.activeEmoji.deselect();
      this.activeEmoji = null;

      if (this.state.showToneSelect) {
        this.closeToneSelect();
      } else if (this.toneSelectTimer) {
        clearTimeout(this.toneSelectTimer);
        this.toneSelectTimer = null;
      }
    }
  };

  onWheel = e => e.preventDefault();

  onEmojiSelect = emoji => {
    const newEditorState = addEmoji(this.props.store.getEditorState(), emoji);
    this.props.store.setEditorState(newEditorState);
  };

  onEmojiMouseDown = (emojiEntry, toneSet) => {
    this.activeEmoji = emojiEntry;

    if (toneSet) {
      this.openToneSelectWithTimer(toneSet);
    }
  };

  onGroupSelect = groupIndex => {
    this.groups.scrollToGroup(groupIndex);
  };

  onGroupScroll = groupIndex => {
    if (groupIndex !== this.state.activeGroup) {
      this.setState({
        activeGroup: groupIndex,
      });
    }
  };

  openToneSelectWithTimer = toneSet => {
    this.toneSelectTimer = setTimeout(() => {
      this.toneSelectTimer = null;
      this.openToneSelect(toneSet);
    }, this.props.toneSelectOpenDelay);
  };

  openToneSelect = toneSet => {
    this.toneSet = toneSet;

    this.setState({
      showToneSelect: true,
    });
  };

  closeToneSelect = () => {
    this.toneSet = [];

    this.setState({
      showToneSelect: false,
    });
  };

  checkMouseDown = () => this.mouseDown;

  mouseDown = false;
  activeEmoji = null;
  toneSet = [];
  toneSelectTimer = null;

  renderToneSelect = () => {
    if (this.state.showToneSelect) {
      const { cacheBustParam, imagePath, imageType, theme = {} } = this.props;

      const containerBounds = this.container.getBoundingClientRect();
      const areaBounds = this.groups.container.getBoundingClientRect();
      const entryBounds = this.activeEmoji.button.getBoundingClientRect();
      // Translate TextRectangle coords to CSS relative coords
      const bounds = {
        areaBounds: {
          left: areaBounds.left - containerBounds.left,
          right: containerBounds.right - areaBounds.right,
          top: areaBounds.top - containerBounds.top,
          bottom: containerBounds.bottom - areaBounds.bottom,
          width: areaBounds.width,
          height: areaBounds.width,
        },
        entryBounds: {
          left: entryBounds.left - containerBounds.left,
          right: containerBounds.right - entryBounds.right,
          top: entryBounds.top - containerBounds.top,
          bottom: containerBounds.bottom - entryBounds.bottom,
          width: entryBounds.width,
          height: entryBounds.width,
        },
      };

      return (
        <ToneSelect
          theme={theme}
          bounds={bounds}
          toneSet={this.toneSet}
          imagePath={imagePath}
          imageType={imageType}
          cacheBustParam={cacheBustParam}
          onEmojiSelect={this.onEmojiSelect}
        />
      );
    }

    return null;
  };

  changeQuery = e => {
    e.preventDefault();
    this.setState({query: e.target.value || ''});
  };

  filterEmojis = (emojis, query) => {
    if(!query) return emojis;
    const { emojiMap } = this.props;
    let filteredEmojis = {};

    const pattern = new RegExp(`(^|\b|\s|:|_|-)${query.split(' ').map(i => (i || '').trim()).filter(i => i).join('|')}`);
    for (let group of Object.keys(emojis)) {
      if(!filteredEmojis[group]) {
        filteredEmojis[group] = {};
      }
      for (let name of Object.keys(emojis[group])) {
        const data = emojiMap && emojiMap[name] || null;
        let searcheableWords = [name];
        if(data) {
          if(data.name) {
            searcheableWords.push(data.name);
          }

          if(data.shortname) {
            searcheableWords.push(data.shortname);
          }

          const keywords = data.keywords;
          if(keywords && Array.isArray(keywords)) {
            searcheableWords = searcheableWords.concat(keywords);
          }

          const aliases = data.aliases;
          if(aliases && Array.isArray(aliases)) {
            searcheableWords = searcheableWords.concat(aliases);
          }
        }

        if(searcheableWords.map(word => !!pattern.test(word)).filter(i => i).length) {
          filteredEmojis[group][name] = emojis[group][name];
        }
      }
    }
    return filteredEmojis;
  };

  render() {
    const {
      cacheBustParam,
      imagePath,
      imageType,
      theme = {},
      groups = [],
      emojis,
      isOpen = false,
      useNativeArt,
    } = this.props;
    const className = isOpen
      ? theme.emojiSelectPopover
      : theme.emojiSelectPopoverClosed;
    const { activeGroup, query } = this.state;

    return (
      <div
        className={className}
        onMouseDown={this.onMouseDown}
        onWheel={this.onWheel}
        ref={element => {
          this.container = element;
        }}
      >
        <Nav
          theme={theme}
          groups={groups}
          activeGroup={activeGroup}
          onGroupSelect={this.onGroupSelect}
          query={query}
        />

        <div className={theme.emojiSelectPopoverSearchWrapper}>
          <input className={theme.emojiSelectPopoverSearchInput}
                 type="search"
                 placeholder="Search Emoji"
                 value={query}
                 onChange={this.changeQuery} />
        </div>

        <h3 className={theme.emojiSelectPopoverTitle}>
          {groups[activeGroup].title}
        </h3>

        <Groups
          theme={theme}
          groups={groups}
          emojis={this.filterEmojis(emojis, query)}
          query={query}
          imagePath={imagePath}
          imageType={imageType}
          cacheBustParam={cacheBustParam}
          checkMouseDown={this.checkMouseDown}
          onEmojiSelect={this.onEmojiSelect}
          onEmojiMouseDown={this.onEmojiMouseDown}
          onGroupScroll={this.onGroupScroll}
          ref={element => {
            this.groups = element;
          }}
          useNativeArt={useNativeArt}
          isOpen={isOpen}
        />

        {this.renderToneSelect()}
      </div>
    );
  }
}
