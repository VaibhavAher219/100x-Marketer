#!/usr/bin/env node
// Simple Node test client to avoid PowerShell quoting issues

const body = {
  country: 'us',
  query: 'Media Buyer',
  fromDays: '3',
  limit: 5,
}

async function main() {
  const res = await fetch('http://localhost:3000/api/ingest/apify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await res.json().catch(() => ({}))
  console.log(JSON.stringify({ status: res.status, json }, null, 2))
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})


