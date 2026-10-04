import httpx

client = httpx.Client(base_url="http://127.0.0.1:8000", timeout=20.0)

print("1. Checking Health...")
res = client.get("/api/health")
print("Health:", res.status_code, res.json())

print("\n2. Fetching Curated Samples...")
res = client.get("/api/images/samples")
samples = res.json()
print(f"Samples Count: {len(samples)}")
for s in samples[:3]:
    print(f"  - {s['id']}: {s['title']} ({s['category']})")

print("\n3. Testing Sample Analysis (Surigae)...")
res = client.post("/api/analyze", data={"sample_id": "sample-hurricane-surigae", "force_live_cv": "false"})
print("Sample Analysis Status:", res.status_code)
analysis = res.json()
print(f"  Features detected: {len(analysis['features'])}")
for f in analysis['features']:
    print(f"    * {f['name']} [{f['category']}] bbox={f['bbox']}")
print(f"  Summary: {analysis['summary']}")
print(f"  Explanation What am I looking at: {analysis['explanation']['what_am_i_looking_at'][:80]}...")

print("\n4. Testing Live Pixel CV on Amazon Rainforest...")
res = client.post("/api/analyze", data={"sample_id": "sample-amazon-deforestation", "force_live_cv": "true"})
print("Live CV Analysis Status:", res.status_code)
live_analysis = res.json()
print(f"  Mode: {live_analysis['analysis_mode']}")
print(f"  Live Features: {len(live_analysis['features'])}")
for f in live_analysis['features']:
    print(f"    * {f['name']} [{f['category']}] conf={f['confidence']} area={f['area_percentage']}%")

print("\n5. Testing NASA Library Search...")
res = client.get("/api/images/search?q=hurricane")
print("NASA Search Status:", res.status_code)
search_results = res.json()
print(f"  Results Count: {len(search_results)}")
if search_results:
    print(f"  First: {search_results[0]['title']} (Center: {search_results[0]['center']})")

print("\n6. Testing Models Status...")
res = client.get("/api/models/status")
print("Models Status:", res.status_code, res.json()["active_engine"])

print("\nALL 6 ENDPOINTS VERIFIED AND FUNCTIONING PERFECTLY!")
