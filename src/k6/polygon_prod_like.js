import http from 'k6/http';
import { SharedArray } from 'k6/data';
import { group, check, sleep } from 'k6';
import { Rate } from "k6/metrics";

const data = new SharedArray('Rpcs', function () {
  return JSON.parse(open('./rpcs.json'));
});

export const options = {
  vus: __ENV.VUS,
  duration: __ENV.DURATION,
};

export let infuraErrorRate = new Rate("InfuraErrors");

export default function () {
  group('Infura - polygon - Production like traffic', function () {
    const url = `https://polygon-mumbai.staging.infura.org/v3/${__ENV.INFURA_KEY}`;
    const payload = JSON.stringify(data[Math.floor(Math.random() * data.length)]);
    const params = {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: '60s'
    };
    const res = http.post(url, payload, params);
    let success = check(res, {
      'is status 200': (r) => r.status === 200,
      'verify rpc resp': (r) =>
        r.body.includes('"jsonrpc":"2.0"'),
      'verify rpc resp - no err': (r) =>
        !r.body.includes('error')
    });
    if(!success) { 
      // console.log(res.body);
      infuraErrorRate.add(1);
    }
    
  });
}