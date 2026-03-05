const fs = require('fs');
const basePath = '/home/angelo/ai-projects/deep-ion/frontend/src/shared/i18n/locales';
const en = JSON.parse(fs.readFileSync(basePath + '/en/common.json', 'utf8'));

function flattenObj(obj, prefix) {
  prefix = prefix || '';
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? prefix + '.' + k : k;
    if (typeof v === 'object' && v !== null) Object.assign(result, flattenObj(v, key));
    else result[key] = v;
  }
  return result;
}

function unflattenObj(flat) {
  const result = {};
  for (const [dotpath, val] of Object.entries(flat)) {
    const parts = dotpath.split('.');
    let cur = result;
    for (let i = 0; i < parts.length - 1; i++) {
      if (cur[parts[i]] === undefined) cur[parts[i]] = {};
      cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = val;
  }
  return result;
}

const enFlat = flattenObj(en);
const esMap = JSON.parse(fs.readFileSync(basePath + '/_es_map.json', 'utf8'));
const frMap = JSON.parse(fs.readFileSync(basePath + '/_fr_map.json', 'utf8'));

const esFlat = {};
const frFlat = {};
for (const [key, val] of Object.entries(enFlat)) {
  esFlat[key] = esMap[key] !== undefined ? esMap[key] : val;
  frFlat[key] = frMap[key] !== undefined ? frMap[key] : val;
}

fs.writeFileSync(basePath + '/es/common.json', JSON.stringify(unflattenObj(esFlat), null, 2) + '\n');
fs.writeFileSync(basePath + '/fr/common.json', JSON.stringify(unflattenObj(frFlat), null, 2) + '\n');
console.log('ES: ' + Object.keys(esMap).length + '/' + Object.keys(enFlat).length);
console.log('FR: ' + Object.keys(frMap).length + '/' + Object.keys(enFlat).length);
