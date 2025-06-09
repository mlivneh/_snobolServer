const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
// מאפשר לשרת לקבל ולנתח גוף בקשה בפורמט JSON
app.use(express.json());
// מאפשר לשרת "להגיש" קבצים סטטיים מהתיקייה הנוכחית (כמו index.html)
app.use(express.static('.'));

// הנתיב לקובץ ההרצה של סנובול. ודא שהוא נמצא באותה תיקייה
const snobolExecutable = '/usr/local/bin/snobol4';

// נקודת הקצה (Endpoint) שתקבל את הקוד להרצה
app.post('/run-snobol', (req, res) => {
    const snobolCode = req.body.code;
    if (!snobolCode) {
        return res.status(400).json({ error: 'No code provided' });
    }

    // יוצרים קובץ זמני עם קוד הסנובול
    const tempFilePath = path.join(__dirname, `temp_snobol_${Date.now()}.snb`);
    fs.writeFileSync(tempFilePath, snobolCode);

    // מריצים את סנובול כתהליך-בן
    const snobolProcess = spawn(snobolExecutable, [tempFilePath]);

    let output = '';
    let errorOutput = '';

    // מאזינים לפלט הסטנדרטי (התוצאות)
    snobolProcess.stdout.on('data', (data) => {
        output += data.toString();
    });

    // מאזינים לפלט השגיאות
    snobolProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
    });

    // מאזינים לסיום התהליך
    snobolProcess.on('close', (code) => {
        // מוחקים את הקובץ הזמני
        fs.unlinkSync(tempFilePath);

        // שולחים את הפלט והשגיאות בחזרה ללקוח
        res.json({
            output: output,
            error: errorOutput,
            exitCode: code
        });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});