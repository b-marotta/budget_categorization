import TransactionList from '@/components/transaction-list'

export default function Transactions() {
    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold">Transactions</h1>
            <TransactionList />
        </div>
    )
}
