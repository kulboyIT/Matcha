import { CREATE_PROFILE, GET_PROFILE, PROFILE_ERROR } from '../actions/types';

const initialState = {
    profile: null,
    loading: true,
    error: {},
};

export default function (state = initialState, action) {
    const { type, payload } = action;
    
    switch (type) {
        case CREATE_PROFILE:
            localStorage.setItem('token', payload.tkn);
            return {
                ...state,
                loading: true,
            };
        case GET_PROFILE:
            return {
                ...state,
                profile: payload,
                loading: false,
            };
        case PROFILE_ERROR:
            return {
                ...state,
                error: payload,
                loading: false,
            };
        
        // case CLEAR_PROFILE:
        //     return {
        //         ...state,
        //         profile: null,
        //     };
        default:
            return state;
    }
}
