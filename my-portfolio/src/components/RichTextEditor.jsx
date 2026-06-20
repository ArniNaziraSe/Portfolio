import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { useEffect } from "react";
import "./RichTextEditor.css";

function RichTextEditor({ value, onChange, placeholder = "Tulis di sini..." }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // StarterKit udah include: bold, italic, heading, bulletList, orderedList, code, codeBlock
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false, // klik link gak buka langsung di editor (lebih nyaman)
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      // Kalau editor kosong, kirim string kosong bukan "<p></p>"
      const html = editor.isEmpty ? "" : editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: "rt-editor-content",
        "data-placeholder": placeholder,
      },
    },
  });

  // Sync state luar ke editor (misal pas modal dibuka dengan data existing)
  // Bandingin getHTML() dengan value baru biar gak infinite loop
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const incoming = value || "";
    // editor.isEmpty true kalo isinya cuma "<p></p>" — anggep sama dengan ""
    const currentNormalized = editor.isEmpty ? "" : current;
    if (currentNormalized !== incoming) {
      editor.commands.setContent(incoming, false); // false = jangan trigger onUpdate
    }
  }, [value, editor]);

  if (!editor) return null;

  const addLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Masukin URL link:", previousUrl || "https://");
    if (url === null) return; // cancel
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="rt-editor">
      {/* Toolbar */}
      <div className="rt-toolbar">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "active" : ""}
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "active" : ""}
          title="Italic (Ctrl+I)"
        >
          <em>I</em>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? "active" : ""}
          title="Underline (Ctrl+U)"
        >
          <u>U</u>
        </button>

        <span className="rt-divider"></span>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive("heading", { level: 2 }) ? "active" : ""}
          title="Heading 2"
        >
          H2
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive("heading", { level: 3 }) ? "active" : ""}
          title="Heading 3"
        >
          H3
        </button>

        <span className="rt-divider"></span>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "active" : ""}
          title="Bullet list"
        >
          • List
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "active" : ""}
          title="Numbered list"
        >
          1. List
        </button>

        <span className="rt-divider"></span>

        <button
          type="button"
          onClick={addLink}
          className={editor.isActive("link") ? "active" : ""}
          title="Add link"
        >
          🔗
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={editor.isActive("code") ? "active" : ""}
          title="Inline code"
        >
          {"<>"}
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive("codeBlock") ? "active" : ""}
          title="Code block"
        >
          {"{ }"}
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}

export default RichTextEditor;