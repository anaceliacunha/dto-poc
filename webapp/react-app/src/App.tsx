import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import clsx from 'clsx';
import { DemoMessage } from '../../../gen/ts-models/models/DemoMessage';

const javaUrl = 'http://localhost:8080/messages/java';
const pythonUrl = 'http://localhost:8000/messages/python';

const empty: DemoMessage = {
  id: 1,
  text: '',
  createdAt: new Date().toISOString(),
  active: true,
  items: [],
};

type PanelState = {
  java: DemoMessage[];
  javaFromPython: DemoMessage[];
  python: DemoMessage[];
  pythonFromJava: DemoMessage[];
};

const initialPanels: PanelState = {
  java: [],
  javaFromPython: [],
  python: [],
  pythonFromJava: [],
};

function App() {
  const [message, setMessage] = useState<DemoMessage>(empty);
  const [panels, setPanels] = useState<PanelState>(initialPanels);
  const [status, setStatus] = useState('');

  const handleChange = (field: keyof DemoMessage, value: unknown) => {
    setMessage((prev) => ({ ...prev, [field]: value ?? undefined }));
  };

  const submit = async (target: 'java' | 'python') => {
    const url = target === 'java' ? javaUrl : pythonUrl;
    setStatus(`Sending to ${target} ...`);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
    if (!response.ok) {
      setStatus(`Failed: ${response.statusText}`);
      return;
    }
    setStatus(`Accepted by ${target} service`);
    await refresh();
  };

  const fetchJson = useCallback(async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`GET ${url} failed (${res.status})`);
    return (await res.json()) as DemoMessage[];
  }, []);

  const refresh = useCallback(async () => {
    try {
      const [java, javaFromPython, python, pythonFromJava] = await Promise.all([
        fetchJson(javaUrl),
        fetchJson(`${javaUrl}/from-python`),
        fetchJson(pythonUrl),
        fetchJson(`${pythonUrl}/from-java`),
      ]);
      setPanels({ java, javaFromPython, python, pythonFromJava });
      setStatus('Panels updated');
    } catch (error) {
      setStatus((error as Error).message);
    }
  }, [fetchJson]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const payloadPreview = useMemo(() => JSON.stringify(message, null, 2), [message]);

  return (
    <div className="app">
      <header>
        <h1>Full Multi Language Demo</h1>
        <p>DTO types imported from OpenAPI-generated packages. Null/empty state toggles below.</p>
      </header>

      <section className="card">
        <h2>Compose DemoMessage</h2>
        <div className="grid">
          <label>
            ID
            <input
              type="number"
              value={message.id ?? ''}
              onChange={(event) => handleChange('id', Number(event.target.value))}
            />
          </label>
          <label>
            Text
            <input value={message.text ?? ''} onChange={(event) => handleChange('text', event.target.value)} />
          </label>
          <label>
            createdAt
            <input
              type="datetime-local"
              value={dayjs(message.createdAt).format('YYYY-MM-DDTHH:mm')}
              onChange={(event) => handleChange('createdAt', dayjs(event.target.value).toISOString())}
            />
          </label>
          <label>
            active
            <select
              value={message.active === null ? 'null' : message.active ? 'true' : 'false'}
              onChange={(event) =>
                handleChange(
                  'active',
                  event.target.value === 'null' ? null : event.target.value === 'true'
                )
              }
            >
              <option value="true">true</option>
              <option value="false">false</option>
              <option value="null">null</option>
            </select>
          </label>
          <label>
            class
            <input value={(message as any)['class'] ?? ''} onChange={(event) => handleChange('class', event.target.value)} />
          </label>
          <label>
            display-name
            <input
              value={(message as any)['display-name'] ?? ''}
              onChange={(event) => handleChange('display-name' as any, event.target.value)}
            />
          </label>
        </div>
        <div className="actions">
          <button onClick={() => submit('java')}>Send to Java</button>
          <button onClick={() => submit('python')}>Send to Python</button>
          <button onClick={refresh}>Refresh panels</button>
        </div>
        <pre>{payloadPreview}</pre>
        <p>{status}</p>
      </section>

      <section className="grid panels">
        <Panel title="Java REST" items={panels.java} />
        <Panel title="Python via Kafka" items={panels.javaFromPython} />
        <Panel title="Python REST" items={panels.python} />
        <Panel title="Java via Kafka" items={panels.pythonFromJava} />
      </section>
    </div>
  );
}

function Panel({ title, items }: { title: string; items: DemoMessage[] }) {
  return (
    <div className="card">
      <header className="panel-header">
        <h3>{title}</h3>
        <span className="badge">{items.length} entries</span>
      </header>
      {items.length === 0 ? (
        <p>No records yet.</p>
      ) : (
        items.map((item) => (
          <div key={`${title}-${item.id}-${item.createdAt}`} className="panel-item">
            <div className="panel-row">
              <strong>ID:</strong> {item.id}
              <span>{item.category}</span>
            </div>
            <div className="panel-row">
              <Badge label="text" value={item.text} />
              <Badge label="meta.tags" value={item.meta?.tags} />
              <Badge label="items" value={item.items} />
              <Badge label="binary" value={item.binaryData} />
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function Badge({ label, value }: { label: string; value: unknown }) {
  if (value === null) return <span className="badge badge-null">{label}: null</span>;
  if (Array.isArray(value) && value.length === 0) return <span className="badge badge-empty">{label}: []</span>;
  if (value === '') return <span className="badge badge-empty">{label}: empty</span>;
  if (typeof value === 'undefined') return <span className="badge">{label}: missing</span>;
  if (Array.isArray(value)) return <span className="badge">{label}: array ×{value.length}</span>;
  if (typeof value === 'object') return <span className="badge">{label}: object</span>;
  return <span className="badge">{label}: {String(value)}</span>;
}

export default App;
