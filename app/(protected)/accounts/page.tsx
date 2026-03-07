import BankList from '@/components/bank-list'

export default function Link() {
    return (
        <main className="flex h-full w-full flex-col gap-4">
            <h1 className="text-2xl font-bold">Link</h1>
            <div className="flex h-full w-full flex-col">
                <BankList />
            </div>
        </main>
    )
}
