import React, {
  // PropTypes,
  Component,
} from 'react';
import emojione from 'emojione';
import emojiList from '../../../utils/emojiList';
import convertShortNameToUnicode from '../../../utils/convertShortNameToUnicode';

export default class Entry extends Component {
  constructor(props) {
    super(props);
    this.mouseDown = false;
  }

  componentDidUpdate() {
    this.mouseDown = false;
  }

  onMouseUp = () => {
    if (this.mouseDown) {
      this.mouseDown = false;
      this.props.onEmojiSelect(this.props.emoji);
    }
  };

  onMouseDown = event => {
    // Note: important to avoid a content edit change
    event.preventDefault();

    this.mouseDown = true;
  };

  onMouseEnter = () => {
    this.props.onEmojiFocus(this.props.index);
  };

  render() {
    const {
      theme = {},
      imagePath,
      imageType,
      cacheBustParam,
      useNativeArt,
      isFocused,
      id,
      emoji,
      customEmojis,
    } = this.props;
    const className = isFocused
      ? theme.emojiSuggestionsEntryFocused
      : theme.emojiSuggestionsEntry;

    let emojiDisplay = null;

    if(emojiList.list[emoji]) {
      if (useNativeArt === true) {
        const unicode = emojiList.list[emoji][0];
        emojiDisplay = convertShortNameToUnicode(unicode);
      } else {
        // short name to image url code steal from emojione source code
        const shortNameForImage =
          emojione.emojioneList[emoji].unicode[
          emojione.emojioneList[emoji].unicode.length - 1
            ];
        const fullImagePath = `${imagePath}${shortNameForImage}.${imageType}${cacheBustParam}`;
        emojiDisplay = (
          <img
            src={fullImagePath}
            className={theme.emojiSuggestionsEntryIcon}
            role="presentation"
          />
        );
      }
    } else {
      if(customEmojis && Array.isArray(customEmojis)) {
        for (let data of customEmojis) {
          const { shortname, image } = data;
          if(image && shortname === emoji) {
            emojiDisplay = (
              <img src={image}
                   className={theme.emojiSuggestionsEntryIcon}
                   role="presentation"
              />
            );
            break;
          }
        }
      }
    }

    return emojiDisplay && (
      <div
        className={className}
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp}
        onMouseEnter={this.onMouseEnter}
        role="option"
        id={id}
        aria-selected={isFocused ? 'true' : null}
      >
        {emojiDisplay}
        <span className={theme.emojiSuggestionsEntryText}>
          {this.props.emoji}
        </span>
      </div>
    ) || null;
  }
}
