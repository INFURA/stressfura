# Getting Started with Stressfura

## Install K6
Prior to start, K6 need to be installed in your local machine as the client/FE calls a backend that runs k6 scripts via CLI, to do so follow the instruction here [https://k6.io/docs/getting-started/installation/]

## Install the dependencies
`yarn install`

## Start Stressfura 
`yarn dev`

Run the app (client + server) in the development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## TODOS
* P1
  * allow to specify rpc params
  * break on error, when test stops
  * rpc reponse should have more precise assertions, e.g. eth_call check result not 0x 
  * better UI (review with FE/Designer), improve input validations
  * clean rest api (get to post, code refactor)
  * tick all rpcs button or default all checked
  * refactor common code between pages outside
  * Clear error logs automatically when starting a new test run
  * Clear console logs automatically when starting a new test run
  * Stdout not scrollable, always bringing you to the bottom.
  * ~~allow better traffic ramps~~
  * ~~allow to chose the rpcs or rpcs groups~~
  * ~~cron fetch download report to update test status and download it once done~~
  * ~~check start test button only enabled when prev test finished~~
  * ~~Allow to cancel test in progress (complication as stay in progress due to file not present, should check process there too!) `ps aux | grep 'k6 run' | awk {'print $2'} | xargs kill -9`~~
  * ~~show test errors in real time~~
  * ~~Show test progress & notify when test is done~~
* P2
  * server refresh should not stop test run
  * check scenarios
  * add new scenarios
  * print test duration including any gracefulStop
  * ~~display final report~~


