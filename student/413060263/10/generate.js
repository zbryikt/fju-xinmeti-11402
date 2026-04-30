const fs = require('fs');
const yaml = require('js-yaml');

try {
    // 1. 讀取 YAML 內容
    const content = yaml.load(fs.readFileSync('index.yaml', 'utf8'));

    // 2. 讀取 HTML 樣板
    let template = fs.readFileSync('template.html', 'utf8');

    // 3. 替換基礎變數
    template = template.replace('{{title}}', content.title);
    template = template.replace('{{header.class}}', content.header.class);
    template = template.replace('{{header.text}}', content.header.text);

    // 4. 生成 Sections
    const sectionsHtml = content.sections.map(section => `
        <section>
            <h2>${section.title}</h2>
            ${section.paragraphs.map(p => `<p>${p}</p>`).join('\n            ')}
            <ol>
                ${section.list.map(li => `<li>${li}</li>`).join('\n                ')}
            </ol>
        </section>
    `).join('\n');
    template = template.replace('<!-- SECTIONS_PLACEHOLDER -->', sectionsHtml);

    // 5. 生成 Actions
    const actionsHtml = content.actions.map(action => `
        <div class="btn primary cta">${action}</div>
    `).join('\n            ');
    template = template.replace('<!-- ACTIONS_PLACEHOLDER -->', actionsHtml);

    // 6. 生成 Hashtags
    const hashtagsHtml = content.hashtags.map(tag => `
        <div class="hastag">${tag}</div>
    `).join('\n            ');
    template = template.replace('<!-- HASHTAGS_PLACEHOLDER -->', hashtagsHtml);

    // 7. 寫出 output.html
    fs.writeFileSync('output.html', template);
    console.log('Successfully generated output.html');

} catch (e) {
    console.error('Error during generation:', e);
}
