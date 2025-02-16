const reverse = (string) => string.split('').reverse().join('');
const average = (array) => {
  return array.length === 0
    ? 0
    : array.reduce((sum, a) => sum + a, 0) / array.length;
};

module.exports = { reverse, average };
