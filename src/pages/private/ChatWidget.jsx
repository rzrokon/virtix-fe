import {
  CloseOutlined,
  LoadingOutlined,
  MenuOutlined,
  PlusOutlined,
  CopyOutlined,
  CheckOutlined,
  CodeOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  ColorPicker,
  Divider,
  Input,
  Upload,
  message,
  Select,
  Slider,
  Switch,
  Tabs,
} from 'antd';
import { Paperclip, Send, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getData, postData } from '../../scripts/api-service';
import { useContentApi } from '../../contexts/ContentApiContext';

const { TextArea } = Input;

// ─── Presets ──────────────────────────────────────────────────────────────────
const PRESETS = [
  { label: 'Cosmic',  emoji: '🌌', theme: { themeColor: '#6C47FF', backgroundColor: '#0F0F1A', headerTextColor: '#FFFFFF', botBubbleColor: '#1E1E32', botTextColor: '#E2E2F0', userBubbleColor: '#6C47FF', userTextColor: '#FFFFFF', inputBackground: '#1A1A2E', inputTextColor: '#E2E2F0' } },
  { label: 'Ocean',   emoji: '🌊', theme: { themeColor: '#0EA5E9', backgroundColor: '#0C1A2E', headerTextColor: '#FFFFFF', botBubbleColor: '#112240', botTextColor: '#CBD5E1', userBubbleColor: '#0EA5E9', userTextColor: '#FFFFFF', inputBackground: '#0D1B2A', inputTextColor: '#CBD5E1' } },
  { label: 'Forest',  emoji: '🌿', theme: { themeColor: '#10B981', backgroundColor: '#0A1F1A', headerTextColor: '#FFFFFF', botBubbleColor: '#0D2420', botTextColor: '#A7F3D0', userBubbleColor: '#10B981', userTextColor: '#FFFFFF', inputBackground: '#0B1C18', inputTextColor: '#A7F3D0' } },
  { label: 'Flame',   emoji: '🔥', theme: { themeColor: '#F97316', backgroundColor: '#1A0D08', headerTextColor: '#FFFFFF', botBubbleColor: '#2A1510', botTextColor: '#FED7AA', userBubbleColor: '#F97316', userTextColor: '#FFFFFF', inputBackground: '#1F0E09', inputTextColor: '#FED7AA' } },
  { label: 'Light',   emoji: '☀️', theme: { themeColor: '#6C47FF', backgroundColor: '#FFFFFF', headerTextColor: '#FFFFFF', botBubbleColor: '#F3F4F6', botTextColor: '#1F2937', userBubbleColor: '#6C47FF', userTextColor: '#FFFFFF', inputBackground: '#F9FAFB', inputTextColor: '#1F2937' } },
  { label: 'Rose',    emoji: '🌸', theme: { themeColor: '#EC4899', backgroundColor: '#1A0A14', headerTextColor: '#FFFFFF', botBubbleColor: '#2A1020', botTextColor: '#FBCFE8', userBubbleColor: '#EC4899', userTextColor: '#FFFFFF', inputBackground: '#1F0B18', inputTextColor: '#FBCFE8' } },
];

const FONTS = [
  { value: 'Inter, sans-serif',    label: 'Inter' },
  { value: 'Sora, sans-serif',     label: 'Sora' },
  { value: 'DM Sans, sans-serif',  label: 'DM Sans' },
  { value: 'Nunito, sans-serif',   label: 'Nunito' },
  { value: 'Poppins, sans-serif',  label: 'Poppins' },
];

const DEFAULT_THEME = {
  ...PRESETS[0].theme,
  fontFamily: 'Inter, sans-serif',
  borderRadius: 16,
  bubbleSize: 56,
};

