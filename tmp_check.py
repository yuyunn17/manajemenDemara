from pathlib import Path
p = Path(r'd:\laragon\www\gaji-demarahc-master\src\context\AppContext.js')
t = p.read_text(encoding='utf-8')
for pat in ['if (Array.isArray(slipRes)) {', '        if (Array.isArray(slipRes)) {']:
    print('pattern:', repr(pat))
    pos=[]
    idx=0
    while True:
        idx=t.find(pat, idx)
        if idx==-1:
            break
        pos.append(idx)
        idx += len(pat)
    print('count', len(pos))
    print(pos)
    for i, p in enumerate(pos):
        print('---', i)
        print(t[p-40:p+120].replace('\n','\\n'))
