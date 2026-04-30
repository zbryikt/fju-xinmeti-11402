import yaml
from jinja2 import Template
import os

def generate_html():
    # 讀取 YAML 內容
    with open('html.yaml', 'r', encoding='utf-8') as f:
        data = yaml.safe_load(f)

    # 讀取 HTML 模板
    with open('template.html', 'r', encoding='utf-8') as f:
        template_content = f.read()

    # 使用 Jinja2 渲染
    template = Template(template_content)
    output_html = template.render(data)

    # 寫入輸出檔案
    with open('output.html', 'w', encoding='utf-8') as f:
        f.write(output_html)

    print("Successfully generated output.html")

if __name__ == "__main__":
    # 確保安裝了必要套件
    try:
        import jinja2
        import yaml
    except ImportError:
        print("Missing dependencies. Installing pyyaml and jinja2...")
        os.system('pip install pyyaml jinja2')
        import jinja2
        import yaml
    
    generate_html()
