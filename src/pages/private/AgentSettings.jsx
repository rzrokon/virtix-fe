import { CloseOutlined, LoadingOutlined, MenuOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, ColorPicker, Divider, Input, Upload, message } from "antd";
import { Paperclip, Send, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { getData, postData } from '../../scripts/api-service';
import { useContentApi } from '../../contexts/ContentApiContext';
const { TextArea } = Input;



/**
 * AgentSettings - fixed upload to get base64 client-side and avoid auto upload
 */
export default function AgentSettings() {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(undefined);
  const [messages, setMessages] = useState([
    { id: 1, text: 'I have a question' },
    { id: 2, text: 'Tell me more' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);

   const codeRef = useRef(null);
   const [themeColor, setThemeColor] = useState('#1677ff');

   const addMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { id: Date.now(), text: newMessage }]);
      setNewMessage('');
    }
  };

  const removeMessage = (id) => {
    setMessages(messages.filter(msg => msg.id !== id));
  };

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;

    const newMessages = [...messages];
    const draggedMessage = newMessages[draggedItem];
    newMessages.splice(draggedItem, 1);
    newMessages.splice(index, 0, draggedMessage);

    setMessages(newMessages);
    setDraggedItem(index);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };


  // helper that returns a Promise so we can await it
  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.onload = () => resolve(String(reader.result));
      reader.readAsDataURL(file);
    });
  };

  // Validate file and convert to base64, then return false to prevent auto upload.
  const beforeUpload = async (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!');
      return Upload.LIST_IGNORE; // keep file out of list
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must smaller than 2MB!');
      return Upload.LIST_IGNORE;
    }

    // convert to base64 & set state
    try {
      setLoading(true);
      const base64 = await getBase64(file);
      setImageUrl(base64);
    } catch (err) {
      message.error('Failed to read image');
    } finally {
      setLoading(false);
    }

    // Returning false prevents Upload from posting the file to `action`.
    // Upload.LIST_IGNORE prevents the file from being added to fileList (AntD v4+).
    return Upload.LIST_IGNORE;
  };

  // You can still keep handleChange if you want to monitor removals, etc.
  const handleChange = info => {
    // We handle the base64 in beforeUpload, but you can still handle fileList changes here.
    // console.log('upload info', info);
  };

  const uploadButton = (
    <div style={{ border: 0, background: 'none', textAlign: 'center' }}>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  const copyEmbed = async () => {
    try {
      const text = codeRef.current ? codeRef.current.innerText : '';
      if (!text) {
        message.warning('Nothing to copy');
        return;
      }
      await navigator.clipboard.writeText(text);
      message.success('Code copied to clipboard');
    } catch (err) {
      try {
        const text = codeRef.current ? codeRef.current.innerText : '';
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        message.success('Code copied to clipboard');
      } catch (e) {
        message.error('Failed to copy code');
      }
    }
  };

  return (
    <div className="">
      <Card>
        <h1 className="text-2xl font-bold">Your agent is ready</h1>

        <p className="mt-2">
          Copy this code and place it before the <code>&lt;/body&gt;</code> tag on every page of your website
        </p>
        <Divider />

        <div className="relative">
          <Button type="primary" className="absolute right-0" onClick={copyEmbed}>Copy</Button>
          <pre className="bg-gray-100 p-4 rounded text-sm font-mono">
            <code ref={codeRef}>
              {`<!--Start of Vertix AI Script-->
<script type="text/javascript">
var Vertix_API=Vertix AI||{}, Tawk_LoadStart=new Date();
(function(){
var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
s1.async=true;
s1.src='https://embed.Vertix.AI/6899fb7a70cc1a1922c4067a/1j2cnsm9p';
s1.charset='UTF-8';
s1.setAttribute('crossorigin','*');
s0.parentNode.insertBefore(s1,s0);
})();
</script>
<!--End of Vertix AI Script-->`}
            </code>
          </pre>
        </div>
      </Card>

      <div className="flex md:flex-row flex-col mt-6">
        <Card className="flex-1">
          <h1 className="text-2xl font-bold">Customize the widget to suit your brand</h1>
          <p className="mt-2">You can change anytime</p>
          <Divider />

          <div className='space-y-6'>
            <div>
              <h3 className="font-semibold mb-2">Logo</h3>
              <Upload
                name="avatar"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                // Prevent automatic upload to a server:
                action={undefined}
                beforeUpload={beforeUpload}
                onChange={handleChange}
              >
                {imageUrl ? (
                  <img draggable={false} src={imageUrl} alt="avatar" style={{ width: '100%' }} />
                ) : (
                  uploadButton
                )}
              </Upload>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Color</h3>

              <div className='flex gap-4 items-center' >
                {
                  ['#035DFF', '#D42300', '#7866FF', '#05A84E'].map(color => (
                    <Button key={color} style={{ padding: '20px', background: color }} onClick={() => setThemeColor(color)}></Button>
                  ))
                }
                <ColorPicker value={themeColor} showText onChange={(c, hex) => setThemeColor(c?.toHexString ? c.toHexString() : (hex || themeColor))} />
                <span className="ml-2 text-sm text-gray-500">Theme: {themeColor}</span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Color</h3>

              <TextArea rows={4} />
            </div>

            <div >
              <h2 className="font-semibold mb-2">Suggested message</h2>

              <div className="space-y-3 mb-6">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-3 p-4 bg-gray-100 rounded-lg cursor-move transition-all ${draggedItem === index ? 'opacity-50' : 'opacity-100'
                      } hover:bg-gray-200`}
                  >
                    <MenuOutlined className="text-gray-400 cursor-grab active:cursor-grabbing" />
                    <div className="flex-1 text-gray-700">{message.text}</div>
                    <Button
                      type="text"
                      icon={<CloseOutlined />}
                      onClick={() => removeMessage(message.id)}
                      className="text-gray-400 hover:text-red-500"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Input
                  placeholder="Type your message"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onPressEnter={addMessage}
                  className="flex-1"
                  size="large"
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={addMessage}
                  size="large"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Add message
                </Button>
              </div>
            </div>

          </div>
        </Card>

        <div className="flex-1">
          <MessageBox themeColor={themeColor} logoSrc={imageUrl} quickActions={messages.map(m => m.text)} />
        </div>
      </div>
    </div>
  );
}


const MessageBox = ({ themeColor = '#05A84E', logoSrc, quickActions = [] }) => {
  const { currentAgentName } = useContentApi();
  const chatContainerRef = useRef(null);
  const sentinelRef = useRef(null);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sending, setSending] = useState(false);
  const [nextUrl, setNextUrl] = useState(null);

  const scrollToBottom = () => {
    const el = chatContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  };

  const expandMessages = (item, idx) => {
    const userText = item?.user_query ?? '';
    const botText = item?.response ?? '';
    const userAudio = item?.query_audio ?? null;
    const botAudio = item?.response_audio ?? null;
    const baseId = item?.id ?? idx;
    const out = [];
    if (userText || userAudio) {
      out.push({ id: `${baseId}-u`, text: userText || '', audioUrl: userAudio || null, sender: 'user' });
    }
    if (botText || botAudio) {
      out.push({ id: `${baseId}-b`, text: botText || '', audioUrl: botAudio || null, sender: 'bot' });
    }
    return out;
  };

  const fetchPage = async (url) => {
    try {
      const relative = /^https?:\/\//i.test(url) ? (() => { const u = new URL(url); return `${u.pathname}${u.search}`; })() : url;
      const data = await getData(relative);
      const results = data?.results ?? [];
      const normalized = results.flatMap((itm, i) => expandMessages(itm, i));
      setMessages(prev => [...prev, ...normalized]);
      setNextUrl(data?.next ?? null);
    } catch (err) {
      console.error('Failed to load messages', err);
      message.error('Failed to load messages');
    }
  };

  useEffect(() => {
    if (!currentAgentName) return;
    const base = `api/widget/agents/${currentAgentName}/me/messages/`;
    const url = `${base}?page=1&page_size=50`;
    setMessages([]);
    setLoadingInitial(true);
    (async () => {
      await fetchPage(url);
      setLoadingInitial(false);
      setTimeout(scrollToBottom, 0);
    })();
  }, [currentAgentName]);

  useEffect(() => {
    const rootEl = chatContainerRef.current;
    const sentinel = sentinelRef.current;
    if (!rootEl || !sentinel) return;

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && nextUrl && !loadingMore) {
        setLoadingMore(true);
        (async () => {
          await fetchPage(nextUrl);
          setLoadingMore(false);
        })();
      }
    }, { root: rootEl, rootMargin: '0px', threshold: 1 });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [nextUrl, loadingMore]);

  const sendMessage = async (text) => {
    if (!currentAgentName) {
      message.warning('Agent name not loaded yet');
      return;
    }
    const payload = [ { userInput: text, agent: currentAgentName } ];

    // Append user bubble immediately
    setMessages(prev => [...prev, { id: `${Date.now()}-u`, text, sender: 'user' }]);
    setTimeout(scrollToBottom, 0);

    setSending(true);
    try {
      const res = await postData('api/widget/agent-chat/', payload);
      const data = res?.data;
      const items = Array.isArray(data) ? data : (data?.results ?? (data ? [data] : []));
      const botParts = items.map((itm, idx) => {
        const botText = itm?.response ?? itm?.text ?? itm?.message ?? '';
        const botAudio = itm?.response_audio ?? null;
        return { id: `${Date.now()}-${idx}-b`, text: botText, audioUrl: botAudio, sender: 'bot' };
      });
      if (botParts.length) {
        setMessages(prev => [...prev, ...botParts]);
        setTimeout(scrollToBottom, 0);
      }
    } catch (err) {
      console.error('Failed to send message', err);
      message.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText('');
    sendMessage(text);
  };

  const handleQuickAction = (action) => {
    const text = (action || '').trim();
    if (!text) return;
    sendMessage(text);
  };

  return (
    <div className="w-full max-w-md mx-auto h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 flex items-center justify-between" style={{ backgroundColor: themeColor }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {logoSrc ? (
              <img src={logoSrc} className="w-8 h-8 rounded" alt="logo" />
            ) : (
              <svg className="w-8 h-8" viewBox="0 0 32 32" fill="currentColor">
                <path d="M16 4L4 10v6c0 8 5 14 12 18 7-4 12-10 12-18v-6L16 4z" />
              </svg>
            )}
            <span className="text-xl font-bold" style={{ color: '#fff' }}>VIRTIX AI</span>
          </div>
        </div>
        <button className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Chat Area */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 bg-gray-50 relative">
        {loadingInitial && (
          <div className="text-center text-gray-500">Loading messages...</div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-4 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}
          >
            <div
              className={`inline-block px-4 py-2 rounded-lg max-w-[75%] break-words whitespace-pre-wrap ${msg.sender === 'user' ? '' : 'bg-white text-gray-800 shadow-sm'}`}
              style={msg.sender === 'user' ? { backgroundColor: themeColor, color: '#fff' } : {}}
            >
              {msg.text && <div>{msg.text}</div>}
              {msg.audioUrl && (
                <audio src={msg.audioUrl} controls className="mt-2 w-full max-w-xs" />
              )}
            </div>
          </div>
        ))}

        {/* Quick Action Buttons */}
        {quickActions.length > 0 && (
          <div className="mx-4 absolute bottom-4 w-[80%]">
            <div className="flex flex-col gap-2">
              {quickActions.map((qa, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickAction(qa)}
                  className="flex-1 px-4 py-3 bg-white rounded-full transition-colors font-medium"
                  style={{ color: themeColor, border: `2px solid ${themeColor}` }}
                >
                  {qa}
                </button>
              ))}
            </div>
          </div>
        )}

        {loadingMore && (
          <div className="text-center text-gray-400 mt-2">Loading more...</div>
        )}
        <div ref={sentinelRef} className="h-1"></div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-3">
          <input
            type="text"
            placeholder="Type here & press enter"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
          />
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>
          <button
            onClick={handleSend}
            disabled={sending}
            className="text-white p-2 rounded-full transition-colors disabled:opacity-60"
            style={{ backgroundColor: themeColor }}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
