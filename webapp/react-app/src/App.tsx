import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import dayjs from 'dayjs';
import './styles.css';
import type { DemoMessage as GeneratedDemoMessage } from './api/models/DemoMessage';
import { DemoMessageCategoryEnum } from './api';
import { DefaultApi } from './api';
import { Configuration, ResponseError } from './api';

type DemoMessage = Omit<
  GeneratedDemoMessage,
  '_class' | 'displayName' | 'withSpace' | 'snakeCase' | 'createdAt' | 'dateOnly'
> & {
  createdAt: string;
  dateOnly: string;
  class?: string | null;
  'display-name'?: string | null;
  'with space'?: string | null;
  snake_case?: string;
};

type Category = DemoMessageCategoryEnum;

type ItemRow = {
  code: string;
  quantity: string;
  weight: string;
};

type Responses = {
  java: DemoMessage[];
  javaFromPython: DemoMessage[];
  python: DemoMessage[];
  pythonFromJava: DemoMessage[];
};

type FormState = {
  id: string;
  text: string;
  createdAt: string;
  dateOnly: string;
  active: 'true' | 'false' | 'null';
  price: string;
  ratio: string;
  uuid: string;
  category: Category;
  binaryData: string;
  classValue: string;
  displayName: string;
  withSpace: string;
  snake_case: string;
  camelCase: string;
};

const initialForm: FormState = {
  id: '1',
  text: 'Interoperability FTW',
  createdAt: dayjs().toISOString(),
  dateOnly: dayjs().format('YYYY-MM-DD'),
  active: 'true',
  price: '19.99',
  ratio: '0.42',
  uuid:
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : '11111111-2222-3333-4444-555555555555',
  category: DemoMessageCategoryEnum.A,
  binaryData: '',
  classValue: 'react-client',
  displayName: 'React Control Room',
  withSpace: 'Contains space text',
  snake_case: 'snake_case_value',
  camelCase: 'camelCaseValue'
};

const emptyResponses: Responses = {
  java: [],
  javaFromPython: [],
  python: [],
  pythonFromJava: []
};

const buildSamplePayload = (): DemoMessage => {
  const timestamp = dayjs().toISOString();
  return {
    id: 999,
    text: '',
    createdAt: timestamp,
    active: null,
    price: 12345.6789,
    ratio: 0.33333334,
    uuid: '0f8fad5b-d9cb-469f-a165-70867728950e',
    category: DemoMessageCategoryEnum.C,
    meta: {
      locale: 'pt-BR',
      tags: [],
      metrics: {
        latencyMs: 15.4,
        ratioDrift: 0.000045
      }
    },
    binaryData: 'U2FtcGxlIEJhc2U2NA==',
    notes: { comment: 'Using object branch for notes' },
    class: 'react-sample',
    'display-name': '',
    'with space': '  ',
    snake_case: '',
    camelCase: 'sampleCamel'
  };
};

const parseDate = (value?: string | null): Date | undefined => {
  if (!value) return undefined;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.toDate() : undefined;
};

const parseDateOrNow = (value?: string | null): Date => parseDate(value) ?? new Date();

const mapGeneratedToLocal = (message: GeneratedDemoMessage): DemoMessage => {
  const { _class, displayName, withSpace, snakeCase, createdAt, dateOnly, ...rest } = message;
  return {
    ...rest,
    createdAt:
      createdAt instanceof Date
        ? createdAt.toISOString()
        : createdAt
          ? String(createdAt)
          : '',
    dateOnly:
      dateOnly instanceof Date
        ? dayjs(dateOnly).format('YYYY-MM-DD')
        : dateOnly
          ? String(dateOnly)
          : '',
    class: _class ?? null,
    'display-name': displayName ?? null,
    'with space': withSpace ?? null,
    snake_case: snakeCase ?? ''
  };
};

