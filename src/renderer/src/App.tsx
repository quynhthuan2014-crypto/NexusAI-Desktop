import { useMemo, useRef, useState } from 'react';
import { Bot, Brain, Calculator, ChevronRight, FileText, FolderOpen, Gauge, Image as ImageIcon, Mic, Monitor, Plus, Search, Settings, ShieldCheck, Sparkles, Wrench, X } from 'lucide-react';
import { ChatMessage, mockAssistant } from './agent';

type View = 'assistant' | 'memory' | 'vision' | 'files' | 'tools' | 'settings';
const views: Array<{id: View; label: string; icon: typeof Bot}> = [
  { id: 'assistant', label: 'Assistant', icon: Bot },
  { id: 'memory', label: 'Memory', icon: Brain },
  { id: 'vision', label: 'Vision', icon: ImageIcon },
  { id: 'files', label: 'Files', icon: FolderOpen },
  { id: 'tools', label: 'Tools', icon: Wrench },
  { id: 'settings', label: 'Settings', icon: Settings }
];

export default function App() {
  const [view, setView] = useState<View>('assistant');
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: 'welcome', role: 'assistant', content: 'Xin chào! Mình là NexusAI. Hãy giao cho mình một câu hỏi hoặc một tác vụ. Bạn có thể bắt đầu bằng “tính 12*8”, “mở Tools”, hoặc tải một file văn bản.' }]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [memory, setMemory] = useState<string[]>(['Ưu tiên giao diện tiếng Việt', 'Luôn yêu cầu quyền trước khi chạy tool']);
  const [file, setFile] = useState<{name: string; content: string} | null>(null);
  const [visionImage, setVisionImage] = useState<string | null>(null);
  const visionInput = useRef<HTMLInputElement>(null);

  const title = useMemo(() => views.find(v => v.id === view)?.label ?? 'Assistant', [view]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setBusy(true); setInput('');
    setMessages(m => [...m, { id: crypto.randomUUID(), role: 'user', content: text }]);
    await new Promise(r => setTimeout(r, 250));
    setMessages(m => [...m, mockAssistant(text)]);
    setBusy(false);
  }

  async function openFile() {
    const result = await window.nexus.openTextFile();
    if (result) { setFile({ name: result.name, content: result.content }); setView('files'); }
  }

  async function systemInfo() {
    const info = await window.nexus.systemInfo();
    setMessages(m => [...m, { id: crypto.randomUUID(), role: 'assistant', content: `System Info\nHost: ${info.hostname}\nOS: ${info.platform} ${info.arch}\nCPU: ${info.cpus} cores\nRAM: ${info.memoryGB} GB`, tool: 'system-info' }]);
    setView('assistant');
  }

  function addMemory() {
    const item = window.prompt('Nội dung memory mới:')?.trim();
    if (item) setMemory(m => [...m, item]);
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Sparkles size={17}/></div><div><strong>NexusAI</strong><span>Desktop</span></div></div>
      <button className="new-chat" onClick={() => { setView('assistant'); setMessages([{id: crypto.randomUUID(), role: 'assistant', content:'Phiên mới đã sẵn sàng.'}]); }}><Plus size={18}/> New session</button>
      <nav>{views.map(({id,label,icon:Icon}) => <button key={id} className={view===id?'nav-item active':'nav-item'} onClick={() => setView(id)}><Icon size={18}/><span>{label}</span>{id==='assistant' && <span className="dot"/>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="privacy-card"><ShieldCheck size={17}/><div><b>Protected mode</b><small>Tools require permission</small></div></div><div className="user-row"><div className="avatar">N</div><div><b>Local workspace</b><small>Demo provider</small></div></div></div>
    </aside>

    <main className="main">
      <header className="topbar"><div><span className="eyebrow">WORKSPACE</span><h1>{title}</h1></div><div className="top-actions"><button className="icon-button"><Search size={18}/></button><div className="status"><span className="status-dot"/> Ready</div></div></header>

      {view==='assistant' && <section className="assistant-view">
        <div className="chat-scroll">{messages.map(m => <div key={m.id} className={`message-row ${m.role}`}><div className="message-avatar">{m.role==='assistant'?<Bot size={16}/>: 'U'}</div><div className="bubble"><div className="bubble-label">{m.role==='assistant'?'NexusAI':'You'} {m.tool && <span className="tool-pill">{m.tool}</span>}</div><div className="bubble-text">{m.content}</div></div></div>)}{busy && <div className="typing"><span/><span/><span/> Thinking…</div>}</div>
        <div className="composer-wrap"><div className="composer"><textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();void send();}}} placeholder="Nhắn cho NexusAI…" rows={2}/><div className="composer-actions"><div><button className="small-action" onClick={openFile}><FileText size={16}/><span>Attach</span></button><button className="small-action" onClick={()=>navigator.mediaDevices?.getUserMedia({audio:true}).catch(()=>{})}><Mic size={16}/><span>Voice</span></button></div><button className="send" onClick={()=>void send()}><ChevronRight size={18}/></button></div></div><div className="hint">Enter để gửi · Shift+Enter để xuống dòng · Chế độ Demo không gửi dữ liệu ra ngoài</div></div>
      </section>}

      {view==='memory' && <Panel title="Memory" subtitle="Context bạn chủ động lưu cho workspace"><div className="memory-list">{memory.map((x,i)=><div className="card row-card" key={i}><Brain size={17}/><span>{x}</span><button onClick={()=>setMemory(memory.filter((_,j)=>j!==i))}><X size={15}/></button></div>)}</div><button className="primary" onClick={addMemory}>Add memory</button></Panel>}

      {view==='vision' && <Panel title="Vision" subtitle="Preview ảnh trước khi kết nối model vision"><div className="dropzone" onClick={()=>visionInput.current?.click()}><ImageIcon size={34}/><b>Chọn một ảnh để xem trước</b><span>PNG, JPG, WEBP</span><input ref={visionInput} type="file" accept="image/*" hidden onChange={e=>{const f=e.target.files?.[0]; if(f) setVisionImage(URL.createObjectURL(f));}}/>{visionImage&&<img src={visionImage} alt="Preview"/>}</div><div className="info-note">Bản MVP không tự tải ảnh lên Internet. Ảnh chỉ được preview trong phiên hiện tại.</div></Panel>}

      {view==='files' && <Panel title="Files" subtitle="Đọc file văn bản cục bộ qua hộp thoại hệ thống"><button className="primary" onClick={openFile}><FileText size={17}/> Open text file</button>{file&&<div className="file-preview card"><div className="file-head"><span>{file.name}</span><span>{file.content.length.toLocaleString()} chars</span></div><pre>{file.content.slice(0,12000)}</pre></div>}</Panel>}

      {view==='tools' && <Panel title="Tools" subtitle="Các tool có permission rõ ràng"><div className="tool-grid"><ToolCard icon={<Calculator/>} title="Calculator" text="Tính toán biểu thức an toàn" onClick={()=>{setInput('124*8');setView('assistant');}}/><ToolCard icon={<Monitor/>} title="System Info" text="Đọc thông tin phần cứng cơ bản" onClick={()=>void systemInfo()}/><ToolCard icon={<Gauge/>} title="Agent status" text="Xem trạng thái agent runtime" onClick={()=>setMessages(m=>[...m,{id:crypto.randomUUID(),role:'assistant',content:'Agent runtime: ready. Permission layer: enabled. Provider: Demo.',tool:'agent-status'}])}/></div><div className="permission-banner"><ShieldCheck/><div><b>Permission center</b><span>Không có tool nào được chạy ngầm; mọi tool đều bắt đầu từ thao tác người dùng.</span></div></div></Panel>}

      {view==='settings' && <Panel title="Settings" subtitle="Cấu hình provider và trải nghiệm"><label className="field"><span>AI provider</span><select defaultValue="demo"><option value="demo">Demo / Offline</option><option>OpenAI-compatible API</option><option>Local model</option></select></label><label className="field"><span>Model</span><input defaultValue="demo-assistant"/></label><label className="field"><span>API endpoint</span><input placeholder="https://your-provider.example/v1"/></label><div className="info-note">API key không được nhúng trong source code. Khi tích hợp provider thật, hãy lưu credentials bằng cơ chế bảo mật của hệ điều hành.</div></Panel>}
    </main>
  </div>;
}

function Panel({title,subtitle,children}:{title:string;subtitle:string;children:React.ReactNode}){return <section className="panel"><div className="panel-heading"><div><span className="eyebrow">NEXUSAI MODULE</span><h2>{title}</h2><p>{subtitle}</p></div></div>{children}</section>}
function ToolCard({icon,title,text,onClick}:{icon:React.ReactNode;title:string;text:string;onClick:()=>void}){return <button className="tool-card" onClick={onClick}><div className="tool-icon">{icon}</div><div><b>{title}</b><span>{text}</span></div><ChevronRight/></button>}
