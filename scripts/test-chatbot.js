const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const questions = [
  "Siapa Ketua RT 04 Kemayoran?",
  "Berapa nomor WA Pak RT?",
  "Berapa biaya iuran bulanan warga?",
  "Apakah pembayaran iuran bisa pakai QRIS?",
  "Bagaimana cara membuat surat pengantar?",
  "Kapan jadwal kerja bakti warga?",
  "Ronda malam di mana lokasinya?",
  "Siapa saja pengurus RT 04 selain Ketua?",
  "Kalau ada saudara menginap lebih dari 24 jam gimana?",
  "Pelayanan RT buka jam berapa sampai jam berapa?"
];

let activePort = 3000;

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function checkPortReady(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/`, (res) => {
      // Check if this is the Next.js dev server or just some random server.
      // Next.js usually returns a server header, or we can check `/api/chat` with a dummy POST to see if it doesn't 404.
      resolve(true);
    });
    req.on('error', () => {
      resolve(false);
    });
    req.end();
  });
}

function verifyApiRoute(port) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ message: "test_probe" });
    const req = http.request({
      hostname: 'localhost',
      port: port,
      path: '/api/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      // If it doesn't return 404, then the route is active here!
      if (res.statusCode !== 404) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    req.on('error', () => {
      resolve(false);
    });
    req.write(postData);
    req.end();
  });
}

async function askQuestion(message) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ message, history: [] });
    
    const req = http.request({
      hostname: 'localhost',
      port: activePort,
      path: '/api/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.reply || data);
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

async function run() {
  console.log("=========================================");
  console.log("          MBAK PRISMA CHATBOT TEST       ");
  console.log("=========================================");
  
  console.log("\nStarting Next.js development server in background...");
  const devServer = spawn('npm', ['run', 'dev'], { 
    shell: true,
    cwd: 'c:\\Users\\user\\Desktop\\prisma'
  });
  
  devServer.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('ready') || output.includes('started') || output.includes('Port') || output.includes('port')) {
      console.log(`[DevServer]: ${output.trim()}`);
    }
  });

  devServer.stderr.on('data', (data) => {
    const output = data.toString();
    console.log(`[DevServer Info/Error]: ${output.trim()}`);
    // Check if the port was reassigned
    const portMatch = output.match(/port\s+(\d+)\s+is\s+in\s+use.*port\s+(\d+)\s+instead/i);
    if (portMatch) {
      const reassignedPort = parseInt(portMatch[2], 10);
      console.log(`Detected port reassignment! Setting active test port to ${reassignedPort}`);
      activePort = reassignedPort;
    }
  });

  // Wait for dev server to be ready and identify the active port
  console.log("Waiting for server startup...");
  let serverStarted = false;
  for (let i = 0; i < 15; i++) {
    // Probe both ports
    const port3000Ready = await checkPortReady(3000);
    const port3001Ready = await checkPortReady(3001);
    
    if (port3000Ready) {
      const apiReady = await verifyApiRoute(3000);
      if (apiReady) {
        activePort = 3000;
        serverStarted = true;
        break;
      }
    }
    
    if (port3001Ready) {
      const apiReady = await verifyApiRoute(3001);
      if (apiReady) {
        activePort = 3001;
        serverStarted = true;
        break;
      }
    }
    
    await delay(1000);
  }

  if (!serverStarted) {
    console.error("Error: Next.js dev server failed to expose /api/chat route on port 3000 or 3001.");
    devServer.kill();
    process.exit(1);
  }

  console.log(`Next.js dev server is fully ready and responding at port ${activePort}!`);

  const results = [];
  
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    console.log(`\n-----------------------------------------`);
    console.log(`Question ${i + 1}: "${q}"`);
    console.log(`Sending to Mbak PRISMA...`);
    
    try {
      const reply = await askQuestion(q);
      console.log(`Reply:`);
      console.log(`\x1b[32m%s\x1b[0m`, reply); // green text
      results.push({ question: q, reply });
    } catch (err) {
      console.error(`Error sending message:`, err.message);
      results.push({ question: q, reply: `ERROR: ${err.message}` });
    }
    
    // Add delay between questions to avoid rate limit or RPM triggers
    await delay(1200);
  }

  console.log("\n=========================================");
  console.log("          TEST SUITE CONCLUDED           ");
  console.log("=========================================");
  
  // Save results to markdown file
  const reportPath = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\3917e9a3-4a66-4b54-8343-989907e77659\\chatbot_test_results.md';
  let md = `# Mbak PRISMA Chatbot Validation Report\n\n`;
  md += `Executed on: ${new Date().toISOString()}\n`;
  md += `Active Port: ${activePort}\n`;
  md += `Model: llama-3.1-8b-instant\n\n`;
  md += `## Test Results\n\n`;
  
  for (let i = 0; i < results.length; i++) {
    md += `### ${i + 1}. Tanya: "${results[i].question}"\n`;
    md += `**Mbak PRISMA**: ${results[i].reply}\n\n`;
  }
  
  fs.writeFileSync(reportPath, md, 'utf8');
  console.log(`Test results saved to: ${reportPath}`);

  // Shutdown dev server
  console.log("\nStopping Next.js development server...");
  devServer.kill('SIGINT');
  
  // Small delay for clean exit
  await delay(1000);
  process.exit(0);
}

run();
