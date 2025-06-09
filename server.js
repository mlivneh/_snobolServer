const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// CORS middleware - הוסף את זה!
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Origin');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Parse JSON bodies
app.use(express.json());

// Serve static files
app.use(express.static('.'));

// SNOBOL4 executable path
const snobolExecutable = '/usr/local/bin/snobol4';

app.post('/run-snobol', (req, res) => {
    const { code } = req.body;
    
    if (!code) {
        return res.status(400).json({ error: 'No code provided' });
    }

    // Create a temporary file with the SNOBOL4 code
    const tempFileName = `temp_snobol_${Date.now()}.snb`;
    const tempFilePath = path.join(__dirname, tempFileName);
    
    fs.writeFileSync(tempFilePath, code);

    // Execute SNOBOL4
    const snobol = spawn(snobolExecutable, [tempFilePath]);
    
    let output = '';
    let error = '';

    snobol.stdout.on('data', (data) => {
        output += data.toString();
    });

    snobol.stderr.on('data', (data) => {
        error += data.toString();
    });

    snobol.on('close', (code) => {
        // Clean up temporary file
        try {
            fs.unlinkSync(tempFilePath);
        } catch (e) {
            console.error('Failed to delete temp file:', e);
        }

        res.json({
            output: output,
            error: error,
            exitCode: code
        });
    });

    snobol.on('error', (err) => {
        try {
            fs.unlinkSync(tempFilePath);
        } catch (e) {
            console.error('Failed to delete temp file:', e);
        }

        res.status(500).json({
            output: '',
            error: `Failed to execute SNOBOL4: ${err.message}`,
            exitCode: 1
        });
    });
});

app.get('/', (req, res) => {
    res.send(`
        <h1>SNOBOL4 Online Runner</h1>
        <p>Send POST requests to /run-snobol with JSON body: {"code": "your snobol code"}</p>
        <p>CORS is enabled for all origins.</p>
    `);
});

app.listen(port, () => {
    console.log(`SNOBOL4 server running on port ${port}`);
});