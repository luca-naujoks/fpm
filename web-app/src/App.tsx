import './App.css'
import {Sidebar} from "./components/sidebar/sidebar.tsx";
import {TransactionBody} from "./components/transactionBody/TransactionBody.tsx";
import {useTransactionContext} from "./context/transactionModal/useTransactionModal.ts";
import {TransactionModal} from "./components/modals/transactionModal.tsx";

function App() {
    const {} = useTransactionContext()

    return (
        <>
            <TransactionModal/>
            <div className={"max-h-screen max-w-screen overflow-hidden grid grid-cols-9"}>
                <section className={"col-span-1"}>
                    <Sidebar/>
                </section>
                <section className={"col-span-8 p-4"}>
                    <TransactionBody/>
                </section>
            </div>
        </>
    )
}

export default App
