import { useSelector } from "react-redux";
import Banner from "./Banner";
import downArrow from '../assets/down-arrow.svg';
import upArrow from '../assets/up-arrow.svg';

import { priceChartSelector } from "../store/selectors";

import Chart from 'react-apexcharts';
import {options, defaultSeries} from './PriceChart.config';

function PriceChart(){
   const account = useSelector(state => state.provider.account);
   const symbols = useSelector(state => state.tokens.symbols);
   const priceChart = useSelector(priceChartSelector);
   // console.log(priceChart? priceChart.lastprice : "");
    return (
        <div className="component exchange__chart">
          <div className='component__header flex-between'>

            <div className='flex'>
    
              <h2>{symbols && `${symbols[0]+"/"+symbols[1]}`}</h2>

              {/* als priceChart en account niet null is voer wat er na && komt uit.
                  let op! hoe && tussen haakjes een extra statement toe voegt ipv een render component uitvoert.
               */}
              {(priceChart && account) && (
                <div className='flex'>
                {/* HANDIG! snel commenten doe je met ctrl+/ */}
                
                {priceChart.priceChange === '+'? (<img src={upArrow} alt="Arrow up" />): (<img src={downArrow} alt="Arrow down" /> )}  
                 
                <span className='up'>{priceChart.lastprice}</span>

              </div>)
              }
    
            </div>
          </div>
    
          {/* Price chart goes here */}
          {!account? (<Banner text= 'Connect your metamask account!'/>) 
          :
          (
            <Chart
              type="candlestick"
              options={options}
              series={priceChart? priceChart.series : defaultSeries}
              width="100%"
              height="100%"
            />
          )}
    
        </div>
    );
}

export default PriceChart;
