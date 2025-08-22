// redux/employe-api.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface Recommendation {
  name: string;
  reason: string;
  score: number;
}

interface RecommendationsResponse {
  recommendations: Recommendation[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

interface Filters {
  page?: number;
  limit?: number;
  forceRefresh?: boolean;
}

export const employeeApi = createApi({
  reducerPath: 'employeeApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      return headers;
    },
  }),
  tagTypes: ['Employee', 'Recommendations'],
  endpoints: (builder) => ({
    getEmployee: builder.query<void, void>({
      query: () => '/employe-profile',
      providesTags: ['Employee'],
    }),
    createOrUpdateEmployee: builder.mutation<void, void>({
      query: (employee) => ({
        url: '/employe-profile',
        method: 'POST',
        body: employee,
      }),
      invalidatesTags: ['Employee'],
    }),
    recommendCompanies: builder.query<string[], void>({
      query: () => '/employee-recommendation',
    }),
    
    getRecommendations: builder.query<RecommendationsResponse, Filters>({
      query: (filters) => {
        const params = new URLSearchParams();
        
        // Only send pagination parameters to server
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());

        return `employee-recommendation?${params.toString()}`;
      },
      providesTags: ['Recommendations'],
      keepUnusedDataFor: 300,
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName; // Same cache key for all pages
      },
      merge: (currentCache, newData, { arg }) => {
        if (arg.page === 1 || arg.forceRefresh) {
          return newData;
        }
        return {
          ...newData,
          recommendations: [
            ...(currentCache?.recommendations || []),
            ...newData.recommendations,
          ],
        };
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.forceRefresh || 
               currentArg?.page !== previousArg?.page;
      },
    }),

    clearRecommendationsCache: builder.mutation<void, void>({
      query: () => ({
        url: '/recommendations',
        method: 'POST',
        body: { action: 'clear-cache' },
      }),
      invalidatesTags: ['Recommendations'],
    }),
  }),
});

export const { 
  useGetEmployeeQuery, 
  useCreateOrUpdateEmployeeMutation, 
  useRecommendCompaniesQuery,
  useGetRecommendationsQuery,
  useClearRecommendationsCacheMutation
} = employeeApi;