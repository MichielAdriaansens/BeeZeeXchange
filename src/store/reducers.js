
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
        case 'BALANCE_LOADED':
          return {
            ...state,
            balance: action.balance
            }
        default:
            return state
    }
}

const DEFAULT_TOKEN_STATE = {loaded: false, contracts: [], symbols: []};
export function tokens(state = DEFAULT_TOKEN_STATE , action){
  switch(action.type){
    case 'TOKEN_1_LOADED':
      return {
          ...state,
          loaded: true,
          contracts: [action.token],
          symbols: [action.symbol]
      }
    case 'BALANCE_TOKEN_1_LOADED':
      return {
          ...state,
          balances: [action.balance]
        }
    case 'TOKEN_2_LOADED':
      return {
          ...state,
          loaded: true,
          contracts: [...state.contracts, action.token],
          symbols: [...state.symbols, action.symbol]
      }
      case 'BALANCE_TOKEN_2_LOADED':
        return {
            ...state,
            balances: [...state.balances, action.balance]
          }
    default:
      return state
  }
}

const DEFAULT_EXCHANGE_STATE = {loaded: false, contract: {}, transaction: {isSuccesfull: false}, events: []}

export function exchange(state = DEFAULT_EXCHANGE_STATE,action){
  switch (action.type){
    case 'EXCHANGE_LOADED':
      return {
        ...state,
        loaded: true,
        contract: action.exchange
      }

    case 'EXCHANGE_TOKEN_1_BALANCE_LOADED':
      return{
        ...state,
        balances: [action.balance]
      }
    case 'EXCHANGE_TOKEN_2_BALANCE_LOADED':
      return{
        ...state,
        balances: [...state.balances, action.balance]
      }
    case 'TRANSFER_REQUEST':
      return{
        ...state,
        transaction: {
          transactionType: 'Transfer',
          isPending: true,
          isSuccesfull: false
        },
        transferInProgress:true
      }
    case 'TRANSFER_SUCCESS':
      return{
        ...state,
        transaction: {
          transactionType: 'Transfer',
          isPending: false,
          isSuccesfull: true
        },
        transferInProgress:false,
        events: [action.events , ...state.events]
      }
    case 'TRANSFER_FAIL':
      return{
        ...state,
        transaction: {
          transactionType: 'Transfer',
          isPending: false,
          isSuccesfull: false,
          isError: true
        },
        transferInProgress:false
      }
    default: 
      return  state
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