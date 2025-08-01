import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:3000/api/graphql',
})

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    typePolicies: {
      User: {
        fields: {
          friends: {
            // 友達リストのキャッシュポリシー
            merge(existing = [], incoming = []) {
              return incoming
            }
          }
        }
      }
    }
  }),
  // 開発環境ではdevtoolsを有効化
  connectToDevTools: process.env.NODE_ENV === 'development',
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all'
    },
    query: {
      errorPolicy: 'all'
    },
    mutate: {
      errorPolicy: 'all'
    }
  }
}) 