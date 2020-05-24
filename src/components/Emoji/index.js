import React from 'react';
import clsx from 'clsx';
import emojione from 'emojione';

const Emoji = ({
  theme = {},
  cacheBustParam,
  imagePath,
  imageType,
  className,
  decoratedText,
  useNativeArt,
  customEmojis,
  block,
  contentState,
  ...props
}) => {
  const combinedClassName = clsx(theme.emoji, className);
  const shortName = emojione.toShort(decoratedText);

  if(shortName && shortName !== decoratedText) {
    if (useNativeArt === true) {
      return (
        <span title={shortName}>{props.children}</span>
      );
    } else {
      // short name to image url code steal from emojione source code
      const shortNameForImage =
        emojione.emojioneList[shortName].unicode[
        emojione.emojioneList[shortName].unicode.length - 1
          ];
      const backgroundImage = `url(${imagePath}${shortNameForImage}.${imageType}${cacheBustParam})`;

      return (
        <span
          className={combinedClassName}
          title={shortName}
          style={{ backgroundImage }}
        >
        {props.children}
      </span>
      );
    }
  }

  if(customEmojis && Array.isArray(customEmojis)) {
    for (let data of customEmojis) {
      const { shortname, image } = data;
      if(image && shortname === decoratedText) {
        const backgroundImage = `url(${image})`;
        return (
          <span
            className={combinedClassName}
            title={shortname}
            style={{ backgroundImage }}
          >
        {props.children} {backgroundImage}
      </span>
        );
      }
    }
  }

  if(block && contentState) {
    const { image } = contentState.getEntity(block.getEntityAt(0)).getData();
    if(image) {
      const backgroundImage = `url(${image})`;
      return (
        <span
          className={combinedClassName}
          title={decoratedText}
          style={{ backgroundImage }}>
            {props.children} {backgroundImage}
          </span>
      );
    }
  }

  return null;
};

export default Emoji;
