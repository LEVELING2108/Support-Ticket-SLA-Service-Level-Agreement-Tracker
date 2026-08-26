import { createClient, cacheExchange, fetchExchange } from 'urql';

const graphqlEndpoint =
  import.meta.env.VITE_GRAPHQL_ENDPOINT ||
  (import.meta.env.PROD ? '/graphql' : 'http://localhost:4000/graphql');

export const urqlClient = createClient({
  url: graphqlEndpoint,
  exchanges: [cacheExchange, fetchExchange],
  fetchOptions: () => {
    const token = localStorage.getItem('burdenoff_token');
    return {
      headers: {
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  },
});
