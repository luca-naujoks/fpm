import './App.css'
import {Sidebar} from "./components/sidebar/sidebar.tsx";
import {TransactionBody} from "./components/transactionBody/TransactionBody.tsx";
import {ProjectProvider} from "./context/ProjectContext.tsx";

function App() {


    return (
        <ProjectProvider>
            <div className={"grid grid-cols-9"}>
                <section className={"col-span-1"}>
                    <Sidebar/>
                </section>
                <section className={"col-span-8 p-4"}>
                    <TransactionBody/>
                </section>
            </div>
        </ProjectProvider>
    )
}

export default App
