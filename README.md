# Datadog MCP Server

A Model Context Protocol (MCP) server for interacting with the Datadog API.

[![MCP Server](https://glama.ai/mcp/servers/@GeLi2001/datadog-mcp-server/badge)](https://glama.ai/mcp/servers/@GeLi2001/datadog-mcp-server)

---

## Quick Start

```bash
npm install -g datadog-mcp-server
```

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "datadog": {
      "command": "npx",
      "args": [
        "datadog-mcp-server",
        "--apiKey", "<YOUR_API_KEY>",
        "--appKey", "<YOUR_APP_KEY>",
        "--site", "datadoghq.com"
      ]
    }
  }
}
```

Config file locations:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

---

## Prerequisites

- **Node.js** 18 or higher
- **Datadog account** with API credentials:
  - API Key (Organization Settings > API Keys)
  - Application Key (Organization Settings > Application Keys)

---

## Available Tools

| Tool | Description |
|------|-------------|
| `get-monitors` | List monitors with optional filtering by state, tags |
| `get-monitor` | Get a specific monitor by ID |
| `get-dashboards` | List all dashboards |
| `get-dashboard` | Get a specific dashboard by ID |
| `get-metrics` | List available metrics |
| `get-metric-metadata` | Get metadata for a specific metric |
| `get-events` | Fetch events within a time range |
| `get-incidents` | List incidents with optional filtering |
| `search-logs` | Search logs with query filtering |
| `aggregate-logs` | Perform analytics on log data |

---

## Configuration

### Environment Variables

Create a `.env` file:

```bash
DD_API_KEY=your_api_key
DD_APP_KEY=your_app_key
DD_SITE=datadoghq.com        # Required
DD_LOGS_SITE=datadoghq.com   # Optional, defaults to DD_SITE
DD_METRICS_SITE=datadoghq.com # Optional, defaults to DD_SITE
```

### Command-Line Arguments

```bash
datadog-mcp-server \
  --apiKey=your_api_key \
  --appKey=your_app_key \
  --site=datadoghq.com
```

Site arguments don't need `https://` — it's added automatically.

### Regional Endpoints

| Region | Endpoint |
|--------|----------|
| US (default) | `datadoghq.com` |
| EU | `datadoghq.eu` |
| US3 (GovCloud) | `ddog-gov.com` |
| US5 | `us5.datadoghq.com` |
| AP1 | `ap1.datadoghq.com` |

---

## Application Key Scopes

For better security, scope your Application Key to only the permissions this server needs.

### Required Scopes by Tool

| Tools | Scope | Description |
|-------|-------|-------------|
| `get-monitors`, `get-monitor` | `monitors_read` | Monitor configurations and states |
| `get-dashboards`, `get-dashboard` | `dashboards_read` | Dashboard definitions |
| `get-metrics`, `get-metric-metadata` | `metrics_read` | Metrics list and metadata |
| `get-events` | `events_read` | Event stream access |
| `search-logs`, `aggregate-logs` | `logs_read_data` | Log search and aggregation |
| `get-incidents` | `incident_read` | Incident management data |

### Common Scope Combinations

| Use Case | Scopes |
|----------|--------|
| Full access | `monitors_read`, `dashboards_read`, `metrics_read`, `events_read`, `logs_read_data`, `incident_read` |
| Logs only | `logs_read_data` |
| Monitoring only | `monitors_read`, `dashboards_read`, `metrics_read` |

To create a scoped key: **Organization Settings** > **Application Keys** > **New Key** > select scopes.

> **Note**: Unscoped keys inherit all permissions from the creating user. Always specify explicit scopes for production.

---

## Examples

<details>
<summary><strong>Get Monitors</strong></summary>

```json
{
  "method": "tools/call",
  "params": {
    "name": "get-monitors",
    "arguments": {
      "groupStates": ["alert", "warn"],
      "limit": 5
    }
  }
}
```
</details>

<details>
<summary><strong>Get Dashboard</strong></summary>

```json
{
  "method": "tools/call",
  "params": {
    "name": "get-dashboard",
    "arguments": {
      "dashboardId": "abc-def-123"
    }
  }
}
```
</details>

<details>
<summary><strong>Search Logs</strong></summary>

```json
{
  "method": "tools/call",
  "params": {
    "name": "search-logs",
    "arguments": {
      "filter": {
        "query": "service:web-app status:error",
        "from": "now-15m",
        "to": "now"
      },
      "sort": "-timestamp",
      "limit": 20
    }
  }
}
```
</details>

<details>
<summary><strong>Aggregate Logs</strong></summary>

```json
{
  "method": "tools/call",
  "params": {
    "name": "aggregate-logs",
    "arguments": {
      "filter": {
        "query": "service:web-app",
        "from": "now-1h",
        "to": "now"
      },
      "compute": [{ "aggregation": "count" }],
      "groupBy": [{
        "facet": "status",
        "limit": 10,
        "sort": { "aggregation": "count", "order": "desc" }
      }]
    }
  }
}
```
</details>

<details>
<summary><strong>Get Incidents</strong></summary>

```json
{
  "method": "tools/call",
  "params": {
    "name": "get-incidents",
    "arguments": {
      "includeArchived": false,
      "query": "state:active",
      "pageSize": 10
    }
  }
}
```
</details>

---

## Troubleshooting

### 403 Forbidden

1. Verify API key and Application key are correct
2. Check that keys have required [scopes](#application-key-scopes)
3. Confirm you're using the correct [regional endpoint](#regional-endpoints)

### Viewing MCP Logs

```bash
# macOS
tail -f ~/Library/Logs/Claude/mcp*.log

# Windows (PowerShell)
Get-Content "$env:APPDATA\Claude\Logs\mcp*.log" -Tail 20 -Wait
```

### Common Issues

| Error | Cause | Fix |
|-------|-------|-----|
| 403 Forbidden | Invalid or insufficient permissions | Check API/App keys and scopes |
| Invalid key format | Truncated or malformed key | Use full key strings |
| Site configuration error | Wrong regional endpoint | Match endpoint to your Datadog region |

---

## Installation from Source

```bash
git clone https://github.com/GeLi2001/datadog-mcp-server.git
cd datadog-mcp-server
npm install
npm run build
```

### Using with MCP Inspector

```bash
npx @modelcontextprotocol/inspector datadog-mcp-server \
  --apiKey=your_api_key \
  --appKey=your_app_key
```

---

## License

MIT
