import yaml
from jinja2 import Template
import os

def generate_html():
    # 讀取內容檔案
    yaml_path = 'html.yaml'
    template_path = 'template.html'
    output_path = 'output.html'

    if not os.path.exists(yaml_path) or not os.path.exists(template_path):
        print("錯誤：找不到 html.yaml 或 template.html")
        return

    with open(yaml_path, 'r', encoding='utf-8') as f:
        content = yaml.safe_load(f)

    with open(template_path, 'r', encoding='utf-8') as f:
        template_str = f.read()

    # 使用 Jinja2 渲染
    template = Template(template_str)
    output_html = template.render(**content)

    # 寫入輸出檔案
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(output_html)

    print(f"成功！已生成 {output_path}")

if __name__ == "__main__":
    generate_html()
