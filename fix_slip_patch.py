from pathlib import Path
path = Path('src/Karyawan/SlipgajiKaryawan.js')
text = path.read_text(encoding='utf-8')
old = """\t\t\t\t\t\t\t);\n\t\t\t\t\t\t{/* Tabel Detail Transaksi */}\n"""
new = """\t\t\t\t\t\t\t);\n\t\t\t\t\t\t})()\n\t\t\t\t\t</span></div>\n\t\t\t\t</div>\n\t\t\t</div>\n\n\t\t\t{/* Tabel Detail Transaksi */}\n"""
if old not in text:
    raise SystemExit('old pattern not found')
path.write_text(text.replace(old, new), encoding='utf-8')
print('patched')
