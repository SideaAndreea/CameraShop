const initialState = {
  loading: false,
  cartItems: [],
  purchasedItems: [],
};

export const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SHOW_LOADING":
      return {
        ...state,
        loading: true,
      };

    case "HIDE_LOADING":
      return {
        ...state,
        loading: false,
      };

    case "ADD_TO_CART":
      // Verificăm dacă produsul există deja în coș
      const existingProduct = state.cartItems.find(
        (item) => item._id === action.payload._id
      );

      if (existingProduct) {
        return {
          ...state,
          cartItems: state.cartItems.map((item) =>
            item._id === action.payload._id
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                }
              : item
          ),
        };
      } else {
        // Adaugă produsul în coș
        return {
          ...state,
          cartItems: [...state.cartItems, action.payload],
        };
      }

    case "UPDATE_CART":
      return {
        ...state,
        cartItems: state.cartItems.map((product) =>
          product._id === action.payload._id
            ? { ...product, quantity: action.payload.quantity }
            : product
        ),
      };

    case "DELETE_FROM_CART":
      return {
        ...state,
        cartItems: state.cartItems.filter(
          (product) => product._id !== action.payload._id
        ),
      };

    case "CLEAR_CART":
      return {
        ...state,
        cartItems: [],
      };

    case "SET_PURCHASED_ITEMS":
      return {
        ...state,
        purchasedItems: action.payload, // Actualizează purchasedItems cu datele corecte
      };

    default:
      return state;
  }
};
