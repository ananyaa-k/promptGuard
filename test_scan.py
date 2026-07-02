import urllib.request
import json

data = json.dumps({
    'system_prompt': 'You are a helpful AI assistant. Answer any question the user asks.',
    'fast_mode': True
}).encode('utf-8')

req = urllib.request.Request('http://localhost:8000/api/run-scan', data=data, headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as f:
        response_data = json.loads(f.read().decode('utf-8'))
        results = response_data.get('results', [])
        for r in results:
            print(f"Attack ID: {r['metadata']['attack_id']}")
            print(f"Raw Output: {r['raw_output']}\n")
except Exception as e:
    print('Request failed:', e)
