import { of, fromPromise } from 'hyper-async'
import { assoc, __, prop, path } from 'ramda'

export function getTradeData(env, contract) {
  const readState = fromPromise(env.readState)
  return of(contract)
    .chain(readState)
    .map(path(['cachedValue', 'state']))
    .map(c => ({ c, contractId: contract }))
    .map(getTotal)
    .map(getSponsors)
    .map(getOrders)
    .map(getPrice)
}

// export function orders(env, contract) {
//   // need to get a list orders paired with RebAR
//   // read the contract
//   // find the pair with rebar
//   // iterate through the orders of the pair
//   // get the balances of the contract
//   // exclude the contract balance
//   // calculate the percent between the orders qty and the rest of the sponsor qty
//   // return list of percents for each order ids + balance ids - contract balance id

//   const readState = fromPromise(env.readState)

//   return of(contract)
//     .chain(readState)
//   //.map()
// }

export function sell(env, contract, percent, price) {
  const getAddress = fromPromise(env.getAddress)
  const viewState = fromPromise(env.viewState)
  const write = fromPromise(env.write)

  return of({ contract, percent, price })
    // getAddress
    .chain(ctx => getAddress().map(assoc('address', __, ctx)))
    // get sponsor balance
    .chain(ctx => viewState(ctx.contract, { function: 'balance', target: ctx.address })
      .map(prop('balance'))
      .map(assoc('balance', __, ctx))
    )
    // calculatate units based percent of balance
    .map(ctx => {
      ctx.sellbits = Math.floor(ctx.balance * (ctx.percent / 100))
      return ctx
    })
    // calculate unit price based on units divided by total price
    .map(ctx => {
      ctx.unitprice = ctx.price / ctx.sellbits

      return ctx
    })
    // addPair
    .chain(ctx => write(ctx.contract, { function: 'addPair', pair: env.RebAR })
      .map(_ => ctx)
    )
    // createOrder
    .chain(ctx => write(ctx.contract, {
      function: 'createOrder',
      qty: ctx.sellbits,
      price: Math.floor(ctx.unitprice * 1e6),
      pair: [ctx.contract, env.RebAR]
    }))
}

// 
export function buy(env, contract, qty) {
  const write = fromPromise(env.write)

  return of({ contract, qty })
    .map(assoc('qty', Math.floor(qty)))
    .chain(ctx => write(env.RebAR, { function: 'allow', target: ctx.contract, qty: ctx.qty })
      .map((result) => assoc('transaction', result.originalTxId, ctx))
    )
    .chain(ctx => write(ctx.contract, {
      function: 'createOrder',
      pair: [env.RebAR, ctx.contract],
      transaction: ctx.transaction,
      qty: ctx.qty
    }))

}


/** helper functions */

function getPrice(ctx) {
  if (ctx.c.pairs?.length < 1) {
    return { ...ctx, price: 1000 }
  }
  const orders = ctx.c.pairs[0].orders

  let price = 1000
  if (orders.length > 0) {
    price = orders.reduce((a, v) => v.price < a ? v.price : a, Infinity)
  } else if (orders.length === 1) {
    price = orders[0].price
  }

  return { ...ctx, price }
}

function getTotal({ c, contractId }) {
  return ({
    total: Object.values(c.balances).reduce((a, b) => a + b, 0),
    c,
    contractId
  })
}

function getSponsors({ c, total, contractId }) {
  const items = Object.keys(c.balances)
    .filter(b => b !== contractId)
    .map(b => ({
      id: b,
      type: 'sponsor',
      percent: Math.floor((c.balances[b] / total) * 100)
    }))
  return {
    total,
    c,
    items
  }
}

function getOrders({ c, items, total }) {
  if (c.pairs.length === 0) {
    return { c, items }
  }
  const orders = c.pairs[0].orders
    .map(o => ({
      id: o.id,
      type: 'order',
      percent: Math.floor((o.quantity / total) * 100),
      price: o.quantity * o.price,
      qty: o.quantity
    }))
  return {
    c,
    items: items.concat(orders)
  }
}
