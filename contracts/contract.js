import { AddPair, CancelOrder, CreateOrder, Halt } from "@verto/flex";

export async function handle(state, action) {
  const { input, caller } = action
  const balances = state.balances

  if (balances[caller] === void 0 || balances[caller] === null) {
    balances[caller] = 0;
  }

  if (input.function === "addPair") {
    const _ = await AddPair(state, action)
    return { state: _.state };
  }

  if (input.function === "cancelOrder") {
    const _ = await CancelOrder(state, action)
    return { state: _.state };
  }

  if (input.function === "createOrder") {
    const _ = await CreateOrder(state, action);
    return { state: _.state }
  }

  if (input.function === "halt") {
    const _ = await Halt(state, action);
    return { state: _.state };
  }

  if (input.function === "balance") {
    let target;
    if (!input.target) {
      target = caller;
    } else {
      target = input.target;
    }
    const ticker = state.ticker;

    ContractAssert(typeof target === "string", "Must specify target to get balance for.")
    ContractAssert(typeof balances[target] === "number", "Cannot get balance; target does not exist.")

    return {
      result: {
        target,
        ticker,
        balance: balances[target],
      },
    };
  }

  if (input.function === 'transfer') {
    const { qty, target } = input
    ContractAssert(target, 'target MUST be defined')
    ContractAssert(target !== caller, 'target can not be caller')
    ContractAssert(typeof qty === 'number', 'qty MUST be a number')
    ContractAssert(qty > 0, 'qty MUST be greater than zero')
    ContractAssert(balances[caller] >= qty, 'caller does not have enough qty')

    state.balances[caller] -= qty
    if (!state.balances[target]) {
      state.balances[target] = qty
    } else {
      state.balances[target] += qty
    }

    return { state }
  }
  return { state }
}