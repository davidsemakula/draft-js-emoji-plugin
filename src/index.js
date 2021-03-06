import React from 'react';
import { Map, List } from 'immutable';
import keys from 'lodash/keys';
import { EditorState } from 'draft-js';
import Emoji from './components/Emoji';
import EmojiSuggestions from './components/EmojiSuggestions';
import EmojiSuggestionsPortal from './components/EmojiSuggestionsPortal';
import EmojiSelect from './components/EmojiSelect';
import emojiStrategy from './emojiStrategy';
import emojiSuggestionsStrategy from './emojiSuggestionsStrategy';
import attachImmutableEntitiesToEmojis from './modifiers/attachImmutableEntitiesToEmojis';
import defaultPositionSuggestions from './utils/positionSuggestions';
import emojiList from './utils/emojiList';
import { defaultTheme } from './theme.js';
import defaultEmojiGroups from './constants/defaultEmojiGroups';
import defaultEmojiMap from 'emojione/emoji.json';
import createEmojisFromMap from './utils/createEmojisFromStrategy';
import convertShortNameToUnicode from './utils/convertShortNameToUnicode';

export {
  defaultTheme,
  defaultEmojiGroups,
  defaultEmojiMap,
  createEmojisFromMap,
  emojiList,
  convertShortNameToUnicode,
};

const defaultImagePath = '//cdn.jsdelivr.net/emojione/assets/svg/';
const defaultImageType = 'svg';
const defaultCacheBustParam = '?v=2.2.7';

// TODO activate/deactivate different the conversion or search part

