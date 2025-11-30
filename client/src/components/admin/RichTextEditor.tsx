import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { createLowlight } from "lowlight";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import bash from "highlight.js/lib/languages/bash";
import html from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import json from "highlight.js/lib/languages/json";

const lowlight = createLowlight();
lowlight.register("js", javascript);
lowlight.register("ts", typescript);
lowlight.register("py", python);
lowlight.register("bash", bash);
lowlight.register("html", html);
lowlight.register("css", css);
lowlight.register("json", json);

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Code2,
  Image as ImageIcon,
  Music,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Unlink,
  Minus,
  Highlighter,
  Palette,
  Table as TableIcon,
  Plus,
  Trash2,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useCallback, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const COLORS = [
  "#000000", "#374151", "#6B7280", "#9CA3AF",
  "#EF4444", "#F97316", "#F59E0B", "#EAB308",
  "#22C55E", "#10B981", "#14B8A6", "#06B6D4",
  "#3B82F6", "#6366F1", "#8B5CF6", "#A855F7",
  "#EC4899", "#F43F5E", "#FFFFFF", "#F3F4F6",
];

const HIGHLIGHT_COLORS = [
  "#FEF08A", "#FECACA", "#BBF7D0", "#BFDBFE",
  "#DDD6FE", "#FBCFE8", "#FED7AA", "#E5E7EB",
];

