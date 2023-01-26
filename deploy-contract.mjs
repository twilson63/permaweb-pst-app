import Arweave from 'arweave'
import fs from 'fs'

const wallet = JSON.parse(fs.readFileSync('./wallet.json', 'utf-8'))

const arweave = Arweave.init({ host: 'arweave.net', port: 443, protocol: 'https' })

async function main() {
  const src = fs.readFileSync('./public/contract.js', 'utf-8')

  const tx = await arweave.createTransaction({ data: src })
  tx.addTag('Content-Type', 'application/javascript')

  await arweave.transactions.sign(tx, wallet)
  const result = await arweave.transactions.post(tx)
  console.log(tx.id)

}

main()