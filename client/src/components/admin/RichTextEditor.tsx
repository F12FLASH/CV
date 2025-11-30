import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
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

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-muted/30 p-2 flex flex-wrap gap-1 border-b">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${buttonClass} ${editor.isActive("bold") ? activeButtonClass : ""}`}
          data-testid="button-editor-bold"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${buttonClass} ${editor.isActive("italic") ? activeButtonClass : ""}`}
          data-testid="button-editor-italic"
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
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`${buttonClass} ${editor.isActive("orderedList") ? activeButtonClass : ""}`}
          data-testid="button-editor-orderedlist"
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
        >
          <Quote className="w-4 h-4" />
        </Button>

        <div className="w-px bg-border"></div>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().undo().run()}
          className={buttonClass}
          data-testid="button-editor-undo"
        >
          <Undo className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().redo().run()}
          className={buttonClass}
          data-testid="button-editor-redo"
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
          [&_code]:bg-muted [&_code]:px-2 [&_code]:py-1 [&_code]:rounded
          [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded [&_pre]:overflow-x-auto"
        data-testid="editor-content"
      />
    </div>
  );
}
