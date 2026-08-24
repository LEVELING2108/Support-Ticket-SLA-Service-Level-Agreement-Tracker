import { createClient, cacheExchange, fetchExchange } from 'urql';

export const urqlClient = createClient({
  url: '/graphql',
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
