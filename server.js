const http = require("http");
const fs = require("fs");
const path = require("path");
const querystring = require("querystring");

const PORT = 3000;

// Define absolute path to public directory
const publicDir = path.join(__dirname, "public");

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/") {
    // Serve hw5-work.html from /public
    const filePath = path.join(publicDir, "hw5-work.html");

    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Error reading hw5-work.html");
      } else {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
      }
    });
  }

  else if (req.method === "POST" && req.url === "/") {
    let body = "";

    req.on("data", chunk => {
      body += chunk.toString();
    });

    req.on("end", () => {
      const formData = querystring.parse(body);

      // Build table of *all* received data
      let tableRows = "";
      if (Object.keys(formData).length > 0) {
        for (const [key, value] of Object.entries(formData)) {
          tableRows += `<tr><td>${key}</td><td>${value}</td></tr>`;
        }
      } else {
        tableRows = `<tr><td colspan="2">(No form data received)</td></tr>`;
      }

      const tableHTML = `
        <h2>Submitted Form Data</h2>
        <table border="1" cellpadding="5" style="border-collapse: collapse;">
          <tr><th>Field</th><th>Value</th></tr>
          ${tableRows}
        </table>
        <br>
      `;

      // Read hw5-work.html from /public
      const filePath = path.join(publicDir, "hw5-work.html");

      fs.readFile(filePath, "utf8", (err, htmlData) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Error reading hw5-work.html");
          return;
        }

        // Remove "Homework 5" header if present
        const modifiedHtml = htmlData.replace(/<h1[^>]*>.*?Homework 5.*?<\/h1>/i, "");

        // Insert table before the form
        const finalHtml = modifiedHtml.replace(
          /(<form[^>]*>)/i,
          `${tableHTML}$1`
        );

        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(finalHtml);
      });
    });
  }

  else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

