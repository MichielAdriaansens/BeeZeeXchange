
//reducers
export function provider(state = {}, action){
    switch(action.type) {
        case 'PROVIDER_LOADED':
            return {
                ...state,
                connection: action.connection
            }
            case 'NETWORK_LOADED':
              return {
                  ...state,
                  chainId: action.chainId
              }
            case 'ACCOUNT_LOADED':
              return {
                  ...state,
                  account: action.account
              }
        default:
            return state
    }
}

export function tokens(state = {loaded: false, contract: null}, action){
  switch(action.type){
    case 'TOKEN_LOADED':
      return {
          ...state,
          loaded: true,
          contract: action.token,
          symbol: action.symbol
      }
    default:
      return state
  }
}

/*
function counterReducer(state = { value: 0 }, action) {
    switch (action.type) {
      case 'counter/incremented':
        return { value: state.value + 1 }
      case 'counter/decremented':
        return { value: state.value - 1 }
      default:
        return state
    }
}
*/