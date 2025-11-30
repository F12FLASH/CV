import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Link from "@tiptap/extension-link";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [showAudioDialog, setShowAudioDialog] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: "javascript",
      }),
      Image.configure({
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const buttonClass =
    "px-2 py-1 text-sm hover:bg-muted rounded transition-colors";
  const activeButtonClass = "bg-muted";

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
        .insertContent({
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "🎵 Audio: ",
            },
            {
              type: "hardBreak",
            },
          ],
        })
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
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-muted/30 p-2 flex flex-wrap gap-1 border-b">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${buttonClass} ${editor.isActive("bold") ? activeButtonClass : ""}`}
          data-testid="button-editor-bold"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${buttonClass} ${editor.isActive("italic") ? activeButtonClass : ""}`}
          data-testid="button-editor-italic"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </Button>

        <div className="w-px bg-border"></div>

        <Button
          size="sm"
          variant="ghost"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`${buttonClass} ${editor.isActive("heading", { level: 2 }) ? activeButtonClass : ""}`}
          data-testid="button-editor-h2"
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={`${buttonClass} ${editor.isActive("heading", { level: 3 }) ? activeButtonClass : ""}`}
          data-testid="button-editor-h3"
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </Button>

        <div className="w-px bg-border"></div>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${buttonClass} ${editor.isActive("bulletList") ? activeButtonClass : ""}`}
          data-testid="button-editor-list"
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`${buttonClass} ${editor.isActive("orderedList") ? activeButtonClass : ""}`}
          data-testid="button-editor-orderedlist"
          title="Ordered List"
        >
          <ListOrdered className="w-4 h-4" />
        </Button>

        <div className="w-px bg-border"></div>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`${buttonClass} ${editor.isActive("blockquote") ? activeButtonClass : ""}`}
          data-testid="button-editor-quote"
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`${buttonClass} ${editor.isActive("codeBlock") ? activeButtonClass : ""}`}
          data-testid="button-editor-code"
          title="Code Block"
        >
          <Code2 className="w-4 h-4" />
        </Button>

        <div className="w-px bg-border"></div>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowImageDialog(true)}
          className={buttonClass}
          data-testid="button-editor-image"
          title="Insert Image"
        >
          <ImageIcon className="w-4 h-4" />
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowAudioDialog(true)}
          className={buttonClass}
          data-testid="button-editor-audio"
          title="Insert Audio"
        >
          <Music className="w-4 h-4" />
        </Button>

        <div className="w-px bg-border"></div>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().undo().run()}
          className={buttonClass}
          data-testid="button-editor-undo"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().redo().run()}
          className={buttonClass}
          data-testid="button-editor-redo"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </Button>
      </div>

      <EditorContent
        editor={editor}
        className="prose prose-invert max-w-none p-4 focus:outline-none min-h-64
          [&_.ProseMirror]:outline-none
          [&_.ProseMirror]:focus:outline-none
          [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3
          [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2
          [&_ul]:list-disc [&_ul]:ml-6
          [&_ol]:list-decimal [&_ol]:ml-6
          [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic
          [&_p]:mb-3 [&_p]:leading-relaxed
          [&_code]:bg-muted [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_code]:text-sm
          [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded [&_pre]:overflow-x-auto [&_pre]:my-4 [&_pre]:border [&_pre]:border-muted-foreground/20
          [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded [&_img]:my-4
          [&_audio]:w-full [&_audio]:my-4"
        data-testid="editor-content"
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
        data-testid="input-image-upload"
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
        data-testid="input-audio-upload"
      />

      {showImageDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Insert Image</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Image URL
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border rounded bg-muted/50 text-sm"
                  data-testid="input-image-url"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 text-sm"
                  data-testid="button-upload-image"
                >
                  Upload File
                </button>
                <button
                  onClick={insertImageFromUrl}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 text-sm"
                  data-testid="button-insert-image-url"
                >
                  Insert URL
                </button>
              </div>
              <button
                onClick={() => {
                  setShowImageDialog(false);
                  setImageUrl("");
                }}
                className="w-full px-4 py-2 border rounded hover:bg-muted text-sm"
                data-testid="button-cancel-image"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showAudioDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Insert Audio</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Audio URL
                </label>
                <input
                  type="text"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="https://example.com/audio.mp3"
                  className="w-full px-3 py-2 border rounded bg-muted/50 text-sm"
                  data-testid="input-audio-url"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => audioInputRef.current?.click()}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 text-sm"
                  data-testid="button-upload-audio"
                >
                  Upload File
                </button>
                <button
                  onClick={insertAudioFromUrl}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 text-sm"
                  data-testid="button-insert-audio-url"
                >
                  Insert URL
                </button>
              </div>
              <button
                onClick={() => {
                  setShowAudioDialog(false);
                  setAudioUrl("");
                }}
                className="w-full px-4 py-2 border rounded hover:bg-muted text-sm"
                data-testid="button-cancel-audio"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
