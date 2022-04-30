import express from "express";
import bodyParser from "body-parser";
import path from "path";
const { exec } = require("child_process");
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

// app.get("/*", function (req, res) {
//   res.sendFile(path.join(buildDir, "index.html"));
// });

app.get("/cleanup", function (req, res) {
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
      // TODO: Distinguish here
      return res.json('Test in progress, not started or terminated with errors...')
    }
    else {
      return res.json('Test finished, please download the report')
    }
  } catch(err) {
    // console.error(err)
  }
});

app.get("/commit", function (req, res) {
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
  if(req.query.type === 'single'){
    exec(`k6 run -e VUS=${req.query.VUs} -e DURATION=${req.query.Duration} -e NETWORK_URL=${req.query.NetworkUrl} ./src/k6/single_network.js`, (error: any, stdout: any, stderr: any) => {
      if (error) {
        console.log(`error: ${error.message}`);
          fs.writeFile(testErrorOutputPath, error.message, (err: any) => {
            // throws an error, you could also catch it here
            if (err) throw err;
          });
          
          return error.message;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        fs.writeFile(testErrorOutputPath, stderr, (err: any) => {
          // throws an error, you could also catch it here
          if (err) throw err;
        });
       
        return stderr;
      }
      console.log(stdout); 
  
      fs.writeFile(testOutputPath, stdout, (err: any) => {
        // throws an error, you could also catch it here
        if (err) throw err;
  
        // success case, the file was saved
        console.log('Test result saved!');
      });
    });
  } else if(req.query.type === 'multi'){
    exec(`k6 run -e VUS=${req.query.VUs} -e DURATION=${req.query.Duration} -e NETWORK1_URL=${req.query.Network1Url} -e NETWORK2_URL=${req.query.Network2Url} ./src/k6/network_comparison.js`, (error: any, stdout: any, stderr: any) => {
      if (error) {
        console.log(`error: ${error.message}`);
          fs.writeFile(testErrorOutputPath, error.message, (err: any) => {
            // throws an error, you could also catch it here
            if (err) throw err;
          });
          
          return error.message;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        fs.writeFile(testErrorOutputPath, stderr, (err: any) => {
          // throws an error, you could also catch it here
          if (err) throw err;
        });
       
        return stderr;
      }
      console.log(stdout); 
  
      fs.writeFile(testOutputPath, stdout, (err: any) => {
        // throws an error, you could also catch it here
        if (err) throw err;
  
        // success case, the file was saved
        console.log('Test result saved!');
      });
    });
  }
  
  return res.json('Test started');
});

const port = 3001;
console.log("checking port", port);
app.listen(port, () => {
  console.log(`Server now listening on port: ${port}`);
});