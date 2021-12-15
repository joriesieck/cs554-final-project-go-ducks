const initialState = {
  user: null,
};

const userReducer = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case 'LOG_IN':
      return {
        user: payload,
      };
    case 'LOG_OUT':
      return {
        user: null,
      };
    default:
      return state;
  }
};

export default userReducer;
