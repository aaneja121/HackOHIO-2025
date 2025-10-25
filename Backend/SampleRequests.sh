# Login / create demo user
curl -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"external_id":"demo-user-1","display_name":"Ari"}'

# Checklist
curl -H "X-API-Key: demo-key-123" http://127.0.0.1:8000/checklist/today

# Wound assess
curl -X POST http://127.0.0.1:8000/wounds/assess \
  -H "X-API-Key: demo-key-123" \
  -F "user_external_id=demo-user-1" \
  -F "file=@/path/to/wound_photo.jpg"

# Symptom log
curl -X POST http://127.0.0.1:8000/symptoms \
  -H "X-API-Key: demo-key-123" \
  -H "Content-Type: application/json" \
  -F "user_external_id=demo-user-1" \
  -d '{"text":"I feel throbbing pain and some redness"}'

# Risk
curl -H "X-API-Key: demo-key-123" http://127.0.0.1:8000/patients/demo-user-1/risk
