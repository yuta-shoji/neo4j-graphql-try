'use client'

import { ApolloProvider } from '@apollo/client'
import { apolloClient } from '@/lib/apollo-client'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ApolloProvider client={apolloClient}>
      {children}
    </ApolloProvider>
  )
} 