const mapLocalToGenerated = (message: DemoMessage): GeneratedDemoMessage => {
  const {
    class: classValue,
    'display-name': displayName,
    'with space': withSpace,
    snake_case,
    createdAt,
    dateOnly,
    ...rest
  } = message;

  return {
    ...(rest as GeneratedDemoMessage),
    createdAt: parseDateOrNow(createdAt),
    dateOnly: parseDate(dateOnly) ?? undefined,
    _class: classValue ?? undefined,
    displayName: displayName ?? undefined,
    withSpace: withSpace ?? undefined,
    snakeCase: snake_case ?? undefined
  };
};

const formatApiError = async (error: unknown): Promise<string> => {
  if (error instanceof ResponseError) {
    try {
      return await error.response.text();
    } catch {
      return error.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

const App = () => {
  const [form, setForm] = useState<FormState>(initialForm);
  const [metaLocale, setMetaLocale] = useState('en-US');
  const [metaTagsMode, setMetaTagsMode] = useState<'values' | 'empty' | 'null'>('values');
  const [metaTagsText, setMetaTagsText] = useState('react,shared,openapi');
  const [metaMetricsText, setMetaMetricsText] = useState('latency:15.4\nthroughput:0.99');
  const [itemsMode, setItemsMode] = useState<'values' | 'empty' | 'null'>('values');
  const [itemRows, setItemRows] = useState<ItemRow[]>([{
    code: 'SKU-1',
    quantity: '1',
    weight: '0.25'
  }]);
  const [notesMode, setNotesMode] = useState<'string' | 'object' | 'null'>('string');
  const [notesValue, setNotesValue] = useState('Plain string note');
  const [notesComment, setNotesComment] = useState('Nested comment note');
  const [binaryNull, setBinaryNull] = useState(false);
  const [responses, setResponses] = useState<Responses>(emptyResponses);
  const [status, setStatus] = useState<string>('');

  const javaApi = useMemo(
    () => new DefaultApi(new Configuration({ basePath: 'http://localhost:8080' })),
    []
  );
  const pythonApi = useMemo(
    () => new DefaultApi(new Configuration({ basePath: 'http://localhost:8000' })),
    []
  );

  const buildMeta = (): DemoMessage['meta'] => {
    const tags = (() => {
      if (metaTagsMode === 'null') return null;
      if (metaTagsMode === 'empty') return [];
      const parsed = metaTagsText
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
      return parsed.length ? parsed : [];
    })();

    const metrics: Record<string, number> = {};
    metaMetricsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .forEach((line) => {
        const [key, rawValue] = line.split(':');
        if (!key) return;
        const parsed = Number(rawValue);
        if (!Number.isNaN(parsed)) {
          metrics[key.trim()] = parsed;
        }
      });

    const hasMetrics = Object.keys(metrics).length > 0;
    if (!metaLocale && (metaTagsMode === 'values' && (!tags || tags.length === 0)) && !hasMetrics) {
      return undefined;
    }
    return {
      locale: metaLocale || undefined,
      tags,
      metrics: hasMetrics ? metrics : undefined
    };
  };

  const buildItems = (): DemoMessage['items'] => {
    if (itemsMode === 'null') return null;
    if (itemsMode === 'empty') return [];
    const parsed = itemRows
      .map((row) => ({
        code: row.code.trim(),
        quantity: row.quantity === '' ? null : Number(row.quantity),
        weight: row.weight === '' ? null : Number(row.weight)
      }))
      .filter((row) => row.code.length > 0)
      .map((row) => ({
        code: row.code,
        quantity: row.quantity,
        weight: row.weight
      }));
    return parsed.length ? parsed : [];
  };

  const buildNotes = (): DemoMessage['notes'] => {
    if (notesMode === 'null') return null;
    if (notesMode === 'object') {
      return { comment: notesComment };
    }
    return notesValue;
  };

  const buildPayload = (): DemoMessage => {
    const payload: DemoMessage = {
      id: Number(form.id) || 0,
      text: form.text,
      createdAt: form.createdAt || dayjs().toISOString(),
      dateOnly: form.dateOnly === '' ? '' : form.dateOnly,
      active:
        form.active === 'null' ? null : form.active === 'true',
      price: form.price === '' ? undefined : Number(form.price),
      ratio: form.ratio === '' ? undefined : Number(form.ratio),
      uuid: form.uuid || undefined,
      category: form.category,
      meta: buildMeta(),
      items: buildItems(),
      binaryData: binaryNull ? null : form.binaryData,
      notes: buildNotes(),
      class: form.classValue,
      'display-name': form.displayName,
      'with space': form.withSpace,
      snake_case: form.snake_case,
      camelCase: form.camelCase
    };
    return payload;
  };

  const handleFormChange = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleItemChange = (index: number, key: keyof ItemRow, value: string) => {
    setItemRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const addItemRow = () => {
    setItemRows((prev) => [...prev, { code: '', quantity: '', weight: '' }]);
  };

  const removeItemRow = (index: number) => {
    setItemRows((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleBinaryFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      handleFormChange('binaryData', base64 || '');
      setBinaryNull(false);
    };
    reader.readAsDataURL(file);
  };

  const sendMessage = async (target: 'java' | 'python') => {
    const payload = buildPayload();
    try {
      setStatus(`Sending payload to ${target} service...`);
      if (target === 'java') {
        await javaApi.publishJavaMessage({ demoMessage: mapLocalToGenerated(payload) });
      } else {
        await pythonApi.publishPythonMessage({ demoMessage: mapLocalToGenerated(payload) });
      }
      setStatus(`Accepted by ${target} service.`);
      await refreshAll();
    } catch (error) {
      const message = await formatApiError(error);
      setStatus(`Failed to send: ${message}`);
    }
  };

  const refreshAll = async () => {
    try {
      const [java, javaFromPython, python, pythonFromJava] = await Promise.all([
        javaApi.listJavaMessages(),
        javaApi.listMessagesFromPython(),
        pythonApi.listPythonMessages(),
        pythonApi.listMessagesFromJava()
      ]);
      setResponses({
        java: java.map(mapGeneratedToLocal),
        javaFromPython: javaFromPython.map(mapGeneratedToLocal),
        python: python.map(mapGeneratedToLocal),
        pythonFromJava: pythonFromJava.map(mapGeneratedToLocal)
      });
      setStatus('Payload caches refreshed.');
    } catch (error) {
      const message = await formatApiError(error);
      setStatus(`Unable to refresh: ${message}`);
    }
  };

  const loadSample = (reset?: boolean) => {
    let sample 
    if(reset) {
      sample = initialForm;
    } else {
      sample = buildSamplePayload();
    }
    setForm({
      id: sample.id.toString(),
      text: sample.text,
      createdAt: sample.createdAt,
      dateOnly: sample.dateOnly ?? '',
      active: 'null',
      price: sample.price?.toString() ?? '',
      ratio: sample.ratio?.toString() ?? '',
      uuid: sample.uuid ?? '',
      category: sample.category ?? DemoMessageCategoryEnum.A,
      binaryData: sample.binaryData ?? '',
      classValue: sample.class ?? '',
      displayName: sample['display-name'] ?? '',
      withSpace: sample['with space'] ?? '',
      snake_case: sample.snake_case ?? '',
      camelCase: sample.camelCase ?? ''
    });
    setMetaLocale(sample.meta?.locale ?? '');
    const tags = sample.meta?.tags;
    if (tags === null) {
      setMetaTagsMode('null');
      setMetaTagsText('');
    } else if (tags && tags.length === 0) {
      setMetaTagsMode('empty');
      setMetaTagsText('');
    } else {
      setMetaTagsMode('values');
      setMetaTagsText((tags ?? []).join(', '));
    }
    setMetaMetricsText(
      sample.meta?.metrics
        ? Object.entries(sample.meta.metrics)
            .map(([key, value]) => `${key}:${value}`)
            .join('\n')
        : ''
    );
    if (sample.items === null) {
      setItemsMode('null');
      setItemRows([{ code: '', quantity: '', weight: '' }]);
    } else if (sample.items?.length === 0) {
      setItemsMode('empty');
      setItemRows([{ code: '', quantity: '', weight: '' }]);
    } else {
      setItemsMode('values');
      setItemRows(
        sample.items?.map((item) => ({
          code: item.code,
          quantity: item.quantity?.toString() ?? '',
          weight: item.weight?.toString() ?? ''
        })) ?? []
      );
    }
    if (sample.notes === null) {
      setNotesMode('null');
      setNotesValue('');
      setNotesComment('');
    } else if (typeof sample.notes === 'string') {
      setNotesMode('string');
      setNotesValue(sample.notes);
      setNotesComment('');
    } else {
      setNotesMode('object');
      setNotesComment(sample.notes?.comment ?? '');
      setNotesValue('');
    }
    setBinaryNull(sample.binaryData === null);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const payloadPreview = useMemo(() => JSON.stringify(buildPayload(), null, 2), [form, metaLocale, metaTagsMode, metaTagsText, metaMetricsText, itemsMode, itemRows, notesMode, notesValue, notesComment, binaryNull]);

  return (
    <div className="app-shell">
      <header>
        <h1>Multi Language OpenAPI 3.1 Demo</h1>
        <p>
          Build a <strong>DemoMessage</strong> covering every type, then ship it to the Java
          or Python services via REST and Kafka.
        </p>
      </header>

      <div className="actions">
        <button className="sample-btn" type="button" onClick={() => loadSample()}>
          Load null/empty sample
        </button>
        <button className="sample-btn" type="button" onClick={() => loadSample(true)}>
          Reset to initial values
        </button>
      </div>

      <section className="grid grid-2">
        <div className="card">
          <h2>Message Builder</h2>
          <div className="field-group">
            <label>
              ID
              <input
                type="number"
                value={form.id}
                onChange={(event) => handleFormChange('id', event.target.value)}
              />
            </label>
            <label>
              Text
              <input
                value={form.text}
                onChange={(event) => handleFormChange('text', event.target.value)}
                placeholder="Empty string allowed"
              />
            </label>
            <label>
              createdAt
              <input
                type="datetime-local"
                value={form.createdAt ? dayjs(form.createdAt).format('YYYY-MM-DDTHH:mm') : ''}
                onChange={(event) => {
                  const raw = event.target.value;
                  handleFormChange('createdAt', raw ? dayjs(raw).toISOString() : '');
                }}
              />
            </label>
            <label>
              dateOnly
              <input
                type="date"
                value={form.dateOnly}
                onChange={(event) => handleFormChange('dateOnly', event.target.value)}
              />
            </label>
            <label>
              active
              <select value={form.active} onChange={(event) => handleFormChange('active', event.target.value as FormState['active'])}>
                <option value="true">true</option>
                <option value="false">false</option>
                <option value="null">null</option>
              </select>
            </label>
            <label>
              price (double)
              <input
                type="number"
                step="0.0001"
                value={form.price}
                onChange={(event) => handleFormChange('price', event.target.value)}
              />
            </label>
            <label>
              ratio (float)
              <input
                type="number"
                step="0.0001"
                value={form.ratio}
                onChange={(event) => handleFormChange('ratio', event.target.value)}
              />
            </label>
            <label>
              UUID
              <input value={form.uuid} onChange={(event) => handleFormChange('uuid', event.target.value)} />
            </label>
            <label>
              category
              <select value={form.category} onChange={(event) => handleFormChange('category', event.target.value as Category)}>
                {['A', 'B', 'C', 'D'].map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid" style={{ marginTop: '1rem' }}>
            <label>
              class
              <input value={form.classValue} onChange={(event) => handleFormChange('classValue', event.target.value)} />
            </label>
            <label>
              display-name
              <input value={form.displayName} onChange={(event) => handleFormChange('displayName', event.target.value)} />
            </label>
            <label>
              with space
              <input value={form.withSpace} onChange={(event) => handleFormChange('withSpace', event.target.value)} />
            </label>
            <label>
              snake_case
              <input value={form.snake_case} onChange={(event) => handleFormChange('snake_case', event.target.value)} />
            </label>
            <label>
              camelCase
              <input value={form.camelCase} onChange={(event) => handleFormChange('camelCase', event.target.value)} />
            </label>
          </div>

          <div className="grid" style={{ marginTop: '1rem' }}>
            <div>
              <label>
                meta.locale
                <input value={metaLocale} onChange={(event) => setMetaLocale(event.target.value)} />
              </label>
              <label>
                meta.tags
                <textarea
                  value={metaTagsText}
                  onChange={(event) => setMetaTagsText(event.target.value)}
                  placeholder="tag-a, tag-b"
                  disabled={metaTagsMode !== 'values'}
                />
              </label>
              <div className="flex-row">
                {(['values', 'empty', 'null'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={clsx('sample-btn', { active: metaTagsMode === mode })}
                    onClick={() => setMetaTagsMode(mode)}
                  >
                    tags = {mode === 'values' ? 'comma list' : mode}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label>
                meta.metrics (key:value)
                <textarea
                  value={metaMetricsText}
                  onChange={(event) => setMetaMetricsText(event.target.value)}
                  placeholder={'latency:12.5\nthrust:9'}
                />
              </label>
            </div>
          </div>

          <div className="grid" style={{ marginTop: '1rem' }}>
            <div>
              <div className="flex-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Items ({itemsMode})</h3>
                <div className="flex-row">
                  {(['values', 'empty', 'null'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      className={clsx('sample-btn', { active: itemsMode === mode })}
                      onClick={() => setItemsMode(mode)}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
              {itemsMode === 'values' && (
                <div className="items-list">
                  {itemRows.map((row, index) => (
                    <div key={index}>
                      <div className="field-group">
                        <label>
                          code
                          <input value={row.code} onChange={(event) => handleItemChange(index, 'code', event.target.value)} />
                        </label>
                        <label>
                          quantity
                          <input
                            type="number"
                            step="0.01"
                            value={row.quantity}
                            onChange={(event) => handleItemChange(index, 'quantity', event.target.value)}
                          />
                        </label>
                        <label>
                          weight
                          <input
                            type="number"
                            step="0.001"
                            value={row.weight}
                            onChange={(event) => handleItemChange(index, 'weight', event.target.value)}
                          />
                        </label>
                      </div>
                      <div className="actions">
                        <button type="button" className="sample-btn" onClick={() => removeItemRow(index)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <button type="button" className="sample-btn" onClick={addItemRow}>
                    Add item
                  </button>
                </div>
              )}
            </div>
            <div>
              <h3>Notes</h3>
              <div className="flex-row">
                {(['string', 'object', 'null'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={clsx('sample-btn', { active: notesMode === mode })}
                    onClick={() => setNotesMode(mode)}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              {notesMode === 'string' && (
                <textarea value={notesValue} onChange={(event) => setNotesValue(event.target.value)} />
              )}
              {notesMode === 'object' && (
                <textarea value={notesComment} onChange={(event) => setNotesComment(event.target.value)} placeholder="comment text" />
              )}
            </div>
          </div>

          <div className="grid" style={{ marginTop: '1rem' }}>
            <div>
              <label>
                binaryData (base64)
                <textarea
                  value={form.binaryData}
                  onChange={(event) => {
                    setBinaryNull(false);
                    handleFormChange('binaryData', event.target.value);
                  }}
                  placeholder="Paste base64 or upload a file"
                  disabled={binaryNull}
                />
              </label>
              <div className="flex-row">
                <input type="file" onChange={handleBinaryFile} />
                <button type="button" className="sample-btn" onClick={() => setBinaryNull(true)}>
                  Send null binary
                </button>
                <button type="button" className="sample-btn" onClick={() => setBinaryNull(false)}>
                  Keep string
                </button>
              </div>
            </div>
            <hr style={{ width: '100%' }} />
            <div>
              <label>
                <h3>Payload preview</h3>
                <pre style={{ maxHeight: 280, overflow: 'auto' }}>{payloadPreview}</pre>
              </label>
            </div>
          </div>

          <div className="actions">
            <button className="primary" type="button" onClick={() => sendMessage('java')}>
              Send to Java REST + Kafka
            </button>
            <button className="secondary" type="button" onClick={() => sendMessage('python')}>
              Send to Python REST + Kafka
            </button>
          </div>
          <hr style={{ width: '100%' }} />
          <h3>Status</h3>
          <p>{status}</p>
        </div>

        <div className="card responses">
          <h2>Kafka / REST Responses</h2>
          <div className="actions">
            <button className="sample-btn" type="button" onClick={refreshAll}>
              Refresh responses
            </button>
          </div>
          <ResponseSection
            title="Java REST storage"
            items={responses.java}
            description="What the Spring Boot service stored locally when you POST to /messages/java."
          />
          <ResponseSection
            title="From Python → Java"
            items={responses.javaFromPython}
            description="Kafka consumer at demo.from.python"
          />
          <ResponseSection
            title="Python REST storage"
            items={responses.python}
            description="FastAPI list of POSTed payloads"
          />
          <ResponseSection
            title="From Java → Python"
            items={responses.pythonFromJava}
            description="Kafka consumer at demo.from.java"
          />
        </div>
      </section>
    </div>
  );
};

const ResponseSection = ({
  title,
  items,
  description
}: {
  title: string;
  items: DemoMessage[];
  description: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="card" style={{ marginBottom: '1rem' }}>
      <button
        type="button"
        className="collapse-toggle"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          border: 'none',
          background: 'transparent',
          fontSize: '1rem',
          fontWeight: 600,
          color: 'white',
          cursor: 'pointer',
          padding: '0.25rem 0'
        }}
      >
        <span>{title}</span>
        <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>
          {items.length} {items.length === 1 ? 'entry' : 'entries'} · {isOpen ? 'Hide' : 'Show'}
        </span>
      </button>
      {isOpen && (
        <div style={{ marginTop: '0.75rem' }}>
          <p style={{ marginTop: 0 }}>{description}</p>
          {items.length === 0 ? (
            <p style={{ opacity: 0.7 }}>No data yet.</p>
          ) : (
            items.map((item) => <MessageCard key={`${item.id}-${item.createdAt}`} message={item} />)
          )}
        </div>
      )}
    </div>
  );
};

const MessageCard = ({ message }: { message: DemoMessage }) => {
  return (
    <div className="card" style={{ padding: '1rem', marginBottom: '0.8rem' }}>
      <div className="flex-row" style={{ justifyContent: 'space-between' }}>
        <div>
          <strong>ID:</strong> {message.id} · <strong>category:</strong> {message.category}
        </div>
        <div>
          <ValueBadge value={message.text} label="text" />
        </div>
      </div>
      <div className="flex-row">
        <ValueBadge value={message.active} label="active" />
        <ValueBadge value={message.meta?.tags} label="meta.tags" />
        <ValueBadge value={message.items} label="items" />
        <ValueBadge value={message.binaryData} label="binary" />
        <ValueBadge value={message.notes} label="notes" />
        <ValueBadge value={message['display-name']} label="display-name" />
        <ValueBadge value={message['with space']} label="with space" />
      </div>
      <pre style={{ marginTop: '0.5rem', maxHeight: 260, overflow: 'auto' }}>{JSON.stringify(message, null, 2)}</pre>
    </div>
  );
};

const ValueBadge = ({
  value,
  label
}: {
  value: unknown;
  label: string;
}) => {
  if (value === null) {
    return (
      <span className="badge badge-null">
        {label}: null
      </span>
    );
  }
  if (value === '') {
    return (
      <span className="badge badge-empty">
        {label}: empty string
      </span>
    );
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <span className="badge badge-empty">
          {label}: []
        </span>
      );
    }
    return (
      <span className="badge">
        {label}: array ×{value.length}
      </span>
    );
  }
  if (typeof value === 'object' && value !== null) {
    return (
      <span className="badge">
        {label}: object
      </span>
    );
  }
  if (typeof value === 'string' && value.length > 60) {
    return (
      <span className="badge badge-bytes">
        {label}: {value.length} chars
      </span>
    );
  }
  if (typeof value === 'undefined') {
    return (
      <span className="badge">
        {label}: missing
      </span>
    );
  }
  return (
    <span className="badge">
      {label}: {String(value)}
    </span>
  );
};

export default App;
