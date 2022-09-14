import { ethers } from "ethers";
import TOKEN_ABI from '../abis/Token.json';

export function loadProvider(dispatch){
    const connection = new ethers.providers.Web3Provider(window.ethereum);
    
    //connection hoef je niet appart key te typen als key & value zelfde naam hebben
    dispatch({type: 'PROVIDER_LOADED', connection});

    return connection;
}

export async function loadNetwork(dispatch, provider){
    const { chainId } = await provider.getNetwork();

   dispatch({type: 'NETWORK_LOADED', chainId});
   return chainId;
}

export async function loadAccount(dispatch){
   const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
   const account = ethers.utils.getAddress(accounts[0]);
   
   dispatch({type: 'ACCOUNT_LOADED', account});

   return account;
}

export async function loadToken(address, provider, dispatch){
    let token , symbol;
     token =  new ethers.Contract(address , TOKEN_ABI, provider);
     symbol = await token.symbol();

    dispatch({ type: 'TOKEN_LOADED', token, symbol });

    return token;
}