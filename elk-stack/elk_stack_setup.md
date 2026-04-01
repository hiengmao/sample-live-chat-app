Below is a **practical, step-by-step guide** to set up a full **ELK stack (Logstash + Elasticsearch + Kibana)** for log aggregation, including working **Docker-based source code**, configs, and test data.

---

# 🧱 1. Architecture Overview

```
App / Logs → Logstash → Elasticsearch → Kibana (UI)
```

* **Elasticsearch** → stores logs
* **Logstash** → processes & ingests logs
* **Kibana** → visualizes logs

---

# ⚙️ 2. Prerequisites

* Docker + Docker Compose installed
* At least **4GB RAM** (ELK is heavy)
* Ports available:

  * `9200` → Elasticsearch
  * `5601` → Kibana
  * `5044` → Logstash (beats input)
  * `5000` → Logstash (TCP input)

---

# 📁 3. Project Structure

```
elk-stack/
├── docker-compose.yml
├── logstash/
│   ├── pipeline/
│   │   └── logstash.conf
│   └── config/
│       └── logstash.yml
```

---

# 🐳 4. Docker Compose Setup

### `docker-compose.yml`

```yaml
version: "3.8"

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.12.0
    container_name: elasticsearch
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - ES_JAVA_OPTS=-Xms1g -Xmx1g
    ports:
      - "9200:9200"
    networks:
      - elk

  logstash:
    image: docker.elastic.co/logstash/logstash:8.12.0
    container_name: logstash
    volumes:
      - ./logstash/pipeline:/usr/share/logstash/pipeline
      - ./logstash/config/logstash.yml:/usr/share/logstash/config/logstash.yml
    ports:
      - "5000:5000"
      - "5044:5044"
    depends_on:
      - elasticsearch
    networks:
      - elk

  kibana:
    image: docker.elastic.co/kibana/kibana:8.12.0
    container_name: kibana
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch
    networks:
      - elk

networks:
  elk:
    driver: bridge
```

---

# 🔧 5. Logstash Configuration

## `logstash/config/logstash.yml`

```yaml
http.host: "0.0.0.0"
xpack.monitoring.enabled: false
```

---

## `logstash/pipeline/logstash.conf`

```conf
input {
  tcp {
    port => 5000
    codec => json
  }
}

filter {
  # Example: parse timestamp
  date {
    match => ["timestamp", "ISO8601"]
  }
}

output {
  elasticsearch {
    hosts => ["http://elasticsearch:9200"]
    index => "app-logs-%{+YYYY.MM.dd}"
  }

  stdout {
    codec => rubydebug
  }
}
```

---

# ▶️ 6. Start the Stack

```bash
docker compose up -d
```

Check containers:

```bash
docker ps
```

---

# 🧪 7. Send Test Logs

Modify `server.ts` to send the logs.

**Changes made:**

1. **Add `net` module import** - for TCP connection to logstash

```typescript
import net from "net";
```

2. **Create `sendToLogstash()` function** - sends JSON-formatted logs to logstash on port 5000

```typescript
const LOGSTASH_HOST = process.env.LOGSTASH_HOST || "localhost";
const LOGSTASH_PORT = 5000;

// Function to send logs to Logstash
function sendToLogstash(logData: any) {
  const client = net.createConnection(LOGSTASH_PORT, LOGSTASH_HOST, () => {
    client.write(JSON.stringify(logData) + "\n");
    client.end();
  });

  client.on("error", (err) => {
    console.error("Failed to connect to Logstash:", err.message);
  });
}
```

3. **User connection logging** - sends event details when a user connected, including socket ID. In body of `io.on("connection", (socket) => {`, add:

```typescript    
io.on("connection", (socket) => {
    ...
    
    // Send connection log to Logstash
    sendToLogstash({
      timestamp: new Date().toISOString(),
      event: "user_connected",
      socketId: socket.id,
      message: `User connected with socket ID: ${socket.id}`,
    });

    ...
```

4. **User disconnection logging** - sends event details when a user disconnects, including user ID and name. 

```typescript
socket.on("disconnect", () => {
      ...
      if (user) {
        ...
        
        // Send disconnection log to Logstash
        sendToLogstash({
          timestamp: new Date().toISOString(),
          event: "user_disconnected",
          socketId: socket.id,
          userId: user.id,
          userName: user.name,
          message: `User ${user.name} (${user.id}) disconnected`,
        });
      }
```

5. Run:

```bash
npm run dev
```

---

# 📊 8. Access Kibana

Open:

```
http://localhost:5601
```

---

# 🔍 9. Create Index Pattern in Kibana

1. Go to **Stack Management**
2. Click **Index Management** -> **Index Templates** -> **Create template**.
3. Input a new template:

  - name: a unique name `app-logs`
  - pattern: `app-logs-*`

...

---

# 📈 10. View Logs

* Go to **Discover**
* Select your index
* You should see logs like:

```json
{
  "message": "Hello ELK",
  "level": "info"
}
```

---

# 🧠 11. Optional Enhancements

### ✅ Add File Input (read logs from file)

```conf
input {
  file {
    path => "/var/log/app.log"
    start_position => "beginning"
  }
}
```

---

### ✅ Add Grok Parsing (for structured logs)

```conf
filter {
  grok {
    match => { "message" => "%{COMBINEDAPACHELOG}" }
  }
}
```

---

### ✅ Add Beats (Production setup)

Use **Filebeat**:

```yaml
filebeat.inputs:
  - type: log
    paths:
      - /var/log/*.log

output.logstash:
  hosts: ["localhost:5044"]
```

---

# 🚀 12. Production Tips

* Enable security (`xpack.security.enabled=true`)
* Use persistent volumes for Elasticsearch
* Scale with multiple nodes
* Add monitoring (Elastic APM)

---

# 🧩 Summary

You now have:

* ✔️ Log ingestion via Logstash
* ✔️ Storage in Elasticsearch
* ✔️ Visualization in Kibana
* ✔️ Sample app sending logs
