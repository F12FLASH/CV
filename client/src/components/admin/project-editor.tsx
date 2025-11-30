import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Code,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
} from "lucide-react";
import { useEffect } from "react";

interface ProjectEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ProjectEditor({
  value,
  onChange,
  placeholder = "Describe your project in detail...",
}: ProjectEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { HTMLAttributes: { class: "list-disc list-inside" } },
        orderedList: { HTMLAttributes: { class: "list-decimal list-inside" } },
      }),
      Link.configure({ openOnClick: false }),
      Image,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) return <div>Loading editor...</div>;

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="border-b bg-muted p-2 flex flex-wrap gap-1">
        <Button
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-primary text-primary-foreground" : ""}
          title="Bold (Ctrl+B)"
          data-testid="button-bold"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-primary text-primary-foreground" : ""}
          title="Italic (Ctrl+I)"
          data-testid="button-italic"
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive("strike") ? "bg-primary text-primary-foreground" : ""}
          title="Strikethrough (Ctrl+Shift+X)"
          data-testid="button-strikethrough"
        >
          <Underline className="w-4 h-4" />
        </Button>

        <div className="w-px bg-border" />

        <Button
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive("heading", { level: 1 }) ? "bg-primary text-primary-foreground" : ""}
          title="Heading 1"
          data-testid="button-h1"
        >
          <Heading1 className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive("heading", { level: 2 }) ? "bg-primary text-primary-foreground" : ""}
          title="Heading 2"
          data-testid="button-h2"
        >
          <Heading2 className="w-4 h-4" />
        </Button>

        <div className="w-px bg-border" />

        <Button
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-primary text-primary-foreground" : ""}
          title="Bullet List"
          data-testid="button-bullet-list"
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "bg-primary text-primary-foreground" : ""}
          title="Ordered List"
          data-testid="button-ordered-list"
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive("codeBlock") ? "bg-primary text-primary-foreground" : ""}
          title="Code Block"
          data-testid="button-code-block"
        >
          <Code className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "bg-primary text-primary-foreground" : ""}
          title="Quote"
          data-testid="button-blockquote"
        >
          <Quote className="w-4 h-4" />
        </Button>

        <div className="w-px bg-border" />

        <Button
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={editor.isActive({ textAlign: "left" }) ? "bg-primary text-primary-foreground" : ""}
          title="Align Left"
          data-testid="button-align-left"
        >
          <AlignLeft className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={editor.isActive({ textAlign: "center" }) ? "bg-primary text-primary-foreground" : ""}
          title="Align Center"
          data-testid="button-align-center"
        >
          <AlignCenter className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={editor.isActive({ textAlign: "right" }) ? "bg-primary text-primary-foreground" : ""}
          title="Align Right"
          data-testid="button-align-right"
        >
          <AlignRight className="w-4 h-4" />
        </Button>

        <div className="w-px bg-border" />

        <Button
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
          data-testid="button-undo"
        >
          <Undo className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
          data-testid="button-redo"
        >
          <Redo className="w-4 h-4" />
        </Button>
      </div>

      {/* Editor */}
      <Card className="border-0 rounded-none prose prose-sm dark:prose-invert max-w-none">
        <EditorContent
          editor={editor}
          className="p-4 min-h-80 focus-within:outline-none"
          data-testid="editor-content"
        />
      </Card>

      {/* Character count */}
      <div className="border-t bg-muted px-4 py-2 text-xs text-muted-foreground">
        {editor.storage.characterCount.characters()} characters
      </div>
    </div>
  );
}