export function RichTextEditor({ value, onChange, placeholder = "Write your content..." }: RichTextEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [showAudioDialog, setShowAudioDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkDialog, setShowLinkDialog] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: {
          levels: [1, 2, 3],
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: "javascript",
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Placeholder.configure({
        placeholder,
      }),
      HorizontalRule,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Subscript,
      Superscript,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    setLinkUrl('');
    setShowLinkDialog(false);
  }, [editor, linkUrl]);

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    disabled = false,
    title,
    children 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "h-8 w-8 p-0",
        isActive && "bg-muted text-primary"
      )}
    >
      {children}
    </Button>
  );

  const handleImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      editor.chain().focus().setImage({ src: dataUrl }).run();
      setShowImageDialog(false);
      setImageUrl("");
    };
    reader.readAsDataURL(file);
  };

  const handleAudioFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      editor
        .chain()
        .focus()
        .insertContent(
          `<audio controls style="width: 100%; margin: 10px 0;"><source src="${dataUrl}" type="${file.type}" />Your browser does not support the audio element.</audio>`
        )
        .run();
      setShowAudioDialog(false);
      setAudioUrl("");
    };
    reader.readAsDataURL(file);
  };

  const insertImageFromUrl = () => {
    if (imageUrl.trim()) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setShowImageDialog(false);
      setImageUrl("");
    }
  };

  const insertAudioFromUrl = () => {
    if (audioUrl.trim()) {
      const ext = audioUrl.split(".").pop()?.toLowerCase() || "mp3";
      const mimeTypes: { [key: string]: string } = {
        mp3: "audio/mpeg",
        wav: "audio/wav",
        ogg: "audio/ogg",
        m4a: "audio/mp4",
      };
      const mimeType = mimeTypes[ext] || "audio/mpeg";

      editor
        .chain()
        .focus()
        .insertContent(
          `<audio controls style="width: 100%; margin: 10px 0;"><source src="${audioUrl}" type="${mimeType}" />Your browser does not support the audio element.</audio>`
        )
        .run();
      setShowAudioDialog(false);
      setAudioUrl("");
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      <div className="bg-muted/30 p-2 border-b flex flex-wrap items-center gap-0.5">
        <div className="flex items-center">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
              <Heading1 className="w-4 h-4" />
              <span className="text-xs">Heading</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
              <Heading1 className="w-4 h-4 mr-2" /> Heading 1
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
              <Heading2 className="w-4 h-4 mr-2" /> Heading 2
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
              <Heading3 className="w-4 h-4 mr-2" /> Heading 3
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()}>
              Paragraph
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <div className="flex items-center">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
            title="Underline"
          >
            <UnderlineIcon className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive("strike")}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Text Color">
              <Palette className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="grid grid-cols-5 gap-1">
              {COLORS.map((color) => (
                <button
                  key={color}
                  className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => editor.chain().focus().setColor(color).run()}
                />
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2"
              onClick={() => editor.chain().focus().unsetColor().run()}
            >
              Reset Color
            </Button>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("h-8 w-8 p-0", editor.isActive("highlight") && "bg-muted")}
              title="Highlight"
            >
              <Highlighter className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="grid grid-cols-4 gap-1">
              {HIGHLIGHT_COLORS.map((color) => (
                <button
                  key={color}
                  className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => editor.chain().focus().toggleHighlight({ color }).run()}
                />
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2"
              onClick={() => editor.chain().focus().unsetHighlight().run()}
            >
              Remove Highlight
            </Button>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <div className="flex items-center">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            isActive={editor.isActive({ textAlign: 'justify' })}
            title="Justify"
          >
            <AlignJustify className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <div className="flex items-center">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            title="Ordered List"
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <div className="flex items-center">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive("blockquote")}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive("codeBlock")}
            title="Code Block"
          >
            <Code2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal Line"
          >
            <Minus className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Popover open={showLinkDialog} onOpenChange={setShowLinkDialog}>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("h-8 w-8 p-0", editor.isActive("link") && "bg-muted")}
              title="Insert Link"
            >
              <LinkIcon className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-3">
              <Label>Link URL</Label>
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                onKeyDown={(e) => e.key === 'Enter' && setLink()}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={setLink} className="flex-1">
                  Insert Link
                </Button>
                {editor.isActive("link") && (
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => editor.chain().focus().unsetLink().run()}
                  >
                    <Unlink className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <ToolbarButton
          onClick={() => setShowImageDialog(true)}
          title="Insert Image"
        >
          <ImageIcon className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => setShowAudioDialog(true)}
          title="Insert Audio"
        >
          <Music className="w-4 h-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("h-8 w-8 p-0", editor.isActive("table") && "bg-muted")}
              title="Table"
            >
              <TableIcon className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
              <Plus className="w-4 h-4 mr-2" /> Insert Table
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              disabled={!editor.can().addColumnBefore()}
            >
              Add Column Before
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              disabled={!editor.can().addColumnAfter()}
            >
              Add Column After
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => editor.chain().focus().deleteColumn().run()}
              disabled={!editor.can().deleteColumn()}
            >
              Delete Column
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => editor.chain().focus().addRowBefore().run()}
              disabled={!editor.can().addRowBefore()}
            >
              Add Row Before
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => editor.chain().focus().addRowAfter().run()}
              disabled={!editor.can().addRowAfter()}
            >
              Add Row After
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => editor.chain().focus().deleteRow().run()}
              disabled={!editor.can().deleteRow()}
            >
              Delete Row
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => editor.chain().focus().deleteTable().run()}
              disabled={!editor.can().deleteTable()}
              className="text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete Table
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="More Options">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleSubscript().run()}>
              <SubscriptIcon className="w-4 h-4 mr-2" /> Subscript
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => editor.chain().focus().toggleSuperscript().run()}>
              <SuperscriptIcon className="w-4 h-4 mr-2" /> Superscript
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>
              Clear Formatting
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <EditorContent
        editor={editor}
        className="prose prose-sm dark:prose-invert max-w-none p-4 focus:outline-none min-h-64
          [&_.ProseMirror]:outline-none
          [&_.ProseMirror]:min-h-[200px]
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none
          [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-4
          [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-3
          [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2
          [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-2
          [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-2
          [&_li]:my-1
          [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4
          [&_p]:mb-3 [&_p]:leading-relaxed
          [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono
          [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-4 [&_pre]:border
          [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4
          [&_audio]:w-full [&_audio]:my-4
          [&_hr]:my-6 [&_hr]:border-border
          [&_table]:border-collapse [&_table]:w-full [&_table]:my-4
          [&_th]:border [&_th]:border-border [&_th]:p-2 [&_th]:bg-muted [&_th]:font-semibold
          [&_td]:border [&_td]:border-border [&_td]:p-2
          [&_a]:text-primary [&_a]:underline"
      />

      <input
        type="file"
        ref={imageInputRef}
        accept="image/*"
        onChange={(e) => {
          const file = e.currentTarget.files?.[0];
          if (file) handleImageFile(file);
        }}
        className="hidden"
      />

      <input
        type="file"
        ref={audioInputRef}
        accept="audio/*"
        onChange={(e) => {
          const file = e.currentTarget.files?.[0];
          if (file) handleAudioFile(file);
        }}
        className="hidden"
      />

      {showImageDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold mb-4">Insert Image</h3>
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Image URL</Label>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => imageInputRef.current?.click()}
                  className="flex-1"
                  variant="outline"
                >
                  Upload File
                </Button>
                <Button onClick={insertImageFromUrl} className="flex-1">
                  Insert URL
                </Button>
              </div>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowImageDialog(false);
                  setImageUrl("");
                }}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {showAudioDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold mb-4">Insert Audio</h3>
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Audio URL</Label>
                <Input
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="https://example.com/audio.mp3"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => audioInputRef.current?.click()}
                  className="flex-1"
                  variant="outline"
                >
                  Upload File
                </Button>
                <Button onClick={insertAudioFromUrl} className="flex-1">
                  Insert URL
                </Button>
              </div>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowAudioDialog(false);
                  setAudioUrl("");
                }}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
