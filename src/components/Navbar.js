import { useSelector, useDispatch } from "react-redux";
import logo from "../assets/logo.png";
import ethLogo from "../assets/eth.svg"
import Blockies from 'react-blockies';
import {loadAccount} from '../store/interactions'

import config from '../config.json'

function Navbar(){
    const provider = useSelector(state => state.provider.connection);
    const chainId = useSelector(state => state.provider.chainId);
    const account = useSelector((state)=>{return state.provider.account});
    const balance = useSelector(state => state.provider.balance);

    const dispatch = useDispatch();

    async function connectHandler(){
        await loadAccount(provider, dispatch);
    }
    async function networkHandler(event){
       // console.log("switch up! ", event.target.value);
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{chainId: event.target.value}] 
        })
    }

    return(
       <div className='exchange__header grid'>
        <div className='exchange__header--brand flex'>
           <img src = {logo} className = 'logo' alt="beezee logo"/>
           <h1>BeeZee exchange</h1>
        </div>
  
        <div className='exchange__header--networks flex'>
            <img src={ethLogo} alt="ethlogo"/>

                {chainId && (
                    <select className="networks" id="networks" value={config[chainId]? `0x${chainId.toString(16)}` : "0"} onChange={networkHandler}>
                        <option value={0} disabled>select network</option>
                        <option value="0x7A69">local host</option>
                        <option value="0x2a">Kovan</option>
                    </select>
                )}

        </div>
  
        <div className='exchange__header--account flex'>
            {
                balance? (<p><small>balance: </small>{Number(balance).toFixed(4)} ETH</p>)
                :
                (<p><small>balance: </small>0 ETH</p>) 
            }
            {
                //..? ... : ...  turnary is hetzelfde als een if statement. werkt met react-html code
                account?  (
                    <a
                    href={config[chainId]? `${config[chainId].explorerUrl}/address/${account}`: "#"}
                    target = "_blank"
                    rel= "noreferrer"
                    > 
                    {account.slice(0,5) + "..." + account.slice(38,42)}
                <Blockies 
                    seed={account}
                    size = {10}
                    scale={3}
                    color='#2187D0'
                    bgColor='#F1F2F9'
                    spotColor='#767F92'
                    className='identicon'
                />
                </a>) 
                : 
                (<button className="button" onClick={connectHandler}>Connect</button>)
            }
        </div>
      </div>
    )
}

export default Navbar;