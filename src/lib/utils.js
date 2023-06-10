import { BigNumber } from "bignumber.js";
import {
  compose,
  takeLast,
  split,
  join,
  equals,
  always,
  identity,
  cond,
  T,
} from "ramda";

export const stampToAtomic = (stamp) =>
  BigNumber.clone({ DECIMAL_PLACES: 12 })(stamp).shiftedBy(12).toFixed(0);
export const atomicToStamp = (atomic) =>
  BigNumber.clone({ DECIMAL_PLACES: 12 })(atomic).shiftedBy(-12).toFixed(12);

export function getHost() {
  return compose(
    cond([
      [equals("gitpod.io"), always("arweave.net")],
      [equals("arweave.dev"), always("arweave.net")],
      [equals("localhost"), always("arweave.net")],
      [T, identity],
    ]),
    join("."),
    takeLast(2),
    split(".")
  )(location.hostname);
}
