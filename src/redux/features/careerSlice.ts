import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Job {
    id: string;
    title: string;
    industry: string;
    matchScore: number;
    salaryRange: string | null;
    location: string | null;
    type: string | null;
    status: string | null;
    saved: boolean;
    description: string;
    createdAt: string;
    sourceUrl: string | null;
    companies: string[];
}

interface CareerState {
    recommendations: Job[];
    page: number;
    hasMore: boolean;
    total: number;
    filters: {
        search: string;
        industry: string;
        type: string;
        time: string;
        minScore: number;
        maxScore: number;
        sortBy: string;
        sortOrder: "asc" | "desc";
    };
    lastFetched: number | null;
}

const initialState: CareerState = {
    recommendations: [],
    page: 1,
    hasMore: false,
    total: 0,
    filters: {
        search: "",
        industry: "All",
        type: "All",
        time: "All Time",
        minScore: 0,
        maxScore: 100,
        sortBy: "score",
        sortOrder: "desc",
    },
    lastFetched: null,
};

export const careerSlice = createSlice({
    name: 'career',
    initialState,
    reducers: {
        setRecommendations: (state, action: PayloadAction<Job[]>) => {
            state.recommendations = action.payload;
            state.lastFetched = Date.now();
        },
        appendRecommendations: (state, action: PayloadAction<Job[]>) => {
            // Avoid duplicates when appending
            const newJobs = action.payload.filter(
                (newJob) => !state.recommendations.some((job) => job.id === newJob.id)
            );
            state.recommendations = [...state.recommendations, ...newJobs];
            state.lastFetched = Date.now();
        },
        setPage: (state, action: PayloadAction<number>) => {
            state.page = action.payload;
        },
        setHasMore: (state, action: PayloadAction<boolean>) => {
            state.hasMore = action.payload;
        },
        setTotal: (state, action: PayloadAction<number>) => {
            state.total = action.payload;
        },
        setFilters: (state, action: PayloadAction<Partial<CareerState['filters']>>) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        resetCareerState: (state) => {
            return initialState;
        },
        clearRecommendations: (state) => {
            state.recommendations = [];
            state.page = 1;
            state.hasMore = false;
            state.total = 0;
        }
    },
});

export const {
    setRecommendations,
    appendRecommendations,
    setPage,
    setHasMore,
    setTotal,
    setFilters,
    resetCareerState,
    clearRecommendations
} = careerSlice.actions;

export default careerSlice.reducer;
