#!/usr/bin/env python3
"""src/ 의 파일을 합쳐 index.html 을 만든다.  사용: python3 build.py"""
import glob, os
d = os.path.dirname(os.path.abspath(__file__)); r = lambda p: open(os.path.join(d, p), encoding='utf8').read()
js = ''.join(open(f, encoding='utf8').read() for f in sorted(glob.glob(os.path.join(d, 'src/js/*.js'))))
out = r('src/head.html') + r('src/style.css') + r('src/mid.html') + js + r('src/tail.html')
open(os.path.join(d, 'index.html'), 'w', encoding='utf8').write(out)
print(len(out) // 1024, 'KB')
