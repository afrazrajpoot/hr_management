// redux/employe-api.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';




export const hrApi = createApi({
  reducerPath: 'hrApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      return headers;
    },
  }),

  endpoints: (builder) => ({
  getHrEmployee: builder.query<void, void>({
    query: () => '/hr-api/hr-employee',
  })

  }),
});

export const { 
useGetHrEmployeeQuery
} = hrApi;