import sys, os, json, time, base64, urllib.request, urllib.error
KEY = os.environ["GEMINI_API_KEY"]
BASE = "https://generativelanguage.googleapis.com/v1beta"
MODEL = "veo-3.1-fast-generate-preview"

def call(url, data=None):
    req = urllib.request.Request(url, data=json.dumps(data).encode() if data is not None else None,
                                 headers={"x-goog-api-key": KEY, "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=120) as r: return json.load(r)
    except urllib.error.HTTPError as e:
        print("HTTP", e.code, e.read().decode()[:800]); sys.exit(1)

def gen(image, mime, prompt, aspect, out, dur=6):
    body = {"instances": [{"prompt": prompt, "image": {"bytesBase64Encoded": base64.b64encode(open(image,"rb").read()).decode(), "mimeType": mime}}],
            "parameters": {"aspectRatio": aspect, "resolution": "720p", "durationSeconds": dur, "personGeneration": "allow_adult"}}
    op = call(f"{BASE}/models/{MODEL}:predictLongRunning", body)
    name = op["name"]; print("op", name, flush=True)
    while True:
        time.sleep(10)
        op = call(f"{BASE}/{name}")
        if op.get("done"): break
        print(".", end="", flush=True)
    if "error" in op: print(json.dumps(op["error"])); sys.exit(1)
    resp = op["response"]["generateVideoResponse"]
    if not resp.get("generatedSamples"): print("no samples:", json.dumps(resp)[:600]); sys.exit(1)
    uri = resp["generatedSamples"][0]["video"]["uri"]
    req = urllib.request.Request(uri, headers={"x-goog-api-key": KEY})
    with urllib.request.urlopen(req, timeout=300) as r, open(out, "wb") as f: f.write(r.read())
    print("saved", out, os.path.getsize(out))

if __name__ == "__main__":
    image, aspect, out = sys.argv[1], sys.argv[2], sys.argv[3]
    prompt = open(sys.argv[4]).read().strip()
    dur = int(sys.argv[5]) if len(sys.argv) > 5 else 6
    mime = "image/png" if image.endswith(".png") else "image/jpeg"
    gen(image, mime, prompt, aspect, out, dur)
