import re

with open('Aplicacao/magned_ai.js', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(r'  _quiz\(lower\) \{.*?return r;\n  \}', re.DOTALL)

replacement = '''  _quiz(lower) {
    const topic = this._detectTopic(lower);
    const questions = this._quizBank[topic] || this._quizBank['geral'];
    const selected = this._shuffleArray([...questions]).slice(0, 2);

    let r = <div style="font-family:sans-serif"><div style="font-size:1.1rem;font-weight:bold;margin-bottom:15px;color:var(--text-1)">?? Quiz — </div>;
    
    selected.forEach((q, i) => {
      r += <div style="margin-bottom:20px"><div style="font-weight:600;color:var(--text-1);margin-bottom:8px">. </div>;
      q.opts.forEach((opt, j) => {
        if (j === q.correct) {
          r += <div style="color:var(--mint); margin-top:4px"><i class="fas fa-check-circle"></i> ) </div>;
        } else {
          r += <div style="color:var(--text-2); margin-top:4px"><i class="far fa-circle"></i> ) </div>;
        }
      });
      r += <div style="color:var(--amber); font-style:italic; margin-top:10px; font-size:0.9em; border-left:3px solid var(--amber); padding-left:10px">Explicação: </div></div>;
    });

    r += <div style="border:1px solid var(--border); border-radius:16px; padding:20px; margin-top:20px; text-align:center; background:rgba(0,0,0,0.2)">
            <div style="display:flex; justify-content:center; gap:15px; margin-bottom:20px; position:relative; height:180px">
                <div style="position:absolute; background:var(--bg-elevated); padding:20px; border-radius:12px; border:1px solid var(--amber); width:160px; height:150px; transform:rotate(-5deg); left:calc(50% - 90px); box-shadow:0 8px 24px rgba(0,0,0,0.3); display:flex; flex-direction:column; justify-content:center; align-items:center; z-index:2">
                    <div style="font-weight:bold; margin-bottom:10px; color:var(--text-1); font-size:0.9rem">Pergunta:</div>
                    <div style="font-size:0.8rem; color:var(--text-2); margin-bottom:15px; text-align:center">...</div>
                    <button class="btn-s" style="padding:6px 12px; font-size:0.75rem; border:1px solid var(--amber); background:transparent; color:var(--amber)">Virar Cartão</button>
                </div>
                <div style="position:absolute; background:var(--bg-elevated); padding:20px; border-radius:12px; border:1px solid var(--border); width:160px; height:150px; transform:rotate(5deg); left:calc(50% - 70px); box-shadow:0 8px 24px rgba(0,0,0,0.3); display:flex; flex-direction:column; justify-content:center; align-items:center; opacity:0.6; z-index:1">
                    <div style="font-weight:bold; margin-bottom:10px; color:var(--text-1); font-size:0.9rem">Resposta:</div>
                    <div style="font-size:0.8rem; color:var(--text-2); text-align:center">...</div>
                </div>
            </div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; max-width:260px; margin:0 auto; margin-bottom:15px;">
                <button class="btn-s" style="background:transparent; border:1px solid var(--border); padding:6px 12px; font-size:0.8rem">< Anterior</button>
                <span style="font-weight:bold; color:var(--text-2); font-size:0.9rem">5 / 20</span>
                <button class="btn-s" style="background:transparent; border:1px solid var(--border); padding:6px 12px; font-size:0.8rem">Próximo ></button>
            </div>
            <button class="btn-s" style="width:100%; max-width:260px; justify-content:center; margin:0 auto; background:transparent; border:1px solid var(--amber); color:var(--amber)"><i class="fas fa-random" style="margin-right:6px"></i> Embaralhar</button>
        </div></div>;

    return r;
  }'''

new_content = pattern.sub(replacement.replace('$', '\\$').replace('\\$', '$'), content)

with open('Aplicacao/magned_ai.js', 'w', encoding='utf-8') as f:
    f.write(new_content)
