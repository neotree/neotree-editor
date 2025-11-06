"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface ChangeLogContextType {
  currentEntityId?: string
  currentEntityType?: string
  currentEntityName?: string
  getEntityHistory?: (entityId: string) => Promise<{ data: any[]; errors?: string[] }>
  setCurrentEntity: (entity: {
    entityId?: string
    entityType?: string
    entityName?: string
    getEntityHistory?: (entityId: string) => Promise<{ data: any[]; errors?: string[] }>
  }) => void
  clearCurrentEntity: () => void
}

const ChangeLogContext = createContext<ChangeLogContextType | undefined>(undefined)

export function ChangeLogProvider({ children }: { children: ReactNode }) {
  const [currentEntity, setCurrentEntityState] = useState<{
    entityId?: string
    entityType?: string
    entityName?: string
    getEntityHistory?: (entityId: string) => Promise<{ data: any[]; errors?: string[] }>
  }>({})

  const setCurrentEntity = (entity: {
    entityId?: string
    entityType?: string
    entityName?: string
    getEntityHistory?: (entityId: string) => Promise<{ data: any[]; errors?: string[] }>
  }) => {
    setCurrentEntityState(entity)
  }

  const clearCurrentEntity = () => {
    setCurrentEntityState({})
  }

  return (
    <ChangeLogContext.Provider
      value={{
        ...currentEntity,
        setCurrentEntity,
        clearCurrentEntity,
      }}
    >
      {children}
    </ChangeLogContext.Provider>
  )
}

export function useChangeLogContext() {
  const context = useContext(ChangeLogContext)
  if (context === undefined) {
    throw new Error("useChangeLogContext must be used within a ChangeLogProvider")
  }
  return context
}