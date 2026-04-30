import yaml
import os

def generate_html():
    # 讀取內容 (YAML)
    with open('index.yaml', 'r', encoding='utf-8') as f:
        data = yaml.safe_load(f)

    # 讀取樣板 (HTML)
    with open('template.html', 'r', encoding='utf-8') as f:
        template = f.read()

    # 建立 section 的 HTML
    sections_html = ""
    for section in data['sections']:
        s_html = f"<section>\n"
        s_html += f"  <h2>{section['title']}</h2>\n"
        
        # 段落
        for p in section['paragraphs']:
            s_html += f"  <p>{p}</p>\n"
        
        # 列表
        s_html += "  <ol>\n"
        for item in section['list_items']:
            s_html += f"    <li>{item}</li>\n"
        s_html += "  </ol>\n"
        
        # 按鈕
        s_html += '  <div class="btn-group">\n'
        for btn in section['buttons']:
            s_html += f'    <div class="btn btn-primary">{btn}</div>\n'
        s_html += '  </div>\n'
        
        # 標籤
        s_html += '  <div class="hashtag-group">\n'
        for tag in section['hashtags']:
            s_html += f'    <div class="hastag">{tag}</div>\n'
        s_html += '  </div>\n'
        
        s_html += "</section>\n"
        sections_html += s_html

    # 替換樣板變數
    output = template.replace('{{ page_title }}', data['page_title'])
    output = output.replace('{{ main_title }}', data['main_title'])
    output = output.replace('{{ sections_html }}', sections_html)

    # 寫入 output.html
    with open('output.html', 'w', encoding='utf-8') as f:
        f.write(output)
    
    print("成功！已生成 output.html")

if __name__ == "__main__":
    generate_html()
