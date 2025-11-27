const fs = require("fs");
const path = require("path");

let output = "";

function printTree(dir, indent = "") {
  const files = fs.readdirSync(dir);

  files.forEach((file, index) => {
    if (file === "node_modules" || file === ".git") return; // skip big folders

    const isLast = index === files.length - 1;
    const prefix = isLast ? "└── " : "├── ";
    const nextIndent = indent + (isLast ? "    " : "│   ");

    output += indent + prefix + file + "\n";

    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      printTree(fullPath, nextIndent);
    }
  });
}

printTree(".");

// Write output to file
fs.writeFileSync("tree-output.txt", output);

console.log("✔ Folder tree saved to tree-output.txt");
