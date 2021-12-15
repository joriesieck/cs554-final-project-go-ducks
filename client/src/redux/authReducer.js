const initialState = {
  authToken: null,
};

const authReducer = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case 'UPDATE_TOKEN':
      return {
        authToken: payload,
      };
    case 'CLEAR_TOKEN':
      return {
        authToken: null,
      };
    default:
      return state;
  }
};

export default authReducer;
