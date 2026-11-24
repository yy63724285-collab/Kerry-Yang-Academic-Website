"""Rebuild the browser bundle after editing locales-data.json or locales-runtime.js."""
import json
from pathlib import Path
root = Path(__file__).resolve().parent.parent
messages = json.loads((root / 'locales-data.json').read_text(encoding='utf-8'))
keys = set(messages['en'])
assert set(messages) == {'en', 'zh-Hans', 'fr', 'es', 'ko', 'zh-Hant', 'yue', 'ja'}
for language, strings in messages.items():
    assert set(strings) == keys, f'Incomplete translations: {language}'
    assert all(isinstance(value, str) and value.strip() for value in strings.values()), language
runtime = (root / 'scripts/locales-runtime.js').read_text(encoding='utf-8')
(root / 'locales.js').write_text('const MESSAGES=' + json.dumps(messages, ensure_ascii=False, separators=(',', ':')) + ';\n' + runtime, encoding='utf-8')
print(f'Built {len(messages)} languages with {len(keys)} content keys each.')
