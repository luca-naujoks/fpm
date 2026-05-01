import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {TransactionProvider} from "./context/transactionContext/transactionModal.tsx"
import {ProjectProvider} from "./context/projectContext/ProjectContext.tsx";
import {SidebarProvider} from "./context/sidebarContext/SidebarContext.tsx";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ProjectProvider>
            <TransactionProvider>
                <SidebarProvider>
                    <App/>
                </SidebarProvider>
            </TransactionProvider>
        </ProjectProvider>
    </StrictMode>,
)
