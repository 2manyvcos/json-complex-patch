# json-complex-patch [![npm version](https://badge.fury.io/js/json-complex-patch.svg)](http://npmjs.com/package/json-complex-patch)

This library provides functions for validating JSON elements and applying complex patches.

Merging is done in a json-merge-patch like behavior.

Changes are made using [immerjs](https://immerjs.github.io/immer), so function calls are immutable.

## apply(element, patch)

Merges patch into element with json-merge-patch like behavior.
Changes are made using [immerjs](https://immerjs.github.io/immer), so the result of `apply` is immutable.

```js
import { apply } from 'json-complex-patch';

apply(
  { a: { b: [1, 2, 3] } },
  {
    a: { b: [4, 5, 6], c: 1 },
    d: true,
  },
);
// returns { a: { b: [ 4, 5, 6 ], c: 1 }, d: true }
```

The function also handles the following additional special keys:

- { "xyz$-": [...comparators] }: Removes all entries in array `xyz` where `compareValue(item, comparator)` returns `true` for one or more items in `...comparators`
- { "xyz$+": [...values] }: Adds all entries in `...values` to the end of `xyz`

The keys and actions are applied in the following order if present in the patch:

1. xyz
2. xyz$-
3. xyz$+

```js
import { apply } from 'json-complex-patch';

apply({ a: { b: [1, 2, 3] } }, { a: { 'b$-': [2] } });
// returns { a: { b: [ 1, 3 ] } }

apply({ a: { x: 1 } }, { a: [1, 2] });
// returns { a: [ 1, 2 ] }

apply({ a: { b: [1, 2, 3] } }, { a: { 'b$+': [5] } });
// returns { a: { b: [ 1, 2, 3, 5 ] } }

apply({ a: [{ x: 3 }, { x: [2, 3] }] }, { 'a$-': [{ x: [3] }] });
// returns { a: [ { x: 3 } ] }
```

## compareValue(element, comparator)

Compares `element` with `comparator` with the following rules. **All checks ignore the order of objects AND ARRAYS.**

- The type of element and comparator (e.g. undefined, null, number, boolean, array, object, ...) must be the same.
- If comparator is an array, each item in `comparator` (c) is checked against the items in `element` (item) with `compareValue(item, c)`. For all items in `comparator` there must be at least one matching item in `element`.
- If comparator is an object, each value in `comparator` (c) is checked against the value in `element` with the same key (item) with `compareValue(item, c)`. All checks must succeed.

```js
compareValue({ a: 1, b: true, c: [1, 2, 3] }, { a: 1, c: [2] });
// returns true

compareValue({ a: 1, b: true, c: [1, 2, 3] }, { c: [3, 2, 1], b: true, a: 1 });
// returns true

compareValue({ a: 1 }, { a: true });
// returns false

compareValue({ c: [1, 2, 3] }, { a: [4] });
// returns false

compareValue({}, { a: 1 });
// returns false
```
