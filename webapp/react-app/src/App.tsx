import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import dayjs from 'dayjs';
import './styles.css';
import type { DemoMessage as GeneratedDemoMessage } from '@activate/api-models';
import { DemoMessageCategoryEnum, Item } from '@activate/api-models';
import { DefaultApi } from '@activate/api-models';
import { Configuration } from '@activate/api-models';

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
    binaryDataFilename: string;
    classValue: string;
    displayName: string;
    withSpace: string;
    snake_case: string;
    camelCase: string;
};

const createInitialForm = (): FormState => ({
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
    binaryData: 'VGVzdCBiaW5hcnkgZGF0YQ==', // Base64 for "Test binary data"
    binaryDataFilename: 'sample.txt',
    classValue: 'react-client',
    displayName: 'React Control Room',
    withSpace: 'Contains space text',
    snake_case: 'snake_case_value',
    camelCase: 'camelCaseValue'
});

const defaultMetaLocale = 'en-US';
const defaultMetaTagsMode: 'values' | 'empty' | 'null' = 'values';
const defaultMetaTagsText = 'react,shared,openapi';
const defaultMetaMetricsText = 'latency:15.4\nthroughput:0.99';
const defaultItemsMode: 'values' | 'empty' | 'null' = 'values';
const defaultBinaryNull = false;
const createInitialItemRows = (): ItemRow[] => [
    {
        code: 'SKU-1',
        quantity: '1',
        weight: '0.25'
    }
];

const emptyResponses: Responses = {
    java: [],
    javaFromPython: [],
    python: [],
    pythonFromJava: []
};

const parseDate = (value?: string | null): Date | undefined => {
    if (!value) return undefined;
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.toDate() : undefined;
};

const parseDateOrNow = (value?: string | null): Date => parseDate(value) ?? new Date();

const toDownloadBlob = (value: string): Blob => {
    try {
        const cleaned = value.replace(/\s/g, '');
        const byteChars = atob(cleaned);
        const byteNumbers = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i += 1) {
            byteNumbers[i] = byteChars.charCodeAt(i);
        }
        return new Blob([new Uint8Array(byteNumbers)]);
    } catch {
        return new Blob([value], { type: 'application/octet-stream' });
    }
};

const downloadBinaryData = (value: string, filename = 'binaryData.bin') => {
    const blob = toDownloadBlob(value);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
};

const mapGeneratedToLocal = (message: GeneratedDemoMessage): DemoMessage => {
    const { _class, display_name, with_space, snake_case, createdAt, dateOnly, ...rest } = message;
    return {
        ...rest,
        createdAt: createdAt?.toISOString() ?? new Date().toISOString(),
        dateOnly:
            dateOnly instanceof Date
                ? dayjs(dateOnly).format('YYYY-MM-DD')
                : dateOnly
                    ? String(dateOnly)
                    : '',
        class: _class ?? null,
        'display-name': display_name ?? null,
        'with space': with_space ?? null,
        snake_case: snake_case ?? ''
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
        display_name: displayName ?? undefined,
        with_space: withSpace ?? undefined,
        snake_case: snake_case ?? undefined
    };
};

const formatApiError = async (error: unknown): Promise<string> => {
    if (error instanceof Response) {
        try {
            const text = await error.text();
            return text || error.statusText;
        } catch {
            return error.statusText;
        }
    }
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
};

const App = () => {
    const [form, setForm] = useState<FormState>(createInitialForm);
    const [metaLocale, setMetaLocale] = useState(defaultMetaLocale);
    const [metaTagsMode, setMetaTagsMode] = useState<'values' | 'empty' | 'null'>(defaultMetaTagsMode);
    const [metaTagsText, setMetaTagsText] = useState(defaultMetaTagsText);
    const [metaMetricsText, setMetaMetricsText] = useState(defaultMetaMetricsText);
    const [itemsMode, setItemsMode] = useState<'values' | 'empty' | 'null'>(defaultItemsMode);
    const [itemRows, setItemRows] = useState<ItemRow[]>(createInitialItemRows);
    const [binaryNull, setBinaryNull] = useState(defaultBinaryNull);
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
            if (metaTagsMode === 'null') return undefined;
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
        if (itemsMode === 'null') return undefined;
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
        return parsed.length ? parsed as Item[]: [];
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
            // @ts-ignore
            binaryData: binaryNull ? undefined : form.binaryData,
            binaryDataFilename: binaryNull || !form.binaryDataFilename ? undefined : form.binaryDataFilename,
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
            handleFormChange('binaryDataFilename', file.name);
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

    const resetForm = () => {
        setForm(createInitialForm());
        setMetaLocale(defaultMetaLocale);
        setMetaTagsMode(defaultMetaTagsMode);
        setMetaTagsText(defaultMetaTagsText);
        setMetaMetricsText(defaultMetaMetricsText);
        setItemsMode(defaultItemsMode);
        setItemRows(createInitialItemRows());
        setBinaryNull(defaultBinaryNull);
    };


    useEffect(() => {
        refreshAll();
    }, []);

    const payloadPreview = useMemo(() => JSON.stringify(buildPayload(), null, 2), [form, metaLocale, metaTagsMode, metaTagsText, metaMetricsText, itemsMode, itemRows, binaryNull]);

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
                <button className="sample-btn" type="button" onClick={resetForm}>
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

                    <div style={{ marginTop: '1rem' }}>
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

                    <div className="grid" style={{ marginTop: '1rem' }}>
                        <div>
                            <label>
                                binaryData (base64)
                                {!binaryNull && <textarea
                                    style={{ maxHeight: '8rem', overflow: 'auto', maxWidth: '100%' }}
                                    value={form.binaryData}
                                    onChange={(event) => {
                                        setBinaryNull(false);
                                        handleFormChange('binaryData', event.target.value);
                                    }}
                                    placeholder="Paste base64 or upload a file"
                                    disabled={binaryNull}
                                />}
                            </label>
                            <label>
                                binaryData filename
                                <input
                                    value={form.binaryDataFilename}
                                    onChange={(event) => handleFormChange('binaryDataFilename', event.target.value)}
                                    placeholder="original-filename.ext"
                                    disabled={binaryNull}
                                />
                            </label>
                            <div className="flex-row">
                                <input type="file" onChange={handleBinaryFile} disabled={binaryNull} />
                                <button type="button" className="sample-btn" onClick={() => setBinaryNull(true)}>
                                    Send null binary
                                </button>
                                <button type="button" className="sample-btn" onClick={() => setBinaryNull(false)}>
                                    Send binary data
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
    const hasBinaryData = message.binaryData !== null && typeof message.binaryData !== 'undefined' && message.binaryData !== '';
    const downloadName =
        (message as DemoMessage & { binaryDataFilename?: string }).binaryDataFilename ||
        `binary-${message.id}.bin`;
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
                <ValueBadge value={message['display-name']} label="display-name" />
                <ValueBadge value={message['with space']} label="with space" />
            </div>
            {hasBinaryData && (
                <div className="actions" style={{ marginTop: '0.5rem' }}>
                    <button
                        type="button"
                        className="sample-btn"
                        onClick={() => downloadBinaryData(message.binaryData as string, downloadName)}
                    >
                        Download binaryData
                    </button>
                </div>
            )}
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
