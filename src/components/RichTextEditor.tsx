import React, { useRef, useCallback } from "react";
import { Bold, Italic, Underline, List, ListOrdered, Type, Palette, AlignLeft, AlignCenter, AlignRight, Link2 } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px"];
const COLORS = ["#000000", "#e63946", "#1d3557", "#2a9d8f", "#e9c46a", "#f4a261", "#264653", "#6b7280", "#ef4444", "#3b82f6", "#22c55e", "#a855f7"];

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder, rows = 6 }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const exec = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    editorRef.current?.focus();
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) exec("createLink", url);
  };

  const ToolBtn = ({ onClick, title, children, active }: { onClick: () => void; title: string; children: React.ReactNode; active?: boolean }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded hover:bg-muted transition-colors ${active ? "bg-muted text-accent" : "text-muted-foreground hover:text-foreground"}`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 flex-wrap px-2 py-1.5 border-b border-border bg-muted/30">
        <ToolBtn onClick={() => exec("bold")} title="Bold"><Bold className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn onClick={() => exec("italic")} title="Italic"><Italic className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn onClick={() => exec("underline")} title="Underline"><Underline className="h-3.5 w-3.5" /></ToolBtn>
        <div className="w-px h-5 bg-border mx-1" />
        <ToolBtn onClick={() => exec("insertUnorderedList")} title="Bullet List"><List className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn onClick={() => exec("insertOrderedList")} title="Numbered List"><ListOrdered className="h-3.5 w-3.5" /></ToolBtn>
        <div className="w-px h-5 bg-border mx-1" />
        <ToolBtn onClick={() => exec("justifyLeft")} title="Align Left"><AlignLeft className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn onClick={() => exec("justifyCenter")} title="Center"><AlignCenter className="h-3.5 w-3.5" /></ToolBtn>
        <ToolBtn onClick={() => exec("justifyRight")} title="Align Right"><AlignRight className="h-3.5 w-3.5" /></ToolBtn>
        <div className="w-px h-5 bg-border mx-1" />
        <ToolBtn onClick={insertLink} title="Insert Link"><Link2 className="h-3.5 w-3.5" /></ToolBtn>
        <div className="w-px h-5 bg-border mx-1" />
        {/* Font Size */}
        <select
          onChange={e => exec("fontSize", "3")}
          className="text-[11px] h-7 px-1 rounded border border-border bg-background text-foreground"
          title="Font Size"
        >
          <option value="">Size</option>
          {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {/* Color picker */}
        <div className="relative group">
          <ToolBtn onClick={() => {}} title="Text Color"><Palette className="h-3.5 w-3.5" /></ToolBtn>
          <div className="absolute top-full left-0 mt-1 p-1.5 bg-card border border-border rounded-lg shadow-lg hidden group-hover:grid grid-cols-6 gap-1 z-10 min-w-[120px]">
            {COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => exec("foreColor", c)}
                className="w-5 h-5 rounded border border-border/50 hover:scale-110 transition-transform"
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
        </div>
        {/* Heading */}
        <select
          onChange={e => { if (e.target.value) exec("formatBlock", e.target.value); }}
          className="text-[11px] h-7 px-1 rounded border border-border bg-background text-foreground"
          title="Heading"
        >
          <option value="">Heading</option>
          <option value="h2">H2</option>
          <option value="h3">H3</option>
          <option value="h4">H4</option>
          <option value="p">Normal</option>
        </select>
      </div>

      {/* Editor area */}
      <div
        ref={editorRef}
        contentEditable
        dir="ltr"
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: value || "" }}
        data-placeholder={placeholder || "Write description..."}
        className="p-3 text-sm min-h-[120px] max-h-[300px] overflow-y-auto focus:outline-none prose prose-sm max-w-none [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-muted-foreground/50"
        style={{ minHeight: `${(rows || 6) * 24}px`, direction: 'ltr', textAlign: 'left', unicodeBidi: 'plaintext' }}
      />
    </div>
  );
};

export default RichTextEditor;
