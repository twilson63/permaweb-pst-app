# Buying an Asset by orders

```js
let items = [
  {id: 1, type: 'order', percent: 50, price: 10000},
  {id: 2, type: 'order', percent: 25, price: 10000},
  {id: 3, type: 'sponsor', percent: 25}
]

let buyQty = 15000

items
  .filter(x => x.type !== 'sponsor')
  .sort((a,b) => a.price > b.price ? 1 : -1)
  .map(item => {
    if (buyQty > 0) {
      buyQty = buyQty - item.price
      if (buyQty >= 0) {
        item.buy = item.price
      } else {
        item.buy = Math.abs(buyQty)
      }
      
      return item
    }
    return item
  })
```