const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const mustache = require('mustache');

try {
    // 1. 讀取內容檔案 (YAML)
    const yamlContent = fs.readFileSync(path.join(__dirname, 'index.yaml'), 'utf8');
    const data = yaml.load(yamlContent);

    // 2. 讀取樣板檔案 (HTML)
    const template = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');

    // 3. 合成 HTML
    const output = mustache.render(template, data);

    // 4. 寫入輸出檔案
    fs.writeFileSync(path.join(__dirname, 'output.html'), output);
    console.log('成功生成 output.html');

} catch (e) {
    console.error('執行失敗:', e);
}