// ─── Snippet builder ──────────────────────────────────────────────────────────
const buildSnippet = ({ agentName, widgetKey, position, theme, content, quickReplies }) => {
  const t = theme;
  const qr = quickReplies.length
    ? `\n    quickReplies: [\n${quickReplies.map(q => `      "${q}"`).join(',\n')},\n    ],`
    : '';

  return `<!--Start of Vertix AI Script-->
<script>
  window.VirtixWidget = {
    baseUrl:   "https://api.virtixai.com",
    agent:     "${agentName || 'your-agent-name'}",
    widgetKey: "${widgetKey || 'your-widget-key'}",
    position:  "${position}", // right|left

    theme: {
      themeColor:      "${t.themeColor}",
      backgroundColor: "${t.backgroundColor}",
      headerTextColor: "${t.headerTextColor}",
      botBubbleColor:  "${t.botBubbleColor}",
      botTextColor:    "${t.botTextColor}",
      userBubbleColor: "${t.userBubbleColor}",
      userTextColor:   "${t.userTextColor}",
      inputBackground: "${t.inputBackground}",
      inputTextColor:  "${t.inputTextColor}",
      fontFamily:      "${t.fontFamily}",
      borderRadius:    ${t.borderRadius},
      bubbleSize:      ${t.bubbleSize},
    },

    content: {
      headerTitle:    "${content.headerTitle}",
      headerSubtitle: "${content.headerSubtitle}",
      welcomeMessage: "${content.welcomeMessage}",
      showBranding:   ${content.showBranding},
    },${qr}
  };
</script>
<script async src="https://virtixai.com/widget/v1/virtix-widget.js"></script>
<!--End of Vertix AI Script-->`;
};

