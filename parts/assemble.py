import re, io

MAP = {
 'card':'panel','grid':'grid2','label':'stat-label','live':'live-badge',
 'live-dot':'pulse','meta':'src-note','note':'caveat','sec-head':'sec',
 'skeleton':'','small':'sub','src-card':'panel','src-grid':'grid2',
 'tag':'','ticker':'','track':'bar-track','value':'stat-num',
}

def remap(html):
    def fix(m):
        cls = m.group(1).split()
        out = []
        for c in cls:
            c2 = MAP.get(c, c)
            if c2 and c2 not in out:
                out.append(c2)
        return 'class="%s"' % ' '.join(out)
    return re.sub(r'class="([^"]*)"', fix, html)

def read(p):
    return open(p, encoding='utf-8').read()

stats    = remap(read('parts/stats.sections.html'))
karhutla = remap(read('parts/karhutla.sections.html'))
alam     = read('alam-indonesia.html')
stats_js = read('parts/stats.js')
karh_js  = read('parts/karhutla.js')

# strip the alam fragment's own <style> (theme.css handles it) but keep any scoped rules
alam_style = '\n'.join(re.findall(r'(?is)<style[^>]*>(.*?)</style>', alam))
alam_body  = re.sub(r'(?is)<style[^>]*>.*?</style>', '', alam)

TABS = [
 ('#ringkasan','Ringkasan'),
 ('#alam','Alam Indonesia'),
 ('#karhutla','Karhutla 2026'),
 ('#data','Data'),
 ('#sumber','Sumber'),
]

head = """<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Bangun Negeri — Data Indonesia</title>
<meta name="description" content="Data Indonesia dalam satu halaman: statistik nasional, alam dan keanekaragaman hayati, serta kebakaran hutan dan lahan 2026.">
<link rel="stylesheet" href="theme.css">
</head>
<body>
<header class="site">
  <div class="wrap">
    <div class="brand">Bangun Negeri <span class="ver">v1.0</span></div>
    <nav class="tabs">
"""
head += ''.join('      <a href="%s">%s</a>\n' % (h,t) for h,t in TABS)
head += """    </nav>
  </div>
</header>
<main class="wrap">
"""

tail = """
</main>
<footer class="site">
  <div class="wrap">
    <p>Bangun Negeri — halaman data terbuka. Angka disertai tahun dan sumbernya; bila sumber resmi berbeda, perbedaan itu ditampilkan, bukan diratakan.</p>
    <p class="src-note">Data live diambil langsung dari API publik di peramban Anda. Halaman ini tidak menyimpan data pengunjung.</p>
  </div>
</footer>
<script>
%s
</script>
<script>
%s
</script>
</body>
</html>
""" % (stats_js, karh_js)

out = head + stats + '\n' + alam_body + '\n' + karhutla + tail
open('index.html','w',encoding='utf-8').write(out)
print('written', len(out), 'bytes')
