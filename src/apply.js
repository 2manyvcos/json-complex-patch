/* eslint-disable no-loop-func */

import { produce } from 'immer';

import compare from './compare';

function apply(element, patch, { opRemoveSuffix = '$-', opAddSuffix = '$+' } = {}) {
  const canRemove = typeof opRemoveSuffix === 'string' && opRemoveSuffix;
  const canAdd = typeof opAddSuffix === 'string' && opAddSuffix;

  return produce({ data: element }, (draft) => {
    let s = {
      value: draft,
      bridge: false,
      patch: { data: patch },
      keys: ['data'],
      index: 0,
      ops: {
        remove: [],
        add: [],
      },
    };

    while (s != null) {
      if (s.keys.length > s.index) {
        // key in segment
        const key = s.keys[s.index];

        if (canRemove && key.endsWith(opRemoveSuffix)) {
          if (!s.bridge) s.ops.remove.push(key);
          s.index += 1;
        } else if (canAdd && key.endsWith(opAddSuffix)) {
          if (!s.bridge) s.ops.add.push(key);
          s.index += 1;
        } else {
          const v = s.value[key];
          const n = s.patch[key];
          if (n == null || typeof n !== 'object') {
            s.value[key] = n;
            s.index += 1;
          } else {
            if (Array.isArray(n)) {
              s.value[key] = [];
            } else if (typeof v !== 'object' || Array.isArray(v) || s.bridge) {
              s.value[key] = {};
            }
            s.index += 1;
            s = {
              parent: s,
              value: s.value[key],
              bridge: Array.isArray(s.value[key]),
              patch: n,
              keys: Object.keys(n),
              index: 0,
              ops: {
                remove: [],
                add: [],
              },
            };
          }
        }
      } else {
        // end of segment
        if (!s.bridge) {
          if (s.ops.remove.length > 0) {
            s.ops.remove.forEach((op) => {
              const key = op.substring(0, op.length - opRemoveSuffix.length);
              const v = s.value[key];
              const n = s.patch[op];
              if (v != null && !Array.isArray(v)) {
                throw new Error(`Operation "${op}" is only supported on arrays - got ${typeof v}`);
              } else if (!Array.isArray(n)) {
                throw new Error(
                  `Operation "${op}" requires an array as its value - got ${typeof n}`,
                );
              } else {
                if (v == null) s.value[key] = [];
                const filtered = s.value[key].filter(
                  (item) => n.findIndex((comparator) => compare(item, comparator)) === -1,
                );
                if (filtered.length !== s.value[key].length) {
                  s.value[key] = filtered;
                }
              }
            });
          }
          if (s.ops.add.length > 0) {
            s.ops.add.forEach((op) => {
              const key = op.substring(0, op.length - opAddSuffix.length);
              const v = s.value[key];
              const n = s.patch[op];
              if (v != null && !Array.isArray(v)) {
                throw new Error(`Operation "${op}" is only supported on arrays - got ${typeof v}`);
              } else if (!Array.isArray(n)) {
                throw new Error(
                  `Operation "${op}" requires an array as its value - got ${typeof n}`,
                );
              } else {
                if (v == null) s.value[key] = [];
                s.value[key].push(...n);
              }
            });
          }
        }
        s = s.parent;
      }
    }
  }).data;
}

export default apply;
