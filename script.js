:root{
  --bg:#ffffff;
  --text:#0a0d14;
  --muted:#6b7280;
  --brand:#1f4fb2;
  --brand-2:#245ed1;
  --card:#f7f8fb;
  --line:#e6e8f0;
  --success:#0ea35a;
  --warn:#b45309;
}

*{box-sizing:border-box}
html,body{margin:0;padding:0;background:var(--bg);color:var(--text);font:16px/1.5 system-ui,-apple-system,Segoe UI,Roboto,Inter,Arial,sans-serif}

.container{width:min(1120px,92vw);margin-inline:auto}

.site-header{border-bottom:1px solid var(--line);background:#fff}
.header-inner{display:flex;align-items:center;gap:16px;padding:14px 0}
.logo{height:34px;width:auto;display:block}
.page-title{font-size:1rem;font-weight:600;margin-left:auto;color:var(--muted)}

.hero{position:relative;min-height:36vh;display:grid;place-items:center}
.hero-media{
  position:absolute;inset:0;
  background:url("/hero.jpg") center/cover no-repeat;
  filter:grayscale(0.15) contrast(1.05) brightness(0.95);
}
.hero-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,13,20,.25),rgba(10,13,20,.55))}
.hero-content{position:relative;color:#fff;text-align:center;padding:48px 0}
.hero h2{font-size:2rem;margin:0 0 8px}
.hero p{opacity:.95;margin:0}

.form-wrap{padding:32px 0 56px}
.card{
  background:var(--card);
  border:1px solid var(--line);
  border-radius:14px;
  padding:22px;
  box-shadow:0 1px 4px rgba(0,0,0,.04);
}

.grid{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:16px;
}
.field{display:flex;flex-direction:column;gap:6px}
.field span, .field legend{font-weight:600;font-size:.92rem}
.field b{color:var(--brand)}
.field input, .field select, .field textarea{
  appearance:none;
  border:1px solid var(--line);
  background:#fff;
  border-radius:10px;
  padding:12px 12px;
  font-size:1rem;
  outline:none;
}
.field input:focus, .field select:focus, .field textarea:focus{
  border-color:var(--brand);
  box-shadow:0 0 0 3px rgba(31,79,178,.12);
}
.field--full{grid-column:1/-1}

.radio{display:inline-flex;align-items:center;gap:8px;margin-right:16px}

.honeypot{position:absolute;left:-9999px;opacity:0;height:0;width:0}

.notice{
  margin:8px 0 0;
  padding:10px 12px;
  border-radius:10px;
  font-size:.95rem;
  background:#fff3e6;
  color:#7a3e09;
  border:1px solid #f3dcc3;
}

.btn{
  display:inline-flex;align-items:center;justify-content:center;
  border:1px solid transparent;border-radius:12px;
  padding:12px 16px;font-weight:700;cursor:pointer
}
.btn-primary{background:var(--brand);color:#fff}
.btn-primary:hover{background:var(--brand-2)}

.tiny{color:var(--muted);font-size:.85rem;margin-top:8px}

.site-footer{border-top:1px solid var(--line);padding:22px 0;color:var(--muted);background:#fff}

@media (max-width: 820px){
  .grid{grid-template-columns:1fr}
  .hero{min-height:30vh}
  .hero h2{font-size:1.6rem}
}
