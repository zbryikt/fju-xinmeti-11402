const fs = require('fs');
const yaml = require('js-yaml');

// 讀取 YAML 資料
const data = yaml.load(fs.readFileSync('html.yaml', 'utf8'));

// 簡單的模板渲染函數
function render(template, data) {
    let result = template;
    
    // 替換標題
    result = result.replace(/\{\{\s*title\s*\}\}/g, data.title);
    
    // 處理 sections 迴圈
    const sectionMatch = result.match(/\{%\s*for\s+section\s+in\s+sections\s*%\}([\s\S]*?)\{%\s*endfor\s*%\}/);
    if (sectionMatch) {
        const sectionTemplate = sectionMatch[1];
        let sectionsHtml = '';
        
        data.sections.forEach(section => {
            let sHtml = sectionTemplate;
            sHtml = sHtml.replace(/\{\{\s*section\.h2\s*\}\}/g, section.h2);
            
            // 處理 paragraphs 迴圈
            const pMatch = sHtml.match(/\{%\s*for\s+p\s+in\s+section\.paragraphs\s*%\}([\s\S]*?)\{%\s*endfor\s*%\}/);
            if (pMatch) {
                const pTemplate = pMatch[1];
                const paragraphsHtml = section.paragraphs.map(p => pTemplate.replace(/\{\{\s*p\s*\}\}/g, p)).join('');
                sHtml = sHtml.replace(pMatch[0], paragraphsHtml);
            }
            
            // 處理 list_items 迴圈
            const liMatch = sHtml.match(/\{%\s*for\s+item\s+in\s+section\.list_items\s*%\}([\s\S]*?)\{%\s*endfor\s*%\}/);
            if (liMatch) {
                const liTemplate = liMatch[1];
                const listHtml = section.list_items.map(item => liTemplate.replace(/\{\{\s*item\s*\}\}/g, item)).join('');
                sHtml = sHtml.replace(liMatch[0], listHtml);
            }
            
            // 處理 buttons 迴圈
            const btnMatch = sHtml.match(/\{%\s*for\s+btn\s+in\s+section\.buttons\s*%\}([\s\S]*?)\{%\s*endfor\s*%\}/);
            if (btnMatch) {
                const btnTemplate = btnMatch[1];
                const buttonsHtml = section.buttons.map(btn => btnTemplate.replace(/\{\{\s*btn\s*\}\}/g, btn)).join('');
                sHtml = sHtml.replace(btnMatch[0], buttonsHtml);
            }
            
            // 處理 hashtags 迴圈
            const tagMatch = sHtml.match(/\{%\s*for\s+tag\s+in\s+section\.hashtags\s*%\}([\s\S]*?)\{%\s*endfor\s*%\}/);
            if (tagMatch) {
                const tagTemplate = tagMatch[1];
                const tagsHtml = section.hashtags.map(tag => tagTemplate.replace(/\{\{\s*tag\s*\}\}/g, tag)).join('');
                sHtml = sHtml.replace(tagMatch[0], tagsHtml);
            }
            
            sectionsHtml += sHtml;
        });
        
        result = result.replace(sectionMatch[0], sectionsHtml);
    }
    
    return result;
}

// 讀取模板
const template = fs.readFileSync('template.html', 'utf8');

// 渲染並寫入
const output = render(template, data);
fs.writeFileSync('output.html', output);

console.log('Successfully generated output.html from html.yaml');
