import './App.css'
import {Sidebar} from "./components/sidebar/sidebar.tsx";
import {TransactionBody} from "./components/transactionBody/TransactionBody.tsx";
import {TransactionModal} from "./components/modals/transactionModal.tsx";
import {CreateProjectModal} from "./components/modals/createProjectModal.tsx";
import {useSidebar} from "./context/sidebarContext/useSidebarContext.ts";

function App() {
    const {sidebarOpen} = useSidebar()
    return (
        <>
            <CreateProjectModal/>
            <TransactionModal/>
            <div className={"h-screen w-screen overflow-hidden flex flex-row"}>
                <section className={"flex-none w-fit max-w-52 shrink-0"}>
                    <Sidebar/>
                </section>
                <section className={`flex-1 min-w-0 ${sidebarOpen && "p-2"} sm:p-3 lg:p-4`}>
                    <TransactionBody/>
                </section>
            </div>
        </>
    )
}

export default App
