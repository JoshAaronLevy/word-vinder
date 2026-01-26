import { createContext, useContext, type ReactNode } from 'react'

export type DifyPingStatus = 'pending' | 'ok' | 'error'

type AppContextValue = {
  difyPingStatus: DifyPingStatus
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

export const AppContextProvider = ({
  value,
  children,
}: {
  value: AppContextValue
  children: ReactNode
}) => <AppContext.Provider value={value}>{children}</AppContext.Provider>

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within an AppContextProvider')
  }
  return context
}
