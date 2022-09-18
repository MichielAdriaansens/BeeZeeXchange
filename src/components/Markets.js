import config from "../config.json";
import {useSelector, useDispatch} from "react-redux";
import { loadTokens } from "../store/interactions";

function Markets(){
    const provider = useSelector(state => state.provider.connection);
    const chainId = useSelector(state => state.provider.chainId);
    const dispatch = useDispatch();

    async function maretHandler(event){
       
        let addresses = (event.target.value).split(",");
        
        console.log("market Switch up!", addresses[0], addresses[1] );

       await loadTokens([addresses[0], addresses[1]],provider,dispatch);
    }

    return(
        <div className='component exchange__markets'>
          <div className='component__header'>
            <h2>Select Market</h2>
          </div>
            {
                chainId && config[chainId]? 
                    <select className="markets" id="markets" onChange={maretHandler}>
                        <option value={`${config[chainId].BCC.address},${config[chainId].HIP.address}`}>BCC / HIP</option>
                        <option value={`${config[chainId].BCC.address},${config[chainId].FAC.address}`}>BCC / FAC</option>
                    </select>
                    :
                    <select>
                        <option>Not connected</option>
                    </select>
            }

          <hr />
        </div>
      )
}

export default Markets;