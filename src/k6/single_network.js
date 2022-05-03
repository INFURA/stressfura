import http from 'k6/http';
import { SharedArray } from 'k6/data';
import { group, check } from 'k6';
import { Rate } from "k6/metrics";

const data = new SharedArray('Rpcs', function () {
  return JSON.parse(open('./rpcs.json'));
});

const fetchVar = () => {
    switch (__ENV.RAMP) {
      case 'loadRamp':
        return  {
          stages: [
            { duration: '30s', target: __ENV.VUS }, // simulate ramp-up of traffic from 1 to 100 users over 5 minutes.
            { duration: __ENV.DURATION, target: __ENV.VUS }, // stay at 100 users for 10 minutes
            { duration: '30s', target: 0 }, // ramp-down to 0 users
          ]
        };
      case 'stressRamp':
        return {
          stages: [
            { duration: '1m', target: __ENV.VUS }, // below normal load
            { duration: __ENV.DURATION, target: __ENV.VUS },
            { duration: '1m', target: __ENV.VUS * 2 }, // normal load
            { duration: __ENV.DURATION, target: __ENV.VUS * 2 },
            { duration: '1m', target: __ENV.VUS * 3 }, // around the breaking point
            { duration: __ENV.DURATION, target: __ENV.VUS * 3 },
            { duration: '1m', target: __ENV.VUS * 4 }, // beyond the breaking point
            { duration: __ENV.DURATION, target: __ENV.VUS * 4 },
            { duration: '1m', target: 0 }, // scale down. Recovery stage.
          ]
        }
      case 'soakRamp':
        return {
          stages: [
            { duration: '2m', target: __ENV.VUS }, // ramp up to 400 users
            { duration: __ENV.DURATION, target: __ENV.VUS }, // '3h56m' stay at 400 for ~4 hours
            { duration: '2m', target: 0 }, // scale down. (optional)
          ],
        }
      case 'spikeRamp':
        return {
          stages: [
            { duration: '10s', target: __ENV.VUS / 5 }, // below normal load
            { duration: '30s', target:  __ENV.VUS / 5 },
            { duration: '10s', target: __ENV.VUS }, // spike to 1400 users
            { duration: __ENV.DURATION, target: __ENV.VUS }, // stay at 1400 for 3 minutes
            { duration: '10s', target:  __ENV.VUS / 5 }, // scale down. Recovery stage.
            { duration: __ENV.DURATION, target:  __ENV.VUS / 5 },
            { duration: '10s', target: 0 },
          ],
        }
      default:
        return  {
          stages: [
            { duration: '30s', target: __ENV.VUS }, // simulate ramp-up of traffic from 1 to 100 users over 5 minutes.
            { duration: __ENV.DURATION, target: __ENV.VUS }, // stay at 100 users for 10 minutes
            { duration: '30s', target: 0 }, // ramp-down to 0 users
          ]
        };
    } 
}
export const options = fetchVar()

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