// ─── Small reusable color row ─────────────────────────────────────────────────
const ColorField = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-600">{label}</span>
    <div className="flex items-center gap-2">
      <div className="w-5 h-5 rounded border border-gray-200 shrink-0" style={{ background: value }} />
      <ColorPicker value={value} onChange={c => onChange(c?.toHexString?.() || value)} size="small" />
      <span className="text-xs text-gray-400 font-mono w-16 text-right">{value}</span>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AgentSettings() {
  const { id } = useParams();
  const { currentAgentName } = useContentApi();

  const [widgetKey, setWidgetKey]   = useState('');
  const [imageUrl, setImageUrl]     = useState(undefined);
  const [imgLoading, setImgLoading] = useState(false);
  const [copied, setCopied]         = useState(false);
  const [position, setPosition]     = useState('right');
  const [theme, setTheme]           = useState({ ...DEFAULT_THEME });
  const [content, setContent]       = useState({
    headerTitle: 'Virtix AI',
    headerSubtitle: 'Always here to help',
    welcomeMessage: 'Hi there! 👋 How can I help you today?',
    showBranding: true,
  });
  const [quickReplies, setQuickReplies] = useState([
    { id: 1, text: 'What can you help me with?' },
    { id: 2, text: 'Tell me more about your services' },
  ]);
  const [newReply, setNewReply]   = useState('');
  const [draggedItem, setDraggedItem] = useState(null);
  const [previewMode, setPreviewMode] = useState('widget');
  const codeRef = useRef(null);

  const setThemeKey   = (k, v) => setTheme(p => ({ ...p, [k]: v }));
  const setContentKey = (k, v) => setContent(p => ({ ...p, [k]: v }));

  const applyPreset = (p) => {
    setTheme(prev => ({ ...prev, ...p.theme }));
    message.success(`${p.label} theme applied`);
  };

  // Upload helpers
  const getBase64 = file => new Promise((res, rej) => {
    const r = new FileReader();
    r.onerror = () => rej(new Error('read failed'));
    r.onload  = () => res(String(r.result));
    r.readAsDataURL(file);
  });
  const beforeUpload = async (file) => {
    if (!['image/jpeg', 'image/png'].includes(file.type)) { message.error('JPG/PNG only'); return Upload.LIST_IGNORE; }
    if (file.size / 1024 / 1024 >= 2) { message.error('Max 2 MB'); return Upload.LIST_IGNORE; }
    setImgLoading(true);
    try   { setImageUrl(await getBase64(file)); }
    catch { message.error('Failed to read image'); }
    finally { setImgLoading(false); }
    return Upload.LIST_IGNORE;
  };

  // Drag-reorder quick replies
  const dragStart = (e, i) => { setDraggedItem(i); e.dataTransfer.effectAllowed = 'move'; };
  const dragOver  = (e, i) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === i) return;
    const next = [...quickReplies];
    const [m] = next.splice(draggedItem, 1);
    next.splice(i, 0, m);
    setQuickReplies(next);
    setDraggedItem(i);
  };
  const addReply = () => {
    if (!newReply.trim()) return;
    setQuickReplies([...quickReplies, { id: Date.now(), text: newReply.trim() }]);
    setNewReply('');
  };

  // Copy
  const copySnippet = async () => {
    const text = codeRef.current?.innerText || '';
    try { await navigator.clipboard.writeText(text); }
    catch {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
    }
    setCopied(true);
    message.success('Snippet copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Fetch widget key
  useEffect(() => {
    if (!id) return;
    (async () => {
      try { const d = await getData(`api/agent/agents/${id}/`); setWidgetKey(d?.widget_key || ''); }
      catch { setWidgetKey(''); }
    })();
  }, [id]);

  const snippet = buildSnippet({
    agentName: currentAgentName || 'your-agent-name',
    widgetKey,
    position,
    theme,
    content,
    quickReplies: quickReplies.map(r => r.text),
  });

  const tabItems = [
    {
      key: 'appearance',
      label: 'Appearance',
      children: (
        <div className="space-y-6 pt-2">
          {/* Presets */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Quick Presets</p>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map(p => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p)}
                  className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border border-gray-200 hover:border-gray-400 hover:shadow-sm bg-white transition-all"
                >
                  <span className="text-2xl">{p.emoji}</span>
                  <span className="text-xs font-semibold text-gray-700">{p.label}</span>
                  <div className="flex gap-1 mt-0.5">
                    <div className="w-3 h-3 rounded-full border border-white shadow-sm" style={{ background: p.theme.themeColor }} />
                    <div className="w-3 h-3 rounded-full border border-white shadow-sm" style={{ background: p.theme.botBubbleColor }} />
                    <div className="w-3 h-3 rounded-full border border-white shadow-sm" style={{ background: p.theme.userBubbleColor }} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Divider />

          {/* Colors */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Colors</p>
            <ColorField label="Accent / Button"   value={theme.themeColor}       onChange={v => setThemeKey('themeColor', v)} />
            <ColorField label="Panel Background"  value={theme.backgroundColor}  onChange={v => setThemeKey('backgroundColor', v)} />
            <ColorField label="Header Text"       value={theme.headerTextColor}  onChange={v => setThemeKey('headerTextColor', v)} />
            <ColorField label="Bot Bubble"        value={theme.botBubbleColor}   onChange={v => setThemeKey('botBubbleColor', v)} />
            <ColorField label="Bot Text"          value={theme.botTextColor}     onChange={v => setThemeKey('botTextColor', v)} />
            <ColorField label="User Bubble"       value={theme.userBubbleColor}  onChange={v => setThemeKey('userBubbleColor', v)} />
            <ColorField label="User Text"         value={theme.userTextColor}    onChange={v => setThemeKey('userTextColor', v)} />
            <ColorField label="Input Background"  value={theme.inputBackground}  onChange={v => setThemeKey('inputBackground', v)} />
            <ColorField label="Input Text"        value={theme.inputTextColor}   onChange={v => setThemeKey('inputTextColor', v)} />
          </div>

          <Divider />

          {/* Typography & shape */}
          <div className="space-y-4">
            <p className="text-sm font-semibold text-gray-700">Typography &amp; Shape</p>
            <div>
              <label className="text-sm text-gray-500 block mb-1">Font Family</label>
              <Select value={theme.fontFamily} onChange={v => setThemeKey('fontFamily', v)} options={FONTS} style={{ width: '100%' }} />
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-1">
                Border Radius <span className="text-gray-400 font-normal">— {theme.borderRadius}px</span>
              </label>
              <Slider min={0} max={32} value={theme.borderRadius} onChange={v => setThemeKey('borderRadius', v)} />
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-1">
                Launcher Size <span className="text-gray-400 font-normal">— {theme.bubbleSize}px</span>
              </label>
              <Slider min={40} max={80} value={theme.bubbleSize} onChange={v => setThemeKey('bubbleSize', v)} />
            </div>
          </div>

          <Divider />

          {/* Logo */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Logo / Avatar</p>
            <Upload name="avatar" listType="picture-card" showUploadList={false} action={undefined} beforeUpload={beforeUpload}>
              {imageUrl
                ? <img draggable={false} src={imageUrl} alt="logo" style={{ width: '100%', borderRadius: 8 }} />
                : <div className="text-center text-gray-400">
                    {imgLoading ? <LoadingOutlined /> : <PlusOutlined />}
                    <div className="mt-1 text-xs">Upload</div>
                  </div>
              }
            </Upload>
            {imageUrl && (
              <button onClick={() => setImageUrl(undefined)} className="mt-2 text-xs text-red-400 hover:text-red-500 transition-colors">
                Remove
              </button>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'content',
      label: 'Content',
      children: (
        <div className="space-y-5 pt-2">
          {/* Header */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Header &amp; Messages</p>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500 block mb-1">Title</label>
                <Input value={content.headerTitle} onChange={e => setContentKey('headerTitle', e.target.value)} placeholder="Virtix AI" />
              </div>
              <div>
                <label className="text-sm text-gray-500 block mb-1">Subtitle</label>
                <Input value={content.headerSubtitle} onChange={e => setContentKey('headerSubtitle', e.target.value)} placeholder="Always here to help" />
              </div>
              <div>
                <label className="text-sm text-gray-500 block mb-1">Welcome Message</label>
                <TextArea rows={3} value={content.welcomeMessage} onChange={e => setContentKey('welcomeMessage', e.target.value)} placeholder="Hi there! 👋" />
              </div>
              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="text-sm text-gray-700">Show "Powered by Virtix AI"</p>
                  <p className="text-xs text-gray-400 mt-0.5">Branding badge in widget footer</p>
                </div>
                <Switch checked={content.showBranding} onChange={v => setContentKey('showBranding', v)} />
              </div>
            </div>
          </div>

          <Divider />

          {/* Position */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Widget Position</p>
            <div className="flex gap-2">
              {['right', 'left'].map(p => (
                <button
                  key={p}
                  onClick={() => setPosition(p)}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all capitalize ${
                    position === p
                      ? 'border-[#6200FF] text-[#6200FF] bg-[#6200FF]/5'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {p === 'right' ? '→ Right' : '← Left'}
                </button>
              ))}
            </div>
          </div>

          <Divider />

          {/* Quick replies */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Quick Reply Buttons</p>
            <p className="text-xs text-gray-400 mb-3">Shown as chips when the widget opens. Drag to reorder.</p>
            <div className="space-y-2 mb-3">
              {quickReplies.map((r, i) => (
                <div
                  key={r.id}
                  draggable
                  onDragStart={e => dragStart(e, i)}
                  onDragOver={e => dragOver(e, i)}
                  onDragEnd={() => setDraggedItem(null)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 cursor-move transition-all ${
                    draggedItem === i ? 'opacity-40' : 'hover:bg-gray-100'
                  }`}
                >
                  <MenuOutlined className="text-gray-400 shrink-0" />
                  <span className="flex-1 text-sm text-gray-700">{r.text}</span>
                  <Button
                    type="text"
                    size="small"
                    icon={<CloseOutlined style={{ fontSize: 11 }} />}
                    onClick={() => setQuickReplies(quickReplies.filter(x => x.id !== r.id))}
                    className="text-gray-400 hover:text-red-500"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a quick reply…"
                value={newReply}
                onChange={e => setNewReply(e.target.value)}
                onPressEnter={addReply}
              />
              <Button type="primary" icon={<PlusOutlined />} onClick={addReply}>Add</Button>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">Widget Configuration</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Customize your chat widget, then copy the snippet and paste it into your website.
        </p>
      </div>

      <div className="flex gap-6 flex-col xl:flex-row items-start">

        {/* ── Left: settings tabs ── */}
        <Card className="flex-1 min-w-0">
          <Tabs items={tabItems} />
        </Card>

        {/* ── Right: preview + snippet ── */}
        <div className="flex flex-col gap-6" style={{ width: 360, minWidth: 320 }}>

          {/* Live Preview / Chat toggle */}
          <Card
            title={
              <div className="flex items-center justify-between w-full">
                <span className="text-sm font-semibold text-gray-700">Preview</span>
                <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setPreviewMode('chat')}
                    className={`px-3 py-1 text-xs font-medium transition-colors ${previewMode === 'chat' ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                  >
                    Live Chat
                  </button>
                  <button
                    onClick={() => setPreviewMode('widget')}
                    className={`px-3 py-1 text-xs font-medium transition-colors ${previewMode === 'widget' ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                  >
                    Widget
                  </button>
                </div>
              </div>
            }
            styles={{ body: { padding: 0 } }}
            style={{ overflow: 'hidden' }}
          >
            {previewMode === 'chat' ? (
              <MessageBox
                themeColor={theme.themeColor}
                logoSrc={imageUrl}
                quickActions={quickReplies.map(r => r.text)}
              />
            ) : (
              <WidgetPreview
                theme={theme}
                content={content}
                logoSrc={imageUrl}
                quickReplies={quickReplies.map(r => r.text)}
              />
            )}
          </Card>

          {/* Embed Snippet */}
          <Card
            title={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <CodeOutlined className="text-gray-400" />
                  <span className="text-sm font-semibold text-gray-700">Embed Snippet</span>
                </div>
                <Button
                  size="small"
                  type={copied ? 'default' : 'primary'}
                  icon={copied ? <CheckOutlined /> : <CopyOutlined />}
                  onClick={copySnippet}
                  style={copied ? { background: '#10B981', borderColor: '#10B981', color: '#fff' } : {}}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            }
          >
            <p className="text-xs text-gray-500 mb-3">
              Paste before the{' '}
              <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700 text-xs">&lt;/body&gt;</code>
              {' '}tag on every page of your website.
            </p>

            <div className="rounded-lg overflow-auto border border-gray-200" style={{ maxHeight: 300 }}>
              <pre
                className="p-4 m-0 text-xs leading-relaxed bg-gray-50"
                style={{ fontFamily: 'JetBrains Mono, Fira Code, monospace', color: '#374151' }}
              >
                <code ref={codeRef}>{snippet}</code>
              </pre>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-gray-50 border border-gray-200">
              <p className="text-xs font-semibold text-gray-600 mb-1.5">How to install</p>
              <ol className="text-xs text-gray-500 space-y-1 list-decimal list-inside">
                <li>Click <strong className="text-gray-700">Copy</strong> above</li>
                <li>Open your website's HTML source</li>
                <li>Paste just before <code className="bg-white px-1 rounded border border-gray-200">&lt;/body&gt;</code></li>
                <li>Save and reload — your widget is live!</li>
              </ol>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}


// ─── Widget Preview ───────────────────────────────────────────────────────────
const WidgetPreview = ({ theme, content, logoSrc, quickReplies = [] }) => {
  const r = theme.borderRadius || 16;
  const preview = [
    { id: 1, sender: 'bot',  text: content.welcomeMessage || 'Hi! How can I help?' },
    { id: 2, sender: 'user', text: 'What can you help me with?' },
    { id: 3, sender: 'bot',  text: 'I can answer questions and guide you through our services!' },
  ];

  return (
    <div
      className="flex flex-col"
      style={{
        background: theme.backgroundColor,
        fontFamily: theme.fontFamily || 'Inter, sans-serif',
        height: 440,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ background: theme.themeColor }}>
        <div className="flex items-center gap-2">
          {logoSrc
            ? <img src={logoSrc} className="w-7 h-7 rounded-full object-cover" alt="logo" />
            : <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white">AI</div>
          }
          <div>
            <p className="text-sm font-semibold leading-none" style={{ color: theme.headerTextColor }}>
              {content.headerTitle || 'Virtix AI'}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-300" />
              <p className="text-xs" style={{ color: theme.headerTextColor, opacity: 0.8 }}>
                {content.headerSubtitle || 'Online'}
              </p>
            </div>
          </div>
        </div>
        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
          <X className="w-3 h-3" style={{ color: theme.headerTextColor }} />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {preview.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className="px-3 py-2 text-xs max-w-[80%] leading-relaxed"
              style={{
                background: msg.sender === 'user' ? theme.userBubbleColor : theme.botBubbleColor,
                color: msg.sender === 'user' ? theme.userTextColor : theme.botTextColor,
                borderRadius: msg.sender === 'user'
                  ? `${r}px ${r}px 4px ${r}px`
                  : `${r}px ${r}px ${r}px 4px`,
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {quickReplies.length > 0 && (
          <div className="flex flex-col gap-1 pt-1">
            {quickReplies.slice(0, 2).map((q, i) => (
              <button
                key={i}
                className="text-xs px-3 py-1.5 text-left"
                style={{ border: `1.5px solid ${theme.themeColor}`, color: theme.themeColor, borderRadius: r, background: 'transparent' }}
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div
        className="px-3 py-2 flex items-center gap-2"
        style={{ background: theme.inputBackground, borderTop: '1px solid rgba(0,0,0,0.06)' }}
      >
        <div
          className="flex-1 px-3 py-1.5 text-xs"
          style={{ background: 'rgba(128,128,128,0.1)', borderRadius: r, color: theme.inputTextColor, opacity: 0.6 }}
        >
          Type here &amp; press enter…
        </div>
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
          style={{ background: theme.themeColor }}
        >
          <Send className="w-3 h-3 text-white" />
        </div>
      </div>

      {content.showBranding && (
        <div className="text-center py-1" style={{ background: theme.inputBackground }}>
          <span className="text-xs" style={{ color: theme.inputTextColor, opacity: 0.4 }}>Powered by Virtix AI</span>
        </div>
      )}
    </div>
  );
};


// ─── Legacy live-chat MessageBox (preserved for other use) ────────────────────
export const MessageBox = ({ themeColor = '#6200FF', logoSrc, quickActions = [] }) => {
  const { currentAgentName } = useContentApi();
  const chatContainerRef = useRef(null);
  const sentinelRef      = useRef(null);
  const [inputText, setInputText]   = useState('');
  const [messages, setMessages]     = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingMore, setLoadingMore]       = useState(false);
  const [sending, setSending]   = useState(false);
  const [nextUrl, setNextUrl]   = useState(null);

  const scrollToBottom = () => { const el = chatContainerRef.current; if (el) el.scrollTop = el.scrollHeight; };

  const expandMessages = (item, idx) => {
    const out = [], base = item?.id ?? idx;
    if (item?.user_query || item?.query_audio)     out.push({ id: `${base}-u`, text: item.user_query || '',  audioUrl: item.query_audio    || null, sender: 'user' });
    if (item?.response   || item?.response_audio)  out.push({ id: `${base}-b`, text: item.response   || '',  audioUrl: item.response_audio || null, sender: 'bot'  });
    return out;
  };

  const fetchPage = async (url, prepend = false) => {
    try {
      const rel  = /^https?:\/\//i.test(url) ? (() => { const u = new URL(url); return `${u.pathname}${u.search}`; })() : url;
      const data = await getData(rel);
      // API returns newest-first — reverse so oldest message is at the top
      const normalized = (data?.results ?? []).reverse().flatMap((itm, i) => expandMessages(itm, i));
      setMessages(p => prepend ? [...normalized, ...p] : normalized);
      setNextUrl(data?.next ?? null);
    } catch { message.error('Failed to load messages'); }
  };

  useEffect(() => {
    if (!currentAgentName) return;
    setMessages([]); setLoadingInitial(true);
    (async () => { await fetchPage(`api/widget/agents/${currentAgentName}/me/messages/?page=1&page_size=50`); setLoadingInitial(false); setTimeout(scrollToBottom, 0); })();
  }, [currentAgentName]);

  useEffect(() => {
    const root = chatContainerRef.current, s = sentinelRef.current;
    if (!root || !s) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && nextUrl && !loadingMore) { setLoadingMore(true); (async () => { await fetchPage(nextUrl, true); setLoadingMore(false); })(); }
    }, { root, threshold: 1 });
    obs.observe(s); return () => obs.disconnect();
  }, [nextUrl, loadingMore]);

  const sendMessage = async (text) => {
    if (!currentAgentName) { message.warning('Agent not loaded'); return; }
    setMessages(p => [...p, { id: `${Date.now()}-u`, text, sender: 'user' }]);
    setTimeout(scrollToBottom, 0);
    setSending(true);
    try {
      const res   = await postData('api/widget/agent-chat/', [{ userInput: text, agent: currentAgentName }]);
      const items = Array.isArray(res?.data) ? res.data : (res?.data?.results ?? (res?.data ? [res.data] : []));
      const bots  = items.map((itm, i) => ({ id: `${Date.now()}-${i}-b`, text: itm?.response ?? itm?.text ?? '', audioUrl: itm?.response_audio ?? null, sender: 'bot' }));
      if (bots.length) { setMessages(p => [...p, ...bots]); setTimeout(scrollToBottom, 0); }
    } catch { message.error('Failed to send message'); }
    finally   { setSending(false); }
  };

  const handleSend = () => { const t = inputText.trim(); if (!t) return; setInputText(''); sendMessage(t); };

  return (
    <div className="flex flex-col items-center justify-end bg-gray-100 p-6" style={{ minHeight: 520 }}>
      {/* Widget panel */}
      <div
        className="flex flex-col w-full overflow-hidden"
        style={{
          height: 460,
          borderRadius: 16,
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          background: '#fff',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{ backgroundColor: themeColor }}
        >
          <div className="flex items-center gap-2">
            {logoSrc
              ? <img src={logoSrc} className="w-8 h-8 rounded-full object-cover" alt="logo" />
              : (
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <svg viewBox="0 0 32 32" fill="white" className="w-5 h-5"><path d="M16 4L4 10v6c0 8 5 14 12 18 7-4 12-10 12-18v-6L16 4z" /></svg>
                </div>
              )
            }
            <div>
              <p className="text-sm font-semibold text-white leading-none">Virtix AI</p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-300" />
                <p className="text-xs text-white/80">Online</p>
              </div>
            </div>
          </div>
          <button className="w-7 h-7 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 transition-colors">
            <X className="w-3.5 h-3.5 text-white" />
          </button>
        </div>

        {/* Messages */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 py-3 bg-gray-50 flex flex-col">
          {/* Sentinel at top — triggers loading older messages on scroll up */}
          <div ref={sentinelRef} className="h-1 shrink-0" />
          {loadingMore && <div className="text-center text-xs text-gray-400 mb-2 shrink-0">Loading more…</div>}
          {loadingInitial && (
            <div className="text-center text-sm text-gray-400 mt-4">Loading messages…</div>
          )}
          {/* Spacer pushes messages to the bottom when there are few */}
          <div className="flex-1" />
          {messages.length === 0 && !loadingInitial && (
            <div className="flex justify-start mb-3">
              <div className="px-3 py-2 text-sm bg-white text-gray-700 rounded-2xl rounded-bl-sm shadow-sm max-w-[80%]">
                Hi there! 👋 How can I help you today?
              </div>
            </div>
          )}
          {messages.map(msg => (
            <div key={msg.id} className={`flex mb-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className="px-3 py-2 text-sm max-w-[80%] break-words"
                style={{
                  backgroundColor: msg.sender === 'user' ? themeColor : '#fff',
                  color: msg.sender === 'user' ? '#fff' : '#1f2937',
                  borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  boxShadow: msg.sender === 'bot' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {msg.text && <div>{msg.text}</div>}
                {msg.audioUrl && <audio src={msg.audioUrl} controls className="mt-2 w-full max-w-xs" />}
              </div>
            </div>
          ))}
          {quickActions.length > 0 && messages.length === 0 && !loadingInitial && (
            <div className="flex flex-col gap-2 mt-2">
              {quickActions.map((qa, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(qa.trim())}
                  className="text-sm px-4 py-2 rounded-full bg-white font-medium text-left transition-colors hover:opacity-80"
                  style={{ color: themeColor, border: `1.5px solid ${themeColor}` }}
                >
                  {qa}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-3 py-3 bg-white border-t border-gray-100 shrink-0">
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ background: '#f3f4f6' }}
          >
            <input
              type="text"
              placeholder="Type a message…"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
            />
            <button
              onClick={handleSend}
              disabled={sending}
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 disabled:opacity-50 transition-colors"
              style={{ backgroundColor: themeColor }}
            >
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Launcher bubble */}
      <div
        className="mt-3 self-end w-14 h-14 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
        style={{ backgroundColor: themeColor }}
      >
        <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
        </svg>
      </div>
    </div>
  );
};
