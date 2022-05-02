import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { exec } from "child_process";
const { spawn } = require("child_process");
const fs = require('fs');

const buildDir = path.join(process.cwd() + "/build");
const app = express();
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(express.static(buildDir));

const testOutputPath = './LoadTestReport.txt'
const testErrorOutputPath = './TestErrors.txt'

const cleanup = () => {
  try {
    fs.unlinkSync(testOutputPath)
    console.log('output file removed')
    //file removed
  } catch(err) {
    // console.error(err)
  }
  try {
    fs.unlinkSync(testErrorOutputPath)
    console.log('error file removed')
    //file removed
  } catch(err) {
    // console.error(err)
  }
}

app.get("/cleanup", function (req, res) {
  cleanup()
  return res.json('')
});

app.get("/fetch-errors", function (req, res) {
  try {
    if (!fs.existsSync(testErrorOutputPath)) {
      return res.json('')
    }
  } catch(err) {
    // console.error(err)
  }

  fs.readFile(testErrorOutputPath, 'utf8', (err: any, data: any) => {
    if (err) {
      console.error(err);
      return err;
    }
    return res.json(data)
  });
});

app.get("/fetch", function (req, res) {
  try {
    if (!fs.existsSync(testOutputPath)) {
      return res.json('results not ready')
    }
  } catch(err) {
    // console.error(err)
  }

  fs.readFile(testOutputPath, 'utf8', (err: any, data: any) => {
    if (err) {
      console.error(err);
      return err;
    }
    return res.json(data)
  });
});

app.get("/fetch-test-progress", function (req, res) {
  try {
    if (!fs.existsSync(testOutputPath)) {
      return res.json('')
    }
    else {
      fs.readFile(testOutputPath, 'utf8', (err: any, data: any) => {
        if (err) {
          console.error(err);
          return err;
        }
        return res.json(data)
      });
    }
  } catch(err) {
    return err
  }
});

app.get("/commit", function (req, res) {
  cleanup()
  if(req.query.Type === 'single'){
    var child = spawn(`k6`, ['run','-e',`VUS=${req.query.VUs}`, '-e', `DURATION=${req.query.Duration}`, '-e', `NETWORK_URL=${req.query.NetworkUrl}`, '-e', `RPCS=${req.query.Rpcs}`,'-e',`RAMP=${req.query.Ramp}`, path.join(__dirname, "../") + '/src/k6/single_network.js']);
    child.stdout.on('data', function (data: any) {
      console.log('stdout: ' + data);
      fs.writeFile(testOutputPath, data, { flag: "a+" }, (err: any) => {
        if (err) { throw err; }
        console.log('Test result saved!');
      });
     });
     child.stderr.on('data', function (data: any) {
      console.log('stderr: ' + data);
      fs.writeFile(testErrorOutputPath, data, { flag: "a+" }, (err: any) => {
          if (err) throw err;
        });
     });
     child.on('close', function (code: any) {
      console.log('child process exited with code ' + code);
     });
  } else if(req.query.Type === 'multi'){
    var child = spawn(`k6`, ['run','-e',`VUS=${req.query.VUs}`, '-e', `DURATION=${req.query.Duration}`, '-e', `NETWORK1_URL=${req.query.Network1Url}`, '-e', `NETWORK2_URL=${req.query.Network2Url}`, '-e', `RPCS=${req.query.Rpcs}`, ,'-e',`RAMP=${req.query.Ramp}`, path.join(__dirname, "../") + '/src/k6/network_comparison.js']);
    child.stdout.on('data', function (data: any) {
      console.log('stdout: ' + data);
      fs.writeFile(testOutputPath, data, { flag: "a+" }, (err: any) => {
        if (err) { throw err; }
        console.log('Test result saved!');
      });
     });
     child.stderr.on('data', function (data: any) {
      console.log('stderr: ' + data);
      fs.writeFile(testErrorOutputPath, data, { flag: "a+" }, (err: any) => {
          if (err) throw err;
        });
     });
     child.on('close', function (code: any) {
      console.log('child process exited with code ' + code);
     });
  }
  
  return res.json('Test started');
});

app.get("/abort-test", (req,res) => {
  exec(`ps aux | grep 'k6 run' | awk {'print $2'} | xargs kill -9`, (error: any, stdout: any, stderr: any) => {
    if (error) {
      console.log(`error: ${error.message}`);      
      return res.json(`error: ${error.message}`);
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return res.json(`stderr: ${stderr}`);
    }
    if(stdout){
      console.log(stdout); 
      return res.json(`stdout: ${stdout}`)
    }
  });
})

const port = 3001;
console.log("checking port", port);
app.listen(port, () => {
  console.log(`Server now listening on port: ${port}`);
  cleanup()
});