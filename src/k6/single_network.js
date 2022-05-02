import http from 'k6/http';
import { SharedArray } from 'k6/data';
import { group, check } from 'k6';
import { Rate } from "k6/metrics";

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

export let networkErrorRate = new Rate("NetworkErrors");

export default function () {
  group('NETWORK - test', function () {
    const url = __ENV.NETWORK_URL;
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
      networkErrorRate.add(1);
    }
  });
}