import { writeFile } from "node:fs/promises";

const chars =
  " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";

const width = 7;
const height = 9;
const spacing = 0; // 文字間隔
const cols = 18; // 1行あたりの文字数

let xml = `<?xml version="1.0"?>
<font>
  <info face="Oldschool" size="${height}"/>
  <common lineHeight="${height}" scaleW="128" scaleH="64" pages="1"/>
  <pages>
    <page id="0" file="oldschool.png"/>
  </pages>
  <chars count="${chars.length}">\n`;

for (let i = 0; i < chars.length; i++) {
  const ch = chars[i];
  const code = ch.charCodeAt(0);
  const col = i % cols;
  const row = Math.floor(i / cols);
  const x = col * (width + spacing);
  const y = row * (height + spacing);
  xml += `    <char id="${code}" x="${x}" y="${y}" width="${width}" height="${height}" xoffset="0" yoffset="1" xadvance="${
    width + spacing
  }" page="0" chnl="0"/>\n`;
}

xml += "  </chars>\n</font>";

await writeFile("oldschool.fnt", xml);
console.log("✅ oldschool.fnt generated!");
