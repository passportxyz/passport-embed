# Embed Service Load Testing

This directory contains K6 load testing scripts for the embed service.

## Prerequisites

1. **Install K6**
   ```bash
   # macOS
   brew install k6

   # Linux
   sudo gpg -k
   sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg \
     --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
   echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | \
     sudo tee /etc/apt/sources.list.d/k6.list
   sudo apt-get update
   sudo apt-get install k6

   # Windows
   choco install k6
   ```

2. **Get API Key and Scorer ID**
   - Log into the Passport scorer dashboard
   - Create an API key with unlimited rate limits
   - Note your scorer ID

3. **Generate Address List**
   - Run the Django management command in the passport-scorer repo:
   ```bash
   cd /path/to/passport-scorer
   poetry run python api/manage.py export_addresses_for_load_testing \
     --days 7 \
     --limit 200 \
     --format json \
     --output addresses.json
   ```
   - Copy `addresses.json` to this directory

## Running Tests

### Quick Smoke Test (1 user, 30 seconds)
```bash
k6 run \
  --env EMBED_API_URL=https://embed.staging.passport.xyz \
  --env API_KEY=your-api-key-here \
  --env SCORER_ID=12345 \
  --env ADDRESSES_FILE=./addresses.json \
  --stage 30s:1 \
  embed-load-test.js
```

### Light Load Test (10 users, 2 minutes)
```bash
k6 run \
  --env EMBED_API_URL=https://embed.staging.passport.xyz \
  --env API_KEY=your-api-key-here \
  --env SCORER_ID=12345 \
  --env ADDRESSES_FILE=./addresses.json \
  --stage 30s:10 \
  --stage 1m:10 \
  --stage 30s:0 \
  embed-load-test.js
```

### Medium Load Test (50 users, 5 minutes)
```bash
k6 run \
  --env EMBED_API_URL=https://embed.staging.passport.xyz \
  --env API_KEY=your-api-key-here \
  --env SCORER_ID=12345 \
  --env ADDRESSES_FILE=./addresses.json \
  --stage 1m:50 \
  --stage 3m:50 \
  --stage 1m:0 \
  embed-load-test.js
```

### Heavy Load Test (100 users, 10 minutes)
```bash
k6 run \
  --env EMBED_API_URL=https://embed.staging.passport.xyz \
  --env API_KEY=your-api-key-here \
  --env SCORER_ID=12345 \
  --env ADDRESSES_FILE=./addresses.json \
  --stage 2m:100 \
  --stage 5m:100 \
  --stage 2m:0 \
  embed-load-test.js
```

### Spike Test (sudden burst to 200 users)
```bash
k6 run \
  --env EMBED_API_URL=https://embed.staging.passport.xyz \
  --env API_KEY=your-api-key-here \
  --env SCORER_ID=12345 \
  --env ADDRESSES_FILE=./addresses.json \
  --stage 10s:200 \
  --stage 1m:200 \
  --stage 10s:0 \
  embed-load-test.js
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `EMBED_API_URL` | No | `https://embed.staging.passport.xyz` | Embed service URL |
| `API_KEY` | **Yes** | - | API key with unlimited rate limits |
| `SCORER_ID` | **Yes** | - | Scorer ID from dashboard |
| `ADDRESSES_FILE` | No | `./addresses.json` | Path to JSON file with addresses |

## Metrics

The test tracks the following metrics:

### Built-in K6 Metrics
- `http_req_duration` - Total request duration
- `http_req_waiting` - Time waiting for response
- `http_req_failed` - Rate of failed requests
- `http_reqs` - Total HTTP requests
- `iterations` - Number of test iterations
- `vus` - Number of virtual users

### Custom Metrics
- `score_get_duration` - Duration of GET /embed/score requests
- `auto_verify_duration` - Duration of POST /embed/auto-verify requests
- `score_get_errors` - Error rate for score GET requests
- `auto_verify_errors` - Error rate for auto-verify requests

## Thresholds

The test defines these thresholds:

- **`http_req_failed < 5%`** - Less than 5% error rate
- **`http_req_duration p(95) < 2000ms`** - 95th percentile under 2 seconds
- **`score_get_duration p(95) < 1000ms`** - 95% of score gets under 1 second
- **`auto_verify_duration p(95) < 3000ms`** - 95% of auto-verifies under 3 seconds

## Output Example

```
     ✓ score GET status is 200
     ✓ score GET has score field
     ✓ auto-verify POST status is 200
     ✓ auto-verify POST has score

     auto_verify_duration..........: avg=1250ms min=450ms med=1100ms max=2800ms p(90)=1850ms p(95)=2100ms
     auto_verify_errors............: 0.00%  ✓ 0   ✗ 450
     http_req_duration.............: avg=850ms  min=200ms med=750ms  max=2800ms p(90)=1500ms p(95)=1800ms
     http_req_failed...............: 0.00%  ✓ 0   ✗ 900
     score_get_duration............: avg=450ms  min=200ms med=400ms  max=1200ms p(90)=650ms  p(95)=800ms
     score_get_errors..............: 0.00%  ✓ 0   ✗ 450

     ✓ http_req_failed: 0.00% < 5.00%
     ✓ http_req_duration: p(95)=1800ms < 2000ms
     ✓ score_get_duration: p(95)=800ms < 1000ms
     ✓ auto_verify_duration: p(95)=2100ms < 3000ms
```

## Troubleshooting

### Rate Limiting (429 errors)
- Make sure your API key has unlimited rate limits
- Reduce the number of virtual users
- Increase the `sleep()` time between requests

### Authentication Errors (401)
- Check that `API_KEY` is correct
- Verify the API key is active and not expired

### Not Found Errors (404)
- Verify `SCORER_ID` is correct
- Check that `EMBED_API_URL` is correct

### High Error Rates
- Check if the staging environment is healthy
- Reduce load to find the breaking point
- Check CloudWatch logs for backend errors

## Tips

1. **Start small** - Begin with a smoke test, then gradually increase load
2. **Use real addresses** - The Django export command gets addresses with actual stamps
3. **Monitor backend** - Watch CloudWatch metrics while running tests
4. **Test different scenarios**:
   - Constant load (same VU count throughout)
   - Ramp up (gradually increase load)
   - Spike (sudden burst of traffic)
   - Stress (push until it breaks)

## Next Steps

Once you've validated the load test works:

1. **Baseline** - Run tests against staging to establish baseline metrics
2. **Identify bottlenecks** - Use CloudWatch to find slow queries or external API calls
3. **Optimize** - Address performance issues
4. **Re-test** - Verify improvements with another load test
5. **Production** - Consider running periodic load tests in production (off-peak hours)
