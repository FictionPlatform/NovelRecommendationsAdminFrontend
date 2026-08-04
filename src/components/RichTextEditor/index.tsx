import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useEffect } from "react";
import "./index.less";

interface RichTextEditorProps {
	value?: string;
	onChange?: (value: string) => void;
	minHeight?: number;
}

const RichTextEditor = ({ value, onChange, minHeight = 300 }: RichTextEditorProps) => {
	const editor = useEditor({
		extensions: [StarterKit, Underline],
		content: value || "",
		onUpdate: ({ editor }) => {
			onChange?.(editor.getHTML());
		}
	});

	useEffect(() => {
		if (!editor) return;
		const current = editor.getHTML();
		const next = value || "";
		if (current !== next) {
			editor.commands.setContent(next, { emitUpdate: false });
		}
	}, [editor, value]);

	if (!editor) return null;

	const buttons = [
		{ key: "bold", label: "B", title: "加粗", active: editor.isActive("bold"), action: () => editor.chain().focus().toggleBold().run() },
		{ key: "italic", label: "I", title: "斜体", active: editor.isActive("italic"), action: () => editor.chain().focus().toggleItalic().run() },
		{ key: "underline", label: "U", title: "下划线", active: editor.isActive("underline"), action: () => editor.chain().focus().toggleUnderline().run() },
		{ key: "strike", label: "S", title: "删除线", active: editor.isActive("strike"), action: () => editor.chain().focus().toggleStrike().run() },
		{ key: "h1", label: "H1", title: "一级标题", active: editor.isActive("heading", { level: 1 }), action: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
		{ key: "h2", label: "H2", title: "二级标题", active: editor.isActive("heading", { level: 2 }), action: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
		{ key: "h3", label: "H3", title: "三级标题", active: editor.isActive("heading", { level: 3 }), action: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
		{ key: "bulletList", label: "• 列表", title: "无序列表", active: editor.isActive("bulletList"), action: () => editor.chain().focus().toggleBulletList().run() },
		{ key: "orderedList", label: "1. 列表", title: "有序列表", active: editor.isActive("orderedList"), action: () => editor.chain().focus().toggleOrderedList().run() },
		{ key: "blockquote", label: "引用", title: "引用", active: editor.isActive("blockquote"), action: () => editor.chain().focus().toggleBlockquote().run() },
		{ key: "codeBlock", label: "代码", title: "代码块", active: editor.isActive("codeBlock"), action: () => editor.chain().focus().toggleCodeBlock().run() },
		{ key: "hr", label: "分隔线", title: "分隔线", active: false, action: () => editor.chain().focus().setHorizontalRule().run() },
		{ key: "clear", label: "清除格式", title: "清除格式", active: false, action: () => editor.chain().focus().unsetAllMarks().clearNodes().run() },
		{ key: "undo", label: "撤销", title: "撤销", active: false, action: () => editor.chain().focus().undo().run() },
		{ key: "redo", label: "重做", title: "重做", active: false, action: () => editor.chain().focus().redo().run() }
	];

	return (
		<div className="rich-text-editor">
			<div className="rich-text-editor-toolbar">
				{buttons.map(btn => (
					<button
						key={btn.key}
						type="button"
						title={btn.title}
						className={["rich-text-editor-btn", btn.active ? "active" : ""].join(" ")}
						onMouseDown={e => e.preventDefault()}
						onClick={btn.action}
					>
						{btn.label}
					</button>
				))}
			</div>
			<EditorContent editor={editor} className="rich-text-editor-content" style={{ minHeight }} />
		</div>
	);
};

export default RichTextEditor;