export default (config = {}) => {
  const callbacks = {
    keyBindingFn: undefined,
    handleKeyCommand: undefined,
    handleReturn: undefined,
    onChange: undefined,
  };

  const ariaProps = {
    ariaHasPopup: 'false',
    ariaExpanded: false,
    ariaOwneeID: undefined,
    ariaActiveDescendantID: undefined,
  };

  let searches = Map();
  let escapedSearch;
  let clientRectFunctions = Map();

  const store = {
    getEditorState: undefined,
    setEditorState: undefined,
    getPortalClientRect: offsetKey => clientRectFunctions.get(offsetKey)(),
    getAllSearches: () => searches,
    isEscaped: offsetKey => escapedSearch === offsetKey,
    escapeSearch: offsetKey => {
      escapedSearch = offsetKey;
    },

    resetEscapedSearch: () => {
      escapedSearch = undefined;
    },

    register: offsetKey => {
      searches = searches.set(offsetKey, offsetKey);
    },

    updatePortalClientRect: (offsetKey, func) => {
      clientRectFunctions = clientRectFunctions.set(offsetKey, func);
    },

    unregister: offsetKey => {
      searches = searches.delete(offsetKey);
      clientRectFunctions = clientRectFunctions.delete(offsetKey);
    },
  };

  // Styles are overwritten instead of merged as merging causes a lot of confusion.
  //
  // Why? Because when merging a developer needs to know all of the underlying
  // styles which needs a deep dive into the code. Merging also makes it prone to
  // errors when upgrading as basically every styling change would become a major
  // breaking change. 1px of an increased padding can break a whole layout.
  const {
    theme = defaultTheme,
    imagePath = defaultImagePath,
    imageType = defaultImageType,
    allowImageCache,
    positionSuggestions = defaultPositionSuggestions,
    priorityList,
    selectGroups,
    selectButtonContent,
    toneSelectOpenDelay,
    useNativeArt,
    excludedEmojis,
    customEmojis,
    onEmojiSelect,
  } = config;
  const cacheBustParam = allowImageCache ? '' : defaultCacheBustParam,
    emojisWithUnicodeList = keys(emojiList.list);

  let filteredEmojiMap = {},
    excludedShortNames = [];

  if(excludedEmojis && Array.isArray(excludedEmojis) && excludedEmojis.length) {
    for (let name of Object.keys(defaultEmojiMap)) {
      const shortName = defaultEmojiMap[name].shortname;
      if(!emojisWithUnicodeList.includes(shortName) || excludedEmojis.map(i => [name, shortName].includes(i) || (new RegExp(`${name}_tone(.*)`)).test(i) || (new RegExp(`${shortName.replace(':', '')}_tone(.*)`)).test(i)).filter(i => i).length) {
        excludedShortNames.push(shortName);
      } else {
        filteredEmojiMap[name] = defaultEmojiMap[name];
      }
    }
  } else {
    filteredEmojiMap = {...defaultEmojiMap};
  }

  for (let emoji of customEmojis) {
    const { shortname, image } = emoji;
    if(shortname && image && !emojisWithUnicodeList.includes(shortname)) {
      filteredEmojiMap[shortname.replace(/:/ig, '')] = emoji;
    }
  }

  const filteredEmojis = createEmojisFromMap(filteredEmojiMap);

  // if priorityList is configured in config then set priorityList
  if (priorityList) emojiList.setPriorityList(priorityList);
  const suggestionsProps = {
    ariaProps,
    cacheBustParam,
    callbacks,
    imagePath,
    imageType,
    theme,
    store,
    positionSuggestions,
    shortNames: List(
      keys(emojiList.list).filter(i => !excludedShortNames.includes(i))
        .concat((customEmojis || []).map(emoji => emoji.shortname))),
    useNativeArt,
    customEmojis,
    onEmojiSelect,
  };
  const selectProps = {
    cacheBustParam,
    imagePath,
    imageType,
    theme,
    store,
    selectGroups,
    selectButtonContent,
    toneSelectOpenDelay,
    useNativeArt,
    emojiMap: filteredEmojiMap,
    emojis: filteredEmojis,
    customEmojis,
    onEmojiSelect,
  };
  const DecoratedEmojiSuggestions = props => (
    <EmojiSuggestions {...props} {...suggestionsProps} />
  );
  const DecoratedEmojiSelect = props => (
    <EmojiSelect {...props} {...selectProps} />
  );
  const DecoratedEmoji = props => (
    <Emoji
      {...props}
      theme={theme}
      imagePath={imagePath}
      imageType={imageType}
      cacheBustParam={cacheBustParam}
      useNativeArt={useNativeArt}
      customEmojis={customEmojis}
    />
  );
  const DecoratedEmojiSuggestionsPortal = props => (
    <EmojiSuggestionsPortal {...props} store={store} />
  );
  return {
    EmojiSuggestions: DecoratedEmojiSuggestions,
    EmojiSelect: DecoratedEmojiSelect,
    decorators: [
      {
        strategy: emojiStrategy,
        component: DecoratedEmoji,
      },
      {
        strategy: emojiSuggestionsStrategy,
        component: DecoratedEmojiSuggestionsPortal,
      },
    ],
    getAccessibilityProps: () => ({
      role: 'combobox',
      ariaAutoComplete: 'list',
      ariaHasPopup: ariaProps.ariaHasPopup,
      ariaExpanded: ariaProps.ariaExpanded,
      ariaActiveDescendantID: ariaProps.ariaActiveDescendantID,
      ariaOwneeID: ariaProps.ariaOwneeID,
    }),

    initialize: ({ getEditorState, setEditorState }) => {
      store.getEditorState = getEditorState;
      store.setEditorState = setEditorState;
    },

    keyBindingFn: keyboardEvent =>
      callbacks.keyBindingFn && callbacks.keyBindingFn(keyboardEvent),
    handleReturn: keyboardEvent =>
      callbacks.handleReturn && callbacks.handleReturn(keyboardEvent),
    onChange: editorState => {
      let newEditorState = attachImmutableEntitiesToEmojis(editorState, customEmojis);

      if (
        !newEditorState
          .getCurrentContent()
          .equals(editorState.getCurrentContent())
      ) {
        // Forcing the current selection ensures that it will be at it's right place.
        // This solves the issue where inserting an Emoji on OSX with Apple's Emoji
        // selector led to the right selection the data, but wrong position in
        // the contenteditable.
        newEditorState = EditorState.forceSelection(
          newEditorState,
          newEditorState.getSelection()
        );
      }

      if (callbacks.onChange) return callbacks.onChange(newEditorState);
      return newEditorState;
    },
  };
};
