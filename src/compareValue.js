function getType(element) {
  if (element === null) return 'null';
  if (Array.isArray(element)) return 'array';
  return typeof element;
}

function compareValue(element, comparator) {
  const elemType = getType(element);
  const compType = getType(comparator);

  if (elemType !== compType) return false;

  switch (compType) {
    case 'array':
      return !(
        comparator.findIndex((n) => element.findIndex((v) => compareValue(v, n)) === -1) !== -1
      );

    case 'object':
      return !(
        Object.keys(comparator).findIndex((key) => !compareValue(element[key], comparator[key])) !==
        -1
      );

    default:
      return element === comparator;
  }
}

export default compareValue;
