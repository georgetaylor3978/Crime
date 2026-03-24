const fs = require('fs');
const https = require('https');
const unzipper = require('unzipper');
const Papa = require('papaparse');

const JSON_OUT = 'data.js';

async function update() {
    console.log('Fetching download link...');
    try {
        const res = await fetch(`https://www150.statcan.gc.ca/t1/wds/rest/getFullTableDownloadCSV/35100177/en`);
        const json = await res.json();
        const url = json.object;
        
        await new Promise((resolve, reject) => {
            https.get(url, (resp) => {
                resp.pipe(unzipper.Parse())
                    .on('entry', (entry) => {
                        if (entry.path.endsWith('.csv') && !entry.path.includes('MetaData')) {
                            let results = [];
                            Papa.parse(entry, {
                                header: true,
                                step: (row, parser) => {
                                    const r = row.data;
                                    const refKey = Object.keys(r).find(k => k.includes('REF_DATE')) || 'REF_DATE';
                                    const yVal = r[refKey];
                                    
                                    if (r['VALUE'] && yVal && r['GEO'] === 'Canada' && r['Statistics'] === 'Actual incidents') {
                                        let v = r['Violations'];
                                        // AVOID DOUBLE COUNTING BY OMITTING 'TOTAL' AGGREGATES
                                        if (!v.toLowerCase().includes('total')) {
                                            results.push({ year: String(yVal), category: v, value: parseFloat(r['VALUE']) });
                                        }
                                    }
                                },
                                complete: () => {
                                    fs.writeFileSync(JSON_OUT, 'const rawData = ' + JSON.stringify(results) + ';');
                                    console.log('Crime updated. Records: ' + results.length);
                                    resolve();
                                }
                            });
                        } else {
                            entry.autodrain();
                        }
                    }).on('error', reject).on('finish', resolve);
            }).on('error', reject);
        });
    } catch(e) { console.error(e); }
}
update();
