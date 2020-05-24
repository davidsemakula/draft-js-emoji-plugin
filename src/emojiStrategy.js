import findWithRegex from 'find-with-regex';
import emojione from 'emojione';

const unicodeRegex = new RegExp(`(:[A-Za-z_]+:)|(${emojione.unicodeRegexp})`, 'g');

export default (contentBlock, callback) => {
  findWithRegex(unicodeRegex, contentBlock, callback);
};
