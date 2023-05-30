import { of, fromPromise } from 'hyper-async'
import { assoc, __, prop, path } from 'ramda'

export function getTradeData(env, contract) {
  const readState = fromPromise(env.readState)
  return of(contract)
    .chain(readState)
    .map(x => (console.log(x), x))
    .map(path(['cachedValue', 'state', 'balances']))

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
  const getAddress = fromPromise(env.address)
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


export function buy(env, contract, qty) {
  const write = fromPromise(env.write)

  return of({ contract, qty })
    .map(assoc('qty', Math.floor(qty * 1e6)))
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