# Getting Started with Stressfura

## Install K6

Prior to start, K6 need to be installed in your local machine as the client/FE calls a backend that runs k6 scripts via CLI, to do so follow the instruction here [https://k6.io/docs/getting-started/installation/]

## Install the npm packages 
`yarn install`

## Start Stressfura 

`yarn dev`

Runs the app (client + server) in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

## TODOS
* P1
  * ~~check start test button only enabled when prev test finished~~
  * Allow to cancel test in progress (complication as stay in progress due to file not present, should check process there too!) `ps aux | grep 'k6 run' | awk {'print $2'} | xargs kill -9`
  * ~~show test errors in real time~~
  * ~~Show test progress & notify when test is done~~
  * better UI, including input validations
  * break on error, when test stops
  * clean rest api
  * cron fetch download report to update test status and download it once done
  * refactor common code between pages outside
  * server refresh should not stop test run
* P2
  * display final report
  * print test duration including any gracefulStop
  * allow better traffic ramps
  * allow to chose the rpcs or rpcs groups
  * allow to specify rpc params
  * check scenarios
  * add new scenarios


