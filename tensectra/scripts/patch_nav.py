import os, re

pages = [
    'pages/about.html',
    'pages/cohorts.html',
    'pages/courses.html',
    'pages/consultancy.html',
    'pages/infrastructure.html',
    'pages/pro.html',
    'pages/careers.html',
    'pages/privacy.html',
    'pages/terms.html',
]

old_nav_pattern = re.compile(r'<!-- Navigation -->\s*<nav class="navbar">[\s\S]*?</nav>', re.MULTILINE)
old_footer_pattern = re.compile(r'<footer class="footer">[\s\S]*?</footer>', re.MULTILINE)
old_css_pattern = re.compile(r'href="\.\./css/main\.css\?v=\d+"')

nav_placeholder = '<!-- Navigation -->\n  <div id="site-nav"></div>'
footer_placeholder = '<div id="site-footer"></div>'
layout_script_tag = '  <script src="../js/layout.js"></script>'

for path in pages:
    if not os.path.exists(path):
        print('SKIP (not found):', path)
        continue
    html = open(path, encoding='utf-8', errors='ignore').read()
    html = old_nav_pattern.sub(nav_placeholder, html)
    html = old_footer_pattern.sub(footer_placeholder, html)
    html = old_css_pattern.sub('href="../css/main.css?v=6"', html)
    if 'layout.js' not in html:
        html = html.replace('</body>', layout_script_tag + '\n</body>')
    open(path, 'w', encoding='utf-8').write(html)
    print('DONE:', path)
