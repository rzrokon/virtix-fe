import { Alert, Button, Collapse, Input, Modal, Progress, Spin, Tag } from 'antd';
import { ArrowRight, CheckCircle2, Circle, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getData, postData } from '../../scripts/api-service';

export default function AgentLaunchGuide({ agentName, agentId, onBuild }) {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState(null);
  const [busy, setBusy] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const requestVersion = useRef(0);
  const activeAgent = useRef(agentName);
  activeAgent.current = agentName;
  const location = useLocation();
  const navigate = useNavigate();
  const endpoint = `api/agent/${agentName}/launch/`;
  const load = useCallback(async () => {
    if (!agentName) return;
    const version = ++requestVersion.current;
    try {
      const data = await getData(`api/agent/${agentName}/launch/`, false, true);
      if (version === requestVersion.current) { setStatus(data); setError(''); }
    } catch {
      if (version === requestVersion.current) setError('Launch progress could not be loaded. Try again.');
    }
  }, [agentName]);

  useEffect(() => {
    setStatus(null); setMessages([]); setConversation(null); setPreviewOpen(false); setPreviewError('');
    load();
    return () => { requestVersion.current += 1; };
  }, [load]);

  useEffect(() => {
    load();
    const refresh = () => load();
    const tick = setInterval(() => { if (!document.hidden) load(); }, 8000);
    for (const event of ['virtix-agent-features-updated', 'virtix-agent-knowledge-changed', 'virtix-agent-setup-updated']) window.addEventListener(event, refresh);
    return () => {
      clearInterval(tick);
      for (const event of ['virtix-agent-features-updated', 'virtix-agent-knowledge-changed', 'virtix-agent-setup-updated']) window.removeEventListener(event, refresh);
    };
  }, [load, location.pathname]);

  const send = async (confirm = false) => {
    if (!confirm && !question.trim()) return;
    const name = agentName;
    const text = question.trim();
    setBusy(true); setPreviewError('');
    try {
      const result = await postData(endpoint, confirm ? { action: 'confirm_test' } : { action: 'preview', message: text, ...(conversation ? { conversation_id: conversation } : {}) }, false, undefined, undefined, true);
      if (activeAgent.current !== name) return;
      if (!result?.status || result.status < 200 || result.status >= 300 || result.error) {
        throw new Error(result?.errors?.detail || 'The test could not complete. Check your knowledge and AI settings.');
      }
      if (confirm) { setStatus(result.data); setPreviewOpen(false); }
      else {
        setMessages((prev) => [...prev, { question: text, answer: result.data.response }]);
        setConversation(result.data.conversation_id); setQuestion('');
      }
      await load();
    } catch (err) {
      if (activeAgent.current === name) setPreviewError(err.message);
    } finally {
      if (activeAgent.current === name) setBusy(false);
    }
  };

  if (!agentName) return null;
  if (!status) return <div className="mb-6 rounded-2xl border border-slate-200 p-5">{error ? <Alert type="warning" message={error} action={<Button onClick={load}>Retry</Button>} /> : <Spin tip="Loading launch progress"><div className="h-12" /></Spin>}</div>;
  const dashboard = location.pathname.replace(/\/$/, '') === `/${agentId}/agent-dashboard`;
  const next = status.steps.find((step) => !step.complete);
  const current = status.steps.find((step) => step.path === location.pathname);
  const continueStep = (step) => {
    if (step.action === 'build') onBuild();
    else if (step.action === 'preview') { setPreviewError(''); setPreviewOpen(true); }
    else navigate(step.path);
  };
  const checklist = (
    <div className="space-y-3">
      {status.steps.map((step, index) => (
        <div key={step.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
          {step.complete ? <CheckCircle2 className="shrink-0 text-green-600" size={22} /> : <Circle className="shrink-0 text-slate-400" size={22} />}
          <div className="flex-1">
            <p className="font-semibold text-slate-900">{index + 1}. {step.title}</p>
            <p className="mt-1 text-sm text-slate-500">{step.description}</p>
          </div>
          <Button disabled={step.blocked} type={!step.complete && next?.id === step.id ? 'primary' : 'default'} onClick={() => continueStep(step)}>
            {step.complete ? 'Review' : step.blocked ? 'Complete earlier steps' : 'Continue'}
          </Button>
        </div>
      ))}
      <div className="flex flex-wrap gap-2 pt-2">
        {status.channels.map((channel) => <Link key={channel.name} to={channel.available ? channel.path : '/active-plan'}><Tag color={channel.connected ? 'green' : 'default'}>{channel.name}: {channel.connected ? 'Connected' : channel.available ? 'Set up' : 'Plan upgrade needed'}</Tag></Link>)}
      </div>
      <p className="text-xs text-slate-500">For the website widget, enable it and add allowed domains in Agent Info, install the code, then send a message from your website to verify it.</p>
    </div>
  );

  return (
    <section className="mb-6 rounded-2xl border border-violet-200 bg-violet-50/40 p-4 sm:p-6" aria-label="Agent launch checklist">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{status.live ? 'Your agent is live' : status.inactive ? 'Your agent is inactive' : 'Launch your agent'}</h2>
          <p className="mt-1 text-sm text-slate-600">{status.live ? 'Manage your channels or review setup below. New knowledge needs a rebuild and another test.' : `${status.completed} of ${status.total} steps complete${next ? ` · Next: ${next.title}` : ''}`}</p>
        </div>
        <Button aria-label="Refresh launch progress" icon={<RefreshCw size={14} />} onClick={load}>Refresh</Button>
      </div>
      {error && <Alert className="mt-3" type="warning" message={error} />}
      {status.inactive && <Alert className="mt-3" type="warning" message="Set the agent status to Active in Agent Info before launching." />}
      <Progress className="mt-3" percent={Math.round(status.completed / status.total * 100)} strokeColor="#6200FF" />
      {!dashboard && next && <div className="mb-3 flex flex-wrap items-center gap-3"><span className="text-sm text-slate-600">{current?.complete ? `${current.title} is saved. Continue your launch setup.` : next.description}</span><Button type="primary" disabled={next.blocked} onClick={() => continueStep(next)}>{next.title}<ArrowRight size={14} /></Button></div>}
      {dashboard && !status.live ? checklist : <Collapse ghost items={[{ key: 'setup', label: status.live ? 'Review setup and channels' : 'View launch checklist', children: checklist }]} />}
      <Modal title="Test your agent" open={previewOpen} onCancel={() => { if (!busy) setPreviewOpen(false); }} footer={<Button type="primary" loading={busy} disabled={!status.has_preview || !status.preview_ready} onClick={() => send(true)}>Answers look good — continue</Button>} width={680}>
        <p className="mb-4 text-sm text-slate-500">Try product questions, business policies, and order-support questions. Preview does not create orders, bookings, or complaints. Test messages use your plan's message allowance.</p>
        <div className="max-h-80 space-y-3 overflow-auto" aria-live="polite">
          {messages.map((item, index) => <div key={index}><p className="rounded-xl bg-violet-50 p-3 text-sm">{item.question}</p><p className="mt-2 whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-sm">{item.answer}</p></div>)}
        </div>
        {!status.preview_ready && <Alert className="mt-3" type="warning" message="Knowledge has changed. Rebuild before testing again." />}
        {previewError && <Alert className="mt-3" type="error" message={previewError} />}
        <form className="mt-4 flex gap-2" onSubmit={(event) => { event.preventDefault(); send(); }}>
          <Input aria-label="Test message" placeholder="Ask a question your customers would ask…" value={question} maxLength={2000} onChange={(event) => setQuestion(event.target.value)} disabled={busy || !status.preview_ready} />
          <Button htmlType="submit" type="primary" loading={busy} disabled={!status.preview_ready || !question.trim()}>Send</Button>
        </form>
      </Modal>
    </section>
  );
}
