import http from 'k6/http';
import { SharedArray } from 'k6/data';
import { group, check } from 'k6';
import { Rate } from "k6/metrics";

// not using SharedArray here will mean that the code in the function call (that is what loads and
// parses the json) will be executed per each VU which also means that there will be a complete copy
// per each VU
const data = new SharedArray('Rpcs', function () {
  return JSON.parse(open('./rpcs.json'));
});

export const options = {
  scenarios: {
    example_scenario: {
      executor: 'constant-vus',
      vus: __ENV.VUS,
      duration: __ENV.DURATION,
      gracefulStop: '0s'
    } 
  }
};

export let network1ErrorRate = new Rate("Network1Errors");
export let network2ErrorRate = new Rate("Network2Errors");

export default function () {
  group('NETWORK1 - test', function () {
    const url = __ENV.NETWORK1_URL;
    const rpcs = __ENV.RPCS[0] === ',' ? __ENV.RPCS.substring(1).split(',') : '';
    let newData = data.filter((d) => rpcs.includes(d.method))
    const payload = JSON.stringify(newData[Math.floor(Math.random() * newData.length)]);
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
      network1ErrorRate.add(1);
    }
    
  });

  group('NETWORK2 - test', function () {
    const url = __ENV.NETWORK2_URL;
    const rpcs = __ENV.RPCS[0] === ',' ? __ENV.RPCS.substring(1).split(',') : '';
    let newData = data.filter((d) => rpcs.includes(d.method))
    const payload = JSON.stringify(newData[Math.floor(Math.random() * newData.length)]);
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
        r.body.includes('"jsonrpc": "2.0"'),
      'verify rpc resp - no err': (r) =>
        !r.body.includes('error')
    });
    if(!success) { 
      // console.log(res.body);
      network2ErrorRate.add(1);
    }

  });

}